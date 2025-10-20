// app/(store)/products/page.tsx
import { productQuery } from "@/sanity/lib/queries/productQueries";
import { client } from "@/sanity/lib/client";
import ProductsClient from "./ProductsClient"; // <-- We'll create this client component

export const revalidate = 300; // Revalidate every 5 minutes

export default async function ProductsPage() {
  // 1. Fetch all products from Sanity with caching
  const allProducts = await client.fetch(productQuery, {}, {
    next: { revalidate: 300 } // Cache for 5 minutes
  });

  // 2. Render a client component, passing the products down as props
  return <ProductsClient products={allProducts} />;
}
