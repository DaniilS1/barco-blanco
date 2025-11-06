"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import Link from "next/link";
import { urlFor } from "../../sanity/lib/client";

interface BannerImage {
  _key?: string;
  alt?: string;
  asset?: {
    _ref?: string;
    _type?: string;
  };
}

interface BannerCarouselProps {
  images: BannerImage[];
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({ images }) => {
  if (!images || images.length === 0) {
    return null;
  }

  const validImages = images.filter((image) => image?.asset);

  return (
    <div
      className="banner-container mt-10 relative w-full overflow-hidden aspect-[16/7] max-h-[500px]"
    >
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation={{
          enabled: true,
        }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true, // Better for mobile
        }}
        autoplay={{ 
          delay: 3000, 
          disableOnInteraction: false,
          pauseOnMouseEnter: true, // Better UX
        }}
        loop={validImages.length > 1}
        slidesPerView={1}
        spaceBetween={0}
        touchRatio={1} // Better touch sensitivity on mobile
        className="banner-swiper"
        style={{ width: "100%", height: "100%" }}
        breakpoints={{
          0: {
            navigation: {
              enabled: false, // Disable navigation on mobile
            },
          },
          768: {
            navigation: {
              enabled: true, // Enable navigation on tablet+
            },
          },
        }}
      >
        {validImages.map((image, index) => {
          const isHeroSlide = index === 0;
          
          // Generate responsive, high-quality image URL from Sanity
          // Next.js will handle responsive loading via sizes attribute
          const imageUrl = urlFor(image)
            .width(1920) // High res for desktop
            .height(840) // Maintains 16:7 aspect ratio
            .fit("crop")
            .auto("format") // Auto WebP/AVIF when supported
            .quality(95) // High quality (85-100 range)
            .url();

          if (!imageUrl) {
            return null;
          }

          return (
            <SwiperSlide key={image._key ?? imageUrl} className="banner-slide" style={{ position: "relative" }}>
              <Image
                src={imageUrl}
                alt={image.alt || "Banner Image"}
                fill
                quality={95}
                priority={isHeroSlide}
                loading={isHeroSlide ? "eager" : "lazy"}
                fetchPriority={isHeroSlide ? "high" : "auto"}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1920px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div
        className="banner-button-wrapper absolute left-1/2 -translate-x-1/2 z-10 w-full flex justify-center px-4 bottom-8"
      >
        <Link href="/products" className="block">
          <button
            className="banner-button px-6 py-2.5 text-base bg-[#008c99] text-white border-none rounded-[20px] cursor-pointer font-medium shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 hover:bg-[#007a85] hover:scale-105"
          >
            До каталогу
          </button>
        </Link>
      </div>
    </div>
  );
};

export default BannerCarousel;
