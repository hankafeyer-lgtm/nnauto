export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
}

/** Public R2 bucket URL for listing photos (`uploads/…` keys). */
export const LISTING_PHOTO_PUBLIC_BASE_URL =
  "https://pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev";

/**
 * Bumped whenever the server-side `/img/` pipeline output changes
 * (e.g. watermark style or version). The value is appended as `&v=...`
 * to every optimized image URL so browsers and the CDN drop their
 * `immutable` cached copies and refetch a fresh render.
 *
 * Keep in sync with `WATERMARK_VERSION` in `app/img/[...path]/route.ts`.
 */
export const IMAGE_PIPELINE_VERSION = "wm4";

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

  let key = trimmed;
  if (/^https?:\/\//i.test(key)) {
    try {
      const u = new URL(key);
      if (u.hostname.includes("r2.dev")) {
        key = u.pathname.replace(/^\/+/, "");
      } else {
        return key;
      }
    } catch {
      return key;
    }
  }

  key = normalizePath(key);
  if (!key) return trimmed;

  const { width, quality = 70, format = "webp" } = options;
  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  params.set("q", quality.toString());
  params.set("f", format);
  // Cache-bust whenever the server-side watermark/transform pipeline
  // changes. The /img/ route ignores unknown params, so this only varies
  // the URL — forcing browsers and the CDN to refetch the latest bake
  // instead of serving stale immutable copies.
  params.set("v", IMAGE_PIPELINE_VERSION);

  return `/img/${key}?${params.toString()}`;
}

export function getCardSrcSet(photoPath: string): string {
  // Mobile cards render close to full viewport width, so include a sharper
  // retina candidate without changing the card layout.
  const widths = [480, 640, 768];
  return widths
    .map(
      (w) =>
        `${getOptimizedImageUrl(photoPath, { width: w, quality: 66, format: "webp" })} ${w}w`,
    )
    .join(", ");
}

export function getCardImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 480, quality: 66 });
}

export function getThumbnailUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 64, quality: 50 });
}

/** Same as desktop carousel / lightbox-instant — keep one cache key. */
export function getFullImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, {
    width: 1120,
    quality: 84,
    format: "webp",
  });
}

export function getLightboxImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1280, quality: 80 });
}

/**
 * Same dimensions as the listing detail carousel — almost always already
 * in the browser cache when the user opens the fullscreen lightbox.
 */
export function getLightboxInstantUrl(
  photoPath: string,
  isDesktop: boolean,
): string {
  return getOptimizedImageUrl(photoPath, {
    width: isDesktop ? 1120 : 560,
    quality: isDesktop ? 84 : 78,
    format: "webp",
  });
}

export function getCdnImageUrl(photoPath: string): string {
  if (!photoPath) return "";
  return resolveListingPhotoUrl(photoPath);
}
