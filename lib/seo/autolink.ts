/**
 * Replace brand/model names in article HTML with links to their SEO landing pages.
 * Uses a simple string replacement approach; processes longest matches first.
 */
export function autolinkBrandModel(
  html: string,
  brandModels: { brandName: string; brandSlug: string; modelName?: string; modelSlug?: string }[],
): string {
  const sorted = [...brandModels].sort(
    (a, b) =>
      (b.brandName.length + (b.modelName?.length ?? 0)) -
      (a.brandName.length + (a.modelName?.length ?? 0)),
  );

  let result = html;
  const replacedRanges: [number, number][] = [];

  for (const entry of sorted) {
    const { brandName, brandSlug, modelName, modelSlug } = entry;

    if (modelName && modelSlug) {
      const fullName = `${brandName} ${modelName}`;
      const pattern = new RegExp(`(?<![">])\\b(${escapeRegex(fullName)})\\b(?![<"])`, "gi");
      result = replaceNonOverlapping(result, pattern, (match) => {
        const href = `/brand/${brandSlug}/${modelSlug}`;
        return `<a href="${href}" class="text-primary hover:underline">${match}</a>`;
      }, replacedRanges);
    } else {
      const pattern = new RegExp(`(?<![">])\\b(${escapeRegex(brandName)})\\b(?![<"])`, "gi");
      result = replaceNonOverlapping(result, pattern, (match) => {
        const href = `/brand/${brandSlug}`;
        return `<a href="${href}" class="text-primary hover:underline">${match}</a>`;
      }, replacedRanges);
    }
  }

  return result;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceNonOverlapping(
  text: string,
  pattern: RegExp,
  replacer: (match: string) => string,
  ranges: [number, number][],
): string {
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const start = match.index;
    const end = start + match[0].length;
    if (ranges.some(([rs, re]) => start < re && end > rs)) continue;

    result += text.slice(lastIndex, start);
    const replacement = replacer(match[0]);
    result += replacement;
    ranges.push([start, start + replacement.length]);
    lastIndex = end;
  }

  result += text.slice(lastIndex);
  return result;
}
