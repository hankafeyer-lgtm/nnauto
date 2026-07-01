/**
 * Sanitize JSON-LD payloads: remove null, undefined, empty strings,
 * empty arrays and empty nested objects.
 */
export function sanitizeJsonLd<T>(value: T): T {
  if (value === null || value === undefined) {
    return undefined as T;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return (trimmed ? trimmed : undefined) as T;
  }

  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => sanitizeJsonLd(item))
      .filter(
        (item) =>
          item !== undefined &&
          item !== null &&
          !(typeof item === "string" && !item.trim()) &&
          !(Array.isArray(item) && item.length === 0) &&
          !(
            typeof item === "object" &&
            item !== null &&
            !Array.isArray(item) &&
            Object.keys(item as object).length === 0
          ),
      );
    return (cleaned.length ? cleaned : undefined) as T;
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const cleaned = sanitizeJsonLd(nested);
      if (cleaned === undefined || cleaned === null) continue;
      if (typeof cleaned === "string" && !cleaned.trim()) continue;
      if (Array.isArray(cleaned) && cleaned.length === 0) continue;
      if (
        typeof cleaned === "object" &&
        !Array.isArray(cleaned) &&
        Object.keys(cleaned as object).length === 0
      ) {
        continue;
      }
      out[key] = cleaned;
    }
    return (Object.keys(out).length ? out : undefined) as T;
  }

  return value;
}

export function toJsonLdScript(data: unknown): string {
  return JSON.stringify(sanitizeJsonLd(data)).replace(/</g, "\\u003c");
}
