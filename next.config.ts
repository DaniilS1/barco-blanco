// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.sanity.io"], // Allow images from cdn.sanity.io
  },
  reactStrictMode: false, // Disable StrictMode to prevent double rendering in development
  // Vercel-specific optimizations (removed to avoid missing dependency)
  // experimental: {
  //   optimizeCss: true,
  // },
  // Ensure proper hydration
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
