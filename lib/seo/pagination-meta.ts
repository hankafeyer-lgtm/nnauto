import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";

export type PaginationAlternates = {
  canonical: string;
  prev?: string;
  next?: string;
};

export function buildPaginationAlternates(
  basePath: string,
  page: number,
  totalPages: number,
): PaginationAlternates {
  const canonical =
    page > 1
      ? absoluteUrl(`${basePath}?page=${page}`)
      : absoluteUrl(basePath);

  const result: PaginationAlternates = { canonical };

  if (page > 1) {
    result.prev =
      page === 2 ? absoluteUrl(basePath) : absoluteUrl(`${basePath}?page=${page - 1}`);
  }
  if (page < totalPages) {
    result.next = absoluteUrl(`${basePath}?page=${page + 1}`);
  }

  return result;
}

export function buildPaginatedMetadata(
  basePath: string,
  page: number,
  totalPages: number,
  baseMeta: Pick<Metadata, "title" | "description" | "openGraph" | "twitter" | "robots">,
): Metadata {
  const { canonical } = buildPaginationAlternates(basePath, page, totalPages);

  return {
    ...baseMeta,
    alternates: { canonical },
    openGraph: baseMeta.openGraph
      ? { ...baseMeta.openGraph, url: canonical }
      : undefined,
  };
}

export function parsePageParam(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

export function totalPages(totalItems: number, perPage: number): number {
  return Math.max(1, Math.ceil(totalItems / perPage));
}
