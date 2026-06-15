import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq, desc } from "drizzle-orm";
import { Building2, Calendar, CheckCircle2, Cog, Fuel, Gauge, Mail, MapPin, Phone, Star } from "lucide-react";

import { db } from "@lib/db";
import { buildListingUrl } from "@lib/seo/listing-url";
import { fuelTypeLabelCs, regionLabelCs, transmissionLabelCs } from "@lib/seo/listing-labels";
import { dealers, listings } from "@shared/schema";
import {
  PublicAboutBlock,
  PublicDealerMap,
  PublicHeroPhoto,
  PublicReviewsBlock,
  PublicSocialLinks,
  PublicWorkingHoursAccordion,
} from "./public-dealer-settings";
import PublicHeader from "./public-header";
import DealerContactWrite from "./dealer-contact-write";
import BackToCabinetButton from "./back-to-cabinet-button";

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
        <BackToCabinetButton ownerId={dealer.ownerId} />
        <PublicHeroPhoto dealerId={dealer.id} alt={dealer.companyName} />
        <div className="overflow-hidden rounded-[1.75rem] border border-amber-200 bg-white shadow-[0_18px_60px_rgba(120,72,12,0.12)] sm:rounded-[2rem] sm:shadow-[0_24px_90px_rgba(120,72,12,0.12)]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(246,220,148,0.28),transparent_34%),linear-gradient(135deg,#171006_0%,#33220c_48%,#6f4c17_100%)] px-3.5 py-3.5 text-white sm:px-5 sm:py-3">
            <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-amber-100/10 blur-3xl sm:h-40 sm:w-40" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/25 bg-white text-base font-black text-amber-900 shadow-xl sm:h-11 sm:w-11 sm:text-sm">
                  {dealer.logoUrl ? (
                    <img src={dealer.logoUrl} alt={dealer.companyName} className="h-full w-full object-cover" />
                  ) : (
                    initials || "NN"
                  )}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5 sm:mb-0.5">
                    {dealer.isVerified && (
                      <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
                        <CheckCircle2 className="mr-1 h-3 w-3 text-emerald-300" />
                        Ověřený dealer
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white sm:text-[11px]">
                      NNAuto.cz
                    </span>
                  </div>
                  <h1 className="truncate text-xl font-black tracking-tight sm:text-xl">{dealer.companyName}</h1>
                  <p className="mt-0.5 line-clamp-1 max-w-2xl text-xs leading-relaxed text-amber-50/80 sm:mt-0 sm:text-[13px]">
                    {dealer.description || "Prémiový dealer na NNAuto.cz s aktuální nabídkou vozů a přímým kontaktem."}
                  </p>
                </div>
              </div>
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
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3">
                  {dealerListings.map((listing) => {
                    const photo = listing.photos?.[0];
                    const photoCount = listing.photos?.filter((p): p is string => typeof p === "string" && p.trim() !== "").length ?? 0;
                    const fuel = fuelTypeLabelCs(listing.fuelType);
                    const transmission = transmissionLabelCs(listing.transmission);
                    const region = regionLabelCs(listing.region);
                    return (
                      <Link
                        key={listing.id}
                        href={buildListingUrl({ id: listing.id, brand: listing.brand, model: listing.model, year: listing.year })}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-xl"
                      >
                        <div className="relative aspect-[4/3] bg-muted">
                          {photo ? (
                            <img src={`/img/${photo}?w=520&h=390&fit=cover`} alt={`${listing.brand} ${listing.model}`} className="h-full w-full object-cover transition group-hover:scale-[1.03]" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Building2 className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                          {listing.isTopListing && (
                            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-black shadow-md sm:text-xs">
                              <Star className="h-3 w-3 fill-black" />
                              TOP inzerát
                            </span>
                          )}
                          {listing.isSold && (
                            <span className="absolute right-2 top-2 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-white sm:text-xs">
                              Prodáno
                            </span>
                          )}
                          {photoCount > 1 && (
                            <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                              {photoCount} foto
                            </span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                          <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-2">
                            <h3 className="line-clamp-2 text-sm font-black leading-tight sm:text-base">{listing.brand} {listing.model}</h3>
                            <span className="shrink-0 text-base font-black text-amber-800 sm:text-lg">{Number(listing.price).toLocaleString("cs-CZ")} Kč</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-[13px]">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                              {listing.year}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Gauge className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                              {listing.mileage?.toLocaleString("cs-CZ")} km
                            </span>
                            {fuel && (
                              <span className="flex items-center gap-1.5">
                                <Fuel className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                                <span className="truncate">{fuel}</span>
                              </span>
                            )}
                            {transmission && (
                              <span className="flex items-center gap-1.5">
                                <Cog className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                                <span className="truncate">{transmission}</span>
                              </span>
                            )}
                          </div>
                          {region && (
                            <div className="mt-auto flex items-center gap-1.5 border-t border-amber-50 pt-2 text-xs text-muted-foreground sm:text-[13px]">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                              <span className="truncate">{region}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-4">
            <div className="rounded-3xl border border-amber-100 bg-amber-50/70 p-4 pb-5 shadow-sm">
              <h2 className="text-base font-black sm:text-lg">Kontakt na dealera</h2>
              <div className="mt-2.5 space-y-2 text-sm">
                {dealer.phone && (
                  <a href={`tel:${dealer.phone}`} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 font-semibold hover:text-amber-700">
                    <Phone className="h-4 w-4 text-amber-700" />
                    {dealer.phone}
                  </a>
                )}
                {dealer.email && (
                  <a href={`mailto:${dealer.email}`} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 font-semibold hover:text-amber-700">
                    <Mail className="h-4 w-4 text-amber-700" />
                    {dealer.email}
                  </a>
                )}
                {(dealer.address || dealer.region) && (
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-amber-700" />
                    {dealer.address || dealer.region}
                  </div>
                )}
                <PublicWorkingHoursAccordion dealerId={dealer.id} />
              </div>
              <DealerContactWrite
                phone={dealer.phone}
                email={dealer.email}
                chatListingId={dealerListings[0]?.id ?? null}
                dealerName={dealer.companyName}
              />
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
