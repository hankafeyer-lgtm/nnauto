import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";
import { resolveHomeCanonicalUrl } from "./canonical";

const HOME_TITLE =
  "Online autobazar NNAuto | Ojetá auta na prodej v ČR";
const HOME_DESCRIPTION =
  "Ojetá auta na prodej v ČR na NNAuto.cz. Prohlédněte si aktuální inzeráty osobních aut, SUV, motocyklů a užitkových vozů. Filtrujte podle značky, modelu, ceny a regionu.";
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
      title: HOME_TITLE,
      description: HOME_OG_DESCRIPTION,
      url: canonical,
      siteName: "NNAuto",
      images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630 }],
      locale: "cs_CZ",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: HOME_TITLE,
      description: HOME_OG_DESCRIPTION,
      images: [absoluteUrl("/og-image.png")],
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}
