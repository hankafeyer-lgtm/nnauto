import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
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
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@lib": path.resolve(__dirname, "lib"),
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@lib": path.resolve(__dirname, "lib"),
    };
    return config;
  },
};

export default nextConfig;
