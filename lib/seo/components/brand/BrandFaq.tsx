import { shouldRenderFaq } from "@lib/seo/features";

export type FaqItem = { question: string; answer: string };

export function BrandFaq({
  brandName,
  items,
}: {
  brandName: string;
  items: FaqItem[];
}) {
  if (!shouldRenderFaq("brandFaq")) return null;
  if (!items.length) return null;

  return (
    <section className="mt-10" aria-labelledby="brand-faq-heading">
      <h2 id="brand-faq-heading" className="text-xl font-semibold mb-4">
        Časté dotazy – {brandName}
      </h2>
      <dl className="space-y-4">
        {items.map((item) => (
          <div key={item.question}>
            <dt className="font-medium text-foreground">{item.question}</dt>
            <dd className="mt-1 text-muted-foreground">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
