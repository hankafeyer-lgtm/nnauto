import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@lib/db";
import { articles } from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { JsonLd, blogJsonLd, breadcrumbJsonLd, BASE_URL } from "@lib/seo";

export const revalidate = 120;

export async function generateMetadata(): Promise<Metadata> {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(articles)
    .where(eq(articles.isPublished, true));

  const hasContent = count > 0;

  return {
    title: "Blog | NNAuto",
    description:
      "Tipy, novinky a užitečné informace ze světa automobilů v České republice.",
    robots: { index: hasContent, follow: true },
    alternates: { canonical: `${BASE_URL}/blog` },
    openGraph: {
      title: "Blog | NNAuto",
      description:
        "Tipy, novinky a užitečné informace ze světa automobilů v České republice.",
      url: `${BASE_URL}/blog`,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
    },
  };
}

export default async function BlogIndex() {
  const posts = await db
    .select()
    .from(articles)
    .where(eq(articles.isPublished, true))
    .orderBy(desc(articles.publishedAt));

  return (
    <>
      <JsonLd
        data={[
          blogJsonLd(),
          breadcrumbJsonLd([
            { name: "NNAuto", url: BASE_URL },
            { name: "Blog", url: `${BASE_URL}/blog` },
          ]),
        ]}
      />

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Blog</h1>

        {posts.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Zatím nebyly publikovány žádné články.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                {post.coverImage && (
                  <Link href={`/blog/${post.slug}`}>
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                )}
                <div className="p-5">
                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
                      {post.title}
                    </h2>
                  </Link>
                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    {post.publishedAt && (
                      <time dateTime={post.publishedAt.toISOString()}>
                        {post.publishedAt.toLocaleDateString("cs-CZ", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    )}
                    {post.author && <span>{post.author}</span>}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-muted text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
