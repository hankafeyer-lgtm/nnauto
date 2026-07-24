import type { ReactNode } from "react";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import { isSeoTextsEnabled } from "@lib/seo/features";

const POPULAR_BRANDS = [
  "bmw",
  "audi",
  "skoda",
  "mercedes-benz",
  "volkswagen",
  "volvo",
  "ford",
  "jeep",
  "renault",
  "hyundai",
];

/** Tutut-style internal link blocks: “Ojeté vozy …” + “Nejlevnější …” */
const FOOTER_MODEL_LINKS = [
  { href: "/auta/skoda/octavia", name: "Škoda Octavia" },
  { href: "/auta/skoda/fabia", name: "Škoda Fabia" },
  { href: "/auta/skoda/superb", name: "Škoda Superb" },
  { href: "/auta/skoda/kodiaq", name: "Škoda Kodiaq" },
  { href: "/auta/skoda/karoq", name: "Škoda Karoq" },
  { href: "/auta/volkswagen/golf", name: "Volkswagen Golf" },
  { href: "/auta/volkswagen/golf-gti", name: "Volkswagen Golf GTI" },
  { href: "/auta/volkswagen/passat", name: "Volkswagen Passat" },
  { href: "/auta/volkswagen/tiguan", name: "Volkswagen Tiguan" },
  { href: "/auta/volkswagen/touran", name: "Volkswagen Touran" },
  { href: "/auta/bmw/3-series", name: "BMW 3" },
  { href: "/auta/bmw/x5", name: "BMW X5" },
  { href: "/auta/bmw/5-series", name: "BMW 5" },
  { href: "/auta/audi/a4", name: "Audi A4" },
  { href: "/auta/audi/a6", name: "Audi A6" },
  { href: "/auta/mercedes-benz/c-class", name: "Mercedes-Benz C" },
  { href: "/auta/mercedes-benz/e-class", name: "Mercedes-Benz E" },
  { href: "/auta/renault/megane", name: "Renault Megane" },
  { href: "/auta/renault/scenic", name: "Renault Scenic" },
  { href: "/auta/ford/focus", name: "Ford Focus" },
  { href: "/auta/ford/mondeo", name: "Ford Mondeo" },
  { href: "/auta/hyundai/i30", name: "Hyundai i30" },
  { href: "/auta/hyundai/tucson", name: "Hyundai Tucson" },
  { href: "/auta/kia/ceed", name: "Kia Ceed" },
  { href: "/auta/kia/sportage", name: "Kia Sportage" },
  { href: "/auta/toyota/corolla", name: "Toyota Corolla" },
  { href: "/auta/opel/astra", name: "Opel Astra" },
  { href: "/auta/volvo/v90", name: "Volvo V90" },
] as const;

const GUIDE_LINKS = [
  { href: "/auta/suv", label: "SUV auta na prodej" },
  { href: "/auta/7-mistna-auta", label: "7 místná auta" },
  { href: "/auta/automat", label: "Auta s automatem" },
  { href: "/auta/elektro-suv", label: "Elektro SUV" },
  { href: "/auta/ojeta-auta-ostrava", label: "Ojetá auta Ostrava" },
  { href: "/auta/auta-brno-na-prodej", label: "Auta Brno na prodej" },
  { href: "/auta/nejlepsi-rodinna-auta", label: "Nejlepší rodinná auta" },
  { href: "/porovnani/golf-vs-octavia", label: "Golf vs Octavia" },
  { href: "/porovnani/kodiaq-vs-tiguan", label: "Kodiaq vs Tiguan" },
] as const;

function LinkChip({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
    >
      {children}
    </a>
  );
}

export function ListingsSeoFooter() {
  if (!isSeoTextsEnabled()) return null;

  return (
    <>
      <section
        aria-labelledby="listings-seo-brands"
        className="container mx-auto max-w-6xl px-4 py-10 border-t mt-8"
      >
        <h2
          id="listings-seo-brands"
          className="text-xl md:text-2xl font-semibold mb-4"
        >
          Procházet podle značky
        </h2>
        <ul className="flex flex-wrap gap-2">
          {POPULAR_BRANDS.map((slug) => (
            <li key={slug}>
              <LinkChip href={`/auta/${slug}`}>
                {formatBrandDisplay(slug)}
              </LinkChip>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="listings-seo-ojete"
        className="container mx-auto max-w-6xl px-4 pb-8"
      >
        <h2
          id="listings-seo-ojete"
          className="text-lg font-semibold mb-3"
        >
          Ojetá auta na prodej
        </h2>
        <ul className="flex flex-wrap gap-2">
          {FOOTER_MODEL_LINKS.map((link) => (
            <li key={`ojete-${link.href}`}>
              <LinkChip href={link.href}>Ojeté vozy {link.name}</LinkChip>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="listings-seo-nejlevnejsi"
        className="container mx-auto max-w-6xl px-4 pb-8"
      >
        <h2
          id="listings-seo-nejlevnejsi"
          className="text-lg font-semibold mb-3"
        >
          Nejlevnější auta na prodej
        </h2>
        <ul className="flex flex-wrap gap-2">
          {FOOTER_MODEL_LINKS.map((link) => (
            <li key={`cheap-${link.href}`}>
              <LinkChip href={link.href}>Nejlevnější {link.name}</LinkChip>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="listings-seo-guides"
        className="container mx-auto max-w-6xl px-4 pb-8"
      >
        <h2
          id="listings-seo-guides"
          className="text-lg font-semibold mb-3"
        >
          Průvodci a kategorie
        </h2>
        <ul className="flex flex-wrap gap-2">
          {GUIDE_LINKS.map((link) => (
            <li key={link.href}>
              <LinkChip href={link.href}>{link.label}</LinkChip>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="listings-seo-text"
        className="container mx-auto max-w-6xl px-4 pb-12"
      >
        <h2
          id="listings-seo-text"
          className="text-xl md:text-2xl font-semibold mb-3"
        >
          Inzeráty vozidel – ojetá i nová auta v ČR
        </h2>
        <div className="prose max-w-none text-muted-foreground space-y-3 text-[15px] leading-relaxed">
          <p>
            Aktuální nabídka <strong>ojetých i nových vozů</strong> na NNAuto
            pokrývá všechny populární kategorie – osobní auta, motocykly,
            dodávky a nákladní vozidla. Porovnejte ceny, ročníky a výbavu a
            kontaktujte prodejce přímo.
          </p>
          <p>
            Mezi nejhledanější značky v ČR patří{" "}
            <a href="/auta/skoda" className="underline">
              Škoda bazar
            </a>
            ,{" "}
            <a href="/auta/volkswagen" className="underline">
              Volkswagen bazar
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
            . Oblíbené modely:{" "}
            <a href="/auta/skoda/kodiaq" className="underline">
              Škoda Kodiaq
            </a>
            ,{" "}
            <a href="/auta/volkswagen/golf-gti" className="underline">
              Golf GTI
            </a>
            ,{" "}
            <a href="/auta/renault/megane" className="underline">
              Renault Megane
            </a>
            .
          </p>
          <p>
            Při výběru ojetého auta si vždy zkontrolujte servisní knihu a stav
            karoserie. U starších vozidel doporučujeme prověření přes{" "}
            <strong>Cebia</strong>. Více{" "}
            <a href="/tips" className="underline">
              tipů a rad při nákupu auta
            </a>
            .
          </p>
          <p>
            Prodáváte vůz? Vložte{" "}
            <a href="/add-listing" className="underline">
              vlastní inzerát zdarma
            </a>
            . Pro rychlejší prodej využijte{" "}
            <a href="/pricing" className="underline">
              TOP zvýraznění
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
