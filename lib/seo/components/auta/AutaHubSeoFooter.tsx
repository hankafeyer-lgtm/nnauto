import { isSeoTextsEnabled } from "@lib/seo/features";
import { SeoHubLinks, SEO_ARCHITECTURE_LINKS } from "@lib/seo/SeoHubLinks";

export function AutaHubSeoFooter() {
  if (!isSeoTextsEnabled()) return null;

  return (
    <>
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Navigace</h2>
        <SeoHubLinks links={SEO_ARCHITECTURE_LINKS} />
      </section>

      <section className="mt-10 prose max-w-none text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Online autobazar podle značek
        </h2>
        <p>
          Stránka <strong>/auta</strong> slouží jako rozcestník ke všem
          značkám v katalogu NNAuto. Každá značka má vlastní SEO stránku s
          aktuálními inzeráty, populárními modely a přehledem cen. Pro
          kompletní filtrování podle parametrů využijte také{" "}
          <a href="/listings" className="underline">
            katalog inzerátů
          </a>
          .
        </p>
      </section>
    </>
  );
}
