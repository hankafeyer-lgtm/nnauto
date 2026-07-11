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
];

const PRIORITY_MODEL_LINKS = [
  { href: "/auta/renault/megane", label: "Renault Megane na prodej" },
  { href: "/auta/renault/scenic", label: "Renault Scenic na prodej" },
  { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq na prodej" },
  { href: "/auta/skoda/octavia", label: "Škoda Octavia na prodej" },
  { href: "/auta/volkswagen/golf-gti", label: "Golf GTI na prodej" },
  { href: "/auta/mercedes-benz/c-class", label: "Mercedes C na prodej" },
  { href: "/auta/suv", label: "SUV auta na prodej" },
  { href: "/auta/automat", label: "Auta s automatem" },
] as const;

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
              <a
                href={`/auta/${slug}`}
                className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {formatBrandDisplay(slug)}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="listings-seo-priority"
        className="container mx-auto max-w-6xl px-4 pb-8"
      >
        <h2
          id="listings-seo-priority"
          className="text-lg font-semibold mb-3"
        >
          Nejhledanější ojetá auta
        </h2>
        <ul className="flex flex-wrap gap-2">
          {PRIORITY_MODEL_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
              >
                {link.label}
              </a>
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
            dodávky a nákladní vozidla.
          </p>
          <p>
            Mezi nejhledanější značky v ČR patří{" "}
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
