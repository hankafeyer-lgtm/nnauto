/** Never throw — malformed % sequences in URL segments must not 500 the page. */
export function safeDecodeURIComponent(value: string): string {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
