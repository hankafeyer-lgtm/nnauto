import { formatBrandDisplay, formatModelDisplay } from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { buildListingUrl } from "@lib/seo/listing-url";
import { isSeoFeatureEnabled, isSeoTextsEnabled } from "@lib/seo/features";
import { ExploreCatalog } from "./ExploreCatalog";

const POPULAR_BRANDS = [
  "bmw",
  "audi",
  "skoda",
  "mercedes-benz",
  "volkswagen",
  "volvo",
  "ford",
  "jeep",
];

type TopModel = {
  brand: string | null;
  model: string | null;
  total: number;
};

type RecentListing = {
  id: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  price: unknown;
  createdAt: Date | null;
};

export function HomeSeoBlocks({
  topModels,
  recentListings,
  topLinks,
}: {
  topModels: TopModel[];
  recentListings: RecentListing[];
  topLinks: Array<{ href: string; label: string; slug: string }>;
}) {
  if (!isSeoFeatureEnabled("homepageSeoBlocks")) return null;

  return (
    <>
      <section
        aria-labelledby="home-seo-brands"
        className="container mx-auto max-w-6xl px-4 py-10 border-t mt-8"
      >
        <h2
          id="home-seo-brands"
          className="text-xl md:text-2xl font-semibold mb-4"
        >
          Populární značky
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR_BRANDS.map((slug) => (
            <li key={slug}>
              <a
                href={`/auta/${slug}`}
                className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {formatBrandDisplay(slug)}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/auta"
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              Všechny značky
            </a>
          </li>
          <li>
            <a
              href="/listings"
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
            >
              Katalog aut
            </a>
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Procházejte také{" "}
          <a href="/listings" className="underline hover:text-foreground">
            kompletní katalog inzerátů
          </a>{" "}
          nebo{" "}
          <a href="/add-listing" className="underline hover:text-foreground">
            přidejte vlastní inzerát
          </a>
          .
        </p>
      </section>

      {topModels.length > 0 ? (
        <section
          aria-labelledby="home-seo-models"
          className="container mx-auto max-w-6xl px-4 py-6"
        >
          <h2
            id="home-seo-models"
            className="text-xl md:text-2xl font-semibold mb-4"
          >
            Populární modely na prodej
          </h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {topModels.map((m) => {
              const brandSlug = normalizeSlug(String(m.brand));
              const modelSlug = normalizeSlug(String(m.model));
              const brandName = formatBrandDisplay(m.brand);
              const modelName = formatModelDisplay(m.model);
              return (
                <li key={`${brandSlug}-${modelSlug}`}>
                  <a
                    href={`/auta/${brandSlug}/${modelSlug}`}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="truncate font-medium">
                      {brandName} {modelName}
                    </span>
                    <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                      {m.total}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {recentListings.length > 0 ? (
        <section className="container mx-auto max-w-6xl px-4 py-4">
          <h3 className="text-base font-semibold mb-2 text-muted-foreground">
            Nově přidané vozy
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {recentListings.map((l) => {
              const title = [
                l.brand,
                l.model,
                l.year ? String(l.year) : "",
              ]
                .filter(Boolean)
                .join(" ");
              const href = buildListingUrl({
                id: l.id,
                brand: l.brand,
                model: l.model,
                year: l.year,
              });
              const price = Number(l.price).toLocaleString("cs-CZ");
              const date = l.createdAt
                ? new Date(l.createdAt).toLocaleDateString("cs-CZ")
                : "";
              return (
                <li key={l.id}>
                  <a
                    href={href}
                    className="flex justify-between items-baseline gap-2 rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                  >
                    <span className="truncate font-medium">{title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {price} Kč · {date}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section className="container mx-auto max-w-6xl px-4 py-4">
        <h3 className="text-base font-semibold mb-2 text-muted-foreground">
          Nejčastěji hledané vozy
        </h3>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {topLinks.slice(0, 15).map((l) => (
            <li key={l.slug}>
              <a
                href={l.href}
                className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <ExploreCatalog />

      {isSeoTextsEnabled() ? <HomeSeoText /> : null}
    </>
  );
}

function HomeSeoText() {
  return (
    <section
      aria-labelledby="home-seo-text"
      className="container mx-auto max-w-6xl px-4 pb-12"
    >
      <h2
        id="home-seo-text"
        className="text-xl md:text-2xl font-semibold mb-3"
      >
        Online autobazar NNAuto – prodej a nákup ojetých aut
      </h2>
      <div className="prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
        <p>
          <strong>NNAuto</strong> je moderní online autobazar pro Českou
          republiku, kde najdete tisíce ověřených inzerátů osobních aut,
          motocyklů a nákladních vozidel.
        </p>
        <p>
          Vyberte si auto pomocí pokročilých filtrů – nastavte si značku (
          <a href="/auta/bmw" className="underline">
            BMW
          </a>
          ,{" "}
          <a href="/auta/audi" className="underline">
            Audi
          </a>
          ,{" "}
          <a href="/auta/skoda" className="underline">
            Škoda
          </a>{" "}
          nebo{" "}
          <a href="/auta/mercedes-benz" className="underline">
            Mercedes-Benz
          </a>
          ), model, rok výroby, rozsah ceny a najetých kilometrů.
        </p>
        <p>
          Prodáváte auto? Vložte zdarma inzerát během několika minut. Pro
          rychlejší prodej můžete využít zvýraznění{" "}
          <a href="/pricing" className="underline">
            TOP inzerátu
          </a>
          .
        </p>
        <p>
          Kupujete ojeté auto? Užitečné{" "}
          <a href="/tips" className="underline">
            tipy a rady při nákupu auta
          </a>{" "}
          jsme připravili v samostatné sekci.
        </p>
      </div>
    </section>
  );
}
