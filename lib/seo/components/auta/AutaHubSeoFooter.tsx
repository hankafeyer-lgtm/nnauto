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
          Online autobazar a auta na prodej v ČR
        </h2>
        <p>
          Stránka <strong>Auta na prodej</strong> slouží jako hlavní rozcestník
          pro výběr ojetých i nových vozů podle značky, modelu a oblíbených
          parametrů. Každá značka má vlastní stránku s aktuálními inzeráty,
          populárními modely a přehledem nabídky v České republice. Pro
          kompletní filtrování podle ceny, roku výroby, nájezdu, paliva nebo
          regionu využijte také{" "}
          <a href="/listings" className="underline">
            katalog inzerátů
          </a>
          .
        </p>
        <p>
          Pokud hledáte konkrétní typ vozu, začněte přes často hledané
          kategorie:{" "}
          <a href="/auta/diesel" className="underline">
            diesel auta
          </a>
          ,{" "}
          <a href="/auta/suv" className="underline">
            SUV auta
          </a>
          ,{" "}
          <a href="/auta/do-300000" className="underline">
            auta do 300 000 Kč
          </a>
          ,{" "}
          <a href="/auta/automat" className="underline">
            auta s automatem
          </a>{" "}
          nebo{" "}
          <a href="/auta/4x4" className="underline">
            auta 4x4
          </a>
          . Tyto stránky pomáhají rychle porovnat nabídku podle nejčastějších
          nákupních záměrů.
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          Jak vybrat ojeté auto
        </h3>
        <p>
          Při výběru ojetého auta porovnávejte nejen cenu, ale také servisní
          historii, počet majitelů, skutečný nájezd, stav karoserie a výbavu.
          U vozů z vyšší cenové kategorie se vyplatí prověřit VIN a domluvit
          si osobní prohlídku nebo zkušební jízdu. NNAuto propojuje kupující
          přímo s prodejci, takže se můžete rychle zeptat na detaily vozu.
        </p>
        <h3 className="text-lg font-semibold text-foreground">
          Oblíbené značky a modely
        </h3>
        <p>
          Mezi často hledané značky v Česku patří{" "}
          <a href="/auta/skoda" className="underline">
            Škoda
          </a>
          ,{" "}
          <a href="/auta/volkswagen" className="underline">
            Volkswagen
          </a>
          ,{" "}
          <a href="/auta/bmw" className="underline">
            BMW
          </a>
          ,{" "}
          <a href="/auta/audi" className="underline">
            Audi
          </a>{" "}
          a{" "}
          <a href="/auta/mercedes-benz" className="underline">
            Mercedes-Benz
          </a>
          . U značek s dostatečnou nabídkou najdete také samostatné stránky
          modelů, například Škoda Octavia, BMW X5 nebo Audi A4.
        </p>
      </section>
    </>
  );
}
