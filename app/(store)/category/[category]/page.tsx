// app/(store)/category/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JSX } from "react";

import { categoryProductQuery } from "@/sanity/lib/queries/categoryProductQuery";
import { client } from "@/sanity/lib/client";
import { getAbsoluteUrl } from "@/lib/site-config";
import { CATEGORY_SLUGS, getCategoryInfo } from "@/lib/categories";
import ProductsClient from "../../products/ProductsClient";

export const revalidate = 300;

export async function generateStaticParams() {
  return CATEGORY_SLUGS.map((category) => ({ category }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const info = getCategoryInfo(category);

  if (!info) {
    return {
      title: "Категорію не знайдено",
      robots: { index: false, follow: true },
    };
  }

  const canonical = getAbsoluteUrl(`/category/${info.slug}`);

  return {
    title: info.title,
    description: info.description,
    alternates: { canonical },
    openGraph: {
      title: info.title,
      description: info.description,
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: info.title,
      description: info.description,
    },
  };
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
  void (await searchParams);

  const info = getCategoryInfo(category);

  if (!info) {
    notFound();
  }

  // Fetch products for the selected category from Sanity with caching.
  const products = await client.fetch(categoryProductQuery(category), {}, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });

  return (
    <>
      <header className="mx-auto w-full max-w-[1400px] px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{info.h1}</h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
          {info.intro}
        </p>
      </header>
      <ProductsClient products={products} selectedCategory={category} />
    </>
  );
}
