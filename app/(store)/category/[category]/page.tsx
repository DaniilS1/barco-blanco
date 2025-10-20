// app/(store)/category/[category]/page.tsx
import { categoryProductQuery } from "@/sanity/lib/queries/categoryProductQuery";
import { client } from "@/sanity/lib/client";
import ProductsClient from "../../products/ProductsClient";
import { JSX } from 'react';

export const revalidate = 300;

export async function generateStaticParams() {
  return [
    { category: 'dzerkala' },
    { category: 'tumby' },
    { category: 'shafy' },
    { category: 'vologostiike' },
    { category: 'penaly' }
  ];
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  // Next.js expects these properties to be promises.
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] }>;
}): Promise<JSX.Element> {
  // Await the promise to extract the parameters.
  const { category } = await params;
  // Use searchParams in a no-op way to mark it as "used."
  void await searchParams;

  // Fetch products for the selected category from Sanity with caching.
  const products = await client.fetch(categoryProductQuery(category), {}, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });

  return <ProductsClient products={products} selectedCategory={category} />;
}
