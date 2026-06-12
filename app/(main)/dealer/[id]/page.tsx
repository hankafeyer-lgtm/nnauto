import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Building2, CheckCircle2, Mail, MapPin, Phone } from "lucide-react";

import { db } from "@lib/db";
import { buildListingUrl } from "@lib/seo/listing-url";
import { dealers, listings } from "@shared/schema";
import {
  PublicAboutBlock,
  PublicDealerMap,
  PublicHeroPhoto,
  PublicReviewsBlock,
  PublicSocialLinks,
  PublicTodayHoursChip,
  PublicTodayHoursRow,
} from "./public-dealer-settings";
import PublicHeader from "./public-header";

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
      <PublicHeader />
      <section className="mx-auto max-w-7xl space-y-4 px-3 pb-24 pt-4 sm:space-y-6 sm:px-4 sm:py-10">
        <PublicHeroPhoto dealerId={dealer.id} alt={dealer.companyName} />
        <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-white shadow-[0_18px_60px_rgba(120,72,12,0.12)] sm:rounded-[2rem] sm:shadow-[0_24px_90px_rgba(120,72,12,0.12)]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(246,220,148,0.28),transparent_34%),linear-gradient(135deg,#171006_0%,#33220c_48%,#6f4c17_100%)] px-4 py-4 text-white sm:px-7 sm:py-6">
            <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-amber-100/10 blur-3xl sm:h-56 sm:w-56" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white text-xl font-black text-amber-900 shadow-xl sm:h-20 sm:w-20 sm:rounded-3xl sm:text-2xl">
                  {dealer.logoUrl ? (
                    <img src={dealer.logoUrl} alt={dealer.companyName} className="h-full w-full object-cover" />
                  ) : (
                    initials || "NN"
                  )}
                </div>
                <div className="min-w-0">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    {dealer.isVerified && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white sm:text-xs">
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-300" />
                        Ověřený dealer
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2.5 py-0.5 text-[11px] font-semibold text-white sm:text-xs">
                      NNAuto.cz
                    </span>
                  </div>
                  <h1 className="truncate text-2xl font-black tracking-tight sm:text-4xl">{dealer.companyName}</h1>
                  <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-relaxed text-amber-50/80 sm:text-sm">
                    {dealer.description || "Prémiový dealer na NNAuto.cz s aktuální nabídkou vozů a přímým kontaktem."}
                  </p>
                </div>
              </div>
              <a
                href="#inventory"
                className="inline-flex h-11 shrink-0 items-center justify-center rounded-2xl bg-white px-5 text-sm font-black text-amber-900 shadow-xl transition hover:bg-amber-50 sm:h-12"
              >
                Prohlédnout nabídku
              </a>
            </div>

            <div className="relative mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:max-w-md">
              <div className="rounded-2xl bg-white/12 px-3 py-2 ring-1 ring-white/15">
                <p className="text-xl font-black leading-none sm:text-2xl">{dealerListings.length}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-amber-50/75">Aktivních vozů</p>
              </div>
              <PublicTodayHoursChip dealerId={dealer.id} />
            </div>
          </div>

        </div>

        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <div className="min-w-0 space-y-4 sm:space-y-6">
            <PublicAboutBlock
              dealerId={dealer.id}
              fallbackTitle={`O autobazaru ${dealer.companyName}`}
              fallbackText={dealer.description}
            />

            <section id="inventory">
              <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
                <h2 className="text-xl font-black text-[#5c3b10] sm:text-2xl">Aktuální nabídka</h2>
                <span className="text-sm text-muted-foreground">{dealerListings.length} vozů</span>
              </div>
              {dealerListings.length === 0 ? (
                <div className="rounded-3xl border border-dashed bg-white p-10 text-center text-muted-foreground">
                  Tento dealer zatím nemá aktivní nabídku.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
                  {dealerListings.map((listing) => {
                    const photo = listing.photos?.[0];
                    return (
                      <Link
                        key={listing.id}
                        href={buildListingUrl({ id: listing.id, brand: listing.brand, model: listing.model, year: listing.year })}
                        className="group overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-xl"
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
                        <div className="p-2.5 sm:p-4">
                          <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                            <h3 className="truncate text-sm font-black sm:text-base">{listing.brand} {listing.model}</h3>
                            {listing.isTopListing && <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-black text-white sm:px-2 sm:text-xs">TOP</span>}
                          </div>
                          <p className="text-xs text-muted-foreground sm:text-sm">{listing.year} · {listing.mileage?.toLocaleString("cs-CZ")} km</p>
                          <p className="mt-1.5 text-lg font-black text-amber-800 sm:mt-3 sm:text-xl">{Number(listing.price).toLocaleString("cs-CZ")} Kč</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
              <h2 className="text-base font-black sm:text-lg">Kontakt na dealera</h2>
              <div className="mt-3 space-y-2.5 text-sm">
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
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="rounded-2xl bg-amber-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-800">
                    Zavolat
                  </a>
                )}
                {dealer.phone && (
                  <a href={`https://wa.me/${dealer.phone.replace(/\D/g, "")}`} className="rounded-2xl border bg-white px-4 py-3 text-center text-sm font-bold hover:bg-amber-50">
                    WhatsApp
                  </a>
                )}
                {!dealer.phone && dealer.email && (
                  <a href={`mailto:${dealer.email}`} className="rounded-2xl bg-amber-700 px-4 py-3 text-center text-sm font-bold text-white hover:bg-amber-800 sm:col-span-2">
                    Napsat e-mail
                  </a>
                )}
              </div>
            </div>

            <PublicDealerMap
              dealerId={dealer.id}
              address={dealer.address}
              region={dealer.region}
            />

            <PublicSocialLinks dealerId={dealer.id} website={dealer.website} />
          </aside>
        </div>

        <div id="reviews">
          <PublicReviewsBlock dealerId={dealer.id} fallbackRating={4.9} />
        </div>
      </section>
    </main>
  );
}
