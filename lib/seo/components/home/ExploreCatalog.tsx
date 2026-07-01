import { isSeoFeatureEnabled } from "@lib/seo/features";
import { SeoHubLinks, SEO_ARCHITECTURE_LINKS } from "@lib/seo/SeoHubLinks";

export function ExploreCatalog() {
  if (!isSeoFeatureEnabled("homepageExploreSection")) return null;

  return (
    <section className="container mx-auto max-w-6xl px-4 py-6 border-t">
      <h3 className="text-base font-semibold mb-2 text-muted-foreground">
        Prozkoumat katalog
      </h3>
      <SeoHubLinks links={SEO_ARCHITECTURE_LINKS} />
    </section>
  );
}
