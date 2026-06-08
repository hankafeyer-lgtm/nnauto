import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  ShieldCheck,
  Rss,
  KeyRound,
  Inbox,
  UserPlus,
  AlertTriangle,
  Ban,
  Clock,
} from "lucide-react";

type AdminOverview = {
  totalDealers: number;
  verifiedDealers: number;
  pendingVerifications: number;
  activeXmlFeeds: number;
  activeApiKeys: number;
  newDealers: number;
  syncErrors: number;
  blockedDealers: number;
  newLeads: number;
};

type StatCard = {
  key: keyof AdminOverview;
  label: string;
  Icon: typeof Building2;
  tone: "default" | "good" | "warn" | "danger";
};

const CARDS: StatCard[] = [
  { key: "totalDealers", label: "Celkem dealerů", Icon: Building2, tone: "default" },
  { key: "verifiedDealers", label: "Ověření dealeři", Icon: ShieldCheck, tone: "good" },
  { key: "activeXmlFeeds", label: "Aktivní XML feedy", Icon: Rss, tone: "default" },
  { key: "activeApiKeys", label: "Aktivní API klíče", Icon: KeyRound, tone: "default" },
  { key: "newLeads", label: "Nové leady (7 dní)", Icon: Inbox, tone: "default" },
  { key: "newDealers", label: "Nové registrace dealerů (7 dní)", Icon: UserPlus, tone: "good" },
  { key: "syncErrors", label: "Chyby synchronizace", Icon: AlertTriangle, tone: "danger" },
  { key: "pendingVerifications", label: "Čeká na ověření", Icon: Clock, tone: "warn" },
  { key: "blockedDealers", label: "Zablokovaní dealeři", Icon: Ban, tone: "warn" },
];

const TONE_CLASS: Record<StatCard["tone"], string> = {
  default: "bg-slate-100 text-slate-700",
  good: "bg-emerald-100 text-emerald-700",
  warn: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export default function AdminDashboardTab() {
  const { data, isLoading } = useQuery<AdminOverview>({
    queryKey: ["/api/admin/overview"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/overview");
      return res.json();
    },
    refetchInterval: 15000,
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-black tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Přehled dealerů, integrací a synchronizací v reálném čase.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        {CARDS.map(({ key, label, Icon, tone }) => (
          <Card key={key} className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${TONE_CLASS[tone]}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-black tabular-nums">
                  {isLoading ? "—" : (data?.[key] ?? 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
