// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

import { getAbsoluteUrl, siteConfig } from "@/lib/site-config";

const metadataBase = new URL(getAbsoluteUrl());

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: siteConfig.name,
  category: "e-commerce",
  creator: siteConfig.name,
  // Kein globales `alternates.canonical` hier: Next.js vererbt es sonst an
  // JEDE Unterseite, wodurch /products, /category/* usw. auf die Startseite
  // kanonisiert und aus dem Index gedrängt würden. Canonical wird pro Seite gesetzt.
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.shortDescription,
    url: siteConfig.baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "og:site_name": siteConfig.name,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#008c99",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#4ade80",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
