import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@lib/seo/constants";

const DISALLOW_COMMON = [
  "/api/",
  "/admin",
  "/admin/*",
  "/profile",
  "/settings",
  "/dealer",
  "/add-listing",
  "/cebia/",
  "/uk",
  "/uk/",
  "/en",
  "/en/",
  "/de",
  "/de/",
  "/listings/osobni/",
  "/listings/audi",
  "/listings/bmw",
  "/*.json$",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW_COMMON,
        crawlDelay: 1,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/*", "/profile", "/settings"],
      },
      {
        userAgent: "SeznamBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/*", "/profile", "/settings"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/*", "/profile", "/settings"],
      },
      {
        userAgent: "Yandex",
        allow: "/",
        disallow: ["/api/", "/admin", "/admin/*", "/profile", "/settings"],
      },
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
