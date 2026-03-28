export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
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

  const { width, quality = 70, format = "webp" } = options;
  const path = normalizePath(originalPath);

  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  params.set("q", quality.toString());
  params.set("f", format);

  return `/img/${path}?${params.toString()}`;
}

export function getCardSrcSet(photoPath: string): string {
  const widths = [320, 480, 640];
  return widths
    .map(
      (w) =>
        `${getOptimizedImageUrl(photoPath, { width: w, quality: 68, format: "webp" })} ${w}w`,
    )
    .join(", ");
}

export function getCardImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 400, quality: 68 });
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
  return `https://pub-d325306cbf594d02a62f39fb6a92a0fd.r2.dev/${normalizePath(photoPath)}`;
}
