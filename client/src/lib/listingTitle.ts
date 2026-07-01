function capitalizeFirstLetter(value: string): string {
  if (!value) return "";
  return value[0].toLocaleUpperCase() + value.slice(1);
}

function formatBrand(brandRaw: string): string {
  const brand = String(brandRaw ?? "").trim();
  if (!brand) return "";

  // Preserve already-uppercase brands (e.g. BMW, GMC)
  if (brand === brand.toUpperCase()) return brand;

  // If it looks like an acronym (short, alnum, lowercase), uppercase it.
  const alnum = brand.replace(/[^0-9a-z]/gi, "");
  if (brand === brand.toLowerCase() && alnum && alnum.length <= 3) {
    return brand.toUpperCase();
  }

  // Otherwise title-case per word (handles "škoda" -> "Škoda")
  return brand
    .split(/\s+/g)
    .map((w) => {
      const word = w.trim();
      if (!word) return "";
      if (word !== word.toLowerCase()) return word; // already has caps
      return capitalizeFirstLetter(word.toLocaleLowerCase());
    })
    .filter(Boolean)
    .join(" ");
}

function formatModel(modelRaw: string): string {
  const model = String(modelRaw ?? "").trim();
  if (!model) return "";

  return model
    .split(/\s+/g)
    .map((token) => {
      const t = token.trim();
      if (!t) return "";

      // Keep existing casing if user entered it intentionally.
      if (t !== t.toLowerCase()) return t;

      // Handle hyphenated tokens like "m-sport"
      return t
        .split("-")
        .map((part) => {
          const p = part.trim();
          if (!p) return "";
          if (p !== p.toLowerCase()) return p;
          return capitalizeFirstLetter(p);
        })
        .filter(Boolean)
        .join("-");
    })
    .filter(Boolean)
    .join(" ");
}

export function getListingMainTitle(listing: {
  brand?: string | null;
  model?: string | null;
  year?: number | string | null;
  trim?: string | null;
  engineVolume?: string | number | null;
  title?: string | null;
}): string {
  const brand = formatBrand(String(listing?.brand ?? ""));
  const model = formatModel(String(listing?.model ?? ""));
  const trim = String(listing?.trim ?? "").trim();
  const engine = listing?.engineVolume
    ? `${listing.engineVolume}`.replace(/\.0$/, "")
    : "";
  const detail = trim || (engine ? `${engine} l` : "");
  const year = listing?.year ? String(listing.year) : "";
  const parts = [brand, model, detail, year].filter(Boolean);
  if (parts.length) return parts.join(" ").trim();
  return String(listing?.title ?? "").trim();
}

