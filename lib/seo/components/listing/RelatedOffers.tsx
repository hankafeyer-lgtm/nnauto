import { SITE_ORIGIN } from "@lib/seo/constants";
import { isSeoFeatureEnabled, isSeoTextsEnabled } from "@lib/seo/features";
import { buildListingUrl } from "@lib/seo/listing-url";

export type SimilarListingCard = {
  id: string;
  title: string;
  price: unknown;
  brand: string | null;
  model: string | null;
  year: number | null;
  photos: string[] | null;
};

export function SimilarListings({
  items,
}: {
  items: SimilarListingCard[];
}) {
  if (!isSeoFeatureEnabled("listingRelatedOffers")) return null;
  if (!items.length) return null;

  return (
    <section className="container mx-auto mt-6 border-t px-3 py-6 sm:mt-8 sm:px-4 sm:py-8 max-w-7xl">
      <h2 className="text-xl font-semibold mb-4">Souvisejici auta</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => {
          const itemPhoto = item.photos?.[0];
          const itemPrice = Number(item.price).toLocaleString("cs-CZ");
          const itemHref = buildListingUrl({
            id: item.id,
            brand: item.brand,
            model: item.model,
            year: item.year,
          });
          return (
            <a
              key={item.id}
              href={itemHref}
              className="block rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors overflow-hidden"
            >
              {itemPhoto ? (
                <img
                  src={`${SITE_ORIGIN}/img/${itemPhoto.replace(/^\/+/, "")}?w=480&q=76&f=webp`}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-36 object-cover"
                />
              ) : null}
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium line-clamp-2">{item.title}</p>
                <p className="text-primary font-semibold">{itemPrice} Kč</p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function ListingAboutVehicle({ paragraph }: { paragraph: string }) {
  if (!isSeoTextsEnabled()) return null;
  if (!paragraph.trim()) return null;

  return (
    <section className="container mx-auto mt-6 border-t px-3 py-6 sm:mt-8 sm:px-4 sm:py-8 max-w-7xl">
      <h2 className="text-lg font-semibold mb-3">O tomto voze</h2>
      <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
        {paragraph}
      </p>
    </section>
  );
}

export function RelatedOffers({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  if (!isSeoFeatureEnabled("listingRelatedOffers")) return null;
  if (!links.length) return null;

  return (
    <section className="container mx-auto border-t px-3 py-6 sm:px-4 sm:py-8 max-w-7xl">
      <h2 className="text-lg font-semibold mb-3">Související nabídky</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-flex rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent/40 transition-colors"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
