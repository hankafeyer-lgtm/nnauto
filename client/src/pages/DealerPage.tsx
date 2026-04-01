import { useState, useRef, useCallback, useEffect, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import type { Listing } from "@shared/schema";

const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/lib/navigation";
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
} from "lucide-react";
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
            <TabsList className="mb-6 grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
              <TabsTrigger value="dashboard" className="gap-2">
                <BarChart3 className="h-4 w-4 hidden sm:block" />
                {t("dealer.dashboard")}
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
