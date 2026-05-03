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
      className="absolute w-px h-px overflow-hidden whitespace-nowrap"
      style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)", margin: "-1px", padding: 0, border: 0 }}
      aria-labelledby="listing-primary-heading"
      data-testid="listing-seo-summary"
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={heading}
          width={352}
          height={235}
          fetchPriority="high"
          decoding="async"
        />
      ) : null}
      <h1 id="listing-primary-heading">{heading}</h1>
      {listing.isSold ? <p>Prodáno</p> : null}
      <p>{price} Kč</p>
      {dlRows.length > 0 ? (
        <dl>
          {dlRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {excerpt ? <p>{excerpt}</p> : null}
    </section>
  );
}
