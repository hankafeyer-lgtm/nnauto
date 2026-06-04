"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, MapPin, Star, Quote } from "lucide-react";

const dayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
type DayKey = (typeof dayKeys)[number];
type WorkingHours = Record<DayKey, { closed: boolean; open: string; close: string }>;
type DealerLocalSettings = {
  addressDetails?: {
    country?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    showroomName?: string;
    lat?: string;
    lon?: string;
    displayName?: string;
  };
  workingHours?: WorkingHours;
  socialLinks?: {
    website?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  microsite?: {
    heroPhoto?: string;
    aboutTitle?: string;
    aboutText?: string;
    showAbout?: boolean;
    showInventory?: boolean;
    showReviews?: boolean;
  };
  reviews?: {
    enabled?: boolean;
    list?: Array<{
      id: string;
      author: string;
      rating: number;
      text: string;
      dateISO: string;
      response?: string;
      hidden?: boolean;
    }>;
  };
};

const defaultWorkingHours: WorkingHours = {
  mon: { closed: false, open: "09:00", close: "18:00" },
  tue: { closed: false, open: "09:00", close: "18:00" },
  wed: { closed: false, open: "09:00", close: "18:00" },
  thu: { closed: false, open: "09:00", close: "18:00" },
  fri: { closed: false, open: "09:00", close: "18:00" },
  sat: { closed: true, open: "09:00", close: "13:00" },
  sun: { closed: true, open: "09:00", close: "13:00" },
};

const shortLabels: Record<DayKey, string> = {
  mon: "Po",
  tue: "Út",
  wed: "St",
  thu: "Čt",
  fri: "Pá",
  sat: "So",
  sun: "Ne",
};

const normalizeUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

function formatShort(hours: WorkingHours) {
  const openDays = dayKeys.filter((day) => !hours[day].closed);
  if (openDays.length === 0) return "Zavřeno";
  if (openDays.length === 7) return "Nonstop";
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  const consecutive = openDays.every((day, index) => dayKeys.indexOf(day) === dayKeys.indexOf(first) + index);
  if (consecutive && first && last && first !== last) return `${shortLabels[first]}–${shortLabels[last]}`;
  return openDays.map((day) => shortLabels[day]).join(", ");
}

function todayStatus(hours: WorkingHours) {
  const jsDay = new Date().getDay();
  const today = dayKeys[jsDay === 0 ? 6 : jsDay - 1];
  const value = hours[today];
  if (value.closed) return "Dnes zavřeno";
  return `Dnes otevřeno do ${value.close}`;
}

function useDealerLocalSettings(dealerId: string) {
  const [settings, setSettings] = useState<DealerLocalSettings>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`nnauto_dealer_settings_${dealerId}`);
      setSettings(saved ? JSON.parse(saved) : {});
    } catch {
      setSettings({});
    }
  }, [dealerId]);

  return settings;
}

function composeAddress(address?: DealerLocalSettings["addressDetails"]) {
  if (!address) return "";
  return [
    address.showroomName,
    [address.street, address.houseNumber].filter(Boolean).join(" "),
    [address.postalCode, address.city].filter(Boolean).join(" "),
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function googleMapsUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function getOsmTiles(latValue: string, lonValue: string, zoom = 15) {
  const lat = Number(latValue);
  const lon = Number(lonValue);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return [];

  const latRad = (lat * Math.PI) / 180;
  const scale = 2 ** zoom;
  const x = Math.floor(((lon + 180) / 360) * scale);
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
      scale,
  );

  return [
    { x: x - 1, y },
    { x, y },
    { x: x + 1, y },
    { x: x - 1, y: y + 1 },
    { x, y: y + 1 },
    { x: x + 1, y: y + 1 },
  ].map((tile) => `https://tile.openstreetmap.org/${zoom}/${tile.x}/${tile.y}.png`);
}

function getCzechFallbackCoords(addressText: string) {
  const normalized = addressText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalized.includes("vaclavske namesti")) return { lat: "50.0810", lon: "14.4283" };
  if (normalized.includes("praha") || normalized.includes("prague")) return { lat: "50.0755", lon: "14.4378" };
  if (normalized.includes("brno")) return { lat: "49.1951", lon: "16.6068" };
  if (normalized.includes("ostrava")) return { lat: "49.8209", lon: "18.2625" };
  if (normalized.includes("plzen")) return { lat: "49.7384", lon: "13.3736" };
  if (normalized.includes("olomouc")) return { lat: "49.5938", lon: "17.2509" };
  if (normalized.includes("liberec")) return { lat: "50.7663", lon: "15.0543" };
  if (normalized.includes("ceske budejovice")) return { lat: "48.9745", lon: "14.4743" };
  return null;
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] };
  properties?: { country?: string };
};

export function PublicWorkingHoursSummary({ dealerId }: { dealerId: string }) {
  const settings = useDealerLocalSettings(dealerId);
  const hours = { ...defaultWorkingHours, ...(settings.workingHours || {}) };

  return (
    <div className="rounded-2xl bg-muted/50 p-4">
      <p className="text-2xl font-black">{formatShort(hours)}</p>
      <p className="text-sm text-muted-foreground">Pracovní doba</p>
    </div>
  );
}

export function PublicTodayHoursRow({ dealerId }: { dealerId: string }) {
  const settings = useDealerLocalSettings(dealerId);
  const hours = { ...defaultWorkingHours, ...(settings.workingHours || {}) };

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-3">
      <Clock className="h-4 w-4 text-amber-700" />
      {todayStatus(hours)}
    </div>
  );
}

export function PublicSocialLinks({
  dealerId,
  website,
}: {
  dealerId: string;
  website?: string | null;
}) {
  const settings = useDealerLocalSettings(dealerId);
  const links = useMemo(
    () =>
      [
        ["Web", settings.socialLinks?.website || website || ""],
        ["Facebook", settings.socialLinks?.facebook || ""],
        ["Instagram", settings.socialLinks?.instagram || ""],
        ["TikTok", settings.socialLinks?.tiktok || ""],
        ["YouTube", settings.socialLinks?.youtube || ""],
      ].filter(([, value]) => value.trim()),
    [settings.socialLinks, website],
  );

  if (links.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed bg-white p-5 text-sm text-muted-foreground">
        Dealer zatím nepřidal sociální odkazy.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border bg-white p-5">
      <h3 className="font-black">Sociální sítě</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map(([label, value]) => (
          <a
            key={label}
            href={normalizeUrl(value)}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-muted px-3 py-1 text-sm font-semibold transition hover:bg-amber-50 hover:text-amber-800"
          >
            {label}
          </a>
        ))}
      </div>
    </div>
  );
}

export function PublicDealerMap({
  dealerId,
  address,
  region,
}: {
  dealerId: string;
  address?: string | null;
  region?: string | null;
}) {
  const settings = useDealerLocalSettings(dealerId);
  const [coords, setCoords] = useState<{ lat: string; lon: string } | null>(null);
  const addressText =
    composeAddress(settings.addressDetails) ||
    settings.addressDetails?.displayName ||
    address ||
    region ||
    "";

  useEffect(() => {
    if (!addressText.trim()) return;
    if (settings.addressDetails?.lat && settings.addressDetails?.lon) {
      setCoords({ lat: settings.addressDetails.lat, lon: settings.addressDetails.lon });
      return;
    }
    const fallbackCoords = getCzechFallbackCoords(addressText);
    if (fallbackCoords) setCoords(fallbackCoords);
    const controller = new AbortController();
    const geocodeWithPhoton = async () => {
      const fallbackParams = new URLSearchParams({ q: addressText, limit: "1", lang: "cs" });
      const response = await fetch(`https://photon.komoot.io/api/?${fallbackParams.toString()}`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const data = (await response.json()) as { features?: PhotonFeature[] };
      const feature =
        (data.features || []).find((item) =>
          ["Česko", "Czechia", "Czech Republic"].includes(item.properties?.country || ""),
        ) ||
        (data.features || [])[0];
      const [lon, lat] = feature?.geometry?.coordinates || [];
      if (lat && lon) setCoords({ lat: String(lat), lon: String(lon) });
    };
    const params = new URLSearchParams({
      q: addressText,
      format: "jsonv2",
      countrycodes: "cz",
      limit: "1",
    });
    fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Array<{ lat: string; lon: string }>) => {
        if (data[0]) {
          setCoords({ lat: data[0].lat, lon: data[0].lon });
          return;
        }
        void geocodeWithPhoton();
      })
      .catch(async () => {
        try {
          await geocodeWithPhoton();
        } catch {
          // Keep empty map state.
        }
      });
    return () => controller.abort();
  }, [addressText, settings.addressDetails?.lat, settings.addressDetails?.lon]);

  if (!addressText.trim()) return null;

  const tiles = coords ? getOsmTiles(coords.lat, coords.lon) : [];

  return (
    <div className="rounded-3xl border border-amber-100 bg-white p-3 shadow-sm sm:p-4">
      <h3 className="flex items-center gap-2 font-black text-[#5c3b10]">
        <MapPin className="h-4 w-4 text-amber-700" />
        Kde nás najdete
      </h3>
      {tiles.length > 0 ? (
        <div className="relative mt-3 h-48 overflow-hidden rounded-2xl border border-amber-100 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_42%),linear-gradient(135deg,#fff8e8,#f7ead0)] sm:h-56">
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 opacity-95">
            {tiles.map((src) => (
              <img
                key={src}
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_45%,rgba(255,248,232,0.42)_100%)]" />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-full flex-col items-center">
            <MapPin className="h-10 w-10 fill-amber-700 text-white drop-shadow-[0_6px_14px_rgba(92,59,16,0.35)]" />
            <span className="mt-1 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#5c3b10] shadow-sm">
              Pobočka
            </span>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex h-48 flex-col items-center justify-center rounded-2xl border border-amber-100 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.18),transparent_42%),linear-gradient(135deg,#fff8e8,#f7ead0)] p-4 text-center text-[#5c3b10] sm:h-56">
          <MapPin className="mb-2 h-8 w-8 text-amber-700" />
          <p className="text-sm font-black">Mapa se načítá</p>
          <p className="mt-1 text-xs text-[#8a641f]">Adresu můžete rovnou otevřít v Google Maps.</p>
        </div>
      )}
      <div className="mt-3 flex gap-2 rounded-2xl bg-amber-50 p-3 text-sm leading-relaxed text-[#5c3b10]">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <span>{addressText}</span>
      </div>
      <a
        href={googleMapsUrl(addressText)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
      >
        Otevřít trasu v Google Maps
      </a>
    </div>
  );
}

export function PublicHeroPhoto({
  dealerId,
  fallback,
  alt,
}: {
  dealerId: string;
  fallback?: string;
  alt: string;
}) {
  const settings = useDealerLocalSettings(dealerId);
  const photo = settings.microsite?.heroPhoto;

  if (!photo && !fallback) return null;

  return (
    <div className="overflow-hidden rounded-3xl border border-amber-200 bg-amber-50/30 shadow-[0_16px_45px_rgba(120,72,12,0.10)]">
      <div className="aspect-[16/8] w-full sm:aspect-[16/5]">
        <img
          src={photo || fallback}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}

export function PublicAboutBlock({
  dealerId,
  fallbackTitle,
  fallbackText,
}: {
  dealerId: string;
  fallbackTitle: string;
  fallbackText?: string | null;
}) {
  const settings = useDealerLocalSettings(dealerId);
  const microsite = settings.microsite || {};
  if (microsite.showAbout === false) return null;

  const title = microsite.aboutTitle?.trim() || fallbackTitle;
  const text = microsite.aboutText?.trim() || fallbackText || "";
  if (!text) return null;

  return (
    <div className="rounded-3xl border bg-white p-5 sm:p-6">
      <h3 className="text-lg font-black sm:text-xl">{title}</h3>
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-base">
        {text}
      </p>
    </div>
  );
}

export function PublicReviewsBlock({
  dealerId,
  fallbackRating,
}: {
  dealerId: string;
  fallbackRating?: number;
}) {
  const settings = useDealerLocalSettings(dealerId);
  const reviews = settings.reviews;
  const microsite = settings.microsite || {};

  if (microsite.showReviews === false) return null;
  if (reviews?.enabled === false) return null;

  const visibleReviews = (reviews?.list || []).filter((review) => !review.hidden);
  const averageRating = visibleReviews.length
    ? visibleReviews.reduce((sum, review) => sum + review.rating, 0) / visibleReviews.length
    : (fallbackRating ?? 0);
  const totalReviews = visibleReviews.length;

  return (
    <div className="rounded-3xl border bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-black sm:text-xl">Hodnocení od zákazníků</h3>
          <p className="text-sm text-muted-foreground">
            {totalReviews > 0
              ? `Průměrné hodnocení dealera od ${totalReviews} zákazníků`
              : "Buďte první, kdo dealera ohodnotí."}
          </p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3 text-right">
          <p className="text-3xl font-black text-amber-900">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
            <span className="text-sm font-bold text-amber-700"> / 5</span>
          </p>
          <div className="flex justify-end">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={idx}
                className={`h-3.5 w-3.5 ${
                  idx < Math.round(averageRating) ? "fill-amber-500 text-amber-500" : "text-amber-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {visibleReviews.length > 0 ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visibleReviews.slice(0, 4).map((review) => (
            <div key={review.id} className="rounded-2xl border bg-amber-50/40 p-4">
              <Quote className="h-4 w-4 text-amber-700" />
              <div className="mt-2 flex items-center gap-2">
                <p className="font-bold">{review.author}</p>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-3 w-3 ${
                        idx < review.rating ? "fill-amber-500 text-amber-500" : "text-amber-300/50"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                  {new Date(review.dateISO).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{review.text}</p>
              {review.response ? (
                <div className="mt-3 rounded-xl border-l-4 border-amber-500 bg-white p-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    Odpověď dealera
                  </p>
                  <p className="mt-1 text-sm">{review.response}</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed bg-amber-50/30 p-6 text-center">
          <Star className="mx-auto mb-2 h-8 w-8 text-amber-400" />
          <p className="font-bold">Zatím žádná hodnocení</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Dealer prozatím neobdržel žádná hodnocení od zákazníků.
          </p>
        </div>
      )}
    </div>
  );
}
