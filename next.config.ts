import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "bcrypt",
      "sharp",
      "pdfkit",
      "pg",
      "stripe",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.nnauto.cz" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@shared": require("path").resolve(__dirname, "shared"),
      "@assets": require("path").resolve(__dirname, "attached_assets"),
    };
    return config;
  },
};

export default nextConfig;
