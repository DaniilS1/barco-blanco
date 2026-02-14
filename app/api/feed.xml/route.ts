// app/api/feed.xml/route.ts
import { NextResponse } from "next/server";
import { client } from "@/sanity/lib/client";
import { productQuery } from "@/sanity/lib/queries/productQueries";

export const revalidate = 3600;

const CACHE_CONTROL =
  "public, s-maxage=3600, stale-while-revalidate=86400";

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

function imageUrlWithWidth(url: string, width: number): string {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}w=${width}`;
}

function productToXmlNodes(baseUrl: string, product: ProductRow): string {
  const slug = product.slug?.current;
  const productUrl = slug ? `${baseUrl}/productDetails/${slug}` : "";
  const availability = product.isAvailable ? "in stock" : "out of stock";
  const name = xmlEscape(product.name ?? "");
  const description = xmlEscape(product.details ?? "");
  const category = xmlEscape(product.category ?? "");
  const price = Number(product.price);
  const priceStr = Number.isFinite(price) ? price.toFixed(2) : "0";
  const width = product.width ?? 0;
  const height = product.height ?? 0;
  const depth = product.depth ?? 0;
  const isPopular = product.isPopular === true ? "true" : "false";

  const images = Array.isArray(product.image) ? product.image : [];
  const urls = images
    .map((img) => img?.asset?.url)
    .filter((u): u is string => Boolean(u));
  const firstImageUrl = urls[0] ? imageUrlWithWidth(urls[0], 800) : "";
  const imagesXml = urls.map((u) => `<url>${xmlEscape(u)}</url>`).join("");

  return `<product>
  <name>${name}</name>
  <url>${xmlEscape(productUrl)}</url>
  <price>${priceStr}</price>
  <category>${category}</category>
  <availability>${availability}</availability>
  <description>${description}</description>
  <width>${width}</width>
  <height>${height}</height>
  <depth>${depth}</depth>
  <isPopular>${isPopular}</isPopular>
  <image>${xmlEscape(firstImageUrl)}</image>
  <images>${imagesXml}</images>
</product>`;
}

export async function GET(request: Request) {
  try {
    const products = await client.fetch<ProductRow[]>(productQuery, {}, { next: { revalidate: 3600 } });
    const baseUrl = getBaseUrl(request);

    const productsXml = (products ?? [])
      .filter((p) => p?.slug?.current)
      .map((p) => productToXmlNodes(baseUrl, p))
      .join("\n    ");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <products>
    ${productsXml}
  </products>
</feed>`;

    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download");
    const isDownload = download === "1" || download === "true";

    const headers: HeadersInit = {
      "Content-Type": "application/xml",
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
