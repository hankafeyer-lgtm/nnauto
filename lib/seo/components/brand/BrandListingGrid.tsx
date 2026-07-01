import type { listings } from "@shared/schema";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  formatVehicleTitle,
  formatVehicleCardHeading,
} from "@lib/seo/brand-format";
import { buildListingUrl } from "@lib/seo/listing-url";

type ListingRow = typeof listings.$inferSelect;

const titleCaseRegion = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function BrandListingGrid({
  rows,
}: {
  rows: ListingRow[];
}) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rows.map((l) => {
        const year = l.year;
        const mileage = l.mileage
          ? `${l.mileage.toLocaleString("cs-CZ")} km`
          : "";
        const price = l.price
          ? `${Number(l.price).toLocaleString("cs-CZ")} Kč`
          : "";
        const img = l.photos?.[0]
          ? `${SITE_ORIGIN}/img/${l.photos[0].replace(/^\/+/, "")}?w=800&q=75&f=webp`
          : null;
        return (
          <li
            key={l.id}
            className="rounded-lg border bg-card overflow-hidden"
          >
            <a
              href={buildListingUrl({
                id: l.id,
                brand: l.brand,
                model: l.model,
              })}
              className="block group"
            >
              {img ? (
                <img
                  src={img}
                  alt={formatVehicleTitle(l.brand, l.model, l.year)}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-48 bg-muted" aria-hidden="true" />
              )}
              <div className="p-3 space-y-1">
                <h3 className="font-semibold group-hover:underline">
                  {formatVehicleCardHeading(l.brand, l.model)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {[year, mileage, l.region ? titleCaseRegion(String(l.region)) : ""]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <p className="font-semibold text-[#B8860B]">{price}</p>
              </div>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
