export interface ImageOptimizationOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpeg";
}
export function getCardSrcSet(photoPath: string): string {
  const widths = [360, 640, 960, 1280];
  return widths
    .map(
      (w) =>
        `${getOptimizedImageUrl(photoPath, { width: w, quality: 56, format: "webp" })} ${w}w`,
    )
    .join(", ");
}
export function getOptimizedImageUrl(
  originalPath: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!originalPath) return "";

  const { width, quality = 64, format = "webp" } = options;

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
  return getOptimizedImageUrl(photoPath, { width: 320, quality: 52 });
}

export function getThumbnailUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 100, quality: 60 });
}

export function getFullImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1120, quality: 66 });
}

export function getLightboxImageUrl(photoPath: string): string {
  return getOptimizedImageUrl(photoPath, { width: 1280, quality: 68 });
}
