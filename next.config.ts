// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.sanity.io"], // Allow images from cdn.sanity.io
  },
  reactStrictMode: false, // Disable StrictMode to prevent double rendering in development
};

export default nextConfig;
