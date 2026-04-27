type ListingUrlInput = {
  id: string;
  brand?: string | null;
  model?: string | null;
};

function normalizeSegment(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildListingPath(input: ListingUrlInput): string {
  const brand = normalizeSegment(input.brand);
  const model = normalizeSegment(input.model);
  if (!brand || !model || !input.id) {
    return `/listing/${input.id}`;
  }
  return `/auta/${brand}/${model}/${input.id}`;
}

export function buildListingAbsoluteUrl(input: ListingUrlInput): string {
  return `https://nnauto.cz${buildListingPath(input)}`;
}
