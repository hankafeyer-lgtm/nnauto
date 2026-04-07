type StaticImageData = { src: string; height: number; width: number };

export function assetUrl(imported: string | StaticImageData): string {
  if (typeof imported === "string") return imported;
  if (imported && typeof imported === "object" && "src" in imported) return imported.src;
  return String(imported);
}
