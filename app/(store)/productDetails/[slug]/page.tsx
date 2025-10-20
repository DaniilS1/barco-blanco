// app/(store)/productDetails/[slug]/page.tsx

import { productDetailsQuery } from "@/sanity/lib/queries/productDetailsQuery";
import ProductDetails from "@/components/ui/ProductDetails";
import { client } from "@/sanity/lib/client";

// Function to fetch product data from Sanity using the slug.
async function getProduct(slug: string) {
 
  return await client.fetch(productDetailsQuery, { slug });
}

// Define the page props so that params is a Promise (Workaround 1)
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  // Await the parameters (ensuring we get a plain object with a slug)
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return <div>Продукт не знайдено</div>;
  }

  // Render the styled ProductDetails component with the fetched product data.
  return <ProductDetails productData={product} />;
}
