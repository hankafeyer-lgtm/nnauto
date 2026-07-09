import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { listings } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import JsonLd from "@lib/seo/JsonLd";
import { SITE_ORIGIN } from "@lib/seo/constants";
import { buildAutaIndexMetadata } from "@lib/seo/auta-metadata";
import {
  buildBreadcrumbJsonLd,
  buildCollectionPageJsonLd,
  buildFaqPageJsonLd,
  buildHomePageJsonLdGraph,
} from "@lib/seo/structured-data";
import { formatBrandDisplay } from "@lib/seo/brand-format";
import { normalizeSlug } from "@lib/seo/slug";
import { listGlobalFacets, buildGlobalFacetPath } from "@lib/seo/facets";
import { SeoHubLinks } from "@lib/seo/SeoHubLinks";
import {
  buildPaginatedMetadata,
  parsePageParam,
  totalPages,
} from "@lib/seo/pagination-meta";
import { PaginationHeadLinks } from "@lib/seo/PaginationHeadLinks";
import { isSeoFeatureEnabled } from "@lib/seo/features";
import { AutaIndexBreadcrumb } from "@lib/seo/helpers/breadcrumb";
import { AutaHubSeoFooter } from "@lib/seo/components/auta/AutaHubSeoFooter";

export const revalidate = 900;

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePageParam(params.page);
  const brandRows = await queryBrandsWithCounts(300);
  const pages = totalPages(brandRows.length, 48);
  const base = buildAutaIndexMetadata(params);
  return buildPaginatedMetadata("/auta", page, pages, base);
}

const brandKey = sql<string>`lower(trim(${listings.brand}))`;

async function queryBrandsWithCounts(limit = 200) {
  try {
    return await db
      .select({
        brand: brandKey,
        total: sql<number>`count(*)::int`,
        lastUpdate: sql<Date>`max(${listings.updatedAt})`,
      })
      .from(listings)
      .where(eq(listings.isSold, false))
      .groupBy(brandKey)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);
  } catch (err) {
    console.error("[auta] queryBrandsWithCounts failed:", err);
    return [];
  }
}

export default async function AutaIndexPage({ searchParams }: Props) {
  if (!isSeoFeatureEnabled("autoHub")) notFound();

  const params = await searchParams;
  const page = parsePageParam(params.page);
  const perPage = 48;
  const brandRows = await queryBrandsWithCounts(300);
  const totalBrands = brandRows.length;
  const start = (page - 1) * perPage;
  const pageBrands = brandRows.slice(start, start + perPage);
  const canonical = page > 1 ? `${SITE_ORIGIN}/auta?page=${page}` : `${SITE_ORIGIN}/auta`;

  const itemEntries = pageBrands
    .filter((b) => b.brand)
    .map((b) => ({
      name: formatBrandDisplay(b.brand),
      url: `${SITE_ORIGIN}/auta/${normalizeSlug(String(b.brand))}`,
    }));

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "NNAuto", url: `${SITE_ORIGIN}/` },
    { name: "Auta na prodej" },
  ]);

  const collection = buildCollectionPageJsonLd({
    name: "Auta na prodej podle značek",
    description:
      "Přehled značek ojetých a nových vozů na NNAuto.cz. Vyberte si automobil podle výrobce a prohlédněte aktuální nabídku.",
    url: canonical,
    items: itemEntries,
  });
  const faq = buildFaqPageJsonLd([
    {
      question: "Jak najdu nejlepší ojeté auto na prodej?",
      answer:
        "Začněte výběrem značky nebo typu vozu, potom porovnejte cenu, rok výroby, nájezd, palivo a region prodejce. Na NNAuto můžete přejít ze stránky /auta na konkrétní značku, model nebo filtrovaný katalog inzerátů.",
    },
    {
      question: "Jsou na NNAuto inzeráty od soukromých prodejců i autobazarů?",
      answer:
        "Ano. V katalogu najdete auta od soukromých prodejců i autobazarů z celé České republiky. U každého inzerátu kontaktujete prodejce přímo.",
    },
    {
      question: "Jaké stránky jsou nejlepší pro rychlé hledání auta?",
      answer:
        "Pro obecný výběr použijte katalog /listings. Pro SEO kategorie a rychlé porovnání můžete využít stránky jako diesel auta, SUV auta, auta do 300 000 Kč nebo konkrétní značky a modely.",
    },
    {
      question: "Na co si dát pozor při koupi ojetého auta?",
      answer:
        "Zkontrolujte servisní historii, technický stav, nájezd, stav karoserie a shodu VIN. U dražších nebo starších vozů doporučujeme prověření historie vozidla a osobní prohlídku.",
    },
  ]);

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8">
      <PaginationHeadLinks basePath="/auta" page={page} totalPages={totalPages(totalBrands, perPage)} />
      <JsonLd data={buildHomePageJsonLdGraph()} />
      {breadcrumb ? <JsonLd data={breadcrumb} /> : null}
      {collection ? <JsonLd data={collection} /> : null}
      <JsonLd data={faq} />

      <AutaIndexBreadcrumb />

      <h1 className="text-3xl md:text-4xl font-bold mb-3">Auta na prodej</h1>
      <p className="text-muted-foreground max-w-3xl mb-4">
        Vyberte si značku a prohlédněte aktuální nabídku ojetých i nových vozů
        na NNAuto.cz. Máme {totalBrands} značek s aktivními inzeráty od
        soukromých prodejců i autobazarů.
      </p>

      <SeoHubLinks
        links={[
          { label: "Katalog inzerátů", href: "/listings" },
          { label: "Prodat auto zdarma", href: "/prodat-auto" },
          ...listGlobalFacets()
            .slice(0, 10)
            .map((f) => ({
              label:
                f.kind === "year"
                  ? `Auta ${f.value}`
                  : f.kind === "priceMax"
                    ? `Auta ${f.shortLabel}`
                    : `Auta ${f.label}`,
              href: buildGlobalFacetPath(f.slug),
            })),
        ]}
      />

      <h2 className="text-xl font-semibold mt-8 mb-3">Značky</h2>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {pageBrands.map((row) => {
          const slug = normalizeSlug(String(row.brand));
          return (
            <li key={slug}>
              <a
                href={`/auta/${slug}`}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                <span className="truncate font-medium">
                  {formatBrandDisplay(row.brand)}
                </span>
                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                  {row.total}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      {totalBrands > perPage ? (
        <nav className="mt-8 flex gap-2" aria-label="Stránkování">
          {page > 1 ? (
            <a
              href={page === 2 ? "/auta" : `/auta?page=${page - 1}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Předchozí
            </a>
          ) : null}
          {start + perPage < totalBrands ? (
            <a
              href={`/auta?page=${page + 1}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
            >
              Další
            </a>
          ) : null}
        </nav>
      ) : null}

      <AutaHubSeoFooter />
    </main>
  );
}
