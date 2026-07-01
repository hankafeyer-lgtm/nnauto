import type { listings } from "@shared/schema";
import { isSeoFeatureEnabled } from "@lib/seo/features";
import { formatVehicleTitle } from "@lib/seo/brand-format";
import { buildListingUrl } from "@lib/seo/listing-url";

type ListingRow = typeof listings.$inferSelect;

export function BrandNewestCars({
  brandName,
  rows,
}: {
  brandName: string;
  rows: ListingRow[];
}) {
  if (!isSeoFeatureEnabled("brandNewestCars")) return null;

  return (
    <section className="mt-10" aria-labelledby="latest-brand-heading">
      <h2 id="latest-brand-heading" className="text-xl font-semibold mb-3">
        Nejnovější vozy {brandName}
      </h2>
      <ul className="flex flex-wrap gap-2">
        {rows.slice(0, 8).map((l) => (
          <li key={l.id}>
            <a
              href={buildListingUrl({
                id: l.id,
                brand: l.brand,
                model: l.model,
              })}
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              {formatVehicleTitle(l.brand, l.model, l.year)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
