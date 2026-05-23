import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Building2, CheckCircle2, Mail, MapPin, MessageCircle, Phone, Star } from "lucide-react";

import { db } from "@lib/db";
import { buildListingUrl } from "@lib/seo/listing-url";
import { dealers, listings } from "@shared/schema";
import {
  PublicDealerMap,
  PublicSocialLinks,
  PublicTodayHoursRow,
  PublicWorkingHoursSummary,
} from "./public-dealer-settings";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
  if (!dealer) return { title: "Dealer | NNAuto" };

  return {
    title: `${dealer.companyName} | NNAuto`,
    description: dealer.description || `Profil autobazaru ${dealer.companyName} na NNAuto.cz.`,
    robots: { index: true, follow: true },
    alternates: { canonical: `https://nnauto.cz/dealer/${dealer.id}` },
    openGraph: {
      title: `${dealer.companyName} | NNAuto`,
      description: dealer.description || `Profil autobazaru ${dealer.companyName} na NNAuto.cz.`,
      url: `https://nnauto.cz/dealer/${dealer.id}`,
      siteName: "NNAuto",
      locale: "cs_CZ",
      type: "website",
    },
  };
}

export default async function PublicDealerProfile({ params }: PageProps) {
  const { id } = await params;
  const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
  if (!dealer) notFound();

  const dealerListings = await db
    .select()
    .from(listings)
    .where(eq(listings.userId, dealer.ownerId))
    .orderBy(desc(listings.isTopListing), desc(listings.createdAt))
    .limit(24);

  const initials = dealer.companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50/60 via-background to-background">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        <div className="overflow-hidden rounded-[2rem] border border-amber-200 bg-white shadow-[0_24px_90px_rgba(120,72,12,0.12)]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(246,220,148,0.28),transparent_34%),linear-gradient(135deg,#171006_0%,#33220c_48%,#6f4c17_100%)] px-5 py-8 text-white sm:px-8 sm:py-10">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-100/10 blur-3xl" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl sm:h-24 sm:w-24">
                  <img src="/logo-icon-only.png" alt="NNAuto.cz" className="h-full w-full object-contain p-2" />
                </div>
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                      <Star className="mr-1 h-4 w-4 text-amber-200" />
                      NNAuto Premium
                    </span>
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-white">
                      Ověření prodejci
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight sm:text-5xl">NNAuto.cz</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-amber-50/80 sm:text-base">
                    Prémiová síť ověřených autobazarů a profesionálních prodejců v České republice.
                  </p>
                </div>
              </div>
              <a
                href="#inventory"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-amber-900 shadow-xl transition hover:bg-amber-50"
              >
                Prohlédnout nabídku
              </a>
            </div>
          </div>

          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_360px]">
            <div className="min-w-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-amber-100 text-3xl font-black text-amber-900 shadow-xl">
                  {dealer.logoUrl ? (
                    <img src={dealer.logoUrl} alt={dealer.companyName} className="h-full w-full object-cover" />
                  ) : (
                    initials || "NN"
                  )}
                </div>
                <div className="min-w-0 pb-1">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {dealer.isVerified && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="mr-1 h-4 w-4" />
                        Ověřený autobazar
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                      <Star className="mr-1 h-4 w-4" />
                      4.9 hodnocení
                    </span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-5xl">{dealer.companyName}</h1>
                  <p className="mt-3 max-w-3xl text-muted-foreground">
                    {dealer.description || "Prémiový dealer na NNAuto.cz. Prohlédněte si aktuální nabídku vozů a kontaktujte prodejce přímo."}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-amber-50 p-4">
                  <p className="text-2xl font-black">{dealerListings.length}</p>
                  <p className="text-sm text-amber-800">Aktivních vozů</p>
                </div>
                <div className="rounded-2xl bg-muted/50 p-4">
                  <p className="text-2xl font-black">~18 min</p>
                  <p className="text-sm text-muted-foreground">Průměrná odpověď</p>
                </div>
                <PublicWorkingHoursSummary dealerId={dealer.id} />
              </div>
            </div>

            <aside className="rounded-3xl border bg-amber-50/70 p-4">
              <h2 className="text-lg font-black">Kontakt na dealera</h2>
              <div className="mt-4 space-y-3 text-sm">
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 font-semibold hover:text-amber-700">
                    <Phone className="h-4 w-4 text-amber-700" />
                    {dealer.phone}
                  </a>
                )}
                {dealer.email && (
                  <a href={`mailto:${dealer.email}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 font-semibold hover:text-amber-700">
                    <Mail className="h-4 w-4 text-amber-700" />
                    {dealer.email}
                  </a>
                )}
                {(dealer.address || dealer.region) && (
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
                    <MapPin className="h-4 w-4 text-amber-700" />
                    {dealer.address || dealer.region}
                  </div>
                )}
                <PublicTodayHoursRow dealerId={dealer.id} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <a href={dealer.phone ? `tel:${dealer.phone}` : "#"} className="rounded-2xl bg-amber-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-800">
                  Zavolat
                </a>
                <a href={dealer.phone ? `https://wa.me/${dealer.phone.replace(/\D/g, "")}` : "#"} className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-bold hover:bg-amber-50">
                  WhatsApp
                </a>
              </div>
            </aside>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <section id="inventory">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">Aktuální nabídka</h2>
              <span className="text-sm text-muted-foreground">{dealerListings.length} vozů</span>
            </div>
            {dealerListings.length === 0 ? (
              <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-muted-foreground">
                Tento dealer zatím nemá aktivní nabídku.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {dealerListings.map((listing) => {
                  const photo = listing.photos?.[0];
                  return (
                    <Link
                      key={listing.id}
                      href={buildListingUrl({ id: listing.id, brand: listing.brand, model: listing.model, year: listing.year })}
                      className="group overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-xl"
                    >
                      <div className="aspect-[4/3] bg-muted">
                        {photo ? (
                          <img src={`/img/${photo}?w=520&h=390&fit=cover`} alt={`${listing.brand} ${listing.model}`} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Building2 className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h3 className="truncate font-black">{listing.brand} {listing.model}</h3>
                          {listing.isTopListing && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-white">TOP</span>}
                        </div>
                        <p className="text-sm text-muted-foreground">{listing.year} · {listing.mileage?.toLocaleString("cs-CZ")} km</p>
                        <p className="mt-3 text-xl font-black text-amber-800">{Number(listing.price).toLocaleString("cs-CZ")} Kč</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border bg-white p-5">
              <h3 className="font-black">Recenze dealerů</h3>
              <p className="mt-2 text-sm text-muted-foreground">Recenze a hodnocení připravujeme. Profil je připravený pro plnou CRM reputaci.</p>
            </div>
            <PublicDealerMap
              dealerId={dealer.id}
              address={dealer.address}
              region={dealer.region}
            />
            <PublicSocialLinks dealerId={dealer.id} website={dealer.website} />
          </aside>
        </div>
      </section>
    </main>
  );
}
