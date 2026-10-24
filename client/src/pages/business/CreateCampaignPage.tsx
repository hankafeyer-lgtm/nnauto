"use client";

import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Monitor,
  RefreshCw,
  Smartphone,
  Upload,
  X,
} from "lucide-react";
import {
  AD_PLACEMENT_CATALOG,
  AD_DURATION_DAYS,
  AD_ROTATION_COPY,
  DEMO_IMAGE,
  emptyDraft,
  useScopedCampaigns,
  getAdPriceKc,
  addDaysIso,
  type CampaignDraft,
  type AdPlacementId,
  type AdDurationDays,
} from "@/lib/ads";
import { fetchCatalog, localDemoPay, saveCampaignToApi } from "@/lib/ads/api";
import type { AdPlacementCatalogItem } from "@shared/adCatalog";
import { AdPreview } from "@/components/ads/AdPreview";
import { BusinessAdsShell, formatCzk } from "./BusinessAdsShell";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { listingsFetchHeaders } from "@/lib/queryClient";

const STEPS = [
  "Umístění",
  "Kreativa",
  "Náhled",
  "Rozpočet a období",
  "Kontrola",
] as const;

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 20;

function toPublicObjectUrl(objectPath: string): string {
  const clean = objectPath.replace(/^\/+/, "");
  if (clean.startsWith("http")) return clean;
  if (clean.startsWith("objects/")) return `/${clean}`;
  return `/objects/${clean}`;
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function TipLink({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-sky-200/70 bg-sky-50/90 px-3 py-2.5 text-xs leading-snug text-sky-950",
        className,
      )}
    >
      <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
      <span>
        {AD_ROTATION_COPY.tip}{" "}
        <Link
          href={AD_ROTATION_COPY.rotationPath}
          className="font-semibold text-[#8a6508] underline decoration-[#B8860B]/45 underline-offset-2 hover:text-[#6b4f06]"
        >
          Podmínky
        </Link>
      </span>
    </p>
  );
}

export default function CreateCampaignPage() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const campaigns = useScopedCampaigns();
  const { toast } = useToast();
  const editId = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  ).get("edit");
  const [step, setStep] = useState(0);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [catalog, setCatalog] = useState(AD_PLACEMENT_CATALOG);
  const [pickMode, setPickMode] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [draft, setDraft] = useState<CampaignDraft>(() => emptyDraft());

  useEffect(() => {
    let cancelled = false;
    fetchCatalog()
      .then((data) => {
        if (cancelled || !data?.placements?.length) return;
        const remote = new Map(
          data.placements.map((p) => [p.id, p] as const),
        );
        setCatalog(
          AD_PLACEMENT_CATALOG.map((item) => {
            const r = remote.get(item.id);
            if (!r) return item;
            return {
              ...item,
              pricesKc: r.pricesKc ?? item.pricesKc,
              wiredInProduct: r.wiredInProduct ?? item.wiredInProduct,
              description: r.description || item.description,
              locationHint: r.locationHint || item.locationHint,
            };
          }),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!editId) return;
    let cancelled = false;
    (async () => {
      try {
        const { fetchMyCampaigns } = await import("@/lib/ads/api");
        const list = await fetchMyCampaigns();
        const existing =
          list.find((c) => c.id === editId) ||
          campaigns.find((c) => c.id === editId);
        if (!existing || cancelled) return;
        const days = (existing.durationDays || 14) as AdDurationDays;
        setDraft({
          name: existing.name,
          placement: existing.placement,
          headline: existing.headline,
          description: existing.description,
          image: existing.image,
          videoUrl: existing.videoUrl || "",
          ctaText: existing.ctaText,
          targetUrl: existing.targetUrl,
          dailyBudget: existing.dailyBudget,
          totalBudget: existing.totalBudget || existing.priceKc || 0,
          durationDays: AD_DURATION_DAYS.includes(days as AdDurationDays)
            ? (days as AdDurationDays)
            : 14,
          priceKc:
            existing.priceKc ||
            getAdPriceKc(existing.placement, 14) ||
            existing.totalBudget ||
            0,
          startDate: existing.startDate,
          endDate: existing.endDate,
          brandFilter: existing.brandFilter || "",
          categoryFilter: existing.categoryFilter || "",
        });
      } catch {
        /* keep local draft */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editId, campaigns]);

  const priceFor = (placement: AdPlacementId, days: AdDurationDays) => {
    const item = catalog.find((p) => p.id === placement);
    return item?.pricesKc?.[days] ?? getAdPriceKc(placement, days);
  };

  const applyDuration = (
    placement: AdPlacementId | null,
    days: AdDurationDays,
    startDate: string,
  ) => {
    if (!placement) return;
    const priceKc = priceFor(placement, days);
    const endDate = addDaysIso(startDate, days);
    setDraft((prev) => ({
      ...prev,
      placement,
      durationDays: days,
      priceKc,
      totalBudget: priceKc,
      dailyBudget: Math.round(priceKc / days),
      startDate,
      endDate,
    }));
  };

  const selectPlacement = (id: AdPlacementId) => {
    const item = catalog.find((p) => p.id === id);
    if (item && item.wiredInProduct === false) {
      toast({
        title: "Pozice se připravuje",
        description: "Tuto pozici zatím nelze objednat.",
      });
      return;
    }
    applyDuration(id, draft.durationDays || 14, draft.startDate);
    setPickMode(false);
    setFieldErrors({});
  };

  const validateStep = (s: number): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (s === 0 && !draft.placement) {
      errs.placement = "Vyberte reklamní místo";
    }
    if (s === 1) {
      if (!draft.name.trim()) errs.name = "Zadejte název kampaně";
      if (!draft.headline.trim()) errs.headline = "Zadejte nadpis";
      if (!draft.description.trim()) errs.description = "Zadejte popis";
      if (!draft.ctaText.trim()) errs.ctaText = "Zadejte text tlačítka";
      if (!draft.image.trim() && !draft.videoUrl?.trim()) {
        errs.image = "Nahrajte obrázek nebo video";
      }
      if (!isSafeHttpUrl(draft.targetUrl.trim())) {
        errs.targetUrl = "Cílový odkaz musí být http(s) URL";
      }
    }
    if (s === 3) {
      if (!(draft.priceKc > 0)) errs.price = "Neplatná cena";
      if (!draft.startDate || !draft.endDate || draft.endDate < draft.startDate) {
        errs.dates = "Zkontrolujte období kampaně";
      }
    }
    return errs;
  };

  const canNext = useMemo(
    () => Object.keys(validateStep(step)).length === 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [step, draft],
  );

  const goNext = () => {
    const errs = validateStep(step);
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      toast({
        title: "Doplňte povinná pole",
        description: Object.values(errs)[0],
        variant: "destructive",
      });
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const patch = (p: Partial<CampaignDraft>) => {
    setFieldErrors({});
    setDraft((prev) => ({ ...prev, ...p }));
  };

  const uploadImage = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      toast({
        title: "Neplatný soubor",
        description: "Povolené formáty: JPG, PNG, WebP.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast({
        title: "Soubor je příliš velký",
        description: `Maximum je ${MAX_IMAGE_MB} MB.`,
        variant: "destructive",
      });
      return;
    }
    setUploading("image");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/objects/upload-image", {
        method: "POST",
        headers: listingsFetchHeaders(),
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Upload failed");
      const data = (await res.json()) as { objectPath?: string };
      if (!data.objectPath) throw new Error("Upload failed");
      patch({ image: toPublicObjectUrl(data.objectPath) });
      toast({ title: "Obrázek nahrán" });
    } catch (e) {
      toast({
        title: "Nahrání selhalo",
        description: e instanceof Error ? e.message : "Zkuste to znovu",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const uploadVideo = async (file: File) => {
    if (
      !file.type.match(/^video\/(mp4|webm)/i) &&
      !file.name.match(/\.(mp4|webm)$/i)
    ) {
      toast({
        title: "Neplatné video",
        description: "Povolené: MP4 nebo WebM, max 15 s / 20 MB.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      toast({
        title: "Video je příliš velké",
        description: `Maximum je ${MAX_VIDEO_MB} MB.`,
        variant: "destructive",
      });
      return;
    }
    setUploading("video");
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await fetch("/api/objects/upload-video", {
        method: "POST",
        headers: listingsFetchHeaders(),
        body: fd,
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.text()) || "Upload failed");
      const data = (await res.json()) as { objectPath?: string };
      if (!data.objectPath) throw new Error("Upload failed");
      patch({ videoUrl: toPublicObjectUrl(data.objectPath) });
      toast({ title: "Video nahráno" });
    } catch (e) {
      toast({
        title: "Nahrání videa selhalo",
        description: e instanceof Error ? e.message : "Zkuste to znovu",
        variant: "destructive",
      });
    } finally {
      setUploading(null);
    }
  };

  const submitForApproval = async (withLocalDemoPay = false) => {
    const errs = {
      ...validateStep(0),
      ...validateStep(1),
      ...validateStep(3),
    };
    setFieldErrors(errs);
    if (Object.keys(errs).length) {
      toast({
        title: "Doplňte povinná pole",
        description: Object.values(errs)[0],
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const campaign = await saveCampaignToApi(draft, {
        submit: true,
        editId,
      });
      if (withLocalDemoPay) {
        const demo = await localDemoPay(campaign.id);
        toast({ title: "LOCAL DEMO — odesláno", description: demo.notice });
      } else {
        toast({
          title: "Uloženo (čeká na platbu)",
          description: `„${campaign.name}“ · ${formatCzk(campaign.priceKc || draft.priceKc)}. Stripe zatím není připojen.`,
        });
      }
      navigate("/business/advertising/campaigns");
    } catch (e) {
      toast({
        title: "Chyba uložení",
        description:
          e instanceof Error ? e.message : "Nepodařilo se vytvořit kampaň",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedItem = draft.placement
    ? catalog.find((p) => p.id === draft.placement)
    : null;

  const previewPanel = (
    <AdPreview
      draft={draft}
      placement={draft.placement}
      catalog={catalog}
      pickMode={pickMode}
      onPickModeChange={setPickMode}
      onSelectPlacement={selectPlacement}
      className="h-full min-h-[420px] lg:min-h-0"
    />
  );

  return (
    <BusinessAdsShell title="Nová kampaň">
      {/* Steps — mobile: progress + current name; desktop: full pills */}
      <div className="mb-4 sm:mb-6">
        <div className="mb-2 flex items-center justify-between gap-2 sm:hidden">
          <p className="text-sm font-semibold text-neutral-900">
            {STEPS[step]}
          </p>
          <p className="text-xs tabular-nums text-neutral-500">
            {step + 1} / {STEPS.length}
          </p>
        </div>
        <div className="mb-3 flex gap-1 sm:hidden">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={cn(
                "h-1 flex-1 rounded-full transition",
                i < step
                  ? "bg-emerald-500"
                  : i === step
                    ? "bg-[#B8860B]"
                    : "bg-neutral-200",
              )}
            />
          ))}
        </div>
        <ol className="hidden gap-2 sm:flex sm:flex-wrap">
          {STEPS.map((label, i) => (
            <li
              key={label}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm",
                i === step
                  ? "border-[#B8860B]/50 bg-[#B8860B]/10 font-semibold text-[#8a6508]"
                  : i < step
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-border bg-white text-muted-foreground",
              )}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-semibold shadow-sm">
                {i < step ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {/* Mobile preview toggle */}
      <div className="mb-3 flex lg:hidden">
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full rounded-xl border-[#B8860B]/40"
          onClick={() => setMobilePreviewOpen(true)}
        >
          <Eye className="mr-2 h-4 w-4" />
          Náhled stránky
        </Button>
      </div>

      <div className="grid gap-5 pb-2 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-start">
        {/* Left: settings */}
        <div className="space-y-4 rounded-2xl border bg-white p-3.5 shadow-sm sm:p-5">
          {step === 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold tracking-tight text-foreground">
                  Umístění
                </h2>
                <Button
                  type="button"
                  size="sm"
                  className="min-h-10 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
                  onClick={() => {
                    setPickMode(true);
                    setMobilePreviewOpen(true);
                  }}
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" />
                  Na stránce
                </Button>
              </div>

              <TipLink />

              <div className="space-y-2">
                {catalog.map((p) => {
                  const selected = draft.placement === p.id;
                  const ready = p.wiredInProduct !== false;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={!ready}
                      onClick={() => selectPlacement(p.id)}
                      className={cn(
                        "w-full rounded-2xl border p-3 text-left transition sm:p-3.5",
                        selected
                          ? "border-[#B8860B] bg-gradient-to-r from-[#B8860B]/15 via-[#D4AF37]/10 to-emerald-50/40 ring-2 ring-[#B8860B]/25"
                          : "border-slate-200/80 bg-gradient-to-br from-white to-slate-50/80 hover:border-[#B8860B]/45 hover:shadow-sm",
                        !ready && "cursor-not-allowed opacity-55",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={cn(
                                "text-[15px] font-semibold tracking-tight",
                                selected ? "text-[#6b4f06]" : "text-foreground",
                              )}
                            >
                              {p.shortLabel}
                            </span>
                            {selected ? (
                              <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                ✓ Vybráno
                              </span>
                            ) : null}
                            {!ready ? (
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                                Brzy
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {p.locationHint}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              <Monitor className="h-2.5 w-2.5" /> PC
                            </span>
                            <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                              <Smartphone className="h-2.5 w-2.5" /> Mobil
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                            od
                          </p>
                          <p className="text-lg font-bold tabular-nums text-[#B8860B]">
                            {formatCzk(p.pricesKc[7])}
                          </p>
                          <p className="text-[10px] text-slate-500">/ 7 dní</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {fieldErrors.placement ? (
                <p className="text-sm font-medium text-red-600">
                  {fieldErrors.placement}
                </p>
              ) : null}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">
                Kreativa
              </h2>
              {selectedItem ? (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
                  <span className="font-semibold text-[#8a6508]">
                    {selectedItem.shortLabel}
                  </span>
                  <span className="text-emerald-800/70">
                    {" · "}
                    {selectedItem.locationHint}
                  </span>
                </p>
              ) : null}
              <Field label="Název kampaně" error={fieldErrors.name}>
                <Input
                  value={draft.name}
                  onChange={(e) => patch({ name: e.target.value })}
                  placeholder="Např. Jarní pojištění"
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Nadpis" error={fieldErrors.headline}>
                <Input
                  value={draft.headline}
                  onChange={(e) => patch({ headline: e.target.value })}
                  placeholder="Krátký výstižný nadpis"
                  className="h-11 rounded-xl"
                />
              </Field>
              <Field label="Popis" error={fieldErrors.description}>
                <Textarea
                  value={draft.description}
                  onChange={(e) => patch({ description: e.target.value })}
                  placeholder="Jedna až dvě věty o nabídce"
                  className="min-h-[88px] rounded-xl"
                />
              </Field>
              <Field label="Obrázek" error={fieldErrors.image}>
                <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B8860B]/40 bg-[#B8860B]/5 text-sm font-medium text-[#8a6508]">
                  <Upload className="h-4 w-4" />
                  {uploading === "image" ? "Nahrávám…" : "Nahrát JPG / PNG / WebP"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadImage(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {draft.image ? (
                  <div className="relative mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={draft.image}
                      alt=""
                      className="max-h-36 w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white"
                      onClick={() => patch({ image: "" })}
                      aria-label="Odstranit obrázek"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 rounded-xl text-xs"
                    onClick={() => patch({ image: DEMO_IMAGE })}
                  >
                    Použít ukázkový banner
                  </Button>
                )}
              </Field>
              <Field label="Video (volitelné)">
                <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed text-sm">
                  <Upload className="h-4 w-4" />
                  {uploading === "video" ? "Nahrávám…" : "Nahrát MP4 / WebM"}
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void uploadVideo(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                {draft.videoUrl ? (
                  <div className="mt-2 flex items-center gap-2">
                    <p className="truncate text-xs text-muted-foreground">
                      {draft.videoUrl}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => patch({ videoUrl: "" })}
                    >
                      Odstranit
                    </Button>
                  </div>
                ) : null}
              </Field>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Text tlačítka" error={fieldErrors.ctaText}>
                  <Input
                    value={draft.ctaText}
                    onChange={(e) => patch({ ctaText: e.target.value })}
                    className="h-11 rounded-xl"
                  />
                </Field>
                <Field label="Cílový odkaz" error={fieldErrors.targetUrl}>
                  <Input
                    value={draft.targetUrl}
                    onChange={(e) => patch({ targetUrl: e.target.value })}
                    placeholder="https://"
                    className="h-11 rounded-xl"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold tracking-tight">
                Náhled
              </h2>
              <p className="text-xs text-slate-500">
                Vpravo vidíte skutečnou stránku NNAuto s vaší reklamou.
              </p>
              {selectedItem ? (
                <div className="rounded-xl border border-sky-100 bg-sky-50/80 px-3 py-2 text-sm">
                  <span className="font-semibold text-[#8a6508]">
                    {selectedItem.shortLabel}
                  </span>
                  <span className="text-slate-600"> · {draft.headline}</span>
                </div>
              ) : null}
              <div className="lg:hidden">{previewPanel}</div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">
                Rozpočet
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {AD_DURATION_DAYS.map((days) => {
                  const price = draft.placement
                    ? priceFor(draft.placement, days)
                    : 0;
                  const selected = draft.durationDays === days;
                  return (
                    <button
                      key={days}
                      type="button"
                      disabled={!draft.placement}
                      onClick={() =>
                        applyDuration(draft.placement, days, draft.startDate)
                      }
                      className={cn(
                        "rounded-2xl border p-2.5 text-left transition sm:p-3",
                        selected
                          ? "border-[#B8860B] bg-gradient-to-b from-[#B8860B]/20 to-[#D4AF37]/10 ring-2 ring-[#B8860B]/30"
                          : "border-slate-200 bg-white hover:border-[#B8860B]/40",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-semibold sm:text-sm",
                          selected ? "text-[#6b4f06]" : "text-slate-700",
                        )}
                      >
                        {days} dní
                      </p>
                      <p className="mt-1 text-sm font-bold tabular-nums text-[#B8860B] sm:text-lg">
                        {formatCzk(price)}
                      </p>
                    </button>
                  );
                })}
              </div>
              <Field label="Datum začátku" error={fieldErrors.dates}>
                <Input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) =>
                    applyDuration(
                      draft.placement,
                      draft.durationDays,
                      e.target.value || draft.startDate,
                    )
                  }
                  className="h-11 rounded-xl"
                />
              </Field>
              <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-[#B8860B]/10 p-4">
                <p className="text-xs font-medium text-emerald-800/80">
                  Celkem
                </p>
                <p className="text-2xl font-bold tabular-nums text-[#B8860B]">
                  {formatCzk(draft.priceKc)}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {draft.startDate} → {draft.endDate}
                </p>
              </div>
              <TipLink />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold tracking-tight">
                Shrnutí
              </h2>
              <dl className="grid gap-2 text-sm">
                <Row label="Název" value={draft.name} />
                <Row label="Umístění" value={selectedItem?.shortLabel ?? "—"} />
                <Row
                  label="Období"
                  value={`${draft.startDate} → ${draft.endDate}`}
                />
                <Row label="Cena" value={formatCzk(draft.priceKc)} />
              </dl>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">
                Odesláním souhlasíte s{" "}
                <Link
                  href={AD_ROTATION_COPY.termsPath}
                  className="font-semibold text-[#8a6508] underline decoration-[#B8860B]/40 underline-offset-2"
                >
                  obchodními podmínkami
                </Link>
                .
              </p>
              <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                Platba kartou zatím není aktivní — pro test použijte{" "}
                <span className="font-semibold">LOCAL DEMO</span>.
              </p>
            </div>
          )}

          {/* Desktop step nav — mobile uses sticky bar below */}
          <div className="hidden flex-wrap items-center justify-between gap-2 border-t pt-4 sm:flex">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl"
              disabled={step === 0 || saving}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Zpět
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                className="h-11 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
                disabled={!canNext || saving}
                onClick={goNext}
              >
                Pokračovat
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-xl"
                  disabled={saving}
                  onClick={() => void submitForApproval(false)}
                >
                  {saving ? "Ukládám…" : "Uložit"}
                </Button>
                <Button
                  type="button"
                  className="h-11 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
                  disabled={saving}
                  onClick={() => void submitForApproval(true)}
                  data-testid="button-submit-campaign"
                >
                  {saving
                    ? "Ukládám…"
                    : `LOCAL DEMO · ${formatCzk(draft.priceKc)}`}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right: sticky live site preview (desktop) */}
        <aside className="hidden min-h-[70vh] lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="flex h-[calc(100vh-8rem)] min-h-[560px] flex-col rounded-2xl border bg-white p-3 shadow-sm xl:p-4">
            {previewPanel}
          </div>
        </aside>
      </div>

      {/* Mobile sticky step actions */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200/80 bg-white/95 px-3 py-2.5 pb-[calc(0.65rem+env(safe-area-inset-bottom))] backdrop-blur-md sm:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-[5.5rem] rounded-xl"
            disabled={step === 0 || saving}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            <ChevronLeft className="mr-0.5 h-4 w-4" />
            Zpět
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={!canNext || saving}
              onClick={goNext}
            >
              Pokračovat
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 flex-1 rounded-xl bg-[#B8860B] text-white hover:bg-[#9a7209]"
              disabled={saving}
              onClick={() => void submitForApproval(true)}
              data-testid="button-submit-campaign"
            >
              {saving ? "Ukládám…" : `DEMO · ${formatCzk(draft.priceKc)}`}
            </Button>
          )}
        </div>
      </div>
      <div className="h-16 sm:hidden" aria-hidden />

      {/* Mobile full-screen preview sheet */}
      {mobilePreviewOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-white pt-[env(safe-area-inset-top)] lg:hidden">
          <div className="flex items-center justify-between border-b px-3 py-3">
            <p className="text-sm font-semibold">Náhled NNAuto</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl"
              onClick={() => setMobilePreviewOpen(false)}
            >
              Zavřít
            </Button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3 pb-[env(safe-area-inset-bottom)]">
            {previewPanel}
          </div>
        </div>
      ) : null}
    </BusinessAdsShell>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white p-3">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd
        className={cn(
          "mt-0.5 break-all font-semibold",
          label === "Cena" ? "text-lg text-[#B8860B]" : "text-foreground",
        )}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
