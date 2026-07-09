/**
 * Small Czech-language formatting helpers for SEO titles/descriptions.
 *
 * Czech uses three plural forms:
 *   1        → singular            ("1 inzerát")
 *   2–4      → paucal / few        ("3 inzeráty")
 *   0, 5+    → genitive plural     ("7 inzerátů")
 */

export function czPlural(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}

/** "inzerát" / "inzeráty" / "inzerátů" */
export function inzeratWord(n: number): string {
  return czPlural(n, "inzerát", "inzeráty", "inzerátů");
}

/** "vůz" / "vozy" / "vozů" */
export function vozWord(n: number): string {
  return czPlural(n, "vůz", "vozy", "vozů");
}

/** Format an integer price as Czech koruna, e.g. 89000 → "89 000 Kč". */
export function formatCzk(n: number): string {
  return `${Math.round(n).toLocaleString("cs-CZ")} Kč`;
}
