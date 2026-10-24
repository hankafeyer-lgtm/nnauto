"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AD_PLACEMENT_CATALOG, AD_ROTATION_COPY } from "@/lib/ads";
import { formatCzk } from "@/pages/business/BusinessAdsShell";
import { Link } from "@/lib/navigation";

export default function TermsPage() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Obchodní podmínky"
        description="Obchodní podmínky NNAuto.cz — inzerce, reklamní kampaně, rotace reklamních míst a pravidla služeb."
        url="https://nnauto.cz/obchodni-podminky"
        keywords="obchodní podmínky, reklama, NNAuto, rotace, inzerce"
      />
      <Header />

      <main className="flex-1 bg-[#f7f3ea]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="mx-auto mb-10 max-w-3xl">
            <p className="mb-2 text-sm font-medium text-[#B8860B]">NNAuto</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Obchodní podmínky
            </h1>
            <p className="mt-3 text-muted-foreground">
              Poslední aktualizace: 24. října 2026
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">1. Úvod</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Tyto obchodní podmínky upravují užívání služeb NNAuto.cz
                  (dále jen „Služba“), včetně zveřejňování inzerátů a placené
                  reklamní prezentace pro firmy a partnery.
                </p>
                <p>
                  Provozovatel: NNAuto, IČ 23974559. Kontakt:{" "}
                  <a
                    href="mailto:info@nnauto.cz"
                    className="font-medium text-[#8a6508] underline-offset-2 hover:underline"
                  >
                    info@nnauto.cz
                  </a>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">2. Inzerce vozidel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Inzerent odpovídá za pravdivost údajů o vozidle, fotografie a
                  komunikaci se zájemci. NNAuto není smluvní stranou prodeje —
                  zprostředkovává pouze marketplace.
                </p>
                <p>
                  Ceník inzerce a TOP zvýraznění najdete na stránce{" "}
                  <Link
                    href="/pricing"
                    className="font-medium text-[#8a6508] underline-offset-2 hover:underline"
                  >
                    Ceník služeb
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <Card
              id="reklama"
              className="scroll-mt-24 rounded-2xl border-[#B8860B]/30 bg-gradient-to-br from-[#B8860B]/5 to-white shadow-sm"
            >
              <CardHeader>
                <CardTitle className="text-lg text-[#8a6508]">
                  3. Reklamní kampaně (Business)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Reklamní kampaň umožňuje zobrazit vlastní kreativitu (obrázek,
                  video, text, odkaz) na vybraném místě webu NNAuto. Jedna
                  kampaň je{" "}
                  <strong className="text-foreground">adaptivní</strong> —
                  zobrazuje se na počítači, tabletu i mobilu v úpravě vhodné pro
                  dané zařízení. Nejde o dvě samostatné objednávky pro desktop a
                  mobil.
                </p>

                <div
                  id="rotace"
                  className="scroll-mt-24 rounded-xl border border-[#B8860B]/20 bg-white/80 p-4"
                >
                  <h3 className="font-semibold text-foreground">
                    3.1 Rotace na stejném místě
                  </h3>
                  <p className="mt-2">{AD_ROTATION_COPY.short}</p>
                  <ul className="mt-3 list-disc space-y-1.5 pl-5">
                    {AD_ROTATION_COPY.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                  <p className="mt-3">
                    Technicky systém při každém zobrazení slotu vybírá z aktivních
                    kampaní na daném místě ty s nejnižším počtem dosavadních
                    zobrazení (při shodě náhodně). Cílem je{" "}
                    <strong className="text-foreground">
                      spravedlivé sdílení prostoru
                    </strong>
                    , nikoli garance konkrétního počtu impresí, kliků ani
                    konverzí.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    3.2 Reklamní místa a orientační ceny
                  </h3>
                  <p className="mt-2">
                    Aktuální ceny vycházejí z katalogu a může je upravit
                    administrátor. Orientační startovací nabídka:
                  </p>
                  <ul className="mt-3 space-y-2">
                    {AD_PLACEMENT_CATALOG.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-xl border bg-white/90 px-3 py-2.5"
                      >
                        <p className="font-medium text-foreground">
                          {p.shortLabel}
                        </p>
                        <p className="mt-0.5 text-xs">{p.description}</p>
                        <p className="mt-1 text-xs font-medium text-[#8a6508]">
                          od {formatCzk(p.pricesKc[7])} / 7 dní ·{" "}
                          {formatCzk(p.pricesKc[14])} / 14 dní ·{" "}
                          {formatCzk(p.pricesKc[30])} / 30 dní
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    3.3 Schválení a obsah
                  </h3>
                  <p className="mt-2">
                    NNAuto si vyhrazuje právo kampaň neschválit nebo pozastavit,
                    pokud je obsah klamavý, v rozporu se zákonem, urážlivý, nebo
                    poškozuje značku NNAuto. Reklama musí být vždy jasně
                    označená (např. „Reklama“).
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground">
                    3.4 Platba
                  </h3>
                  <p className="mt-2">
                    Cena se hradí za zvolené období (7 / 14 / 30 dní). Online
                    platba kartou (Stripe) bude doplněna; do té doby může být
                    kampaň testována lokálně bez reálné úhrady. Vrácení peněz za
                    nevyčerpanou část období se řeší individuálně po kontaktu na
                    info@nnauto.cz.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">4. Ochrana údajů</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  Zpracování osobních údajů upravují{" "}
                  <Link
                    href="/privacy"
                    className="font-medium text-[#8a6508] underline-offset-2 hover:underline"
                  >
                    Zásady ochrany osobních údajů
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-black/5 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">5. Závěr</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-relaxed text-muted-foreground">
                <p>
                  Odesláním reklamní kampaně nebo využitím Služby potvrzujete, že
                  jste se s těmito podmínkami seznámili. NNAuto může podmínky
                  aktualizovat; podstatné změny uveřejníme na této stránce.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
