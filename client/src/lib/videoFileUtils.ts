/** Cross-device video detection (iPhone MOV, Android MP4, desktop WebM, etc.) */

const VIDEO_EXT = /\.(mp4|m4v|mov|webm|mkv|avi|3gp|3g2|ogv|mpeg|mpg)$/i;

const KNOWN_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
  "video/3gpp",
  "video/3gpp2",
  "video/x-msvideo",
  "video/mpeg",
  "video/ogg",
  "video/x-matroska",
]);

const GENERIC_BINARY_TYPES = new Set([
  "application/octet-stream",
  "binary/octet-stream",
  "",
]);

export const LISTING_VIDEO_ACCEPT =
  "video/*,.mp4,.mov,.webm,.m4v,.mkv,.avi,.3gp,.mpeg,.mpg";

export function isVideoFile(file: File): boolean {
  const type = (file.type || "").toLowerCase().trim();

  if (type && (KNOWN_VIDEO_MIMES.has(type) || type.startsWith("video/"))) {
    return true;
  }

  if (GENERIC_BINARY_TYPES.has(type)) {
    if (VIDEO_EXT.test(file.name)) return true;
    if (!file.name || /^video$/i.test(file.name) || /^blob$/i.test(file.name)) {
      return true;
    }
  }

  return false;
}

export function inferVideoContentType(file: File): string {
  const type = (file.type || "").toLowerCase().trim();
  if (type.startsWith("video/")) {
    if (type === "video/quicktime") return "video/quicktime";
    return type;
  }

  const name = file.name.toLowerCase();
  if (/\.mov$/.test(name)) return "video/quicktime";
  if (/\.(mp4|m4v)$/.test(name)) return "video/mp4";
  if (/\.webm$/.test(name)) return "video/webm";
  if (/\.(3gp|3g2)$/.test(name)) return "video/3gpp";
  if (/\.(avi)$/.test(name)) return "video/x-msvideo";
  if (/\.mkv$/.test(name)) return "video/x-matroska";
  if (/\.(mpeg|mpg)$/.test(name)) return "video/mpeg";

  return "video/mp4";
}
