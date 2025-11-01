"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

import { FavoriteButton } from "@/components/ui/favorite-button";
import { FavoriteItem } from "@/context/favorites-context";

interface ProductProps {
  product: ProductType;
}

interface ProductType {
  _id?: string;
  image?: { asset: { url: string }; alt?: string }[] | null;
  name: string;
  slug?: { current: string } | null;
  price: number;
  isAvailable?: boolean;
}

const Product: React.FC<ProductProps> = ({ product }) => {
  const { image, name, slug } = product;

  const imageUrl =
  image && Array.isArray(image) && image.length > 0 && image[0]?.asset?.url
    ? image[0].asset.url
    : "/images/placeholder.svg";

  const favoritePayload: FavoriteItem = {
    id: product._id || product.slug?.current || product.name,
    name: product.name,
    price: product.price,
    image: imageUrl,
    slug: product.slug?.current || undefined,
    isAvailable: product.isAvailable,
  };

  // Fallback if slug is missing
  if (!slug?.current) {
    return (
      <div className="group relative flex h-full cursor-pointer flex-col items-center rounded-lg text-center transition-transform opacity-50">
        {/* Картинка */}
        <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-white">
          <Image
            src={imageUrl}
            width={320}
            height={240}
            className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105 rounded-lg"
            alt={name}
          />
        </div>
        <FavoriteButton
          item={favoritePayload}
          size="sm"
          className="absolute right-3 top-3 shadow-md"
        />
        {/* Название */}
        <p className="mt-3 text-gray-800 text-sm sm:text-base font-medium line-clamp-2 flex-grow flex items-center justify-center text-center">
          {name} (No Link)
        </p>
      </div>
    );
  }

  return (
    <Link href={`/productDetails/${slug.current}`} className="block">
      <div className="group relative flex h-full cursor-pointer flex-col items-center rounded-lg text-center transition-transform">
        {/* Картинка */}
        <div className="w-full aspect-[3/4] overflow-hidden rounded-lg bg-white">
          <Image
            src={imageUrl}
            width={320}
            height={240}
            className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-105 rounded-lg"
            alt={name}
          />
        </div>
        <FavoriteButton
          item={favoritePayload}
          size="sm"
          className="absolute right-3 top-3 shadow-md"
        />

        {/* Название */}
        <p className="mt-3 text-gray-800 text-sm sm:text-base font-medium line-clamp-2 flex-grow flex items-center justify-center text-center">
          {name}
        </p>
      </div>
    </Link>
  );
};

export default Product;










