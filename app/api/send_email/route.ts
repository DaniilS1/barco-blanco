import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Gmail as primary email service
const GMAIL_USERNAME = "barcoblancoshop@gmail.com";
const GMAIL_APP_PASSWORD = "hiob zzzv eqgy qplm";
const MANAGER_EMAIL = "barcoblancoshop@gmail.com";

interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

type DeliveryMethod = "nova-poshta" | "ukrposhta" | "pickup" | string;

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
    deliveryMethod: DeliveryMethod;
    pickup?: string;
    pickupDeatails?: string;
}

async function sendEmail(toEmail: string, subject: string, htmlBody: string): Promise<void> {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: GMAIL_USERNAME,
                pass: GMAIL_APP_PASSWORD,
            },
        });

        const mailOptions = {
            from: GMAIL_USERNAME,
            to: toEmail,
            subject: subject,
            html: htmlBody,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully via Gmail to ${toEmail}`);
    } catch (error) {
        console.error("Gmail email sending failed:", error);
        throw new Error(`Failed to send email via Gmail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function POST(request: Request) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    try {
        // Check Gmail credentials
        if (!GMAIL_USERNAME || !GMAIL_APP_PASSWORD) {
            console.error("Gmail credentials are missing!");
            return NextResponse.json({ 
                error: "Gmail email service not configured properly" 
            }, { status: 500 });
        }
        
        const data: OrderData = await request.json();
        
        // Validate required fields
        if (!data || !data.cart || data.cart.length === 0) {
            return NextResponse.json({ error: "Invalid data: cart is empty" }, { status: 400 });
        }
        
        if (!data.firstName || !data.lastName || !data.email || !data.phone) {
            return NextResponse.json({ error: "Missing required customer information" }, { status: 400 });
        }
        
        if (!data.deliveryMethod) {
            return NextResponse.json({ error: "Missing delivery method" }, { status: 400 });
        }

        const totalAmount = data.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const customerMessagePayByAgreement = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Підтвердження замовлення</title>
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse; }
    img { border:0; display:block; line-height:100%; }
    .wrapper { width:100%; background:#f5f7fa; padding:20px 0; }
    .container { width:600px; max-width:100%; margin:0 auto; background:#ffffff; }
    @media only screen and (max-width:620px) {
      .container { width:100% !important; padding:0 12px !important; }
      .two-col td { display:block; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f5f7fa;">
  <center class="wrapper" style="width:100%; background:#f5f7fa; padding:20px 0;">
    <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; margin:0 auto; background:#ffffff;">
      <!-- Header -->
      <tr>
        <td style="padding:20px; text-align:left; border-bottom:1px solid #e9ecef;">
          <img src="https://barco-blanco.ua/icons/logo.png" alt="BarcoBlanco" width="140" style="display:block; max-width:140px; height:auto;">
        </td>
      </tr>

      <!-- Hero / Intro -->
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px 0; font-size:20px; font-family:Arial, sans-serif; color:#222222;">Привіт ${data.firstName}!</h1>
          <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#6b7280;">Дякуємо за ваше замовлення! Нижче ви знайдете всі деталі.</p>
        </td>
      </tr>

      <!-- Order meta -->
      <tr>
        <td style="padding:0 24px 18px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial, sans-serif; font-size:14px; color:#444444;">
            <tr>
              <td style="padding:8px 0;"><strong>Клієнт:</strong> ${data.lastName} ${data.firstName}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Оплата:</strong> ${data.paymentMethods}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;"><strong>Доставка:</strong> ${data.deliveryMethod === "pickup" ? "Самовивіз" : data.deliveryMethod === "ukr-poshta" ? "Укр Пошта" : data.deliveryMethod === "nova-poshta" ? "Нова Пошта" : "Не вказано"}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Сума:</strong> ${totalAmount.toFixed(2)} грн.</td>
            </tr>
          ${data.city ? `
          <tr>
              <td style="padding:8px 0;"><strong>Місто:</strong> ${data.city}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.selectedToggle ? `
          <tr>
              <td style="padding:8px 0;"><strong>Вид доставки:</strong> ${data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.warehouse ? `
          <tr>
              <td style="padding:8px 0;"><strong>Відділення:</strong> ${data.warehouse}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.addressCourier ? `
          <tr>
              <td style="padding:8px 0;"><strong>Адреса кур'єра:</strong> ${data.addressCourier}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.pickup ? `
          <tr>
              <td style="padding:8px 0;"><strong>Самовивіз:</strong> ${data.pickup}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.additionalInfo ? `
          <tr>
              <td style="padding:8px 0;" colspan="2"><strong>Додаткова інформація:</strong> ${data.additionalInfo}</td>
          </tr>` : ""}
          </table>
        </td>
          </tr>

      <!-- Items -->
      <tr>
        <td style="padding:0 24px 8px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #eee; font-family:Arial, sans-serif;">
            <!-- Header row -->
            <tr>
              <td style="padding:12px 0; font-weight:bold;">Товар</td>
              <td style="padding:12px 0; text-align:right; font-weight:bold;">Ціна</td>
          </tr>

            <!-- Repeat this TR for each item -->
            ${data.cart.map((item, index) => `
            <tr>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1;">
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:top; padding-right:12px;">
                      <img src="${item.image}" alt="${item.name}" width="64" style="width:64px; height:auto; display:block;">
            </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:14px; font-family:Arial, sans-serif; color:#222;">${item.name}</div>
                      <div style="font-size:12px; color:#6b7280;">Кількість: ${item.quantity}</div>
            </td>
          </tr>
                </table>
              </td>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1; text-align:right; vertical-align:middle;">${(item.price * item.quantity).toFixed(2)} грн.</td>
            </tr>
            `).join('')}

            <!-- Totals -->
            <tr>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">Загальна сума</td>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">${totalAmount.toFixed(2)} грн.</td>
            </tr>
      </table>
        </td>
      </tr>

      <!-- Contact Info -->
      <tr>
        <td style="padding:18px 24px;">
          <div style="background-color:#f8f9fa; border-left:4px solid #1996A3; padding:20px; margin:0; border-radius:0 8px 8px 0;">
            <p style="margin:0 0 12px 0; font-family:Arial, sans-serif; font-size:14px; color:#444; line-height:1.6;">
        <strong>Наш менеджер зв'яжеться з вами якнайшвидше</strong> для підтвердження та обробки замовлення.
      </p>
            <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#444; line-height:1.6;">
        Якщо питання термінове — зателефонуйте нам: 
              <a href="tel:+380504730644" style="color:#1996A3; text-decoration:none; font-weight:600;">+38 (050) 47-30-644</a>
      </p>
    </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:18px 24px; border-top:1px solid #eee; font-family:Arial, sans-serif; font-size:12px; color:#777;">
          <p style="margin:0;">© 2024 BarcoBlanco — Всі права захищені.</p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;



        const customerMessage = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Підтвердження замовлення</title>
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse; }
    img { border:0; display:block; line-height:100%; }
    .wrapper { width:100%; background:#f5f7fa; padding:20px 0; }
    .container { width:600px; max-width:100%; margin:0 auto; background:#ffffff; }
    @media only screen and (max-width:620px) {
      .container { width:100% !important; padding:0 12px !important; }
      .two-col td { display:block; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f5f7fa;">
  <center class="wrapper" style="width:100%; background:#f5f7fa; padding:20px 0;">
    <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; margin:0 auto; background:#ffffff;">
      <!-- Header -->
      <tr>
        <td style="padding:20px; text-align:left; border-bottom:1px solid #e9ecef;">
          <img src="https://barco-blanco.ua/icons/logo.png" alt="BarcoBlanco" width="140" style="display:block; max-width:140px; height:auto;">
        </td>
      </tr>

      <!-- Hero / Intro -->
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px 0; font-size:20px; font-family:Arial, sans-serif; color:#222222;">Привіт ${data.firstName}!</h1>
          <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#6b7280;">Дякуємо за ваше замовлення! Ось його деталі.</p>
        </td>
      </tr>

      <!-- Order meta -->
      <tr>
        <td style="padding:0 24px 18px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial, sans-serif; font-size:14px; color:#444444;">
            <tr>
              <td style="padding:8px 0;"><strong>Клієнт:</strong> ${data.lastName} ${data.firstName}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Оплата:</strong> ${data.paymentMethods}</td>
          </tr>
            <tr>
              <td style="padding:8px 0;"><strong>Доставка:</strong> ${data.deliveryMethod === "pickup" ? "Самовивіз" : data.deliveryMethod === "ukr-poshta" ? "Укр Пошта" : data.deliveryMethod === "nova-poshta" ? "Нова Пошта" : "Не вказано"}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Сума:</strong> ${totalAmount.toFixed(2)} грн.</td>
            </tr>
          ${data.city ? `
          <tr>
              <td style="padding:8px 0;"><strong>Місто:</strong> ${data.city}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
            ${data.selectedToggle ? `
            <tr>
              <td style="padding:8px 0;"><strong>Вид доставки:</strong> ${data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
          ${data.warehouse ? `
          <tr>
              <td style="padding:8px 0;"><strong>Відділення:</strong> ${data.warehouse}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.addressCourier ? `
          <tr>
              <td style="padding:8px 0;"><strong>Адреса кур'єра:</strong> ${data.addressCourier}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
          ${data.pickup ? `
          <tr>
              <td style="padding:8px 0;"><strong>Самовивіз:</strong> ${data.pickup}</td>
              <td style="padding:8px 0; text-align:right;"></td>
          </tr>` : ""}
            ${data.additionalInfo ? `
            <tr>
              <td style="padding:8px 0;" colspan="2"><strong>Додаткова інформація:</strong> ${data.additionalInfo}</td>
            </tr>` : ""}
          </table>
        </td>
          </tr>

      <!-- Items -->
      <tr>
        <td style="padding:0 24px 8px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #eee; font-family:Arial, sans-serif;">
            <!-- Header row -->
            <tr>
              <td style="padding:12px 0; font-weight:bold;">Товар</td>
              <td style="padding:12px 0; text-align:right; font-weight:bold;">Ціна</td>
          </tr>

            <!-- Repeat this TR for each item -->
          ${data.cart.map((item, index) => `
            <tr>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1;">
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:top; padding-right:12px;">
                      <img src="${item.image}" alt="${item.name}" width="64" style="width:64px; height:auto; display:block;">
            </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:14px; font-family:Arial, sans-serif; color:#222;">${item.name}</div>
                      <div style="font-size:12px; color:#6b7280;">Кількість: ${item.quantity}</div>
            </td>
                  </tr>
                </table>
              </td>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1; text-align:right; vertical-align:middle;">${(item.price * item.quantity).toFixed(2)} грн.</td>
          </tr>
          `).join('')}

            <!-- Totals -->
            <tr>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">Загальна сума</td>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">${totalAmount.toFixed(2)} грн.</td>
            </tr>
      </table>
        </td>
      </tr>

      <!-- Contact Info -->
      <tr>
        <td style="padding:18px 24px;">
          <div style="background-color:#f8f9fa; border-left:4px solid #1996A3; padding:20px; margin:0; border-radius:0 8px 8px 0;">
            <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#444; line-height:1.6;">
        <strong>Ми починаємо обробку вашого замовлення</strong> і скоро зв'яжемося з вами для підтвердження.
      </p>
    </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:18px 24px; border-top:1px solid #eee; font-family:Arial, sans-serif; font-size:12px; color:#777;">
          <p style="margin:0;">© 2024 BarcoBlanco — Всі права захищені.</p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;


        await sendEmail(data.email, "Підтвердження замовлення", data.paymentMethods == "По домовленості" ? customerMessagePayByAgreement : customerMessage);

        // HTML-Template for manager
        const managerMessage = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Нове замовлення</title>
  <style>
    body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table { border-collapse: collapse; }
    img { border:0; display:block; line-height:100%; }
    .wrapper { width:100%; background:#f5f7fa; padding:20px 0; }
    .container { width:600px; max-width:100%; margin:0 auto; background:#ffffff; }
    @media only screen and (max-width:620px) {
      .container { width:100% !important; padding:0 12px !important; }
      .two-col td { display:block; width:100% !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background:#f5f7fa;">
  <center class="wrapper" style="width:100%; background:#f5f7fa; padding:20px 0;">
    <table class="container" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:600px; max-width:100%; margin:0 auto; background:#ffffff;">
      <!-- Header -->
      <tr>
        <td style="padding:20px; text-align:left; border-bottom:1px solid #e9ecef; position:relative;">
          <img src="https://barco-blanco.ua/icons/logo.png" alt="BarcoBlanco" width="140" style="display:block; max-width:140px; height:auto;">
          <div style="position:absolute; top:20px; right:20px; background-color:#ff4757; color:#ffffff; padding:6px 12px; border-radius:4px; font-weight:700; font-size:12px; text-transform:uppercase;">
            НОВЕ ЗАМОВЛЕННЯ
          </div>
        </td>
      </tr>

      <!-- Hero / Intro -->
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px 0; font-size:20px; font-family:Arial, sans-serif; color:#222222;">Нове замовлення отримано</h1>
          <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#6b7280;">Деталі замовлення та контактна інформація клієнта.</p>
        </td>
      </tr>

      <!-- Customer Data -->
      <tr>
        <td style="padding:0 24px 18px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="font-family:Arial, sans-serif; font-size:14px; color:#444444; background-color:#f8f9fa; border:1px solid #e9ecef; border-radius:8px; padding:20px;">
            <tr>
              <td style="padding:8px 0;"><strong>Клієнт:</strong> ${data.lastName} ${data.firstName}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Сума:</strong> ${totalAmount.toFixed(2)} грн.</td>
            </tr>
            <tr>
              <td style="padding:8px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color:#1996A3; text-decoration:none;">${data.email}</a></td>
              <td style="padding:8px 0; text-align:right;"><strong>Телефон:</strong> <a href="tel:${data.phone}" style="color:#1996A3; text-decoration:none;">${data.phone}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;"><strong>Доставка:</strong> ${data.deliveryMethod === "pickup" ? "Самовивіз" : data.deliveryMethod === "ukr-poshta" ? "Укр Пошта" : data.deliveryMethod === "nova-poshta" ? "Нова Пошта" : "Не вказано"}</td>
              <td style="padding:8px 0; text-align:right;"><strong>Оплата:</strong> ${data.paymentMethods}</td>
            </tr>
            ${data.city ? `
            <tr>
              <td style="padding:8px 0;"><strong>Місто:</strong> ${data.city}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
            ${data.selectedToggle ? `
            <tr>
              <td style="padding:8px 0;"><strong>Вид доставки:</strong> ${data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
            ${data.warehouse ? `
            <tr>
              <td style="padding:8px 0;"><strong>Відділення:</strong> ${data.warehouse}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
            ${data.addressCourier ? `
            <tr>
              <td style="padding:8px 0;"><strong>Адреса кур'єра:</strong> ${data.addressCourier}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
            ${data.pickup ? `
            <tr>
              <td style="padding:8px 0;"><strong>Самовивіз:</strong> ${data.pickup}</td>
              <td style="padding:8px 0; text-align:right;"></td>
            </tr>` : ""}
            ${data.additionalInfo ? `
            <tr>
              <td style="padding:8px 0;" colspan="2"><strong>Додаткова інформація:</strong> ${data.additionalInfo}</td>
            </tr>` : ""}
          </table>
        </td>
      </tr>

      <!-- Items -->
      <tr>
        <td style="padding:0 24px 8px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-top:1px solid #eee; font-family:Arial, sans-serif;">
            <!-- Header row -->
            <tr>
              <td style="padding:12px 0; font-weight:bold;">Товар</td>
              <td style="padding:12px 0; text-align:right; font-weight:bold;">Ціна</td>
            </tr>

            <!-- Repeat this TR for each item -->
            ${data.cart.map((item, index) => `
            <tr>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1;">
                <table cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="vertical-align:top; padding-right:12px;">
                      <img src="${item.image}" alt="${item.name}" width="64" style="width:64px; height:auto; display:block;">
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:14px; font-family:Arial, sans-serif; color:#222;">${item.name}</div>
                      <div style="font-size:12px; color:#6b7280;">Кількість: ${item.quantity}</div>
                    </td>
                  </tr>
                </table>
              </td>
              <td style="padding:12px 0; border-top:1px solid #f1f1f1; text-align:right; vertical-align:middle;">${(item.price * item.quantity).toFixed(2)} грн.</td>
            </tr>
            `).join('')}

            <!-- Totals -->
            <tr>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">Загальна сума</td>
              <td style="padding:12px 0; text-align:right; font-size:16px; font-weight:bold; border-top:1px solid #ddd;">${totalAmount.toFixed(2)} грн.</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Action Required -->
      <tr>
        <td style="padding:18px 24px;">
          <div style="background-color:#fff3cd; border:1px solid #ffeaa7; border-left:4px solid #f39c12; padding:20px; margin:0; border-radius:0 8px 8px 0;">
            <p style="margin:0; font-family:Arial, sans-serif; font-size:14px; color:#856404; line-height:1.6;">
              <strong>Потрібна дія:</strong> Зв'яжіться з клієнтом для підтвердження замовлення та уточнення деталей доставки.
            </p>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:18px 24px; border-top:1px solid #eee; font-family:Arial, sans-serif; font-size:12px; color:#777;">
          <p style="margin:0;">© 2024 BarcoBlanco — Система управління замовленнями</p>
        </td>
      </tr>

    </table>
  </center>
</body>
</html>`;

        await sendEmail(MANAGER_EMAIL, "Нове замовлення отримано", managerMessage);

        clearTimeout(timeoutId);
        return NextResponse.json({ message: "Замовлення оброблено, електронні листи надіслано" }, { status: 200 });
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            return NextResponse.json(
                { error: 'Request timeout' },
                { status: 408 }
            );
        }
        console.error("Error sending email:", error);
        return NextResponse.json({ 
            error: "Failed to send email", 
            details: error instanceof Error ? error.message : "Unknown error",
            stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: "Success" }, { status: 200 });
}
