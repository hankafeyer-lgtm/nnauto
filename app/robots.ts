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
  "/*.json$",
];

// Explicit allow list for SEO-important sections. Google ignores unknown
// directives; adding explicit allows keeps intent documented and removes any
// ambiguity with pattern-based disallows further down.
const PRIMARY_ALLOW = ["/", "/listings", "/listing/", "/auta/"];

const MAIN_BOT_DISALLOW = [
  "/api/",
  "/admin",
  "/admin/*",
  "/profile",
  "/settings",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Default policy for everyone. Crawl-delay is kept modest (not 1)
        // because Google/Bing ignore it and large values only hurt Seznam/Yandex.
        userAgent: "*",
        allow: PRIMARY_ALLOW,
        disallow: DISALLOW_COMMON,
      },
      {
        userAgent: "Googlebot",
        allow: PRIMARY_ALLOW,
        disallow: MAIN_BOT_DISALLOW,
      },
      {
        userAgent: "SeznamBot",
        allow: PRIMARY_ALLOW,
        disallow: MAIN_BOT_DISALLOW,
      },
      {
        userAgent: "Bingbot",
        allow: PRIMARY_ALLOW,
        disallow: MAIN_BOT_DISALLOW,
      },
      {
        userAgent: "Yandex",
        allow: PRIMARY_ALLOW,
        disallow: MAIN_BOT_DISALLOW,
      },
      { userAgent: "AhrefsBot", disallow: "/" },
      { userAgent: "SemrushBot", disallow: "/" },
      { userAgent: "MJ12bot", disallow: "/" },
      { userAgent: "DotBot", disallow: "/" },
      { userAgent: "PetalBot", disallow: "/" },
    ],
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
