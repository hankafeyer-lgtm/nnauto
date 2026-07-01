import type { FacetDefinition } from "./facets";
import type { CollectionStats } from "./facet-queries";
import { formatBrandDisplay } from "./brand-format";

export type FaqItem = { question: string; answer: string };

function fmt(n: number): string {
  return n.toLocaleString("cs-CZ");
}

export function buildFacetSeoIntro(
  facet: FacetDefinition,
  stats: CollectionStats,
  brandName?: string,
): string[] {
  const scope = brandName ? `${brandName} ` : "ojetá auta ";
  const paragraphs: string[] = [];

  paragraphs.push(
    `Na NNAuto.cz najdete aktuální nabídku vozů ${scope}${facet.label.toLowerCase()}. Prohlížíte fotografie, technické parametry a kontaktujete prodejce přímo bez mezičlánků.`,
  );

  if (stats.total > 0) {
    paragraphs.push(
      `V katalogu je momentálně ${stats.total} ${stats.total === 1 ? "inzerát" : stats.total < 5 ? "inzeráty" : "inzerátů"}${
        stats.minPrice && stats.maxPrice
          ? ` v cenách od ${fmt(stats.minPrice)} do ${fmt(stats.maxPrice)} Kč`
          : ""
      }${stats.avgPrice ? ` (průměrná cena ${fmt(stats.avgPrice)} Kč)` : ""}.`,
    );
  }

  paragraphs.push(
    `Filtrujte podle značky, modelu, roku výroby nebo regionu prodejce. Nabídka se průběžně obměňuje – nové inzeráty přibývají denně od soukromých prodejců i autobazarů z celé České republiky.`,
  );

  paragraphs.push(
    `Před koupí doporučujeme osobní prohlídku, zkušební jízdu a u starších ročníků prověření historie vozu přes Cebia report z VIN kódu.`,
  );

  return paragraphs;
}

export function buildFacetFaq(
  facet: FacetDefinition,
  stats: CollectionStats,
  brandName?: string,
): FaqItem[] {
  const label = brandName ? `${brandName} ${facet.label}` : facet.label;

  const priceAnswer =
    stats.minPrice && stats.maxPrice && stats.total > 0
      ? `Aktuální nabídka ${label} na NNAuto se pohybuje od ${fmt(stats.minPrice)} do ${fmt(stats.maxPrice)} Kč. Průměrná cena je ${fmt(stats.avgPrice)} Kč.`
      : `Ceny závisí na roku výroby, nájezdu a stavu vozu. Aktuální inzeráty najdete ve výpisu na této stránce.`;

  return [
    {
      question: `Kolik stojí ${label.toLowerCase()}?`,
      answer: priceAnswer,
    },
    {
      question: `Kolik vozů ${label.toLowerCase()} je v nabídce?`,
      answer:
        stats.total > 0
          ? `Momentálně nabízíme ${stats.total} aktivních inzerátů. Nabídka se průběžně aktualizuje.`
          : `Počet inzerátů se mění podle aktuální nabídky prodejců na NNAuto.cz.`,
    },
    {
      question: `Jak vybrat správné auto v kategorii ${facet.label}?`,
      answer: `Porovnejte několik inzerátů, zkontrolujte servisní historii, stav karoserie a najeté kilometry. U vybraných vozů doporučujeme zkušební jízdu a prověření VIN kódu.`,
    },
    {
      question: `Jak často se nabídka aktualizuje?`,
      answer: `Nabídka na NNAuto se obměňuje průběžně – nové inzeráty přibývají denně. Stránka se automaticky aktualizuje podle aktuálního inventáře.`,
    },
  ];
}

export function buildBrandFacetTitle(brandSlug: string, facet: FacetDefinition): string {
  const brand = formatBrandDisplay(brandSlug);
  return `${brand} ${facet.label} na prodej | Ojeté ${brand} | NNAuto`;
}
