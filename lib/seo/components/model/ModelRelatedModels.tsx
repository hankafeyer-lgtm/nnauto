import { formatModelDisplay } from "@lib/seo/brand-format";
import { isSeoFeatureEnabled } from "@lib/seo/features";
import { SeoHubLinks } from "@lib/seo/SeoHubLinks";

export function ModelSiblingModels({
  brandSlug,
  brandName,
  siblings,
}: {
  brandSlug: string;
  brandName: string;
  siblings: Array<{ model: string; slug: string; total: number }>;
}) {
  if (!isSeoFeatureEnabled("modelRelatedModels")) return null;
  if (!siblings.length) return null;

  return (
    <section className="mt-10" aria-labelledby="sibling-models-heading">
      <h2 id="sibling-models-heading" className="text-xl font-semibold mb-3">
        Další modely {brandName}
      </h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {siblings.map((item) => (
          <li key={item.slug}>
            <a
              href={`/auta/${brandSlug}/${item.slug}`}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <span className="truncate font-medium">
                {brandName} {formatModelDisplay(item.model)}
              </span>
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                {item.total}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ModelSimilarModels({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  if (!isSeoFeatureEnabled("modelRelatedModels")) return null;
  if (!links.length) return null;

  return (
    <section className="mt-8" aria-labelledby="similar-models-heading">
      <h2 id="similar-models-heading" className="text-xl font-semibold mb-3">
        Podobné modely
      </h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ModelSimilarPrice({
  link,
}: {
  link: { href: string; label: string } | null;
}) {
  if (!isSeoFeatureEnabled("modelRelatedModels")) return null;
  if (!link) return null;

  return (
    <section className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Vozy podobné ceny</h2>
      <SeoHubLinks links={[link]} />
    </section>
  );
}

export function ModelCategories({
  brandName,
  links,
}: {
  brandName: string;
  links: Array<{ label: string; href: string }>;
}) {
  if (!isSeoFeatureEnabled("modelCategories")) return null;
  if (!links.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-2">Kategorie {brandName}</h2>
      <SeoHubLinks links={links} />
    </section>
  );
}

export function ModelFacetSearchLinks({
  brandName,
  modelName,
  brandSlug,
  modelSlug,
}: {
  brandName: string;
  modelName: string;
  brandSlug: string;
  modelSlug: string;
}) {
  if (!isSeoFeatureEnabled("modelCategories")) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-3">
        {brandName} {modelName} – hledat podle
      </h2>
      <ul className="flex flex-wrap gap-2">
        {[
          { suffix: "diesel", label: "diesel" },
          { suffix: "benzin", label: "benzín" },
          { suffix: "automat", label: "automat" },
          { suffix: "kombi", label: "kombi" },
        ].map((item) => (
          <li key={item.suffix}>
            <a
              href={`/prodej/${brandSlug}-${modelSlug}-${item.suffix}`}
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              {brandName} {modelName} {item.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href={`/prodej/${brandSlug}-${modelSlug}`}
            className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            {brandName} {modelName} na prodej
          </a>
        </li>
      </ul>
    </section>
  );
}

export function ModelRelatedNav({
  brandSlug,
  brandName,
}: {
  brandSlug: string;
  brandName: string;
}) {
  if (!isSeoFeatureEnabled("modelRelatedModels")) return null;

  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold mb-2 text-muted-foreground">
        Související
      </h3>
      <ul className="flex flex-wrap gap-2">
        <li>
          <a
            href={`/auta/${brandSlug}`}
            className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Vše {brandName}
          </a>
        </li>
        <li>
          <a
            href="/listings"
            className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Všechny inzeráty
          </a>
        </li>
        <li>
          <a
            href="/tips"
            className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            Tipy a rady
          </a>
        </li>
      </ul>
    </section>
  );
}
