//components/ui/HeroBanner.tsx
"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
// import Link from "next/link";
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
    <div className="banner-container">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        speed={1100}
        className="banner-swiper"
      >
        {validImages.map((image, index) => {
          const imageUrl = urlFor(image)
            .width(1920)
            .fit("max")
            .auto("format")
            .quality(95)
            .url();
          const isHeroSlide = index === 0;

          if (!imageUrl) {
            return null;
          }

          return (
            <SwiperSlide key={image._key ?? imageUrl} className="banner-slide">
              <Image
                src={imageUrl}
                alt={image.alt || "Головний банер Barco Blanco"}
                fill
                className="banner-image object-cover"
                priority={isHeroSlide}
                loading={isHeroSlide ? "eager" : "lazy"}
                fetchPriority={isHeroSlide ? "high" : "auto"}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px"
              />
            </SwiperSlide>
          );
        })}
        {/* <div className="banner-button-wrapper">
          <Link href="/products">
            <button className="banner-button">ДО КАТАЛОГУ</button>
          </Link>
        </div> */}
      </Swiper>
    </div>
  );
};

export default BannerCarousel;
