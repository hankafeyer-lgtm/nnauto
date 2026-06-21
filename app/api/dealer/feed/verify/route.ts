import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { fetchFeed, buildPreview } from "@lib/feed/syncFeed";

function mapAuthError(e: unknown) {
  const msg = e instanceof Error ? e.message : "Server error";
  if (msg === "Unauthorized") return error("Unauthorized", 401);
  if (msg === "Forbidden") return error("Forbidden", 403);
  return error(msg, 500);
}

// POST — fetch + parse the feed and return a preview (counts, coverage,
// sample). No data is written to the database.
export async function POST(req: NextRequest) {
  try {
    await requireDealer();

    const body = await req.json().catch(() => ({}));
    const feedUrl = typeof body.feedUrl === "string" ? body.feedUrl.trim() : "";
    if (!feedUrl) return error("Zadejte URL feedu / Вкажіть URL фіду", 400);

    let xml: string;
    try {
      xml = await fetchFeed(feedUrl);
    } catch (e) {
      return error(e instanceof Error ? e.message : "Feed fetch failed", 422);
    }

    let preview;
    try {
      preview = buildPreview(xml);
    } catch (e) {
      return error(e instanceof Error ? e.message : "Parse failed", 422);
    }

    return json({ preview });
  } catch (e) {
    return mapAuthError(e);
  }
}
