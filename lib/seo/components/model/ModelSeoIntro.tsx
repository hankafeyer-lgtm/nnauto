import { shouldRenderSeoText } from "@lib/seo/features";

export function ModelSeoIntroParagraphs({
  paragraphs,
}: {
  paragraphs: string[];
}) {
  if (!shouldRenderSeoText("modelSeoIntro")) return null;
  if (!paragraphs.length) return null;

  return (
    <section className="mt-10 prose max-w-none text-muted-foreground space-y-4">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  );
}

export function ModelWhyBuy({
  brandName,
  modelName,
  paragraphs,
}: {
  brandName: string;
  modelName: string;
  paragraphs: string[];
}) {
  if (!shouldRenderSeoText("modelSeoIntro")) return null;
  if (!paragraphs.length) return null;

  return (
    <section className="mt-10 prose max-w-none text-muted-foreground space-y-3">
      <h2 className="text-xl font-semibold text-foreground">
        Proč koupit {brandName} {modelName}
      </h2>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  );
}

export function ModelWatchOut({
  brandName,
  modelName,
  paragraphs,
}: {
  brandName: string;
  modelName: string;
  paragraphs: string[];
}) {
  if (!shouldRenderSeoText("modelSeoIntro")) return null;
  if (!paragraphs.length) return null;

  return (
    <section className="mt-10 prose max-w-none text-muted-foreground space-y-3">
      <h2 className="text-xl font-semibold text-foreground">
        Na co si dát pozor
      </h2>
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </section>
  );
}
