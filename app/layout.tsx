import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nnauto.cz"),
  title: {
    default: "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel",
    template: "%s",
  },
  description:
    "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání. Najděte své vysněné auto ještě dnes!",
  keywords:
    "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, prémiový marketplace, auto inzerce, авто базар Чехія, car marketplace Czech Republic",
  authors: [{ name: "NNAuto" }],
  alternates: {
    languages: {
      cs: "/",
      uk: "/?lang=uk",
      en: "/?lang=en",
      de: "/?lang=de",
      "x-default": "/",
    },
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
  openGraph: {
    type: "website",
    url: "https://nnauto.cz",
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description:
      "Najděte své vysněné auto na NNAuto. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel. Prémiová kvalita, snadné vyhledávání.",
    siteName: "NNAuto",
    locale: "cs_CZ",
    alternateLocale: ["uk_UA", "en_US", "de_DE"],
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
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description:
      "Najděte své vysněné auto na NNAuto. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel.",
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
    other: { "seznam-wmt": "SNCyP9RGIcE0br1iVidtn4njM3YwySrn" },
  },
  other: {
    googlebot: "index, follow",
    seznambot: "index, follow",
    language: "cs",
    "content-language": "cs-CZ",
    "geo.region": "CZ",
    "geo.placename": "Česká republika",
    "geo.position": "49.8175;15.4730",
    ICBM: "49.8175, 15.4730",
    "revisit-after": "1 days",
    rating: "general",
    distribution: "global",
    target: "all",
    audience: "all",
    coverage: "Worldwide",
    classification: "Automotive, Vehicles, Cars, Marketplace",
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
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link
          rel="preload"
          as="image"
          href="/hero-bg.webp"
          type="image/webp"
          imageSrcSet="/hero-bg.webp"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {/* Google Analytics — deferred for performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag() { dataLayer.push(arguments); }
              (function () {
                var started = false;
                function startAnalytics() {
                  if (started) return;
                  started = true;
                  var s = document.createElement('script');
                  s.src = 'https://www.googletagmanager.com/gtag/js?id=G-1VPRCXDLKP';
                  s.async = true;
                  document.head.appendChild(s);
                  gtag('js', new Date());
                  gtag('config', 'G-1VPRCXDLKP', { send_page_view: true });
                  gtag('config', 'AW-17794544456');
                  gtag('config', 'AW-17768541644');
                }
                var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 2200); };
                idle(startAnalytics, { timeout: 3000 });
                window.addEventListener('pointerdown', startAnalytics, { once: true, passive: true });
                window.addEventListener('keydown', startAnalytics, { once: true });
                window.addEventListener('scroll', startAnalytics, { once: true, passive: true });
              })();
            `,
          }}
        />
        {/* TikTok Pixel — deferred for performance */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var started = false;
                function startTikTok() {
                  if (started) return;
                  started = true;
                  !function (w, d, t) {
                    w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
                    ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
                    ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
                    for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
                    ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
                    ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";
                    ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=r;ttq._t=ttq._t||{};ttq._t[e]=+new Date;
                    ttq._o=ttq._o||{};ttq._o[e]=n||{};
                    n=document.createElement("script");n.type="text/javascript";n.async=!0;n.src=r+"?sdkid="+e+"&lib="+t;
                    e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                    ttq.load("D6OHV8BC77UBTM3F5GBG");ttq.page();
                  }(window, document, "ttq");
                }
                var idle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 3500); };
                idle(startTikTok, { timeout: 5000 });
                window.addEventListener('pointerdown', startTikTok, { once: true, passive: true });
                window.addEventListener('keydown', startTikTok, { once: true });
                window.addEventListener('scroll', startTikTok, { once: true, passive: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
