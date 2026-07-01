import { buildPaginationAlternates } from "./pagination-meta";

/** Server-rendered rel=prev/next for paginated collection pages */
export function PaginationHeadLinks({
  basePath,
  page,
  totalPages: pages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  const { prev, next } = buildPaginationAlternates(basePath, page, pages);
  return (
    <>
      {prev ? <link rel="prev" href={prev} /> : null}
      {next ? <link rel="next" href={next} /> : null}
    </>
  );
}
