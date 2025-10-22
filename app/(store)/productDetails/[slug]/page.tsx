// app/(store)/productDetails/[slug]/page.tsx

import { productDetailsQuery } from "@/sanity/lib/queries/productDetailsQuery";
import { productQuery } from "@/sanity/lib/queries/productQueries";
import ProductDetails from "@/components/ui/ProductDetails";
import { client } from "@/sanity/lib/client";
import { Suspense } from "react";

// Define the ProductType interface based on the Sanity schema
interface ProductType {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  details: string;
  image: { asset: { url: string }; alt?: string }[];
  category: string;
  width: number;
  isPopular?: boolean;
  height: number;
  depth: number;
  isAvailable: boolean;
}

// Function to fetch product data from Sanity using the slug.
async function getProduct(slug: string) {
  try {
    return await client.fetch(
      productDetailsQuery,
      { slug },
      { next: { revalidate: 600 } }
    );
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return null;
  }
}

// Function to fetch similar products from the same category
async function getSimilarProducts(category: string, currentProductSlug: string) {
  try {
    const allProducts = await client.fetch(
      productQuery,
      {},
      { next: { revalidate: 600 } }
    );
    
    // Filter products from same category and exclude current product
    return allProducts.filter(
      (product: ProductType) => 
        product.category?.toLowerCase() === category.toLowerCase() && 
        product.slug?.current !== currentProductSlug
    ).slice(0, 4);
  } catch (error) {
    console.error('Failed to fetch similar products:', error);
    return [];
  }
}

// Define the page props so that params is a Promise (Workaround 1)
type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  // Await the parameters (ensuring we get a plain object with a slug)
  const { slug } = await params;
  
  // Fetch product and similar products in parallel
  const [product, similarProducts] = await Promise.all([
    getProduct(slug),
    getProduct(slug).then(product => 
      product ? getSimilarProducts(product.category, slug) : []
    )
  ]);

  if (!product) {
    return <div>Продукт не знайдено</div>;
  }

  // Render the styled ProductDetails component with the fetched product data.
  return (
    <Suspense fallback={<ProductDetails productData={product} isLoading={true} />}>
      <ProductDetails 
        productData={product} 
        similarProducts={similarProducts}
        isLoading={false}
      />
    </Suspense>
  );
}
