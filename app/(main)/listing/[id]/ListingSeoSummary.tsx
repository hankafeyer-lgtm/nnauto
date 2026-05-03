import type { listings } from "@shared/schema";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { getListingMainTitle } from "@/lib/listingTitle";

type ListingRow = typeof listings.$inferSelect;

/**
 * Visible SSR summary above the NoSSR-wrapped SPA shell. Gives crawlers and
 * users without JS the same critical facts as the client card (H1, price,
 * key specs, description excerpt) without relying on sr-only duplication.
 */
export default function ListingSeoSummary({ listing }: { listing: ListingRow }) {
  const heading = getListingMainTitle(listing);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const year = listing.year ? String(listing.year) : null;
  const mileage =
    listing.mileage != null
      ? `${listing.mileage.toLocaleString("cs-CZ")} km`
      : null;
  const fuel = Array.isArray(listing.fuelType)
    ? listing.fuelType.filter(Boolean).join(", ")
    : String(listing.fuelType ?? "").trim();
  const transmission = Array.isArray(listing.transmission)
    ? listing.transmission.filter(Boolean).join(", ")
    : String(listing.transmission ?? "").trim();
  const region = listing.region ? String(listing.region).trim() : "";
  const vin = listing.vin ? String(listing.vin).trim() : "";

  const rawDesc = listing.description?.replace(/\s+/g, " ").trim() ?? "";
  const excerpt =
    rawDesc.length > 280 ? `${rawDesc.slice(0, 280)}…` : rawDesc;

  const firstPhoto = listing.photos?.find(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );
  const imgSrc = firstPhoto
    ? `${SITE_ORIGIN}/img/${firstPhoto.replace(/^\/+/, "")}?w=960&q=80&f=webp`
    : null;

  const dlRows: Array<{ label: string; value: string }> = [];
  if (year) dlRows.push({ label: "Rok", value: year });
  if (mileage) dlRows.push({ label: "Najeto", value: mileage });
  if (fuel) dlRows.push({ label: "Palivo", value: fuel });
  if (transmission) dlRows.push({ label: "Převodovka", value: transmission });
  if (region) dlRows.push({ label: "Lokalita", value: region });
  if (vin) dlRows.push({ label: "VIN", value: vin });

  return (
    <section
      className="container mx-auto max-w-7xl px-3 pb-4 pt-2 sm:px-4 sm:pb-5 sm:pt-3"
      aria-labelledby="listing-primary-heading"
      data-testid="listing-seo-summary"
    >
      <div className="rounded-xl border border-border bg-card/80 p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {imgSrc ? (
            <div className="mx-auto w-full max-w-sm shrink-0 sm:mx-0 sm:w-44">
              <img
                src={imgSrc}
                alt={heading}
                width={352}
                height={264}
                fetchPriority="high"
                decoding="async"
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1 space-y-3">
            <h1
              id="listing-primary-heading"
              className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            >
              {heading}
            </h1>
            {listing.isSold ? (
              <p className="text-sm font-medium text-muted-foreground">
                Tento inzerát je označen jako prodaný.
              </p>
            ) : null}
            <p className="text-2xl font-semibold text-primary sm:text-3xl">
              {price} Kč
            </p>
            {dlRows.length > 0 ? (
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {dlRows.map((row) => (
                  <div key={row.label} className="flex gap-2">
                    <dt className="shrink-0 text-muted-foreground">{row.label}:</dt>
                    <dd className="min-w-0 break-words font-medium">{row.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {excerpt ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {excerpt}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
