/** Mobile-friendly image detection (iOS HEIC, Android octet-stream, Samsung gallery, etc.) */

const IMAGE_EXT =
  /\.(jpe?g|jfif|png|gif|webp|heic|heif|bmp|avif|tiff?|dng)$/i;

const KNOWN_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/x-png",
  "image/gif",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
  "image/bmp",
  "image/x-ms-bmp",
  "image/tiff",
  "image/avif",
  "image/x-adobe-dng",
]);

const GENERIC_BINARY_TYPES = new Set([
  "application/octet-stream",
  "binary/octet-stream",
  "",
]);

/** File input `accept` — broad enough for iOS/Android gallery and camera. */
export const LISTING_PHOTO_ACCEPT =
  "image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.tif,.tiff";

export function isImageFile(file: File): boolean {
  const type = (file.type || "").toLowerCase().trim();

  if (type && (KNOWN_IMAGE_MIMES.has(type) || type.startsWith("image/"))) {
    return true;
  }

  if (GENERIC_BINARY_TYPES.has(type)) {
    if (IMAGE_EXT.test(file.name)) return true;
    // Gallery pickers on some Android builds send unnamed octet-stream blobs.
    if (!file.name || /^image$/i.test(file.name) || /^blob$/i.test(file.name)) {
      return true;
    }
  }

  return false;
}

export function inferImageContentType(file: File): string {
  const type = (file.type || "").toLowerCase().trim();
  if (type.startsWith("image/")) {
    if (type === "image/jpg" || type === "image/pjpeg") return "image/jpeg";
    if (type === "image/x-png") return "image/png";
    if (type === "image/heif" || type === "image/heif-sequence") return "image/heic";
    if (type === "image/x-ms-bmp") return "image/bmp";
    return type;
  }

  const name = file.name.toLowerCase();
  if (/\.(jpe?g|jfif)$/.test(name)) return "image/jpeg";
  if (/\.png$/.test(name)) return "image/png";
  if (/\.webp$/.test(name)) return "image/webp";
  if (/\.gif$/.test(name)) return "image/gif";
  if (/\.(heic|heif)$/.test(name)) return "image/heic";
  if (/\.(tiff?)$/.test(name)) return "image/tiff";
  if (/\.avif$/.test(name)) return "image/avif";
  if (/\.bmp$/.test(name)) return "image/bmp";

  return "image/jpeg";
}
