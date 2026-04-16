import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nnauto.cz"),
  title: {
    default: "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel",
    template: "%s",
  },
  description:
    "NNAuto je prémiový marketplace pro prodej a nákup nových i ojetých vozidel v České republice.",
  keywords:
    "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, NNAuto, autobazar, Česká republika",
  authors: [{ name: "NNAuto" }],
  openGraph: {
    type: "website",
    siteName: "NNAuto",
    locale: "cs_CZ",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NNAuto - Prémiový Marketplace Aut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    other: { "seznam-wmt": "vQCSLREi3JbWqT5OfoYSc8Jp6LVwXk4v" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs-CZ" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preconnect"
          href="https://pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://challenges.cloudflare.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://challenges.cloudflare.com"
        />
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          async
          defer
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
