export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
}

/** Public R2 bucket URL for listing photos (`uploads/…` keys). */
export const LISTING_PHOTO_PUBLIC_BASE_URL =
  "https://pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev";

/**
 * Full image URL for <img src>. Absolute http(s) unchanged; `uploads/…` (optionally
 * prefixed with `/objects/`) → public R2 URL; other paths (e.g. bundled PNGs) unchanged.
 */
export function resolveListingPhotoUrl(photo: string): string {
  const raw = photo.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;

  let key = raw;
  if (key.startsWith("/objects/")) key = key.slice("/objects/".length);
  key = key.replace(/^\/+/, "");

  if (key.startsWith("uploads/")) {
    const base = LISTING_PHOTO_PUBLIC_BASE_URL.replace(/\/$/, "");
    return `${base}/${key}`;
  }

  return raw;
}

function normalizePath(originalPath: string): string {
  let p = originalPath;
  if (p.startsWith("/objects/")) p = p.slice("/objects/".length);
  return p.replace(/^\/+/, "");
}

export function getOptimizedImageUrl(
  originalPath: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!originalPath) return "";

  const trimmed = originalPath.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cdnUrl = resolveListingPhotoUrl(originalPath);
  if (/^https?:\/\//i.test(cdnUrl)) return cdnUrl;

  const { width, quality = 70, format = "webp" } = options;
  const path = normalizePath(originalPath);

  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  params.set("q", quality.toString());
  params.set("f", format);

  return `/img/${path}?${params.toString()}`;
}

export function getCardSrcSet(photoPath: string): string {
  const trimmed = photoPath.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return `${trimmed} 320w, ${trimmed} 480w`;
  }
  const cdn = resolveListingPhotoUrl(photoPath);
  if (/^https?:\/\//i.test(cdn)) {
    return `${cdn} 320w, ${cdn} 480w`;
  }
  const widths = [320, 480];
  return widths
    .map(
      (w) =>
        `${getOptimizedImageUrl(photoPath, { width: w, quality: 60, format: "webp" })} ${w}w`,
    )
    .join(", ");
}

export function getCardImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 400, quality: 60 });
}

export function getThumbnailUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 64, quality: 50 });
}

export function getFullImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 960, quality: 76 });
}

export function getLightboxImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1280, quality: 80 });
}

export function getCdnImageUrl(photoPath: string): string {
  if (!photoPath) return "";
  return resolveListingPhotoUrl(photoPath);
}
