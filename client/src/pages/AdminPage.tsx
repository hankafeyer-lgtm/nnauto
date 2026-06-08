// import { useState } from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useTranslation } from "@/lib/translations";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { useLocation } from "@/lib/navigation";
// import { Shield, Users, Car, Trash2, CreditCard, Star } from "lucide-react";
// import { format } from "date-fns";
// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import type { User, Listing, EnrichedPayment } from "@shared/schema";

// export default function AdminPage() {
//   const { user, isAuthenticated, isLoading: authLoading } = useAuth();
//   const t = useTranslation();
//   const { toast } = useToast();
//   const [, navigate] = useLocation();
//   const [activeTab, setActiveTab] = useState("users");

//   if (!isAuthenticated && !authLoading) {
//     navigate("/");
//     return null;
//   }

//   if (!user?.isAdmin) {
//     navigate("/");
//     return null;
//   }

//   const { data: usersData, isLoading: usersLoading, error: usersError } = useQuery<Omit<User, "password">[]>({
//     queryKey: ["/api/admin/users"],
//     enabled: isAuthenticated && user?.isAdmin,
//   });

//   const { data: listingsData, isLoading: listingsLoading, error: listingsError } = useQuery<Listing[]>({
//     queryKey: ["/api/admin/listings"],
//     enabled: isAuthenticated && user?.isAdmin,
//   });

//   const { data: paymentsData, isLoading: paymentsLoading, error: paymentsError } = useQuery<EnrichedPayment[]>({
//     queryKey: ["/api/admin/payments"],
//     enabled: isAuthenticated && user?.isAdmin,
//   });

//   const users = usersData || [];
//   const listings = listingsData || [];
//   const payments = paymentsData || [];

//   if ((usersError || listingsError || paymentsError) && !authLoading) {
//     navigate("/");
//     return null;
//   }

//   const deleteUserMutation = useMutation({
//     mutationFn: async (userId: string) => {
//       const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
//       toast({
//         title: t("admin.userDeleted"),
//         description: t("admin.userDeletedDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("admin.error"),
//         description: error.message,
//       });
//     },
//   });

//   const deleteListingMutation = useMutation({
//     mutationFn: async (listingId: string) => {
//       const res = await apiRequest("DELETE", `/api/admin/listings/${listingId}`);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
//       toast({
//         title: t("admin.listingDeleted"),
//         description: t("admin.listingDeletedDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("admin.error"),
//         description: error.message,
//       });
//     },
//   });

//   const toggleTopMutation = useMutation({
//     mutationFn: async ({ listingId, isTopListing }: { listingId: string; isTopListing: boolean }) => {
//       const res = await apiRequest("PATCH", `/api/admin/listings/${listingId}/top`, { isTopListing });
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
//       toast({
//         title: t("admin.topStatusUpdated"),
//         description: t("admin.topStatusUpdatedDescription"),
//       });
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("admin.error"),
//         description: error.message,
//       });
//     },
//   });

//   if (authLoading) {
//     return (
//       <div className="min-h-screen bg-background">
//         <Header />
//         <main className="container mx-auto px-4 py-8">
//           <div className="flex items-center justify-center h-[50vh]">
//             <p className="text-lg text-muted-foreground">{t("admin.loading")}</p>
//           </div>
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <Header />
//       <main className="flex-1 container mx-auto px-4 py-8">
//         <div className="mb-8">
//           <div className="flex items-center gap-2 mb-2">
//             <Shield className="h-8 w-8 text-primary" />
//             <h1 className="text-3xl font-bold">{t("admin.title")}</h1>
//           </div>
//           <p className="text-muted-foreground">{t("admin.subtitle")}</p>
//         </div>

//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className="grid w-full grid-cols-3 max-w-2xl">
//             <TabsTrigger value="users" data-testid="tab-admin-users">
//               <Users className="h-4 w-4 mr-2" />
//               {t("admin.users")} {users && `(${users.length})`}
//             </TabsTrigger>
//             <TabsTrigger value="listings" data-testid="tab-admin-listings">
//               <Car className="h-4 w-4 mr-2" />
//               {t("admin.listings")} {listings && `(${listings.length})`}
//             </TabsTrigger>
//             <TabsTrigger value="payments" data-testid="tab-admin-payments">
//               <CreditCard className="h-4 w-4 mr-2" />
//               {t("admin.payments")} {payments && `(${payments.length})`}
//             </TabsTrigger>
//           </TabsList>

//           <TabsContent value="users" className="mt-0">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("admin.usersManagement")}</CardTitle>
//                 <CardDescription>{t("admin.usersManagementDescription")}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {usersLoading ? (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.loading")}</p>
//                 ) : users && users.length > 0 ? (
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t("admin.username")}</TableHead>
//                           <TableHead>{t("admin.email")}</TableHead>
//                           <TableHead>{t("admin.name")}</TableHead>
//                           <TableHead>{t("admin.role")}</TableHead>
//                           <TableHead>{t("admin.createdAt")}</TableHead>
//                           <TableHead className="text-right">{t("admin.actions")}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {users.map((u) => (
//                           <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
//                             <TableCell className="font-medium" data-testid={`text-username-${u.id}`}>
//                               {u.username}
//                             </TableCell>
//                             <TableCell data-testid={`text-email-${u.id}`}>{u.email}</TableCell>
//                             <TableCell data-testid={`text-name-${u.id}`}>
//                               {u.firstName && u.lastName
//                                 ? `${u.firstName} ${u.lastName}`
//                                 : u.firstName || u.lastName || "-"}
//                             </TableCell>
//                             <TableCell>
//                               {u.isAdmin ? (
//                                 <Badge variant="default" data-testid={`badge-admin-${u.id}`}>
//                                   {t("admin.admin")}
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="secondary" data-testid={`badge-user-${u.id}`}>
//                                   {t("admin.user")}
//                                 </Badge>
//                               )}
//                             </TableCell>
//                             <TableCell data-testid={`text-created-${u.id}`}>
//                               {format(new Date(u.createdAt), "dd.MM.yyyy")}
//                             </TableCell>
//                             <TableCell className="text-right">
//                               {u.id !== user?.id && (
//                                 <Button
//                                   variant="destructive"
//                                   size="sm"
//                                   onClick={() => deleteUserMutation.mutate(u.id)}
//                                   disabled={deleteUserMutation.isPending}
//                                   data-testid={`button-delete-user-${u.id}`}
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               )}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 ) : (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.noUsers")}</p>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="listings" className="mt-0">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("admin.listingsManagement")}</CardTitle>
//                 <CardDescription>{t("admin.listingsManagementDescription")}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {listingsLoading ? (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.loading")}</p>
//                 ) : listings && listings.length > 0 ? (
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t("admin.title")}</TableHead>
//                           <TableHead>{t("admin.brand")}</TableHead>
//                           <TableHead>{t("admin.model")}</TableHead>
//                           <TableHead>{t("admin.price")}</TableHead>
//                           <TableHead>{t("admin.year")}</TableHead>
//                           <TableHead>{t("admin.createdAt")}</TableHead>
//                           <TableHead>{t("admin.status")}</TableHead>
//                           <TableHead className="text-right">{t("admin.actions")}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {listings.map((listing) => (
//                           <TableRow key={listing.id} data-testid={`row-listing-${listing.id}`}>
//                             <TableCell className="font-medium" data-testid={`text-title-${listing.id}`}>
//                               {listing.title}
//                             </TableCell>
//                             <TableCell data-testid={`text-brand-${listing.id}`}>{listing.brand}</TableCell>
//                             <TableCell data-testid={`text-model-${listing.id}`}>{listing.model}</TableCell>
//                             <TableCell data-testid={`text-price-${listing.id}`}>
//                               {new Intl.NumberFormat("cs-CZ").format(Number(listing.price))} Kč
//                             </TableCell>
//                             <TableCell data-testid={`text-year-${listing.id}`}>{listing.year}</TableCell>
//                             <TableCell data-testid={`text-created-listing-${listing.id}`}>
//                               {format(new Date(listing.createdAt), "dd.MM.yyyy")}
//                             </TableCell>
//                             <TableCell>
//                               {listing.isTopListing ? (
//                                 <Badge variant="default" data-testid={`badge-top-${listing.id}`}>
//                                   TOP
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="secondary" data-testid={`badge-standard-${listing.id}`}>
//                                   {t("admin.standard")}
//                                 </Badge>
//                               )}
//                             </TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex items-center justify-end gap-2">
//                                 <Button
//                                   variant={listing.isTopListing ? "default" : "outline"}
//                                   size="sm"
//                                   onClick={() => toggleTopMutation.mutate({
//                                     listingId: listing.id,
//                                     isTopListing: !listing.isTopListing
//                                   })}
//                                   disabled={toggleTopMutation.isPending}
//                                   data-testid={`button-toggle-top-${listing.id}`}
//                                 >
//                                   <Star
//                                     className="h-4 w-4"
//                                     fill={listing.isTopListing ? "currentColor" : "none"}
//                                     strokeWidth={2}
//                                   />
//                                 </Button>
//                                 <Button
//                                   variant="destructive"
//                                   size="sm"
//                                   onClick={() => deleteListingMutation.mutate(listing.id)}
//                                   disabled={deleteListingMutation.isPending}
//                                   data-testid={`button-delete-listing-${listing.id}`}
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 ) : (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.noListings")}</p>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>

//           <TabsContent value="payments" className="mt-0">
//             <Card>
//               <CardHeader>
//                 <CardTitle>{t("admin.paymentsManagement")}</CardTitle>
//                 <CardDescription>{t("admin.paymentsManagementDescription")}</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {paymentsLoading ? (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.loading")}</p>
//                 ) : payments && payments.length > 0 ? (
//                   <div className="rounded-md border">
//                     <Table>
//                       <TableHeader>
//                         <TableRow>
//                           <TableHead>{t("admin.buyer")}</TableHead>
//                           <TableHead>{t("admin.listing")}</TableHead>
//                           <TableHead>{t("admin.amount")}</TableHead>
//                           <TableHead>{t("admin.paymentStatus")}</TableHead>
//                           <TableHead>{t("admin.paymentDate")}</TableHead>
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {payments.map((payment) => (
//                           <TableRow key={payment.id} data-testid={`row-payment-${payment.id}`}>
//                             <TableCell data-testid={`text-buyer-${payment.id}`}>
//                               <div>
//                                 <p className="font-medium">{payment.buyerUsername || "-"}</p>
//                                 <p className="text-sm text-muted-foreground">{payment.buyerEmail || "-"}</p>
//                               </div>
//                             </TableCell>
//                             <TableCell className="font-medium" data-testid={`text-listing-${payment.id}`}>
//                               {payment.listingTitle || "-"}
//                             </TableCell>
//                             <TableCell data-testid={`text-amount-${payment.id}`}>
//                               {new Intl.NumberFormat("cs-CZ").format(Number(payment.amount) / 100)} {payment.currency?.toUpperCase()}
//                             </TableCell>
//                             <TableCell>
//                               {payment.status === "completed" ? (
//                                 <Badge variant="default" data-testid={`badge-completed-${payment.id}`}>
//                                   {t("admin.completed")}
//                                 </Badge>
//                               ) : payment.status === "pending" ? (
//                                 <Badge variant="secondary" data-testid={`badge-pending-${payment.id}`}>
//                                   {t("admin.pending")}
//                                 </Badge>
//                               ) : (
//                                 <Badge variant="destructive" data-testid={`badge-failed-${payment.id}`}>
//                                   {t("admin.failed")}
//                                 </Badge>
//                               )}
//                             </TableCell>
//                             <TableCell data-testid={`text-date-${payment.id}`}>
//                               {format(new Date(payment.createdAt), "dd.MM.yyyy HH:mm")}
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 ) : (
//                   <p className="text-center py-8 text-muted-foreground">{t("admin.noPayments")}</p>
//                 )}
//               </CardContent>
//             </Card>
//           </TabsContent>
//         </Tabs>
//       </main>
//       <Footer />
//     </div>
//   );
// }
import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useTranslation } from "@/lib/translations";
import { displayViews } from "@/lib/displayStats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "@/lib/navigation";
import {
  Shield,
  Car,
  Trash2,
  Star,
  Link2,
  BarChart3,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { isSuperAdmin } from "@/lib/permissions";
import AdminNav from "@/components/admin/AdminNav";
import AdminDashboardTab from "@/components/admin/AdminDashboardTab";
import AdminDealerManagement from "@/components/admin/AdminDealerManagement";
import type { User, Listing, EnrichedPayment, Dealer } from "@shared/schema";

type AdminCebiaReport = {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  listingId: string | null;
  vin: string;
  status: string;
  priceCents: number | null;
  currency: string | null;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  customerEmail: string;
  hasPdf: boolean;
  adminPdfUrl: string;
};

type AdminCebiaReportsResponse = {
  count: number;
  items: AdminCebiaReport[];
};

type AdminListingAnalyticsItem = {
  listingId: string;
  ownerUserId: string;
  views: number;
  contactClicks: number;
  whatsappClicks: number;
};

type AdminListingAnalyticsResponse = {
  count: number;
  items: AdminListingAnalyticsItem[];
};

type DeletedListingItem = {
  id: string;
  listing_id: string;
  user_id: string;
  deleted_by: string;
  brand: string;
  model: string;
  title: string;
  year: number | null;
  price: string | null;
  photo: string | null;
  deleted_at: string;
  owner_username: string | null;
  owner_email: string | null;
  deleted_by_username: string | null;
};

export default function AdminPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const superAdmin = isSuperAdmin(user);
  const [activeTab, setActiveTab] = useState<string>(() =>
    isSuperAdmin(user) ? "dashboard" : "users",
  );
  const [navCollapsed, setNavCollapsed] = useState(false);
  const adminRealtimeQueryOptions = {
    enabled: isAuthenticated && user?.isAdmin,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  } as const;

  if (!authLoading && !isAuthenticated) {
    navigate("/");
    return null;
  }

  if (!authLoading && !user?.isAdmin) {
    navigate("/");
    return null;
  }

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
    ...adminRealtimeQueryOptions,
  });

  const {
    data: listingsData,
    isLoading: listingsLoading,
    error: listingsError,
  } = useQuery<Listing[]>({
    queryKey: ["/api/admin/listings"],
    ...adminRealtimeQueryOptions,
  });

  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery<EnrichedPayment[]>({
    queryKey: ["/api/admin/payments"],
    ...adminRealtimeQueryOptions,
  });

  const {
    data: cebiaReportsData,
    isLoading: cebiaReportsLoading,
    error: cebiaReportsError,
  } = useQuery<AdminCebiaReportsResponse>({
    queryKey: ["/api/admin/cebia/reports"],
    ...adminRealtimeQueryOptions,
  });

  const {
    data: dealersResponse,
    isLoading: dealersLoading,
    error: dealersError,
  } = useQuery<{ dealers: Dealer[] }>({
    queryKey: ["/api/admin/dealers"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/dealers");
      return res.json();
    },
    ...adminRealtimeQueryOptions,
  });

  const { data: listingAnalyticsData } = useQuery<AdminListingAnalyticsResponse>({
    queryKey: ["/api/admin/listings/analytics"],
    ...adminRealtimeQueryOptions,
  });

  const {
    data: deletedListingsData,
    isLoading: deletedListingsLoading,
  } = useQuery<{ items: DeletedListingItem[] }>({
    queryKey: ["/api/admin/deleted-listings"],
    ...adminRealtimeQueryOptions,
  });

  const byCreatedAtDesc = <
    T extends {
      createdAt?: string | Date | null;
    },
  >(
    items: T[],
  ) => {
    const toMs = (value: string | Date | null | undefined) => {
      if (!value) return 0;
      const ms = new Date(value).getTime();
      return Number.isFinite(ms) ? ms : 0;
    };
    return items
      .slice()
      .sort((a, b) => toMs(b.createdAt ?? null) - toMs(a.createdAt ?? null));
  };

  const users = useMemo(() => byCreatedAtDesc(usersData || []), [usersData]);
  const dealers = useMemo(
    () => byCreatedAtDesc(dealersResponse?.dealers || []),
    [dealersResponse?.dealers],
  );
  const listings = useMemo(
    () => byCreatedAtDesc(listingsData || []),
    [listingsData],
  );
  const payments = useMemo(
    () => byCreatedAtDesc(paymentsData || []),
    [paymentsData],
  );
  const cebiaReports = useMemo(
    () => byCreatedAtDesc(cebiaReportsData?.items || []),
    [cebiaReportsData],
  );
  const deletedListings = useMemo(
    () => deletedListingsData?.items || [],
    [deletedListingsData],
  );
  const listingAnalyticsMap = useMemo(() => {
    const map = new Map<string, AdminListingAnalyticsItem>();
    for (const item of listingAnalyticsData?.items || []) {
      map.set(item.listingId, item);
    }
    return map;
  }, [listingAnalyticsData]);

  const hasUsersError = !!usersError;
  const hasListingsError = !!listingsError;
  const hasPaymentsError = !!paymentsError;
  const hasCebiaReportsError = !!cebiaReportsError;
  const hasDealersError = !!dealersError;
  const hasAnyAdminDataError =
    hasUsersError ||
    hasListingsError ||
    hasPaymentsError ||
    hasCebiaReportsError ||
    hasDealersError;

  const downloadFromAuthorizedApi = async (
    url: string,
    filename: string,
    fallbackOpenInNewTab = false,
  ) => {
    try {
      const res = await apiRequest("GET", url);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      if (fallbackOpenInNewTab) {
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }
      toast({
        variant: "destructive",
        title: t("admin.error"),
        description: error?.message || "Failed to download file",
      });
    }
  };

  const handleExportCebiaCsv = async () => {
    await downloadFromAuthorizedApi(
      "/api/admin/cebia/reports/export.csv",
      `cebia-reports-${new Date().toISOString().slice(0, 10)}.csv`,
    );
  };

  const handleDownloadCebiaPdf = async (report: AdminCebiaReport) => {
    await downloadFromAuthorizedApi(
      report.adminPdfUrl,
      `cebia-${report.vin || report.id}.pdf`,
      true,
    );
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: t("admin.userDeleted"),
        description: t("admin.userDeletedDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("admin.error"),
        description: error.message,
      });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const res = await apiRequest(
        "DELETE",
        `/api/admin/listings/${listingId}`,
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: t("admin.listingDeleted"),
        description: t("admin.listingDeletedDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("admin.error"),
        description: error.message,
      });
    },
  });

  const toggleTopMutation = useMutation({
    mutationFn: async ({
      listingId,
      isTopListing,
    }: {
      listingId: string;
      isTopListing: boolean;
    }) => {
      const res = await apiRequest(
        "PATCH",
        `/api/admin/listings/${listingId}/top`,
        { isTopListing },
      );
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: t("admin.topStatusUpdated"),
        description: t("admin.topStatusUpdatedDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("admin.error"),
        description: error.message,
      });
    },
  });

  const patchDealerMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: { isVerified?: boolean; maxListings?: number };
    }) => {
      const res = await apiRequest("PATCH", `/api/admin/dealers/${id}`, body);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dealers"] });
      toast({
        title: t("admin.dealerUpdated"),
        description: t("admin.dealerUpdatedDescription"),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("admin.error"),
        description: error.message,
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[50vh]">
            <p className="text-lg text-muted-foreground">
              {t("admin.loading")}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-3 py-4 sm:px-4 sm:py-6">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
            <h1 className="text-xl font-bold sm:text-2xl">{t("admin.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>

        {hasAnyAdminDataError ? (
          <Card className="mb-6 border-destructive/40">
            <CardContent className="py-4 text-sm text-destructive">
              <p className="font-medium">
                Частина адмін-даних не завантажилась.
              </p>
              <p className="mt-1">
                Помилки секцій:{" "}
                {[
                  hasUsersError ? "users" : null,
                  hasListingsError ? "listings" : null,
                  hasPaymentsError ? "payments" : null,
                  hasCebiaReportsError ? "cebia" : null,
                  hasDealersError ? "dealers" : null,
                ]
                  .filter(Boolean)
                  .join(", ")}
                .
              </p>
            </CardContent>
          </Card>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div
            className={`md:grid md:gap-6 md:items-start ${
              navCollapsed
                ? "md:grid-cols-[56px_minmax(0,1fr)]"
                : "md:grid-cols-[232px_minmax(0,1fr)]"
            }`}
          >
            <AdminNav
              activeTab={activeTab}
              onSelect={setActiveTab}
              superAdmin={superAdmin}
              collapsed={navCollapsed}
              onToggleCollapsed={() => setNavCollapsed((v) => !v)}
              counts={{
                listings: listings.length,
                users: users.length,
                dealers: dealers.length,
                payments: payments.length,
                cebia: cebiaReports.length,
                deleted: deletedListings.length,
              }}
            />
            <div className="mt-4 min-w-0 md:mt-0">

          {superAdmin ? (
            <TabsContent value="dashboard" className="mt-0">
              <AdminDashboardTab />
            </TabsContent>
          ) : null}

          <TabsContent value="users" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.usersManagement")}</CardTitle>
                <CardDescription>
                  {t("admin.usersManagementDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : users && users.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.username")}</TableHead>
                          <TableHead>{t("admin.email")}</TableHead>
                          <TableHead>{t("admin.name")}</TableHead>
                          <TableHead>{t("admin.role")}</TableHead>
                          <TableHead>{t("admin.createdAt")}</TableHead>
                          <TableHead className="text-right">
                            {t("admin.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id} data-testid={`row-user-${u.id}`}>
                            <TableCell
                              className="font-medium"
                              data-testid={`text-username-${u.id}`}
                            >
                              {u.username}
                            </TableCell>
                            <TableCell data-testid={`text-email-${u.id}`}>
                              {u.email}
                            </TableCell>
                            <TableCell data-testid={`text-name-${u.id}`}>
                              {u.firstName && u.lastName
                                ? `${u.firstName} ${u.lastName}`
                                : u.firstName || u.lastName || "-"}
                            </TableCell>
                            <TableCell>
                              {u.isAdmin ? (
                                <Badge
                                  variant="default"
                                  data-testid={`badge-admin-${u.id}`}
                                >
                                  {t("admin.admin")}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  data-testid={`badge-user-${u.id}`}
                                >
                                  {t("admin.user")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell data-testid={`text-created-${u.id}`}>
                              {format(new Date(u.createdAt), "dd.MM.yyyy")}
                            </TableCell>
                            <TableCell className="text-right">
                              {u.id !== user?.id && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const ok = window.confirm(
                                      `Ви дійсно хочете видалити користувача?\n\n${u.username} (${u.email})`,
                                    );
                                    if (ok) deleteUserMutation.mutate(u.id);
                                  }}
                                  disabled={deleteUserMutation.isPending}
                                  data-testid={`button-delete-user-${u.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.noUsers")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.listingsManagement")}</CardTitle>
                <CardDescription>
                  {t("admin.listingsManagementDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {listingsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : listings && listings.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.title")}</TableHead>
                          <TableHead>{t("admin.brand")}</TableHead>
                          <TableHead>{t("admin.model")}</TableHead>
                          <TableHead>{t("admin.price")}</TableHead>
                          <TableHead>{t("admin.year")}</TableHead>
                          <TableHead>Views</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>WhatsApp</TableHead>
                          <TableHead>{t("admin.createdAt")}</TableHead>
                          <TableHead>{t("admin.status")}</TableHead>
                          <TableHead className="text-right">
                            {t("admin.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listings.map((listing) => {
                          const analytics = listingAnalyticsMap.get(listing.id);
                          return (
                            <TableRow
                              key={listing.id}
                              data-testid={`row-listing-${listing.id}`}
                            >
                            <TableCell
                              className="font-medium"
                              data-testid={`text-title-${listing.id}`}
                            >
                              {listing.title}
                            </TableCell>
                            <TableCell data-testid={`text-brand-${listing.id}`}>
                              {listing.brand}
                            </TableCell>
                            <TableCell data-testid={`text-model-${listing.id}`}>
                              {listing.model}
                            </TableCell>
                            <TableCell data-testid={`text-price-${listing.id}`}>
                              {new Intl.NumberFormat("cs-CZ").format(
                                Number(listing.price),
                              )}{" "}
                              Kč
                            </TableCell>
                            <TableCell data-testid={`text-year-${listing.id}`}>
                              {listing.year}
                            </TableCell>
                            <TableCell
                              data-testid={`text-views-${listing.id}`}
                            >
                              {displayViews(analytics?.views)}
                            </TableCell>
                            <TableCell
                              data-testid={`text-contact-clicks-${listing.id}`}
                            >
                              {analytics?.contactClicks ?? 0}
                            </TableCell>
                            <TableCell
                              data-testid={`text-whatsapp-clicks-${listing.id}`}
                            >
                              {analytics?.whatsappClicks ?? 0}
                            </TableCell>
                            <TableCell
                              data-testid={`text-created-listing-${listing.id}`}
                            >
                              {format(
                                new Date(listing.createdAt),
                                "dd.MM.yyyy",
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {listing.isTopListing ? (
                                  <Badge
                                    variant="default"
                                    data-testid={`badge-top-${listing.id}`}
                                  >
                                    TOP
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    data-testid={`badge-standard-${listing.id}`}
                                  >
                                    {t("admin.standard")}
                                  </Badge>
                                )}
                                {listing.isSold ? (
                                  <Badge
                                    variant="outline"
                                    className="border-zinc-500 text-zinc-700 dark:text-zinc-300"
                                    data-testid={`badge-sold-${listing.id}`}
                                  >
                                    {t("listing.soldBadge")}
                                  </Badge>
                                ) : null}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant={
                                    listing.isTopListing ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    toggleTopMutation.mutate({
                                      listingId: listing.id,
                                      isTopListing: !listing.isTopListing,
                                    })
                                  }
                                  disabled={toggleTopMutation.isPending}
                                  data-testid={`button-toggle-top-${listing.id}`}
                                >
                                  <Star
                                    className="h-4 w-4"
                                    fill={
                                      listing.isTopListing
                                        ? "currentColor"
                                        : "none"
                                    }
                                    strokeWidth={2}
                                  />
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const ok = window.confirm(
                                      `Ви дійсно хочете видалити оголошення?\n\n${listing.title}`,
                                    );
                                    if (ok)
                                      deleteListingMutation.mutate(listing.id);
                                  }}
                                  disabled={deleteListingMutation.isPending}
                                  data-testid={`button-delete-listing-${listing.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.noListings")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.paymentsManagement")}</CardTitle>
                <CardDescription>
                  {t("admin.paymentsManagementDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : payments && payments.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("admin.buyer")}</TableHead>
                          <TableHead>{t("admin.listing")}</TableHead>
                          <TableHead>{t("admin.amount")}</TableHead>
                          <TableHead>{t("admin.paymentStatus")}</TableHead>
                          <TableHead>{t("admin.paymentDate")}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow
                            key={payment.id}
                            data-testid={`row-payment-${payment.id}`}
                          >
                            <TableCell data-testid={`text-buyer-${payment.id}`}>
                              <div>
                                <p className="font-medium">
                                  {payment.buyerUsername || "-"}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {payment.buyerEmail || "-"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell
                              className="font-medium"
                              data-testid={`text-listing-${payment.id}`}
                            >
                              {payment.listingTitle || "-"}
                            </TableCell>
                            <TableCell
                              data-testid={`text-amount-${payment.id}`}
                            >
                              {new Intl.NumberFormat("cs-CZ").format(
                                Number(payment.amount) / 100,
                              )}{" "}
                              {payment.currency?.toUpperCase()}
                            </TableCell>
                            <TableCell>
                              {payment.status === "completed" ? (
                                <Badge
                                  variant="default"
                                  data-testid={`badge-completed-${payment.id}`}
                                >
                                  {t("admin.completed")}
                                </Badge>
                              ) : payment.status === "pending" ? (
                                <Badge
                                  variant="secondary"
                                  data-testid={`badge-pending-${payment.id}`}
                                >
                                  {t("admin.pending")}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="destructive"
                                  data-testid={`badge-failed-${payment.id}`}
                                >
                                  {t("admin.failed")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell data-testid={`text-date-${payment.id}`}>
                              {format(
                                new Date(payment.createdAt),
                                "dd.MM.yyyy HH:mm",
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.noPayments")}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cebia" className="mt-0">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Cebia Reports</CardTitle>
                    <CardDescription>
                      Усі куплені VIN-репорти з можливістю експорту CSV і
                      завантаження PDF.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExportCebiaCsv}
                    data-testid="button-export-cebia-csv"
                  >
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {cebiaReportsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : cebiaReports.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>VIN</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">PDF</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cebiaReports.map((report) => (
                          <TableRow
                            key={report.id}
                            data-testid={`row-cebia-report-${report.id}`}
                          >
                            <TableCell>
                              {format(
                                new Date(report.createdAt),
                                "dd.MM.yyyy HH:mm",
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs uppercase">
                              {report.vin}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  report.status === "ready"
                                    ? "default"
                                    : report.status === "paid" ||
                                        report.status === "processing"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {report.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[220px] truncate">
                              {report.customerEmail || "-"}
                            </TableCell>
                            <TableCell>
                              {report.priceCents
                                ? `${new Intl.NumberFormat("cs-CZ").format(
                                    report.priceCents / 100,
                                  )} ${report.currency?.toUpperCase() || "CZK"}`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadCebiaPdf(report)}
                                disabled={!report.hasPdf}
                                data-testid={`button-cebia-pdf-${report.id}`}
                              >
                                PDF
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Ще немає куплених Cebia-репортів.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dealers" className="mt-0">
            {superAdmin ? (
              <AdminDealerManagement />
            ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.dealersManagement")}</CardTitle>
                <CardDescription>
                  {t("admin.dealersManagementDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dealersLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : dealers.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t("dealer.companyName")}</TableHead>
                          <TableHead className="whitespace-nowrap">
                            {t("admin.dealerOwnerId")}
                          </TableHead>
                          <TableHead>{t("admin.dealerVerified")}</TableHead>
                          <TableHead className="text-right whitespace-nowrap">
                            {t("admin.dealerMaxListings")}
                          </TableHead>
                          <TableHead className="text-right">
                            {t("admin.actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dealers.map((d) => (
                          <TableRow
                            key={d.id}
                            data-testid={`row-dealer-${d.id}`}
                          >
                            <TableCell
                              className="font-medium max-w-[200px] truncate"
                              title={d.companyName}
                            >
                              {d.companyName}
                            </TableCell>
                            <TableCell
                              className="font-mono text-xs max-w-[120px] truncate"
                              title={d.ownerId}
                            >
                              {d.ownerId}
                            </TableCell>
                            <TableCell>
                              {d.isVerified ? (
                                <Badge variant="default">
                                  {t("admin.dealerVerifiedYes")}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  {t("admin.dealerVerifiedNo")}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {d.maxListings}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  variant={
                                    d.isVerified ? "outline" : "default"
                                  }
                                  size="sm"
                                  disabled={patchDealerMutation.isPending}
                                  data-testid={`button-dealer-toggle-verified-${d.id}`}
                                  onClick={() =>
                                    patchDealerMutation.mutate({
                                      id: d.id,
                                      body: {
                                        isVerified: !d.isVerified,
                                      },
                                    })
                                  }
                                >
                                  {d.isVerified
                                    ? t("admin.dealerUnverify")
                                    : t("admin.dealerVerify")}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={patchDealerMutation.isPending}
                                  data-testid={`button-dealer-set-max-${d.id}`}
                                  onClick={() => {
                                    const raw = window.prompt(
                                      t("admin.dealerMaxListingsPrompt"),
                                      String(d.maxListings),
                                    );
                                    if (raw === null) return;
                                    const n = parseInt(raw, 10);
                                    if (
                                      !Number.isFinite(n) ||
                                      n < 1 ||
                                      n > 10_000
                                    ) {
                                      toast({
                                        variant: "destructive",
                                        title: t("admin.error"),
                                        description: t(
                                          "admin.dealerMaxListingsInvalid",
                                        ),
                                      });
                                      return;
                                    }
                                    if (n !== d.maxListings) {
                                      patchDealerMutation.mutate({
                                        id: d.id,
                                        body: { maxListings: n },
                                      });
                                    }
                                  }}
                                >
                                  {t("admin.dealerSetMax")}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.noDealers")}
                  </p>
                )}
              </CardContent>
            </Card>
            )}
          </TabsContent>

          {superAdmin ? (
            <TabsContent value="integrace" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="h-5 w-5" />
                    Integrace
                  </CardTitle>
                  <CardDescription>
                    Monitoring XML feedů, API klíčů a webhooků napříč všemi dealery.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="py-8 text-center text-muted-foreground">
                    XML Feeds, API a Webhooks monitoring se připravuje (další fáze).
                    Konfigurace se ukládá do PostgreSQL na úrovni dealera.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ) : null}

          {superAdmin ? (
            <TabsContent value="statistiky" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Statistiky
                  </CardTitle>
                  <CardDescription>
                    Dealer Analytics — top dealeři podle vozidel.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dealers.length > 0 ? (
                    <div className="rounded-md border overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Dealer</TableHead>
                            <TableHead className="text-right">Vozidel</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dealers.slice(0, 10).map((d) => (
                            <TableRow key={d.id}>
                              <TableCell className="font-medium">{d.companyName}</TableCell>
                              <TableCell className="text-right tabular-nums">
                                {d.maxListings}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">
                      Rozšířené grafy a trendy dorazí v další fázi.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ) : null}

          {superAdmin ? (
            <TabsContent value="nastaveni" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Nastavení
                  </CardTitle>
                  <CardDescription>
                    Konfigurace administrace a tarifních limitů.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <span className="font-semibold">Super-admin:</span> {user?.email}
                  </p>
                  <p className="text-muted-foreground">
                    Tarify: Free (5), Basic (20), Pro (100), Premium (500), Enterprise (∞).
                  </p>
                  <p className="text-muted-foreground">
                    Všechny akce dealer managementu se zaznamenávají do audit logu.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          ) : null}

          <TabsContent value="deleted" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Smazané inzeráty</CardTitle>
                <CardDescription>
                  Historie smazaných inzerátů — kdo, kdy a jaké auto smazal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {deletedListingsLoading ? (
                  <p className="text-center py-8 text-muted-foreground">
                    {t("admin.loading")}
                  </p>
                ) : deletedListings.length > 0 ? (
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Foto</TableHead>
                          <TableHead>Auto</TableHead>
                          <TableHead>Cena</TableHead>
                          <TableHead>Vlastník</TableHead>
                          <TableHead>Smazal</TableHead>
                          <TableHead>Datum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deletedListings.map((dl) => (
                          <TableRow key={dl.id}>
                            <TableCell>
                              {dl.photo ? (
                                <img
                                  src={`/img/${dl.photo}?w=80&h=56&fit=cover`}
                                  alt={`${dl.brand} ${dl.model}`}
                                  className="h-10 w-14 rounded object-cover"
                                />
                              ) : (
                                <div className="h-10 w-14 rounded bg-muted flex items-center justify-center">
                                  <Car className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">{dl.brand} {dl.model} {dl.year || ""}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">{dl.title}</p>
                            </TableCell>
                            <TableCell>
                              {dl.price
                                ? `${new Intl.NumberFormat("cs-CZ").format(Number(dl.price))} Kč`
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{dl.owner_username || "—"}</p>
                              <p className="text-xs text-muted-foreground">{dl.owner_email || ""}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant={dl.deleted_by === dl.user_id ? "secondary" : "destructive"}>
                                {dl.deleted_by === dl.user_id
                                  ? (dl.owner_username || "vlastník")
                                  : (dl.deleted_by_username || "admin")}
                              </Badge>
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-sm">
                              {format(new Date(dl.deleted_at), "dd.MM.yyyy HH:mm")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Zatím nebylo nic smazáno.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
            </div>
          </div>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
