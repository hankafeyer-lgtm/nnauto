import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildHomePageJsonLdGraph } from "@lib/seo/structured-data";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import HomeClient from "./home-client";

const HOME_TITLE =
  "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel";
const HOME_DESCRIPTION =
  "NNAuto – moderní online autobazar v ČR. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel. Filtrujte podle značky, modelu, ceny a regionu.";
const HOME_OG_DESCRIPTION =
  "Najděte své vysněné auto na NNAuto. Osobní auta, motocykly i nákladní vozy. Ověření prodejci, pokročilé filtry a kontakt přímo s majitelem inzerátu.";

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

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  openGraph: {
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description: HOME_OG_DESCRIPTION,
    url: "https://nnauto.cz",
    siteName: "NNAuto",
    images: [{ url: "https://nnauto.cz/og-image.png", width: 1200, height: 630 }],
    locale: "cs_CZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NNAuto - Prémiový Marketplace Aut v České Republice",
    description: HOME_OG_DESCRIPTION,
    images: ["https://nnauto.cz/og-image.png"],
  },
  alternates: { canonical: "https://nnauto.cz" },
};

export default function Home() {
  return (
    <>
      <JsonLd data={buildHomePageJsonLdGraph()} />
      {/* SEO H1 — kept visually hidden so the hero design stays untouched. */}
      <h1 className="sr-only">
        Prodej a nákup ojetých aut v ČR
      </h1>
      <HomeClient />

      {/* Visible SEO content block — placed below the dynamic hero / listings.
          Server-rendered so crawlers see real text and internal links to brand
          landings. Does not interfere with filters or any client-side state. */}
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

      <section
        aria-labelledby="home-seo-text"
        className="container mx-auto max-w-6xl px-4 pb-12"
      >
        <h2
          id="home-seo-text"
          className="text-xl md:text-2xl font-semibold mb-3"
        >
          Online autobazar NNAuto – prodej a nákup ojetých aut v ČR
        </h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
          <p>
            <strong>NNAuto</strong> je moderní online autobazar pro Českou
            republiku, kde najdete tisíce ověřených inzerátů osobních aut,
            motocyklů, dodávek a nákladních vozidel. Spojujeme prodejce a
            kupce přímo, bez mezičlánků a bez skrytých provizí. Každý
            inzerát obsahuje detailní popis vozu, fotografie z více
            úhlů, technické parametry, výbavu, servisní historii a kontakt
            přímo na majitele nebo prověřený autobazar. Komunikace probíhá
            telefonicky nebo přes integrovaný formulář – bez prostředníků,
            bez čekání a bez nejasných smluv.
          </p>
          <p>
            Vyberte si auto pomocí pokročilých filtrů – nastavte si značku
            (například{" "}
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
            </a>
            ,{" "}
            <a href="/auta/mercedes-benz" className="underline">
              Mercedes-Benz
            </a>
            ,{" "}
            <a href="/auta/volkswagen" className="underline">
              Volkswagen
            </a>{" "}
            nebo{" "}
            <a href="/auta/volvo" className="underline">
              Volvo
            </a>
            ), model, rok výroby, rozsah ceny a najetých kilometrů,
            palivo, převodovku nebo region prodejce. Inzeráty filtrujete v
            reálném čase – po každé změně parametru okamžitě vidíte, kolik
            vozů aktuálně odpovídá vašemu zadání. Můžete kombinovat
            libovolný počet filtrů: třeba diesel automat do 250 000 Kč v
            Praze nebo benzínový kombík s pohonem 4×4 v Moravskoslezském
            kraji.
          </p>
          <p>
            Prodáváte auto? Vložte zdarma inzerát během několika minut.
            Nahrajte fotografie (doporučujeme alespoň 8–12 snímků
            exteriéru, interiéru, motorového prostoru a tachometru),
            popište výbavu, servisní historii a uveďte aktuální cenu.
            Inzerát je po schválení viditelný okamžitě pro všechny
            návštěvníky NNAuto. Pro rychlejší prodej můžete využít
            zvýraznění{" "}
            <a href="/pricing" className="underline">
              TOP inzerátu
            </a>{" "}
            – posune vaši nabídku nahoru ve výpisu a označí ji výrazným
            štítkem. Doplňkově nabízíme prověření vozu přes{" "}
            <strong>Cebia</strong>, které online z VIN kódu odhalí
            historii vozu, počet majitelů, případné havárie, zástavu nebo
            kontrolu reálného nájezdu kilometrů.
          </p>
          <p>
            Kupujete ojeté auto? Vždy si u staršího vozu prověřte servisní
            knížku, stav karoserie (zejména prahy, blatníky, lemy kol a
            podběhy), kvalitu laku, stav motoru a převodovky a hlavně
            soulad reálného nájezdu s technickým průkazem. U vozů
            starších 7 let doporučujeme objednat report Cebia ještě před
            osobní prohlídkou – ušetříte si zbytečné cesty za auty s
            problematickou historií. Užitečné{" "}
            <a href="/tips" className="underline">
              tipy a rady při nákupu i prodeji auta
            </a>{" "}
            jsme připravili v samostatné sekci. Najdete tam praktické
            kontrolní seznamy, vzorové smlouvy a postupy při převodu vozu
            v registru vozidel.
          </p>
          <p>
            Na NNAuto najdete také kategorie{" "}
            <a href="/auta/ford" className="underline">
              Ford
            </a>
            ,{" "}
            <a href="/auta/jeep" className="underline">
              Jeep
            </a>
            , Hyundai, Kia, Toyota, Renault, Peugeot, Citroën, Opel, Fiat
            a další značky. Vozy řadíme podle ročníku, ceny, najetých
            kilometrů nebo data přidání inzerátu. Zobrazení můžete
            přepínat mezi mřížkou s velkými fotografiemi a kompaktním
            seznamem se všemi parametry najednou. Inzeráty s výrazně
            sníženou cenou poznáte podle barevného štítku, ověřené vozy
            přes Cebia mají vlastní označení.
          </p>
          <p>
            <strong>Bezpečné nakupování</strong> začíná u kvalitních
            informací. NNAuto u každého inzerátu zveřejňuje přesný
            ročník, nájezd, palivo, převodovku, počet majitelů a region
            prodejce. Cena je vždy uvedena jako koncová – bez skrytých
            poplatků, bez DPH navíc, bez „od“ či „do“ rozpětí. Pro
            doplňující informace nebo objednání prohlídky můžete prodejce
            kontaktovat přímo, bez registrace. Pro pravidelné inzerenty
            nabízíme dealerský účet se statistikami zobrazení, kliků a
            kontaktů u každého inzerátu.
          </p>
          <p>
            <strong>NNAuto na mobilu i počítači.</strong> Stránky jsou
            optimalizované pro rychlé načítání i na pomalejším
            mobilním připojení – fotografie se postupně dohrávají ve
            vysokém rozlišení a uložené filtry zůstávají i po obnovení
            stránky. Inzeráty si můžete uložit a později se k nim vrátit.
            Více se o nás dozvíte na stránce{" "}
            <a href="/about" className="underline">
              O nás
            </a>{" "}
            nebo se podívejte na{" "}
            <a href="/pricing" className="underline">
              ceník služeb
            </a>{" "}
            včetně Cebia prověření a TOP zvýraznění.
          </p>
        </div>
      </section>
    </>
  );
}
