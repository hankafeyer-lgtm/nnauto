import { isSeoTextsEnabled } from "@lib/seo/features";

export function BrandSimilarBrands({
  links,
}: {
  links: Array<{ href: string; label: string }>;
}) {
  if (!isSeoTextsEnabled()) return null;
  if (!links.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold mb-3">Podobné značky</h2>
      <ul className="flex flex-wrap gap-2">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        Prohlédněte si také{" "}
        <a href="/listings" className="underline">
          všechny inzeráty napříč značkami
        </a>
        .
      </p>
    </section>
  );
}
