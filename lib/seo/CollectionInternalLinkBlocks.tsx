import JsonLd from "@lib/seo/JsonLd";
import { buildListingCarJsonLd } from "@lib/seo/structured-data";
import { buildListingUrl } from "@lib/seo/listing-url";
import {
  formatBrandDisplay,
  formatModelDisplay,
  formatVehicleCardHeading,
} from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";

export type CollectionLink = { label: string; href: string };

export type CollectionLinkRow = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: string | number | null;
  mileage: number | null;
  region: string | null;
  fuelType?: string[] | null;
  transmission?: string[] | null;
  bodyType?: string | null;
  driveType?: string[] | null;
  photos?: string[] | null;
  isSold?: boolean;
};

function uniqueByHref(links: CollectionLink[], limit: number) {
  const seen = new Set<string>();
  const out: CollectionLink[] = [];
  for (const link of links) {
    if (!link.href || seen.has(link.href)) continue;
    seen.add(link.href);
    out.push(link);
    if (out.length >= limit) break;
  }
  return out;
}

function listingLabel(row: CollectionLinkRow) {
  const parts = [
    formatVehicleCardHeading(row.brand, row.model),
    row.year ? String(row.year) : "",
    row.price ? `${Number(row.price).toLocaleString("cs-CZ")} Kč` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function brandLinks(rows: CollectionLinkRow[], limit = 10) {
  return uniqueByHref(
    rows
      .map((row) => {
        const slug = normalizeSlug(row.brand);
        return slug
          ? { label: formatBrandDisplay(slug), href: `/auta/${slug}` }
          : null;
      })
      .filter(Boolean) as CollectionLink[],
    limit,
  );
}

function modelLinks(rows: CollectionLinkRow[], limit = 10) {
  return uniqueByHref(
    rows
      .map((row) => {
        const brandSlug = normalizeSlug(row.brand);
        const modelSlug = normalizeSlug(row.model);
        return brandSlug && modelSlug
          ? {
              label: `${formatBrandDisplay(brandSlug)} ${formatModelDisplay(modelSlug)}`,
              href: `/auta/${brandSlug}/${modelSlug}`,
            }
          : null;
      })
      .filter(Boolean) as CollectionLink[],
    limit,
  );
}

function listingLinks(rows: CollectionLinkRow[], limit = 6) {
  return rows.slice(0, limit).map((row) => ({
    label: listingLabel(row),
    href: buildListingUrl({
      id: row.id,
      brand: row.brand,
      model: row.model,
      year: row.year,
    }),
  }));
}

function sameBrandModelLinks(
  rows: CollectionLinkRow[],
  opts: { brandSlug?: string; modelSlug?: string },
) {
  const sameBrand = opts.brandSlug
    ? rows.filter((row) => normalizeSlug(row.brand) === opts.brandSlug)
    : [];
  const sameModel = opts.brandSlug && opts.modelSlug
    ? rows.filter(
        (row) =>
          normalizeSlug(row.brand) === opts.brandSlug &&
          normalizeSlug(row.model) === opts.modelSlug,
      )
    : [];
  return {
    sameBrand: listingLinks(sameBrand, 6),
    sameModel: listingLinks(sameModel, 6),
  };
}

function LinkGrid({
  title,
  links,
}: {
  title: string;
  links: CollectionLink[];
}) {
  if (!links.length) return null;
  return (
    <section className="mt-8" aria-labelledby={normalizeSlug(title)}>
      <h2 id={normalizeSlug(title)} className="text-lg font-semibold mb-3">
        {title}
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="block rounded-md border px-3 py-2 text-sm hover:bg-accent"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CollectionVehicleJsonLd({ rows }: { rows: CollectionLinkRow[] }) {
  return (
    <>
      {rows.slice(0, 8).map((row) => (
        <JsonLd
          key={`vehicle-${row.id}`}
          data={buildListingCarJsonLd(
            row as Parameters<typeof buildListingCarJsonLd>[0],
          )}
        />
      ))}
    </>
  );
}

export function CollectionInternalLinkBlocks({
  rows,
  brandSlug,
  modelSlug,
  relatedLinks,
}: {
  rows: CollectionLinkRow[];
  brandSlug?: string;
  modelSlug?: string;
  relatedLinks?: CollectionLink[];
}) {
  const popularBrands = brandLinks(rows);
  const popularModels = modelLinks(rows);
  const relatedCars = listingLinks(rows.slice(6).length ? rows.slice(6) : rows);
  const latestListings = listingLinks(rows);
  const { sameBrand, sameModel } = sameBrandModelLinks(rows, {
    brandSlug,
    modelSlug,
  });
  const similarSearches = uniqueByHref(relatedLinks ?? [], 12);

  return (
    <div className="mt-10" aria-label="Interní odkazy">
      <h2 className="text-xl font-semibold mb-4">Další možnosti výběru</h2>
      <LinkGrid title="Související auta" links={relatedCars} />
      <LinkGrid title="Populární modely" links={popularModels} />
      <LinkGrid title="Populární značky" links={popularBrands} />
      <LinkGrid title="Poslední inzeráty" links={latestListings} />
      <LinkGrid title="Další auta této značky" links={sameBrand} />
      <LinkGrid title="Další auta tohoto modelu" links={sameModel} />
      <LinkGrid title="Související vyhledávání" links={similarSearches} />
    </div>
  );
}
