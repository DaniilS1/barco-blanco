import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { resolveMx } from "dns/promises";
import { headers } from "next/headers";

const GMAIL_USERNAME = process.env.GMAIL_USERNAME ?? "";
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD ?? "";
const MANAGER_EMAIL = process.env.GMAIL_USERNAME ?? "";
const ORDER_API_TOKEN = process.env.ORDER_API_TOKEN ?? "";

// Allowed delivery methods — no arbitrary strings
const ALLOWED_DELIVERY_METHODS = new Set(["nova-poshta", "ukrposhta", "pickup"]);
// Allowed payment methods
const ALLOWED_PAYMENT_METHODS = new Set(["По домовленості", "Онлайн оплата", "Накладений платіж"]);
// Allowed delivery sub-types
const ALLOWED_TOGGLES = new Set(["Відділення", "Поштомат", "courier", ""]);

const HTML_ESCAPE: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
};

function esc(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value).replace(/[&<>"']/g, (c) => HTML_ESCAPE[c] ?? c);
}

function stripHtml(value: string): string {
    return value.replace(/<[^>]*>/g, "");
}

function isPlainString(value: unknown, maxLen: number): value is string {
    return typeof value === "string" && value.length <= maxLen;
}

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface OrderData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    addressCourier?: string;
    additionalInfo?: string;
    selectedToggle?: string;
    cart: OrderItem[];
    warehouse?: string;
    paymentMethods: string;
    deliveryMethod: string;
    pickup?: string;
    pickupDeatails?: string;
    honeypot?: string;
    pageLoadTimeMs?: number;
}

function validateAndSanitize(raw: unknown): { ok: true; data: OrderData } | { ok: false; error: string } {
    if (!raw || typeof raw !== "object") return { ok: false, error: "Invalid request body" };
    const d = raw as Record<string, unknown>;

    // firstName / lastName
    if (!isPlainString(d.firstName, 100)) return { ok: false, error: "Invalid firstName" };
    if (!isPlainString(d.lastName, 100)) return { ok: false, error: "Invalid lastName" };
    const firstName = stripHtml(d.firstName);
    const lastName = stripHtml(d.lastName);
    if (firstName !== d.firstName || lastName !== d.lastName) return { ok: false, error: "HTML not allowed in name" };

    // email
    if (typeof d.email !== "string" || d.email.length > 254) return { ok: false, error: "Invalid email" };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return { ok: false, error: "Invalid email format" };

    // phone: only digits, spaces, +, -, (, )
    if (typeof d.phone !== "string" || d.phone.length > 20) return { ok: false, error: "Invalid phone" };
    if (!/^[\d\s\+\-\(\)]+$/.test(d.phone)) return { ok: false, error: "Phone must contain only digits and + - ( ) characters" };

    // deliveryMethod
    if (!ALLOWED_DELIVERY_METHODS.has(String(d.deliveryMethod))) return { ok: false, error: "Invalid deliveryMethod" };

    // paymentMethods
    if (!ALLOWED_PAYMENT_METHODS.has(String(d.paymentMethods))) return { ok: false, error: "Invalid paymentMethods" };

    // optional string fields with length + no-HTML check
    const optStrFields: Array<[string, number]> = [
        ["city", 100],
        ["warehouse", 200],
        ["addressCourier", 300],
        ["additionalInfo", 500],
        ["pickup", 200],
        ["pickupDeatails", 300],
    ];
    const cleaned: Record<string, string | undefined> = {};
    for (const [field, max] of optStrFields) {
        if (d[field] !== undefined && d[field] !== null && d[field] !== "") {
            if (!isPlainString(d[field], max)) return { ok: false, error: `Invalid ${field}` };
            const stripped = stripHtml(d[field] as string);
            if (stripped !== d[field]) return { ok: false, error: `HTML not allowed in ${field}` };
            cleaned[field] = stripped;
        }
    }

    // selectedToggle
    if (d.selectedToggle !== undefined && !ALLOWED_TOGGLES.has(String(d.selectedToggle))) {
        return { ok: false, error: "Invalid selectedToggle" };
    }

    // cart
    if (!Array.isArray(d.cart) || d.cart.length === 0) return { ok: false, error: "Cart is empty" };
    if (d.cart.length > 50) return { ok: false, error: "Cart too large" };
    const cart: OrderItem[] = [];
    for (const item of d.cart) {
        if (!item || typeof item !== "object") return { ok: false, error: "Invalid cart item" };
        const it = item as Record<string, unknown>;
        if (!isPlainString(it.id, 200)) return { ok: false, error: "Invalid cart item id" };
        if (!isPlainString(it.name, 300)) return { ok: false, error: "Invalid cart item name" };
        if (typeof it.price !== "number" || it.price < 0 || it.price > 1_000_000) return { ok: false, error: "Invalid cart item price" };
        if (typeof it.quantity !== "number" || it.quantity < 1 || it.quantity > 999 || !Number.isInteger(it.quantity)) return { ok: false, error: "Invalid cart item quantity" };
        const imageStr = isPlainString(it.image, 2000) ? it.image : undefined;
        // Only allow image URLs from known trusted hosts
        const trustedImageHosts = ["barco-blanco.ua", "cdn.sanity.io", "images.unsplash.com"];
        let safeImage: string | undefined;
        if (imageStr) {
            try {
                const url = new URL(imageStr);
                if (trustedImageHosts.some(h => url.hostname === h || url.hostname.endsWith("." + h))) {
                    safeImage = imageStr;
                }
            } catch {
                safeImage = undefined;
            }
        }
        cart.push({ id: it.id as string, name: it.name as string, price: it.price as number, quantity: it.quantity as number, image: safeImage });
    }

    // honeypot / pageLoadTimeMs passthrough (validation happens in handler)
    const honeypot = isPlainString(d.honeypot, 200) ? d.honeypot : undefined;
    const pageLoadTimeMs = typeof d.pageLoadTimeMs === "number" ? d.pageLoadTimeMs : undefined;

    return {
        ok: true,
        data: {
            firstName,
            lastName,
            email: d.email as string,
            phone: d.phone as string,
            city: cleaned.city,
            warehouse: cleaned.warehouse,
            addressCourier: cleaned.addressCourier,
            additionalInfo: cleaned.additionalInfo,
            pickup: cleaned.pickup,
            pickupDeatails: cleaned.pickupDeatails,
            selectedToggle: d.selectedToggle !== undefined ? String(d.selectedToggle) : undefined,
            paymentMethods: d.paymentMethods as string,
            deliveryMethod: d.deliveryMethod as string,
            cart,
            honeypot,
            pageLoadTimeMs,
        },
    };
}

async function sendEmail(toEmail: string, subject: string, htmlBody: string): Promise<void> {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: GMAIL_USERNAME,
            pass: GMAIL_APP_PASSWORD,
        },
    });
    await transporter.sendMail({
        from: GMAIL_USERNAME,
        to: toEmail,
        subject,
        html: htmlBody,
    });
}

function buildCustomerHtml(data: OrderData, totalAmount: number, variant: "normal" | "agreement"): string {
    const deliveryLabel =
        data.deliveryMethod === "pickup" ? "Самовивіз"
        : data.deliveryMethod === "ukr-poshta" ? "Укр Пошта"
        : data.deliveryMethod === "nova-poshta" ? "Нова Пошта"
        : "Не вказано";

    const metaRows = [
        data.city ? `<tr><td style="padding:8px 0;"><strong>Місто:</strong> ${esc(data.city)}</td><td></td></tr>` : "",
        data.selectedToggle ? `<tr><td style="padding:8px 0;"><strong>Вид доставки:</strong> ${data.selectedToggle === "courier" ? "Кур'єром" : esc(data.selectedToggle)}</td><td></td></tr>` : "",
        data.warehouse ? `<tr><td style="padding:8px 0;"><strong>Відділення:</strong> ${esc(data.warehouse)}</td><td></td></tr>` : "",
        data.addressCourier ? `<tr><td style="padding:8px 0;"><strong>Адреса кур'єра:</strong> ${esc(data.addressCourier)}</td><td></td></tr>` : "",
        data.pickup ? `<tr><td style="padding:8px 0;"><strong>Самовивіз:</strong> ${esc(data.pickup)}</td><td></td></tr>` : "",
        data.additionalInfo ? `<tr><td style="padding:8px 0;" colspan="2"><strong>Додаткова інформація:</strong> ${esc(data.additionalInfo)}</td></tr>` : "",
    ].join("");

    const itemRows = data.cart.map((item) => `
        <tr>
          <td style="padding:12px 0; border-top:1px solid #f1f1f1;">
            <table cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td style="vertical-align:top; padding-right:12px;">
                ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" width="64" style="width:64px;height:auto;display:block;">` : ""}
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-family:Arial,sans-serif;color:#222;">${esc(item.name)}</div>
                <div style="font-size:12px;color:#6b7280;">Кількість: ${esc(item.quantity)}</div>
              </td>
            </tr></table>
          </td>
          <td style="padding:12px 0;border-top:1px solid #f1f1f1;text-align:right;vertical-align:middle;">${(item.price * item.quantity).toFixed(2)} грн.</td>
        </tr>`).join("");

    const contactBlock = variant === "agreement"
        ? `<p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:14px;color:#444;line-height:1.6;"><strong>Наш менеджер зв'яжеться з вами якнайшвидше</strong> для підтвердження та обробки замовлення.</p>
           <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#444;line-height:1.6;">Якщо питання термінове — зателефонуйте нам: <a href="tel:+380504730644" style="color:#1996A3;text-decoration:none;font-weight:600;">+38 (050) 47-30-644</a></p>`
        : `<p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#444;line-height:1.6;"><strong>Ми починаємо обробку вашого замовлення</strong> і скоро зв'яжемося з вами для підтвердження.</p>`;

    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>body{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block}</style></head>
<body style="margin:0;padding:0;background:#f5f7fa;">
<center style="width:100%;background:#f5f7fa;padding:20px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;">
  <tr><td style="padding:20px;border-bottom:1px solid #e9ecef;">
    <img src="https://barco-blanco.ua/icons/logo.png" alt="BarcoBlanco" width="140">
  </td></tr>
  <tr><td style="padding:24px;">
    <h1 style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;color:#222;">Привіт ${esc(data.firstName)}!</h1>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#6b7280;">Дякуємо за ваше замовлення! Нижче ви знайдете всі деталі.</p>
  </td></tr>
  <tr><td style="padding:0 24px 18px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#444;">
      <tr>
        <td style="padding:8px 0;"><strong>Клієнт:</strong> ${esc(data.lastName)} ${esc(data.firstName)}</td>
        <td style="padding:8px 0;text-align:right;"><strong>Оплата:</strong> ${esc(data.paymentMethods)}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;"><strong>Доставка:</strong> ${esc(deliveryLabel)}</td>
        <td style="padding:8px 0;text-align:right;"><strong>Сума:</strong> ${totalAmount.toFixed(2)} грн.</td>
      </tr>
      ${metaRows}
    </table>
  </td></tr>
  <tr><td style="padding:0 24px 8px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;font-family:Arial,sans-serif;">
      <tr>
        <td style="padding:12px 0;font-weight:bold;">Товар</td>
        <td style="padding:12px 0;text-align:right;font-weight:bold;">Ціна</td>
      </tr>
      ${itemRows}
      <tr>
        <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:bold;border-top:1px solid #ddd;">Загальна сума</td>
        <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:bold;border-top:1px solid #ddd;">${totalAmount.toFixed(2)} грн.</td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:18px 24px;">
    <div style="background:#f8f9fa;border-left:4px solid #1996A3;padding:20px;border-radius:0 8px 8px 0;">
      ${contactBlock}
    </div>
  </td></tr>
  <tr><td style="padding:18px 24px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:12px;color:#777;">
    <p style="margin:0;">© 2024 BarcoBlanco — Всі права захищені.</p>
  </td></tr>
</table>
</center>
</body></html>`;
}

function buildManagerHtml(data: OrderData, totalAmount: number): string {
    const deliveryLabel =
        data.deliveryMethod === "pickup" ? "Самовивіз"
        : data.deliveryMethod === "ukr-poshta" ? "Укр Пошта"
        : data.deliveryMethod === "nova-poshta" ? "Нова Пошта"
        : "Не вказано";

    const metaRows = [
        data.city ? `<tr><td style="padding:8px 0;"><strong>Місто:</strong> ${esc(data.city)}</td><td></td></tr>` : "",
        data.selectedToggle ? `<tr><td style="padding:8px 0;"><strong>Вид доставки:</strong> ${data.selectedToggle === "courier" ? "Кур'єром" : esc(data.selectedToggle)}</td><td></td></tr>` : "",
        data.warehouse ? `<tr><td style="padding:8px 0;"><strong>Відділення:</strong> ${esc(data.warehouse)}</td><td></td></tr>` : "",
        data.addressCourier ? `<tr><td style="padding:8px 0;"><strong>Адреса кур'єра:</strong> ${esc(data.addressCourier)}</td><td></td></tr>` : "",
        data.pickup ? `<tr><td style="padding:8px 0;"><strong>Самовивіз:</strong> ${esc(data.pickup)}</td><td></td></tr>` : "",
        data.additionalInfo ? `<tr><td style="padding:8px 0;" colspan="2"><strong>Додаткова інформація:</strong> ${esc(data.additionalInfo)}</td></tr>` : "",
    ].join("");

    const itemRows = data.cart.map((item) => `
        <tr>
          <td style="padding:12px 0;border-top:1px solid #f1f1f1;">
            <table cellpadding="0" cellspacing="0" role="presentation"><tr>
              <td style="vertical-align:top;padding-right:12px;">
                ${item.image ? `<img src="${esc(item.image)}" alt="${esc(item.name)}" width="64" style="width:64px;height:auto;display:block;">` : ""}
              </td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-family:Arial,sans-serif;color:#222;">${esc(item.name)}</div>
                <div style="font-size:12px;color:#6b7280;">Кількість: ${esc(item.quantity)}</div>
              </td>
            </tr></table>
          </td>
          <td style="padding:12px 0;border-top:1px solid #f1f1f1;text-align:right;vertical-align:middle;">${(item.price * item.quantity).toFixed(2)} грн.</td>
        </tr>`).join("");

    return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<style>body{margin:0;padding:0}table{border-collapse:collapse}img{border:0;display:block}</style></head>
<body style="margin:0;padding:0;background:#f5f7fa;">
<center style="width:100%;background:#f5f7fa;padding:20px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;margin:0 auto;background:#ffffff;">
  <tr><td style="padding:20px;border-bottom:1px solid #e9ecef;position:relative;">
    <img src="https://barco-blanco.ua/icons/logo.png" alt="BarcoBlanco" width="140">
    <div style="position:absolute;top:20px;right:20px;background:#ff4757;color:#fff;padding:6px 12px;border-radius:4px;font-weight:700;font-size:12px;text-transform:uppercase;">НОВЕ ЗАМОВЛЕННЯ</div>
  </td></tr>
  <tr><td style="padding:24px;">
    <h1 style="margin:0 0 8px 0;font-size:20px;font-family:Arial,sans-serif;color:#222;">Нове замовлення отримано</h1>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#6b7280;">Деталі замовлення та контактна інформація клієнта.</p>
  </td></tr>
  <tr><td style="padding:0 24px 18px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;font-size:14px;color:#444;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:20px;">
      <tr>
        <td style="padding:8px 0;"><strong>Клієнт:</strong> ${esc(data.lastName)} ${esc(data.firstName)}</td>
        <td style="padding:8px 0;text-align:right;"><strong>Сума:</strong> ${totalAmount.toFixed(2)} грн.</td>
      </tr>
      <tr>
        <td style="padding:8px 0;"><strong>Email:</strong> <a href="mailto:${esc(data.email)}" style="color:#1996A3;text-decoration:none;">${esc(data.email)}</a></td>
        <td style="padding:8px 0;text-align:right;"><strong>Телефон:</strong> <a href="tel:${esc(data.phone)}" style="color:#1996A3;text-decoration:none;">${esc(data.phone)}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 0;"><strong>Доставка:</strong> ${esc(deliveryLabel)}</td>
        <td style="padding:8px 0;text-align:right;"><strong>Оплата:</strong> ${esc(data.paymentMethods)}</td>
      </tr>
      ${metaRows}
    </table>
  </td></tr>
  <tr><td style="padding:0 24px 8px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eee;font-family:Arial,sans-serif;">
      <tr>
        <td style="padding:12px 0;font-weight:bold;">Товар</td>
        <td style="padding:12px 0;text-align:right;font-weight:bold;">Ціна</td>
      </tr>
      ${itemRows}
      <tr>
        <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:bold;border-top:1px solid #ddd;">Загальна сума</td>
        <td style="padding:12px 0;text-align:right;font-size:16px;font-weight:bold;border-top:1px solid #ddd;">${totalAmount.toFixed(2)} грн.</td>
      </tr>
    </table>
  </td></tr>
  <tr><td style="padding:18px 24px;">
    <div style="background:#fff3cd;border:1px solid #ffeaa7;border-left:4px solid #f39c12;padding:20px;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#856404;line-height:1.6;">
        <strong>Потрібна дія:</strong> Зв'яжіться з клієнтом для підтвердження замовлення та уточнення деталей доставки.
      </p>
    </div>
  </td></tr>
  <tr><td style="padding:18px 24px;border-top:1px solid #eee;font-family:Arial,sans-serif;font-size:12px;color:#777;">
    <p style="margin:0;">© 2024 BarcoBlanco — Система управління замовленнями</p>
  </td></tr>
</table>
</center>
</body></html>`;
}

export async function POST(request: Request) {
    const requestHeaders = await headers();
    const ip = requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "unknown";
    const timestamp = new Date().toISOString();

    // 1. Token authentication
    const token = request.headers.get("X-Order-Token");
    if (!ORDER_API_TOKEN || token !== ORDER_API_TOKEN) {
        console.warn(`[${timestamp}] BLOCKED: missing/invalid X-Order-Token from IP ${ip}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[${timestamp}] POST /api/send_email from IP ${ip}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
        if (!GMAIL_USERNAME || !GMAIL_APP_PASSWORD) {
            console.error(`[${timestamp}] Gmail credentials not configured`);
            return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
        }

        let rawBody: unknown;
        try {
            rawBody = await request.json();
        } catch {
            console.warn(`[${timestamp}] Invalid JSON body from IP ${ip}`);
            return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
        }

        const validation = validateAndSanitize(rawBody);
        if (!validation.ok) {
            console.warn(`[${timestamp}] Validation failed from IP ${ip}: ${validation.error}`);
            return NextResponse.json({ error: validation.error }, { status: 400 });
        }
        const data = validation.data;

        // Honeypot: silent accept for bots
        if (data.honeypot) {
            console.warn(`[${timestamp}] Honeypot triggered from IP ${ip}`);
            return NextResponse.json({ message: "Замовлення оброблено, електронні листи надіслано" }, { status: 200 });
        }

        // Submission too fast (scripted bots)
        if (typeof data.pageLoadTimeMs === "number" && data.pageLoadTimeMs < 3000) {
            console.warn(`[${timestamp}] Page load too fast (${data.pageLoadTimeMs}ms) from IP ${ip}`);
            return NextResponse.json({ error: "Будь ласка, перевірте дані та спробуйте ще раз." }, { status: 400 });
        }

        // MX validation
        const emailDomain = data.email.split("@")[1];
        try {
            const mxRecords = await resolveMx(emailDomain);
            if (!mxRecords || mxRecords.length === 0) {
                return NextResponse.json({ error: "Введена електронна адреса недійсна." }, { status: 400 });
            }
        } catch {
            return NextResponse.json({ error: "Введена електронна адреса недійсна." }, { status: 400 });
        }

        const totalAmount = data.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const customerHtml = buildCustomerHtml(data, totalAmount, data.paymentMethods === "По домовленості" ? "agreement" : "normal");
        await sendEmail(data.email, "Підтвердження замовлення", customerHtml);

        const managerHtml = buildManagerHtml(data, totalAmount);
        await sendEmail(MANAGER_EMAIL, "Нове замовлення отримано", managerHtml);

        console.log(`[${timestamp}] Order emails sent successfully for ${data.email} from IP ${ip}`);
        clearTimeout(timeoutId);
        return NextResponse.json({ message: "Замовлення оброблено, електронні листи надіслано" }, { status: 200 });
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === "AbortError") {
            console.error(`[${timestamp}] Request timeout from IP ${ip}`);
            return NextResponse.json({ error: "Request timeout" }, { status: 408 });
        }
        console.error(`[${timestamp}] Email error from IP ${ip}:`, error);
        return NextResponse.json({
            error: "Failed to send email",
            details: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
