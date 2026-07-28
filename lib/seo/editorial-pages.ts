import type { Metadata } from "next";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd, buildItemListJsonLd } from "@lib/seo/structured-data";
import type { FilterParams } from "@/hooks/useFilterParams";

export type EditorialLink = { href: string; label: string };

export type AutaGuidePage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  h2: string;
  intro: string;
  focus: string;
  links: EditorialLink[];
  faq: { question: string; answer: string }[];
  catalogFilters?: FilterParams;
};

export type ComparisonPage = {
  slug: string;
  title: string;
  description: string;
  h1: string;
  left: EditorialLink;
  right: EditorialLink;
  summary: string;
  faq: { question: string; answer: string }[];
};

export const AUTA_GUIDE_PAGES: AutaGuidePage[] = [
  {
    slug: "nejlepsi-rodinna-auta",
    title: "Nejlepší rodinná auta | Ojeté vozy pro rodinu | NNAuto",
    description: "Vyberte nejlepší rodinné auto podle prostoru, bezpečnosti, kufru a provozních nákladů. SUV, kombi i MPV na prodej v ČR.",
    h1: "Nejlepší rodinná auta",
    h2: "Jak vybrat rodinné auto",
    intro: "Rodinné auto musí zvládnout každodenní provoz, nákupy, dovolenou i dětské sedačky. Při výběru sledujte velikost kufru, prostor na zadních sedadlech, bezpečnostní výbavu, spotřebu a servisní náklady. Na NNAuto.cz můžete porovnat SUV, kombi i MPV a přejít přímo na aktuální nabídku vozů podle ceny, karoserie nebo modelu.",
    focus: "Nejčastější volbou pro rodinu bývá kombi nebo SUV, protože nabízí dobrý poměr prostoru a komfortu. Pro velkou rodinu dává smysl také MPV nebo van, kde je důležitý snadný přístup do zadní části vozu. Pokud jezdíte hlavně po městě, vyplatí se benzín nebo hybrid; pro delší trasy může být výhodná nafta. Před koupí vždy ověřte historii vozu, stav podvozku a funkčnost klimatizace, elektroniky a bezpečnostních systémů.",
    links: [
      { href: "/auta/suv", label: "SUV auta na prodej" },
      { href: "/auta/kombi", label: "Kombi auta na prodej" },
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq na prodej" },
      { href: "/auta/toyota/rav4", label: "Toyota RAV4 na prodej" },
    ],
    faq: [
      { question: "Jaké auto je nejlepší pro rodinu?", answer: "Pro běžnou rodinu jsou vhodná kombi a SUV, pro větší rodinu MPV nebo van. Důležitý je kufr, bezpečnost, prostor vzadu a servisní historie." },
      { question: "Je lepší SUV nebo kombi?", answer: "SUV nabízí vyšší posez a pohodlný nástup, kombi často větší kufr a nižší spotřebu. Záleží na typu provozu a rozpočtu." },
      { question: "Co zkontrolovat před koupí rodinného auta?", answer: "Kontrolujte historii, nájezd, stav brzd, podvozku, pneumatik, klimatizace a bezpečnostních prvků. U starších vozů doporučujeme VIN report." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv", "kombi", "mpv"] },
  },
  {
    slug: "auto-do-200000",
    title: "Auto do 200 000 Kč | Ojetá auta na prodej | NNAuto",
    description: "Aktuální nabídka ojetých aut do 200 000 Kč. Porovnejte městská auta, kombi, diesel i benzín podle ceny, nájezdu a stavu.",
    h1: "Auto do 200 000 Kč",
    h2: "Co čekat od auta do 200 000 Kč",
    intro: "Rozpočet do 200 000 Kč je na českém trhu ojetin velmi častý. V této ceně najdete starší městská auta, praktická kombi, menší SUV i úsporné diesely. Rozhodující není pouze cena, ale hlavně technický stav, servisní historie a reálný nájezd.",
    focus: "U levnějších aut se vyplatí počítat s rezervou na první servis po koupi. Sledujte stav rozvodů, spojky, brzd, pneumatik a korozi. Pokud auto kupujete na každodenní dojíždění, preferujte jednodušší motorizace a vozy s jasnou historií. Na NNAuto můžete nabídku filtrovat podle ceny, roku výroby, paliva, převodovky i regionu.",
    links: [
      { href: "/auta/do-200000", label: "Auta do 200 000 Kč" },
      { href: "/auta/benzin", label: "Benzínová auta" },
      { href: "/auta/diesel", label: "Diesel auta" },
      { href: "/auta/do-150000-km", label: "Auta do 150 000 km" },
    ],
    faq: [
      { question: "Dá se koupit spolehlivé auto do 200 000 Kč?", answer: "Ano, ale je potřeba vybírat podle stavu a historie. Nejdůležitější je servis, nájezd a kontrola před koupí." },
      { question: "Jaké auto do 200 000 Kč je vhodné jako první vůz?", answer: "Vhodné jsou jednoduché benzínové hatchbacky nebo menší kombi s levným servisem a dostupnými díly." },
      { question: "Je lepší diesel nebo benzín do 200 000 Kč?", answer: "Pro město spíše benzín, pro delší trasy může dávat smysl diesel s doloženou servisní historií." },
    ],
  },
  {
    slug: "auto-do-300000",
    title: "Auto do 300 000 Kč | Ojeté vozy v ČR | NNAuto",
    description: "Ojetá auta do 300 000 Kč na prodej. Porovnejte SUV, kombi, hatchbacky a vozy s automatem podle ceny a nájezdu.",
    h1: "Auto do 300 000 Kč",
    h2: "Výběr ojetého auta do 300 000 Kč",
    intro: "Do 300 000 Kč se otevírá širší výběr mladších ojetých vozů, často s lepší výbavou a rozumným nájezdem. Najdete zde praktická kombi, rodinná SUV, hatchbacky i vozy s automatickou převodovkou.",
    focus: "Při výběru auta do 300 000 Kč sledujte poměr ceny, stáří, nájezdu a servisních nákladů. U dieselů ověřte stav DPF a vstřikování, u automatů servis převodovky. Pro rodinu dávejte přednost prostoru, bezpečnostní výbavě a jasné historii.",
    links: [
      { href: "/auta/do-300000", label: "Auta do 300 000 Kč" },
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/kombi", label: "Kombi auta" },
    ],
    faq: [
      { question: "Jaké auto koupit do 300 000 Kč?", answer: "Záleží na použití. Pro rodinu SUV nebo kombi, do města hatchback, pro delší trasy diesel s doloženým servisem." },
      { question: "Vyplatí se automat do 300 000 Kč?", answer: "Ano, pokud má převodovka doložený servis a při zkušební jízdě řadí plynule bez škubání." },
      { question: "Na co si dát pozor?", answer: "Kontrolujte nájezd, historii, stav podvozku, brzdy, pneumatiky a případné úniky kapalin." },
    ],
  },
  {
    slug: "auto-do-500000",
    title: "Auto do 500 000 Kč | Ojetá auta na prodej | NNAuto",
    description: "Ojetá auta do 500 000 Kč v ČR. Vyberte SUV, kombi, automat, hybrid nebo diesel podle aktuální nabídky a výbavy.",
    h1: "Auto do 500 000 Kč",
    h2: "Ojeté auto do 500 000 Kč",
    intro: "Rozpočet do 500 000 Kč umožňuje vybírat z modernějších ojetých aut s lepší bezpečnostní výbavou, komfortem a často nižším nájezdem. V nabídce bývají SUV, kombi, vozy s automatem i hybridy.",
    focus: "U aut do 500 000 Kč se vyplatí sledovat nejen cenu, ale i původ, servisní historii a zůstatkovou hodnotu. U mladších vozů ověřte, zda byla dodržena pravidelná údržba a zda auto nebylo havarované. Na NNAuto můžete porovnat konkrétní inzeráty a kontaktovat prodejce přímo.",
    links: [
      { href: "/auta/do-500000", label: "Auta do 500 000 Kč" },
      { href: "/auta/hybrid", label: "Hybridní auta" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/automat", label: "Automat" },
    ],
    faq: [
      { question: "Co koupit do 500 000 Kč?", answer: "Často dává smysl mladší SUV, kombi nebo vůz s automatem. Rozhoduje stav, výbava a servisní historie." },
      { question: "Je lepší nové levné auto nebo ojeté do 500 000 Kč?", answer: "Ojeté auto může nabídnout vyšší třídu a lepší výbavu, nové zase záruku. Porovnejte celkové náklady." },
      { question: "Jak poznat dobrý kus?", answer: "Dobrý kus má jasnou historii, odpovídající nájezd, pravidelný servis a bezproblémovou zkušební jízdu." },
    ],
  },
  {
    slug: "nejlepsi-suv",
    title: "Nejlepší SUV | Ojetá SUV auta na prodej | NNAuto",
    description: "Nejlepší SUV pro rodinu, město i delší trasy. Porovnejte ojetá SUV podle ceny, nájezdu, paliva a pohonu.",
    h1: "Nejlepší SUV",
    h2: "Jak vybrat nejlepší SUV",
    intro: "SUV patří mezi nejhledanější typy ojetých aut. Nabízí vyšší posez, pohodlné nastupování, dobrou praktičnost a často i pohon 4x4 nebo AWD. Při výběru sledujte spotřebu, prostor, stav podvozku a cenu servisu.",
    focus: "Pro město může stačit menší SUV s benzínovým motorem, pro rodinu větší SUV s prostorným kufrem a bezpečnostní výbavou. Pokud jezdíte často mimo město nebo v zimě do hor, zvažte pohon všech kol. Na NNAuto najdete SUV různých značek a cenových kategorií.",
    links: [
      { href: "/auta/suv", label: "SUV auta na prodej" },
      { href: "/auta/4x4", label: "SUV 4x4" },
      { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq" },
      { href: "/auta/toyota/rav4", label: "Toyota RAV4" },
      { href: "/auta/bmw/x5", label: "BMW X5" },
    ],
    faq: [
      { question: "Jaké SUV je nejlepší?", answer: "Neexistuje jedno nejlepší SUV pro všechny. Pro rodinu hledejte prostor a bezpečnost, pro město spotřebu, pro hory pohon 4x4." },
      { question: "Vyplatí se SUV s pohonem 4x4?", answer: "Ano, pokud jezdíte v zimě, na chalupu nebo mimo zpevněné cesty. Pro město může být levnější přední náhon." },
      { question: "Na co si dát pozor u ojetého SUV?", answer: "Kontrolujte stav podvozku, pneumatik, brzd, pohonu všech kol a servisní historii." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv"] },
  },
  {
    slug: "rodinne-vozy-mpv",
    title: "Rodinné vozy MPV | Ojetá MPV a rodinná auta | NNAuto",
    description: "Rodinné vozy MPV na prodej v ČR. Porovnejte prostorná MPV, SUV a rodinná auta podle ceny, nájezdu, kufru a počtu sedadel.",
    h1: "Rodinné vozy MPV",
    h2: "Kdy dává MPV pro rodinu smysl",
    intro: "MPV a větší rodinné vozy jsou praktickou volbou pro rodiny, které potřebují snadný nástup, více prostoru na zadních sedadlech, velký kufr a možnost převážet dětské sedačky nebo sportovní výbavu. Na NNAuto najdete rodinná MPV i alternativy v podobě SUV a kombi.",
    focus: "Při výběru rodinného MPV sledujte počet sedadel, variabilitu interiéru, stav posuvných dveří, klimatizaci, servisní historii a reálný nájezd. U větších vozů je důležitý také stav podvozku, brzd a pneumatik, protože auto často jezdí plně obsazené.",
    links: [
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/van", label: "Van na prodej" },
      { href: "/auta/suv", label: "Rodinná SUV" },
      { href: "/auta/nejlepsi-rodinna-auta", label: "Nejlepší rodinná auta" },
      { href: "/auta/7-mistna-auta", label: "7 místná auta" },
    ],
    faq: [
      { question: "Je MPV lepší než SUV pro rodinu?", answer: "MPV často nabízí lepší přístup dozadu a variabilnější interiér, SUV zase vyšší posez a atraktivnější vzhled. Rozhoduje počet sedadel, kufr a způsob používání." },
      { question: "Na co si dát pozor u ojetého MPV?", answer: "Kontrolujte stav interiéru, posuvných dveří, klimatizace, podvozku, brzd a servisní historii. Rodinná auta bývají intenzivně používaná." },
      { question: "Jaké MPV je vhodné pro větší rodinu?", answer: "Vhodné jsou modely s variabilním interiérem, ISOFIX úchyty, dostatečným kufrem a spolehlivou motorizací." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["mpv", "van"] },
  },
  {
    slug: "7-mistna-auta",
    title: "7 místná auta na prodej | 7 místné vozy a MPV | NNAuto",
    description:
      "7 místná auta a 7 místné vozy na prodej v ČR. Rodinné SUV, MPV a vany se 7 sedadly – ceny, nájezd, výbava a přímý kontakt.",
    h1: "7 místná auta na prodej",
    h2: "Jak vybrat auto se 7 sedadly",
    intro:
      "Hledáte 7 místné auto nebo 7 místné vozy? Sedmimístné auto je vhodné pro větší rodinu, cestování s dětmi nebo situace, kdy potřebujete občas převézt více pasažérů. Nejčastěji jde o MPV, van nebo větší SUV s třetí řadou sedadel.",
    focus: "U 7 místných aut ověřte, zda jsou všechna sedadla plnohodnotná, kolik zůstává místa v kufru po rozložení třetí řady, stav bezpečnostních pásů, ISOFIX a klimatizaci pro zadní část vozu. Důležitá je také servisní historie a stav podvozku.",
    links: [
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/van", label: "Vany na prodej" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/rodinne-vozy-mpv", label: "Rodinné vozy MPV" },
      { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq" },
    ],
    faq: [
      { question: "Jaké 7 místné auto koupit?", answer: "Pro časté využití všech sedadel je praktické MPV nebo van. Pro občasné využití třetí řady může stačit větší SUV." },
      { question: "Má 7 místné auto dost velký kufr?", answer: "Po rozložení třetí řady bývá kufr menší. Pokud často cestujete v sedmi lidech, zkontrolujte skutečný prostor za sedadly." },
      { question: "Co zkontrolovat před koupí?", answer: "Stav třetí řady sedadel, pásů, klimatizace, podvozku, brzd, pneumatik a servisní historii." },
    ],
    catalogFilters: { seatsMin: 7 },
  },
  {
    slug: "sedmimistne-vozy",
    title: "7 místné vozy na prodej | Sedmimístná auta | NNAuto",
    description:
      "7 místné vozy a sedmimístná auta na prodej. Porovnejte MPV, vany a SUV se 7 sedadly podle ceny, nájezdu a výbavy.",
    h1: "7 místné vozy na prodej",
    h2: "Výběr sedmimístného vozu",
    intro:
      "7 místné vozy jsou praktické pro větší rodiny i pro řidiče, kteří občas potřebují převézt více lidí. V nabídce bývají MPV, vany i větší SUV s třetí řadou sedadel.",
    focus: "Před koupí zkontrolujte, zda je třetí řada pohodlně použitelná, kolik zůstává místa v kufru, stav bezpečnostních pásů, klimatizaci pro zadní část vozu a celkový stav interiéru. U větších aut je důležitý i servis podvozku a brzd.",
    links: [
      { href: "/auta/7-mistna-auta", label: "7 místná auta" },
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/van", label: "Vany na prodej" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/rodinne-vozy-mpv", label: "Rodinné vozy MPV" },
    ],
    faq: [
      { question: "Jaký sedmimístný vůz vybrat?", answer: "Pro časté cestování v sedmi lidech je praktické MPV nebo van. SUV se hodí, pokud třetí řadu využíváte spíše občas." },
      { question: "Na co si dát pozor?", answer: "Na prostor ve třetí řadě, kufr, stav sedadel, klimatizaci, brzdy, pneumatiky a doložený servis." },
      { question: "Jsou sedmimístná auta drahá na provoz?", answer: "Mohou mít vyšší spotřebu a dražší pneumatiky nebo brzdy, proto je důležité porovnat konkrétní motorizaci a servisní historii." },
    ],
    catalogFilters: { seatsMin: 7 },
  },
  {
    slug: "rodinne-auto-s-velkym-kufrem",
    title: "Rodinné auto s velkým kufrem | Ojetá auta pro rodinu | NNAuto",
    description: "Rodinné auto s velkým kufrem na prodej. Vyberte kombi, SUV nebo MPV podle prostoru, ceny, nájezdu a rodinné výbavy.",
    h1: "Rodinné auto s velkým kufrem",
    h2: "Jak vybrat prostorné rodinné auto",
    intro: "Velký kufr je u rodinného auta zásadní pro kočárek, sportovní vybavení, nákupy i dovolenou. Nejčastější volbou bývá kombi, SUV nebo MPV, protože nabízí dobrý poměr prostoru a každodenní použitelnosti.",
    focus: "Při výběru sledujte nejen objem kufru v litrech, ale také tvar zavazadelníku, výšku nakládací hrany, sklopná sedadla, ISOFIX, stav interiéru a servisní historii. Praktické auto má být pohodlné i při plném obsazení.",
    links: [
      { href: "/auta/kombi", label: "Kombi auta" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/nejlepsi-rodinna-auta", label: "Nejlepší rodinná auta" },
      { href: "/auta/velka-rodinna-auta", label: "Velká rodinná auta" },
    ],
    faq: [
      { question: "Jaké rodinné auto má velký kufr?", answer: "Často kombi, větší SUV nebo MPV. Rozhoduje tvar kufru, sklopná sedadla a skutečná využitelnost prostoru." },
      { question: "Je lepší kombi nebo SUV?", answer: "Kombi bývá úspornější a má dlouhý kufr, SUV nabízí vyšší posez a pohodlnější nastupování." },
      { question: "Co kontrolovat u rodinného auta?", answer: "Kufr, interiér, sedačky, klimatizaci, brzdy, pneumatiky, servisní historii a stav podvozku." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["kombi", "suv", "mpv"] },
  },
  {
    slug: "velka-rodinna-auta",
    title: "Velká rodinná auta | Ojetá SUV, MPV a kombi | NNAuto",
    description: "Velká rodinná auta na prodej v ČR. Porovnejte SUV, MPV, vany a kombi podle ceny, nájezdu, počtu sedadel a prostoru.",
    h1: "Velká rodinná auta",
    h2: "Pro koho jsou velká rodinná auta vhodná",
    intro: "Velká rodinná auta dávají smysl pro rodiny s více dětmi, časté cestování a převoz většího množství zavazadel. Vybírat můžete mezi SUV, kombi, MPV a vany.",
    focus: "Důležité je pohodlí na zadních sedadlech, velký kufr, bezpečnostní výbava, spolehlivost motoru a rozumné servisní náklady. U ojetých vozů vždy ověřte historii a stav interiéru, protože rodinná auta bývají intenzivně využívaná.",
    links: [
      { href: "/auta/suv", label: "Velká SUV" },
      { href: "/auta/mpv", label: "MPV auta" },
      { href: "/auta/van", label: "Vany" },
      { href: "/auta/kombi", label: "Kombi" },
      { href: "/auta/7-mistna-auta", label: "7 místná auta" },
    ],
    faq: [
      { question: "Jaké velké rodinné auto koupit?", answer: "Pro časté cestování s plnou posádkou MPV nebo van, pro univerzální použití kombi nebo SUV." },
      { question: "Co je důležité u velkého auta?", answer: "Prostor, bezpečnost, stav podvozku, brzdy, pneumatiky, servisní historie a provozní náklady." },
      { question: "Má smysl 4x4 u rodinného auta?", answer: "Ano, pokud jezdíte v zimě, na hory nebo po horších cestách. Pro město často stačí přední náhon." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv", "mpv", "van", "kombi"] },
  },
  {
    slug: "nejlepsi-rodinne-vozy",
    title: "Nejlepší rodinné vozy | Ojetá auta pro rodinu | NNAuto",
    description: "Nejlepší rodinné vozy podle prostoru, bezpečnosti a provozních nákladů. Porovnejte SUV, MPV a kombi na prodej.",
    h1: "Nejlepší rodinné vozy",
    h2: "Jak poznat dobrý rodinný vůz",
    intro: "Rodinný vůz by měl být bezpečný, prostorný, spolehlivý a pohodlný na delší cesty. Na NNAuto můžete porovnat aktuální nabídku SUV, kombi a MPV podle ceny, nájezdu a výbavy.",
    focus: "Sledujte prostor pro dětské sedačky, kufr, bezpečnostní asistenty, klimatizaci, servisní historii a dostupnost náhradních dílů. Dobré rodinné auto není jen velké, ale také rozumné na údržbu.",
    links: [
      { href: "/auta/nejlepsi-rodinna-auta", label: "Nejlepší rodinná auta" },
      { href: "/auta/rodinne-auto-s-velkym-kufrem", label: "Rodinné auto s velkým kufrem" },
      { href: "/auta/velka-rodinna-auta", label: "Velká rodinná auta" },
      { href: "/auta/suv-pro-rodinu", label: "SUV pro rodinu" },
      { href: "/auta/rodinne-vozy-mpv", label: "Rodinné vozy MPV" },
    ],
    faq: [
      { question: "Jaký rodinný vůz je nejlepší?", answer: "Záleží na potřebách rodiny. Pro kufr kombi, pro vyšší posez SUV, pro více sedadel MPV nebo van." },
      { question: "Co sledovat při výběru?", answer: "Bezpečnost, prostor, stav interiéru, servis, nájezd, spotřebu a cenu budoucích oprav." },
      { question: "Je lepší nové nebo ojeté rodinné auto?", answer: "Ojeté může nabídnout vyšší třídu za nižší cenu, ale vyžaduje pečlivou kontrolu historie a technického stavu." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv", "kombi", "mpv"] },
  },
  {
    slug: "suv-pro-rodinu",
    title: "SUV pro rodinu | Ojetá rodinná SUV na prodej | NNAuto",
    description: "SUV pro rodinu na prodej. Vyberte ojeté rodinné SUV podle prostoru, kufru, bezpečnosti, ceny, nájezdu a pohonu.",
    h1: "SUV pro rodinu",
    h2: "Jak vybrat rodinné SUV",
    intro: "Rodinné SUV nabízí vyšší posez, pohodlné nastupování a často dostatek prostoru pro děti i zavazadla. Je vhodné pro město, delší trasy i zimní provoz.",
    focus: "U rodinného SUV sledujte velikost kufru, prostor na zadních sedadlech, ISOFIX, spotřebu, stav podvozku a pneumatik. Pokud jezdíte na hory, může dávat smysl 4x4 nebo AWD.",
    links: [
      { href: "/auta/suv", label: "SUV auta na prodej" },
      { href: "/auta/suv/4x4", label: "SUV 4x4" },
      { href: "/auta/nejlepsi-suv", label: "Nejlepší SUV" },
      { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq" },
      { href: "/auta/bmw/x5", label: "BMW X5" },
    ],
    faq: [
      { question: "Jaké SUV je vhodné pro rodinu?", answer: "Takové, které má dost prostoru vzadu, použitelný kufr, bezpečnostní výbavu a rozumné provozní náklady." },
      { question: "Je potřeba SUV 4x4?", answer: "Ne vždy. 4x4 se hodí na hory, sníh a horší cesty, pro město často stačí přední náhon." },
      { question: "Na co si dát pozor?", answer: "Na stav podvozku, pneumatik, brzd, pohonu všech kol a servisní historii." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv"] },
  },
  {
    slug: "coupe-auta",
    title: "Coupe auta | Ojetá kupé na prodej | NNAuto",
    description: "Coupe auta na prodej v ČR. Porovnejte ojetá kupé podle ceny, nájezdu, výkonu, paliva a stavu.",
    h1: "Coupe auta",
    h2: "Výběr ojetého coupe",
    intro: "Coupe auta jsou vhodná pro řidiče, kteří hledají sportovnější vzhled, nižší stavbu karoserie a zážitek z jízdy. Na NNAuto najdete kupé různých značek i cenových kategorií.",
    focus: "U ojetého kupé ověřte stav karoserie, podvozku, pneumatik, brzd, servisní historii a případné úpravy. Sportovněji používaná auta mohou vyžadovat důkladnější kontrolu.",
    links: [
      { href: "/auta/coupe", label: "Coupe na prodej" },
      { href: "/auta/benzin", label: "Benzínová auta" },
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/bmw", label: "BMW na prodej" },
      { href: "/auta/audi", label: "Audi na prodej" },
    ],
    faq: [
      { question: "Co je coupe auto?", answer: "Coupe je obvykle sportovněji laděná karoserie s nižší střechou a menším důrazem na praktičnost zadních sedadel." },
      { question: "Je coupe vhodné na každý den?", answer: "Může být, pokud vám stačí menší praktičnost a kufr. Před koupí zkontrolujte pohodlí, výhled a provozní náklady." },
      { question: "Na co si dát pozor u ojetého coupe?", answer: "Na servis, pneumatiky, brzdy, podvozek, karoserii a známky sportovního zacházení." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["coupe"] },
  },
  {
    slug: "auto-pro-6-osob",
    title: "Auto pro 6 osob | Prostorná ojetá auta | NNAuto",
    description: "Auto pro 6 osob na prodej. Vyberte prostorné MPV, van nebo SUV podle počtu sedadel, ceny, nájezdu a výbavy.",
    h1: "Auto pro 6 osob",
    h2: "Jak vybrat auto pro šest lidí",
    intro: "Auto pro 6 osob musí nabídnout dostatek sedadel, pohodlný přístup dozadu a rozumný prostor pro zavazadla. Nejčastější volbou jsou MPV, vany a větší SUV.",
    focus: "Při výběru ověřte počet míst v technickém průkazu, stav sedadel, bezpečnostních pásů, klimatizaci pro zadní část vozu a kufr při plném obsazení. Důležitý je také stav podvozku a brzd.",
    links: [
      { href: "/auta/7-mistna-auta", label: "7 místná auta" },
      { href: "/auta/sedmimistne-vozy", label: "Sedmimístné vozy" },
      { href: "/auta/mpv", label: "MPV" },
      { href: "/auta/van", label: "Van" },
      { href: "/auta/velka-rodinna-auta", label: "Velká rodinná auta" },
    ],
    faq: [
      { question: "Jaké auto je vhodné pro 6 osob?", answer: "MPV nebo van, případně větší SUV s třetí řadou sedadel." },
      { question: "Stačí pětimístné auto?", answer: "Ne, pokud pravidelně vozíte šest osob. Ověřte počet míst v technickém průkazu." },
      { question: "Co kontrolovat?", answer: "Sedadla, pásy, prostor, klimatizaci, kufr, brzdy, pneumatiky a servisní historii." },
    ],
    catalogFilters: { seatsMin: 6 },
  },
  {
    slug: "elektro-suv",
    title: "Elektro SUV | Elektrická SUV na prodej | NNAuto",
    description: "Elektro SUV na prodej v ČR. Porovnejte elektrická SUV podle ceny, dojezdu, nájezdu, výbavy a stavu baterie.",
    h1: "Elektro SUV",
    h2: "Jak vybrat elektrické SUV",
    intro: "Elektro SUV kombinuje vyšší posez a praktičnost SUV s tichým provozem elektromobilu. Hodí se pro řidiče, kteří mohou pravidelně nabíjet doma nebo v práci.",
    focus: "U elektrického SUV sledujte stav baterie, reálný dojezd, rychlost nabíjení, historii servisních zásahů, pneumatiky a brzdy. Důležitá je také dostupnost nabíjení pro váš běžný režim.",
    links: [
      { href: "/auta/elektro", label: "Elektromobily" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/suv/elektro", label: "SUV elektro" },
      { href: "/auta/hybrid", label: "Hybridní auta" },
      { href: "/auta/nejlepsi-suv", label: "Nejlepší SUV" },
    ],
    faq: [
      { question: "Vyplatí se elektro SUV?", answer: "Ano, pokud máte možnost pravidelného nabíjení a vyhovuje vám reálný dojezd konkrétního modelu." },
      { question: "Co kontrolovat u ojetého elektromobilu?", answer: "Stav baterie, servisní historii, nabíjení, pneumatiky, brzdy a funkčnost elektroniky." },
      { question: "Je elektro SUV vhodné na delší trasy?", answer: "Záleží na dojezdu a rychlosti nabíjení. Před koupí porovnejte skutečné potřeby s parametry auta." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv"], fuel: "elektro,electric,ev" },
  },
  {
    slug: "male-auto-pro-zenu",
    title: "Malé auto pro ženu | Praktická ojetá auta do města | NNAuto",
    description: "Malé auto pro ženu nebo každodenní městské ježdění. Vyberte kompaktní hatchback podle ceny, nájezdu, automatu a výbavy.",
    h1: "Malé auto pro ženu",
    h2: "Praktické malé auto do města",
    intro: "Malé auto do města by mělo být přehledné, snadno parkovatelné, úsporné a bezpečné. Hodí se pro každodenní dojíždění, nákupy i kratší trasy.",
    focus: "Při výběru sledujte výhled z vozu, parkovací senzory, stav spojky nebo automatu, spotřebu, servisní historii a bezpečnostní výbavu. Kategorie není o pohlaví, ale o praktických požadavcích na jednoduché používání.",
    links: [
      { href: "/auta/hatchback", label: "Hatchbacky" },
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/benzin", label: "Benzínová auta" },
      { href: "/auta/auto-pro-zeny", label: "Auto pro ženy" },
      { href: "/auta/auto-pro-zacatecnika", label: "Auto pro začátečníka" },
    ],
    faq: [
      { question: "Jaké malé auto je vhodné do města?", answer: "Kompaktní hatchback s dobrou viditelností, nízkou spotřebou a levným servisem." },
      { question: "Je lepší automat?", answer: "Do města je automat pohodlný, ale u ojetého auta zkontrolujte servis převodovky." },
      { question: "Na co si dát pozor?", answer: "Na stav spojky, brzd, pneumatik, karoserie, servisní historii a bezpečnostní výbavu." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["hatchback"] },
  },
  {
    slug: "suv-auta-srovnani",
    title: "SUV auta srovnání | Jak vybrat ojeté SUV | NNAuto",
    description: "Srovnání SUV aut podle ceny, prostoru, pohonu, spotřeby a vhodnosti pro rodinu. Porovnejte aktuální nabídku ojetých SUV.",
    h1: "SUV auta srovnání",
    h2: "Jak srovnávat ojetá SUV",
    intro: "Při srovnání SUV aut je důležité řešit nejen značku a cenu, ale také velikost karoserie, kufr, spotřebu, pohon všech kol a servisní náklady. Menší SUV se hodí do města, větší SUV dává větší smysl pro rodinu a delší trasy.",
    focus: "U ojetého SUV porovnávejte stav podvozku, pneumatik a brzd, servisní historii, reálnou spotřebu a výbavu. Pokud vybíráte SUV pro rodinu, sledujte prostor vzadu, ISOFIX a velikost kufru. Pokud jezdíte na hory, zvažte 4x4 nebo AWD.",
    links: [
      { href: "/auta/suv", label: "SUV auta na prodej" },
      { href: "/auta/nejlepsi-suv", label: "Nejlepší SUV" },
      { href: "/auta/suv-pro-rodinu", label: "SUV pro rodinu" },
      { href: "/auta/suv/4x4", label: "SUV 4x4" },
      { href: "/auta/elektro-suv", label: "Elektro SUV" },
    ],
    faq: [
      { question: "Jaké SUV je nejlepší koupit ojeté?", answer: "Záleží na použití. Do města menší SUV, pro rodinu větší SUV s kufrem, pro hory model s 4x4." },
      { question: "Co porovnávat u SUV?", answer: "Cenu, nájezd, servis, spotřebu, prostor, pohon, stav podvozku a bezpečnostní výbavu." },
      { question: "Je lepší SUV 4x4 nebo přední náhon?", answer: "4x4 se hodí na sníh, hory a horší cesty. Pro běžné město často stačí přední náhon." },
    ],
    catalogFilters: { vehicleType: "osobni-auta", bodyType: ["suv"] },
  },
  {
    slug: "ojeta-auta-ostrava",
    title: "Ojetá auta Ostrava | Auta na prodej v Ostravě | NNAuto",
    description: "Ojetá auta Ostrava a okolí. Vyberte auta na prodej podle ceny, značky, nájezdu, paliva a výbavy.",
    h1: "Ojetá auta Ostrava",
    h2: "Auta na prodej v Ostravě a okolí",
    intro: "Ojetá auta v Ostravě můžete na NNAuto porovnat podle ceny, značky, modelu, roku výroby a nájezdu. Regionální filtrování pomáhá najít vozy blízko vás a rychleji domluvit prohlídku.",
    focus: "Při koupi auta v Ostravě a okolí sledujte technický stav, servisní historii, původ vozu a možnost osobní prohlídky. U starších aut věnujte pozornost korozi, podvozku, brzdám a pneumatikám.",
    links: [
      { href: "/listings?region=ostrava", label: "Aktuální auta v Ostravě" },
      { href: "/auta/moravskoslezsky", label: "Auta v Moravskoslezském kraji" },
      { href: "/auta/suv", label: "SUV auta" },
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/auto-do-300000", label: "Auto do 300 000 Kč" },
    ],
    faq: [
      { question: "Jak najít ojeté auto v Ostravě?", answer: "Použijte filtr regionu Ostrava a porovnejte cenu, nájezd, výbavu a historii konkrétních inzerátů." },
      { question: "Co kontrolovat při koupi auta?", answer: "Servisní historii, stav podvozku, brzd, pneumatik, karoserie, elektroniky a VIN." },
      { question: "Vyplatí se hledat i v okolí Ostravy?", answer: "Ano, rozšíření na Moravskoslezský kraj může přidat více nabídek a lepší cenu." },
    ],
    catalogFilters: { region: "ostrava" },
  },
  {
    slug: "auta-brno-na-prodej",
    title: "Auta Brno na prodej | Ojetá auta v Brně | NNAuto",
    description: "Auta Brno na prodej. Prohlédněte si ojetá auta v Brně podle ceny, značky, modelu, nájezdu a výbavy.",
    h1: "Auta Brno na prodej",
    h2: "Ojetá auta v Brně a okolí",
    intro: "Pokud hledáte auta v Brně na prodej, vyplatí se porovnat více nabídek podle ceny, nájezdu, výbavy a historie. Regionální výběr usnadní osobní prohlídku i zkušební jízdu.",
    focus: "U auta v Brně a okolí ověřte servisní historii, stav karoserie, podvozku, brzd a pneumatik. Při dražším voze doporučujeme VIN prověření a porovnání s podobnými inzeráty ve stejné cenové hladině.",
    links: [
      { href: "/listings?region=brno", label: "Aktuální auta v Brně" },
      { href: "/auta/jihomoravsky", label: "Auta v Jihomoravském kraji" },
      { href: "/auta/auto-do-300000", label: "Auto do 300 000 Kč" },
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/kombi", label: "Kombi auta" },
    ],
    faq: [
      { question: "Jak najít auto na prodej v Brně?", answer: "Použijte region Brno a porovnejte aktuální nabídky podle ceny, stavu, nájezdu a výbavy." },
      { question: "Je lepší soukromý prodejce nebo autobazar?", answer: "Záleží na konkrétní nabídce. Důležitá je historie vozu, doklady, stav a možnost prověření." },
      { question: "Co dělat před koupí?", answer: "Domluvte prohlídku, zkušební jízdu, zkontrolujte VIN a porovnejte cenu s podobnými vozy." },
    ],
    catalogFilters: { region: "brno" },
  },
  {
    slug: "nejlepsi-diesely",
    title: "Nejlepší dieselová auta | Ojeté diesely na prodej | NNAuto",
    description: "Vyberte nejlepší dieselové auto pro dlouhé trasy. Ojeté diesely na prodej podle ceny, nájezdu, spotřeby a výbavy.",
    h1: "Nejlepší dieselová auta",
    h2: "Kdy dává diesel smysl",
    intro: "Dieselové auto dává největší smysl pro delší trasy, pravidelné dojíždění a vyšší roční nájezd. Nabízí nízkou spotřebu a dobrý točivý moment, ale vyžaduje pečlivou kontrolu servisní historie.",
    focus: "U ojetého dieselu ověřte stav DPF, turba, vstřikování a EGR. Krátké městské trasy mohou dieselům škodit, proto je důležité znát způsob používání předchozího majitele. Na NNAuto můžete porovnat dieselová auta podle značky, modelu, ceny a nájezdu.",
    links: [
      { href: "/auta/diesel", label: "Diesel auta na prodej" },
      { href: "/auta/kombi", label: "Diesel kombi" },
      { href: "/auta/suv", label: "Diesel SUV" },
    ],
    faq: [
      { question: "Kdy koupit diesel?", answer: "Diesel se hodí hlavně na delší trasy a vyšší roční nájezd. Pro krátké městské jízdy je často lepší benzín nebo hybrid." },
      { question: "Co zkontrolovat u dieselu?", answer: "DPF, turbo, vstřiky, EGR, servisní intervaly a historii tankování/provozu." },
      { question: "Jsou diesely stále výhodné?", answer: "Pro dálniční provoz a delší dojíždění ano, pokud je vůz v dobrém technickém stavu." },
    ],
  },
  {
    slug: "nejlepsi-benzinova-auta",
    title: "Nejlepší benzínová auta | Ojeté benzíny na prodej | NNAuto",
    description: "Benzínová auta na prodej pro město i běžné dojíždění. Porovnejte cenu, spotřebu, nájezd a servisní náklady.",
    h1: "Nejlepší benzínová auta",
    h2: "Pro koho je vhodné benzínové auto",
    intro: "Benzínová auta jsou oblíbená pro jednodušší provoz, nižší servisní riziko u krátkých tras a dobrý poměr ceny a výkonu. Hodí se pro město, příměstské dojíždění i řidiče s menším ročním nájezdem.",
    focus: "Při výběru benzínového auta sledujte spotřebu, stav motoru, servis oleje, rozvody a případné úniky kapalin. Moderní benzínové motory mohou být úsporné, ale u přeplňovaných jednotek je důležitá pravidelná údržba. Na NNAuto najdete benzínová auta v různých karoseriích i cenových kategoriích.",
    links: [
      { href: "/auta/benzin", label: "Benzínová auta na prodej" },
      { href: "/auta/hatchback", label: "Benzínové hatchbacky" },
      { href: "/auta/do-200000", label: "Levná benzínová auta" },
    ],
    faq: [
      { question: "Kdy je lepší benzín než diesel?", answer: "Benzín je vhodnější pro město, kratší trasy a nižší roční nájezd." },
      { question: "Na co si dát pozor u benzínového auta?", answer: "Kontrolujte servis oleje, rozvody, spotřebu, stav motoru a případné úniky." },
      { question: "Je benzín dobrý pro první auto?", answer: "Ano, jednoduchý benzínový motor je často vhodná volba pro začínající řidiče." },
    ],
  },
  {
    slug: "prvni-automobil",
    title: "První automobil | Jak vybrat první auto | NNAuto",
    description: "Jak vybrat první auto pro začínajícího řidiče. Praktické tipy, rozpočet, bezpečnost, servis a aktuální nabídka ojetých vozů.",
    h1: "První automobil",
    h2: "Jak vybrat první auto",
    intro: "První auto by mělo být jednoduché, bezpečné, levné na servis a přehledné při řízení. Začínající řidič ocení menší rozměry, dobrou viditelnost, dostupné náhradní díly a rozumné pojištění.",
    focus: "Nekupujte první auto jen podle nízké ceny. Důležitý je technický stav, brzdy, pneumatiky, funkční airbagy, servisní historie a jednoduchá ovladatelnost. Pro první auto často dává smysl benzínový hatchback nebo menší kombi s manuální převodovkou.",
    links: [
      { href: "/auta/do-200000", label: "Auta do 200 000 Kč" },
      { href: "/auta/benzin", label: "Benzínová auta" },
      { href: "/auta/hatchback", label: "Hatchbacky" },
      { href: "/auta/manual", label: "Manuální převodovka" },
    ],
    faq: [
      { question: "Jaké auto je vhodné jako první?", answer: "Jednoduchý benzínový hatchback nebo menší kombi s levným servisem a dobrou bezpečností." },
      { question: "Kolik utratit za první auto?", answer: "Záleží na rozpočtu, ale vždy si nechte rezervu na servis, pojištění a přepis." },
      { question: "Je automat vhodný pro začátečníka?", answer: "Může být pohodlný, ale u starších aut je potřeba pečlivě zkontrolovat stav převodovky." },
    ],
  },
  {
    slug: "auto-pro-zacatecnika",
    title: "Auto pro začátečníka | Ojetá auta pro nové řidiče | NNAuto",
    description: "Vyberte auto pro začátečníka: bezpečné, přehledné, levné na servis a vhodné pro první roky řízení.",
    h1: "Auto pro začátečníka",
    h2: "Bezpečný výběr pro nové řidiče",
    intro: "Auto pro začátečníka by mělo odpouštět chyby a být jednoduché na údržbu. Důležitý je dobrý výhled, bezpečnostní výbava, předvídatelné chování a nízké provozní náklady.",
    focus: "Začínající řidič by měl preferovat auto s jasnou historií a bez složitých technických problémů. Vyhněte se silně upraveným vozům, extrémně výkonným motorům a autům s nejasným původem. Na NNAuto můžete filtrovat podle ceny, nájezdu a typu převodovky.",
    links: [
      { href: "/auta/do-100000", label: "Levná auta do 100 000 Kč" },
      { href: "/auta/do-200000", label: "Auta do 200 000 Kč" },
      { href: "/auta/benzin", label: "Benzín" },
      { href: "/auta/manual", label: "Manuál" },
    ],
    faq: [
      { question: "Jaké auto je nejlepší pro začátečníka?", answer: "Menší, přehledné, bezpečné a levné na servis. Ideálně s jednoduchým benzínovým motorem." },
      { question: "Má začátečník koupit levné auto?", answer: "Levné auto může být dobrá volba, ale nesmí být zanedbané. Stav je důležitější než nejnižší cena." },
      { question: "Co je nejdůležitější?", answer: "Bezpečnost, spolehlivost, servisní historie a nízké provozní náklady." },
    ],
  },
  {
    slug: "auto-pro-zeny",
    title: "Auto pro ženy | Praktická ojetá auta | NNAuto",
    description: "Praktická auta pro každodenní jízdu, město i rodinu. Vyberte vůz podle rozměrů, bezpečnosti, automatu a provozních nákladů.",
    h1: "Auto pro ženy",
    h2: "Praktické auto pro každý den",
    intro: "Při výběru auta pro každodenní používání je důležitá přehlednost, snadné parkování, bezpečnost, spolehlivost a nízké provozní náklady. Mnoho řidiček preferuje kompaktní hatchback, crossover nebo menší SUV s automatem.",
    focus: "Nejde o univerzální kategorii podle pohlaví, ale o praktické požadavky: pohodlné nastupování, dobrý výhled, parkovací senzory, automatická převodovka a rozumná spotřeba. Na NNAuto můžete rychle porovnat auta podle ceny, velikosti, převodovky a výbavy.",
    links: [
      { href: "/auta/automat", label: "Auta s automatem" },
      { href: "/auta/hatchback", label: "Hatchbacky" },
      { href: "/auta/suv", label: "Menší SUV" },
      { href: "/auta/benzin", label: "Benzínová auta" },
    ],
    faq: [
      { question: "Jaké auto je praktické do města?", answer: "Kompaktní hatchback nebo menší SUV s dobrou viditelností a parkovacími asistenty." },
      { question: "Je automat dobrá volba?", answer: "Ano, automat zvyšuje komfort ve městě, ale u ojetého auta ověřte servis převodovky." },
      { question: "Co sledovat při výběru?", answer: "Bezpečnost, výhled, parkování, spotřebu, náklady na servis a stav konkrétního kusu." },
    ],
  },
  {
    slug: "auto-pro-velkou-rodinu",
    title: "Auto pro velkou rodinu | 7místná a prostorná auta | NNAuto",
    description: "Vyberte auto pro velkou rodinu: SUV, MPV, van nebo 7místný vůz s velkým kufrem a bezpečnostní výbavou.",
    h1: "Auto pro velkou rodinu",
    h2: "Prostorná auta pro velkou rodinu",
    intro: "Velká rodina potřebuje prostor, bezpečnost a praktičnost. Důležitý je počet míst, velikost kufru, možnost instalace dětských sedaček, přístup do třetí řady a náklady na provoz.",
    focus: "Nejčastější volbou bývá MPV, velké SUV nebo van. U sedmimístných aut zkontrolujte, zda třetí řada není jen nouzová a zda po jejím rozložení zůstane dost místa na zavazadla. Pro dlouhé trasy se hodí diesel, pro město benzín nebo hybrid.",
    links: [
      { href: "/auta/mpv", label: "MPV na prodej" },
      { href: "/auta/van", label: "Vany na prodej" },
      { href: "/auta/suv", label: "Velká SUV" },
      { href: "/auta/kombi", label: "Prostorná kombi" },
    ],
    faq: [
      { question: "Jaké auto pro velkou rodinu?", answer: "MPV, velké SUV nebo van. Sledujte počet míst, kufr a bezpečnostní výbavu." },
      { question: "Je 7místné SUV lepší než MPV?", answer: "SUV je univerzálnější, MPV bývá praktičtější pro nastupování a vnitřní prostor." },
      { question: "Co zkontrolovat?", answer: "Třetí řadu sedadel, kotvení dětských sedaček, stav klimatizace, podvozku a brzd." },
    ],
  },
];

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: "skoda-octavia-vs-superb",
    title: "Škoda Octavia vs Superb | Porovnání ojetých aut | NNAuto",
    description: "Porovnání Škoda Octavia vs Superb: prostor, cena, komfort, servisní náklady a vhodnost pro rodinu.",
    h1: "Škoda Octavia vs Superb",
    left: { href: "/auta/skoda/octavia", label: "Škoda Octavia" },
    right: { href: "/auta/skoda/superb", label: "Škoda Superb" },
    summary: "Škoda Octavia je praktičtější a dostupnější volba s nižšími náklady, Superb nabízí více prostoru, komfortu a často vyšší výbavu. Pro město a běžné dojíždění dává smysl Octavia, pro dlouhé trasy a rodinu s požadavkem na maximální prostor Superb.",
    faq: [
      { question: "Je lepší Octavia nebo Superb?", answer: "Octavia je dostupnější a úspornější, Superb prostornější a komfortnější." },
      { question: "Který model má větší kufr?", answer: "Superb obvykle nabídne více prostoru, Octavia ale zůstává velmi praktická." },
    ],
  },
  {
    slug: "passat-vs-mondeo",
    title: "Passat vs Mondeo | Porovnání ojetých kombi | NNAuto",
    description: "Volkswagen Passat vs Ford Mondeo: cena, komfort, motory, servis a praktičnost na trhu ojetin.",
    h1: "Passat vs Mondeo",
    left: { href: "/auta/volkswagen/passat", label: "Volkswagen Passat" },
    right: { href: "/auta/ford/mondeo", label: "Ford Mondeo" },
    summary: "Passat boduje image, zůstatkovou hodnotou a širokou nabídkou motorů. Mondeo často nabídne výhodnější cenu, pohodlí a dobrý poměr prostoru k nákladům. Oba modely jsou silné pro dlouhé trasy a rodinné použití.",
    faq: [
      { question: "Je lepší Passat nebo Mondeo?", answer: "Passat si lépe drží cenu, Mondeo může být výhodnější koupě." },
      { question: "Které auto je levnější na nákup?", answer: "Ford Mondeo bývá na trhu ojetin často levnější než srovnatelný Passat." },
    ],
  },
  {
    slug: "bmw-x5-vs-audi-q7",
    title: "BMW X5 vs Audi Q7 | Porovnání luxusních SUV | NNAuto",
    description: "BMW X5 vs Audi Q7: jízdní vlastnosti, komfort, prostor, pohon 4x4 a servisní náklady.",
    h1: "BMW X5 vs Audi Q7",
    left: { href: "/auta/bmw/x5", label: "BMW X5" },
    right: { href: "/auta/audi/q7", label: "Audi Q7" },
    summary: "BMW X5 působí sportovněji a řidičsky, Audi Q7 nabízí velmi dobrý komfort a často více prostoru. U obou modelů je zásadní servisní historie, stav pohonu všech kol a náklady na pneumatiky, brzdy a podvozek.",
    faq: [
      { question: "Je lepší BMW X5 nebo Audi Q7?", answer: "X5 je sportovnější, Q7 prostornější a komfortnější." },
      { question: "Na co si dát pozor?", answer: "Na servisní historii, vzduchový podvozek, automatickou převodovku a pohon všech kol." },
    ],
  },
  {
    slug: "golf-vs-octavia",
    title: "Golf vs Octavia | Porovnání ojetých aut | NNAuto",
    description: "Volkswagen Golf vs Škoda Octavia: praktičnost, kufr, cena, servis a vhodnost pro každodenní provoz.",
    h1: "Golf vs Octavia",
    left: { href: "/auta/volkswagen/golf", label: "Volkswagen Golf" },
    right: { href: "/auta/skoda/octavia", label: "Škoda Octavia" },
    summary: "Golf je kompaktnější a příjemný do města, Octavia nabízí více prostoru a větší kufr. Pokud často vozíte rodinu nebo zavazadla, Octavia je praktičtější; pro město a kratší trasy může být Golf obratnější.",
    faq: [
      { question: "Je praktičtější Golf nebo Octavia?", answer: "Octavia je praktičtější díky většímu kufru, Golf je kompaktnější." },
      { question: "Které auto je lepší do města?", answer: "Golf díky menším rozměrům, Octavia pokud potřebujete prostor." },
    ],
  },
  {
    slug: "kodiaq-vs-tiguan",
    title: "Kodiaq vs Tiguan | Porovnání SUV | NNAuto",
    description: "Škoda Kodiaq vs Volkswagen Tiguan: prostor, rodinné využití, motory, cena a výbava.",
    h1: "Kodiaq vs Tiguan",
    left: { href: "/auta/skoda/kodiaq", label: "Škoda Kodiaq" },
    right: { href: "/auta/volkswagen/tiguan", label: "Volkswagen Tiguan" },
    summary: "Kodiaq je větší a praktičtější pro rodinu, Tiguan působí kompaktněji a lépe se hodí do města. Oba modely sdílejí koncernovou techniku, takže rozhoduje stav, výbava, nájezd a konkrétní motor.",
    faq: [
      { question: "Je lepší Kodiaq nebo Tiguan?", answer: "Kodiaq pro rodinu a prostor, Tiguan pro kompaktnější rozměry a každodenní provoz." },
      { question: "Který model je prostornější?", answer: "Škoda Kodiaq je obecně prostornější a často dostupná i jako 7místná." },
    ],
  },
];

export function getAutaGuidePage(slug: string): AutaGuidePage | undefined {
  return AUTA_GUIDE_PAGES.find((page) => page.slug === slug);
}

export function getComparisonPage(slug: string): ComparisonPage | undefined {
  return COMPARISON_PAGES.find((page) => page.slug === slug);
}

export function buildAutaGuideMetadata(page: AutaGuidePage): Metadata {
  const canonical = `${SITE_ORIGIN}/auta/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "article",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  };
}

export function buildComparisonMetadata(page: ComparisonPage): Metadata {
  const canonical = `${SITE_ORIGIN}/porovnani/${page.slug}`;
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "article",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
      images: [`${SITE_ORIGIN}/og-image.png`],
    },
  };
}

export function guideJsonLd(page: AutaGuidePage) {
  const canonical = `${SITE_ORIGIN}/auta/${page.slug}`;
  return {
    breadcrumb: buildBreadcrumbJsonLd([
      { name: "NNAuto", url: `${SITE_ORIGIN}/` },
      { name: "Auta", url: `${SITE_ORIGIN}/auta` },
      { name: page.h1, url: canonical },
    ]),
    faq: buildFaqPageJsonLd(page.faq),
    itemList: buildItemListJsonLd(page.h1, page.links.map((link) => ({
      name: link.label,
      url: `${SITE_ORIGIN}${link.href}`,
    }))),
  };
}

export function comparisonJsonLd(page: ComparisonPage) {
  const canonical = `${SITE_ORIGIN}/porovnani/${page.slug}`;
  return {
    breadcrumb: buildBreadcrumbJsonLd([
      { name: "NNAuto", url: `${SITE_ORIGIN}/` },
      { name: "Porovnání", url: `${SITE_ORIGIN}/porovnani/${page.slug}` },
      { name: page.h1, url: canonical },
    ]),
    faq: buildFaqPageJsonLd(page.faq),
    itemList: buildItemListJsonLd(page.h1, [
      { name: page.left.label, url: `${SITE_ORIGIN}${page.left.href}` },
      { name: page.right.label, url: `${SITE_ORIGIN}${page.right.href}` },
    ]),
  };
}
