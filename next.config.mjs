import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, "attached_assets");

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
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
    ],
    disableStaticImages: true,
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
