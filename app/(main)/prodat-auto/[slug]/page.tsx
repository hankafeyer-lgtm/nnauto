import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { and, eq, sql } from "drizzle-orm";
import { SITE_ORIGIN } from "@lib/seo/constants";
import JsonLd from "@lib/seo/JsonLd";
import {
  buildBreadcrumbJsonLd,
  buildFaqPageJsonLd,
} from "@lib/seo/structured-data";
import { parseProdejSlug } from "@lib/seo/prodej-landing";
import { formatCzk, inzeratWord } from "@lib/seo/czech-format";
import { slugVariants } from "@lib/seo/slug";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

async function querySellerModelStats(brandSlug: string, modelSlug: string) {
  const variants = slugVariants(modelSlug);
  if (!brandSlug || !variants.length) {
    return {
      total: 0,
      minPrice: null as number | null,
      maxPrice: null as number | null,
    };
  }

  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      minPrice: sql<number | null>`min(${listings.price})::int`,
      maxPrice: sql<number | null>`max(${listings.price})::int`,
    })
    .from(listings)
    .where(
      and(
        eq(listings.isSold, false),
        sql`lower(${listings.brand}) = ${brandSlug}`,
        sql`lower(${listings.model}) in (${sql.join(
          variants.map((v) => sql`${v}`),
          sql`, `,
        )})`,
      ),
    );

  return {
    total: row?.total ?? 0,
    minPrice: row?.minPrice ?? null,
    maxPrice: row?.maxPrice ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseProdejSlug(slug);
  if (!parsed) {
    return {
      title: "Prodat auto | NNAuto",
      robots: { index: false, follow: true },
    };
  }

  const stats = await querySellerModelStats(parsed.brandSlug, parsed.modelSlug);
  const bm = `${parsed.brandDisplay} ${parsed.modelDisplay}`;
  const canonical = `${SITE_ORIGIN}/prodat-auto/${parsed.brandSlug}-${parsed.modelSlug}`;
  const fromPart =
    stats.minPrice && stats.minPrice > 0
      ? `, podobné vozy od ${formatCzk(stats.minPrice)}`
      : "";
  const title = `Prodat ${bm} zdarma | Inzerce ${bm} | NNAuto`;
  const description =
    `Chcete prodat ${bm}? Vložte inzerát zdarma na NNAuto.cz a oslovte kupující z celé ČR. Bez provize, přímý kontakt se zájemci${fromPart}.`;

  return {
    title,
    description,
    alternates: { canonical },
    robots:
      stats.total >= 3
        ? { index: true, follow: true }
        : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: `${SITE_ORIGIN}/og-image.png`, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description },
    keywords: [
      `prodat ${bm}`,
      `prodám ${bm}`,
      `${bm} prodej`,
      `inzerce ${bm}`,
      `prodat ${bm} zdarma`,
      `výkup ${bm}`,
      "inzerce aut zdarma",
      "NNAuto",
    ].join(", "),
  };
}

export default async function ProdatModelPage({ params }: Props) {
  const { slug } = await params;
  const parsed = parseProdejSlug(slug);
  if (!parsed) notFound();

  const stats = await querySellerModelStats(parsed.brandSlug, parsed.modelSlug);
  const bm = `${parsed.brandDisplay} ${parsed.modelDisplay}`;
  const canonical = `${SITE_ORIGIN}/prodat-auto/${parsed.brandSlug}-${parsed.modelSlug}`;
  const buyerUrl = `/auta/${parsed.brandSlug}/${parsed.modelSlug}`;
  const pricePart =
    stats.minPrice && stats.maxPrice
      ? `Podobné vozy ${bm} se na NNAuto aktuálně pohybují od ${formatCzk(stats.minPrice)} do ${formatCzk(stats.maxPrice)}.`
      : `Před vložením inzerátu doporučujeme porovnat podobné vozy ${bm} v katalogu NNAuto.`;

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "NNAuto", url: `${SITE_ORIGIN}/` },
    { name: "Prodat auto", url: `${SITE_ORIGIN}/prodat-auto` },
    { name: `Prodat ${bm}`, url: canonical },
  ]);

  const howToJsonLd = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Jak prodat ${bm} na NNAuto`,
    description: `Krátký návod, jak rychle vložit inzerát a prodat ${bm} přes NNAuto.cz.`,
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Porovnejte cenu",
        text: `${pricePart} Správně nastavená cena pomůže získat více relevantních zájemců.`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Připravte fotky a popis",
        text: `Vyfoťte exteriér, interiér, tachometr, servisní knihu a poškození. U ${bm} uveďte rok, nájezd, výbavu a servisní historii.`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Vložte inzerát zdarma",
        text: "Na NNAuto vyplníte formulář, přidáte fotografie a zveřejníte inzerát pro kupující z celé České republiky.",
      },
    ],
  };

  const faqJsonLd = buildFaqPageJsonLd([
    {
      question: `Kolik stojí prodej ${bm} na NNAuto?`,
      answer:
        "Základní inzerát pro soukromé prodejce můžete vložit zdarma. Autobazary a prodejci s více vozy mohou využít balíčky inzerce.",
    },
    {
      question: `Jak nastavit cenu při prodeji ${bm}?`,
      answer: pricePart,
    },
    {
      question: `Kde najdu kupce pro ${bm}?`,
      answer:
        "Po vložení inzerátu na NNAuto vás mohou zájemci kontaktovat přímo přes zprávu, telefon, WhatsApp nebo Telegram.",
    },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />

      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"
        >
          <a href="/" className="hover:underline">NNAuto</a>
          <span aria-hidden>›</span>
          <a href="/prodat-auto" className="hover:underline">Prodat auto</a>
          <span aria-hidden>›</span>
          <span aria-current="page">{bm}</span>
        </nav>

        <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Prodat {bm} zdarma
        </h1>

        <p className="mb-6 max-w-3xl text-lg text-muted-foreground">
          Chcete <strong>prodat {bm}</strong>? Vložte inzerát na NNAuto.cz,
          oslovte kupující z celé České republiky a prodávejte bez provize.
          {stats.total > 0 ? (
            <>
              {" "}V katalogu aktuálně vidíme <strong>{stats.total}</strong>{" "}
              {inzeratWord(stats.total)} podobných vozů, takže cenu snadno
              porovnáte podle trhu.
            </>
          ) : null}
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <a
            href="/add-listing"
            className="rounded-md bg-[#B8860B] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#9c7308]"
          >
            Přidat inzerát {bm}
          </a>
          <a
            href={buyerUrl}
            className="rounded-md border px-6 py-3 font-medium transition-colors hover:bg-accent"
          >
            Porovnat ceny {bm}
          </a>
        </div>

        <section className="mb-10 rounded-xl border bg-card p-5">
          <h2 className="mb-3 text-2xl font-bold">Jak prodat {bm} rychleji</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Nastavte realistickou cenu.</strong>{" "}
              {pricePart}
            </li>
            <li>
              <strong className="text-foreground">Přidejte kvalitní fotografie.</strong>{" "}
              Kupující chtějí vidět karoserii, interiér, kola, tachometr i servisní historii.
            </li>
            <li>
              <strong className="text-foreground">Popište stav otevřeně.</strong>{" "}
              Uveďte výbavu, pravidelný servis, případné vady a důvod prodeje.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-4 text-2xl font-bold">Časté dotazy</h2>
          <div className="space-y-4">
            {[
              ["Je vložení inzerátu zdarma?", "Ano, soukromý prodejce může vložit základní inzerát zdarma. Pro autobazary jsou připravené balíčky."],
              [`Jak dlouho trvá prodej ${bm}?`, "Záleží na ceně, stavu vozu, kvalitě fotek a popisu. Reálná cena a kompletní informace obvykle výrazně zrychlí prodej."],
              ["Platím provizi z prodeje?", "Ne. Kupující kontaktuje přímo vás a obchod dokončujete bez provize pro NNAuto."],
            ].map(([q, a]) => (
              <div key={q} className="rounded-lg border bg-card p-4">
                <h3 className="mb-1 font-semibold">{q}</h3>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-xl border border-border bg-muted/30 px-6 py-8 text-center">
          <h2 className="mb-2 text-2xl font-bold">Vložte inzerát ještě dnes</h2>
          <p className="mb-5 text-muted-foreground">
            Prodej {bm} začíná dobrým inzerátem. Přidejte auto během pár minut.
          </p>
          <a
            href="/add-listing"
            className="inline-block rounded-md bg-[#B8860B] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#9c7308]"
          >
            Prodat {bm}
          </a>
        </div>
      </main>
    </>
  );
}
