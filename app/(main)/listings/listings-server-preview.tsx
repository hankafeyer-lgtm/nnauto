import { buildListingUrl } from "@lib/seo/listing-url";
import { getListingMainTitleFromRow } from "@lib/seo/listing-title";
import { getRecentActiveListings } from "@lib/seo/recent-listings";

/** Crawlable HTML links for the first N catalog listings (SSR, no client JS). */
const SSR_LISTINGS_PREVIEW_COUNT = 24;

export default async function ListingsServerPreview() {
  const rows = await getRecentActiveListings(SSR_LISTINGS_PREVIEW_COUNT);
  if (!rows.length) return null;

  return (
    <nav
      aria-label="Aktuální inzeráty"
      className="sr-only"
    >
      <h2 className="text-lg font-semibold mb-3">Aktuální inzeráty vozidel</h2>
      <ul>
        {rows.map((row) => (
          <li key={row.id}>
            <a
              href={buildListingUrl({
                id: row.id,
                brand: row.brand,
                model: row.model,
                year: row.year,
              })}
            >
              {getListingMainTitleFromRow(row)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
