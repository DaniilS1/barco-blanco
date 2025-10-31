interface SocialLinks {
  instagram?: string;
  telegram?: string;
  viber?: string;
}

interface SiteConfig {
  name: string;
  description: string;
  locale: string;
  shortDescription: string;
  baseUrl: string;
  contactEmail?: string;
  contactPhone?: string;
  social: SocialLinks;
  keywords: string[];
}

const defaultBaseUrl = "https://barcoblanco.store";

function normalizeBaseUrl(value?: string): string {
  if (!value) {
    return defaultBaseUrl;
  }

  const trimmed = value.trim();

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(withProtocol).toString();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Invalid NEXT_PUBLIC_APP_URL provided", error);
    }
    return defaultBaseUrl;
  }
}

const fallbackBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL);

export const siteConfig: SiteConfig = {
  name: "Barco Blanco",
  description:
    "Barco Blanco — інтернет-магазин меблів для ванної кімнати та домашнього простору з доставкою по Україні.",
  shortDescription:
    "Меблі для ванної кімнати, дзеркала та аксесуари Barco Blanco із доставкою по Україні.",
  locale: "uk_UA",
  baseUrl: fallbackBaseUrl,
  contactEmail: "info@barcoblanco.store",
  contactPhone: "+38 (050) 47-30-644",
  social: {
    instagram: "https://www.instagram.com/barcoblanco",
    telegram: "https://t.me/barcoblanco",
    viber: "viber://chat?number=%2B380504730644",
  },
  keywords: [
    "меблі для ванної",
    "дзеркала",
    "тумби для ванної",
    "пенали для ванної",
    "шафи",
    "водостійкі меблі",
    "Barco Blanco",
  ],
};

export function getAbsoluteUrl(pathname = "/"): string {
  const trimmedPathname = pathname.startsWith("/") ? pathname : `/${pathname}`;
  try {
    const base = new URL(siteConfig.baseUrl);
    return new URL(trimmedPathname, base).toString();
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Invalid baseUrl provided in siteConfig", error);
    }
    const fallbackBase = new URL("http://localhost:3000");
    return new URL(trimmedPathname, fallbackBase).toString();
  }
}

