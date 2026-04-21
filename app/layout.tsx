import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f3ea" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

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
    <html lang="cs-CZ" className={poppins.variable} suppressHydrationWarning>
      <head>
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
      <body className={`${poppins.className} font-sans antialiased bg-background text-foreground`}>
        {/* Remote diagnostics: capture real-device runtime errors and ship to /api/diag.
            This runs BEFORE any other app code so we see failures from iOS Safari, old Safari, etc. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                if (window.__nn_diag_installed) return; window.__nn_diag_installed = true;
                var sent = 0; var MAX = 8;
                function send(kind, info) {
                  try {
                    if (sent >= MAX) return;
                    sent += 1;
                    var payload = { kind: kind, t: Date.now(), url: String(location.href).slice(0, 400), ua: (navigator.userAgent || '').slice(0, 300), info: info };
                    var body = JSON.stringify(payload);
                    if (navigator.sendBeacon) {
                      var blob = new Blob([body], { type: 'application/json' });
                      navigator.sendBeacon('/api/diag', blob);
                    } else {
                      fetch('/api/diag', { method: 'POST', body: body, keepalive: true, headers: { 'Content-Type': 'application/json' } }).catch(function(){});
                    }
                  } catch (_) {}
                }
                window.__nn_diag = send;
                send('boot', { stage: 'before-storage-shim' });
                window.addEventListener('error', function (ev) {
                  var info = {};
                  try {
                    info.message = ev && ev.message ? String(ev.message).slice(0, 400) : '';
                    info.filename = ev && ev.filename ? String(ev.filename).slice(0, 300) : '';
                    info.lineno = ev && ev.lineno;
                    info.colno = ev && ev.colno;
                    if (ev && ev.error && ev.error.stack) info.stack = String(ev.error.stack).slice(0, 1200);
                    if (ev && ev.target && ev.target !== window) {
                      info.srcTag = ev.target.tagName || '';
                      info.src = (ev.target.src || ev.target.href || '').toString().slice(0, 300);
                    }
                  } catch (_) {}
                  send('error', info);
                }, true);
                window.addEventListener('unhandledrejection', function (ev) {
                  var info = {};
                  try {
                    var r = ev && ev.reason;
                    info.message = r && (r.message || String(r)).toString().slice(0, 400);
                    if (r && r.stack) info.stack = String(r.stack).slice(0, 1200);
                  } catch (_) {}
                  send('rejection', info);
                });
              })();
            `,
          }}
        />
        {/* Safe storage shim: replace broken localStorage/sessionStorage (iOS private mode, disabled cookies) with in-memory fallback */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                function makeMemoryStorage() {
                  var map = Object.create(null);
                  return {
                    getItem: function (k) { return Object.prototype.hasOwnProperty.call(map, k) ? map[k] : null; },
                    setItem: function (k, v) { map[k] = String(v); },
                    removeItem: function (k) { delete map[k]; },
                    clear: function () { map = Object.create(null); },
                    key: function (i) { var keys = Object.keys(map); return i < keys.length ? keys[i] : null; },
                    get length() { return Object.keys(map).length; },
                  };
                }
                function isBroken(kind) {
                  try {
                    var s = window[kind];
                    if (!s) return true;
                    var probe = '__nn_probe__';
                    s.setItem(probe, '1');
                    s.removeItem(probe);
                    return false;
                  } catch (e) { return true; }
                }
                try {
                  if (isBroken('localStorage')) {
                    Object.defineProperty(window, 'localStorage', { value: makeMemoryStorage(), configurable: true });
                  }
                } catch (e) {
                  try { Object.defineProperty(window, 'localStorage', { value: makeMemoryStorage(), configurable: true }); } catch (e2) {}
                }
                try {
                  if (isBroken('sessionStorage')) {
                    Object.defineProperty(window, 'sessionStorage', { value: makeMemoryStorage(), configurable: true });
                  }
                } catch (e) {
                  try { Object.defineProperty(window, 'sessionStorage', { value: makeMemoryStorage(), configurable: true }); } catch (e2) {}
                }
              })();
            `,
          }}
        />
        {/* Resilience bootstrap: recover from stale chunk references & catch runtime errors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var reloadedKey = 'nnauto_chunk_reload_ts';
                  function safeSession() {
                    try { return window.sessionStorage; } catch (e) { return null; }
                  }
                  function shouldReload() {
                    var ss = safeSession();
                    if (!ss) return true;
                    var last = Number(ss.getItem(reloadedKey) || '0');
                    var now = Date.now();
                    if (now - last < 60000) return false;
                    ss.setItem(reloadedKey, String(now));
                    return true;
                  }
                  window.addEventListener('error', function (e) {
                    try {
                      var msg = (e && (e.message || (e.error && e.error.message))) || '';
                      var src = (e && (e.filename || (e.target && e.target.src))) || '';
                      var chunkLike = /ChunkLoadError|Loading chunk [^ ]+ failed|Loading CSS chunk [^ ]+ failed|Failed to fetch dynamically imported module|_next\\/static\\/chunks\\//i;
                      if (chunkLike.test(msg) || chunkLike.test(src)) {
                        if (shouldReload()) { window.location.reload(); }
                      }
                    } catch (err) {}
                  }, true);
                  window.addEventListener('unhandledrejection', function (e) {
                    try {
                      var reason = e && e.reason;
                      var msg = reason && (reason.message || String(reason));
                      if (!msg) return;
                      var chunkLike = /ChunkLoadError|Loading chunk [^ ]+ failed|Loading CSS chunk [^ ]+ failed|Failed to fetch dynamically imported module/i;
                      if (chunkLike.test(msg)) {
                        if (shouldReload()) { window.location.reload(); }
                      }
                    } catch (err) {}
                  });
                } catch (err) {}
              })();
            `,
          }}
        />
        <noscript>
          <div
            style={{
              minHeight: "60vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              textAlign: "center",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            Pro zobrazení NNAuto je potřeba zapnout JavaScript. Prosím povolte
            JavaScript ve vašem prohlížeči.
          </div>
        </noscript>
        {/* Mark hydration success so diagnostics can tell hydration never fired */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  setTimeout(function () {
                    if (window.__nn_diag && !window.__nn_mounted) {
                      window.__nn_diag('no-hydrate', { after: 7000 });
                    }
                  }, 7000);
                } catch (_) {}
              })();
            `,
          }}
        />
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
