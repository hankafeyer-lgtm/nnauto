import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import WebVitalsReporter from "@/components/WebVitalsReporter";
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

/** Seznam Webmaster domain verification (reporter.seznam.cz). */
const SEZNAM_WMT_VERIFICATION =
  process.env.SEZNAM_WMT_VERIFICATION ?? "5DIH0UhkjhdZ3TA11ic0kBordkvfjcpH";

/** Meta (Facebook) Pixel — also used in noscript fallback img. */
const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1382087426626332";

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
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
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
    // Optional Google Search Console verification — set GOOGLE_SITE_VERIFICATION
    // env var on the server (Hetzner) once a token is generated in GSC.
    // When unset, no Google verification meta tag is emitted.
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: { "seznam-wmt": SEZNAM_WMT_VERIFICATION },
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
        <meta name="seznam-wmt" content={SEZNAM_WMT_VERIFICATION} />
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
        <Script
          id="cf-turnstile-api"
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
        <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://connect.facebook.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://analytics.tiktok.com" crossOrigin="anonymous" />
        <link
          rel="preload"
          as="image"
          href="/hero-bg.webp"
          type="image/webp"
          imageSrcSet="/hero-bg.webp"
        />
      </head>
      <body className={`${poppins.className} font-sans antialiased bg-background text-foreground`}>
        {/* Meta Pixel noscript fallback (PageView). ViewContent fires on listing pages via trackViewContent(). */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
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
        {/* Cookie-consent bootstrap + Google Consent Mode defaults.
            GA can still receive cookieless page_view hits before accept.
            Marketing pixels wait for explicit marketing consent. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var raw = null;
                  try { raw = localStorage.getItem('nn_cookie_consent_v1'); } catch (e) {}
                  window.__nnConsent = raw ? JSON.parse(raw) : null;
                } catch (e) { window.__nnConsent = null; }
                window.__nnRunWhenConsent = function (cat, fn) {
                  function granted() { var c = window.__nnConsent; return !!(c && c[cat]); }
                  if (granted()) { try { fn(); } catch (e) {} return; }
                  var handler = function () {
                    if (granted()) {
                      try { fn(); } catch (e) {}
                      window.removeEventListener('nn-consent-changed', handler);
                    }
                  };
                  window.addEventListener('nn-consent-changed', handler);
                };
                window.dataLayer = window.dataLayer || [];
                function gtag(){ dataLayer.push(arguments); }
                window.gtag = gtag;
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  wait_for_update: 1500
                });
                window.addEventListener('nn-consent-changed', function () {
                  try {
                    var c = window.__nnConsent || {};
                    gtag('consent', 'update', {
                      analytics_storage: c.analytics ? 'granted' : 'denied',
                      ad_storage: c.marketing ? 'granted' : 'denied',
                      ad_user_data: c.marketing ? 'granted' : 'denied',
                      ad_personalization: c.marketing ? 'granted' : 'denied'
                    });
                  } catch (e) {}
                });
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
        {/* Browser-translation crash guard. Google Translate / Yandex / in-app
            browser translators swap React-managed text nodes for their own,
            which later makes React call removeChild/insertBefore on a node that
            no longer lives where it expects -> uncaught NotFoundError that
            crashes the whole route into the error screen on every render.
            Patching these two DOM methods to no-op when the parent no longer
            matches keeps the app alive while still allowing translation.
            Must run before hydration, so it sits inline ahead of {children}. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  if (typeof Node !== 'function' || !Node.prototype) return;
                  if (window.__nn_dom_translate_guard) return;
                  window.__nn_dom_translate_guard = true;
                  var origRemoveChild = Node.prototype.removeChild;
                  Node.prototype.removeChild = function (child) {
                    if (child && child.parentNode !== this) {
                      return child;
                    }
                    return origRemoveChild.apply(this, arguments);
                  };
                  var origInsertBefore = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function (newNode, referenceNode) {
                    if (referenceNode && referenceNode.parentNode !== this) {
                      return origInsertBefore.call(this, newNode, null);
                    }
                    return origInsertBefore.apply(this, arguments);
                  };
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
        <WebVitalsReporter />
        {children}
        {/* Landing attribution capture — runs as the very first analytics step
            so UTM/click-id parameters are persisted before any history.replaceState
            in the SPA layer can strip them from the URL. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var KEY = 'nn_utm_v1';
                  var REF_KEY = 'nn_landing_referrer_v1';
                  var KEYS = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','utm_id','gclid','fbclid','ttclid','msclkid','wbraid','gbraid','igshid'];
                  var search = window.location.search || '';
                  var found = {};
                  if (search) {
                    var sp = new URLSearchParams(search);
                    for (var i = 0; i < KEYS.length; i++) {
                      var v = sp.get(KEYS[i]);
                      if (v) found[KEYS[i]] = v;
                    }
                  }
                  if (Object.keys(found).length > 0) {
                    var merged = {};
                    try {
                      var prev = sessionStorage.getItem(KEY);
                      if (prev) {
                        var prevSp = new URLSearchParams(prev);
                        prevSp.forEach(function (val, key) { merged[key] = val; });
                      }
                    } catch (e) {}
                    for (var k in found) merged[k] = found[k];
                    var enc = new URLSearchParams(merged).toString();
                    try { sessionStorage.setItem(KEY, enc); } catch (e) {}
                    window.__nn_utm = enc;
                  } else {
                    try {
                      var stored = sessionStorage.getItem(KEY);
                      if (stored) window.__nn_utm = stored;
                    } catch (e) {}
                  }
                  if (document.referrer) {
                    try {
                      var refHost = new URL(document.referrer).host;
                      if (refHost && refHost !== window.location.host) {
                        try {
                          if (!sessionStorage.getItem(REF_KEY)) {
                            sessionStorage.setItem(REF_KEY, document.referrer);
                          }
                        } catch (e) {}
                        window.__nn_landing_referrer = document.referrer;
                      }
                    } catch (e) {}
                  } else {
                    try {
                      var prevRef = sessionStorage.getItem(REF_KEY);
                      if (prevRef) window.__nn_landing_referrer = prevRef;
                    } catch (e) {}
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Google Analytics 4 + Google Ads — always load (Consent Mode).
            Cookieless page_view is sent for every visit; cookies unlock after accept. */}
        <Script id="ga-init" strategy="afterInteractive">
          {`
            (function () {
              var s = document.createElement('script');
              s.async = true;
              s.src = 'https://www.googletagmanager.com/gtag/js?id=G-1VPRCXDLKP';
              document.head.appendChild(s);
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              window.gtag = window.gtag || gtag;
              var c = window.__nnConsent;
              if (c) {
                gtag('consent', 'update', {
                  analytics_storage: c.analytics ? 'granted' : 'denied',
                  ad_storage: c.marketing ? 'granted' : 'denied',
                  ad_user_data: c.marketing ? 'granted' : 'denied',
                  ad_personalization: c.marketing ? 'granted' : 'denied'
                });
              }
              gtag('js', new Date());
              gtag('config', 'G-1VPRCXDLKP', { send_page_view: false, anonymize_ip: true });
              gtag('config', 'AW-17794544456');
              gtag('config', 'AW-17768541644');
              function attributedPath() {
                var path = window.location.pathname + window.location.search;
                try {
                  var utm = window.__nn_utm || '';
                  if (!utm) return path;
                  var parts = path.split('?');
                  var params = new URLSearchParams(parts[1] || '');
                  var utmParams = new URLSearchParams(utm);
                  utmParams.forEach(function (v, k) { if (!params.has(k)) params.set(k, v); });
                  var qs = params.toString();
                  return qs ? parts[0] + '?' + qs : parts[0];
                } catch (e) { return path; }
              }
              var pagePath = attributedPath();
              var pageLocation = window.location.origin + pagePath;
              var now = Date.now();
              if (window.__nnLastGaPageViewKey !== pagePath || now - (window.__nnLastGaPageViewAt || 0) >= 2000) {
                window.__nnLastGaPageViewKey = pagePath;
                window.__nnLastGaPageViewAt = now;
                gtag('event', 'page_view', {
                  page_path: pagePath,
                  page_location: pageLocation,
                  page_title: document.title
                });
              }
            })();
          `}
        </Script>
        {/* Meta Pixel — afterInteractive so paid landings are not lost to lazy load. */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            (window.__nnRunWhenConsent || function(c,f){f();})('marketing', function () {
              !function(f,b,e,v,n,t,s){
                if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            });
          `}
        </Script>
        {/* TikTok Pixel — afterInteractive + marketing consent. */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            (window.__nnRunWhenConsent || function(c,f){f();})('marketing', function () {
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
            });
          `}
        </Script>
      </body>
    </html>
  );
}
