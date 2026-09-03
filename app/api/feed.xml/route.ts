// app/api/feed.xml/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { productQuery } from "@/sanity/lib/queries/productQueries";

export const revalidate = 3600;

const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

const SHOP_NAME = "Barco Blanco";
const SHOP_VENDOR = "Barco Blanco";
const CURRENCY_ID = "UAH";

type ProductRow = {
  _id: string;
  name: string;
  slug?: { current?: string };
  price: number;
  details?: string | null;
  image?: { asset?: { url?: string } }[] | null;
  category?: string | null;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  isPopular?: boolean | null;
  isAvailable?: boolean | null;
};

// Slug -> { id, title } für die <categories>-Sektion.
// Feste numerische IDs, damit sie zwischen den Feed-Generierungen stabil bleiben.
const CATEGORY_MAP: Record<string, { id: number; title: string }> = {
  dzerkala: { id: 1, title: "Дзеркала" },
  shafy: { id: 2, title: "Шафи" },
  tumby: { id: 3, title: "Тумби" },
  vologostiike: { id: 4, title: "Вологостійке" },
  penaly: { id: 5, title: "Пенали" },
};

function getBaseUrl(request: Request): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl?.trim()) {
    const trimmed = siteUrl.trim();
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      return new URL(withProtocol).toString().replace(/\/$/, "");
    } catch {
      // fall through
    }
  }
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl?.trim()) {
    return `https://${vercelUrl.trim()}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl?.trim()) {
      const trimmed = appUrl.trim();
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    }
    return "http://localhost:3000";
  }
}

function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(text: string): string {
  // ]]> innerhalb der Beschreibung aufsplitten, damit der CDATA-Block gültig bleibt.
  const safe = text.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

function formatCatalogDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function offerXml(baseUrl: string, product: ProductRow): string {
  const slug = product.slug?.current ?? "";
  const productUrl = `${baseUrl}/productDetails/${slug}`;
  const available = product.isAvailable === true;
  const stockQuantity = available ? 1 : 0;

  const price = Number(product.price);
  const priceStr = Number.isFinite(price) ? price.toFixed(2) : "0";

  const cat = product.category ? CATEGORY_MAP[product.category] : undefined;
  const categoryIdLine = cat ? `\n        <categoryId>${cat.id}</categoryId>` : "";

  const images = Array.isArray(product.image) ? product.image : [];
  const pictures = images
    .map((img) => img?.asset?.url)
    .filter((u): u is string => Boolean(u))
    .map((u) => `\n        <picture>${xmlEscape(u)}</picture>`)
    .join("");

  const params: string[] = [];
  if (product.width && product.width > 0)
    params.push(`\n        <param name="Ширина (см)">${product.width}</param>`);
  if (product.height && product.height > 0)
    params.push(`\n        <param name="Висота (см)">${product.height}</param>`);
  if (product.depth && product.depth > 0)
    params.push(`\n        <param name="Глибина (см)">${product.depth}</param>`);

  return `      <offer id="${xmlEscape(product._id)}" available="${available ? "true" : "false"}">
        <url>${xmlEscape(productUrl)}</url>
        <price>${priceStr}</price>
        <currencyId>${CURRENCY_ID}</currencyId>${categoryIdLine}${pictures}
        <vendor>${xmlEscape(SHOP_VENDOR)}</vendor>
        <stock_quantity>${stockQuantity}</stock_quantity>
        <name>${xmlEscape(product.name ?? "")}</name>
        <description>${cdata(product.details ?? "")}</description>
        <vendorCode>${xmlEscape(slug)}</vendorCode>${params.join("")}
      </offer>`;
}

export async function GET(request: Request) {
  try {
    const products = await client.fetch<ProductRow[]>(productQuery, {}, { next: { revalidate: 3600 } });
    const baseUrl = getBaseUrl(request);

    const rows = (products ?? []).filter((p) => p?.slug?.current);

    const usedCategories = new Set(
      rows
        .map((p) => p.category)
        .filter((c): c is string => Boolean(c && CATEGORY_MAP[c]))
    );
    const categoriesXml = Array.from(usedCategories)
      .map((slug) => {
        const c = CATEGORY_MAP[slug];
        return `      <category id="${c.id}">${xmlEscape(c.title)}</category>`;
      })
      .join("\n");

    const offersXml = rows.map((p) => offerXml(baseUrl, p)).join("\n");

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<yml_catalog date="${formatCatalogDate(new Date())}">
  <shop>
    <name>${xmlEscape(SHOP_NAME)}</name>
    <company>${xmlEscape(SHOP_NAME)}</company>
    <url>${xmlEscape(baseUrl)}</url>
    <currencies>
      <currency id="${CURRENCY_ID}" rate="1"/>
    </currencies>
    <categories>
${categoriesXml}
    </categories>
    <offers>
${offersXml}
    </offers>
  </shop>
</yml_catalog>`;

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download");
    const isDownload = download === "1" || download === "true";

    const headers: HeadersInit = {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": CACHE_CONTROL,
    };
    if (isDownload) {
      headers["Content-Disposition"] = 'attachment; filename="feed.xml"';
    }

    return new NextResponse(xml, { status: 200, headers });
  } catch (error) {
    console.error("Product feed error:", error);
    return NextResponse.json(
      { error: "Failed to generate product feed" },
      { status: 500 }
    );
  }
}
