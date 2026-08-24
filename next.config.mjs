import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "attached_assets");

const enableHsts = process.env.NN_AUTO_ENABLE_HSTS === "true";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self' https://www.facebook.com",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.googletagmanager.com https://www.google-analytics.com https://analytics.tiktok.com https://googleads.g.doubleclick.net https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: data:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://challenges.cloudflare.com https://*.cloudflare.com https://www.google-analytics.com https://*.google-analytics.com https://region1.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://www.googletagmanager.com https://*.googletagmanager.com https://www.google.com https://www.googleadservices.com https://stats.g.doubleclick.net https://googleads.g.doubleclick.net https://analytics.tiktok.com https://*.tiktok.com https://*.tiktokw.us https://*.tiktokcdn.com https://*.r2.cloudflarestorage.com https://api.stripe.com https://*.stripe.com https://connect.facebook.net https://www.facebook.com",
  "frame-src 'self' https://challenges.cloudflare.com https://js.stripe.com https://hooks.stripe.com https://www.google.com https://maps.google.com https://www.facebook.com",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    proxyClientMaxBodySize: "200mb",
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  poweredByHeader: false,
  compress: true,
  reactStrictMode: false,
  serverExternalPackages: [
    "bcrypt",
    "sharp",
    "pdfkit",
    "pg",
    "stripe",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.nnauto.cz" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev" },
    ],
    disableStaticImages: true,
  },
  rewrites: async () => ({
    beforeFiles: [
      // /skoda-octavia-prodej → /prodej/skoda-octavia (SEO alias)
      {
        source: "/:slug([a-z0-9-]+-prodej)",
        destination: "/prodej/:slug",
      },
    ],
    afterFiles: [],
    fallback: [],
  }),
  headers: async () => {
    const securityHeaders = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), interest-cohort=()",
      },
      { key: "Content-Security-Policy", value: csp },
    ];
    if (enableHsts) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      });
    }
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path(.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/hero-bg.:ext(webp|png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // HTML pages: never serve stale content to the browser. Next.js ISR
        // can still cache server-side, but the client must always revalidate
        // so deploys with new static chunks are picked up immediately.
        source: "/((?!_next/|api/|static/|assets/|brand-logos/|img/|objects/|hero-bg|favicon|logo-|apple-touch|site\\.webmanifest|robots|sitemap|feed\\.xml|.*\\..*$).*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "private, no-store, no-cache, must-revalidate, max-age=0",
          },
          { key: "Pragma", value: "no-cache" },
        ],
      },
    ];
  },
  turbopack: {
    resolveAlias: {
      "@shared": resolve(__dirname, "shared"),
      "@assets": assetsDir,
      "@lib": resolve(__dirname, "lib"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": resolve(__dirname, "shared"),
      "@assets": assetsDir,
      "@lib": resolve(__dirname, "lib"),
    };

    config.module.rules.push({
      test: /\.(png|jpe?g|gif|webp|avif|svg|ico)$/i,
      type: "asset/resource",
      generator: {
        filename: "static/media/[name].[hash:8][ext]",
      },
    });

    return config;
  },
};

export default nextConfig;
