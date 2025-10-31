import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-config";
import { client } from "@/sanity/lib/client";

interface ProductSlugResult {
  slug?: string;
  _updatedAt?: string;
}

const STATIC_PATHS: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] }> = [
  { path: "/", priority: 1 },
  { path: "/products", priority: 0.9 },
  { path: "/category/dzerkala", priority: 0.8 },
  { path: "/category/tumby", priority: 0.8 },
  { path: "/category/penaly", priority: 0.8 },
  { path: "/category/shafy", priority: 0.8 },
  { path: "/category/vologostiike", priority: 0.8 },
  { path: "/favorites", priority: 0.5 },
  { path: "/basket", priority: 0.5 },
  { path: "/order", priority: 0.5 },
  { path: "/delivery", priority: 0.4 },
  { path: "/guarantee", priority: 0.4 },
  { path: "/contacts", priority: 0.4 },
];

async function getProductSlugs(): Promise<ProductSlugResult[]> {
  try {
    const query = `*[_type == "product" && defined(slug.current) && !(_id in path("drafts.**"))]{
      "slug": slug.current,
      _updatedAt
    }`;
    return await client.fetch<ProductSlugResult[]>(query, {}, { next: { revalidate: 600 } });
  } catch (error) {
    console.error("Failed to load product slugs for sitemap:", error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const productSlugs = await getProductSlugs();

  const productEntries: MetadataRoute.Sitemap = productSlugs
    .filter((product): product is Required<ProductSlugResult> & { slug: string } => Boolean(product.slug))
    .map((product) => ({
      url: getAbsoluteUrl(`/productDetails/${product.slug}`),
      lastModified: product._updatedAt ? new Date(product._updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: getAbsoluteUrl(path),
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  return [...staticEntries, ...productEntries];
}

