import { shouldRenderFaq } from "@lib/seo/features";
import type { FaqItem } from "@lib/seo/components/brand/BrandFaq";

export function ModelFaq({
  brandName,
  modelName,
  items,
}: {
  brandName: string;
  modelName: string;
  items: FaqItem[];
}) {
  if (!shouldRenderFaq("modelFaq")) return null;
  if (!items.length) return null;

  return (
    <section className="mt-10" aria-labelledby="model-faq-heading">
      <h2 id="model-faq-heading" className="text-xl font-semibold mb-4">
        Časté dotazy – {brandName} {modelName}
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
