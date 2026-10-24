"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdsStore,
  calcCtr,
  advertiserDisplayName,
  summarizeCampaigns,
  campaignsForAdvertiser,
} from "@/lib/ads";
import {
  StatusBadge,
  formatCzk,
} from "@/pages/business/BusinessAdsShell";
import { getPlacementMeta } from "@/lib/ads/placements";
import { Building2, ChevronLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminAdvertisersTab() {
  const store = useAdsStore();
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    return store.advertisers.map((a) => {
      const camps = campaignsForAdvertiser(a.id, store);
      const stats = summarizeCampaigns(camps);
      return { advertiser: a, camps, stats };
    });
  }, [store]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(({ advertiser }) => {
      const name = advertiserDisplayName(advertiser).toLowerCase();
      return (
        name.includes(q) ||
        advertiser.email.toLowerCase().includes(q) ||
        advertiser.id.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const open = rows.find((r) => r.advertiser.id === openId) ?? null;

  if (open) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Button
          type="button"
          variant="ghost"
          className="h-10 -ml-2 rounded-xl"
          onClick={() => setOpenId(null)}
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Zpět
        </Button>
        <Card className="rounded-2xl">
          <CardHeader className="px-4 pt-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-[#B8860B]" />
              {advertiserDisplayName(open.advertiser)}
            </CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {open.advertiser.email} · {open.advertiser.status}
            </p>
          </CardHeader>
          <CardContent className="space-y-4 px-4 pb-4 sm:px-6">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              <Mini label="Kampaně" value={String(open.stats.total)} />
              <Mini label="Aktivní" value={String(open.stats.activeCount)} />
              <Mini
                label="Zobrazení"
                value={open.stats.impressions.toLocaleString("cs-CZ")}
              />
              <Mini label="Utraceno" value={formatCzk(open.stats.spend)} />
            </div>

            {/* Mobile campaign cards */}
            <ul className="space-y-2 md:hidden">
              {open.camps.map((c) => (
                <li
                  key={c.id}
                  className="rounded-xl border bg-white p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{c.name}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getPlacementMeta(c.placement)?.shortLabel}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <p className="text-muted-foreground">Zobr.</p>
                      <p className="font-semibold tabular-nums">
                        {c.impressions.toLocaleString("cs-CZ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Klik.</p>
                      <p className="font-semibold tabular-nums">{c.clicks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-semibold tabular-nums">
                        {calcCtr(c.impressions, c.clicks).toFixed(2)} %
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto rounded-md border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kampaň</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Zobr.</TableHead>
                    <TableHead>Klik.</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Utraceno</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {open.camps.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-sm">
                        {getPlacementMeta(c.placement)?.shortLabel}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={c.status} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {c.impressions.toLocaleString("cs-CZ")}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {c.clicks.toLocaleString("cs-CZ")}
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {calcCtr(c.impressions, c.clicks).toFixed(2)} %
                      </TableCell>
                      <TableCell className="tabular-nums text-sm">
                        {formatCzk(c.spend)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card className="rounded-2xl">
        <CardHeader className="space-y-3 px-4 pt-4 sm:px-6">
          <div>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Building2 className="h-5 w-5 text-[#B8860B]" />
              Reklamodavatelé
            </CardTitle>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Firmy a jejich kampaně (DEMO store).
            </p>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hledat firmu nebo e-mail…"
              className="h-10 rounded-xl pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-4 sm:px-6">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Žádní reklamodavatelé.
            </p>
          ) : (
            <>
              <ul className="space-y-2 md:hidden">
                {filtered.map(({ advertiser, stats }) => (
                  <li key={advertiser.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(advertiser.id)}
                      className="w-full rounded-xl border bg-white p-3.5 text-left active:bg-neutral-50"
                    >
                      <p className="text-sm font-semibold">
                        {advertiserDisplayName(advertiser)}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {advertiser.email}
                      </p>
                      <p className="mt-2 text-[11px] text-neutral-500">
                        {stats.total} kampaní · {stats.activeCount} aktivních ·{" "}
                        {formatCzk(stats.spend)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto rounded-md border md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Název firmy</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Kampaně</TableHead>
                      <TableHead>Aktivní</TableHead>
                      <TableHead>Utraceno</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map(({ advertiser, stats }) => (
                      <TableRow
                        key={advertiser.id}
                        className="cursor-pointer hover:bg-[#B8860B]/5"
                        onClick={() => setOpenId(advertiser.id)}
                      >
                        <TableCell className="font-medium">
                          {advertiserDisplayName(advertiser)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {advertiser.email}
                        </TableCell>
                        <TableCell className="text-sm">
                          {advertiser.status}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {stats.total}
                        </TableCell>
                        <TableCell className="tabular-nums">
                          {stats.activeCount}
                        </TableCell>
                        <TableCell className="tabular-nums text-sm">
                          {formatCzk(stats.spend)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-neutral-50/80 px-3 py-2.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
