import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";
import { resolveHomeCanonicalUrl } from "./canonical";

const HOME_TITLE =
  "NNAuto - Prémiový Marketplace Aut v ČR | Prodej a Nákup Vozidel";
const HOME_DESCRIPTION =
  "NNAuto – moderní online autobazar v ČR. Tisíce ověřených inzerátů osobních aut, motocyklů a nákladních vozidel. Filtrujte podle značky, modelu, ceny a regionu.";
const HOME_OG_DESCRIPTION =
  "Najděte své vysněné auto na NNAuto. Osobní auta, motocykly i nákladní vozy. Ověření prodejci, pokročilé filtry a kontakt přímo s majitelem inzerátu.";

export { resolveHomeCanonicalUrl };

export function buildHomePageMetadata(
  params: Record<string, string | string[] | undefined> = {},
): Metadata {
  const canonical = resolveHomeCanonicalUrl(params);

  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    openGraph: {
      title: "NNAuto - Prémiový Marketplace Aut v České Republice",
      description: HOME_OG_DESCRIPTION,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "NNAuto - Prémiový Marketplace Aut v České Republice",
      description: HOME_OG_DESCRIPTION,
      images: [absoluteUrl("/og-image.png")],
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}
