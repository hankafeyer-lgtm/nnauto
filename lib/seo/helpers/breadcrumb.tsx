import {
  isSeoFeatureConfigured,
  isSeoUiFeatureEnabled,
} from "@lib/seo/features";

type Crumb = { href?: string; label: string };

function CrumbTrail({ items }: { items: Crumb[] }) {
  return (
    <nav
      className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-1"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="contents">
          {i > 0 ? <span>/</span> : null}
          {item.href ? (
            <a href={item.href} className="hover:underline">
              {item.label}
            </a>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AutaIndexBreadcrumb() {
  return (
    <CrumbTrail
      items={[
        { href: "/", label: "NNAuto" },
        { label: "Auta na prodej" },
      ]}
    />
  );
}

export function BrandBreadcrumb({
  brandName,
  brandSlug,
}: {
  brandName: string;
  brandSlug: string;
}) {
  const items: Crumb[] = [{ href: "/", label: "NNAuto" }];
  if (isSeoUiFeatureEnabled("autoHub")) {
    items.push({ href: "/auta", label: "Auta" });
  }
  items.push({ href: `/auta/${brandSlug}`, label: brandName });
  return <CrumbTrail items={items} />;
}

export function ModelBreadcrumb({
  brandName,
  brandSlug,
  modelName,
}: {
  brandName: string;
  brandSlug: string;
  modelName: string;
}) {
  const items: Crumb[] = [{ href: "/", label: "NNAuto" }];
  if (isSeoUiFeatureEnabled("autoHub")) {
    items.push({ href: "/auta", label: "Auta" });
  }
  items.push({ href: `/auta/${brandSlug}`, label: brandName });
  items.push({ label: modelName });
  return <CrumbTrail items={items} />;
}

export function ListingBreadcrumbNav({
  brand,
  brandSlug,
  modelLabel,
  modelSlug,
  listingName,
}: {
  brand: string;
  brandSlug: string;
  modelLabel: string;
  modelSlug: string;
  listingName: string;
}) {
  const extended = isSeoUiFeatureEnabled("listingBreadcrumbExtended");

  return (
    <>
      <a
        href={`/auta/${brandSlug}`}
        className="block truncate text-sm text-muted-foreground hover:underline sm:hidden"
      >
        {`\u2190 Zpět na ${brand}`}
      </a>
      {extended ? (
        <nav
          aria-label="Breadcrumb"
          className="hidden flex-wrap items-center gap-x-2 gap-y-1 overflow-x-auto text-sm leading-relaxed text-muted-foreground sm:flex"
        >
          <a href="/" className="shrink-0 hover:underline">
            NNAuto
          </a>
          <span className="text-muted-foreground/70">{">"}</span>
          {isSeoUiFeatureEnabled("autoHub") ? (
            <>
              <a href="/auta" className="shrink-0 hover:underline">
                Auta
              </a>
              <span className="text-muted-foreground/70">{">"}</span>
            </>
          ) : null}
          <a
            href={`/auta/${brandSlug}`}
            className="max-w-[40vw] truncate hover:underline sm:max-w-none"
          >
            {brand}
          </a>
          <span className="text-muted-foreground/70">{">"}</span>
          <a
            href={`/auta/${brandSlug}/${modelSlug}`}
            className="max-w-[40vw] truncate hover:underline sm:max-w-none"
          >
            {modelLabel}
          </a>
          <span className="text-muted-foreground/70">{">"}</span>
          <span
            aria-current="page"
            className="max-w-[50vw] truncate sm:max-w-none"
          >
            {listingName}
          </span>
        </nav>
      ) : null}
    </>
  );
}

/** JSON-LD breadcrumb items — technical SEO; ignores classicUI master switch */
export function buildListingBreadcrumbJsonLdItems(
  siteOrigin: string,
  opts: {
    brand: string;
    brandSlug: string;
    modelLabel: string;
    modelSlug: string;
    listingName: string;
    canonicalUrl: string;
  },
): Array<{ name: string; item?: string }> {
  const items: Array<{ name: string; item?: string }> = [
    { name: "NNAuto", item: `${siteOrigin}/` },
  ];
  if (
    isSeoFeatureConfigured("listingBreadcrumbExtended") &&
    isSeoFeatureConfigured("autoHub")
  ) {
    items.push({ name: "Auta", item: `${siteOrigin}/auta` });
  }
  if (isSeoFeatureConfigured("listingBreadcrumbExtended")) {
    items.push({
      name: opts.brand,
      item: `${siteOrigin}/auta/${opts.brandSlug}`,
    });
    items.push({
      name: opts.modelLabel,
      item: `${siteOrigin}/auta/${opts.brandSlug}/${opts.modelSlug}`,
    });
  }
  items.push({ name: opts.listingName, item: opts.canonicalUrl });
  return items;
}
