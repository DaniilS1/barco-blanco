// app/(store)/products/page.tsx
import { productQuery } from "@/sanity/lib/queries/productQueries";
import { client } from "@/sanity/lib/client";
import ProductsClient from "./ProductsClient"; // <-- We'll create this client component

export default async function ProductsPage() {
  // 1. Fetch all products from Sanity with caching
  const allProducts = await client.fetch(productQuery, {}, {
    next: { revalidate: 60 } // Cache for 60 seconds
  });

  // 2. Render a client component, passing the products down as props
  return <ProductsClient products={allProducts} />;
}
