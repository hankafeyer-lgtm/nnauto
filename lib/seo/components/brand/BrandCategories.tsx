import { isSeoFeatureEnabled } from "@lib/seo/features";
import { SeoHubLinks } from "@lib/seo/SeoHubLinks";

export function BrandCategories({
  brandName,
  links,
}: {
  brandName: string;
  links: Array<{ label: string; href: string }>;
}) {
  if (!isSeoFeatureEnabled("brandCategories")) return null;
  if (!links.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Kategorie {brandName}</h2>
      <SeoHubLinks links={links} />
    </section>
  );
}
