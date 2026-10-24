import type { Metadata } from "next";
import JsonLd from "@lib/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@lib/seo/structured-data";
import TermsClient from "./terms-client";

const TITLE = "Obchodní podmínky | NNAuto";
const DESCRIPTION =
  "Obchodní podmínky NNAuto.cz — inzerce, reklamní kampaně Business, rotace reklamních míst a pravidla služeb.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://nnauto.cz/obchodni-podminky",
    siteName: "NNAuto",
    locale: "cs_CZ",
    type: "website",
  },
  alternates: { canonical: "https://nnauto.cz/obchodni-podminky" },
};

export default function ObchodniPodminkyPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "NNAuto", url: "https://nnauto.cz/" },
          {
            name: "Obchodní podmínky",
            url: "https://nnauto.cz/obchodni-podminky",
          },
        ])}
      />
      <TermsClient />
    </>
  );
}
