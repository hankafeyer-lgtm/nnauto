import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { brands, models } from "@shared/schema";
import { eq } from "drizzle-orm";
import {
  buildBrandModelMetadata,
  resolveBrandBySlug,
  resolveModelBySlug,
  getBrandModelListingStats,
  getModelsForBrand,
  getModelListingCounts,
  JsonLd,
  breadcrumbJsonLd,
  BASE_URL,
} from "@lib/seo";
import BrandListingsClient from "../../brand-listings-client";

export const revalidate = 120;

const getBrand = cache((slug: string) => resolveBrandBySlug(slug));
const getModel = cache((brandId: string, slug: string) => resolveModelBySlug(brandId, slug));

type Props = { params: Promise<{ slug: string; model: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, model: modelSlug } = await params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Nenalezeno | NNAuto" };
  const model = await getModel(brand.id, modelSlug);
  if (!model) return { title: "Model nenalezen | NNAuto" };
  const stats = await getBrandModelListingStats(brand.name, model.name);
  return buildBrandModelMetadata(brand.name, brand.slug, model.name, model.slug, stats);
}

export async function generateStaticParams() {
  const allBrands = await db.select({ id: brands.id, slug: brands.slug }).from(brands);
  const result: { slug: string; model: string }[] = [];
  for (const b of allBrands) {
    const brandModels = await db
      .select({ slug: models.slug })
      .from(models)
      .where(eq(models.brandId, b.id));
    for (const m of brandModels) {
      result.push({ slug: b.slug, model: m.slug });
    }
  }
  return result;
}

export default async function BrandModelPage({ params }: Props) {
  const { slug, model: modelSlug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  const model = await getModel(brand.id, modelSlug);
  if (!model) notFound();

  const [stats, allModels, modelCounts] = await Promise.all([
    getBrandModelListingStats(brand.name, model.name),
    getModelsForBrand(brand.id),
    getModelListingCounts(brand.name),
  ]);

  const siblingModels = allModels
    .filter((m) => m.slug !== model.slug)
    .map((m) => ({
      ...m,
      count: modelCounts[m.name.toLowerCase()] ?? 0,
    }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "NNAuto", url: BASE_URL },
            { name: brand.name, url: `${BASE_URL}/brand/${brand.slug}` },
            { name: model.name, url: `${BASE_URL}/brand/${brand.slug}/${model.slug}` },
          ]),
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <nav className="text-sm text-muted-foreground mb-4">
          <Link href="/" className="hover:underline">NNAuto</Link>
          {" / "}
          <Link href={`/brand/${brand.slug}`} className="hover:underline">{brand.name}</Link>
          {" / "}
          <span>{model.name}</span>
        </nav>

        <h1 className="text-3xl font-bold mb-4">
          {brand.name} {model.name} – Prodej
        </h1>

        <p className="text-muted-foreground mb-8 max-w-3xl">
          {stats.count > 0
            ? `Nabídka ${stats.count} vozidel ${brand.name} ${model.name}${
                stats.minPrice && stats.maxPrice
                  ? `, ceny od ${stats.minPrice.toLocaleString("cs-CZ")} do ${stats.maxPrice.toLocaleString("cs-CZ")} Kč`
                  : ""
              }${
                stats.minYear && stats.maxYear && stats.minYear !== stats.maxYear
                  ? `, roky ${stats.minYear}–${stats.maxYear}`
                  : ""
              }. Ověřené inzeráty na NNAuto.`
            : `Vozidla ${brand.name} ${model.name} na NNAuto. Momentálně nejsou k dispozici žádné inzeráty.`}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-4">
            Inzeráty {brand.name} {model.name}
          </h2>
          <BrandListingsClient brand={brand.name} model={model.name} />
        </section>

        <div className="mt-8 text-center">
          <Link
            href={`/listings?brand=${encodeURIComponent(brand.name)}&model=${encodeURIComponent(model.name)}`}
            className="text-primary hover:underline font-medium"
          >
            Zobrazit všechny inzeráty {brand.name} {model.name} →
          </Link>
        </div>

        {siblingModels.length > 0 && (
          <section className="mt-12 border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">
              Další modely {brand.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {siblingModels.map((m) => (
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
      </div>
    </>
  );
}
