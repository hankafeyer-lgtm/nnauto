import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

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
  },
  turbopack: {
    resolveAlias: {
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
      "@lib": resolve(__dirname, "lib"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": resolve(__dirname, "shared"),
      "@assets": resolve(__dirname, "attached_assets"),
      "@lib": resolve(__dirname, "lib"),
    };
    return config;
  },
};

export default nextConfig;
