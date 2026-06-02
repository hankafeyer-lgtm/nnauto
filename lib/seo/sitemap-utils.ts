import type { MetadataRoute } from "next";

/** Drop duplicate URLs; keep the entry with the newest lastModified when both exist. */
export function dedupeSitemapEntries(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of entries) {
    const existing = byUrl.get(entry.url);
    if (!existing) {
      byUrl.set(entry.url, entry);
      continue;
    }
    const entryTime = entry.lastModified ? new Date(entry.lastModified).getTime() : 0;
    const existingTime = existing.lastModified
      ? new Date(existing.lastModified).getTime()
      : 0;
    if (entryTime >= existingTime) {
      byUrl.set(entry.url, entry);
    }
  }
  return Array.from(byUrl.values());
}
