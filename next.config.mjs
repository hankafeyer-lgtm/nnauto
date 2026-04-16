import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "attached_assets");

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  headers: async () => [
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
  ],
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
