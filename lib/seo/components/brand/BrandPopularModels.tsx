import { formatBrandDisplay, formatModelDisplay } from "@lib/seo/brand-format";
import { shouldRenderSeoText } from "@lib/seo/features";

export function BrandPopularModels({
  brandSlug,
  brandName,
  models,
}: {
  brandSlug: string;
  brandName: string;
  models: Array<{ slug: string; model: string; total: number }>;
}) {
  if (!shouldRenderSeoText("brandSeoIntro")) return null;
  if (!models.length) return null;

  return (
    <section aria-labelledby="popular-models-heading" className="mt-10">
      <h2 id="popular-models-heading" className="text-xl font-semibold mb-3">
        Populární modely {brandName}
      </h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-3xl">
        Nejhledanější modely značky {brandName} s aktuálně dostupnou nabídkou
        na NNAuto. Klikněte pro zobrazení všech inzerátů konkrétního modelu.
      </p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {models.map((m) => (
          <li key={m.slug}>
            <a
              href={`/auta/${brandSlug}/${m.slug}`}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-accent transition-colors"
            >
              <span className="truncate font-medium">
                {brandName} {formatModelDisplay(m.model)}
              </span>
              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                {m.total}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
