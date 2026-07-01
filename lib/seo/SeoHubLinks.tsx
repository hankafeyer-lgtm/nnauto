/** Reusable internal link block — real <a href> for crawlers */
export function SeoHubLinks({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  if (!links.length) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            className="inline-block rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition-colors"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** SEO architecture hub — links every major level of the funnel */
export const SEO_ARCHITECTURE_LINKS = [
  { label: "Domů", href: "/" },
  { label: "Katalog aut", href: "/listings" },
  { label: "Auta podle značek", href: "/auta" },
  { label: "Diesel auta", href: "/auta/diesel" },
  { label: "SUV auta", href: "/auta/suv" },
  { label: "Auta do 300 000 Kč", href: "/auta/do-300000" },
];

export function SeoArchitectureNav({ className = "" }: { className?: string }) {
  return (
    <nav aria-label="SEO navigace" className={className}>
      <SeoHubLinks links={SEO_ARCHITECTURE_LINKS} />
    </nav>
  );
}
