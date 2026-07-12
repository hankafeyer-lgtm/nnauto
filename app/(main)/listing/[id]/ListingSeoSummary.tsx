import type { listings } from "@shared/schema";
import { isSeoFeatureEnabled } from "@lib/seo/features";
import { SITE_ORIGIN } from "@lib/seo/constants";
import {
  buildListingH1,
  buildListingImageAlt,
} from "@lib/seo/listing-meta";
import { normalizeSlug } from "@lib/seo/slug";

type ListingRow = typeof listings.$inferSelect;

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter(Boolean).map(String);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

/**
 * Comprehensive SSR listing content for crawlers. Visually hidden (clip)
 * but fully present in HTML so Googlebot sees all listing data without JS.
 *
 * Includes: H1, price, full specs table, full description, all photo alts,
 * equipment list, seller type, condition — everything a search engine needs
 * to understand and rank the page for long-tail queries.
 */
export default function ListingSeoSummary({ listing }: { listing: ListingRow }) {
  if (!isSeoFeatureEnabled("listingSeoSummary")) return null;

  const heading = buildListingH1(listing);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const year = listing.year ? String(listing.year) : null;
  const mileage =
    listing.mileage != null
      ? `${listing.mileage.toLocaleString("cs-CZ")} km`
      : null;
  const fuel = arr(listing.fuelType).join(", ");
  const transmission = arr(listing.transmission).join(", ");
  const driveType = arr(listing.driveType).join(", ");
  const bodyType = listing.bodyType ? String(listing.bodyType).trim() : "";
  const color = listing.color ? String(listing.color).trim() : "";
  const region = listing.region ? String(listing.region).trim() : "";
  const vin = listing.vin ? String(listing.vin).trim() : "";
  const condition = listing.condition ? String(listing.condition).trim() : "";
  const sellerType = listing.sellerType ? String(listing.sellerType).trim() : "";
  const power = listing.power ? `${listing.power} kW` : "";
  const engineVolume = listing.engineVolume ? `${listing.engineVolume} l` : "";
  const doors = listing.doors ? String(listing.doors) : "";
  const seats = listing.seats ? String(listing.seats) : "";

  const description = listing.description?.trim() ?? "";

  const photos = (listing.photos ?? []).filter(
    (p): p is string => typeof p === "string" && p.trim().length > 0,
  );
  const firstImgSrc = photos[0]
    ? `${SITE_ORIGIN}/img/${photos[0].replace(/^\/+/, "")}?w=960&q=80&f=webp`
    : null;

  const equipment = arr(listing.equipment);
  const extras = arr(listing.extras);

  const specs: Array<{ label: string; value: string }> = [];
  if (year) specs.push({ label: "Rok výroby", value: year });
  if (mileage) specs.push({ label: "Najeto", value: mileage });
  if (fuel) specs.push({ label: "Palivo", value: fuel });
  if (transmission) specs.push({ label: "Převodovka", value: transmission });
  if (driveType) specs.push({ label: "Pohon", value: driveType });
  if (bodyType) specs.push({ label: "Karoserie", value: bodyType });
  if (engineVolume) specs.push({ label: "Objem motoru", value: engineVolume });
  if (power) specs.push({ label: "Výkon", value: power });
  if (color) specs.push({ label: "Barva", value: color });
  if (doors) specs.push({ label: "Počet dveří", value: doors });
  if (seats) specs.push({ label: "Počet míst", value: seats });
  if (condition) specs.push({ label: "Stav", value: condition });
  if (sellerType) specs.push({ label: "Prodejce", value: sellerType });
  if (region) specs.push({ label: "Lokalita", value: region });
  if (vin) specs.push({ label: "VIN", value: vin });

  const brandSlug = normalizeSlug(listing.brand);
  const modelSlug = normalizeSlug(listing.model);

  return (
    <section
      className="absolute w-px h-px overflow-hidden whitespace-nowrap"
      style={{ clip: "rect(0 0 0 0)", clipPath: "inset(50%)", margin: "-1px", padding: 0, border: 0 }}
      aria-labelledby="listing-primary-heading"
      data-testid="listing-seo-summary"
    >
      {firstImgSrc ? (
        <img
          src={firstImgSrc}
          alt={buildListingImageAlt(listing, 0)}
          width={960}
          height={640}
          fetchPriority="high"
          decoding="async"
        />
      ) : null}

      <h1 className="font-semibold" id="listing-primary-heading">
        {heading}
      </h1>
      {listing.isSold ? <p>Tento inzerát je označen jako prodaný.</p> : null}
      <p>Cena: {price} Kč</p>

      {specs.length > 0 ? (
        <table>
          <caption>Technické parametry – {heading}</caption>
          <tbody>
            {specs.map((s) => (
              <tr key={s.label}>
                <th>{s.label}</th>
                <td>{s.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {description ? (
        <div>
          <h2>Popis vozu</h2>
          <p>{description}</p>
        </div>
      ) : null}

      {equipment.length > 0 ? (
        <div>
          <h2>Výbava</h2>
          <ul>
            {equipment.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {extras.length > 0 ? (
        <div>
          <h2>Doplňky</h2>
          <ul>
            {extras.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {photos.length > 1 ? (
        <div>
          <h2>Fotografie</h2>
          {photos.slice(0, 10).map((p, i) => (
            <img
              key={p}
              src={`${SITE_ORIGIN}/img/${p.replace(/^\/+/, "")}?w=800&q=75&f=webp`}
              alt={buildListingImageAlt(listing, i + 1)}
              width={800}
              height={533}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      ) : null}

      <nav aria-label="Interní odkazy">
        <a href={`/auta/${brandSlug}`}>{listing.brand} – všechny modely</a>
        <a href={`/auta/${brandSlug}/${modelSlug}`}>{listing.brand} {listing.model} – inzeráty</a>
        <a href={`/auta/${brandSlug}/${modelSlug}`}>{listing.brand} {listing.model} na prodej</a>
      </nav>
    </section>
  );
}
