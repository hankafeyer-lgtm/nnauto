import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@lib/db";
import { articles, brands, models } from "@shared/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import {
  buildArticleMetadata,
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  BASE_URL,
} from "@lib/seo";
import { autolinkBrandModel } from "@lib/seo/autolink";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug));
  if (!article) return { title: "Článek nenalezen | NNAuto" };
  return buildArticleMetadata(article);
}

export async function generateStaticParams() {
  const rows = await db
    .select({ slug: articles.slug })
    .from(articles)
    .where(eq(articles.isPublished, true));
  return rows.map((r) => ({ slug: r.slug }));
}

async function getBrandModelLinks() {
  const allBrands = await db
    .select({ id: brands.id, name: brands.name, slug: brands.slug })
    .from(brands);
  const brandIdMap = new Map(allBrands.map((b) => [b.id, b]));

  const allModels = await db
    .select({
      modelName: models.name,
      modelSlug: models.slug,
      brandId: models.brandId,
    })
    .from(models);

  const result: { brandName: string; brandSlug: string; modelName?: string; modelSlug?: string }[] = [];

  for (const b of allBrands) {
    result.push({ brandName: b.name, brandSlug: b.slug });
  }
  for (const m of allModels) {
    const parent = brandIdMap.get(m.brandId);
    if (parent) {
      result.push({
        brandName: parent.name,
        brandSlug: parent.slug,
        modelName: m.modelName,
        modelSlug: m.modelSlug,
      });
    }
  }

  return result;
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug));
  if (!article || !article.isPublished) notFound();

  const brandModelLinks = await getBrandModelLinks();
  const linkedContent = autolinkBrandModel(article.content, brandModelLinks);

  const relatedArticles = await db
    .select({ slug: articles.slug, title: articles.title, coverImage: articles.coverImage })
    .from(articles)
    .where(and(eq(articles.isPublished, true), ne(articles.slug, slug)))
    .orderBy(desc(articles.publishedAt))
    .limit(3);

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd(article),
          breadcrumbJsonLd([
            { name: "NNAuto", url: BASE_URL },
            { name: "Blog", url: `${BASE_URL}/blog` },
            { name: article.title, url: `${BASE_URL}/blog/${article.slug}` },
          ]),
        ]}
      />

      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:underline">NNAuto</Link>
          {" / "}
          <Link href="/blog" className="hover:underline">Blog</Link>
          {" / "}
          <span>{article.title}</span>
        </nav>

        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="w-full rounded-xl mb-6 max-h-96 object-cover"
          />
        )}

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
          {article.publishedAt && (
            <time dateTime={article.publishedAt.toISOString()}>
              {article.publishedAt.toLocaleDateString("cs-CZ", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {article.author && <span>• {article.author}</span>}
        </div>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: linkedContent }}
        />

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full bg-muted text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {relatedArticles.length > 0 && (
          <section className="mt-12 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Další články</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedArticles.map((ra) => (
                <Link
                  key={ra.slug}
                  href={`/blog/${ra.slug}`}
                  className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
                >
                  {ra.coverImage && (
                    <img
                      src={ra.coverImage}
                      alt={ra.title}
                      className="w-full h-24 object-cover rounded mb-2"
                    />
                  )}
                  <h3 className="font-medium text-sm line-clamp-2">{ra.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
