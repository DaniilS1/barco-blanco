import { NextResponse } from "next/server";
import { client, urlFor } from "@/sanity/lib/client";
import { productFeedQuery } from "@/sanity/lib/queries/productQueries";

export const revalidate = 3600;

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function getBaseUrl(request: Request): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  try {
    return new URL(request.url).origin;
  } catch {
    return "https://localhost:3000";
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const download = searchParams.get("download") === "1" || searchParams.get("download") === "true";

    const products = await client.fetch<{
      _id: string;
      name: string;
      slug: string;
      price: number;
      details?: string | null;
      category: string;
      width?: number | null;
      height?: number | null;
      depth?: number | null;
      isPopular?: boolean;
      image: Array<{ asset?: unknown }>;
      isAvailable: boolean;
    }[]>(productFeedQuery);

    const baseUrl = getBaseUrl(request);

    const productNodes = products.map((p) => {
      const productUrl = `${baseUrl}/productDetails/${encodeURIComponent(p.slug || "")}`;
      const imageUrl =
        p.image?.[0] && urlFor(p.image[0]).width(800).url();
      const availability = p.isAvailable ? "in stock" : "out of stock";
      const images = (p.image ?? [])
        .map((img, i) => urlFor(img).width(800).url())
        .filter(Boolean);
      return `<product>
  <name>${escapeXml(p.name || "")}</name>
  <url>${escapeXml(productUrl)}</url>
  <price>${escapeXml(String(p.price ?? ""))}</price>
  <category>${escapeXml(p.category || "")}</category>
  <availability>${escapeXml(availability)}</availability>
  <description>${escapeXml(p.details ?? "")}</description>
  <width>${escapeXml(p.width != null ? String(p.width) : "")}</width>
  <height>${escapeXml(p.height != null ? String(p.height) : "")}</height>
  <depth>${escapeXml(p.depth != null ? String(p.depth) : "")}</depth>
  <isPopular>${p.isPopular ? "true" : "false"}</isPopular>
  <image>${escapeXml(imageUrl || "")}</image>
  <images>${images.map((u) => `<url>${escapeXml(u)}</url>`).join("")}</images>
</product>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <products>
${productNodes.join("\n")}
  </products>
</feed>`;

    const headers: HeadersInit = {
      "Content-Type": "application/xml",
      "Cache-Control":
        "public, s-maxage=3600, stale-while-revalidate=86400",
    };
    if (download) {
      headers["Content-Disposition"] = 'attachment; filename="feed.xml"';
    }

    return new NextResponse(xml, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Feed Error:", error);
    return NextResponse.json(
      { error: "Failed to generate product feed" },
      { status: 500 }
    );
  }
}
