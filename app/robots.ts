import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin", "/profile", "/settings", "/cebia/return"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin", "/profile", "/settings"],
      },
      {
        userAgent: "SeznamBot",
        allow: "/",
        disallow: ["/api/", "/admin", "/profile", "/settings"],
      },
    ],
    sitemap: "https://nnauto.cz/sitemap.xml",
  };
}
