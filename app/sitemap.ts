import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-config";
import { client } from "@/sanity/lib/client";

interface ProductSlugResult {
  slug?: string;
  _updatedAt?: string;
}

interface StaticPathConfig {
  path: string;
  priority: number;
  changeFrequency?: MetadataRoute.Sitemap[0]["changeFrequency"];
}

const STATIC_PATHS: StaticPathConfig[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/category/dzerkala", priority: 0.8, changeFrequency: "weekly" },
  { path: "/category/tumby", priority: 0.8, changeFrequency: "weekly" },
  { path: "/category/penaly", priority: 0.8, changeFrequency: "weekly" },
  { path: "/category/shafy", priority: 0.8, changeFrequency: "weekly" },
  { path: "/category/vologostiike", priority: 0.8, changeFrequency: "weekly" },
  { path: "/favorites", priority: 0.5, changeFrequency: "monthly" },
  { path: "/basket", priority: 0.5, changeFrequency: "weekly" },
  { path: "/order", priority: 0.5, changeFrequency: "weekly" },
  { path: "/delivery", priority: 0.4, changeFrequency: "monthly" },
  { path: "/guarantee", priority: 0.4, changeFrequency: "monthly" },
  { path: "/contacts", priority: 0.4, changeFrequency: "monthly" },
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

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority, changeFrequency = "weekly" }) => ({
    url: getAbsoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));

  return [...staticEntries, ...productEntries];
}

