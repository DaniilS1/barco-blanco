// app/(store)/products/page.tsx
import type { Metadata } from "next";

import { productQuery } from "@/sanity/lib/queries/productQueries";
import { client } from "@/sanity/lib/client";
import { getAbsoluteUrl } from "@/lib/site-config";
import ProductsClient from "./ProductsClient"; // <-- We'll create this client component

export const revalidate = 300; // Revalidate every 5 minutes

const CATALOG_TITLE = "Каталог меблів для ванної кімнати";
const CATALOG_DESCRIPTION =
  "Повний каталог меблів для ванної кімнати Barco Blanco: дзеркала, тумби з умивальником, пенали та навісні шафи. Власне виробництво, доставка по всій Україні.";

export const metadata: Metadata = {
  title: CATALOG_TITLE,
  description: CATALOG_DESCRIPTION,
  alternates: {
    canonical: getAbsoluteUrl("/products"),
  },
  openGraph: {
    title: CATALOG_TITLE,
    description: CATALOG_DESCRIPTION,
    url: getAbsoluteUrl("/products"),
  },
};

export default async function ProductsPage() {
  // 1. Fetch all products from Sanity with caching
  const allProducts = await client.fetch(productQuery, {}, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });

  // 2. Render a client component, passing the products down as props
  return (
    <>
      <header className="mx-auto w-full max-w-[1400px] px-4 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {CATALOG_TITLE}
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-gray-600 sm:text-base">
          {CATALOG_DESCRIPTION}
        </p>
      </header>
      <ProductsClient products={allProducts} />
    </>
  );
}
