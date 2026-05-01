import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";

export type BasicVinCheckResponse = {
  validVin: boolean;
  decoded: {
    make: string | null;
    model: string | null;
    year: number | null;
    bodyClass: string | null;
    fuelType: string | null;
  } | null;
  nnautoCheck: {
    score: number;
    risk: "low" | "medium" | "high";
    warnings: string[];
  };
  cebiaUpsell: {
    text: string;
    cta: string;
  };
};

type Props = {
  vin: string | null | undefined;
  brand?: string | null;
  model?: string | null;
  year?: number | null;
  mileage?: number | null;
  price?: number | null;
  onCebiaClick?: () => void;
  cebiaDisabled?: boolean;
};

const RISK_LABEL: Record<BasicVinCheckResponse["nnautoCheck"]["risk"], string> = {
  low: "nízké riziko",
  medium: "střední riziko",
  high: "vysoké riziko",
};

const RISK_CLASS: Record<BasicVinCheckResponse["nnautoCheck"]["risk"], string> = {
  low: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-300/40",
  medium:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-300/40",
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-300/40",
};

export default function BasicVinCheck({
  vin,
  brand,
  model,
  year,
  mileage,
  price,
  onCebiaClick,
  cebiaDisabled,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BasicVinCheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cleanVin = useMemo(() => (vin || "").trim().toUpperCase(), [vin]);

  useEffect(() => {
    if (!cleanVin) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setErrorMsg(null);
    (async () => {
      try {
        const res = await apiRequest("POST", "/api/basic-vin-check", {
          vin: cleanVin,
          make: brand ?? null,
          model: model ?? null,
          year: year ?? null,
          mileage: mileage ?? null,
          price: price ?? null,
        });
        const json = (await res.json()) as BasicVinCheckResponse;
        if (cancelled) return;
        setData(json);
      } catch (e) {
        if (!cancelled) {
          setErrorMsg(e instanceof Error ? e.message : "Network error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cleanVin, brand, model, year, mileage, price]);

  if (!cleanVin) return null;

  return (
    <div
      className="rounded-2xl border border-emerald-600/30 bg-emerald-50/40 dark:bg-emerald-950/10 p-4 space-y-3"
      data-testid="basic-vin-check"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-white/70 dark:bg-black/20 border border-emerald-600/20">
          <Shield className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-black dark:text-white">
            Základní kontrola VIN
          </p>
          <p className="text-xs text-muted-foreground">
            Rychlá kontrola VIN proti veřejné databázi NHTSA
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Kontroluji VIN…
        </div>
      )}

      {errorMsg && !loading && (
        <p className="text-sm text-destructive flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          Nelze provést kontrolu: {errorMsg}
        </p>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">VIN</p>
              <p className="font-medium">
                {data.validVin ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Platný
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-destructive">
                    <AlertTriangle className="w-4 h-4" /> Neplatný
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Skóre</p>
              <p className="font-semibold text-base flex items-center gap-2">
                <span>{data.nnautoCheck.score} / 10</span>
                <Badge
                  variant="outline"
                  className={`border ${RISK_CLASS[data.nnautoCheck.risk]}`}
                >
                  {RISK_LABEL[data.nnautoCheck.risk]}
                </Badge>
              </p>
            </div>
            {data.decoded?.make ? (
              <div>
                <p className="text-xs text-muted-foreground">Značka (z VIN)</p>
                <p className="font-medium">{data.decoded.make}</p>
              </div>
            ) : null}
            {data.decoded?.model ? (
              <div>
                <p className="text-xs text-muted-foreground">Model (z VIN)</p>
                <p className="font-medium">{data.decoded.model}</p>
              </div>
            ) : null}
            {data.decoded?.year ? (
              <div>
                <p className="text-xs text-muted-foreground">Rok (z VIN)</p>
                <p className="font-medium">{data.decoded.year}</p>
              </div>
            ) : null}
            {data.decoded?.bodyClass ? (
              <div>
                <p className="text-xs text-muted-foreground">Karoserie</p>
                <p className="font-medium">{data.decoded.bodyClass}</p>
              </div>
            ) : null}
            {data.decoded?.fuelType ? (
              <div>
                <p className="text-xs text-muted-foreground">Palivo</p>
                <p className="font-medium">{data.decoded.fuelType}</p>
              </div>
            ) : null}
          </div>

          {data.nnautoCheck.warnings.length > 0 && (
            <div
              className="rounded-lg border border-amber-300/50 bg-amber-50/60 dark:bg-amber-950/20 p-3 space-y-1.5"
              data-testid="basic-vin-check-warnings"
            >
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                Upozornění
              </p>
              <ul className="list-disc list-inside text-xs text-amber-900 dark:text-amber-100 space-y-1">
                {data.nnautoCheck.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          {data.nnautoCheck.warnings.length === 0 && data.validVin && (
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Žádné nesrovnalosti ve veřejných datech jsme nenalezli.
            </p>
          )}

          <p className="text-xs text-muted-foreground">{data.cebiaUpsell.text}</p>

          <Button
            variant="outline"
            className="w-full border-[#B8860B] text-[#B8860B] hover:bg-[#B8860B]/10"
            onClick={onCebiaClick}
            disabled={!onCebiaClick || cebiaDisabled}
            data-testid="basic-vin-check-cebia-cta"
          >
            {data.cebiaUpsell.cta}
          </Button>

          <p
            className="text-[11px] leading-snug text-muted-foreground/80 pt-1"
            data-testid="basic-vin-check-disclaimer"
          >
            Data pocházejí z veřejné databáze NHTSA (USA) a z interní analýzy.
            Nejedná se o kompletní historii vozidla.
          </p>
        </>
      )}
    </div>
  );
}
