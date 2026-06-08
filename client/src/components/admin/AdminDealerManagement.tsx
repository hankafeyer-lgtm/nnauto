import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Search,
  MoreHorizontal,
  LogIn,
  Ban,
  CheckCircle2,
  Trash2,
  Eye,
  Rss,
  KeyRound,
} from "lucide-react";

type DealerRow = {
  id: string;
  ownerId: string;
  companyName: string;
  ico: string | null;
  dic: string | null;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  region: string | null;
  isVerified: boolean;
  maxListings: number;
  plan: string;
  status: string;
  verificationStatus: string;
  xmlFeedUrl: string | null;
  xmlFeedStatus: string;
  apiKey: string | null;
  apiEnabled: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  ownerEmail: string | null;
  ownerUsername: string | null;
  ownerPhone: string | null;
  vehicleCount: number;
  activeCount: number;
};

type DealerDetail = {
  dealer: DealerRow & { description: string | null };
  stats: {
    vehicleCount: number;
    activeListings: number;
    views: number;
    contacts: number;
    leads: number;
  };
};

const PLANS = ["free", "basic", "pro", "premium", "enterprise"] as const;
const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
  enterprise: "Enterprise",
};

const VERIFY_META: Record<string, { label: string; cls: string }> = {
  none: { label: "Neověřený", cls: "bg-slate-100 text-slate-700" },
  pending: { label: "Ověřuje se", cls: "bg-amber-100 text-amber-700" },
  verified: { label: "Ověřený", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Zamítnut", cls: "bg-red-100 text-red-700" },
};

const FEED_META: Record<string, { label: string; cls: string }> = {
  none: { label: "—", cls: "bg-slate-100 text-slate-500" },
  active: { label: "🟢 Aktivní", cls: "bg-emerald-100 text-emerald-700" },
  pending: { label: "🟡 Čeká", cls: "bg-amber-100 text-amber-700" },
  error: { label: "🔴 Chyba", cls: "bg-red-100 text-red-700" },
};

export default function AdminDealerManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verifyFilter, setVerifyFilter] = useState<string>("all");
  const [minVehicles, setMinVehicles] = useState("");
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ dealers: DealerRow[] }>({
    queryKey: ["/api/admin/dealers/manage"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/dealers/manage");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const dealers = useMemo(() => data?.dealers ?? [], [data]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/admin/dealers/manage"] });
    queryClient.invalidateQueries({ queryKey: ["/api/admin/overview"] });
  };

  const patchMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      const res = await apiRequest("PATCH", `/api/admin/dealers/${id}/manage`, body);
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Dealer aktualizován" });
    },
    onError: (e: unknown) => {
      toast({ variant: "destructive", title: "Chyba", description: e instanceof Error ? e.message : "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/dealers/${id}/manage`);
      return res.json();
    },
    onSuccess: () => {
      invalidate();
      setDetailId(null);
      toast({ title: "Dealer smazán" });
    },
    onError: (e: unknown) => {
      toast({ variant: "destructive", title: "Chyba", description: e instanceof Error ? e.message : "" });
    },
  });

  const loginAsMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/dealers/${id}/login-as`);
      return res.json();
    },
    onSuccess: (payload: { token?: string; user?: unknown }) => {
      if (payload?.token) {
        try {
          localStorage.setItem("nnauto_token", payload.token);
          if (payload.user) localStorage.setItem("nnauto_user", JSON.stringify(payload.user));
        } catch {
          // ignore
        }
        window.location.href = "/dealer";
      }
    },
    onError: (e: unknown) => {
      toast({ variant: "destructive", title: "Chyba", description: e instanceof Error ? e.message : "" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = parseInt(minVehicles, 10);
    return dealers.filter((d) => {
      if (planFilter !== "all" && d.plan !== planFilter) return false;
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (verifyFilter !== "all" && d.verificationStatus !== verifyFilter) return false;
      if (Number.isFinite(min) && min > 0 && d.vehicleCount < min) return false;
      if (q) {
        const hay = `${d.companyName} ${d.email ?? ""} ${d.ownerEmail ?? ""} ${d.ico ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [dealers, search, planFilter, statusFilter, verifyFilter, minVehicles]);

  const detail = dealers.find((d) => d.id === detailId) || null;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Dealer Management
          </CardTitle>
          <CardDescription>
            Správa dealerů, tarifů, ověření a integrací. ({filtered.length} z {dealers.length})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hledat: název firmy, email, IČO…"
                className="pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger><SelectValue placeholder="Tarif" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny tarify</SelectItem>
                  {PLANS.map((p) => (
                    <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger><SelectValue placeholder="Stav" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="blocked">Zablokovaný</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verifyFilter} onValueChange={setVerifyFilter}>
                <SelectTrigger><SelectValue placeholder="Ověření" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Vše ověření</SelectItem>
                  {Object.entries(VERIFY_META).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                value={minVehicles}
                onChange={(e) => setMinVehicles(e.target.value)}
                placeholder="Min. vozidel"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-muted-foreground">Načítání…</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">Žádní dealeři neodpovídají filtru</p>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo / Firma</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>IČO</TableHead>
                    <TableHead>Tarif</TableHead>
                    <TableHead className="text-right">Vozidla</TableHead>
                    <TableHead>XML</TableHead>
                    <TableHead>API</TableHead>
                    <TableHead>Stav</TableHead>
                    <TableHead>Registrace</TableHead>
                    <TableHead className="text-right">Akce</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {d.logoUrl ? (
                            <img src={d.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-medium">{d.companyName}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{d.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate" title={d.email ?? d.ownerEmail ?? ""}>
                        {d.email || d.ownerEmail || "—"}
                      </TableCell>
                      <TableCell>{d.ico || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{PLAN_LABELS[d.plan] ?? d.plan}</Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {d.activeCount}/{d.vehicleCount}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${FEED_META[d.xmlFeedStatus]?.cls ?? FEED_META.none.cls}`}>
                          {FEED_META[d.xmlFeedStatus]?.label ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {d.apiEnabled ? (
                          <Badge className="bg-emerald-600">Aktivní</Badge>
                        ) : (
                          <Badge variant="secondary">Vypnuto</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {d.status === "blocked" ? (
                          <Badge variant="destructive">Blokován</Badge>
                        ) : (
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${VERIFY_META[d.verificationStatus]?.cls ?? VERIFY_META.none.cls}`}>
                            {VERIFY_META[d.verificationStatus]?.label ?? "Neověřený"}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {d.createdAt ? format(new Date(d.createdAt), "dd.MM.yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="outline" size="sm" onClick={() => setDetailId(d.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => loginAsMutation.mutate(d.id)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Přihlásit se jako dealer
                              </DropdownMenuItem>
                              {d.status === "blocked" ? (
                                <DropdownMenuItem onClick={() => patchMutation.mutate({ id: d.id, body: { status: "active" } })}>
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Aktivovat
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => patchMutation.mutate({ id: d.id, body: { status: "blocked" } })}>
                                  <Ban className="mr-2 h-4 w-4" />
                                  Zablokovat
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  if (window.confirm(`Smazat dealera ${d.companyName}?`)) {
                                    deleteMutation.mutate(d.id);
                                  }
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Smazat
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailId} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-h-[90vh] w-[calc(100vw-1.5rem)] overflow-y-auto sm:max-w-2xl">
          {detail ? (
            <DealerDetailDialog
              row={detail}
              onPatch={(body) => patchMutation.mutate({ id: detail.id, body })}
              onLoginAs={() => loginAsMutation.mutate(detail.id)}
              onDelete={() => {
                if (window.confirm(`Smazat dealera ${detail.companyName}?`)) {
                  deleteMutation.mutate(detail.id);
                }
              }}
              busy={patchMutation.isPending}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DealerDetailDialog({
  row,
  onPatch,
  onLoginAs,
  onDelete,
  busy,
}: {
  row: DealerRow;
  onPatch: (body: Record<string, unknown>) => void;
  onLoginAs: () => void;
  onDelete: () => void;
  busy: boolean;
}) {
  const { data } = useQuery<DealerDetail>({
    queryKey: [`/api/admin/dealers/${row.id}/detail`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/dealers/${row.id}/detail`);
      return res.json();
    },
  });
  const stats = data?.stats;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {row.logoUrl ? (
            <img src={row.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <Building2 className="h-6 w-6" />
          )}
          {row.companyName}
        </DialogTitle>
        <DialogDescription>
          Registrace: {row.createdAt ? format(new Date(row.createdAt), "dd.MM.yyyy") : "—"} ·{" "}
          ID: <span className="font-mono text-xs">{row.id.slice(0, 8)}</span>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        <section className="grid grid-cols-2 gap-3 text-sm">
          <Field label="Email" value={row.email || row.ownerEmail} />
          <Field label="Telefon" value={row.phone || row.ownerPhone} />
          <Field label="IČO" value={row.ico} />
          <Field label="DIČ" value={row.dic} />
          <Field label="Web" value={row.website} />
          <Field label="Adresa" value={row.address} />
        </section>

        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Statistika</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            <Stat label="Vozidla" value={stats?.vehicleCount ?? row.vehicleCount} />
            <Stat label="Aktivní" value={stats?.activeListings ?? row.activeCount} />
            <Stat label="Zobrazení" value={stats?.views ?? 0} />
            <Stat label="Kontakty" value={stats?.contacts ?? 0} />
            <Stat label="Leady" value={stats?.leads ?? 0} />
          </div>
        </section>

        <section>
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Integrace</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-xl border p-2">
              <Rss className="h-4 w-4 text-muted-foreground" />
              <span>XML Feed:</span>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${FEED_META[row.xmlFeedStatus]?.cls ?? FEED_META.none.cls}`}>
                {FEED_META[row.xmlFeedStatus]?.label ?? "—"}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border p-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              <span>API:</span>
              <Badge className="ml-auto" variant={row.apiEnabled ? "default" : "secondary"}>
                {row.apiEnabled ? "Aktivní" : "Vypnuto"}
              </Badge>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Tarif</p>
            <Select value={row.plan} onValueChange={(v) => onPatch({ plan: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p} value={p}>{PLAN_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Ověření</p>
            <Select value={row.verificationStatus} onValueChange={(v) => onPatch({ verificationStatus: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(VERIFY_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <section className="flex flex-wrap gap-2 border-t pt-4">
          <Button variant="outline" onClick={onLoginAs}>
            <LogIn className="mr-2 h-4 w-4" />
            Přihlásit se jako dealer
          </Button>
          {row.status === "blocked" ? (
            <Button variant="outline" disabled={busy} onClick={() => onPatch({ status: "active" })}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aktivovat
            </Button>
          ) : (
            <Button variant="outline" disabled={busy} onClick={() => onPatch({ status: "blocked" })}>
              <Ban className="mr-2 h-4 w-4" />
              Zablokovat
            </Button>
          )}
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => {
              const raw = window.prompt("Maximální počet inzerátů:", String(row.maxListings));
              if (raw === null) return;
              const n = parseInt(raw, 10);
              if (Number.isFinite(n) && n > 0) onPatch({ maxListings: n });
            }}
          >
            Limit: {row.maxListings}
          </Button>
          <Button variant="destructive" className="ml-auto" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Smazat
          </Button>
        </section>
      </div>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="truncate">{value || "—"}</p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border p-2 text-center">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
