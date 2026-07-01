import { formatBrandDisplay, formatModelDisplay } from "./brand-format";
import { normalizeSlug } from "./slug";

export type BrandSeoStats = {
  total: number;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  topFuels?: { name: string; count: number }[];
  popularModels?: { name: string; slug: string; count: number }[];
};

export type ModelSeoStats = {
  total: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  minYear?: number | null;
  maxYear?: number | null;
  fuels?: { name: string; count: number }[];
  transmissions?: { name: string; count: number }[];
  bodies?: { name: string; count: number }[];
  siblingModels?: { name: string; slug: string; count: number }[];
};

export type FaqItem = { question: string; answer: string };

const FUEL_CS: Record<string, string> = {
  benzin: "benzín",
  diesel: "nafta",
  hybrid: "hybrid",
  elektro: "elektro",
  electric: "elektro",
  lpg: "LPG",
  cng: "CNG",
};

function fuelLabel(raw: string): string {
  return FUEL_CS[raw.toLowerCase()] || raw;
}

function formatPrice(n: number): string {
  return n.toLocaleString("cs-CZ");
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Ensure intro paragraphs reach roughly 300–500 words by appending neutral blocks. */
function padToWordRange(paragraphs: string[], min = 300, max = 520): string[] {
  const fillers = [
    "Na NNAuto.cz můžete porovnat více inzerátů vedle sebe, filtrovat podle roku, ceny, najetých kilometrů i regionu prodejce. Každý vůz má vlastní detail s fotografiemi a kontaktem přímo na majitele nebo autobazar.",
    "Před koupí doporučujeme osobní prohlídku, zkušební jízdu a u starších ročníků prověření historie vozu. U inzerátů s ověřením Cebia snadno poznáte vozy s prověřeným VIN kódem.",
    "Nabídka se průběžně obměňuje – nové inzeráty přibývají denně od soukromých prodejců i dealerů z celé České republiky. Uložte si oblíbené vozy a vraťte se k nim později.",
    "Prodejci na NNAuto uvádějí reálné ceny bez skrytých poplatků. U vybraných vozů je možné domluvit financování nebo protiúčet přímo s prodejcem.",
  ];
  const out = [...paragraphs];
  let i = 0;
  while (wordCount(out.join(" ")) < min && i < fillers.length) {
    out.push(fillers[i++]);
  }
  let text = out.join("\n\n");
  while (wordCount(text) > max && out.length > 1) {
    out.pop();
    text = out.join("\n\n");
  }
  return out;
}

export function buildBrandSeoIntro(
  brandSlug: string,
  stats: BrandSeoStats,
): string[] {
  const brand = formatBrandDisplay(brandSlug);
  const paragraphs: string[] = [];

  paragraphs.push(
    `Hledáte ojetý nebo zánovní vůz značky ${brand}? Na NNAuto.cz najdete aktuální nabídku vozů ${brand} od soukromých prodejců i ověřených autobazarů. Prohlížíte fotografie, technické parametry a kontaktujete prodejce přímo, bez zprostředkovatelů.`,
  );

  if (stats.total > 0) {
  paragraphs.push(
      `V tuto chvíli je v katalogu ${stats.total} ${stats.total === 1 ? "inzerát" : stats.total < 5 ? "inzeráty" : "inzerátů"} značky ${brand}${
        stats.minPrice && stats.maxPrice
          ? ` v cenovém rozpětí ${formatPrice(stats.minPrice)} – ${formatPrice(stats.maxPrice)} Kč`
          : ""
      }${
        stats.minYear && stats.maxYear
          ? `, ročníky ${stats.minYear}–${stats.maxYear}`
          : ""
      }.`,
    );
  }

  if (stats.topFuels?.length) {
    const fuelList = stats.topFuels
      .slice(0, 3)
      .map((f) => `${fuelLabel(f.name)} (${f.count}×)`)
      .join(", ");
    paragraphs.push(
      `Mezi nejčastější motorizace v nabídce ${brand} patří: ${fuelList}. Podle typu provozu si vyberete benzínový motor pro město, naftu pro delší trasy nebo hybrid pro nižší spotřebu.`,
    );
  }

  if (stats.popularModels?.length) {
    const models = stats.popularModels
      .slice(0, 6)
      .map((m) => `${brand} ${formatModelDisplay(m.name)}`)
      .join(", ");
    paragraphs.push(
      `Nejoblíbenější modely ${brand} s aktivní nabídkou: ${models}. Každý model má na NNAuto vlastní stránku s přehledem inzerátů, kde porovnáte ceny, nájezd a výbavu.`,
    );
  }

  paragraphs.push(
    `Značka ${brand} má na českém trhu dlouhou tradici a širokou servisní síť. Při výběru konkrétního vozu doporučujeme zkontrolovat servisní historii, stav karoserie a soulad uvedeného nájezdu s technickým průkazem. U starších kusů se vyplatí nechat auto projít nezávislou kontrolou nebo objednat report z VIN kódu.`,
  );

  paragraphs.push(
    `Na stránce ${brand} na prodej filtrujete inzeráty podle roku, ceny, paliva, převodovky i regionu. Výpis je přehledný a aktualizovaný – nové nabídky přibývají průběžně. Pokud prodáváte vlastní ${brand}, vložte inzerát zdarma a oslovte tisíce zájemců po celé republice.`,
  );

  return padToWordRange(paragraphs);
}

export function buildBrandFaq(
  brandSlug: string,
  stats: BrandSeoStats,
): FaqItem[] {
  const brand = formatBrandDisplay(brandSlug);

  const priceAnswer =
    stats.minPrice && stats.maxPrice && stats.total > 0
      ? `Aktuální nabídka ${brand} na NNAuto se pohybuje od ${formatPrice(stats.minPrice)} do ${formatPrice(stats.maxPrice)} Kč. Konkrétní cena závisí na roku výroby, nájezdu, výbavě a technickém stavu vozu.`
      : `Cena ojetých vozů ${brand} závisí na roku výroby, nájezdu, výbavě a stavu auta. Aktuální inzeráty s uvedenými cenami najdete přímo na této stránce.`;

  const modelsAnswer =
    stats.popularModels && stats.popularModels.length > 0
      ? `V nabídce jsou zejména modely ${stats.popularModels
          .slice(0, 8)
          .map((m) => formatModelDisplay(m.name))
          .join(", ")}. Kompletní přehled najdete v sekci populárních modelů níže.`
      : `Dostupné modely ${brand} se mění podle aktuálních inzerátů. Prohlédněte si výpis vozů na této stránce nebo použijte filtr v katalogu.`;

  return [
    {
      question: `Kolik stojí ojeté vozy ${brand}?`,
      answer: priceAnswer,
    },
    {
      question: `Jaké modely ${brand} jsou dostupné?`,
      answer: modelsAnswer,
    },
    {
      question: `Na co si dát pozor při koupi vozu ${brand}?`,
      answer: `U vozů ${brand} kontrolujte servisní knihu, stav motoru a převodovky, koroze podvozku a historii vozu. Doporučujeme zkušební jízdu a u starších ročníků prověření přes Cebia report z VIN kódu.`,
    },
    {
      question: `Jak často se nabídka ${brand} aktualizuje?`,
      answer: `Nabídka ${brand} na NNAuto se obměňuje průběžně – nové inzeráty přibývají denně. Stránka se automaticky aktualizuje, takže vidíte aktuální dostupná auta.`,
    },
  ];
}

export function buildModelSeoIntro(
  brandSlug: string,
  modelSlug: string,
  stats: ModelSeoStats,
): string[] {
  const brand = formatBrandDisplay(brandSlug);
  const model = formatModelDisplay(modelSlug);
  const paragraphs: string[] = [];

  paragraphs.push(
    `Model ${brand} ${model} patří mezi často hledané vozy na českém trhu ojetin. Na NNAuto.cz najdete přehled aktuálních inzerátů s fotografiemi, cenami a technickými parametry – kontaktujete prodejce přímo, bez mezičlánků.`,
  );

  if (stats.total > 0) {
    paragraphs.push(
      `Momentálně nabízíme ${stats.total} ${stats.total === 1 ? "inzerát" : stats.total < 5 ? "inzeráty" : "inzerátů"} modelu ${brand} ${model}${
        stats.minPrice != null && stats.maxPrice != null
          ? ` v cenách ${formatPrice(stats.minPrice)} – ${formatPrice(stats.maxPrice)} Kč`
          : ""
      }${
        stats.minYear != null && stats.maxYear != null
          ? `, ročníky ${stats.minYear}–${stats.maxYear}`
          : ""
      }.`,
    );
  }

  if (stats.fuels?.length) {
    const list = stats.fuels
      .slice(0, 4)
      .map((f) => fuelLabel(f.name))
      .join(", ");
    paragraphs.push(
      `V nabídce ${brand} ${model} jsou k dispozici motorizace: ${list}. Volba paliva ovlivňuje spotřebu, provozní náklady i charakter jízdy – benzín je vhodný do města, nafta na delší trasy, hybrid snižuje spotřebu v kolonách.`,
    );
  }

  paragraphs.push(
    `Před koupí konkrétního ${brand} ${model} porovnejte několik inzerátů ze stejné ročníkové a cenové kategorie. Věnujte pozornost servisní historii, stavu podvozku, interiéru a funkčnosti elektroniky. U vozů s nejasnou historií doporučujeme prověření VIN kódu.`,
  );

  paragraphs.push(
    `Na stránce ${brand} ${model} na prodej filtrujete podle ceny, roku, nájezdu, paliva a regionu. Výpis je přehledný a pravidelně doplňovaný novými nabídkami od prodejců z celé České republiky.`,
  );

  return padToWordRange(paragraphs);
}

export function buildModelWhyBuy(
  brandSlug: string,
  modelSlug: string,
): string[] {
  const brand = formatBrandDisplay(brandSlug);
  const model = formatModelDisplay(modelSlug);
  return [
    `${brand} ${model} nabízí vyvážený poměr mezi komfortem, provozními náklady a praktičností. V závislosti na motorizaci a výbavě je vhodný pro každodenní dojíždění i delší cesty.`,
    `Na sekundárním trhu je ${model} dostupný v různých ročnících a cenových relacích – snadno si vyberete vůz podle rozpočtu a požadované výbavy. Široká servisní síť značky ${brand} usnadňuje údržbu i opravy.`,
    `Na NNAuto porovnáte více inzerátů ${brand} ${model} na jednom místě a kontaktujete prodejce bez poplatků za zprostředkování.`,
  ];
}

export function buildModelWatchOut(
  brandSlug: string,
  modelSlug: string,
): string[] {
  const brand = formatBrandDisplay(brandSlug);
  const model = formatModelDisplay(modelSlug);
  return [
    `U ojetého ${brand} ${model} zkontrolujte servisní intervaly, stav spojky nebo automatické převodovky a případné úniky kapalin. Prohlédněte si spáry karoserie, kvalitu laku a stav podvozku.`,
    `Ověřte, zda uvedený nájezd odpovídá stavu vozu a dokumentaci. U dieselových motorů je důležitá historie jízdy po dálnici oproti krátkým trasám ve městě.`,
    `Před podpisem smlouvy doporučujeme zkušební jízdu a u starších ročníků report z VIN kódu – odhalí počet majitelů, případné havárie a zástavy.`,
  ];
}

export function buildModelFaq(
  brandSlug: string,
  modelSlug: string,
  stats: ModelSeoStats,
): FaqItem[] {
  const brand = formatBrandDisplay(brandSlug);
  const model = formatModelDisplay(modelSlug);

  const priceAnswer =
    stats.minPrice != null && stats.maxPrice != null && stats.total > 0
      ? `${brand} ${model} na NNAuto aktuálně nabízíme od ${formatPrice(stats.minPrice)} do ${formatPrice(stats.maxPrice)} Kč. Přesná cena závisí na roku, nájezdu a výbavě konkrétního vozu.`
      : `Cena ${brand} ${model} se liší podle roku výroby, nájezdu a stavu auta. Aktuální inzeráty s cenami najdete ve výpisu na této stránce.`;

  const motorAnswer =
    stats.fuels && stats.fuels.length > 0
      ? `V nabídce jsou motorizace: ${stats.fuels.map((f) => fuelLabel(f.name)).join(", ")}. Dostupnost konkrétní varianty závisí na aktuálních inzerátech.`
      : `Dostupné motorizace ${brand} ${model} se mění podle inzerátů v katalogu. Podívejte se na filtr paliva ve výpisu vozů.`;

  return [
    { question: `Kolik stojí ${brand} ${model}?`, answer: priceAnswer },
    {
      question: `Jaké motorizace ${brand} ${model} jsou dostupné?`,
      answer: motorAnswer,
    },
    {
      question: `Je ${brand} ${model} vhodný vůz na každý den?`,
      answer: `${brand} ${model} je oblíbená volba pro každodenní provoz díky praktičnosti a dostupnosti na trhu ojetin. Vhodnost konkrétního kusu závisí na motorizaci, nájezdu a technickém stavu – proto doporučujeme porovnat více inzerátů.`,
    },
    {
      question: `Na co si dát pozor při koupi ${brand} ${model}?`,
      answer: `Kontrolujte servisní historii, stav motoru a převodovky, podvozek a interiér. U vyššího nájezdu ověřte poslední větší servisní úkony. Zkušební jízda a prověření VIN kódu vám pomohou vyhnout se nečekaným nákladům.`,
    },
  ];
}

export const SIMILAR_BRAND_SLUGS = [
  "bmw",
  "audi",
  "skoda",
  "mercedes-benz",
  "volkswagen",
  "volvo",
  "ford",
  "jeep",
  "toyota",
  "hyundai",
  "kia",
  "peugeot",
];

export function getSimilarBrandLinks(
  currentBrandSlug: string,
  limit = 8,
): { label: string; href: string }[] {
  const current = normalizeSlug(currentBrandSlug);
  return SIMILAR_BRAND_SLUGS.filter((slug) => slug !== current)
    .slice(0, limit)
    .map((slug) => ({
      label: formatBrandDisplay(slug),
      href: `/auta/${slug}`,
    }));
}

export function getSimilarModelLinks(
  brandSlug: string,
  siblings: { name: string; slug: string }[],
  limit = 8,
): { label: string; href: string }[] {
  const brand = formatBrandDisplay(brandSlug);
  return siblings.slice(0, limit).map((s) => ({
    label: `${brand} ${formatModelDisplay(s.name)}`,
    href: `/auta/${normalizeSlug(brandSlug)}/${s.slug}`,
  }));
}

export function getSimilarPriceLink(
  brandSlug: string,
  modelSlug: string,
  minPrice: number | null,
  maxPrice: number | null,
): { label: string; href: string } | null {
  if (minPrice == null || maxPrice == null) return null;
  const mid = Math.round((minPrice + maxPrice) / 2);
  const spread = Math.max(50000, Math.round(mid * 0.15));
  const priceMin = Math.max(0, mid - spread);
  const priceMax = mid + spread;
  return {
    label: "Vozy podobné ceny",
    href: `/listings?brand=${encodeURIComponent(brandSlug)}&model=${encodeURIComponent(modelSlug)}&priceMin=${priceMin}&priceMax=${priceMax}`,
  };
}
