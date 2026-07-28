import { SITE_ORIGIN } from "./constants";
import { buildListingAbsoluteUrl } from "./listing-url";
import {
  buildListingH1,
  buildListingSeoDescription,
  type ListingSeoInput,
} from "./listing-meta";

export type ListingVideoInput = ListingSeoInput & {
  video?: string | null;
  photos?: string[] | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  isSold?: boolean | null;
  id: string;
  brand: string;
  model: string;
  year?: number | null;
};

/** Normalize DB video key to a public absolute MP4 URL. */
export function listingVideoContentUrl(
  video: string | null | undefined,
): string | null {
  if (!video || typeof video !== "string") return null;
  const key = video.trim().replace(/^\/+/, "");
  if (!key) return null;
  if (/^https?:\/\//i.test(key)) return key;
  const path = key.startsWith("objects/") ? key : `objects/${key}`;
  return `${SITE_ORIGIN}/${path}`;
}

export function listingHasIndexableVideo(
  listing: Pick<ListingVideoInput, "video" | "isSold">,
): boolean {
  if (listing.isSold) return false;
  return Boolean(listingVideoContentUrl(listing.video));
}

export function listingVideoThumbnailUrl(
  listing: Pick<ListingVideoInput, "photos">,
): string {
  const photo = Array.isArray(listing.photos)
    ? listing.photos.find((p) => typeof p === "string" && p.trim())
    : null;
  if (photo) {
    const path = String(photo).replace(/^\/+/, "");
    return `${SITE_ORIGIN}/img/${path}?w=1280&q=80&f=webp`;
  }
  return `${SITE_ORIGIN}/og-image.png`;
}

export function listingVideoTitle(listing: ListingVideoInput): string {
  return `Video – ${buildListingH1(listing)}`;
}

export function listingVideoDescription(listing: ListingVideoInput): string {
  const desc = buildListingSeoDescription(listing);
  return desc.length > 2000 ? `${desc.slice(0, 1997)}…` : desc;
}

export function listingVideoPageUrl(listing: ListingVideoInput): string {
  return buildListingAbsoluteUrl(SITE_ORIGIN, {
    id: listing.id,
    brand: listing.brand,
    model: listing.model,
    year: listing.year,
  });
}

export function listingVideoUploadDate(listing: ListingVideoInput): string {
  const raw = listing.createdAt || listing.updatedAt;
  if (!raw) return new Date().toISOString();
  const d = raw instanceof Date ? raw : new Date(raw);
  return Number.isFinite(d.getTime()) ? d.toISOString() : new Date().toISOString();
}
