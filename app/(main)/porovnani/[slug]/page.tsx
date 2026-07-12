import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@lib/seo/JsonLd";
import {
  buildComparisonMetadata,
  comparisonJsonLd,
  getComparisonPage,
  type ComparisonPage,
} from "@lib/seo/editorial-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getComparisonPage(slug);
  if (!page) return { title: "Porovnání aut | NNAuto", robots: { index: false, follow: true } };
  return buildComparisonMetadata(page);
}

export default async function ComparisonLandingPage({ params }: Props) {
  const { slug } = await params;
  const page = getComparisonPage(slug);
  if (!page) notFound();

  return <ComparisonContent page={page} />;
}

function ComparisonContent({ page }: { page: ComparisonPage }) {
  const jsonLd = comparisonJsonLd(page);

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <JsonLd data={jsonLd.breadcrumb} />
      <JsonLd data={jsonLd.faq} />
      <JsonLd data={jsonLd.itemList} />

      <nav
        className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-1"
        aria-label="Breadcrumb"
      >
        <a href="/" className="hover:underline">
          NNAuto
        </a>
        <span>/</span>
        <span>Porovnání</span>
        <span>/</span>
        <span className="text-foreground font-medium">{page.h1}</span>
      </nav>

      <h1 className="text-3xl md:text-4xl font-bold mb-4">{page.h1}</h1>
      <p className="text-muted-foreground max-w-3xl mb-8">
        {page.description}
      </p>

      <section className="grid md:grid-cols-2 gap-4 mb-10">
        {[page.left, page.right].map((car) => (
          <a
            key={car.href}
            href={car.href}
            className="rounded-lg border p-5 hover:bg-accent transition-colors"
          >
            <h2 className="text-xl font-semibold mb-2">{car.label}</h2>
            <p className="text-sm text-muted-foreground">
              Zobrazit aktuální inzeráty, ceny, ročníky, nájezd a výbavu.
            </p>
          </a>
        ))}
      </section>

      <section className="prose max-w-none text-muted-foreground space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Které auto vybrat?
        </h2>
        <p>{page.summary}</p>
        <p>
          Při porovnání ojetých aut sledujte nejen cenu, ale také reálný
          technický stav, servisní historii, nájezd, výbavu a dostupnost
          náhradních dílů. Dva podobné modely mohou mít výrazně rozdílné
          náklady podle konkrétní motorizace, převodovky a způsobu používání
          předchozím majitelem.
        </p>
        <p>
          Na NNAuto.cz můžete otevřít aktuální nabídku obou modelů a porovnat
          konkrétní inzeráty vedle sebe podle ceny, roku výroby, karoserie,
          paliva, převodovky a regionu prodejce. Před koupí doporučujeme
          zkušební jízdu, kontrolu dokumentace a u starších vozů také
          prověření VIN kódu.
        </p>
      </section>

      <section className="mt-10" aria-labelledby="comparison-faq">
        <h2 id="comparison-faq" className="text-xl font-semibold mb-4">
          Časté dotazy
        </h2>
        <dl className="space-y-4">
          {page.faq.map((item) => (
            <div key={item.question}>
              <dt className="font-medium text-foreground">{item.question}</dt>
              <dd className="mt-1 text-muted-foreground">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
