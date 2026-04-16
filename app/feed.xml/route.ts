import { NextResponse } from "next/server";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { getRecentActiveListings } from "@lib/seo/recent-listings";

export const revalidate = 300;

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(d: Date) {
  return d.toUTCString();
}

export async function GET() {
  const rows = await getRecentActiveListings(60);
  const channelTitle = "NNAuto — aktuální inzeráty";
  const channelLink = `${SITE_ORIGIN}/listings`;
  const items = rows
    .map((row) => {
      const link = `${SITE_ORIGIN}/listing/${row.id}`;
      const title = escapeXml(row.title || `${row.brand} ${row.model}`.trim());
      const when = row.updatedAt ?? row.createdAt ?? new Date();
      return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(new Date(when))}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>${escapeXml("Nejnovější nabídka vozidel na NNAuto.")}</description>
    <language>cs</language>
    <atom:link href="${SITE_ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${rfc822(new Date())}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
