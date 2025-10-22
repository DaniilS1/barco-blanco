//components/ui/ProductDetails.tsx

"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/context/CartContext";
import Product from "./Product";

interface ProductImage {
  asset: { url: string };
  alt?: string;
}

interface ProductDetailsProps {
  productData: {
    name: string;
    image: ProductImage[] | null;
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
  };
  similarProducts?: {
    _id: string;
    name: string;
    slug: { current: string };
    price: number;
    width?: number;
    category?: string;
    image?: { asset: { url: string } }[];
  }[];
  isLoading?: boolean;
}

export default function ProductDetails({ productData, similarProducts = [], isLoading = false }: ProductDetailsProps) {
  const {
    name,
    image,
    price,
    details,
    width,
    color,
    article,
    height,
    depth,
    isAvailable,
    category,
  } = productData;

  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const images =
    Array.isArray(image) && image.length > 0
      ? image.filter(img => img?.asset?.url) // Filter out images with null asset
      : [{ asset: { url: "/images/placeholder.svg" }, alt: "placeholder" }];

  const handleAddToCart = () => {
    addToCart({
      id: name,
      name,
      price,
      image: images[0]?.asset?.url || "/images/placeholder.svg",
      quantity: quantity,
    });
  };

  // Fixed 3:4 aspect ratio - you can adjust these values as needed
  const ASPECT_RATIO_WIDTH = 3;
  const ASPECT_RATIO_HEIGHT = 4;
  const CONTAINER_WIDTH = 400; // Adjust this value to change the container width
  const CONTAINER_HEIGHT = (CONTAINER_WIDTH * ASPECT_RATIO_HEIGHT) / ASPECT_RATIO_WIDTH;
  
  // Mobile responsive container sizes
  const MOBILE_CONTAINER_WIDTH = 320;
  const MOBILE_CONTAINER_HEIGHT = (MOBILE_CONTAINER_WIDTH * ASPECT_RATIO_HEIGHT) / ASPECT_RATIO_WIDTH;

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);

  // Handle navigation
  const goToPrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    } else if (images.length > 1) {
      setSelectedImageIndex(images.length - 1);
    }
  };

  const goToNext = () => {
    if (selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    } else if (images.length > 1) {
      setSelectedImageIndex(0);
    }
  };

  // Function to scroll thumbnail into view
  const scrollThumbnailIntoView = (index: number) => {
    if (thumbnailContainerRef.current) {
      const thumbnailButton = thumbnailContainerRef.current.children[index] as HTMLElement;
      if (thumbnailButton) {
        thumbnailButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  };

  // Scroll to selected thumbnail when image changes
  useEffect(() => {
    scrollThumbnailIntoView(selectedImageIndex);
  }, [selectedImageIndex]);

  // Minimum distance for swipe
  const minSwipeDistance = 50;

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    }
    if (isRightSwipe) {
      goToPrevious();
    }
  };



  // Skeleton loading component
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Skeleton for image */}
          <div className="w-full lg:w-1/2">
            <div className="animate-pulse bg-gray-200 rounded-lg h-96 w-full"></div>
          </div>
          {/* Skeleton for product info */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="animate-pulse bg-gray-200 h-8 w-3/4 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-6 w-1/2 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-12 w-full rounded"></div>
            <div className="animate-pulse bg-gray-200 h-32 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-8">
      {/* Breadcrumb Navigation */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-[#1996A3] transition-colors">Головна</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[#1996A3] transition-colors">Каталог</Link>
        <span className="mx-2">/</span>
        <Link href={`/category/${category}`} className="hover:text-[#1996A3] transition-colors">
          {category === 'dzerkala' ? 'Дзеркала' : 
           category === 'tumby' ? 'Тумби' :
           category === 'shafy' ? 'Шафи' :
           category === 'vologostiike' ? 'Вологостійке' :
           category === 'penaly' ? 'Пенали' : category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Left Column - Image Gallery */}
        <div className="w-full lg:w-1/2 order-1 lg:order-1">
          <div className="relative flex items-center justify-center">
            {/* Left Navigation Arrow - Outside the image */}
            {images.length > 1 && (
              <button
                ref={prevRef}
                onClick={goToPrevious}
                className="absolute left-[-5px] top-1/2 -translate-y-1/2 bg-[#1996A3] hover:bg-white text-white hover:text-[#1996A3] transition-all duration-200 w-12 h-12 rounded-full shadow-sm flex items-center justify-center z-10 border border-[#1996A3]  hidden md:flex"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Main Image Container */}
            <div 
              className="relative w-full rounded-lg overflow-hidden flex items-center justify-center shadow-sm"
              style={{ 
                height: `${MOBILE_CONTAINER_HEIGHT}px`,
                maxWidth: `${MOBILE_CONTAINER_WIDTH}px`,
                margin: '0 auto'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={images[selectedImageIndex]?.asset?.url || "/images/placeholder.svg"}
                alt={images[selectedImageIndex]?.alt || name}
                width={MOBILE_CONTAINER_WIDTH}
                height={MOBILE_CONTAINER_HEIGHT}
                className="object-cover w-full h-full md:hidden"
                priority
              />
              <Image
                src={images[selectedImageIndex]?.asset?.url || "/images/placeholder.svg"}
                alt={images[selectedImageIndex]?.alt || name}
                width={CONTAINER_WIDTH}
                height={CONTAINER_HEIGHT}
                className="object-cover w-full h-full hidden md:block"
                priority
              />
              
              {/* Swipe indicators for mobile */}
              {images.length > 1 && (
                <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-0 h-0 rounded-full transition-colors ${
                        selectedImageIndex === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Navigation Arrow - Outside the image */}
            {images.length > 1 && (
              <button
                ref={nextRef}
                onClick={goToNext}
                className="absolute right-[-5px] top-1/2 -translate-y-1/2 bg-[#1996A3] hover:bg-white text-white hover:text-[#1996A3] transition-all duration-200 w-12 h-12 rounded-full shadow-sm flex items-center justify-center z-10 border border-[#1996A3]  hidden md:flex"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

         
          {images.length > 1 && (
            <div 
              ref={thumbnailContainerRef}
              className="flex gap-2 mt-4 md:mt-6 overflow-x-auto p-2 scrollbar-hide"
              style={{ 
                width: '100%'
              }}
            >
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative w-20 h-20 mt-1 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-300 transform ${
                    selectedImageIndex === index 
                      ? 'ring-1 ring-[#1996A3] ring-offset-1 scale-110' 
                      : ' hover:scale-105'
                  }`}
                >
                  <Image
                    src={img?.asset?.url || "/images/placeholder.svg"}
                    alt={img?.alt || `thumbnail-${index}`}
                    width={80}
                    height={80}
                    className="object-contain w-full h-full bg-gray-50"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Information */}
        <div className="w-full lg:w-1/2 space-y-4 md:space-y-6 order-2 lg:order-2">
          

          {/* Product Title */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
            {name}
          </h1>

          {/* Price */}
          <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {price.toFixed(2)} <span className="text-lg md:text-xl font-medium text-gray-600">грн</span>
          </div>

          {/* Mobile: Badge and Quantity Selector in one row */}
          <div className="md:hidden flex items-center justify-between mb-4">
            {isAvailable ? (
              <Badge variant="success" className="text-xs px-2 py-1">
                В наявності
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-xs px-2 py-1">
                Немає в наявності
              </Badge>
            )}
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-2 py-1 hover:text-[#1996A3] transition-colors rounded-l-lg"
                disabled={quantity <= 1}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="px-2 py-1 border-x border-gray-300 bg-gray-50 min-w-[2rem] text-center font-medium text-sm">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="px-2 py-1 hover:text-[#1996A3] transition-colors rounded-r-lg"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop: Badge and Quantity Selector separate */}
          <div className="hidden md:block">
            {/* Desktop Stock Status */}
            <div className="flex items-center gap-3 mb-4">
              {isAvailable ? (
                <Badge variant="success" className="text-sm px-3 py-1">
                  В наявності
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-sm px-3 py-1">
                  Немає в наявності
                </Badge>
              )}
            </div>

            {/* Desktop Quantity Selector */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-medium text-gray-700">Кількість:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:text-[#1996A3] transition-colors rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <span className="px-4 py-2 border-x border-gray-300 bg-gray-50 min-w-[3rem] text-center font-medium">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:text-[#1996A3] transition-colors rounded-r-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

         

          {/* Add to Cart Button */}
          <div className="flex items-center gap-4 mb-4">
            {isAvailable && (
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="bg-[#1996A3] hover:bg-[#147a86] text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:scale-105 w-full md:w-auto"
              >
                <Image
                  src="/icons/cart.png"
                  alt="Cart"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                Додати в кошик
              </Button>
            )}
          </div>

          {/* Support Links */}
          <div className="flex items-center gap-3 text-sm mb-4">
            <div className="flex items-center gap-2 text-gray-600 hover:text-[#1996A3] transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Підтримка клієнтів</span>
            </div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="flex items-center gap-2 text-gray-600 hover:text-[#1996A3] transition-colors cursor-pointer">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Гарантія якості</span>
            </div>
          </div>

          {/* Product Details */}
          <Card className="mt-4 md:mt-6">
            <CardContent className="p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Деталі товару</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {details && <p className="leading-relaxed text-sm md:text-base">{details}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-gray-200">
                  {width && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 text-sm">Ширина:</span>
                      <span className="text-sm">{width} см</span>
                    </div>
                  )}
                  {height && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 text-sm">Висота:</span>
                      <span className="text-sm">{height} см</span>
                    </div>
                  )}
                  {depth && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 text-sm">Глибіна:</span>
                      <span className="text-sm">{depth} см</span>
                    </div>
                  )}
                  {article && (
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="font-medium text-gray-700 text-sm">Артикул:</span>
                      <span className="text-sm">{article}</span>
                    </div>
                  )}
                </div>
                {color && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 md:pt-4 border-t border-gray-200">
                    <span className="font-medium text-gray-700 text-sm">Колір:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{color}</span>
                      <div
                        className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
        <div className="mt-12">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Схожі товари</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {similarProducts.slice(0, 4).map((product) => (
              <div key={product._id} className="w-full">
                <Product product={product} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
