import type { Metadata } from "next";
import { db } from "@lib/db";
import { listings, users } from "@shared/schema";
import { eq } from "drizzle-orm";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  if (!listing) return { title: "Inzerát nenalezen | NNAuto" };

  const brand = listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const title = `${brand} ${listing.model} ${listing.year} - ${price} Kč | NNAuto`;
  const photo = listing.photos?.[0];
  const imageUrl = photo ? `https://nnauto.cz/img/${photo.replace(/^\/+/, "")}?w=1200&q=80&f=webp` : "https://nnauto.cz/og-image.png";

  return {
    title,
    description: `${brand} ${listing.model}, rok ${listing.year}, ${listing.mileage?.toLocaleString("cs-CZ")} km, ${price} Kč.`,
    openGraph: { title, url: `https://nnauto.cz/listing/${id}`, siteName: "NNAuto", images: [{ url: imageUrl, width: 1200, height: 630 }], locale: "cs_CZ", type: "website" },
    alternates: { canonical: `https://nnauto.cz/listing/${id}` },
  };
}

export default async function ListingDetail({ params }: Props) {
  const { id } = await params;
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Inzerát nenalezen</h1>
        <a href="/listings" className="text-primary underline">Zpět na inzeráty</a>
      </div>
    );
  }

  let seller: any = null;
  try {
    const [u] = await db.select({ phone: users.phone, email: users.email, firstName: users.firstName }).from(users).where(eq(users.id, listing.userId));
    seller = u;
  } catch {}

  const brand = listing.brand.charAt(0).toUpperCase() + listing.brand.slice(1);
  const price = Number(listing.price).toLocaleString("cs-CZ");
  const mileage = listing.mileage?.toLocaleString("cs-CZ") || "0";
  const photoKeys = (listing.photos || []).filter(Boolean);
  const mainPhoto = photoKeys[0];
  const mainImgSrc = mainPhoto ? `/img/${mainPhoto.replace(/^\/+/, "")}?w=960&q=76&f=webp` : "";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="text-xl font-bold">
            <span className="text-[#B8860B]">NN</span>Auto
          </a>
          <nav className="flex items-center gap-3">
            <a href="/listings" className="text-sm">Vyhledat</a>
            <a href="/add-listing" className="px-3 py-1.5 text-sm border rounded-lg">Přidat auto</a>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <a href="/listings" className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-black/50 text-white rounded-lg text-sm">
          ← Zpět na inzeráty
        </a>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Main photo */}
            <div className="rounded-2xl overflow-hidden bg-muted">
              {mainImgSrc ? (
                <img src={mainImgSrc} alt={listing.title || `${brand} ${listing.model}`}
                  loading="eager" decoding="async" className="w-full aspect-[3/2] object-cover" />
              ) : (
                <div className="w-full aspect-[3/2] bg-muted flex items-center justify-center text-muted-foreground">Bez fotografie</div>
              )}
            </div>

            {/* Thumbnails */}
            {photoKeys.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {photoKeys.slice(0, 10).map((key, i) => (
                  <img key={i} src={`/img/${key.replace(/^\/+/, "")}?w=100&q=60&f=webp`}
                    alt={`Foto ${i + 1}`} loading="lazy" decoding="async"
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border" />
                ))}
              </div>
            )}

            {listing.isTopListing && (
              <span className="inline-block px-3 py-1 text-sm font-bold bg-amber-400 text-black rounded-lg">⭐ TOP INZERÁT</span>
            )}

            <h1 className="text-2xl font-bold">{listing.title || `${brand} ${listing.model}`}</h1>

            {/* Specs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-card p-3 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground">Rok</p>
                <p className="font-semibold">{listing.year}</p>
              </div>
              <div className="bg-card p-3 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground">Nájezd</p>
                <p className="font-semibold">{mileage} km</p>
              </div>
              <div className="bg-card p-3 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground">Palivo</p>
                <p className="font-semibold">{listing.fuelType?.[0] || "-"}</p>
              </div>
              <div className="bg-card p-3 rounded-xl border text-center">
                <p className="text-xs text-muted-foreground">Převodovka</p>
                <p className="font-semibold">{listing.transmission?.[0] || "-"}</p>
              </div>
            </div>

            {listing.description && (
              <div className="prose max-w-none">
                <h2 className="text-lg font-semibold mb-2">Popis</h2>
                <p className="whitespace-pre-wrap text-sm">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border p-6 sticky top-24">
              <p className="text-3xl font-bold text-[#B8860B] mb-4">{price} Kč</p>
              {seller?.phone && (
                <a href={`tel:${seller.phone}`}
                  className="block w-full py-3 bg-[#B8860B] text-white text-center rounded-xl font-medium mb-3">
                  📞 {seller.phone}
                </a>
              )}
              {seller?.email && (
                <a href={`mailto:${seller.email}`}
                  className="block w-full py-3 border text-center rounded-xl text-sm">
                  ✉️ Napsat email
                </a>
              )}
              {listing.region && (
                <p className="text-sm text-muted-foreground mt-4">📍 {listing.region}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
