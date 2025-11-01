// app/(store)/productDetails/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "@/components/ui/ProductDetails";
import { getAbsoluteUrl, siteConfig } from "@/lib/site-config";
import { client } from "@/sanity/lib/client";
import { productDetailsQuery } from "@/sanity/lib/queries/productDetailsQuery";
import { productQuery } from "@/sanity/lib/queries/productQueries";

interface SanityImage {
  asset?: { url?: string };
  alt?: string;
}

interface ProductType {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  details?: string;
  image?: SanityImage[];
  category?: string;
  width?: number;
  height?: number;
  depth?: number;
  isAvailable?: boolean;
  isPopular?: boolean;
  color?: string;
  article?: string;
  reviewsCount?: number;
}

interface RouteParams {
  slug?: string;
}

interface PageProps {
  params?: Promise<RouteParams>;
}

interface ProductImageResult {
  asset: { url: string };
  alt?: string;
}

interface ProductDetailsPayload {
  name: string;
  image: ProductImageResult[] | null;
  price: number;
  details: string;
  category: string;
  width?: number;
  height?: number;
  depth?: number;
  isPopular?: boolean;
  color?: string;
  article?: string;
  reviewsCount?: number;
  isAvailable?: boolean;
  slug?: { current: string };
}

interface SimilarProductPayload {
  _id: string;
  name: string;
  slug: { current: string };
  price: number;
  width?: number;
  category?: string;
  image?: ProductImageResult[];
  isAvailable?: boolean;
}

function normalizeDescription(details?: string): string {
  if (!details) return siteConfig.shortDescription;
  const compact = details.replace(/\s+/g, " ").trim();
  return compact.length > 155 ? `${compact.slice(0, 152)}...` : compact;
}

function selectPrimaryImage(images?: SanityImage[]): { url: string; alt: string } | null {
  if (!images?.length) return null;
  const [{ asset, alt }] = images;
  if (!asset?.url) return null;
  return { url: asset.url, alt: alt || siteConfig.name };
}

function normalizeProductImages(images?: SanityImage[]): ProductImageResult[] | null {
  if (!images?.length) return null;

  const normalized: ProductImageResult[] = [];

  images.forEach((image) => {
    const url = image.asset?.url;
    if (!url) return;
    normalized.push({ asset: { url }, alt: image.alt });
  });

  return normalized.length > 0 ? normalized : null;
}

function createProductJsonLd(product: ProductType, canonicalUrl: string, image?: { url: string; alt: string }) {
  const availability = product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.details,
    image: image?.url,
    sku: product._id,
    category: product.category,
    offers: {
      "@type": "Offer",
      availability,
      priceCurrency: "UAH",
      price: product.price,
      url: canonicalUrl,
    },
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
  };
}

function createBreadcrumbJsonLd(product: ProductType, canonicalUrl: string) {
  const categoryPath = product.category ? `/category/${product.category}` : "/products";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Головна",
        item: siteConfig.baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: product.category || "Каталог",
        item: getAbsoluteUrl(categoryPath),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };
}

function mapToProductDetailsPayload(product: ProductType): ProductDetailsPayload {
  const normalizedImages = normalizeProductImages(product.image);

  return {
    name: product.name,
    image: normalizedImages,
    price: product.price,
    details: product.details ?? siteConfig.shortDescription,
    category: product.category ?? "Каталог",
    width: product.width,
    height: product.height,
    depth: product.depth,
    isPopular: product.isPopular,
    color: product.color,
    article: product.article,
    reviewsCount: product.reviewsCount,
    isAvailable: product.isAvailable,
    slug: product.slug,
  };
}

function mapToSimilarProductPayload(product: ProductType): SimilarProductPayload {
  const normalizedImages = normalizeProductImages(product.image);

  return {
    _id: product._id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    width: product.width,
    category: product.category,
    image: normalizedImages ?? undefined,
    isAvailable: product.isAvailable,
  };
}

async function getProduct(slug: string) {
  try {
    return await client.fetch<ProductType | null>(
      productDetailsQuery,
      { slug },
      { next: { revalidate: 600 } }
    );
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

async function getSimilarProducts(category?: string, currentProductSlug?: string) {
  if (!category) return [];
  try {
    const allProducts = await client.fetch<ProductType[]>(
      productQuery,
      {},
      { next: { revalidate: 600 } }
    );
    return allProducts
      .filter((product) =>
        product.category?.toLowerCase() === category.toLowerCase() &&
        product.slug?.current !== currentProductSlug
      )
      .slice(0, 4);
  } catch (error) {
    console.error("Failed to fetch similar products:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: "Товар не знайдено",
      description: siteConfig.shortDescription,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Товар не знайдено",
      description: siteConfig.shortDescription,
      alternates: {
        canonical: getAbsoluteUrl(`/productDetails/${slug}`),
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = normalizeDescription(product.details);
  const primaryImage = selectPrimaryImage(product.image);
  const canonicalUrl = getAbsoluteUrl(`/productDetails/${product.slug?.current ?? slug}`);
  const keywords = Array.from(
    new Set([
      product.name,
      product.category,
      ...siteConfig.keywords,
    ].filter(Boolean) as string[])
  );

  return {
    title: `${product.name} | ${siteConfig.name}`,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: product.name,
      description,
      url: canonicalUrl,
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              alt: primaryImage.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: primaryImage ? [primaryImage.url] : undefined,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = params ? await params : undefined;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const rawSimilarProducts = await getSimilarProducts(product.category, product.slug?.current ?? slug);
  const similarProducts = rawSimilarProducts.map(mapToSimilarProductPayload);
  const canonicalUrl = getAbsoluteUrl(`/productDetails/${product.slug?.current ?? slug}`);
  const primaryImage = selectPrimaryImage(product.image);
  const productJsonLd = createProductJsonLd(product, canonicalUrl, primaryImage || undefined);
  const breadcrumbJsonLd = createBreadcrumbJsonLd(product, canonicalUrl);
  const productDetailsData = mapToProductDetailsPayload(product);

  return (
    <>
      <ProductDetails
        productData={productDetailsData}
        similarProducts={similarProducts}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}
