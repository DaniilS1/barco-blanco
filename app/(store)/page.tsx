// app/(store)/page.tsx

import React from "react";

import {
  AboutSection,
  Categories,
  PopularProducts,
} from "../../components/ui";
import Features from "../../components/ui/Features";
import CallButton from "../../components/ui/CallButton";
import BannerCarousel from "../../components/ui/HeroBanner";
import { client } from "../../sanity/lib/client";
import { bannerQuery, productQuery } from "../../sanity/lib/queries";

const Home = async () => {
  try {
    const [bannerData, productsData] = await Promise.all([
      client.fetch(bannerQuery).catch(() => []),
      client.fetch(productQuery).catch(() => [])
    ]);

    return (
      <>
        {bannerData?.[0]?.images?.length > 0 && (
          <BannerCarousel images={bannerData[0].images} />
        )}

        <Categories />
        <PopularProducts productsData={productsData} />
        <Features />
        <CallButton />
        <AboutSection />
      </>
    );
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return <div>Unable to load content</div>;
  }
};

export default Home;
