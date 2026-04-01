import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import type { Listing } from "@shared/schema";

const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  Building2,
  Upload,
  Eye,
  Phone,
  MessageCircle,
  TrendingUp,
  Car,
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Settings,
  ArrowUpRight,
  Pencil,
  Trash2,
  Rocket,
  Crown,
  Star,
  Zap,
  Sparkles,
  Wallet,
  ChevronRight,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DealerStats = {
  totalListings: number;
  activeListings: number;
  totalViews: number;
  totalContacts: number;
  totalWhatsapp: number;
  conversionRate: string;
  last30Days: { views: number; contacts: number; whatsapp: number };
  perListing: Array<{
    listing_id: string;
    title: string;
    brand: string;
    model: string;
    price: string;
    photo: string | null;
    views: number;
    contacts: number;
    whatsapp: number;
  }>;
};

type Dealer = {
  id: string;
  companyName: string;
  ico?: string;
  dic?: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  region?: string;
  isVerified: boolean;
  maxListings: number;
};

type BulkImportJob = {
  id: string;
  status: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{ row: number; error: string }> | null;
  fileName: string;
  createdAt: string;
};

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  className,
  onClick,
}: {
  icon: any;
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`${className || ""} ${onClick ? "cursor-pointer hover:shadow-md hover:border-amber-300 transition-all" : ""}`}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-emerald-600 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center">
            <Icon className="h-6 w-6 text-amber-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardTab({ stats, dealer, t }: { stats: DealerStats; dealer: Dealer; t: (key: string) => string }) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      toast({ title: t("dealer.listingDeleted") });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", variant: "destructive" });
    },
  });

  const handleEdit = useCallback(async (listingId: string) => {
    try {
      const res = await apiRequest("GET", `/api/listings/${listingId}`);
      const data = await res.json();
      setEditingListing(data);
      setEditDialogOpen(true);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Building2 className="h-5 w-5 text-amber-700" />
        <h2 className="text-lg font-semibold">{dealer.companyName}</h2>
        {dealer.isVerified ? (
          <Badge variant="default" className="bg-emerald-600">
            <Shield className="h-3 w-3 mr-1" />
            {t("dealer.verified")}
          </Badge>
        ) : (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            {t("dealer.notVerified")}
          </Badge>
        )}
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Car}
          label={t("dealer.totalListings")}
          value={stats.totalListings}
          onClick={() => navigate(`/listings?userId=${dealer.ownerId}`)}
        />
        <StatCard
          icon={Eye}
          label={t("dealer.totalViews")}
          value={stats.totalViews.toLocaleString()}
        />
        <StatCard
          icon={Phone}
          label={t("dealer.totalContacts")}
          value={stats.totalContacts}
        />
        <StatCard
          icon={TrendingUp}
          label={t("dealer.conversionRate")}
          value={`${stats.conversionRate}%`}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t("dealer.last30Days")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-700">{stats.last30Days.views}</p>
              <p className="text-sm text-muted-foreground">{t("dealer.views")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-600">{stats.last30Days.contacts}</p>
              <p className="text-sm text-muted-foreground">{t("dealer.contacts")}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.last30Days.whatsapp}</p>
              <p className="text-sm text-muted-foreground">{t("dealer.whatsapp")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {stats.perListing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("dealer.perListing")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.perListing.map((item) => (
                <div
                  key={item.listing_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(`/listing/${item.listing_id}`)}
                >
                  <div className="h-12 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.photo ? (
                      <img
                        src={`/img/${item.photo}?w=128&h=96&fit=cover`}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.brand} {item.model}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {item.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.contacts}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {item.whatsapp}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-amber-700 hover:text-amber-900 hover:bg-amber-50"
                      onClick={() => handleEdit(item.listing_id)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(item.listing_id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dealer.deleteListingTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("dealer.deleteListingDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("dealer.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {t("dealer.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingListing && (
        <Suspense fallback={null}>
          <EditListingDialog
            open={editDialogOpen}
            onOpenChange={(open: boolean) => {
              setEditDialogOpen(open);
              if (!open) {
                setEditingListing(null);
                queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
              }
            }}
            listing={editingListing}
          />
        </Suspense>
      )}
    </div>
  );
}

function BulkImportTab({ t }: { t: (key: string) => string }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const importMutation = useMutation({
    mutationFn: async (data: { listings: any[]; fileName: string }) => {
      const res = await apiRequest("POST", "/api/dealer/bulk-import", data);
      return res.json();
    },
    onSuccess: (data) => {
      setActiveJobId(data.job.id);
      toast({ title: t("dealer.importProcessing") });
    },
    onError: (err: any) => {
      toast({ title: t("dealer.importFailed"), description: err.message, variant: "destructive" });
    },
  });

  const { data: jobData } = useQuery({
    queryKey: ["/api/dealer/bulk-import", activeJobId],
    queryFn: async () => {
      if (!activeJobId) return null;
      const res = await apiRequest("GET", `/api/dealer/bulk-import/${activeJobId}`);
      return res.json();
    },
    enabled: !!activeJobId,
    refetchInterval: activeJobId ? 2000 : false,
  });

  useEffect(() => {
    if (jobData?.job?.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
    }
  }, [jobData?.job?.status]);

  const parseCsv = useCallback((text: string): any[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, any> = {};
      headers.forEach((h, i) => {
        const val = values[i] || "";
        if (["fuelType", "transmission", "driveType", "equipment", "extras"].includes(h)) {
          obj[h] = val ? val.split(";").map((s: string) => s.trim()) : [];
        } else if (["year", "mileage", "power", "doors", "seats", "owners", "airbags"].includes(h)) {
          obj[h] = val ? parseInt(val, 10) : undefined;
        } else if (["hasServiceBook", "vatDeductible", "isImported"].includes(h)) {
          obj[h] = val === "true" || val === "1";
        } else {
          obj[h] = val || undefined;
        }
      });
      return obj;
    });
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const data = parseCsv(text);
        setParsedData(data);
      };
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (!file || !file.name.endsWith(".csv")) return;
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        const data = parseCsv(text);
        setParsedData(data);
      };
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const activeJob = jobData?.job as BulkImportJob | undefined;
  const jobProgress = activeJob
    ? Math.round((activeJob.processedRows / Math.max(activeJob.totalRows, 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            {t("dealer.importTitle")}
          </CardTitle>
          <CardDescription>{t("dealer.importDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t("dealer.importDragDrop")}</p>
            {fileName && (
              <p className="mt-2 text-sm font-medium text-amber-700">{fileName}</p>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {parsedData && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="text-sm">
                {t("dealer.importTotal")}: <strong>{parsedData.length}</strong>
              </span>
              <Button
                onClick={() =>
                  importMutation.mutate({ listings: parsedData, fileName })
                }
                disabled={importMutation.isPending || parsedData.length === 0}
                className="bg-amber-700 hover:bg-amber-800"
              >
                {importMutation.isPending
                  ? t("dealer.importProcessing")
                  : t("dealer.importStartImport")}
              </Button>
            </div>
          )}

          {activeJob && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{activeJob.status === "completed" ? "✓" : "⏳"} {activeJob.fileName}</span>
                  <span>{activeJob.processedRows}/{activeJob.totalRows}</span>
                </div>
                <Progress value={jobProgress} className="h-2" />
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {activeJob.successRows} {t("dealer.importSuccess")}
                  </span>
                  {activeJob.failedRows > 0 && (
                    <span className="flex items-center gap-1 text-red-600">
                      <XCircle className="h-3.5 w-3.5" />
                      {activeJob.failedRows} {t("dealer.importFailed")}
                    </span>
                  )}
                </div>
                {activeJob.errors && activeJob.errors.length > 0 && (
                  <div className="mt-2 max-h-40 overflow-y-auto text-xs space-y-1">
                    {activeJob.errors.map((err, i) => (
                      <div key={i} className="p-2 bg-red-50 rounded text-red-700">
                        Row {err.row}: {err.error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm font-medium mb-2">{t("dealer.importCsvFormat")}:</p>
              <code className="block text-xs bg-background p-3 rounded-md overflow-x-auto whitespace-pre">
{`title,brand,model,year,mileage,price,fuelType,transmission,bodyType,color,driveType,engineVolume,power,condition,vehicleType,region,phone,description
"Škoda Octavia 2.0 TDI","Škoda","Octavia",2021,45000,"450000","diesel","automatic","sedan","white","fwd","2.0",150,"used","osobni-auta","Praha","775123456","Popis..."`}
              </code>
            </CardContent>
          </Card>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground mb-3">{t("dealer.addManually")}</p>
            <Button variant="outline" asChild>
              <a href="/add-listing">
                <Plus className="h-4 w-4 mr-2" />
                {t("header.addListing")}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Promotion packages ────────────────────────────────────────────────────────

const PROMO_PACKAGES = [
  {
    id: "top" as const,
    icon: ArrowUpRight,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
    boost: "+40%",
  },
  {
    id: "vip" as const,
    icon: Crown,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200 hover:border-amber-400",
    badge: "bg-amber-100 text-amber-700",
    boost: "+80%",
  },
];

function PromotionTab({
  stats,
  t,
}: {
  stats: DealerStats;
  t: (key: string) => string;
}) {
  const { toast } = useToast();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Record<string, "14" | "30">>({});
  const [autoBudget, setAutoBudget] = useState(500);
  const [autoBudgetEnabled, setAutoBudgetEnabled] = useState(false);

  const handlePromote = useCallback(
    (listingId: string, pkg: string) => {
      toast({
        title: t("dealer.promo.activating"),
        description: `${pkg.toUpperCase()} — ${listingId.slice(0, 8)}...`,
      });
      setSelectedListing(null);
      setSelectedPackage(null);
    },
    [t, toast],
  );

  return (
    <div className="space-y-6">
      {/* Recommendation banner */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Crown className="h-7 w-7 text-amber-600" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-semibold text-lg">
                {t("dealer.promo.recommendTitle")}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {t("dealer.promo.recommendDescription")}
              </p>
            </div>
            <Button className="bg-amber-700 hover:bg-amber-800 px-6 flex-shrink-0">
              <Crown className="h-4 w-4 mr-2" />
              {t("dealer.promo.activateVip")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Promotion packages */}
      <div className="grid gap-4 md:grid-cols-2">
        {PROMO_PACKAGES.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <Card
              key={pkg.id}
              className={`cursor-pointer transition-all duration-200 ${pkg.border} ${
                selectedPackage === pkg.id ? "ring-2 ring-offset-2 ring-amber-400 shadow-lg" : ""
              }`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl ${pkg.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${pkg.color}`} />
                  </div>
                  <Badge className={pkg.badge}>{pkg.boost}</Badge>
                </div>
                <CardTitle className="text-lg mt-3">
                  {t(`dealer.promo.${pkg.id}.title`)}
                </CardTitle>
                <CardDescription>
                  {t(`dealer.promo.${pkg.id}.description`)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                      selectedDuration[pkg.id] === "14"
                        ? `${pkg.bg} border-2 ${pkg.border.split(" ")[0]} shadow-sm`
                        : "bg-muted/50 border-2 border-transparent hover:border-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDuration((prev) => ({ ...prev, [pkg.id]: "14" }));
                      setSelectedPackage(pkg.id);
                      toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} — ${t("dealer.promo.per14days")}` });
                    }}
                  >
                    <span className="text-xl font-bold">{t(`dealer.promo.${pkg.id}.price14`)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dealer.promo.per14days")}</p>
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-lg text-center transition-all cursor-pointer ${
                      !selectedDuration[pkg.id] || selectedDuration[pkg.id] === "30"
                        ? `${pkg.bg} border-2 ${pkg.border.split(" ")[0]} shadow-sm`
                        : "bg-muted/50 border-2 border-transparent hover:border-gray-200"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDuration((prev) => ({ ...prev, [pkg.id]: "30" }));
                      setSelectedPackage(pkg.id);
                      toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} — ${t("dealer.promo.per30days")}` });
                    }}
                  >
                    <span className="text-xl font-bold">{t(`dealer.promo.${pkg.id}.price30`)}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("dealer.promo.per30days")}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px]">{t("dealer.promo.bestValue")}</Badge>
                  </button>
                </div>
                <ul className="space-y-2 text-sm mb-4">
                  {[1, 2, 3].map((i) => {
                    const key = `dealer.promo.${pkg.id}.feature${i}`;
                    const text = t(key);
                    if (text === key) return null;
                    return (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 flex-shrink-0 ${pkg.color}`} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
                <Button
                  className={`w-full ${
                    selectedPackage === pkg.id
                      ? "bg-amber-700 hover:bg-amber-800"
                      : pkg.id === "vip"
                        ? "bg-amber-600 hover:bg-amber-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPackage(pkg.id);
                    toast({ title: `${t(`dealer.promo.${pkg.id}.title`)} ${t("dealer.promo.selected")}` });
                  }}
                >
                  {selectedPackage === pkg.id ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {t("dealer.promo.selected")}
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-2" />
                      {t("dealer.promo.select")}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per-listing promotion */}
      {stats.perListing.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              {t("dealer.promo.boostListings")}
            </CardTitle>
            <CardDescription>{t("dealer.promo.boostDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.perListing.map((item) => (
                <div
                  key={item.listing_id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    {item.photo ? (
                      <img
                        src={`/img/${item.photo}?w=112&h=80&fit=cover`}
                        alt={`${item.brand} ${item.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.brand} {item.model}
                    </p>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {item.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {item.contacts}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedListing === item.listing_id ? "default" : "outline"}
                    className={selectedListing === item.listing_id ? "bg-amber-700 hover:bg-amber-800" : ""}
                    onClick={() => {
                      if (selectedListing === item.listing_id) {
                        if (selectedPackage) {
                          handlePromote(item.listing_id, selectedPackage);
                        } else {
                          toast({ title: t("dealer.promo.selectPackageFirst") });
                        }
                      } else {
                        setSelectedListing(item.listing_id);
                      }
                    }}
                  >
                    {selectedListing === item.listing_id ? (
                      <>
                        <Zap className="h-3.5 w-3.5 mr-1" />
                        {t("dealer.promo.confirm")}
                      </>
                    ) : (
                      <>
                        <Rocket className="h-3.5 w-3.5 mr-1" />
                        {t("dealer.promo.boost")}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-budget */}
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <CardTitle className="text-base">{t("dealer.promo.autoBudgetTitle")}</CardTitle>
                <CardDescription>{t("dealer.promo.autoBudgetDescription")}</CardDescription>
              </div>
            </div>
            <Button
              variant={autoBudgetEnabled ? "default" : "outline"}
              size="sm"
              className={autoBudgetEnabled ? "bg-amber-700 hover:bg-amber-800" : ""}
              onClick={() => {
                setAutoBudgetEnabled(!autoBudgetEnabled);
                toast({
                  title: autoBudgetEnabled
                    ? t("dealer.promo.autoBudgetDisabled")
                    : t("dealer.promo.autoBudgetEnabled"),
                });
              }}
            >
              {autoBudgetEnabled ? t("dealer.promo.active") : t("dealer.promo.activate")}
            </Button>
          </div>
        </CardHeader>
        {autoBudgetEnabled && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{t("dealer.promo.monthlyBudget")}</Label>
                <span className="text-xl font-bold text-amber-700">{autoBudget} Kč</span>
              </div>
              <Slider
                value={[autoBudget]}
                onValueChange={(v) => setAutoBudget(v[0])}
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>100 Kč</span>
                <span>5 000 Kč</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-amber-700">
                  ~{Math.round(autoBudget / 15)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedBoosts")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-emerald-600">
                  +{Math.round(autoBudget * 0.8)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedViews")}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-blue-600">
                  +{Math.round(autoBudget * 0.04)}
                </p>
                <p className="text-xs text-muted-foreground">{t("dealer.promo.estimatedContacts")}</p>
              </div>
            </div>
            <Button className="w-full bg-amber-700 hover:bg-amber-800">
              <Wallet className="h-4 w-4 mr-2" />
              {t("dealer.promo.saveBudget")}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function DealerSettingsTab({ dealer, t }: { dealer: Dealer; t: (key: string) => string }) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    companyName: dealer.companyName || "",
    ico: dealer.ico || "",
    dic: dealer.dic || "",
    description: dealer.description || "",
    website: dealer.website || "",
    phone: dealer.phone || "",
    email: dealer.email || "",
    address: dealer.address || "",
    region: dealer.region || "",
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("PATCH", "/api/dealer/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/stats"] });
      toast({ title: t("dealer.profileUpdated") });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t("dealer.settings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("dealer.companyName")} *</Label>
            <Input
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dealer.ico")}</Label>
            <Input
              value={form.ico}
              onChange={(e) => setForm((f) => ({ ...f, ico: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dealer.dic")}</Label>
            <Input
              value={form.dic}
              onChange={(e) => setForm((f) => ({ ...f, dic: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dealer.website")}</Label>
            <Input
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              placeholder="https://"
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dealer.phone")}</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("dealer.email")}</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("dealer.address")}</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("dealer.description")}</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            {t("dealer.listingsUsed")}: {dealer.maxListings}
          </div>
          <Button
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
            className="bg-amber-700 hover:bg-amber-800"
          >
            {updateMutation.isPending ? "..." : t("dealer.submit")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealerPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const [, navigate] = useLocation();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dealer/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/stats");
      return res.json();
    },
    enabled: !!user?.isDealer,
  });

  if (!authLoading && !isAuthenticated) {
    navigate("/");
    return null;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user?.isDealer) {
    return <DealerRegistrationPage />;
  }

  const stats = statsData?.stats as DealerStats | undefined;
  const dealer = statsData?.dealer as Dealer | undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("dealer.cabinet")} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="h-6 w-6 text-amber-700" />
          <h1 className="text-2xl font-bold">{t("dealer.cabinet")}</h1>
        </div>

        {statsLoading || !stats || !dealer ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
          </div>
        ) : (
          <Tabs defaultValue="dashboard">
            <TabsList className="mb-6 grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4 hidden sm:block" />
                {t("dealer.dashboard")}
              </TabsTrigger>
              <TabsTrigger value="promotion" className="gap-2">
                <Rocket className="h-4 w-4 hidden sm:block" />
                {t("dealer.promo.tab")}
              </TabsTrigger>
              <TabsTrigger value="import" className="gap-2">
                <Upload className="h-4 w-4 hidden sm:block" />
                {t("dealer.bulkImport")}
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4 hidden sm:block" />
                {t("dealer.settings")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardTab stats={stats} dealer={dealer} t={t} />
            </TabsContent>
            <TabsContent value="promotion">
              <PromotionTab stats={stats} t={t} />
            </TabsContent>
            <TabsContent value="import">
              <BulkImportTab t={t} />
            </TabsContent>
            <TabsContent value="settings">
              <DealerSettingsTab dealer={dealer} t={t} />
            </TabsContent>
          </Tabs>
        )}
      </main>
      <Footer />
    </div>
  );
}

function DealerRegistrationPage() {
  const { user } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    companyName: "",
    ico: "",
    dic: "",
    description: "",
    website: "",
    phone: user?.phone || "",
    email: user?.email || "",
    address: "",
    region: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/dealer/register", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({ title: t("dealer.registrationSuccess") });
      window.location.reload();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("dealer.registerTitle")} noindex />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-amber-50 flex items-center justify-center mb-2">
              <Building2 className="h-7 w-7 text-amber-700" />
            </div>
            <CardTitle className="text-xl">{t("dealer.registerTitle")}</CardTitle>
            <CardDescription>{t("dealer.registerDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.companyName")} *</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                  placeholder="AutoMax Praha s.r.o."
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.ico")}</Label>
                <Input
                  value={form.ico}
                  onChange={(e) => setForm((f) => ({ ...f, ico: e.target.value }))}
                  placeholder="12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.dic")}</Label>
                <Input
                  value={form.dic}
                  onChange={(e) => setForm((f) => ({ ...f, dic: e.target.value }))}
                  placeholder="CZ12345678"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.phone")}</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.email")}</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.website")}</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("dealer.region")}</Label>
                <Input
                  value={form.region}
                  onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.address")}</Label>
                <Input
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>{t("dealer.description")}</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={4}
                  placeholder="..."
                />
              </div>
            </div>

            <Button
              onClick={() => registerMutation.mutate(form)}
              disabled={registerMutation.isPending || !form.companyName}
              className="w-full bg-amber-700 hover:bg-amber-800 text-lg py-6"
            >
              <Building2 className="h-5 w-5 mr-2" />
              {registerMutation.isPending ? "..." : t("dealer.register")}
            </Button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
