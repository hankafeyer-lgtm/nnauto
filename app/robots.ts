import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/brand/", "/blog/", "/listings", "/listing/"],
        disallow: [
          "/api/",
          "/admin",
          "/profile",
          "/settings",
          "/cebia/return",
          "/dealer",
          "/my-listings",
          "/add-listing",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/brand/", "/blog/", "/listings", "/listing/"],
        disallow: ["/api/", "/admin", "/profile", "/settings", "/dealer"],
      },
      {
        userAgent: "SeznamBot",
        allow: ["/", "/brand/", "/blog/", "/listings", "/listing/"],
        disallow: ["/api/", "/admin", "/profile", "/settings", "/dealer"],
      },
    ],
    sitemap: "https://nnauto.cz/sitemap.xml",
  };
}
