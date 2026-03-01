// // // import { useState, useMemo, useEffect, useRef } from "react";
// // // import Header from "@/components/Header";
// // // import Hero from "@/components/Hero";
// // // import FilterSidebar from "@/components/FilterSidebar";
// // // import MobileFilters from "@/components/MobileFilters";
// // // import CarCard from "@/components/CarCard";
// // // import Footer from "@/components/Footer";
// // // import {
// // //   SEO,
// // //   generateOrganizationSchema,
// // //   generateWebsiteSchema,
// // // } from "@/components/SEO";
// // // import { Button } from "@/components/ui/button";
// // // import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// // // import { useQuery, useMutation } from "@tanstack/react-query";
// // // import { formatDistanceToNow } from "date-fns";
// // // import { cs, uk, enUS } from "date-fns/locale";
// // // import { useLanguage } from "@/contexts/LanguageContext";
// // // import { useLocation } from "wouter";
// // // import {
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   ChevronsLeft,
// // //   ChevronsRight,
// // // } from "lucide-react";
// // // import type { Listing } from "@shared/schema";
// // // import { useAuth } from "@/hooks/useAuth";
// // // import { apiRequest, queryClient } from "@/lib/queryClient";
// // // import { useToast } from "@/hooks/use-toast";
// // // import {
// // //   AlertDialog,
// // //   AlertDialogAction,
// // //   AlertDialogCancel,
// // //   AlertDialogContent,
// // //   AlertDialogDescription,
// // //   AlertDialogFooter,
// // //   AlertDialogHeader,
// // //   AlertDialogTitle,
// // // } from "@/components/ui/alert-dialog";
// // // import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// // // import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// // // import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// // // import electricImage from "@assets/generated_images/Featured_car_electric_fd29e3f9.png";
// // // import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// // // import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// // // // Map of body types to images
// // // const bodyTypeImages: Record<string, string> = {
// // //   sedan: sedanImage,
// // //   suv: suvImage,
// // //   coupe: sportsImage,
// // //   hatchback: hatchbackImage,
// // //   pickup: truckImage,
// // // };

// // // export default function HomePage() {
// // //   const t = useTranslation();
// // //   const { language } = useLanguage();
// // //   const localizedOptions = useLocalizedOptions();
// // //   const [, navigate] = useLocation();
// // //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
// // //   const { user } = useAuth();
// // //   const { toast } = useToast();
// // //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// // //   const [deletingListingId, setDeletingListingId] = useState<string | null>(
// // //     null
// // //   );
// // //   const ITEMS_PER_PAGE = 12;

// // //   // Get current page from URL params (for back button support)
// // //   const urlPageParam = new URLSearchParams(window.location.search).get("page");
// // //   const [currentPage, setCurrentPage] = useState(() => {
// // //     const pageFromUrl = urlPageParam ? parseInt(urlPageParam) : 1;
// // //     return isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
// // //   });

// // //   // Update URL when page changes
// // //   const goToPage = (page: number) => {
// // //     setCurrentPage(page);
// // //     const newUrl = new URL(window.location.href);
// // //     if (page === 1) {
// // //       newUrl.searchParams.delete("page");
// // //     } else {
// // //       newUrl.searchParams.set("page", page.toString());
// // //     }
// // //     window.history.replaceState({}, "", newUrl.toString());
// // //   };
// // //   const recommendedSectionRef = useRef<HTMLElement>(null);

// // //   // Scroll to top of recommendations when page changes (skip initial load)
// // //   const isFirstRender = useRef(true);
// // //   useEffect(() => {
// // //     if (isFirstRender.current) {
// // //       isFirstRender.current = false;
// // //       return;
// // //     }
// // //     if (recommendedSectionRef.current) {
// // //       recommendedSectionRef.current.scrollIntoView({
// // //         behavior: "smooth",
// // //         block: "start",
// // //       });
// // //     }
// // //   }, [currentPage]);

// // //   interface ListingsResponse {
// // //     listings: Listing[];
// // //     pagination: {
// // //       page: number;
// // //       limit: number;
// // //       total: number;
// // //       totalPages: number;
// // //       hasMore: boolean;
// // //     };
// // //   }

// // //   // Fetch all listings for client-side pagination with TOP sorting
// // //   // const { data, isLoading } = useQuery<ListingsResponse>({
// // //   //   queryKey: ['/api/listings?limit=1000'],
// // //   // });
// // //   const listUrl = `/api/listings?page=${currentPage}&limit=${ITEMS_PER_PAGE}&sort=top&fields=card`;

// // //   const { data, isLoading } = useQuery<ListingsResponse>({
// // //     queryKey: [listUrl],
// // //     staleTime: 30_000,
// // //     gcTime: 5 * 60_000,
// // //   });

// // //   const listings = data?.listings || [];

// // //   // Delete mutation
// // //   const deleteMutation = useMutation({
// // //     mutationFn: async (listingId: string) => {
// // //       await apiRequest("DELETE", `/api/listings/${listingId}`);
// // //     },
// // //     onSuccess: () => {
// // //       queryClient.invalidateQueries({ queryKey: ["/api/listings?limit=1000"] });
// // //       toast({
// // //         title: t("listing.deleteSuccess"),
// // //         description: t("listing.deleteSuccessDescription"),
// // //       });
// // //       setDeleteDialogOpen(false);
// // //       setDeletingListingId(null);
// // //     },
// // //     onError: () => {
// // //       toast({
// // //         title: t("listing.deleteError"),
// // //         variant: "destructive",
// // //       });
// // //     },
// // //   });

// // //   const handleDelete = (id: string) => {
// // //     setDeletingListingId(id);
// // //     setDeleteDialogOpen(true);
// // //   };

// // //   const confirmDelete = () => {
// // //     if (deletingListingId) {
// // //       deleteMutation.mutate(deletingListingId);
// // //     }
// // //   };

// // //   // Get locale for date formatting
// // //   const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

// // //   // Sort all listings with TOP listings first, then by newest
// // //   const sortedListings = useMemo(() => {
// // //     return [...listings].sort((a, b) => {
// // //       // TOP listings always first
// // //       if (a.isTopListing && !b.isTopListing) return -1;
// // //       if (!a.isTopListing && b.isTopListing) return 1;
// // //       // Then sort by creation date (newest first)
// // //       return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
// // //     });
// // //   }, [listings]);

// // //   // Calculate pagination
// // //   const totalPages = Math.ceil(sortedListings.length / ITEMS_PER_PAGE);
// // //   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
// // //   const paginatedListings = sortedListings.slice(
// // //     startIndex,
// // //     startIndex + ITEMS_PER_PAGE
// // //   );

// // //   // Memoized label maps for performance (include language for i18n updates)
// // //   const fuelLabels = useMemo(
// // //     () => ({
// // //       benzin: t("hero.benzin"),
// // //       diesel: t("hero.diesel"),
// // //       hybrid: t("hero.hybrid"),
// // //       electric: t("hero.electric"),
// // //       lpg: t("hero.lpg"),
// // //       cng: t("hero.cng"),
// // //     }),
// // //     [t, language]
// // //   );

// // //   const transmissionLabels = useMemo(
// // //     () => ({
// // //       manual: t("filters.manual"),
// // //       automatic: t("filters.automatic"),
// // //       robot: t("filters.robot"),
// // //       cvt: t("filters.cvt"),
// // //     }),
// // //     [t, language]
// // //   );

// // //   // Memoize regions for performance (include language for i18n updates)
// // //   const regions = useMemo(
// // //     () => localizedOptions.getRegions(),
// // //     [localizedOptions, language]
// // //   );

// // //   // Map listings to CarCard props - memoized for performance
// // //   const featuredCars = useMemo(() => {
// // //     const currentYear = new Date().getFullYear();

// // //     return paginatedListings.map((listing) => {
// // //       const regionLabel =
// // //         regions.find((r) => r.value === listing.region)?.label ||
// // //         listing.region ||
// // //         "";

// // //       // Get image: use first uploaded photo if available, otherwise fallback to body type image
// // //       let image = sedanImage; // Default fallback
// // //       const firstPhoto = listing.photos?.[0];
// // //       if (typeof firstPhoto === "string") {
// // //         const trimmedPhoto = firstPhoto.trim();
// // //         if (trimmedPhoto) {
// // //           const photoPath = trimmedPhoto.replace(/^\/+/, "");
// // //           image = `/objects/${photoPath}`;
// // //         } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
// // //           image = bodyTypeImages[listing.bodyType];
// // //         }
// // //       } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
// // //         image = bodyTypeImages[listing.bodyType];
// // //       }

// // //       // Format date
// // //       const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
// // //         addSuffix: true,
// // //         locale: dateLocale,
// // //       });

// // //       // Determine condition based on year and isTopListing
// // //       let condition =
// // //         listing.year === currentYear ? t("filters.new") : t("filters.used");
// // //       if (listing.isTopListing) {
// // //         condition = t("detail.topListing");
// // //       }

// // //       // Handle array fields - take first element for display
// // //       const fuelType = listing.fuelType?.[0] || "";
// // //       const transmission = listing.transmission?.[0] || "";

// // //       // Prepare all photos with /objects/ prefix
// // //       const photos = (listing.photos || [])
// // //         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
// // //         .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

// // //       return {
// // //         id: listing.id,
// // //         image,
// // //         photos,
// // //         title: listing.title,
// // //         price: parseFloat(listing.price),
// // //         year: listing.year,
// // //         mileage: listing.mileage,
// // //         fuel: fuelType
// // //           ? fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType
// // //           : "-",
// // //         transmission: transmission
// // //           ? transmissionLabels[
// // //               transmission as keyof typeof transmissionLabels
// // //             ] || transmission
// // //           : "-",
// // //         location: regionLabel,
// // //         datePosted,
// // //         condition,
// // //       };
// // //     });
// // //   }, [
// // //     paginatedListings,
// // //     regions,
// // //     dateLocale,
// // //     t,
// // //     fuelLabels,
// // //     transmissionLabels,
// // //   ]);

// // //   // SEO descriptions based on language
// // //   const seoDescriptions = {
// // //     cs: "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.",
// // //     uk: "NNAuto - преміальний маркетплейс для купівлі та продажу автомобілів, мотоциклів та вантажівок у Чеській Республіці. Тисячі перевірених оголошень, розширені фільтри, легкий пошук.",
// // //     en: "NNAuto is a premium marketplace for buying and selling cars, motorcycles and trucks in the Czech Republic. Thousands of verified listings, advanced filters, easy search.",
// // //   };

// // //   const seoTitles = {
// // //     cs: "NNAuto - Prémiový Marketplace Aut | Prodej a Nákup Vozidel v ČR",
// // //     uk: "NNAuto - Преміальний Маркетплейс Авто | Продаж та Покупка Автомобілів",
// // //     en: "NNAuto - Premium Car Marketplace | Buy & Sell Vehicles in Czech Republic",
// // //   };

// // //   const seoKeywords = {
// // //     cs: "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, autobazar online, auto inzeráty, výkup aut, prodej vozidel, auta na prodej",
// // //     uk: "продаж авто, купівля авто, авторинок, вживані авто, нові авто, автомобілі, мотоцикли, вантажівки, автобазар, Чехія, NNAuto",
// // //     en: "car sales, buy cars, used cars, new cars, automobiles, motorcycles, trucks, car market, Czech Republic, NNAuto, car listings",
// // //   };

// // //   const organizationSchema = generateOrganizationSchema();
// // //   const websiteSchema = generateWebsiteSchema();

// // //   return (
// // //     <div className="min-h-screen flex flex-col">
// // //       <SEO
// // //         title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
// // //         description={
// // //           seoDescriptions[language as keyof typeof seoDescriptions] ||
// // //           seoDescriptions.cs
// // //         }
// // //         keywords={
// // //           seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs
// // //         }
// // //         url="https://nnauto.cz/"
// // //         locale={
// // //           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
// // //         }
// // //         alternateLanguages={[
// // //           { lang: "cs", url: "https://nnauto.cz/" },
// // //           { lang: "uk", url: "https://nnauto.cz/" },
// // //           { lang: "en", url: "https://nnauto.cz/" },
// // //         ]}
// // //         structuredData={{
// // //           "@context": "https://schema.org",
// // //           "@graph": [organizationSchema, websiteSchema],
// // //         }}
// // //       />
// // //       <Header />
// // //       <Hero />

// // //       <main className="flex-1">
// // //         <section
// // //           ref={recommendedSectionRef}
// // //           className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-20"
// // //         >
// // //           <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
// // //             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
// // //               {t("home.recommended")}
// // //             </h2>
// // //             <div className="flex items-center gap-2 sm:gap-3">
// // //               <MobileFilters />
// // //               <Button
// // //                 variant="outline"
// // //                 className="h-10 px-4 sm:h-12 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base"
// // //                 onClick={() => navigate("/listings")}
// // //                 data-testid="button-view-all"
// // //               >
// // //                 <span className="hidden sm:inline">{t("home.viewAll")}</span>
// // //                 <span className="sm:hidden">{t("home.viewAll")}</span>
// // //               </Button>
// // //             </div>
// // //           </div>

// // //           <div className="flex gap-6 sm:gap-8 lg:gap-12 relative">
// // //             {/* Sidebar with toggle button */}
// // //             <aside
// // //               className={`hidden lg:block shrink-0 transition-all duration-300 relative ${
// // //                 sidebarCollapsed
// // //                   ? "w-0 overflow-hidden"
// // //                   : "w-80 xl:w-96 overflow-visible"
// // //               }`}
// // //             >
// // //               <div
// // //                 className={`transition-all duration-300 ${
// // //                   sidebarCollapsed
// // //                     ? "opacity-0 invisible"
// // //                     : "opacity-100 visible w-80 xl:w-96"
// // //                 }`}
// // //               >
// // //                 <FilterSidebar />
// // //               </div>
// // //               {/* Toggle button - positioned at the edge of sidebar */}
// // //               <button
// // //                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
// // //                 className="hidden lg:flex absolute top-1/2 -translate-y-1/2 items-center justify-center bg-white border border-gray-200 rounded-r-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
// // //                 style={{
// // //                   right: "-36px",
// // //                   width: "36px",
// // //                   height: "72px",
// // //                   zIndex: 10,
// // //                 }}
// // //                 data-testid="button-toggle-sidebar-home"
// // //                 title={
// // //                   sidebarCollapsed
// // //                     ? t("filters.showFilters")
// // //                     : t("filters.hideFilters")
// // //                 }
// // //               >
// // //                 {sidebarCollapsed ? (
// // //                   <ChevronRight className="w-6 h-6 text-gray-600" />
// // //                 ) : (
// // //                   <ChevronLeft className="w-6 h-6 text-gray-600" />
// // //                 )}
// // //               </button>
// // //             </aside>

// // //             {/* Show toggle button when sidebar is collapsed */}
// // //             {sidebarCollapsed && (
// // //               <button
// // //                 onClick={() => setSidebarCollapsed(false)}
// // //                 className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 items-center justify-center bg-white border border-gray-200 rounded-r-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
// // //                 style={{
// // //                   width: "36px",
// // //                   height: "72px",
// // //                   zIndex: 10,
// // //                 }}
// // //                 data-testid="button-toggle-sidebar-home-collapsed"
// // //                 title={t("filters.showFilters")}
// // //               >
// // //                 <ChevronRight className="w-6 h-6 text-gray-600" />
// // //               </button>
// // //             )}

// // //             <div className="flex-1">
// // //               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-10">
// // //                 {isLoading ? (
// // //                   <div className="col-span-2 text-center py-12">
// // //                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
// // //                     <p className="mt-4 text-muted-foreground">
// // //                       {t("detail.loading")}
// // //                     </p>
// // //                   </div>
// // //                 ) : featuredCars.length === 0 ? (
// // //                   <div className="col-span-2 text-center py-12">
// // //                     <p className="text-muted-foreground">
// // //                       {t("detail.notFound")}
// // //                     </p>
// // //                   </div>
// // //                 ) : (
// // //                   featuredCars.map((car, index) => {
// // //                     const listing = paginatedListings.find(
// // //                       (l) => l.id === car.id
// // //                     );
// // //                     const isOwner = Boolean(
// // //                       user && listing && listing.userId === user.id
// // //                     );
// // //                     return (
// // //                       <CarCard
// // //                         key={car.id}
// // //                         {...car}
// // //                         priority={index < 4}
// // //                         isOwner={isOwner}
// // //                         onDelete={handleDelete}
// // //                       />
// // //                     );
// // //                   })
// // //                 )}
// // //               </div>

// // //               {/* Pagination */}
// // //               {totalPages > 1 && (
// // //                 <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
// // //                   <Button
// // //                     variant="outline"
// // //                     size="icon"
// // //                     onClick={() => goToPage(1)}
// // //                     disabled={currentPage === 1}
// // //                     data-testid="button-pagination-first"
// // //                   >
// // //                     <ChevronsLeft className="h-4 w-4" />
// // //                   </Button>
// // //                   <Button
// // //                     variant="outline"
// // //                     size="icon"
// // //                     onClick={() => goToPage(Math.max(1, currentPage - 1))}
// // //                     disabled={currentPage === 1}
// // //                     data-testid="button-pagination-prev"
// // //                   >
// // //                     <ChevronLeft className="h-4 w-4" />
// // //                   </Button>

// // //                   <div className="flex items-center gap-1">
// // //                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
// // //                       let pageNum: number;
// // //                       if (totalPages <= 5) {
// // //                         pageNum = i + 1;
// // //                       } else if (currentPage <= 3) {
// // //                         pageNum = i + 1;
// // //                       } else if (currentPage >= totalPages - 2) {
// // //                         pageNum = totalPages - 4 + i;
// // //                       } else {
// // //                         pageNum = currentPage - 2 + i;
// // //                       }
// // //                       return (
// // //                         <Button
// // //                           key={pageNum}
// // //                           variant={
// // //                             currentPage === pageNum ? "default" : "outline"
// // //                           }
// // //                           size="icon"
// // //                           onClick={() => goToPage(pageNum)}
// // //                           data-testid={`button-pagination-${pageNum}`}
// // //                         >
// // //                           {pageNum}
// // //                         </Button>
// // //                       );
// // //                     })}
// // //                   </div>

// // //                   <Button
// // //                     variant="outline"
// // //                     size="icon"
// // //                     onClick={() =>
// // //                       goToPage(Math.min(totalPages, currentPage + 1))
// // //                     }
// // //                     disabled={currentPage === totalPages}
// // //                     data-testid="button-pagination-next"
// // //                   >
// // //                     <ChevronRight className="h-4 w-4" />
// // //                   </Button>
// // //                   <Button
// // //                     variant="outline"
// // //                     size="icon"
// // //                     onClick={() => goToPage(totalPages)}
// // //                     disabled={currentPage === totalPages}
// // //                     data-testid="button-pagination-last"
// // //                   >
// // //                     <ChevronsRight className="h-4 w-4" />
// // //                   </Button>
// // //                 </div>
// // //               )}

// // //               {/* Showing X of Y */}
// // //               {!isLoading && sortedListings.length > 0 && (
// // //                 <p className="text-center text-sm text-muted-foreground mt-4">
// // //                   {t("listings.showing")} {startIndex + 1}-
// // //                   {Math.min(startIndex + ITEMS_PER_PAGE, sortedListings.length)}{" "}
// // //                   {t("listings.of")} {sortedListings.length}
// // //                 </p>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </section>

// // //         <section className="bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16 lg:py-24 content-auto">
// // //           <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
// // //             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-3 sm:mb-4 lg:mb-6">
// // //               {t("home.why")}
// // //             </h2>
// // //             <p className="text-base sm:text-lg lg:text-xl text-primary mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
// // //               {t("home.connectingBuyers")}
// // //             </p>

// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
// // //               <div className="space-y-4 sm:space-y-6">
// // //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// // //                   1
// // //                 </div>
// // //                 <h3 className="text-xl sm:text-2xl font-semibold">
// // //                   {t("home.verifiedListings")}
// // //                 </h3>
// // //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// // //                   {t("home.verifiedDescription")}
// // //                 </p>
// // //               </div>

// // //               <div className="space-y-4 sm:space-y-6">
// // //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// // //                   2
// // //                 </div>
// // //                 <h3 className="text-xl sm:text-2xl font-semibold">
// // //                   {t("home.secureTransactions")}
// // //                 </h3>
// // //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// // //                   {t("home.secureDescription")}
// // //                 </p>
// // //               </div>

// // //               <div className="space-y-4 sm:space-y-6">
// // //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// // //                   3
// // //                 </div>
// // //                 <h3 className="text-xl sm:text-2xl font-semibold">
// // //                   {t("home.simpleUse")}
// // //                 </h3>
// // //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// // //                   {t("home.simpleDescription")}
// // //                 </p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </section>
// // //       </main>

// // //       <Footer />

// // //       {/* Delete Confirmation Dialog */}
// // //       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
// // //         <AlertDialogContent>
// // //           <AlertDialogHeader>
// // //             <AlertDialogTitle>
// // //               {t("listing.deleteConfirmTitle")}
// // //             </AlertDialogTitle>
// // //             <AlertDialogDescription>
// // //               {t("listing.deleteConfirmDescription")}
// // //             </AlertDialogDescription>
// // //           </AlertDialogHeader>
// // //           <AlertDialogFooter>
// // //             <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
// // //             <AlertDialogAction
// // //               onClick={confirmDelete}
// // //               className="bg-red-500 hover:bg-red-600"
// // //             >
// // //               {t("listing.deleteButton")}
// // //             </AlertDialogAction>
// // //           </AlertDialogFooter>
// // //         </AlertDialogContent>
// // //       </AlertDialog>
// // //     </div>
// // //   );
// // // }
// // // src/pages/HomePage.tsx
// // import { useEffect, useMemo, useRef, useState } from "react";
// // import Header from "@/components/Header";
// // import Hero from "@/components/Hero";
// // import FilterSidebar from "@/components/FilterSidebar";
// // import MobileFilters from "@/components/MobileFilters";
// // import CarCard from "@/components/CarCard";
// // import Footer from "@/components/Footer";
// // import {
// //   SEO,
// //   generateOrganizationSchema,
// //   generateWebsiteSchema,
// // } from "@/components/SEO";
// // import { Button } from "@/components/ui/button";
// // import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// // import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
// // import { formatDistanceToNow } from "date-fns";
// // import { cs, uk, enUS } from "date-fns/locale";
// // import { useLanguage } from "@/contexts/LanguageContext";
// // import { useLocation } from "wouter";
// // import {
// //   ChevronLeft,
// //   ChevronRight,
// //   ChevronsLeft,
// //   ChevronsRight,
// // } from "lucide-react";
// // import type { Listing } from "@shared/schema";
// // import { useAuth } from "@/hooks/useAuth";
// // import { apiRequest, queryClient } from "@/lib/queryClient";
// // import { useToast } from "@/hooks/use-toast";
// // import {
// //   AlertDialog,
// //   AlertDialogAction,
// //   AlertDialogCancel,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";

// // import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// // import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// // import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// // import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// // import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// // // Map of body types to images
// // const bodyTypeImages: Record<string, string> = {
// //   sedan: sedanImage,
// //   suv: suvImage,
// //   coupe: sportsImage,
// //   hatchback: hatchbackImage,
// //   pickup: truckImage,
// // };

// // function PageLoader() {
// //   return (
// //     <div className="flex items-center justify-center min-h-[40vh]">
// //       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
// //     </div>
// //   );
// // }

// // type Pagination = {
// //   page: number;
// //   limit: number;
// //   total: number;
// //   totalPages: number;
// //   hasMore: boolean;
// // };

// // type ListingsResponse = {
// //   listings: Listing[];
// //   pagination: Pagination;
// // };

// // const ITEMS_PER_PAGE = 12;

// // function getPageFromUrl(): number {
// //   const sp = new URLSearchParams(window.location.search);
// //   const raw = sp.get("page");
// //   const n = raw ? Number(raw) : 1;
// //   if (!Number.isFinite(n) || n < 1) return 1;
// //   return Math.floor(n);
// // }

// // function setPageToUrl(page: number) {
// //   const url = new URL(window.location.href);
// //   if (page <= 1) url.searchParams.delete("page");
// //   else url.searchParams.set("page", String(page));
// //   window.history.replaceState({}, "", url.toString());
// // }

// // export default function HomePage() {
// //   const t = useTranslation();
// //   const { language } = useLanguage();
// //   const localizedOptions = useLocalizedOptions();
// //   const [, navigate] = useLocation();

// //   const { user } = useAuth();
// //   const { toast } = useToast();

// //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// //   const [deletingListingId, setDeletingListingId] = useState<string | null>(
// //     null
// //   );

// //   // page state synced with URL
// //   const [currentPage, setCurrentPage] = useState<number>(() =>
// //     getPageFromUrl()
// //   );

// //   // if user navigates back/forward, keep in sync
// //   useEffect(() => {
// //     const onPop = () => setCurrentPage(getPageFromUrl());
// //     window.addEventListener("popstate", onPop);
// //     return () => window.removeEventListener("popstate", onPop);
// //   }, []);

// //   const goToPage = (page: number, totalPages?: number) => {
// //     const clamped =
// //       totalPages && totalPages > 0
// //         ? Math.min(Math.max(1, page), totalPages)
// //         : Math.max(1, page);

// //     setCurrentPage(clamped);
// //     setPageToUrl(clamped);
// //   };

// //   const recommendedSectionRef = useRef<HTMLElement>(null);
// //   const isFirstRender = useRef(true);

// //   useEffect(() => {
// //     if (isFirstRender.current) {
// //       isFirstRender.current = false;
// //       return;
// //     }
// //     recommendedSectionRef.current?.scrollIntoView({
// //       behavior: "smooth",
// //       block: "start",
// //     });
// //   }, [currentPage]);

// //   const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

// //   const fuelLabels = useMemo(
// //     () => ({
// //       benzin: t("hero.benzin"),
// //       diesel: t("hero.diesel"),
// //       hybrid: t("hero.hybrid"),
// //       electric: t("hero.electric"),
// //       lpg: t("hero.lpg"),
// //       cng: t("hero.cng"),
// //     }),
// //     [t, language]
// //   );

// //   const transmissionLabels = useMemo(
// //     () => ({
// //       manual: t("filters.manual"),
// //       automatic: t("filters.automatic"),
// //       robot: t("filters.robot"),
// //       cvt: t("filters.cvt"),
// //     }),
// //     [t, language]
// //   );

// //   const regions = useMemo(
// //     () => localizedOptions.getRegions(),
// //     [localizedOptions, language]
// //   );

// //   // ✅ server-side pagination + sorting
// //   const listUrl = useMemo(() => {
// //     const sp = new URLSearchParams();
// //     sp.set("page", String(currentPage));
// //     sp.set("limit", String(ITEMS_PER_PAGE));
// //     sp.set("sort", "top"); // backend: isTopListing desc, createdAt desc
// //     // якщо зробиш легкий payload на бекові — дуже бажано:
// //     // sp.set("fields", "card");
// //     return `/api/listings?${sp.toString()}`;
// //   }, [currentPage]);

// //   const { data, isLoading, isFetching } = useQuery<ListingsResponse>({
// //     queryKey: ["listings", currentPage, ITEMS_PER_PAGE],
// //     queryFn: async () => {
// //       const res = await fetch(listUrl, { credentials: "include" });
// //       if (!res.ok) throw new Error(`Failed to load listings: ${res.status}`);
// //       return res.json();
// //     },
// //     placeholderData: keepPreviousData,
// //     staleTime: 30_000,
// //     gcTime: 5 * 60_000,
// //     refetchOnWindowFocus: false,
// //   });

// //   const listings = data?.listings ?? [];
// //   const pagination = data?.pagination;
// //   const totalPages = pagination?.totalPages ?? 1;
// //   const total = pagination?.total ?? listings.length;
// //   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

// //   // Prefetch next page (nice UX)
// //   useEffect(() => {
// //     if (!pagination) return;
// //     if (currentPage >= totalPages) return;

// //     const nextPage = currentPage + 1;
// //     const sp = new URLSearchParams();
// //     sp.set("page", String(nextPage));
// //     sp.set("limit", String(ITEMS_PER_PAGE));
// //     sp.set("sort", "top");
// //     const nextUrl = `/api/listings?${sp.toString()}`;

// //     queryClient.prefetchQuery({
// //       queryKey: ["listings", nextPage, ITEMS_PER_PAGE],
// //       queryFn: async () => {
// //         const res = await fetch(nextUrl, { credentials: "include" });
// //         if (!res.ok) throw new Error("prefetch failed");
// //         return res.json();
// //       },
// //       staleTime: 30_000,
// //     });
// //   }, [pagination, currentPage, totalPages]);

// //   const deleteMutation = useMutation({
// //     mutationFn: async (listingId: string) => {
// //       await apiRequest("DELETE", `/api/listings/${listingId}`);
// //     },
// //     onSuccess: () => {
// //       queryClient.invalidateQueries({ queryKey: ["listings"] });
// //       toast({
// //         title: t("listing.deleteSuccess"),
// //         description: t("listing.deleteSuccessDescription"),
// //       });
// //       setDeleteDialogOpen(false);
// //       setDeletingListingId(null);
// //     },
// //     onError: () => {
// //       toast({
// //         title: t("listing.deleteError"),
// //         variant: "destructive",
// //       });
// //     },
// //   });

// //   const handleDelete = (id: string) => {
// //     setDeletingListingId(id);
// //     setDeleteDialogOpen(true);
// //   };

// //   const confirmDelete = () => {
// //     if (deletingListingId) deleteMutation.mutate(deletingListingId);
// //   };

// //   const cards = useMemo(() => {
// //     const currentYear = new Date().getFullYear();

// //     return listings.map((listing) => {
// //       const regionLabel =
// //         regions.find((r) => r.value === listing.region)?.label ||
// //         listing.region ||
// //         "";

// //       // image: first uploaded photo or fallback by bodyType
// //       let image = sedanImage;
// //       const firstPhoto = listing.photos?.[0];

// //       if (typeof firstPhoto === "string") {
// //         const trimmed = firstPhoto.trim();
// //         if (trimmed) {
// //           const photoPath = trimmed.replace(/^\/+/, "");
// //           image = `/objects/${photoPath}`;
// //         } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
// //           image = bodyTypeImages[listing.bodyType];
// //         }
// //       } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
// //         image = bodyTypeImages[listing.bodyType];
// //       }

// //       const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
// //         addSuffix: true,
// //         locale: dateLocale,
// //       });

// //       let condition =
// //         listing.year === currentYear ? t("filters.new") : t("filters.used");
// //       if (listing.isTopListing) condition = t("detail.topListing");

// //       const fuelType = listing.fuelType?.[0] || "";
// //       const transmission = listing.transmission?.[0] || "";

// //       const photos = (listing.photos || [])
// //         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
// //         .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

// //       const isOwner = Boolean(user && listing.userId === user.id);

// //       return {
// //         listing,
// //         props: {
// //           id: listing.id,
// //           image,
// //           photos,
// //           title: listing.title,
// //           price: Number(listing.price),
// //           year: listing.year,
// //           mileage: listing.mileage,
// //           fuel: fuelType
// //             ? fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType
// //             : "-",
// //           transmission: transmission
// //             ? transmissionLabels[
// //                 transmission as keyof typeof transmissionLabels
// //               ] || transmission
// //             : "-",
// //           location: regionLabel,
// //           datePosted,
// //           condition,
// //           isOwner,
// //         },
// //       };
// //     });
// //   }, [listings, regions, dateLocale, t, fuelLabels, transmissionLabels, user]);

// //   const seoDescriptions = {
// //     cs: "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.",
// //     uk: "NNAuto - преміальний маркетплейс для купівлі та продажу автомобілів, мотоциклів та вантажівок у Чеській Республіці. Тисячі перевірених оголошень, розширені фільтри, легкий пошук.",
// //     en: "NNAuto is a premium marketplace for buying and selling cars, motorcycles and trucks in the Czech Republic. Thousands of verified listings, advanced filters, easy search.",
// //   };

// //   const seoTitles = {
// //     cs: "NNAuto - Prémiový Marketplace Aut | Prodej a Nákup Vozidel v ČR",
// //     uk: "NNAuto - Преміальний Маркетплейс Авто | Продаж та Покупка Автомобілів",
// //     en: "NNAuto - Premium Car Marketplace | Buy & Sell Vehicles in Czech Republic",
// //   };

// //   const seoKeywords = {
// //     cs: "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, autobazar online, auto inzeráty, výkup aut, prodej vozidel, auta na prodej",
// //     uk: "продаж авто, купівля авто, авторинок, вживані авто, нові авто, автомобілі, мотоцикли, вантажівки, автобазар, Чехія, NNAuto",
// //     en: "car sales, buy cars, used cars, new cars, automobiles, motorcycles, trucks, car market, Czech Republic, NNAuto, car listings",
// //   };

// //   const organizationSchema = generateOrganizationSchema();
// //   const websiteSchema = generateWebsiteSchema();

// //   return (
// //     <div className="min-h-screen flex flex-col">
// //       <SEO
// //         title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
// //         description={
// //           seoDescriptions[language as keyof typeof seoDescriptions] ||
// //           seoDescriptions.cs
// //         }
// //         keywords={
// //           seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs
// //         }
// //         url="https://nnauto.cz/"
// //         locale={
// //           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
// //         }
// //         alternateLanguages={[
// //           { lang: "cs", url: "https://nnauto.cz/" },
// //           { lang: "uk", url: "https://nnauto.cz/" },
// //           { lang: "en", url: "https://nnauto.cz/" },
// //         ]}
// //         structuredData={{
// //           "@context": "https://schema.org",
// //           "@graph": [organizationSchema, websiteSchema],
// //         }}
// //       />

// //       <Header />
// //       <Hero />

// //       <main className="flex-1">
// //         <section
// //           ref={recommendedSectionRef}
// //           className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-20"
// //         >
// //           <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
// //             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
// //               {t("home.recommended")}
// //             </h2>

// //             <div className="flex items-center gap-2 sm:gap-3">
// //               <MobileFilters />
// //               <Button
// //                 variant="outline"
// //                 className="h-10 px-4 sm:h-12 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base"
// //                 onClick={() => navigate("/listings")}
// //                 data-testid="button-view-all"
// //               >
// //                 <span className="hidden sm:inline">{t("home.viewAll")}</span>
// //                 <span className="sm:hidden">{t("home.viewAll")}</span>
// //               </Button>
// //             </div>
// //           </div>

// //           <div className="flex gap-6 sm:gap-8 lg:gap-12 relative">
// //             <aside
// //               className={`hidden lg:block shrink-0 transition-all duration-300 relative ${
// //                 sidebarCollapsed
// //                   ? "w-0 overflow-hidden"
// //                   : "w-80 xl:w-96 overflow-visible"
// //               }`}
// //             >
// //               <div
// //                 className={`transition-all duration-300 ${
// //                   sidebarCollapsed
// //                     ? "opacity-0 invisible"
// //                     : "opacity-100 visible w-80 xl:w-96"
// //                 }`}
// //               >
// //                 <FilterSidebar />
// //               </div>

// //               <button
// //                 onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
// //                 className="hidden lg:flex absolute top-1/2 -translate-y-1/2 items-center justify-center bg-white border border-gray-200 rounded-r-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
// //                 style={{
// //                   right: "-36px",
// //                   width: "36px",
// //                   height: "72px",
// //                   zIndex: 10,
// //                 }}
// //                 data-testid="button-toggle-sidebar-home"
// //                 title={
// //                   sidebarCollapsed
// //                     ? t("filters.showFilters")
// //                     : t("filters.hideFilters")
// //                 }
// //               >
// //                 {sidebarCollapsed ? (
// //                   <ChevronRight className="w-6 h-6 text-gray-600" />
// //                 ) : (
// //                   <ChevronLeft className="w-6 h-6 text-gray-600" />
// //                 )}
// //               </button>
// //             </aside>

// //             {sidebarCollapsed && (
// //               <button
// //                 onClick={() => setSidebarCollapsed(false)}
// //                 className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 items-center justify-center bg-white border border-gray-200 rounded-r-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
// //                 style={{
// //                   width: "36px",
// //                   height: "72px",
// //                   zIndex: 10,
// //                 }}
// //                 data-testid="button-toggle-sidebar-home-collapsed"
// //                 title={t("filters.showFilters")}
// //               >
// //                 <ChevronRight className="w-6 h-6 text-gray-600" />
// //               </button>
// //             )}

// //             <div className="flex-1">
// //               {isLoading && !data ? (
// //                 <PageLoader />
// //               ) : (
// //                 <>
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 lg:gap-10">
// //                     {cards.length === 0 ? (
// //                       <div className="col-span-2 text-center py-12">
// //                         <p className="text-muted-foreground">
// //                           {t("detail.notFound")}
// //                         </p>
// //                       </div>
// //                     ) : (
// //                       cards.map((c, index) => (
// //                         <CarCard
// //                           key={c.props.id}
// //                           {...c.props}
// //                           priority={index < 4}
// //                           onDelete={handleDelete}
// //                         />
// //                       ))
// //                     )}
// //                   </div>

// //                   {/* Pagination */}
// //                   {totalPages > 1 && (
// //                     <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
// //                       <Button
// //                         variant="outline"
// //                         size="icon"
// //                         onClick={() => goToPage(1, totalPages)}
// //                         disabled={currentPage === 1 || isFetching}
// //                         data-testid="button-pagination-first"
// //                       >
// //                         <ChevronsLeft className="h-4 w-4" />
// //                       </Button>

// //                       <Button
// //                         variant="outline"
// //                         size="icon"
// //                         onClick={() => goToPage(currentPage - 1, totalPages)}
// //                         disabled={currentPage === 1 || isFetching}
// //                         data-testid="button-pagination-prev"
// //                       >
// //                         <ChevronLeft className="h-4 w-4" />
// //                       </Button>

// //                       <div className="flex items-center gap-1">
// //                         {Array.from(
// //                           { length: Math.min(5, totalPages) },
// //                           (_, i) => {
// //                             let pageNum: number;
// //                             if (totalPages <= 5) pageNum = i + 1;
// //                             else if (currentPage <= 3) pageNum = i + 1;
// //                             else if (currentPage >= totalPages - 2)
// //                               pageNum = totalPages - 4 + i;
// //                             else pageNum = currentPage - 2 + i;

// //                             return (
// //                               <Button
// //                                 key={pageNum}
// //                                 variant={
// //                                   currentPage === pageNum
// //                                     ? "default"
// //                                     : "outline"
// //                                 }
// //                                 size="icon"
// //                                 onClick={() => goToPage(pageNum, totalPages)}
// //                                 disabled={isFetching}
// //                                 data-testid={`button-pagination-${pageNum}`}
// //                               >
// //                                 {pageNum}
// //                               </Button>
// //                             );
// //                           }
// //                         )}
// //                       </div>

// //                       <Button
// //                         variant="outline"
// //                         size="icon"
// //                         onClick={() => goToPage(currentPage + 1, totalPages)}
// //                         disabled={currentPage === totalPages || isFetching}
// //                         data-testid="button-pagination-next"
// //                       >
// //                         <ChevronRight className="h-4 w-4" />
// //                       </Button>

// //                       <Button
// //                         variant="outline"
// //                         size="icon"
// //                         onClick={() => goToPage(totalPages, totalPages)}
// //                         disabled={currentPage === totalPages || isFetching}
// //                         data-testid="button-pagination-last"
// //                       >
// //                         <ChevronsRight className="h-4 w-4" />
// //                       </Button>
// //                     </div>
// //                   )}

// //                   {/* Showing X of Y */}
// //                   {total > 0 && (
// //                     <p className="text-center text-sm text-muted-foreground mt-4">
// //                       {t("listings.showing")} {startIndex + 1}-
// //                       {Math.min(startIndex + ITEMS_PER_PAGE, total)}{" "}
// //                       {t("listings.of")} {total}
// //                       {isFetching ? "…" : ""}
// //                     </p>
// //                   )}
// //                 </>
// //               )}
// //             </div>
// //           </div>
// //         </section>

// //         <section className="bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16 lg:py-24 content-auto">
// //           <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
// //             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-3 sm:mb-4 lg:mb-6">
// //               {t("home.why")}
// //             </h2>
// //             <p className="text-base sm:text-lg lg:text-xl text-primary mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
// //               {t("home.connectingBuyers")}
// //             </p>

// //             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
// //               <div className="space-y-4 sm:space-y-6">
// //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// //                   1
// //                 </div>
// //                 <h3 className="text-xl sm:text-2xl font-semibold">
// //                   {t("home.verifiedListings")}
// //                 </h3>
// //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// //                   {t("home.verifiedDescription")}
// //                 </p>
// //               </div>

// //               <div className="space-y-4 sm:space-y-6">
// //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// //                   2
// //                 </div>
// //                 <h3 className="text-xl sm:text-2xl font-semibold">
// //                   {t("home.secureTransactions")}
// //                 </h3>
// //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// //                   {t("home.secureDescription")}
// //                 </p>
// //               </div>

// //               <div className="space-y-4 sm:space-y-6">
// //                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
// //                   3
// //                 </div>
// //                 <h3 className="text-xl sm:text-2xl font-semibold">
// //                   {t("home.simpleUse")}
// //                 </h3>
// //                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
// //                   {t("home.simpleDescription")}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </section>
// //       </main>

// //       <Footer />

// //       {/* Delete Confirmation Dialog */}
// //       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle>
// //               {t("listing.deleteConfirmTitle")}
// //             </AlertDialogTitle>
// //             <AlertDialogDescription>
// //               {t("listing.deleteConfirmDescription")}
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
// //             <AlertDialogAction
// //               onClick={confirmDelete}
// //               className="bg-red-500 hover:bg-red-600"
// //               disabled={deleteMutation.isPending}
// //             >
// //               {t("listing.deleteButton")}
// //             </AlertDialogAction>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </div>
// //   );
// // }
// import { useEffect, useMemo, useRef, useState, useCallback } from "react";
// import Header from "@/components/Header";
// import Hero from "@/components/Hero";
// import FilterSidebar from "@/components/FilterSidebar";
// import MobileFilters from "@/components/MobileFilters";
// import CarCard from "@/components/CarCard";
// import Footer from "@/components/Footer";
// import {
//   SEO,
//   generateOrganizationSchema,
//   generateWebsiteSchema,
// } from "@/components/SEO";
// import { Button } from "@/components/ui/button";
// import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
// import { formatDistanceToNow } from "date-fns";
// import { cs, uk, enUS } from "date-fns/locale";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useLocation } from "wouter";
// import {
//   ChevronLeft,
//   ChevronRight,
//   ChevronsLeft,
//   ChevronsRight,
// } from "lucide-react";
// import type { Listing } from "@shared/schema";
// import { useAuth } from "@/hooks/useAuth";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// // Map of body types to images
// const bodyTypeImages: Record<string, string> = {
//   sedan: sedanImage,
//   suv: suvImage,
//   coupe: sportsImage,
//   hatchback: hatchbackImage,
//   pickup: truckImage,
// };

// function PageLoader() {
//   return (
//     <div className="flex items-center justify-center min-h-[40vh]">
//       <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
//     </div>
//   );
// }

// type Pagination = {
//   page: number;
//   limit: number;
//   total: number;
//   totalPages: number;
//   hasMore: boolean;
// };

// type ListingsResponse = {
//   listings: Listing[];
//   pagination: Pagination;
// };

// const ITEMS_PER_PAGE = 12;

// function getPageFromUrl(): number {
//   const sp = new URLSearchParams(window.location.search);
//   const raw = sp.get("page");
//   const n = raw ? Number(raw) : 1;
//   if (!Number.isFinite(n) || n < 1) return 1;
//   return Math.floor(n);
// }

// function setPageToUrl(page: number) {
//   const url = new URL(window.location.href);
//   if (page <= 1) url.searchParams.delete("page");
//   else url.searchParams.set("page", String(page));
//   window.history.replaceState({}, "", url.toString());
// }

// export default function HomePage() {
//   const t = useTranslation();
//   const { language } = useLanguage();
//   const localizedOptions = useLocalizedOptions();
//   const [, navigate] = useLocation();

//   const { user } = useAuth();
//   const { toast } = useToast();

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deletingListingId, setDeletingListingId] = useState<string | null>(
//     null,
//   );

//   // page state synced with URL
//   const [currentPage, setCurrentPage] = useState<number>(() =>
//     getPageFromUrl(),
//   );

//   // if user navigates back/forward, keep in sync
//   useEffect(() => {
//     const onPop = () => setCurrentPage(getPageFromUrl());
//     window.addEventListener("popstate", onPop);
//     return () => window.removeEventListener("popstate", onPop);
//   }, []);

//   const goToPage = (page: number, totalPages?: number) => {
//     const clamped =
//       totalPages && totalPages > 0
//         ? Math.min(Math.max(1, page), totalPages)
//         : Math.max(1, page);

//     setCurrentPage(clamped);
//     setPageToUrl(clamped);
//   };

//   const recommendedSectionRef = useRef<HTMLElement>(null);
//   const isFirstRender = useRef(true);

//   useEffect(() => {
//     if (isFirstRender.current) {
//       isFirstRender.current = false;
//       return;
//     }
//     recommendedSectionRef.current?.scrollIntoView({
//       behavior: "smooth",
//       block: "start",
//     });
//   }, [currentPage]);

//   const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

//   const fuelLabels = useMemo(
//     () => ({
//       benzin: t("hero.benzin"),
//       diesel: t("hero.diesel"),
//       hybrid: t("hero.hybrid"),
//       electric: t("hero.electric"),
//       lpg: t("hero.lpg"),
//       cng: t("hero.cng"),
//     }),
//     [t, language],
//   );

//   const transmissionLabels = useMemo(
//     () => ({
//       manual: t("filters.manual"),
//       automatic: t("filters.automatic"),
//       robot: t("filters.robot"),
//       cvt: t("filters.cvt"),
//     }),
//     [t, language],
//   );

//   const regions = useMemo(
//     () => localizedOptions.getRegions(),
//     [localizedOptions, language],
//   );

//   // ✅ server-side pagination + sorting
//   const listUrl = useMemo(() => {
//     const sp = new URLSearchParams();
//     sp.set("page", String(currentPage));
//     sp.set("limit", String(ITEMS_PER_PAGE));
//     sp.set("sort", "top"); // backend: isTopListing desc, createdAt desc
//     return `/api/listings?${sp.toString()}`;
//   }, [currentPage]);

//   const { data, isLoading, isFetching } = useQuery<ListingsResponse>({
//     queryKey: ["listings", currentPage, ITEMS_PER_PAGE],
//     queryFn: async () => {
//       const res = await fetch(listUrl, { credentials: "include" });
//       if (!res.ok) throw new Error(`Failed to load listings: ${res.status}`);
//       return res.json();
//     },
//     placeholderData: keepPreviousData,
//     staleTime: 30_000,
//     gcTime: 5 * 60_000,
//     refetchOnWindowFocus: false,
//   });

//   const listings = data?.listings ?? [];
//   const pagination = data?.pagination;
//   const totalPages = pagination?.totalPages ?? 1;
//   const total = pagination?.total ?? listings.length;
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

//   // Prefetch next page
//   useEffect(() => {
//     if (!pagination) return;
//     if (currentPage >= totalPages) return;

//     const nextPage = currentPage + 1;
//     const sp = new URLSearchParams();
//     sp.set("page", String(nextPage));
//     sp.set("limit", String(ITEMS_PER_PAGE));
//     sp.set("sort", "top");
//     const nextUrl = `/api/listings?${sp.toString()}`;

//     queryClient.prefetchQuery({
//       queryKey: ["listings", nextPage, ITEMS_PER_PAGE],
//       queryFn: async () => {
//         const res = await fetch(nextUrl, { credentials: "include" });
//         if (!res.ok) throw new Error("prefetch failed");
//         return res.json();
//       },
//       staleTime: 30_000,
//     });
//   }, [pagination, currentPage, totalPages]);

//   const deleteMutation = useMutation({
//     mutationFn: async (listingId: string) => {
//       await apiRequest("DELETE", `/api/listings/${listingId}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["listings"] });
//       toast({
//         title: t("listing.deleteSuccess"),
//         description: t("listing.deleteSuccessDescription"),
//       });
//       setDeleteDialogOpen(false);
//       setDeletingListingId(null);
//     },
//     onError: () => {
//       toast({
//         title: t("listing.deleteError"),
//         variant: "destructive",
//       });
//     },
//   });

//   const handleDelete = (id: string) => {
//     setDeletingListingId(id);
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = () => {
//     if (deletingListingId) deleteMutation.mutate(deletingListingId);
//   };

//   const cards = useMemo(() => {
//     const currentYear = new Date().getFullYear();

//     return listings.map((listing) => {
//       const regionLabel =
//         regions.find((r) => r.value === listing.region)?.label ||
//         listing.region ||
//         "";

//       // image: first uploaded photo or fallback by bodyType
//       let image = sedanImage;
//       const firstPhoto = listing.photos?.[0];

//       if (typeof firstPhoto === "string") {
//         const trimmed = firstPhoto.trim();
//         if (trimmed) {
//           const photoPath = trimmed.replace(/^\/+/, "");
//           image = `/objects/${photoPath}`;
//         } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
//           image = bodyTypeImages[listing.bodyType];
//         }
//       } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
//         image = bodyTypeImages[listing.bodyType];
//       }

//       const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
//         addSuffix: true,
//         locale: dateLocale,
//       });

//       let condition =
//         listing.year === currentYear ? t("filters.new") : t("filters.used");
//       if (listing.isTopListing) condition = t("detail.topListing");

//       const fuelType = listing.fuelType?.[0] || "";
//       const transmission = listing.transmission?.[0] || "";

//       const photos = (listing.photos || [])
//         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
//         .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

//       const isOwner = Boolean(user && listing.userId === user.id);

//       return {
//         listing,
//         props: {
//           id: listing.id,
//           image,
//           photos,
//           title: listing.title,
//           price: Number(listing.price),
//           year: listing.year,
//           mileage: listing.mileage,
//           fuel: fuelType
//             ? fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType
//             : "-",
//           transmission: transmission
//             ? transmissionLabels[
//                 transmission as keyof typeof transmissionLabels
//               ] || transmission
//             : "-",
//           location: regionLabel,
//           datePosted,
//           condition,
//           isOwner,
//         },
//       };
//     });
//   }, [listings, regions, dateLocale, t, fuelLabels, transmissionLabels, user]);

//   const seoDescriptions = {
//     cs: "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.",
//     uk: "NNAuto - преміальний маркетплейс для купівлі та продажу автомобілів, мотоциклів та вантажівок у Чеській Республіці. Тисячі перевірених оголошень, розширені фільтри, легкий пошук.",
//     en: "NNAuto is a premium marketplace for buying and selling cars, motorcycles and trucks in the Czech Republic. Thousands of verified listings, advanced filters, easy search.",
//   };

//   const seoTitles = {
//     cs: "NNAuto - Prémiový Marketplace Aut | Prodej a Nákup Vozidel v ČR",
//     uk: "NNAuto - Преміальний Маркетплейс Авто | Продаж та Покупка Автомобілів",
//     en: "NNAuto - Premium Car Marketplace | Buy & Sell Vehicles in Czech Republic",
//   };

//   const seoKeywords = {
//     cs: "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, autobazar online, auto inzeráty, výkup aut, prodej vozidel, auta na prodej",
//     uk: "продаж авто, купівля авто, авторинок, вживані авто, нові авто, автомобілі, мотоцикли, вантажівки, автобазар, Чехія, NNAuto",
//     en: "car sales, buy cars, used cars, new cars, automobiles, motorcycles, trucks, car market, Czech Republic, NNAuto, car listings",
//   };

//   const organizationSchema = generateOrganizationSchema();
//   const websiteSchema = generateWebsiteSchema();

//   const toggleSidebar = useCallback(() => {
//     setSidebarCollapsed((v) => !v);
//   }, []);

//   return (
//     <div className="min-h-screen flex flex-col">
//       <SEO
//         title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
//         description={
//           seoDescriptions[language as keyof typeof seoDescriptions] ||
//           seoDescriptions.cs
//         }
//         keywords={
//           seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs
//         }
//         url="https://nnauto.cz/"
//         locale={
//           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
//         }
//         alternateLanguages={[
//           { lang: "cs", url: "https://nnauto.cz/" },
//           { lang: "uk", url: "https://nnauto.cz/" },
//           { lang: "en", url: "https://nnauto.cz/" },
//         ]}
//         structuredData={{
//           "@context": "https://schema.org",
//           "@graph": [organizationSchema, websiteSchema],
//         }}
//       />

//       <Header />
//       <Hero />

//       <main className="flex-1">
//         <section
//           ref={recommendedSectionRef}
//           className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-20"
//         >
//           <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
//             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
//               {t("home.recommended")}
//             </h2>

//             <div className="flex items-center gap-2 sm:gap-3">
//               <MobileFilters />
//               <Button
//                 variant="outline"
//                 className="h-10 px-4 sm:h-12 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base"
//                 onClick={() => navigate("/listings")}
//                 data-testid="button-view-all"
//               >
//                 <span className="hidden sm:inline">{t("home.viewAll")}</span>
//                 <span className="sm:hidden">{t("home.viewAll")}</span>
//               </Button>
//             </div>
//           </div>

//           {/* ✅ LAYOUT: filters | sticky-rail button | products */}
//           <div
//             className="relative grid grid-cols-1 items-start gap-6 sm:gap-8 lg:gap-12"
//             style={{
//               // Only matters on lg+. On mobile it stays one column anyway.
//               // Rail width is always 44px; filters collapse to 0px.
//               // (xl makes filters wider when visible)
//               gridTemplateColumns: undefined,
//             }}
//           >
//             <div
//               className="hidden lg:grid items-start gap-6 sm:gap-8 lg:gap-12"
//               style={{
//                 gridTemplateColumns: sidebarCollapsed
//                   ? "0px 44px 1fr"
//                   : "320px 44px 1fr",
//                 transition: "grid-template-columns 250ms ease",
//               }}
//             >
//               {/* Filters column (NO inner scroll here; page scrolls normally) */}
//               <aside
//                 className={[
//                   "shrink-0 min-w-0",
//                   sidebarCollapsed ? "overflow-hidden" : "overflow-visible",
//                 ].join(" ")}
//               >
//                 <div
//                   className={[
//                     "transition-opacity duration-200",
//                     sidebarCollapsed
//                       ? "opacity-0 pointer-events-none"
//                       : "opacity-100",
//                     // optional: keep it visible while scrolling without internal scroll
//                     "sticky top-24 self-start",
//                   ].join(" ")}
//                 >
//                   <FilterSidebar />
//                 </div>
//               </aside>

//               {/* Sticky rail (always visible between filters and products) */}
//               <div className="flex justify-center">
//                 <div className="sticky top-28 z-30">
//                   <button
//                     onClick={toggleSidebar}
//                     className="flex items-center justify-center bg-white border border-gray-200 rounded-xl shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
//                     style={{ width: 36, height: 72 }}
//                     data-testid="button-toggle-sidebar-home"
//                     title={
//                       sidebarCollapsed
//                         ? t("filters.showFilters")
//                         : t("filters.hideFilters")
//                     }
//                   >
//                     {sidebarCollapsed ? (
//                       <ChevronRight className="w-6 h-6 text-gray-600" />
//                     ) : (
//                       <ChevronLeft className="w-6 h-6 text-gray-600" />
//                     )}
//                   </button>
//                 </div>
//               </div>

//               {/* Products */}
//               <div className="min-w-0">
//                 {isLoading && !data ? (
//                   <PageLoader />
//                 ) : (
//                   <>
//                     <div
//                       className={[
//                         "grid gap-8 sm:gap-10 lg:gap-10",
//                         "grid-cols-1 md:grid-cols-2",
//                         // ✅ when collapsed -> 3 columns on lg+
//                         sidebarCollapsed ? "lg:grid-cols-3" : "lg:grid-cols-2",
//                       ].join(" ")}
//                     >
//                       {cards.length === 0 ? (
//                         <div className="col-span-full text-center py-12">
//                           <p className="text-muted-foreground">
//                             {t("detail.notFound")}
//                           </p>
//                         </div>
//                       ) : (
//                         cards.map((c, index) => (
//                           <CarCard
//                             key={c.props.id}
//                             {...c.props}
//                             priority={index < 4}
//                             onDelete={handleDelete}
//                           />
//                         ))
//                       )}
//                     </div>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                       <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => goToPage(1, totalPages)}
//                           disabled={currentPage === 1 || isFetching}
//                           data-testid="button-pagination-first"
//                         >
//                           <ChevronsLeft className="h-4 w-4" />
//                         </Button>

//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => goToPage(currentPage - 1, totalPages)}
//                           disabled={currentPage === 1 || isFetching}
//                           data-testid="button-pagination-prev"
//                         >
//                           <ChevronLeft className="h-4 w-4" />
//                         </Button>

//                         <div className="flex items-center gap-1">
//                           {Array.from(
//                             { length: Math.min(5, totalPages) },
//                             (_, i) => {
//                               let pageNum: number;
//                               if (totalPages <= 5) pageNum = i + 1;
//                               else if (currentPage <= 3) pageNum = i + 1;
//                               else if (currentPage >= totalPages - 2)
//                                 pageNum = totalPages - 4 + i;
//                               else pageNum = currentPage - 2 + i;

//                               return (
//                                 <Button
//                                   key={pageNum}
//                                   variant={
//                                     currentPage === pageNum
//                                       ? "default"
//                                       : "outline"
//                                   }
//                                   size="icon"
//                                   onClick={() => goToPage(pageNum, totalPages)}
//                                   disabled={isFetching}
//                                   data-testid={`button-pagination-${pageNum}`}
//                                 >
//                                   {pageNum}
//                                 </Button>
//                               );
//                             },
//                           )}
//                         </div>

//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => goToPage(currentPage + 1, totalPages)}
//                           disabled={currentPage === totalPages || isFetching}
//                           data-testid="button-pagination-next"
//                         >
//                           <ChevronRight className="h-4 w-4" />
//                         </Button>

//                         <Button
//                           variant="outline"
//                           size="icon"
//                           onClick={() => goToPage(totalPages, totalPages)}
//                           disabled={currentPage === totalPages || isFetching}
//                           data-testid="button-pagination-last"
//                         >
//                           <ChevronsRight className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     )}

//                     {/* Showing X of Y */}
//                     {total > 0 && (
//                       <p className="text-center text-sm text-muted-foreground mt-4">
//                         {t("listings.showing")} {startIndex + 1}-
//                         {Math.min(startIndex + ITEMS_PER_PAGE, total)}{" "}
//                         {t("listings.of")} {total}
//                         {isFetching ? "…" : ""}
//                       </p>
//                     )}
//                   </>
//                 )}
//               </div>
//             </div>

//             {/* Mobile/tablet (no sidebar column) */}
//             <div className="lg:hidden">
//               {isLoading && !data ? (
//                 <PageLoader />
//               ) : (
//                 <>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
//                     {cards.length === 0 ? (
//                       <div className="col-span-full text-center py-12">
//                         <p className="text-muted-foreground">
//                           {t("detail.notFound")}
//                         </p>
//                       </div>
//                     ) : (
//                       cards.map((c, index) => (
//                         <CarCard
//                           key={c.props.id}
//                           {...c.props}
//                           priority={index < 4}
//                           onDelete={handleDelete}
//                         />
//                       ))
//                     )}
//                   </div>

//                   {totalPages > 1 && (
//                     <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => goToPage(1, totalPages)}
//                         disabled={currentPage === 1 || isFetching}
//                       >
//                         <ChevronsLeft className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => goToPage(currentPage - 1, totalPages)}
//                         disabled={currentPage === 1 || isFetching}
//                       >
//                         <ChevronLeft className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => goToPage(currentPage + 1, totalPages)}
//                         disabled={currentPage === totalPages || isFetching}
//                       >
//                         <ChevronRight className="h-4 w-4" />
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="icon"
//                         onClick={() => goToPage(totalPages, totalPages)}
//                         disabled={currentPage === totalPages || isFetching}
//                       >
//                         <ChevronsRight className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
//           </div>
//         </section>

//         <section className="bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16 lg:py-24 content-auto">
//           <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
//             <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-3 sm:mb-4 lg:mb-6">
//               {t("home.why")}
//             </h2>
//             <p className="text-base sm:text-lg lg:text-xl text-primary mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
//               {t("home.connectingBuyers")}
//             </p>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
//               <div className="space-y-4 sm:space-y-6">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
//                   1
//                 </div>
//                 <h3 className="text-xl sm:text-2xl font-semibold">
//                   {t("home.verifiedListings")}
//                 </h3>
//                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
//                   {t("home.verifiedDescription")}
//                 </p>
//               </div>

//               <div className="space-y-4 sm:space-y-6">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
//                   2
//                 </div>
//                 <h3 className="text-xl sm:text-2xl font-semibold">
//                   {t("home.secureTransactions")}
//                 </h3>
//                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
//                   {t("home.secureDescription")}
//                 </p>
//               </div>

//               <div className="space-y-4 sm:space-y-6">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
//                   3
//                 </div>
//                 <h3 className="text-xl sm:text-2xl font-semibold">
//                   {t("home.simpleUse")}
//                 </h3>
//                 <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
//                   {t("home.simpleDescription")}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </section>
//       </main>

//       <Footer />

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>
//               {t("listing.deleteConfirmTitle")}
//             </AlertDialogTitle>
//             <AlertDialogDescription>
//               {t("listing.deleteConfirmDescription")}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDelete}
//               className="bg-red-500 hover:bg-red-600"
//               disabled={deleteMutation.isPending}
//             >
//               {t("listing.deleteButton")}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilters from "@/components/MobileFilters";
import CarCard from "@/components/CarCard";
import Footer from "@/components/Footer";

import {
  SEO,
  generateOrganizationSchema,
  generateWebsiteSchema,
} from "@/components/SEO";

import { Button } from "@/components/ui/button";
import { useTranslation, useLocalizedOptions } from "@/lib/translations";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

import { formatDistanceToNow } from "date-fns";
import { cs, uk, enUS } from "date-fns/locale";

import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import type { Listing } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getListingMainTitle } from "@/lib/listingTitle";

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

import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

const bodyTypeImages: Record<string, string> = {
  sedan: sedanImage,
  suv: suvImage,
  coupe: sportsImage,
  hatchback: hatchbackImage,
  pickup: truckImage,
};

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type ListingsResponse = {
  listings: Listing[];
  pagination: Pagination;
};

const ITEMS_PER_PAGE = 12;

function getPageFromUrl(): number {
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get("page");
  const n = raw ? Number(raw) : 1;
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

function setPageToUrl(page: number) {
  const url = new URL(window.location.href);
  if (page <= 1) url.searchParams.delete("page");
  else url.searchParams.set("page", String(page));
  window.history.replaceState({}, "", url.toString());
}

export default function HomePage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const localizedOptions = useLocalizedOptions();
  const [, navigate] = useLocation();

  const { user } = useAuth();
  const { toast } = useToast();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(
    null,
  );
  const [openListingId, setOpenListingId] = useState<string | null>(null);

  // ✅ page state synced with URL
  const [currentPage, setCurrentPage] = useState<number>(() =>
    getPageFromUrl(),
  );

  // if user navigates back/forward, keep in sync
  useEffect(() => {
    const onPop = () => setCurrentPage(getPageFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const goToPage = (page: number, totalPages?: number) => {
    const clamped =
      totalPages && totalPages > 0
        ? Math.min(Math.max(1, page), totalPages)
        : Math.max(1, page);

    setCurrentPage(clamped);
    setPageToUrl(clamped);
  };
  const openListingOverlay = useCallback((id: string) => {
    setOpenListingId(id);
  }, []);
  const closeListingOverlay = useCallback(() => {
    setOpenListingId(null);
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "nnauto-close-listing-overlay") {
        closeListingOverlay();
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [closeListingOverlay]);

  const recommendedSectionRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    recommendedSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [currentPage]);

  const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

  const fuelLabels = useMemo(
    () => ({
      benzin: t("hero.benzin"),
      diesel: t("hero.diesel"),
      hybrid: t("hero.hybrid"),
      electric: t("hero.electric"),
      lpg: t("hero.lpg"),
      cng: t("hero.cng"),
    }),
    [t, language],
  );

  const transmissionLabels = useMemo(
    () => ({
      manual: t("filters.manual"),
      automatic: t("filters.automatic"),
      robot: t("filters.robot"),
      cvt: t("filters.cvt"),
    }),
    [t, language],
  );

  const regions = useMemo(
    () => localizedOptions.getRegions(),
    [localizedOptions, language],
  );

  // ✅ server-side pagination + sorting
  const listUrl = useMemo(() => {
    const sp = new URLSearchParams();
    sp.set("page", String(currentPage));
    sp.set("limit", String(ITEMS_PER_PAGE));
    sp.set("sort", "top"); // backend: isTopListing desc, createdAt desc
    return `/api/listings?${sp.toString()}`;
  }, [currentPage]);

  const { data, isLoading, isFetching } = useQuery<ListingsResponse>({
    queryKey: ["listings", currentPage, ITEMS_PER_PAGE],
    queryFn: async () => {
      const res = await fetch(listUrl, { credentials: "include" });
      if (!res.ok) throw new Error(`Failed to load listings: ${res.status}`);
      return res.json();
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const listings = data?.listings ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? listings.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const visiblePages = useMemo(() => {
    const max = 5;
    if (totalPages <= max)
      return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ];
  }, [currentPage, totalPages]);

  // Prefetch next page
  useEffect(() => {
    if (!pagination) return;
    if (currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    const sp = new URLSearchParams();
    sp.set("page", String(nextPage));
    sp.set("limit", String(ITEMS_PER_PAGE));
    sp.set("sort", "top");
    const nextUrl = `/api/listings?${sp.toString()}`;

    queryClient.prefetchQuery({
      queryKey: ["listings", nextPage, ITEMS_PER_PAGE],
      queryFn: async () => {
        const res = await fetch(nextUrl, { credentials: "include" });
        if (!res.ok) throw new Error("prefetch failed");
        return res.json();
      },
      staleTime: 30_000,
    });
  }, [pagination, currentPage, totalPages]);

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      toast({
        title: t("listing.deleteSuccess"),
        description: t("listing.deleteSuccessDescription"),
      });
      setDeleteDialogOpen(false);
      setDeletingListingId(null);
    },
    onError: () => {
      toast({
        title: t("listing.deleteError"),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    setDeletingListingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingListingId) deleteMutation.mutate(deletingListingId);
  };

  const cards = useMemo(() => {
    const currentYear = new Date().getFullYear();

    return listings.map((listing) => {
      const regionLabel =
        regions.find((r) => r.value === listing.region)?.label ||
        listing.region ||
        "";

      // image: first uploaded photo or fallback by bodyType
      let image = sedanImage;
      const firstPhoto = listing.photos?.[0];

      if (typeof firstPhoto === "string") {
        const trimmed = firstPhoto.trim();
        if (trimmed) {
          const photoPath = trimmed.replace(/^\/+/, "");
          image = `/objects/${photoPath}`;
        } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
          image = bodyTypeImages[listing.bodyType];
        }
      } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
        image = bodyTypeImages[listing.bodyType];
      }

      const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
        addSuffix: true,
        locale: dateLocale,
      });

      let condition =
        listing.year === currentYear ? t("filters.new") : t("filters.used");
      if (listing.isTopListing) condition = t("detail.topListing");

      const fuelType = listing.fuelType?.[0] || "";
      const transmission = listing.transmission?.[0] || "";

      const photos = (listing.photos || [])
        .filter((p): p is string => typeof p === "string" && p.trim() !== "")
        .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

      const isOwner = Boolean(user && listing.userId === user.id);

      return {
        listing,
        props: {
          id: listing.id,
          image,
          photos,
          title: getListingMainTitle(listing),
          price: Number(listing.price),
          year: listing.year,
          mileage: listing.mileage,
          fuel: fuelType
            ? fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType
            : "-",
          transmission: transmission
            ? transmissionLabels[
                transmission as keyof typeof transmissionLabels
              ] || transmission
            : "-",
          location: regionLabel,
          datePosted,
          condition,
          isOwner,
        },
      };
    });
  }, [listings, regions, dateLocale, t, fuelLabels, transmissionLabels, user]);

  const seoDescriptions = {
    cs: "NNAuto je prémiový marketplace pro nákup a prodej automobilů, motocyklů a nákladních vozidel v České republice. Tisíce ověřených inzerátů, pokročilé filtry, snadné vyhledávání.",
    uk: "NNAuto - преміальний маркетплейс для купівлі та продажу автомобілів, мотоциклів та вантажівок у Чеській Республіці. Тисячі перевірених оголошень, розширені фільтри, легкий пошук.",
    en: "NNAuto is a premium marketplace for buying and selling cars, motorcycles and trucks in the Czech Republic. Thousands of verified listings, advanced filters, easy search.",
  };

  const seoTitles = {
    cs: "NNAuto - Prémiový Marketplace Aut | Prodej a Nákup Vozidel v ČR",
    uk: "NNAuto - Преміальний Маркетплейс Авто | Продаж та Покупка Автомобілів",
    en: "NNAuto - Premium Car Marketplace | Buy & Sell Vehicles in Czech Republic",
  };

  const seoKeywords = {
    cs: "prodej aut, nákup aut, bazar aut, ojetá auta, nová auta, automobily, motocykly, nákladní vozy, autobazar, Česká republika, NNAuto, autobazar online, auto inzeráty, výkup aut, prodej vozidel, auta na prodej",
    uk: "продаж авто, купівля авто, авторинок, вживані авто, нові авто, автомобілі, мотоцикли, вантажівки, автобазар, Чехія, NNAuto",
    en: "car sales, buy cars, used cars, new cars, automobiles, motorcycles, trucks, car market, Czech Republic, NNAuto, car listings",
  };

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((v) => !v);
  }, []);

  return (
    <div className="min-h-screen flex flex-col home-filters-page">
      {" "}
      <SEO
        title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
        description={
          seoDescriptions[language as keyof typeof seoDescriptions] ||
          seoDescriptions.cs
        }
        keywords={
          seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs
        }
        url="https://nnauto.cz/"
        locale={
          language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
        }
        alternateLanguages={[
          { lang: "cs", url: "https://nnauto.cz/" },
          { lang: "uk", url: "https://nnauto.cz/" },
          { lang: "en", url: "https://nnauto.cz/" },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [organizationSchema, websiteSchema],
        }}
      />
      <Header />
      <Hero />
      <main className="flex-1">
        <section
          ref={recommendedSectionRef}
          className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-8 sm:pb-12 lg:pb-20"
        >
          <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight">
              {t("home.recommended")}
            </h2>

            <div className="flex items-center gap-2 sm:gap-3">
              <MobileFilters />
              <Button
                variant="outline"
                className="h-10 px-4 sm:h-12 sm:px-6 lg:px-8 rounded-lg sm:rounded-xl text-sm sm:text-base"
                onClick={() => navigate("/listings")}
                data-testid="button-view-all"
              >
                <span className="hidden sm:inline">{t("home.viewAll")}</span>
                <span className="sm:hidden">{t("home.viewAll")}</span>
              </Button>
            </div>
          </div>

          {/* ✅ Desktop (кнопка як у першому варіанті: між aside і картками, sticky по центру) */}
          <div className="relative hidden lg:block">
            <div
              className="grid gap-4 xl:gap-6 transition-[grid-template-columns] duration-300"
              style={{
                gridTemplateColumns: sidebarCollapsed
                  ? "0px 36px 1fr"
                  : "minmax(260px, 300px) 36px 1fr",
              }}
            >
              {/* Filters (фон тягнеться донизу: self-stretch + h-full) */}
              <aside
                className={[
                  "self-stretch min-w-0",
                  sidebarCollapsed ? "overflow-hidden" : "overflow-visible",
                ].join(" ")}
              >
                <div
                  className={[
                    "rounded-2xl bg-white dark:bg-background border border-black/5 dark:border-white/10 shadow-sm",
                    "transition-all duration-300",
                    sidebarCollapsed
                      ? "invisible opacity-0 pointer-events-none"
                      : "visible opacity-100",
                  ].join(" ")}
                >
                  <FilterSidebar />
                </div>
              </aside>

              <div className="self-stretch">
                <div className="sticky top-1/2 z-30 -translate-y-1/2">
                  <button
                    onClick={toggleSidebar}
                    className="bg-background-secondary flex h-[72px] w-9 items-center justify-center shadow-lg transition-colors hover:opacity-90"
                    title={
                      sidebarCollapsed
                        ? t("filters.showFilters")
                        : t("filters.hideFilters")
                    }
                    data-testid="button-toggle-sidebar-home"
                  >
                    {sidebarCollapsed ? (
                      <ChevronLeft className="h-6 w-6" />
                    ) : (
                      <ChevronRight className="h-6 w-6" />
                    )}
                  </button>
                </div>
              </div>

              {/* Products */}
              <div className="min-w-0">
                {isLoading && !data ? (
                  <PageLoader />
                ) : (
                  <>
                    <div
                      className={[
                        "grid gap-8 sm:gap-10 lg:gap-8",
                        "grid-cols-1 md:grid-cols-2",
                        sidebarCollapsed ? "lg:grid-cols-3" : "lg:grid-cols-2",
                      ].join(" ")}
                    >
                      {cards.length === 0 ? (
                        <div className="col-span-full text-center py-12">
                          <p className="text-muted-foreground">
                            {t("detail.notFound")}
                          </p>
                        </div>
                      ) : (
                        cards.map((c, index) => (
                          <CarCard
                            key={c.props.id}
                            {...c.props}
                            onOpenListing={openListingOverlay}
                            priority={index < 4}
                            onDelete={handleDelete}
                          />
                        ))
                      )}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => goToPage(1, totalPages)}
                          disabled={currentPage === 1 || isFetching}
                          data-testid="button-pagination-first"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => goToPage(currentPage - 1, totalPages)}
                          disabled={currentPage === 1 || isFetching}
                          data-testid="button-pagination-prev"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum: number;
                              if (totalPages <= 5) pageNum = i + 1;
                              else if (currentPage <= 3) pageNum = i + 1;
                              else if (currentPage >= totalPages - 2)
                                pageNum = totalPages - 4 + i;
                              else pageNum = currentPage - 2 + i;

                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="icon"
                                  onClick={() => goToPage(pageNum, totalPages)}
                                  disabled={isFetching}
                                  data-testid={`button-pagination-${pageNum}`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            },
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => goToPage(currentPage + 1, totalPages)}
                          disabled={currentPage === totalPages || isFetching}
                          data-testid="button-pagination-next"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => goToPage(totalPages, totalPages)}
                          disabled={currentPage === totalPages || isFetching}
                          data-testid="button-pagination-last"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    {/* Showing X of Y */}
                    {total > 0 && (
                      <p className="text-center text-sm text-muted-foreground mt-4">
                        {t("listings.showing")} {startIndex + 1}-
                        {Math.min(startIndex + ITEMS_PER_PAGE, total)}{" "}
                        {t("listings.of")} {total}
                        {isFetching ? "…" : ""}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ✅ Mobile/tablet (без десктоп-сайдбару) */}
          <div className="lg:hidden">
            {isLoading && !data ? (
              <PageLoader />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
                  {cards.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                      <p className="text-muted-foreground">
                        {t("detail.notFound")}
                      </p>
                    </div>
                  ) : (
                    cards.map((c, index) => (
                      <CarCard
                        key={c.props.id}
                        {...c.props}
                        onOpenListing={openListingOverlay}
                        priority={index < 4}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12 flex-wrap">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(1, totalPages)}
                      disabled={currentPage === 1 || isFetching}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage - 1, totalPages)}
                      disabled={currentPage === 1 || isFetching}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* ✅ ЦИФРИ */}
                    <div className="flex items-center gap-1">
                      {visiblePages.map((pageNum) => (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          className="h-10 w-10 text-sm font-semibold" // щоб точно було видно
                          onClick={() => goToPage(pageNum, totalPages)}
                          disabled={isFetching}
                        >
                          {pageNum}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(currentPage + 1, totalPages)}
                      disabled={currentPage === totalPages || isFetching}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(totalPages, totalPages)}
                      disabled={currentPage === totalPages || isFetching}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {openListingId ? (
          <div className="fixed inset-0 z-[100] bg-background">
            <div className="absolute top-2 right-2 z-[101]">
              <Button
                variant="secondary"
                size="sm"
                onClick={closeListingOverlay}
                data-testid="button-close-overlay-home"
              >
                ✕
              </Button>
            </div>
            <iframe
              src={`/listing/${openListingId}?embedded=1`}
              className="w-full h-full border-0 bg-background"
              title="Listing detail"
            />
          </div>
        ) : null}

        <section className="bg-gradient-to-b from-muted/50 to-background py-12 sm:py-16 lg:py-24 content-auto">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight mb-3 sm:mb-4 lg:mb-6">
              {t("home.why")}
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-primary mb-8 sm:mb-12 lg:mb-16 max-w-3xl mx-auto leading-relaxed px-4">
              {t("home.connectingBuyers")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
              <div className="space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
                  1
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">
                  {t("home.verifiedListings")}
                </h3>
                <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
                  {t("home.verifiedDescription")}
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">
                  {t("home.secureTransactions")}
                </h3>
                <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
                  {t("home.secureDescription")}
                </p>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary/80 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto text-primary-foreground text-2xl sm:text-3xl font-semibold shadow-lg">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold">
                  {t("home.simpleUse")}
                </h3>
                <p className="text-sm sm:text-base text-primary leading-relaxed px-4">
                  {t("home.simpleDescription")}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("listing.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("listing.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteMutation.isPending}
            >
              {t("listing.deleteButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
