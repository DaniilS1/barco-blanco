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
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 800px; margin: 0 auto; padding: 0; color: #333; background-color: #ffffff;">
  <!-- Email Header -->
  <div style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <img src="https://barcoblanco.com/icons/logo.png" alt="BarcoBlanco" style="height: 50px; width: auto; margin-bottom: 15px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BarcoBlanco</h1>
    <p style="color: #e0f7ff; margin: 5px 0 0 0; font-size: 16px;">Ваш надійний партнер у світі меблів</p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px;">
    <h2 style="color: #1996A3; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Привіт ${data.firstName}! 👋</h2>
    <p style="font-size: 16px; color: #555; margin: 0 0 25px 0; line-height: 1.6;">Дякуємо за ваше замовлення! Нижче ви знайдете всі деталі:</p>

    <!-- User Data Card -->
    <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <h3 style="color: #1996A3; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #1996A3; padding-bottom: 10px;">📋 Деталі замовлення</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${data.lastName || data.firstName ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333; width: 30%;">👤 Клієнт:</td>
            <td style="padding: 8px 0; color: #555;">${data.lastName ?? ""} ${data.firstName ?? ""}</td>
          </tr>` : ""}
          ${data.address ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📍 Адреса:</td>
            <td style="padding: 8px 0; color: #555;">${data.address}</td>
          </tr>` : ""}
          ${data.city ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏙️ Місто:</td>
            <td style="padding: 8px 0; color: #555;">${data.city}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚚 Доставка:</td>
            <td style="padding: 8px 0; color: #555;">
              ${data.deliveryMethod === "pickup"
                ? "Самовивіз"
                : data.deliveryMethod === "ukr-poshta"
                    ? "Укр Пошта"
                    : data.deliveryMethod === "nova-poshta"
                        ? "Нова Пошта"
                        : "Не вказано"}
            </td>
          </tr>
          ${data.selectedToggle ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📦 Вид доставки:</td>
            <td style="padding: 8px 0; color: #555;">${data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle}</td>
          </tr>` : ""}
          ${data.warehouse ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏢 Відділення:</td>
            <td style="padding: 8px 0; color: #555;">${data.warehouse}</td>
          </tr>` : ""}
          ${data.addressCourier ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏠 Адреса кур'єра:</td>
            <td style="padding: 8px 0; color: #555;">${data.addressCourier}</td>
          </tr>` : ""}
          ${data.pickup ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚪 Самовивіз:</td>
            <td style="padding: 8px 0; color: #555;">${data.pickup}</td>
          </tr>` : ""}
          ${data.paymentMethods ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">💳 Оплата:</td>
            <td style="padding: 8px 0; color: #555;">${data.paymentMethods}</td>
          </tr>` : ""}
          ${data.additionalInfo ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📝 Додаткова інформація:</td>
            <td style="padding: 8px 0; color: #555;">${data.additionalInfo}</td>
          </tr>` : ""}
          <tr style="border-top: 2px solid #1996A3; margin-top: 15px;">
            <td style="padding: 15px 0 8px 0; font-weight: 700; color: #1996A3; font-size: 18px;">💰 Загальна сума:</td>
            <td style="padding: 15px 0 8px 0; color: #1996A3; font-weight: 700; font-size: 18px;">${totalAmount.toFixed(2)} грн.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Products Section -->
    <h3 style="color: #1996A3; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">🛍️ Товари в замовленні</h3>
    <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 15px; color: #333;">
        <thead>
          <tr style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%);">
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Зображення</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Назва</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Ціна</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Кількість</th>
          </tr>
        </thead>
        <tbody>
          ${data.cart
                .map((item, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef;">
              <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 500;">${item.name}</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #1996A3;">${item.price.toFixed(2)} грн.</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">
              <span style="background-color: #1996A3; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 14px;">${item.quantity}</span>
            </td>
          </tr>
        `)
                .join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer Message -->
    <div style="background-color: #f8f9fa; border-left: 4px solid #1996A3; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="font-size: 16px; color: #555; margin: 0 0 15px 0; line-height: 1.6;">
        <strong>📞 Наш менеджер зв'яжеться з вами якнайшвидше</strong> для підтвердження та обробки замовлення.
      </p>
      <p style="font-size: 16px; color: #555; margin: 0; line-height: 1.6;">
        Якщо питання термінове — зателефонуйте нам: 
        <a href="tel:+380504730644" style="color: #1996A3; text-decoration: none; font-weight: 600;">+38 (050) 47-30-644</a>
      </p>
    </div>
  </div>

  <!-- Email Footer -->
  <div style="background-color: #f5f7fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px; margin: 0;">© 2024 BarcoBlanco. Всі права захищені.</p>
  </div>
</div>
`;



        const customerMessage = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 800px; margin: 0 auto; padding: 0; color: #333; background-color: #ffffff;">
  <!-- Email Header -->
  <div style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0;">
    <img src="https://barcoblanco.com/icons/logo.png" alt="BarcoBlanco" style="height: 50px; width: auto; margin-bottom: 15px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BarcoBlanco</h1>
    <p style="color: #e0f7ff; margin: 5px 0 0 0; font-size: 16px;">Ваш надійний партнер у світі меблів</p>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px;">
    <h2 style="color: #1996A3; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Привіт ${data.firstName}! 👋</h2>
    <p style="font-size: 16px; color: #555; margin: 0 0 25px 0; line-height: 1.6;">Дякуємо за ваше замовлення! Ось його деталі:</p>

    <!-- User Data Card -->
    <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <h3 style="color: #1996A3; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #1996A3; padding-bottom: 10px;">📋 Деталі замовлення</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333; width: 30%;">👤 Клієнт:</td>
            <td style="padding: 8px 0; color: #555;">${data.lastName} ${data.firstName}</td>
          </tr>
          ${data.address ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📍 Адреса:</td>
            <td style="padding: 8px 0; color: #555;">${data.address}</td>
          </tr>` : ""}
          ${data.city ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏙️ Місто:</td>
            <td style="padding: 8px 0; color: #555;">${data.city}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚚 Вид доставки:</td>
            <td style="padding: 8px 0; color: #555;">
              ${data.selectedToggle
                ? (data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle)
                : "Не вказано"}
            </td>
          </tr>
          ${data.warehouse ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏢 Відділення:</td>
            <td style="padding: 8px 0; color: #555;">${data.warehouse}</td>
          </tr>` : ""}
          ${data.addressCourier ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏠 Адреса кур'єра:</td>
            <td style="padding: 8px 0; color: #555;">${data.addressCourier}</td>
          </tr>` : ""}
          ${data.pickup ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚪 Самовивіз:</td>
            <td style="padding: 8px 0; color: #555;">${data.pickup}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">💳 Оплата:</td>
            <td style="padding: 8px 0; color: #555;">${data.paymentMethods}</td>
          </tr>
          <tr style="border-top: 2px solid #1996A3; margin-top: 15px;">
            <td style="padding: 15px 0 8px 0; font-weight: 700; color: #1996A3; font-size: 18px;">💰 Загальна сума:</td>
            <td style="padding: 15px 0 8px 0; color: #1996A3; font-weight: 700; font-size: 18px;">${totalAmount.toFixed(2)} грн.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Products Section -->
    <h3 style="color: #1996A3; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">🛍️ Товари в замовленні</h3>
    <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 15px; color: #333;">
        <thead>
          <tr style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%);">
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Зображення</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Назва</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Ціна</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Кількість</th>
          </tr>
        </thead>
        <tbody>
          ${data.cart.map((item, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef;">
              <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 500;">${item.name}</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #1996A3;">${item.price.toFixed(2)} грн.</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">
              <span style="background-color: #1996A3; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 14px;">${item.quantity}</span>
            </td>
          </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Footer Message -->
    <div style="background-color: #f8f9fa; border-left: 4px solid #1996A3; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="font-size: 16px; color: #555; margin: 0; line-height: 1.6;">
        <strong>📞 Ми починаємо обробку вашого замовлення</strong> і скоро зв'яжемося з вами для підтвердження.
      </p>
    </div>
  </div>

  <!-- Email Footer -->
  <div style="background-color: #f5f7fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px; margin: 0;">© 2024 BarcoBlanco. Всі права захищені.</p>
  </div>
</div>
`;


        await sendEmail(data.email, "Підтвердження замовлення", data.paymentMethods == "По домовленості" ? customerMessagePayByAgreement : customerMessage);

        // HTML-Template for manager
        const managerMessage = `
        <div style="font-family: Arial, Helvetica, sans-serif; max-width: 800px; margin: 0 auto; padding: 0; color: #333; background-color: #ffffff;">
  <!-- Email Header with NEW ORDER Badge -->
  <div style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%); padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; position: relative;">
    <img src="https://barcoblanco.com/icons/logo.png" alt="BarcoBlanco" style="height: 50px; width: auto; margin-bottom: 15px;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BarcoBlanco</h1>
    <p style="color: #e0f7ff; margin: 5px 0 0 0; font-size: 16px;">Система управління замовленнями</p>
    
    <!-- NEW ORDER Badge -->
    <div style="position: absolute; top: 20px; right: 20px; background-color: #ff4757; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
      НОВЕ ЗАМОВЛЕННЯ
    </div>
  </div>

  <!-- Main Content -->
  <div style="padding: 30px 20px;">
    <h2 style="color: #1996A3; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">📋 Деталі замовлення</h2>

    <!-- Customer Data Card -->
    <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 25px; margin-bottom: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <h3 style="color: #1996A3; font-size: 18px; margin: 0 0 20px 0; font-weight: 600; border-bottom: 2px solid #1996A3; padding-bottom: 10px;">👤 Інформація про клієнта</h3>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tbody>
          ${data.lastName || data.firstName ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333; width: 30%;">👤 Клієнт:</td>
            <td style="padding: 8px 0; color: #555;">${data.lastName ?? ""} ${data.firstName ?? ""}</td>
          </tr>` : ""}
          ${data.email ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📧 Email:</td>
            <td style="padding: 8px 0; color: #555;">
              <a href="mailto:${data.email}" style="color: #1996A3; text-decoration: none;">${data.email}</a>
            </td>
          </tr>` : ""}
          ${data.phone ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📞 Телефон:</td>
            <td style="padding: 8px 0; color: #555;">
              <a href="tel:${data.phone}" style="color: #1996A3; text-decoration: none;">${data.phone}</a>
            </td>
          </tr>` : ""}
          ${(data.address || data.city) ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📍 Адреса:</td>
            <td style="padding: 8px 0; color: #555;">${data.address ?? ""}${data.city ? ", " + data.city : ""}</td>
          </tr>` : ""}
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚚 Доставка:</td>
            <td style="padding: 8px 0; color: #555;">
              ${data.deliveryMethod === "pickup"
                  ? "Самовивіз"
                  : data.deliveryMethod === "ukr-poshta"
                      ? "Укр Пошта"
                      : data.deliveryMethod === "nova-poshta"
                          ? "Нова Пошта"
                          : "Не вказано"}
            </td>
          </tr>
          ${data.selectedToggle ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📦 Вид доставки:</td>
            <td style="padding: 8px 0; color: #555;">${data.selectedToggle === 'courier' ? "Кур'єром" : data.selectedToggle}</td>
          </tr>` : ""}
          ${data.warehouse ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏢 Відділення:</td>
            <td style="padding: 8px 0; color: #555;">${data.warehouse}</td>
          </tr>` : ""}
          ${data.addressCourier ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🏠 Адреса кур'єра:</td>
            <td style="padding: 8px 0; color: #555;">${data.addressCourier}</td>
          </tr>` : ""}
          ${data.pickup ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">🚪 Самовивіз:</td>
            <td style="padding: 8px 0; color: #555;">${data.pickup}</td>
          </tr>` : ""}
          ${data.paymentMethods ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">💳 Оплата:</td>
            <td style="padding: 8px 0; color: #555;">${data.paymentMethods}</td>
          </tr>` : ""}
          ${data.additionalInfo ? `
          <tr>
            <td style="padding: 8px 0; font-weight: 600; color: #333;">📝 Додаткова інформація:</td>
            <td style="padding: 8px 0; color: #555;">${data.additionalInfo}</td>
          </tr>` : ""}
          <tr style="border-top: 2px solid #1996A3; margin-top: 15px;">
            <td style="padding: 15px 0 8px 0; font-weight: 700; color: #1996A3; font-size: 18px;">💰 Загальна сума:</td>
            <td style="padding: 15px 0 8px 0; color: #1996A3; font-weight: 700; font-size: 18px;">${totalAmount.toFixed(2)} грн.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Products Section -->
    <h3 style="color: #1996A3; font-size: 20px; margin: 0 0 20px 0; font-weight: 600;">🛍️ Товари в замовленні</h3>
    <div style="background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <table style="width: 100%; border-collapse: separate; border-spacing: 0; font-size: 15px; color: #333;">
        <thead>
          <tr style="background: linear-gradient(135deg, #1996A3 0%, #008c99 100%);">
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Зображення</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Назва</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Ціна</th>
            <th style="padding: 15px 12px; text-align: left; color: #ffffff; font-weight: 600; font-size: 14px;">Кількість</th>
          </tr>
        </thead>
        <tbody>
          ${data.cart
            .map((item, index) => `
          <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f9fa'};">
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef;">
              <img src="${item.image}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover;">
            </td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 500;">${item.name}</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #1996A3;">${item.price.toFixed(2)} грн.</td>
            <td style="padding: 15px 12px; border-bottom: 1px solid #e9ecef; text-align: center;">
              <span style="background-color: #1996A3; color: #ffffff; padding: 4px 8px; border-radius: 6px; font-weight: 600; font-size: 14px;">${item.quantity}</span>
            </td>
          </tr>
        `)
            .join('')}
        </tbody>
      </table>
    </div>

    <!-- Action Required Notice -->
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-left: 4px solid #f39c12; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
      <p style="font-size: 16px; color: #856404; margin: 0; line-height: 1.6;">
        <strong>⚠️ Потрібна дія:</strong> Зв'яжіться з клієнтом для підтвердження замовлення та уточнення деталей доставки.
      </p>
    </div>
  </div>

  <!-- Email Footer -->
  <div style="background-color: #f5f7fa; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
    <p style="color: #6c757d; font-size: 14px; margin: 0;">© 2024 BarcoBlanco. Система управління замовленнями</p>
  </div>
</div>`;

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
