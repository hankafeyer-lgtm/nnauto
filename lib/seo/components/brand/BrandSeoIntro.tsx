import { shouldRenderSeoText } from "@lib/seo/features";

export function BrandSeoIntro({
  brandName,
  paragraphs,
}: {
  brandName: string;
  paragraphs: string[];
}) {
  if (!shouldRenderSeoText("brandSeoIntro")) return null;
  if (!paragraphs.length) return null;

  return (
    <section className="mt-10 prose max-w-none text-muted-foreground space-y-4">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  );
}

export function BrandWhyChoose({
  brandName,
  brandSlug,
}: {
  brandName: string;
  brandSlug: string;
}) {
  if (!shouldRenderSeoText("brandSeoIntro")) return null;

  return (
    <section className="mt-10 prose max-w-none text-muted-foreground">
      <h2 className="text-xl font-semibold text-foreground">
        Proč si vybrat {brandName} na NNAuto?
      </h2>
      <p>
        Nakupovat {brandName} skrze NNAuto znamená přímý kontakt s prodejcem,
        transparentní cenu a možnost ověřit historii vozu přes Cebia report.
        V nabídce najdete jak čerstvě přidané inzeráty, tak déle inzerovaná
        auta se sníženou cenou. Vše přehledně se všemi parametry – rok
        výroby, najeté km, palivo, převodovka a lokalita.
      </p>
      <p>
        Značka <strong>{brandName}</strong> patří mezi nejvyhledávanější vozy
        na českém trhu. Na NNAuto najdete jak ojeté kusy s prověřenou
        historií, tak novější ročníky. Každý inzerát obsahuje detailní popis,
        fotografie, technické parametry a kontakt přímo na majitele nebo
        autobazar – bez zbytečných mezičlánků a skrytých poplatků.
      </p>
      <p>
        Pokud hledáte konkrétní model <strong>{brandName}</strong>, využijte{" "}
        <a
          href={`/listings?brand=${encodeURIComponent(brandSlug)}`}
          className="underline"
        >
          kompletní filtr na stránce inzerátů
        </a>{" "}
        – nastavíte rozsah ceny, roku a najetých km a najdete přesně to auto,
        které vám bude vyhovovat. Můžete také kombinovat filtr značky s typem
        paliva (benzín, diesel, hybrid, elektro), převodovkou (manuál,
        automat) nebo regionem prodejce.
      </p>
      <p>
        U každého vozu {brandName} doporučujeme zkontrolovat servisní knihu,
        stav karoserie, nájezd a v případě staršího ročníku objednat
        prověření přes <strong>Cebia</strong> – ušetříte si tak nepříjemná
        překvapení s historií vozu. NNAuto u inzerátů s prověřením Cebia
        zobrazuje speciální štítek, takže snadno poznáte ověřená auta.
      </p>
    </section>
  );
}

type BrandStatsInput = {
  rows: Array<{ price: unknown; year: number | null; fuelType: unknown }>;
  popularModels: Array<{ model: string }>;
};

export function BrandStatsBlock({
  brandName,
  stats,
}: {
  brandName: string;
  stats: BrandStatsInput;
}) {
  if (!shouldRenderSeoText("brandSeoIntro")) return null;

  const prices = stats.rows
    .map((l) => Number(l.price))
    .filter((p) => p > 0)
    .sort((a, b) => a - b);
  const years = stats.rows.map((l) => l.year).filter(Boolean).sort() as number[];
  const fuels = new Map<string, number>();
  for (const l of stats.rows) {
    const f = Array.isArray(l.fuelType) ? l.fuelType[0] : null;
    if (f) fuels.set(String(f), (fuels.get(String(f)) ?? 0) + 1);
  }
  if (prices.length < 3) return null;

  const minPrice = prices[0].toLocaleString("cs-CZ");
  const maxPrice = prices[prices.length - 1].toLocaleString("cs-CZ");
  const minYear = years[0];
  const maxYear = years[years.length - 1];
  const topFuels = [...fuels.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <section className="mt-8 prose max-w-none text-muted-foreground">
      <h2 className="text-xl font-semibold text-foreground">
        {brandName} na NNAuto v číslech
      </h2>
      <p>
        Aktuálně nabízíme <strong>{stats.rows.length}+ vozů {brandName}</strong> v
        cenovém rozpětí od <strong>{minPrice} Kč</strong> do{" "}
        <strong>{maxPrice} Kč</strong>.
        Ročníky v nabídce sahají od <strong>{minYear}</strong> do{" "}
        <strong>{maxYear}</strong>.
        {topFuels.length > 0 ? (
          <>
            {" "}
            Nejčastější palivo:{" "}
            {topFuels.map(([f, c]) => `${f} (${c}×)`).join(", ")}.
          </>
        ) : null}
      </p>
      <p>
        Nejoblíbenější modely {brandName} s aktivní nabídkou:{" "}
        {stats.popularModels
          .slice(0, 5)
          .map((m) => m.model)
          .join(", ")}
        . Každý model má vlastní stránku s filtry a detailním výpisem, kde
        porovnáte ceny, najeté km, stav a výbavu — vše na jednom místě bez
        potřeby jiného bazaru.
      </p>
    </section>
  );
}
