import type { MetadataRoute } from "next";

import { getAbsoluteUrl } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = new URL(getAbsoluteUrl());

  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/studio"],
    },
    sitemap: getAbsoluteUrl("/sitemap.xml"),
    host: baseUrl.origin,
  };
}

