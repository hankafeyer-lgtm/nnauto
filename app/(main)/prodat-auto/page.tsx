import type { Metadata } from "next";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
} from "@lib/seo/structured-data";
import { inzeratWord } from "@lib/seo/czech-format";

/**
 * Seller-intent SEO landing page: /prodat-auto
 *
 * Targets Czech search queries the site was NOT serving before, e.g.
 * "prodat auto", "prodám auto zdarma", "inzerce aut zdarma", "jak prodat
 * auto", "prodej ojetého auta". These queries have real impressions in
 * Search Console but had no dedicated indexable page.
 *
 * The page is fully server-rendered (crawlable without JS), self-canonical,
 * and links into /add-listing (the actual listing flow) plus the buyer-side
 * catalogue for internal linking.
 */

export const revalidate = 3600;

const CANONICAL = `${SITE_ORIGIN}/prodat-auto`;

async function countActiveListings(): Promise<number> {
  try {
    const [row] = await db
      .select({ c: sql<number>`count(*)::int` })
      .from(listings)
      .where(eq(listings.isSold, false));
    return row?.c ?? 0;
  } catch {
    return 0;
  }
}

export function generateMetadata(): Metadata {
  const title = "Prodat auto zdarma a rychle | Inzerce aut | NNAuto";
  const description =
    "Chcete prodat auto? Vložte inzerát na NNAuto.cz rychle a jednoduše. Oslovte tisíce kupujících z celé ČR, prodávejte bez provize a komunikujte s zájemci přímo. Prodej ojetého i nového vozu.";
  return {
    title,
    description,
    alternates: { canonical: CANONICAL },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: CANONICAL,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
    keywords: [
      "prodat auto",
      "prodám auto",
      "prodat auto zdarma",
      "inzerce aut zdarma",
      "jak prodat auto",
      "prodej ojetého auta",
      "vložit inzerát auto",
      "prodat ojeté auto",
      "autobazar inzerce",
      "NNAuto",
    ].join(", "),
  };
}

const STEPS: { title: string; text: string }[] = [
  {
    title: "Vytvořte si účet zdarma",
    text: "Registrace na NNAuto trvá pár vteřin. Můžete se přihlásit jako soukromý prodejce nebo autobazar.",
  },
  {
    title: "Vložte inzerát a fotky",
    text: "Přidejte značku, model, rok, nájezd, cenu a kvalitní fotografie. Čím podrobnější popis, tím rychlejší prodej.",
  },
  {
    title: "Oslovte kupující z celé ČR",
    text: "Váš inzerát uvidí tisíce zájemců. Zájemci vás kontaktují přímo přes zprávu, telefon, WhatsApp nebo Telegram.",
  },
  {
    title: "Domluvte prodej bez provize",
    text: "Prodáváte přímo kupujícímu, bez mezičlánků a skrytých poplatků. Cenu i podmínky určujete vy.",
  },
];

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Kolik stojí vložení inzerátu na NNAuto?",
    answer:
      "Základní inzerát pro soukromé prodejce vložíte zdarma. Pro autobazary a prodejce s více vozy nabízíme výhodné balíčky inzerce – detaily najdete v ceníku.",
  },
  {
    question: "Jak rychle prodám auto přes NNAuto?",
    answer:
      "Rychlost prodeje závisí na ceně, stavu vozu a kvalitě inzerátu. Inzeráty s reálnou cenou, kompletním popisem a kvalitními fotografiemi se prodávají nejrychleji. Váš inzerát je viditelný ihned po vložení.",
  },
  {
    question: "Musím platit provizi z prodeje?",
    answer:
      "Ne. NNAuto je marketplace – prodáváte přímo kupujícímu bez provize a bez mezičlánků. Cenu i podmínky prodeje určujete vy.",
  },
  {
    question: "Mohu prodávat jako autobazar nebo dealer?",
    answer:
      "Ano. Při registraci zvolte typ účtu Autobazar / Dealer. Získáte přístup k výhodným balíčkům inzerce, hromadnému nahrávání vozidel a statistikám inzerátů.",
  },
  {
    question: "Jak nastavit správnou cenu při prodeji auta?",
    answer:
      "Porovnejte podobné vozy stejné značky, modelu, roku a nájezdu v katalogu NNAuto. Reálná tržní cena přiláká více zájemců a auto prodáte rychleji než při nadsazené ceně.",
  },
];

const POPULAR_SELL_LINKS: { label: string; href: string }[] = [
  { label: "Prodej Škoda", href: "/auta/skoda" },
  { label: "Prodej Volkswagen", href: "/auta/volkswagen" },
  { label: "Prodej BMW", href: "/auta/bmw" },
  { label: "Prodej Audi", href: "/auta/audi" },
  { label: "Prodej Mercedes-Benz", href: "/auta/mercedes-benz" },
  { label: "Prodej Ford", href: "/auta/ford" },
  { label: "Prodej Renault", href: "/auta/renault" },
  { label: "Prodej Peugeot", href: "/auta/peugeot" },
];

const TOP_MODEL_SELL_LINKS: { label: string; href: string }[] = [
  { label: "Prodat Renault Scenic", href: "/prodat-auto/renault-scenic" },
  { label: "Prodat Renault Megane", href: "/prodat-auto/renault-megane" },
  { label: "Prodat Volkswagen Golf GTI", href: "/prodat-auto/volkswagen-golf-gti" },
  { label: "Prodat Škoda Superb", href: "/prodat-auto/skoda-superb" },
  { label: "Prodat SEAT Leon", href: "/prodat-auto/seat-leon" },
];

export default async function ProdatAutoPage() {
  const activeCount = await countActiveListings();

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "NNAuto", url: `${SITE_ORIGIN}/` },
    { name: "Prodat auto", url: CANONICAL },
  ]);

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "Jak prodat auto na NNAuto",
    description:
      "Návod, jak rychle a zdarma prodat auto přes online autobazar NNAuto.cz.",
    step: STEPS.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
    })),
  };

  const faqJsonLd = buildFaqPageJsonLd(FAQ);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />

      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"
        >
          <a href="/" className="hover:underline">
            NNAuto
          </a>
          <span aria-hidden>›</span>
          <span aria-current="page">Prodat auto</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
          Prodat auto zdarma a rychle
        </h1>

        <p className="text-lg text-muted-foreground mb-6 max-w-3xl">
          Chcete <strong>prodat auto</strong>? Vložte inzerát na NNAuto.cz a
          oslovte tisíce kupujících z celé České republiky. Prodávejte{" "}
          <strong>bez provize</strong>, komunikujte se zájemci přímo a cenu i
          podmínky určujete vy.
          {activeCount > 0
            ? ` Aktuálně je na NNAuto ${activeCount} aktivních ${inzeratWord(activeCount)}.`
            : ""}
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href="/add-listing"
            className="rounded-md bg-[#B8860B] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#9c7308]"
          >
            Přidat inzerát zdarma
          </a>
          <a
            href="/pricing"
            className="rounded-md border px-6 py-3 font-medium transition-colors hover:bg-accent"
          >
            Ceník inzerce pro autobazary
          </a>
        </div>

        {/* How it works */}
        <section aria-labelledby="jak-prodat" className="mb-10">
          <h2 id="jak-prodat" className="text-2xl font-bold mb-5">
            Jak prodat auto na NNAuto – krok za krokem
          </h2>
          <ol className="space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#B8860B] font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Why NNAuto */}
        <section aria-labelledby="proc-nnauto" className="mb-10">
          <h2 id="proc-nnauto" className="text-2xl font-bold mb-5">
            Proč prodat auto přes NNAuto
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                t: "Zdarma pro soukromé prodejce",
                d: "Základní inzerát vložíte bez poplatku a bez provize z prodeje.",
              },
              {
                t: "Tisíce kupujících denně",
                d: "Váš vůz uvidí zájemci z celé ČR, kteří hledají právě takové auto.",
              },
              {
                t: "Přímý kontakt",
                d: "Zájemci vás kontaktují napřímo – zpráva, telefon, WhatsApp i Telegram.",
              },
              {
                t: "Balíčky pro autobazary",
                d: "Prodáváte více vozů? Využijte výhodné balíčky a hromadné nahrávání.",
              },
            ].map((item) => (
              <li
                key={item.t}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h3 className="font-semibold mb-1">{item.t}</h3>
                <p className="text-sm text-muted-foreground">{item.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mb-10">
          <h2 id="faq" className="text-2xl font-bold mb-5">
            Časté dotazy k prodeji auta
          </h2>
          <div className="space-y-4">
            {FAQ.map((f) => (
              <div
                key={f.question}
                className="rounded-lg border border-border bg-card p-4"
              >
                <h3 className="font-semibold mb-1">{f.question}</h3>
                <p className="text-sm text-muted-foreground">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section aria-labelledby="prodej-modely" className="mb-10">
          <h2 id="prodej-modely" className="text-xl font-semibold mb-3">
            Prodej auta podle modelu
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {TOP_MODEL_SELL_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="prodej-znacky" className="mb-10">
          <h2 id="prodej-znacky" className="text-xl font-semibold mb-3">
            Prodej auta podle značky
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {POPULAR_SELL_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-muted-foreground hover:text-foreground hover:underline"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/listings"
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Celý katalog aut
              </a>
            </li>
          </ul>
        </section>

        {/* Final CTA */}
        <div className="rounded-xl border border-border bg-muted/30 px-6 py-8 text-center">
          <h2 className="text-2xl font-bold mb-2">
            Prodejte své auto ještě dnes
          </h2>
          <p className="text-muted-foreground mb-5">
            Vložení inzerátu zabere pár minut. Oslovte kupující z celé ČR.
          </p>
          <a
            href="/add-listing"
            className="inline-block rounded-md bg-[#B8860B] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#9c7308]"
          >
            Přidat inzerát zdarma
          </a>
        </div>
      </main>
    </>
  );
}
