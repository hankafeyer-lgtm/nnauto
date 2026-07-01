import { isSeoTextsEnabled } from "@lib/seo/features";

export function BrandTopSearches({
  brandName,
  links,
}: {
  brandName: string;
  links: Array<{ href: string; label: string; slug: string }>;
}) {
  if (!isSeoTextsEnabled()) return null;
  if (!links.length) return null;

  return (
    <section className="mt-6">
      <h3 className="text-base font-semibold mb-2 text-muted-foreground">
        Nejčastěji hledané {brandName}
      </h3>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {links.map((l) => (
          <li key={l.slug}>
            <a
              href={l.href}
              className="text-muted-foreground hover:text-foreground hover:underline transition-colors"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
