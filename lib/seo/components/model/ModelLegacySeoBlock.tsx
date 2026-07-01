import { isSeoTextsEnabled } from "@lib/seo/features";

export function ModelLegacySeoBlock({
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
  if (!isSeoTextsEnabled()) return null;

  return (
    <section className="mt-12 prose max-w-none text-muted-foreground space-y-4 text-[15px] leading-relaxed">
      <h2 className="text-2xl font-semibold text-foreground">
        {brandName} {modelName} – co je dobré vědět před nákupem
      </h2>
      <p>
        <strong>
          {brandName} {modelName}
        </strong>{" "}
        patří mezi vyhledávané modely na českém trhu ojetých vozů. Pokud
        zvažujete nákup, zaměřte se zejména na servisní historii, soulad
        reálného nájezdu s údaji v technickém průkazu a celkový technický
        stav vozu. U starších ročníků je vhodné nechat vůz prohlédnout v
        autorizovaném servisu nebo nezávislým technikem – odhalíte tak skryté
        závady, které z popisu nebo fotografií nemusí být patrné.
      </p>
      <p>
        Při výběru konkrétního {brandName} {modelName} doporučujeme porovnat
        několik inzerátů z podobné cenové i ročníkové kategorie. Cena vozu se
        odvíjí od roku výroby, najetých kilometrů, výbavy, stavu karoserie,
        motorového a převodového ústrojí. Vozy se servisní knihou a
        doložitelnou historií mají na sekundárním trhu vyšší hodnotu a snáze
        se prodávají dál.
      </p>
      <h3 className="text-xl font-semibold text-foreground">
        Motory, převodovky a varianty
      </h3>
      <p>
        Model {modelName} bývá u značky {brandName} obvykle dostupný v několika
        motorizacích – benzín, diesel, případně hybrid nebo elektro. Každá
        varianta má své výhody: zážehové motory bývají tišší a mají nižší
        pořizovací cenu, vznětové motory nabízejí vyšší krouticí moment a
        delší dojezd, hybridní pohon pak nižší spotřebu ve městě. Před
        nákupem si rozmyslete, kolik kilometrů ročně najedete – pro převážně
        městský provoz se vyplatí benzín nebo hybrid, pro dálniční jízdy
        spíše diesel.
      </p>
      <p>
        Převodovka může být manuální nebo automatická (klasická, dvouspojková,
        CVT). Automatické převodovky jsou pohodlnější, ale vyžadují pravidelnou
        výměnu oleje a mohou být nákladnější na opravy. Manuální převodovka je
        obvykle spolehlivější a levnější v servisu.
      </p>
      <h3 className="text-xl font-semibold text-foreground">
        Co zkontrolovat při prohlídce {modelName}
      </h3>
      <p>
        Při prohlídce {brandName} {modelName} se zaměřte na rovnoměrnost spár
        karoserie, kvalitu laku, případnou korozi pod prahy a v podběhu kol,
        stav podvozku a stav motorového prostoru. V interiéru zkontrolujte
        funkčnost elektroniky, klimatizace, multimédií a všech tlačítek.
        Otestujte vozidlo na jízdě: poslouchejte motor, sledujte chování při
        brzdění, akceleraci a řazení.
      </p>
      <p>
        Pro starší vozy je rozumné objednat report z VIN kódu –{" "}
        <strong>Cebia</strong> nabízí online prověření historie vozu včetně
        počtu majitelů, kontroly nájezdu, případných havárií a zástav.
        Investice v řádu stovek korun vám může ušetřit nepříjemnosti za
        desetitisíce.
      </p>
      <h3 className="text-xl font-semibold text-foreground">
        Prodej {brandName} {modelName} přes NNAuto
      </h3>
      <p>
        Pokud naopak chcete {brandName} {modelName} prodat,{" "}
        <a href="/add-listing" className="underline">
          vložte inzerát zdarma na NNAuto
        </a>
        . Doporučujeme nahrát alespoň 8–12 fotografií ve dne, popsat výbavu,
        servisní historii i případné drobné vady. Inzerát s kvalitními
        fotografiemi a podrobným popisem se prodává rychleji a za lepší cenu.
        Pro maximální dosah využijte zvýraznění{" "}
        <a href="/pricing" className="underline">
          TOP inzerátu
        </a>
        .
      </p>
      <p>
        Cenu stanovte podle aktuální nabídky podobných vozů – u tohoto modelu
        na NNAuto najdete{" "}
        <a
          href={`/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}`}
          className="underline"
        >
          kompletní katalog s pokročilými filtry
        </a>{" "}
        (rok, cena, najeto, palivo, převodovka, region). Realistická cena s
        ohledem na technický stav, výbavu a sezónu vede k úspěšnému prodeji
        během několika dnů.
      </p>
    </section>
  );
}
