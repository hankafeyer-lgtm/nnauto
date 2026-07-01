import type { Metadata } from "next";
import { absoluteUrl } from "./site-url";
import {
  resolveAutaIndexCanonicalUrl,
  shouldNoindexAutaIndex,
} from "./canonical";

const AUTA_TITLE = "Auta na prodej v ČR | Ojeté vozy podle značek | NNAuto";
const AUTA_DESCRIPTION =
  "Prohlédněte si ojetá a nová auta podle značek na NNAuto.cz. Aktuální nabídka vozů, ceny, fotografie a technické parametry od ověřených prodejců.";

export function buildAutaIndexMetadata(
  params: Record<string, string | string[] | undefined> = {},
): Metadata {
  const canonical = resolveAutaIndexCanonicalUrl(params);
  const noindex = shouldNoindexAutaIndex(params);

  return {
    title: AUTA_TITLE,
    description: AUTA_DESCRIPTION,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: AUTA_TITLE,
      description: AUTA_DESCRIPTION,
      url: canonical,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
      images: [{ url: absoluteUrl("/og-image.png"), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: AUTA_TITLE,
      description: AUTA_DESCRIPTION,
      images: [absoluteUrl("/og-image.png")],
    },
  };
}
