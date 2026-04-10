import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { brands } from "@shared/schema";
import {
  buildBrandMetadata,
  resolveBrandBySlug,
  getBrandListingStats,
  getModelsForBrand,
  getModelListingCounts,
  JsonLd,
  itemListJsonLd,
  breadcrumbJsonLd,
  BASE_URL,
} from "@lib/seo";
import BrandListingsClient from "../brand-listings-client";

export const revalidate = 120;

const getBrand = cache((slug: string) => resolveBrandBySlug(slug));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Značka nenalezena | NNAuto" };
  const stats = await getBrandListingStats(brand.name);
  return buildBrandMetadata(brand.name, brand.slug, stats.count);
}

export async function generateStaticParams() {
  const rows = await db.select({ slug: brands.slug }).from(brands);
  return rows.map((r) => ({ slug: r.slug }));
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();

  const [stats, brandModels, modelCounts] = await Promise.all([
    getBrandListingStats(brand.name),
    getModelsForBrand(brand.id),
    getModelListingCounts(brand.name),
  ]);

  const modelsWithCounts = brandModels
    .map((m) => ({
      ...m,
      count: modelCounts[m.name.toLowerCase()] ?? 0,
    }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count);

  const listItems = modelsWithCounts.map((m) => ({
    url: `${BASE_URL}/brand/${brand.slug}/${m.slug}`,
    name: `${brand.name} ${m.name}`,
  }));

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "NNAuto", url: BASE_URL },
            { name: brand.name, url: `${BASE_URL}/brand/${brand.slug}` },
          ]),
          ...(listItems.length > 0 ? [itemListJsonLd(`${brand.name} – modely`, listItems)] : []),
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold mb-4">
          {brand.name} – Prodej vozidel
        </h1>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          {stats.count > 0
            ? `Nabídka ${stats.count} vozidel značky ${brand.name} v České republice.${
                stats.minPrice && stats.maxPrice
                  ? ` Ceny od ${stats.minPrice.toLocaleString("cs-CZ")} do ${stats.maxPrice.toLocaleString("cs-CZ")} Kč.`
                  : ""
              }${
                stats.minYear && stats.maxYear && stats.minYear !== stats.maxYear
                  ? ` Roky výroby ${stats.minYear}–${stats.maxYear}.`
                  : ""
              } Ověřené inzeráty na NNAuto.`
            : `Vozidla značky ${brand.name} na NNAuto. Momentálně nejsou k dispozici žádné inzeráty.`}
        </p>

        {modelsWithCounts.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">
              Populární modely {brand.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {modelsWithCounts.map((m) => (
                <Link
                  key={m.slug}
                  href={`/brand/${brand.slug}/${m.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 text-sm font-medium transition-colors"
                >
                  {m.name}
                  <span className="text-xs text-muted-foreground">({m.count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Nejnovější inzeráty {brand.name}
          </h2>
          <BrandListingsClient brand={brand.name} />
        </section>

        <div className="mt-8 text-center">
          <Link
            href={`/listings?brand=${encodeURIComponent(brand.name)}`}
            className="text-primary hover:underline font-medium"
          >
            Zobrazit všechny inzeráty {brand.name} →
          </Link>
        </div>
      </div>
    </>
  );
}
