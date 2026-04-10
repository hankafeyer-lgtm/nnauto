import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { db } from "@lib/db";
import { articles, updateArticleSchema } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, slug));

    if (!article) return error("Article not found", 404);
    return json(article);
  } catch (e: unknown) {
    return error("Failed to load article", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const body = await req.json();
    const parsed = updateArticleSchema.parse(body);

    const [updated] = await db
      .update(articles)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(articles.slug, slug))
      .returning();

    if (!updated) return error("Article not found", 404);
    return json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin();
    const { slug } = await params;
    const [deleted] = await db
      .delete(articles)
      .where(eq(articles.slug, slug))
      .returning({ id: articles.id });

    if (!deleted) return error("Article not found", 404);
    return json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
