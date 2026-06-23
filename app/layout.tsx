import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Trending Vichaar — Daily Trends, Creative Ideas & Digital Culture",
    template: "%s — Trending Vichaar",
  },
  description:
    "A modern creative magazine covering AI tools, design, social media, productivity and the trends shaping the digital world.",
  keywords: [
    "trending vichaar",
    "ai tools",
    "graphic design",
    "creativity",
    "digital trends",
    "social media",
    "productivity",
  ],
  authors: [{ name: "Trending Vichaar" }],
  creator: "Trending Vichaar",
  openGraph: {
    type: "website",
    siteName: "Trending Vichaar",
    title: "Trending Vichaar — Daily Trends, Creative Ideas & Digital Culture",
    description:
      "A modern creative magazine covering AI tools, design, social media and the trends shaping the digital world.",
    url: siteUrl(),
    images: [
      {
        url: "/logo.png",
        width: 1254,
        height: 1254,
        alt: "Trending Vichaar",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Trending Vichaar — Daily Trends, Creative Ideas & Digital Culture",
    description: "A modern creative magazine for designers, creators and the perpetually curious.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: "/logo.png",
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": "/rss.xml",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}
    >
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1256982604856103"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="grain antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
          >
            Skip to content
          </a>
          <Navbar />
          <div id="main" className="pt-16 lg:pt-20">
            {children}
          </div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
