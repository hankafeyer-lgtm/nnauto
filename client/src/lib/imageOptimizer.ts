export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
}
export function getCardSrcSet(photoPath: string): string {
  const widths = [480, 768, 1024, 1280, 1600];
  return widths
    .map(
      (w) =>
        `${getOptimizedImageUrl(photoPath, { width: w, quality: 80, format: "webp" })} ${w}w`,
    )
    .join(", ");
}
export function getOptimizedImageUrl(
  originalPath: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!originalPath) return "";

  const { width, quality = 80, format = "webp" } = options;

  let path = originalPath;
  if (path.startsWith("/objects/")) {
    path = path.slice("/objects/".length);
  }
  path = path.replace(/^\/+/, "");

  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  params.set("q", quality.toString());
  params.set("f", format);

  return `/img/${path}?${params.toString()}`;
}

export function getCardImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 400, quality: 75 });
}

export function getThumbnailUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 100, quality: 60 });
}

export function getFullImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1200, quality: 85 });
}

export function getLightboxImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1920, quality: 90 });
}
