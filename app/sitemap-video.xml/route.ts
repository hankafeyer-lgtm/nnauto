import { NextResponse } from "next/server";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildListingAbsoluteUrl } from "@lib/seo/listing-url";
import {
  listingVideoContentUrl,
  listingVideoDescription,
  listingVideoThumbnailUrl,
  listingVideoTitle,
  listingVideoUploadDate,
} from "@lib/seo/listing-video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Google video sitemap for active listings that include a self-hosted MP4.
 * @see https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 */
export async function GET() {
  const rows = await db
    .select({
      id: listings.id,
      brand: listings.brand,
      model: listings.model,
      year: listings.year,
      price: listings.price,
      mileage: listings.mileage,
      description: listings.description,
      photos: listings.photos,
      video: listings.video,
      createdAt: listings.createdAt,
      updatedAt: listings.updatedAt,
      isSold: listings.isSold,
      fuelType: listings.fuelType,
      transmission: listings.transmission,
      region: listings.region,
      condition: listings.condition,
      bodyType: listings.bodyType,
      title: listings.title,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        isNotNull(listings.video),
        ne(listings.video, ""),
        sql`length(trim(${listings.video})) > 0`,
      ),
    )
    .limit(5000);

  const entries: string[] = [];
  for (const row of rows) {
    const contentUrl = listingVideoContentUrl(row.video);
    if (!contentUrl) continue;
    const pageUrl = buildListingAbsoluteUrl(SITE_ORIGIN, {
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
    });
    const title = listingVideoTitle(row);
    const description = listingVideoDescription(row);
    const thumbnail = listingVideoThumbnailUrl(row);
    const pubDate = listingVideoUploadDate(row);

    entries.push(`  <url>
    <loc>${xmlEscape(pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${xmlEscape(thumbnail)}</video:thumbnail_loc>
      <video:title>${xmlEscape(title)}</video:title>
      <video:description>${xmlEscape(description)}</video:description>
      <video:content_loc>${xmlEscape(contentUrl)}</video:content_loc>
      <video:publication_date>${xmlEscape(pubDate)}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:live>no</video:live>
    </video:video>
  </url>`);
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${entries.join("\n")}
</urlset>
`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
