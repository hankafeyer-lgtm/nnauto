/** Infer video MIME from magic bytes when mobile/desktop sends octet-stream. */

export function inferVideoContentTypeFromBuffer(
  buffer: Buffer,
  hintedType?: string,
): string {
  const hinted = (hintedType || "").trim().toLowerCase();
  if (hinted.startsWith("video/") && hinted !== "application/octet-stream") {
    return hinted;
  }

  if (buffer.length >= 12) {
    const box = buffer.toString("ascii", 4, 8);
    if (box === "ftyp") {
      const brand = buffer.toString("ascii", 8, 12);
      if (brand === "qt  ") return "video/quicktime";
      return "video/mp4";
    }
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return "video/webm";
    }
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer.length >= 11 &&
      buffer.toString("ascii", 8, 11) === "AVI"
    ) {
      return "video/x-msvideo";
    }
  }

  return "video/mp4";
}

export function isRecognizedVideoBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  const box = buffer.toString("ascii", 4, 8);
  if (box === "ftyp") return true;
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return true;
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46
  ) {
    return true;
  }
  return false;
}
