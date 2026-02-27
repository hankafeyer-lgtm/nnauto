// // // import Header from "@/components/Header";
// // // import FilterSidebar from "@/components/FilterSidebar";
// // // import MobileFilters from "@/components/MobileFilters";
// // // import SortBar from "@/components/SortBar";
// // // import CarCard from "@/components/CarCard";
// // // import Footer from "@/components/Footer";
// // // import { SEO, generateListingsSchema } from "@/components/SEO";
// // // import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// // // import { useQuery, useMutation } from "@tanstack/react-query";
// // // import { apiRequest, queryClient } from "@/lib/queryClient";
// // // import { useAuth } from "@/hooks/useAuth";
// // // import { useToast } from "@/hooks/use-toast";
// // // import { formatDistanceToNow } from "date-fns";
// // // import { cs, uk, enUS } from "date-fns/locale";
// // // import { useLanguage } from "@/contexts/LanguageContext";
// // // import { useFilterParams } from "@/hooks/useFilterParams";
// // // import { Button } from "@/components/ui/button";
// // // import {
// // //   AlertDialog,
// // //   AlertDialogContent,
// // //   AlertDialogDescription,
// // //   AlertDialogFooter,
// // //   AlertDialogHeader,
// // //   AlertDialogTitle,
// // // } from "@/components/ui/alert-dialog";
// // // import { SearchX, Star, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
// // // import { useLocation, useSearch } from "wouter";
// // // import { useState, useMemo, useEffect, lazy, Suspense } from "react";

// // // import {
// // //   Pagination,
// // //   PaginationContent,
// // //   PaginationItem,
// // //   PaginationLink,
// // //   PaginationEllipsis,
// // // } from "@/components/ui/pagination";
// // // import type { Listing } from "@shared/schema";
// // // import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// // // import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// // // import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// // // import electricImage from "@assets/generated_images/Featured_car_electric_fd29e3f9.png";
// // // import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// // // import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// // // const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));

// // // // Map of body types to images
// // // const bodyTypeImages: Record<string, string> = {
// // //   sedan: sedanImage,
// // //   suv: suvImage,
// // //   coupe: sportsImage,
// // //   hatchback: hatchbackImage,
// // //   pickup: truckImage,
// // // };

// // // const ITEMS_PER_PAGE = 20;

// // // interface PaginationInfo {
// // //   total: number;
// // //   page: number;
// // //   limit: number;
// // //   totalPages: number;
// // //   hasMore: boolean;
// // // }

// // // interface ListingsResponse {
// // //   listings: Listing[];
// // //   pagination: PaginationInfo;
// // // }

// // // export default function ListingsPage() {
// // //   const t = useTranslation();
// // //   const { language } = useLanguage();
// // //   const localizedOptions = useLocalizedOptions();
// // //   const { filters, resetFilters } = useFilterParams();
// // //   const [location] = useLocation();
// // //   const { user } = useAuth();
// // //   const { toast } = useToast();
// // //   const [sortBy, setSortBy] = useState("newest");
// // //   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
// // //   const [accumulatedListings, setAccumulatedListings] = useState<Listing[]>([]);
// // //   const [isLoadingMore, setIsLoadingMore] = useState(false);

// // //   // Get current page from URL params (for back button support)
// // //   const urlPageParam = new URLSearchParams(window.location.search).get('page');
// // //   const [currentPage, setCurrentPage] = useState(() => {
// // //     const pageFromUrl = urlPageParam ? parseInt(urlPageParam) : 1;
// // //     return isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;
// // //   });
// // //   const [promotingListingId, setPromotingListingId] = useState<string | null>(null);
// // //   const [editDialogOpen, setEditDialogOpen] = useState(false);
// // //   const [editingListing, setEditingListing] = useState<Listing | null>(null);
// // //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// // //   const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
// // //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// // //   // Use wouter's useSearch hook for reactive search params tracking
// // //   const searchString = useSearch();

// // //   // Extract userId from reactive search params
// // //   const currentUrlParams = new URLSearchParams(searchString);
// // //   const userId = currentUrlParams.get('userId');

// // //   console.log('[ListingsPage] location:', window.location.href);
// // //   console.log('[ListingsPage] userId from URL:', userId);

// // //   // Reset page and accumulated listings when userId changes
// // //   useEffect(() => {
// // //     setCurrentPage(1);
// // //     setAccumulatedListings([]);
// // //   }, [userId]);

// // //   // Handle promotion success/cancel from Stripe redirect
// // //   const promotedParam = currentUrlParams.get('promoted');
// // //   const sessionIdParam = currentUrlParams.get('session_id');
// // //   const [isCompletingPromotion, setIsCompletingPromotion] = useState(false);
// // //   const [promotionProcessed, setPromotionProcessed] = useState(false);

// // //   useEffect(() => {
// // //     const completePromotion = async () => {
// // //       // Complete promotion when session_id is present (with or without promoted=success)
// // //       // This ensures reliability even if Stripe doesn't include the promoted param
// // //       if (sessionIdParam && !isCompletingPromotion && !promotionProcessed) {
// // //         setIsCompletingPromotion(true);

// // //         try {
// // //           // Call the complete-promotion endpoint to verify payment and promote listing
// // //           const res = await apiRequest("POST", "/api/checkout/complete-promotion", {
// // //             stripeSessionId: sessionIdParam,
// // //           });

// // //           const data = await res.json();

// // //           // Check if the response is OK
// // //           if (!res.ok) {
// // //             throw new Error(data.error || "Failed to complete promotion");
// // //           }

// // //           // Verify we got a valid listing back
// // //           if (!data || !data.id) {
// // //             throw new Error("Invalid response from server");
// // //           }

// // //           toast({
// // //             title: t("listings.promoteSuccess"),
// // //             description: t("listings.promoteSuccessDescription"),
// // //           });

// // //           // Invalidate listings cache to show updated TOP status
// // //           queryClient.invalidateQueries({
// // //             predicate: (query) => query.queryKey[0] === '/api/listings',
// // //             refetchType: 'all'
// // //           });
// // //         } catch (error: any) {
// // //           console.error('Error completing promotion:', error);
// // //           toast({
// // //             variant: "destructive",
// // //             title: t("listings.promoteError"),
// // //             description: error.message || t("listings.promoteErrorDescription"),
// // //           });
// // //         }

// // //         // Remove the params from URL
// // //         const newUrl = new URL(window.location.href);
// // //         newUrl.searchParams.delete('promoted');
// // //         newUrl.searchParams.delete('session_id');
// // //         window.history.replaceState({}, '', newUrl.toString());
// // //         setIsCompletingPromotion(false);
// // //         setPromotionProcessed(true);
// // //       } else if (promotedParam === 'cancelled') {
// // //         toast({
// // //           variant: "destructive",
// // //           title: t("listings.promoteCancelled"),
// // //           description: t("listings.promoteCancelledDescription"),
// // //         });
// // //         // Remove the promoted param from URL
// // //         const newUrl = new URL(window.location.href);
// // //         newUrl.searchParams.delete('promoted');
// // //         window.history.replaceState({}, '', newUrl.toString());
// // //       }
// // //     };

// // //     completePromotion();
// // //   }, [promotedParam, sessionIdParam, t, toast, isCompletingPromotion, promotionProcessed]);

// // //   // Mutation to create Stripe checkout session for TOP promotion
// // //   const promoteToTopMutation = useMutation({
// // //     mutationFn: async (listingId: string) => {
// // //       setPromotingListingId(listingId);
// // //       const res = await apiRequest("POST", `/api/listings/${listingId}/checkout`);
// // //       return await res.json();
// // //     },
// // //     onSuccess: (data: { url: string }) => {
// // //       // Redirect to Stripe checkout
// // //       if (data.url) {
// // //         window.location.href = data.url;
// // //       }
// // //     },
// // //     onError: (error: any) => {
// // //       setPromotingListingId(null);
// // //       toast({
// // //         variant: "destructive",
// // //         title: t("listings.promoteError"),
// // //         description: error.message || t("listings.promoteErrorDescription"),
// // //       });
// // //     },
// // //   });

// // //   // Handler for promote button click
// // //   const handlePromote = (listingId: string) => {
// // //     promoteToTopMutation.mutate(listingId);
// // //   };

// // //   // Mutation to delete listing
// // //   const deleteListingMutation = useMutation({
// // //     mutationFn: async (listingId: string) => {
// // //       try {
// // //         const res = await apiRequest("DELETE", `/api/listings/${listingId}`);
// // //         return { ...(await res.json()), deletedId: listingId };
// // //       } catch (error: any) {
// // //         // If 404, the listing is already deleted - treat as success
// // //         if (error.message?.includes('404')) {
// // //           return { message: "Already deleted", deletedId: listingId, alreadyDeleted: true };
// // //         }
// // //         throw error;
// // //       }
// // //     },
// // //     onSuccess: (data) => {
// // //       // Close dialogs first
// // //       setDeleteDialogOpen(false);

// // //       // Clear accumulated listings completely to force fresh data
// // //       setAccumulatedListings([]);

// // //       // Reset to page 1
// // //       setCurrentPage(1);

// // //       // Remove ALL cached listing data and refetch
// // //       queryClient.removeQueries({
// // //         predicate: (query) => query.queryKey[0] === '/api/listings'
// // //       });

// // //       // Clear deletingListingId
// // //       setDeletingListingId(null);

// // //       toast({
// // //         title: t("listing.deleteSuccess"),
// // //         description: t("listing.deleteSuccessDescription"),
// // //       });
// // //     },
// // //     onError: (error: any) => {
// // //       toast({
// // //         variant: "destructive",
// // //         title: t("listing.deleteError"),
// // //         description: error.message || t("listing.deleteErrorDescription"),
// // //       });
// // //       setDeleteDialogOpen(false);
// // //       setDeletingListingId(null);
// // //     },
// // //   });

// // //   // Handler for delete button click - opens confirmation dialog
// // //   const handleDelete = (listingId: string) => {
// // //     setDeletingListingId(listingId);
// // //     setDeleteDialogOpen(true);
// // //   };

// // //   // Handler for confirming delete - directly trigger mutation
// // //   const confirmDelete = () => {
// // //     if (deletingListingId && !deleteListingMutation.isPending) {
// // //       deleteListingMutation.mutate(deletingListingId);
// // //     }
// // //   };

// // //   const queryParams = new URLSearchParams();
// // //   if (userId) queryParams.set('userId', userId);
// // //   if (filters.search) queryParams.set('search', filters.search);
// // //   if (filters.category) queryParams.set('category', filters.category);
// // //   if (filters.vehicleType) queryParams.set('vehicleType', filters.vehicleType);
// // //   if (filters.brand) queryParams.set('brand', filters.brand);
// // //   if (filters.model) queryParams.set('model', filters.model);
// // //   if (filters.priceMin !== undefined) queryParams.set('priceMin', filters.priceMin.toString());
// // //   if (filters.priceMax !== undefined) queryParams.set('priceMax', filters.priceMax.toString());
// // //   if (filters.yearMin !== undefined) queryParams.set('yearMin', filters.yearMin.toString());
// // //   if (filters.yearMax !== undefined) queryParams.set('yearMax', filters.yearMax.toString());
// // //   if (filters.mileageMin !== undefined) queryParams.set('mileageMin', filters.mileageMin.toString());
// // //   if (filters.mileageMax !== undefined) queryParams.set('mileageMax', filters.mileageMax.toString());
// // //   if (filters.fuel) queryParams.set('fuel', filters.fuel);
// // //   if (filters.bodyType && filters.bodyType.length > 0) queryParams.set('bodyType', filters.bodyType.join(','));
// // //   if (filters.transmission) queryParams.set('transmission', filters.transmission);
// // //   if (filters.color) queryParams.set('color', filters.color);
// // //   if (filters.trim) queryParams.set('trim', filters.trim);
// // //   if (filters.region) queryParams.set('region', filters.region);
// // //   if (filters.driveType) queryParams.set('driveType', filters.driveType);
// // //   if (filters.engineMin !== undefined) queryParams.set('engineMin', filters.engineMin.toString());
// // //   if (filters.engineMax !== undefined) queryParams.set('engineMax', filters.engineMax.toString());
// // //   if (filters.powerMin !== undefined) queryParams.set('powerMin', filters.powerMin.toString());
// // //   if (filters.powerMax !== undefined) queryParams.set('powerMax', filters.powerMax.toString());
// // //   if (filters.doorsMin !== undefined) queryParams.set('doorsMin', filters.doorsMin.toString());
// // //   if (filters.doorsMax !== undefined) queryParams.set('doorsMax', filters.doorsMax.toString());
// // //   if (filters.seatsMin !== undefined) queryParams.set('seatsMin', filters.seatsMin.toString());
// // //   if (filters.seatsMax !== undefined) queryParams.set('seatsMax', filters.seatsMax.toString());
// // //   if (filters.ownersMin !== undefined) queryParams.set('ownersMin', filters.ownersMin.toString());
// // //   if (filters.ownersMax !== undefined) queryParams.set('ownersMax', filters.ownersMax.toString());
// // //   if (filters.airbagsMin !== undefined) queryParams.set('airbagsMin', filters.airbagsMin.toString());
// // //   if (filters.airbagsMax !== undefined) queryParams.set('airbagsMax', filters.airbagsMax.toString());
// // //   if (filters.sellerType) queryParams.set('sellerType', filters.sellerType);
// // //   if (filters.listingAgeMin !== undefined) queryParams.set('listingAgeMin', filters.listingAgeMin.toString());
// // //   if (filters.listingAgeMax !== undefined) queryParams.set('listingAgeMax', filters.listingAgeMax.toString());
// // //   if (filters.condition && filters.condition.length > 0) queryParams.set('condition', filters.condition.join(','));
// // //   if (filters.extras && filters.extras.length > 0) queryParams.set('extras', filters.extras.join(','));
// // //   if (filters.equipment && filters.equipment.length > 0) queryParams.set('equipment', filters.equipment.join(','));
// // //   if (filters.vatDeductible) queryParams.set('vatDeductible', 'true');

// // //   // Add pagination params
// // //   queryParams.set('page', currentPage.toString());
// // //   queryParams.set('limit', ITEMS_PER_PAGE.toString());

// // //   const queryString = queryParams.toString();
// // //   const apiUrl = queryString ? `/api/listings?${queryString}` : '/api/listings';

// // //   // Use custom queryFn with stable queryKey for reliable cache invalidation
// // //   // - Custom queryFn uses apiRequest for proper auth credentials (includes session)
// // //   // - Backend handles ownership checks via session, no need for user?.id in queryKey
// // //   // - queryString ensures deterministic caching regardless of filter order
// // //   // - Shared cache across auth states - backend returns correct data based on session
// // //   const { data: response, isLoading } = useQuery<ListingsResponse>({
// // //     queryKey: ['/api/listings', queryString],
// // //     queryFn: async () => {
// // //       const res = await apiRequest('GET', apiUrl);
// // //       return await res.json();
// // //     },
// // //   });

// // //   // Extract listings and pagination from response
// // //   const listings = response?.listings || [];
// // //   const pagination = response?.pagination || { total: 0, page: 1, limit: ITEMS_PER_PAGE, totalPages: 1, hasMore: false };

// // //   // Handle "load more" - accumulate listings across pages
// // //   useEffect(() => {
// // //     if (currentPage === 1) {
// // //       setAccumulatedListings(listings);
// // //     } else if (listings.length > 0 && !isLoading) {
// // //       setAccumulatedListings(prev => {
// // //         // Avoid duplicates by checking if we already have these listings
// // //         const existingIds = new Set(prev.map(l => l.id));
// // //         const newListings = listings.filter(l => !existingIds.has(l.id));
// // //         return [...prev, ...newListings];
// // //       });
// // //     }
// // //     setIsLoadingMore(false);
// // //   }, [listings, currentPage, isLoading]);

// // //   // Load more handler
// // //   const handleLoadMore = () => {
// // //     if (pagination.hasMore) {
// // //       setIsLoadingMore(true);
// // //       setCurrentPage(prev => prev + 1);
// // //     }
// // //   };

// // //   // Go to specific page (replaces accumulated listings)
// // //   const goToPage = (page: number) => {
// // //     setAccumulatedListings([]);
// // //     setCurrentPage(page);

// // //     // Update URL with page param for back button support
// // //     const newUrl = new URL(window.location.href);
// // //     if (page === 1) {
// // //       newUrl.searchParams.delete('page');
// // //     } else {
// // //       newUrl.searchParams.set('page', page.toString());
// // //     }
// // //     window.history.replaceState({}, '', newUrl.toString());

// // //     window.scrollTo({ top: 0, behavior: 'smooth' });
// // //   };

// // //   // Handler for edit button click
// // //   const handleEdit = (listingId: string) => {
// // //     const baseListing = accumulatedListings.length > 0 ? accumulatedListings : listings;
// // //     const listingToEdit = baseListing.find((l: Listing) => l.id === listingId);
// // //     if (listingToEdit) {
// // //       setEditingListing(listingToEdit);
// // //       setEditDialogOpen(true);
// // //     }
// // //   };

// // //   // Get locale for date formatting
// // //   const dateLocale = language === 'cs' ? cs : language === 'uk' ? uk : enUS;

// // //   // Use accumulated listings or current page listings
// // //   // Filter out the listing being deleted for immediate UI feedback
// // //   const displayListings = useMemo(() => {
// // //     const base = accumulatedListings.length > 0 ? accumulatedListings : listings;
// // //     if (deletingListingId) {
// // //       return base.filter(l => l.id !== deletingListingId);
// // //     }
// // //     return base;
// // //   }, [accumulatedListings, listings, deletingListingId]);

// // //   // Sort listings based on selected sort option, but always keep TOP listings first
// // //   const sortedListings = useMemo(() => {
// // //     const sorted = [...displayListings];

// // //     // First apply the selected sort
// // //     switch (sortBy) {
// // //       case "newest":
// // //         sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
// // //         break;
// // //       case "price-asc":
// // //         sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
// // //         break;
// // //       case "price-desc":
// // //         sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
// // //         break;
// // //       case "year-desc":
// // //         sorted.sort((a, b) => b.year - a.year);
// // //         break;
// // //       case "year-asc":
// // //         sorted.sort((a, b) => a.year - b.year);
// // //         break;
// // //       case "mileage-asc":
// // //         sorted.sort((a, b) => a.mileage - b.mileage);
// // //         break;
// // //       case "mileage-desc":
// // //         sorted.sort((a, b) => b.mileage - a.mileage);
// // //         break;
// // //       default:
// // //         break;
// // //     }

// // //     // Then move TOP listings to the front while preserving their relative sort order
// // //     const topListings = sorted.filter(l => l.isTopListing);
// // //     const regularListings = sorted.filter(l => !l.isTopListing);

// // //     return [...topListings, ...regularListings];
// // //   }, [displayListings, sortBy]);

// // //   // Reset page and accumulated listings when filters change (but not on page change)
// // //   const filterQueryString = useMemo(() => {
// // //     const params = new URLSearchParams(queryString);
// // //     params.delete('page');
// // //     params.delete('limit');
// // //     return params.toString();
// // //   }, [queryString]);

// // //   useEffect(() => {
// // //     setCurrentPage(1);
// // //     setAccumulatedListings([]);
// // //   }, [filterQueryString, sortBy]);

// // //   // Generate page numbers for pagination
// // //   const totalPages = pagination.totalPages;
// // //   const getPageNumbers = () => {
// // //     const pages: (number | 'ellipsis')[] = [];
// // //     const maxVisiblePages = 5;

// // //     if (totalPages <= maxVisiblePages) {
// // //       for (let i = 1; i <= totalPages; i++) {
// // //         pages.push(i);
// // //       }
// // //     } else {
// // //       if (currentPage <= 3) {
// // //         for (let i = 1; i <= 4; i++) {
// // //           pages.push(i);
// // //         }
// // //         pages.push('ellipsis');
// // //         pages.push(totalPages);
// // //       } else if (currentPage >= totalPages - 2) {
// // //         pages.push(1);
// // //         pages.push('ellipsis');
// // //         for (let i = totalPages - 3; i <= totalPages; i++) {
// // //           pages.push(i);
// // //         }
// // //       } else {
// // //         pages.push(1);
// // //         pages.push('ellipsis');
// // //         pages.push(currentPage - 1);
// // //         pages.push(currentPage);
// // //         pages.push(currentPage + 1);
// // //         pages.push('ellipsis');
// // //         pages.push(totalPages);
// // //       }
// // //     }
// // //     return pages;
// // //   };

// // //   // Memoized label maps for performance (include language for i18n updates)
// // //   const fuelLabels = useMemo(() => ({
// // //     benzin: t("hero.benzin"),
// // //     diesel: t("hero.diesel"),
// // //     hybrid: t("hero.hybrid"),
// // //     electric: t("hero.electric"),
// // //     lpg: t("hero.lpg"),
// // //     cng: t("hero.cng"),
// // //   }), [t, language]);

// // //   const transmissionLabels = useMemo(() => ({
// // //     manual: t("filters.manual"),
// // //     automatic: t("filters.automatic"),
// // //     robot: t("filters.robot"),
// // //     cvt: t("filters.cvt"),
// // //   }), [t, language]);

// // //   // Memoize regions for performance (include language for i18n updates)
// // //   const regions = useMemo(() => localizedOptions.getRegions(), [localizedOptions, language]);

// // //   // Map listings to CarCard props - memoized for performance
// // //   const cars = useMemo(() => {
// // //     return sortedListings.map((listing) => {
// // //       const regionLabel = regions.find(r => r.value === listing.region)?.label || listing.region || "";

// // //       // Get image: use first uploaded photo if available, otherwise fallback to body type image
// // //       let image = sedanImage; // Default fallback
// // //       const firstPhoto = listing.photos?.[0];
// // //       if (typeof firstPhoto === 'string') {
// // //         const trimmedPhoto = firstPhoto.trim();
// // //         if (trimmedPhoto) {
// // //           const photoPath = trimmedPhoto.replace(/^\/+/, '');
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

// // //       // Determine condition based on isTopListing
// // //       let condition = undefined;
// // //       if (listing.isTopListing) {
// // //         condition = t("detail.topListing");
// // //       }

// // //       // Handle array fields - take first element for display
// // //       const fuelType = listing.fuelType?.[0] || '';
// // //       const transmission = listing.transmission?.[0] || '';

// // //       // Prepare all photos with /objects/ prefix
// // //       const photos = (listing.photos || [])
// // //         .filter((p): p is string => typeof p === 'string' && p.trim() !== '')
// // //         .map(p => `/objects/${p.replace(/^\/+/, '')}`);

// // //       return {
// // //         id: listing.id,
// // //         image,
// // //         photos,
// // //         title: listing.title,
// // //         price: parseFloat(listing.price),
// // //         year: listing.year,
// // //         mileage: listing.mileage,
// // //         fuel: fuelType ? (fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType) : '-',
// // //         transmission: transmission ? (transmissionLabels[transmission as keyof typeof transmissionLabels] || transmission) : "-",
// // //         location: regionLabel,
// // //         datePosted,
// // //         condition,
// // //       };
// // //     });
// // //   }, [sortedListings, regions, dateLocale, t, fuelLabels, transmissionLabels]);

// // //   // SEO for listings page
// // //   const seoDescriptions = {
// // //     cs: `Prohlédněte si ${pagination.total || ''} inzerátů aut, motocyklů a nákladních vozidel. Pokročilé filtry, snadné vyhledávání. NNAuto - prémiový marketplace vozidel.`,
// // //     uk: `Перегляньте ${pagination.total || ''} оголошень авто, мотоциклів та вантажівок. Розширені фільтри, легкий пошук. NNAuto - преміальний маркетплейс авто.`,
// // //     en: `Browse ${pagination.total || ''} car, motorcycle and truck listings. Advanced filters, easy search. NNAuto - premium vehicle marketplace.`
// // //   };

// // //   const seoTitles = {
// // //     cs: 'Inzeráty vozidel - Auta, Motocykly, Nákladní vozy | NNAuto',
// // //     uk: 'Оголошення автомобілів - Авто, Мотоцикли, Вантажівки | NNAuto',
// // //     en: 'Vehicle Listings - Cars, Motorcycles, Trucks | NNAuto'
// // //   };

// // //   const seoKeywords = {
// // //     cs: 'inzeráty aut, prodej aut, bazar aut, ojetá auta, auto inzeráty, automobily na prodej, motocykly, nákladní vozy, autobazar, NNAuto',
// // //     uk: 'оголошення авто, продаж авто, авторинок, вживані авто, автомобілі, мотоцикли, вантажівки, NNAuto',
// // //     en: 'car listings, car sales, used cars, automobiles for sale, motorcycles, trucks, car market, NNAuto'
// // //   };

// // //   // Generate structured data for listings
// // //   const listingsSchema = sortedListings.length > 0 ? generateListingsSchema(
// // //     sortedListings.slice(0, 20).map((l: Listing) => ({
// // //       id: l.id,
// // //       brand: l.brand,
// // //       model: l.model,
// // //       year: l.year,
// // //       price: Number(l.price),
// // //       photos: l.photos || undefined
// // //     }))
// // //   ) : undefined;

// // //   return (
// // //     <div className="min-h-screen flex flex-col">
// // //       <SEO
// // //         title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
// // //         description={seoDescriptions[language as keyof typeof seoDescriptions] || seoDescriptions.cs}
// // //         keywords={seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs}
// // //         url="https://nnauto.cz/listings"
// // //         locale={language === 'cs' ? 'cs_CZ' : language === 'uk' ? 'uk_UA' : 'en_US'}
// // //         alternateLanguages={[
// // //           { lang: 'cs', url: 'https://nnauto.cz/listings' },
// // //           { lang: 'uk', url: 'https://nnauto.cz/listings' },
// // //           { lang: 'en', url: 'https://nnauto.cz/listings' },
// // //         ]}
// // //         structuredData={listingsSchema}
// // //       />
// // //       <Header />

// // //       <div className="border-b bg-card">
// // //         <div className="container mx-auto px-4">
// // //           <div className="flex items-center justify-between py-4 gap-4">
// // //             <div className="lg:hidden">
// // //               <MobileFilters />
// // //             </div>
// // //             <div className="flex-1 lg:flex-none">
// // //               <SortBar
// // //                 listingsCount={pagination.total}
// // //                 sortBy={sortBy}
// // //                 onSortChange={setSortBy}
// // //                 viewMode={viewMode}
// // //                 onViewModeChange={setViewMode}
// // //               />
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="flex-1 container mx-auto px-4 py-6">
// // //         <div className="flex gap-6">
// // //           {/* Sidebar toggle button - fixed position, only visible on lg screens */}
// // //           <button
// // //             onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
// // //             className="hidden lg:flex"
// // //             style={{
// // //               position: 'fixed',
// // //               left: sidebarCollapsed ? '16px' : '400px',
// // //               top: '50%',
// // //               transform: 'translateY(-50%)',
// // //               zIndex: 50,
// // //               width: '36px',
// // //               height: '72px',
// // //               backgroundColor: 'white',
// // //               border: '1px solid #e5e7eb',
// // //               borderRadius: '0 12px 12px 0',
// // //               boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
// // //               cursor: 'pointer',
// // //               alignItems: 'center',
// // //               justifyContent: 'center',
// // //               transition: 'left 0.3s ease',
// // //             }}
// // //             data-testid="button-toggle-sidebar"
// // //             title={sidebarCollapsed ? t("filters.showFilters") : t("filters.hideFilters")}
// // //           >
// // //             {sidebarCollapsed ? (
// // //               <ChevronRight className="w-6 h-6 text-gray-600" />
// // //             ) : (
// // //               <ChevronLeft className="w-6 h-6 text-gray-600" />
// // //             )}
// // //           </button>

// // //           <aside className={`hidden lg:block shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-96'}`}>
// // //             {/* Sidebar content */}
// // //             <div className={`transition-all duration-300 ${sidebarCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible w-96'}`}>
// // //               <FilterSidebar />
// // //             </div>
// // //           </aside>

// // //           <main className="flex-1">
// // //             {cars.length === 0 ? (
// // //               <div className="flex flex-col items-center justify-center py-16 px-4" data-testid="empty-state">
// // //                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
// // //                   <SearchX className="w-10 h-10 text-muted-foreground" />
// // //                 </div>
// // //                 <h3 className="text-2xl font-semibold mb-3" data-testid="text-no-results">
// // //                   {t("listings.noResults")}
// // //                 </h3>
// // //                 <p className="text-muted-foreground text-center mb-8 max-w-md">
// // //                   {t("listings.noResultsDescription")}
// // //                 </p>
// // //                 <Button
// // //                   onClick={resetFilters}
// // //                   variant="outline"
// // //                   size="lg"
// // //                   data-testid="button-reset-filters"
// // //                 >
// // //                   {t("listings.resetFilters")}
// // //                 </Button>
// // //               </div>
// // //             ) : (
// // //               <>
// // //                 <div className={viewMode === "grid"
// // //                   ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
// // //                   : "flex flex-col gap-8"
// // //                 }>
// // //                   {cars.map((car, index) => {
// // //                     const listing = sortedListings.find(l => l.id === car.id);
// // //                     // Check ownership by comparing listing.userId with logged-in user
// // //                     // This works regardless of URL parameters
// // //                     const isOwner = Boolean(user && listing && listing.userId === user.id);
// // //                     const isTopListing = Boolean(listing?.isTopListing);
// // //                     const isPromoting = promotingListingId === car.id;

// // //                     return (
// // //                       <CarCard
// // //                         key={car.id}
// // //                         {...car}
// // //                         viewMode={viewMode}
// // //                         isOwner={isOwner}
// // //                         isTopListing={isTopListing}
// // //                         onPromote={handlePromote}
// // //                         isPromoting={isPromoting}
// // //                         onEdit={handleEdit}
// // //                         onDelete={handleDelete}
// // //                         priority={index < 3}
// // //                       />
// // //                     );
// // //                   })}
// // //                 </div>

// // //                 {/* Load More Button */}
// // //                 {pagination.hasMore && (
// // //                   <div className="mt-8 flex justify-center">
// // //                     <Button
// // //                       variant="outline"
// // //                       size="lg"
// // //                       onClick={handleLoadMore}
// // //                       disabled={isLoadingMore || isLoading}
// // //                       className="min-w-[200px]"
// // //                       data-testid="button-load-more"
// // //                     >
// // //                       {isLoadingMore ? (
// // //                         <span className="flex items-center gap-2">
// // //                           <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
// // //                           {t("listings.loading")}
// // //                         </span>
// // //                       ) : (
// // //                         language === 'cs' ? 'Další inzeráty' :
// // //                         language === 'uk' ? 'Більше оголошень' :
// // //                         'Load more listings'
// // //                       )}
// // //                     </Button>
// // //                   </div>
// // //                 )}

// // //                 {/* Page Number Navigation */}
// // //                 {totalPages > 1 && (
// // //                   <div className="mt-6 flex justify-center">
// // //                     <Pagination>
// // //                       <PaginationContent>
// // //                         <PaginationItem>
// // //                           <Button
// // //                             variant="ghost"
// // //                             size="icon"
// // //                             onClick={() => goToPage(Math.max(1, currentPage - 1))}
// // //                             disabled={currentPage === 1}
// // //                             data-testid="button-prev-page"
// // //                           >
// // //                             <ChevronLeft className="h-4 w-4" />
// // //                           </Button>
// // //                         </PaginationItem>

// // //                         {getPageNumbers().map((page, index) => (
// // //                           <PaginationItem key={index}>
// // //                             {page === 'ellipsis' ? (
// // //                               <PaginationEllipsis />
// // //                             ) : (
// // //                               <PaginationLink
// // //                                 onClick={() => goToPage(page)}
// // //                                 isActive={currentPage === page}
// // //                                 className="cursor-pointer"
// // //                                 data-testid={`button-page-${page}`}
// // //                               >
// // //                                 {page}
// // //                               </PaginationLink>
// // //                             )}
// // //                           </PaginationItem>
// // //                         ))}

// // //                         <PaginationItem>
// // //                           <Button
// // //                             variant="ghost"
// // //                             size="icon"
// // //                             onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
// // //                             disabled={currentPage === totalPages}
// // //                             data-testid="button-next-page"
// // //                           >
// // //                             <ChevronRight className="h-4 w-4" />
// // //                           </Button>
// // //                         </PaginationItem>
// // //                       </PaginationContent>
// // //                     </Pagination>
// // //                   </div>
// // //                 )}

// // //                 {/* Showing count */}
// // //                 {pagination.total > 0 && (
// // //                   <div className="mt-4 text-center text-sm text-muted-foreground">
// // //                     {language === 'cs' ? `Zobrazeno ${sortedListings.length} z ${pagination.total} inzerátů` :
// // //                      language === 'uk' ? `Показано ${sortedListings.length} з ${pagination.total} оголошень` :
// // //                      `Showing ${sortedListings.length} of ${pagination.total} listings`}
// // //                   </div>
// // //                 )}
// // //               </>
// // //             )}
// // //           </main>
// // //         </div>
// // //       </div>

// // //       <Footer />

// // //       {/* Edit Listing Dialog */}
// // //       {editingListing && (
// // //         <Suspense fallback={null}>
// // //           <EditListingDialog
// // //             open={editDialogOpen}
// // //             onOpenChange={(open: boolean) => {
// // //               setEditDialogOpen(open);
// // //               if (!open) setEditingListing(null);
// // //             }}
// // //             listing={editingListing}
// // //           />
// // //         </Suspense>
// // //       )}

// // //       {/* Delete Confirmation Dialog */}
// // //       <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
// // //         if (!deleteListingMutation.isPending) {
// // //           setDeleteDialogOpen(open);
// // //           if (!open) setDeletingListingId(null);
// // //         }
// // //       }}>
// // //         <AlertDialogContent>
// // //           <AlertDialogHeader>
// // //             <AlertDialogTitle data-testid="dialog-delete-title">
// // //               {t("listing.deleteConfirmTitle")}
// // //             </AlertDialogTitle>
// // //             <AlertDialogDescription data-testid="dialog-delete-description">
// // //               {t("listing.deleteConfirmDescription")}
// // //             </AlertDialogDescription>
// // //           </AlertDialogHeader>
// // //           <AlertDialogFooter>
// // //             <Button
// // //               variant="outline"
// // //               onClick={() => {
// // //                 setDeleteDialogOpen(false);
// // //                 setDeletingListingId(null);
// // //               }}
// // //               disabled={deleteListingMutation.isPending}
// // //               data-testid="button-delete-cancel"
// // //             >
// // //               {t("listing.deleteCancelButton")}
// // //             </Button>
// // //             <Button
// // //               variant="destructive"
// // //               onClick={confirmDelete}
// // //               disabled={deleteListingMutation.isPending}
// // //               data-testid="button-delete-confirm"
// // //             >
// // //               {deleteListingMutation.isPending ? (
// // //                 <span className="flex items-center gap-2">
// // //                   <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
// // //                   {t("listing.deleting")}
// // //                 </span>
// // //               ) : (
// // //                 t("listing.deleteConfirmButton")
// // //               )}
// // //             </Button>
// // //           </AlertDialogFooter>
// // //         </AlertDialogContent>
// // //       </AlertDialog>
// // //     </div>
// // //   );
// // // }
// // import Header from "@/components/Header";
// // import FilterSidebar from "@/components/FilterSidebar";
// // import MobileFilters from "@/components/MobileFilters";
// // import SortBar from "@/components/SortBar";
// // import CarCard from "@/components/CarCard";
// // import Footer from "@/components/Footer";
// // import { SEO, generateListingsSchema } from "@/components/SEO";
// // import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// // import { useQuery, useMutation } from "@tanstack/react-query";
// // import { apiRequest, queryClient } from "@/lib/queryClient";
// // import { useAuth } from "@/hooks/useAuth";
// // import { useToast } from "@/hooks/use-toast";
// // import { formatDistanceToNow } from "date-fns";
// // import { cs, uk, enUS } from "date-fns/locale";
// // import { useLanguage } from "@/contexts/LanguageContext";
// // import { useFilterParams } from "@/hooks/useFilterParams";
// // import { Button } from "@/components/ui/button";
// // import {
// //   AlertDialog,
// //   AlertDialogContent,
// //   AlertDialogDescription,
// //   AlertDialogFooter,
// //   AlertDialogHeader,
// //   AlertDialogTitle,
// // } from "@/components/ui/alert-dialog";
// // import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
// // import { useSearch } from "wouter";
// // import {
// //   useState,
// //   useMemo,
// //   useEffect,
// //   lazy,
// //   Suspense,
// //   useRef,
// //   useCallback,
// // } from "react";

// // import {
// //   Pagination,
// //   PaginationContent,
// //   PaginationItem,
// //   PaginationLink,
// //   PaginationEllipsis,
// // } from "@/components/ui/pagination";

// // import type { Listing } from "@shared/schema";
// // import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// // import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// // import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// // import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// // import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// // const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));

// // const bodyTypeImages: Record<string, string> = {
// //   sedan: sedanImage,
// //   suv: suvImage,
// //   coupe: sportsImage,
// //   hatchback: hatchbackImage,
// //   pickup: truckImage,
// // };

// // const ITEMS_PER_PAGE = 20;

// // interface PaginationInfo {
// //   total: number;
// //   page: number;
// //   limit: number;
// //   totalPages: number;
// //   hasMore: boolean;
// // }

// // interface ListingsResponse {
// //   listings: Listing[];
// //   pagination: PaginationInfo;
// // }

// // // ---------- URL helpers ----------
// // const safeWindow = () => (typeof window !== "undefined" ? window : null);

// // const readPageFromSearch = (searchString: string) => {
// //   const params = new URLSearchParams(searchString || "");
// //   const raw = params.get("page");
// //   const n = raw ? Number(raw) : 1;
// //   return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
// // };

// // const updateUrlPageParam = (
// //   page: number,
// //   mode: "push" | "replace" = "push"
// // ) => {
// //   const w = safeWindow();
// //   if (!w) return;

// //   const url = new URL(w.location.href);
// //   if (page <= 1) url.searchParams.delete("page");
// //   else url.searchParams.set("page", String(page));

// //   if (mode === "push") w.history.pushState({}, "", url.toString());
// //   else w.history.replaceState({}, "", url.toString());

// //   // notify wouter/useSearch listeners
// //   w.dispatchEvent(new PopStateEvent("popstate"));
// // };

// // const replaceUrlParams = (mutate: (params: URLSearchParams) => void) => {
// //   const w = safeWindow();
// //   if (!w) return;

// //   const url = new URL(w.location.href);
// //   mutate(url.searchParams);
// //   w.history.replaceState({}, "", url.toString());
// //   w.dispatchEvent(new PopStateEvent("popstate"));
// // };

// // export default function ListingsPage() {
// //   const t = useTranslation();
// //   const { language } = useLanguage();
// //   const localizedOptions = useLocalizedOptions();
// //   const { filters, resetFilters } = useFilterParams();
// //   const { user } = useAuth();
// //   const { toast } = useToast();

// //   const searchString = useSearch();
// //   const currentUrlParams = useMemo(
// //     () => new URLSearchParams(searchString),
// //     [searchString]
// //   );
// //   const userId = currentUrlParams.get("userId");

// //   const [sortBy, setSortBy] = useState("newest");
// //   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

// //   // current page must always be in sync with URL
// //   const [currentPage, setCurrentPage] = useState(() =>
// //     readPageFromSearch(safeWindow()?.location.search || "")
// //   );

// //   const [accumulatedListings, setAccumulatedListings] = useState<Listing[]>([]);
// //   const [isLoadingMore, setIsLoadingMore] = useState(false);

// //   const [promotingListingId, setPromotingListingId] = useState<string | null>(
// //     null
// //   );
// //   const [editDialogOpen, setEditDialogOpen] = useState(false);
// //   const [editingListing, setEditingListing] = useState<Listing | null>(null);

// //   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
// //   const [deletingListingId, setDeletingListingId] = useState<string | null>(
// //     null
// //   );

// //   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// //   // Sync currentPage when URL search changes (back/forward/manual change)
// //   useEffect(() => {
// //     const pageFromUrl = readPageFromSearch(searchString);
// //     setCurrentPage((prev) => (prev === pageFromUrl ? prev : pageFromUrl));
// //     // when navigating via back/forward we should not keep old accumulated list
// //     setAccumulatedListings([]);
// //     setIsLoadingMore(false);
// //   }, [searchString]);

// //   // Reset page/list when userId changes
// //   useEffect(() => {
// //     setCurrentPage(1);
// //     setAccumulatedListings([]);
// //     setIsLoadingMore(false);
// //     updateUrlPageParam(1, "replace");
// //   }, [userId]);

// //   // Handle promotion success/cancel from Stripe redirect
// //   const promotedParam = currentUrlParams.get("promoted");
// //   const sessionIdParam = currentUrlParams.get("session_id");
// //   const [isCompletingPromotion, setIsCompletingPromotion] = useState(false);
// //   const [promotionProcessed, setPromotionProcessed] = useState(false);

// //   useEffect(() => {
// //     const completePromotion = async () => {
// //       if (sessionIdParam && !isCompletingPromotion && !promotionProcessed) {
// //         setIsCompletingPromotion(true);

// //         try {
// //           const res = await apiRequest(
// //             "POST",
// //             "/api/checkout/complete-promotion",
// //             {
// //               stripeSessionId: sessionIdParam,
// //             }
// //           );

// //           const data = await res.json();

// //           if (!res.ok)
// //             throw new Error(data.error || "Failed to complete promotion");
// //           if (!data || !data.id)
// //             throw new Error("Invalid response from server");

// //           toast({
// //             title: t("listings.promoteSuccess"),
// //             description: t("listings.promoteSuccessDescription"),
// //           });

// //           queryClient.invalidateQueries({
// //             predicate: (query) => query.queryKey[0] === "/api/listings",
// //             refetchType: "all",
// //           });
// //         } catch (error: any) {
// //           console.error("Error completing promotion:", error);
// //           toast({
// //             variant: "destructive",
// //             title: t("listings.promoteError"),
// //             description: error.message || t("listings.promoteErrorDescription"),
// //           });
// //         }

// //         // remove params from URL
// //         replaceUrlParams((p) => {
// //           p.delete("promoted");
// //           p.delete("session_id");
// //         });

// //         setIsCompletingPromotion(false);
// //         setPromotionProcessed(true);
// //       } else if (promotedParam === "cancelled") {
// //         toast({
// //           variant: "destructive",
// //           title: t("listings.promoteCancelled"),
// //           description: t("listings.promoteCancelledDescription"),
// //         });

// //         replaceUrlParams((p) => {
// //           p.delete("promoted");
// //         });
// //       }
// //     };

// //     completePromotion();
// //   }, [
// //     promotedParam,
// //     sessionIdParam,
// //     t,
// //     toast,
// //     isCompletingPromotion,
// //     promotionProcessed,
// //   ]);

// //   // Mutation to create Stripe checkout session for TOP promotion
// //   const promoteToTopMutation = useMutation({
// //     mutationFn: async (listingId: string) => {
// //       setPromotingListingId(listingId);
// //       const res = await apiRequest(
// //         "POST",
// //         `/api/listings/${listingId}/checkout`
// //       );
// //       return await res.json();
// //     },
// //     onSuccess: (data: { url: string }) => {
// //       if (data.url) window.location.href = data.url;
// //     },
// //     onError: (error: any) => {
// //       setPromotingListingId(null);
// //       toast({
// //         variant: "destructive",
// //         title: t("listings.promoteError"),
// //         description: error.message || t("listings.promoteErrorDescription"),
// //       });
// //     },
// //   });

// //   const handlePromote = (listingId: string) =>
// //     promoteToTopMutation.mutate(listingId);

// //   // Mutation to delete listing
// //   const deleteListingMutation = useMutation({
// //     mutationFn: async (listingId: string) => {
// //       try {
// //         const res = await apiRequest("DELETE", `/api/listings/${listingId}`);
// //         return { ...(await res.json()), deletedId: listingId };
// //       } catch (error: any) {
// //         if (error.message?.includes("404")) {
// //           return {
// //             message: "Already deleted",
// //             deletedId: listingId,
// //             alreadyDeleted: true,
// //           };
// //         }
// //         throw error;
// //       }
// //     },
// //     onSuccess: () => {
// //       setDeleteDialogOpen(false);

// //       setAccumulatedListings([]);
// //       setIsLoadingMore(false);

// //       setCurrentPage(1);
// //       updateUrlPageParam(1, "replace");

// //       queryClient.removeQueries({
// //         predicate: (query) => query.queryKey[0] === "/api/listings",
// //       });

// //       setDeletingListingId(null);

// //       toast({
// //         title: t("listing.deleteSuccess"),
// //         description: t("listing.deleteSuccessDescription"),
// //       });
// //     },
// //     onError: (error: any) => {
// //       toast({
// //         variant: "destructive",
// //         title: t("listing.deleteError"),
// //         description: error.message || t("listing.deleteErrorDescription"),
// //       });
// //       setDeleteDialogOpen(false);
// //       setDeletingListingId(null);
// //     },
// //   });

// //   const handleDelete = (listingId: string) => {
// //     setDeletingListingId(listingId);
// //     setDeleteDialogOpen(true);
// //   };

// //   const confirmDelete = () => {
// //     if (deletingListingId && !deleteListingMutation.isPending) {
// //       deleteListingMutation.mutate(deletingListingId);
// //     }
// //   };

// //   // ---- Build query params (include sort for server-side correct pagination!) ----
// //   const queryParams = new URLSearchParams();

// //   if (userId) queryParams.set("userId", userId);
// //   if (filters.search) queryParams.set("search", filters.search);
// //   if (filters.category) queryParams.set("category", filters.category);
// //   if (filters.vehicleType) queryParams.set("vehicleType", filters.vehicleType);
// //   if (filters.brand) queryParams.set("brand", filters.brand);
// //   if (filters.model) queryParams.set("model", filters.model);
// //   if (filters.priceMin !== undefined)
// //     queryParams.set("priceMin", String(filters.priceMin));
// //   if (filters.priceMax !== undefined)
// //     queryParams.set("priceMax", String(filters.priceMax));
// //   if (filters.yearMin !== undefined)
// //     queryParams.set("yearMin", String(filters.yearMin));
// //   if (filters.yearMax !== undefined)
// //     queryParams.set("yearMax", String(filters.yearMax));
// //   if (filters.mileageMin !== undefined)
// //     queryParams.set("mileageMin", String(filters.mileageMin));
// //   if (filters.mileageMax !== undefined)
// //     queryParams.set("mileageMax", String(filters.mileageMax));
// //   if (filters.fuel) queryParams.set("fuel", filters.fuel);
// //   if (filters.bodyType?.length)
// //     queryParams.set("bodyType", filters.bodyType.join(","));
// //   if (filters.transmission)
// //     queryParams.set("transmission", filters.transmission);
// //   if (filters.color) queryParams.set("color", filters.color);
// //   if (filters.trim) queryParams.set("trim", filters.trim);
// //   if (filters.region) queryParams.set("region", filters.region);
// //   if (filters.driveType) queryParams.set("driveType", filters.driveType);
// //   if (filters.engineMin !== undefined)
// //     queryParams.set("engineMin", String(filters.engineMin));
// //   if (filters.engineMax !== undefined)
// //     queryParams.set("engineMax", String(filters.engineMax));
// //   if (filters.powerMin !== undefined)
// //     queryParams.set("powerMin", String(filters.powerMin));
// //   if (filters.powerMax !== undefined)
// //     queryParams.set("powerMax", String(filters.powerMax));
// //   if (filters.doorsMin !== undefined)
// //     queryParams.set("doorsMin", String(filters.doorsMin));
// //   if (filters.doorsMax !== undefined)
// //     queryParams.set("doorsMax", String(filters.doorsMax));
// //   if (filters.seatsMin !== undefined)
// //     queryParams.set("seatsMin", String(filters.seatsMin));
// //   if (filters.seatsMax !== undefined)
// //     queryParams.set("seatsMax", String(filters.seatsMax));
// //   if (filters.ownersMin !== undefined)
// //     queryParams.set("ownersMin", String(filters.ownersMin));
// //   if (filters.ownersMax !== undefined)
// //     queryParams.set("ownersMax", String(filters.ownersMax));
// //   if (filters.airbagsMin !== undefined)
// //     queryParams.set("airbagsMin", String(filters.airbagsMin));
// //   if (filters.airbagsMax !== undefined)
// //     queryParams.set("airbagsMax", String(filters.airbagsMax));
// //   if (filters.sellerType) queryParams.set("sellerType", filters.sellerType);
// //   if (filters.listingAgeMin !== undefined)
// //     queryParams.set("listingAgeMin", String(filters.listingAgeMin));
// //   if (filters.listingAgeMax !== undefined)
// //     queryParams.set("listingAgeMax", String(filters.listingAgeMax));
// //   if (filters.condition?.length)
// //     queryParams.set("condition", filters.condition.join(","));
// //   if (filters.extras?.length)
// //     queryParams.set("extras", filters.extras.join(","));
// //   if (filters.equipment?.length)
// //     queryParams.set("equipment", filters.equipment.join(","));
// //   if (filters.vatDeductible) queryParams.set("vatDeductible", "true");

// //   // server-side sorting (must be supported by backend)
// //   queryParams.set("sort", sortBy);

// //   // pagination
// //   queryParams.set("page", String(currentPage));
// //   queryParams.set("limit", String(ITEMS_PER_PAGE));

// //   const queryString = queryParams.toString();
// //   const apiUrl = queryString ? `/api/listings?${queryString}` : "/api/listings";

// //   const { data: response, isLoading } = useQuery<ListingsResponse>({
// //     queryKey: ["/api/listings", queryString],
// //     queryFn: async () => {
// //       const res = await apiRequest("GET", apiUrl);
// //       return await res.json();
// //     },
// //   });

// //   const listings = response?.listings || [];
// //   const pagination =
// //     response?.pagination ||
// //     ({
// //       total: 0,
// //       page: 1,
// //       limit: ITEMS_PER_PAGE,
// //       totalPages: 1,
// //       hasMore: false,
// //     } as PaginationInfo);

// //   // Reset page and accumulated listings when filters change (but do NOT kill page on first render)
// //   const didMountRef = useRef(false);

// //   // string to detect filters only (exclude page/limit/sort)
// //   const filterQueryString = useMemo(() => {
// //     const params = new URLSearchParams(queryString);
// //     params.delete("page");
// //     params.delete("limit");
// //     params.delete("sort");
// //     return params.toString();
// //   }, [queryString]);

// //   useEffect(() => {
// //     if (!didMountRef.current) {
// //       didMountRef.current = true;
// //       return;
// //     }

// //     setCurrentPage(1);
// //     setAccumulatedListings([]);
// //     setIsLoadingMore(false);
// //     updateUrlPageParam(1, "replace");
// //   }, [filterQueryString, sortBy]);

// //   // Correct accumulation logic:
// //   // - if Load More: append unique
// //   // - if page navigation/back/filters: replace
// //   useEffect(() => {
// //     if (isLoading) return;

// //     if (isLoadingMore) {
// //       setAccumulatedListings((prev) => {
// //         const existingIds = new Set(prev.map((l) => l.id));
// //         const fresh = listings.filter((l) => !existingIds.has(l.id));
// //         return [...prev, ...fresh];
// //       });
// //     } else {
// //       setAccumulatedListings(listings);
// //     }

// //     setIsLoadingMore(false);
// //   }, [listings, isLoading, isLoadingMore]);

// //   // Clamp page if URL points to page > totalPages
// //   useEffect(() => {
// //     if (isLoading) return;
// //     if (!pagination?.totalPages) return;
// //     if (currentPage > pagination.totalPages) {
// //       setCurrentPage(pagination.totalPages);
// //       setAccumulatedListings([]);
// //       setIsLoadingMore(false);
// //       updateUrlPageParam(pagination.totalPages, "replace");
// //     }
// //   }, [pagination?.totalPages, currentPage, isLoading]);

// //   // Load more handler (keeps URL updated via replace)
// //   const handleLoadMore = () => {
// //     if (!pagination.hasMore || isLoadingMore || isLoading) return;
// //     setIsLoadingMore(true);

// //     setCurrentPage((prev) => {
// //       const next = prev + 1;
// //       updateUrlPageParam(next, "replace");
// //       return next;
// //     });
// //   };

// //   // Go to specific page (pushState, so back button works)
// //   const goToPage = useCallback((page: number) => {
// //     setIsLoadingMore(false);
// //     setAccumulatedListings([]);
// //     setCurrentPage(page);
// //     updateUrlPageParam(page, "push");
// //     safeWindow()?.scrollTo({ top: 0, behavior: "smooth" });
// //   }, []);

// //   const handleEdit = (listingId: string) => {
// //     const listingToEdit = accumulatedListings.find((l) => l.id === listingId);
// //     if (listingToEdit) {
// //       setEditingListing(listingToEdit);
// //       setEditDialogOpen(true);
// //     }
// //   };

// //   const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

// //   // Immediate UI feedback: filter out deleting card
// //   const displayListings = useMemo(() => {
// //     if (!deletingListingId) return accumulatedListings;
// //     return accumulatedListings.filter((l) => l.id !== deletingListingId);
// //   }, [accumulatedListings, deletingListingId]);

// //   // Safety: keep TOP first (stable), but DO NOT client-sort (server must do it)
// //   const sortedListings = useMemo(() => {
// //     const top = displayListings.filter((l) => l.isTopListing);
// //     const rest = displayListings.filter((l) => !l.isTopListing);
// //     return [...top, ...rest];
// //   }, [displayListings]);

// //   const totalPages = pagination.totalPages;

// //   const getPageNumbers = () => {
// //     const pages: (number | "ellipsis")[] = [];
// //     const maxVisiblePages = 5;

// //     if (totalPages <= maxVisiblePages) {
// //       for (let i = 1; i <= totalPages; i++) pages.push(i);
// //       return pages;
// //     }

// //     if (currentPage <= 3) {
// //       pages.push(1, 2, 3, 4, "ellipsis", totalPages);
// //       return pages;
// //     }

// //     if (currentPage >= totalPages - 2) {
// //       pages.push(1, "ellipsis");
// //       for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
// //       return pages;
// //     }

// //     pages.push(
// //       1,
// //       "ellipsis",
// //       currentPage - 1,
// //       currentPage,
// //       currentPage + 1,
// //       "ellipsis",
// //       totalPages
// //     );
// //     return pages;
// //   };

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

// //   const cars = useMemo(() => {
// //     return sortedListings.map((listing) => {
// //       const regionLabel =
// //         regions.find((r) => r.value === listing.region)?.label ||
// //         listing.region ||
// //         "";

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

// //       const condition = listing.isTopListing
// //         ? t("detail.topListing")
// //         : undefined;

// //       const fuelType = listing.fuelType?.[0] || "";
// //       const transmission = listing.transmission?.[0] || "";

// //       const photos = (listing.photos || [])
// //         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
// //         .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

// //       return {
// //         id: listing.id,
// //         image,
// //         photos,
// //         title: listing.title,
// //         price: Number.parseFloat(listing.price),
// //         year: listing.year,
// //         mileage: listing.mileage,
// //         fuel: fuelType
// //           ? fuelLabels[fuelType as keyof typeof fuelLabels] || fuelType
// //           : "-",
// //         transmission: transmission
// //           ? transmissionLabels[
// //               transmission as keyof typeof transmissionLabels
// //             ] || transmission
// //           : "-",
// //         location: regionLabel,
// //         datePosted,
// //         condition,
// //       };
// //     });
// //   }, [sortedListings, regions, dateLocale, t, fuelLabels, transmissionLabels]);

// //   const seoDescriptions = {
// //     cs: `Prohlédněte si ${
// //       pagination.total || ""
// //     } inzerátů aut, motocyklů a nákladních vozidel. Pokročilé filtry, snadné vyhledávání. NNAuto - prémiový marketplace vozidel.`,
// //     uk: `Перегляньте ${
// //       pagination.total || ""
// //     } оголошень авто, мотоциклів та вантажівок. Розширені фільтри, легкий пошук. NNAuto - преміальний маркетплейс авто.`,
// //     en: `Browse ${
// //       pagination.total || ""
// //     } car, motorcycle and truck listings. Advanced filters, easy search. NNAuto - premium vehicle marketplace.`,
// //   };

// //   const seoTitles = {
// //     cs: "Inzeráty vozidel - Auta, Motocykly, Nákladní vozy | NNAuto",
// //     uk: "Оголошення автомобілів - Авто, Мотоцикли, Вантажівки | NNAuto",
// //     en: "Vehicle Listings - Cars, Motorcycles, Trucks | NNAuto",
// //   };

// //   const seoKeywords = {
// //     cs: "inzeráty aut, prodej aut, bazar aut, ojetá auta, auto inzeráty, automobily na prodej, motocykly, nákladní vozy, autobazar, NNAuto",
// //     uk: "оголошення авто, продаж авто, авторинок, вживані авто, автомобілі, мотоцикли, вантажівки, NNAuto",
// //     en: "car listings, car sales, used cars, automobiles for sale, motorcycles, trucks, car market, NNAuto",
// //   };

// //   const listingsSchema =
// //     sortedListings.length > 0
// //       ? generateListingsSchema(
// //           sortedListings.slice(0, 20).map((l: Listing) => ({
// //             id: l.id,
// //             brand: l.brand,
// //             model: l.model,
// //             year: l.year,
// //             price: Number(l.price),
// //             photos: l.photos || undefined,
// //           }))
// //         )
// //       : undefined;

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
// //         url="https://nnauto.cz/listings"
// //         locale={
// //           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
// //         }
// //         alternateLanguages={[
// //           { lang: "cs", url: "https://nnauto.cz/listings" },
// //           { lang: "uk", url: "https://nnauto.cz/listings" },
// //           { lang: "en", url: "https://nnauto.cz/listings" },
// //         ]}
// //         structuredData={listingsSchema}
// //       />

// //       <Header />

// //       <div className="border-b bg-card">
// //         <div className="container mx-auto px-4">
// //           <div className="flex items-center justify-between py-4 gap-4">
// //             <div className="lg:hidden">
// //               <MobileFilters />
// //             </div>
// //             <div className="flex-1 lg:flex-none">
// //               <SortBar
// //                 listingsCount={pagination.total}
// //                 sortBy={sortBy}
// //                 onSortChange={(v) => {
// //                   setSortBy(v);
// //                   // page reset handled by effect (filterQueryString/sortBy)
// //                 }}
// //                 viewMode={viewMode}
// //                 onViewModeChange={setViewMode}
// //               />
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="flex-1 container mx-auto px-4 py-6">
// //         <div className="flex gap-6">
// //           {/* Sidebar toggle button (lg only) */}
// //           <button
// //             onClick={() => setSidebarCollapsed((v) => !v)}
// //             className="hidden lg:flex"
// //             style={{
// //               position: "fixed",
// //               left: sidebarCollapsed ? "16px" : "400px",
// //               top: "50%",
// //               transform: "translateY(-50%)",
// //               zIndex: 50,
// //               width: "36px",
// //               height: "72px",
// //               backgroundColor: "white",
// //               border: "1px solid #e5e7eb",
// //               borderRadius: "0 12px 12px 0",
// //               boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
// //               cursor: "pointer",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               transition: "left 0.3s ease",
// //             }}
// //             data-testid="button-toggle-sidebar"
// //             title={
// //               sidebarCollapsed
// //                 ? t("filters.showFilters")
// //                 : t("filters.hideFilters")
// //             }
// //           >
// //             {sidebarCollapsed ? (
// //               <ChevronRight className="w-6 h-6 text-gray-600" />
// //             ) : (
// //               <ChevronLeft className="w-6 h-6 text-gray-600" />
// //             )}
// //           </button>

// //           <aside
// //             className={`hidden lg:block shrink-0 transition-all duration-300 ${
// //               sidebarCollapsed ? "w-0 overflow-hidden" : "w-96"
// //             }`}
// //           >
// //             <div
// //               className={`transition-all duration-300 ${
// //                 sidebarCollapsed
// //                   ? "opacity-0 invisible"
// //                   : "opacity-100 visible w-96"
// //               }`}
// //             >
// //               <FilterSidebar />
// //             </div>
// //           </aside>

// //           <main className="flex-1">
// //             {cars.length === 0 ? (
// //               <div
// //                 className="flex flex-col items-center justify-center py-16 px-4"
// //                 data-testid="empty-state"
// //               >
// //                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
// //                   <SearchX className="w-10 h-10 text-muted-foreground" />
// //                 </div>
// //                 <h3
// //                   className="text-2xl font-semibold mb-3"
// //                   data-testid="text-no-results"
// //                 >
// //                   {t("listings.noResults")}
// //                 </h3>
// //                 <p className="text-muted-foreground text-center mb-8 max-w-md">
// //                   {t("listings.noResultsDescription")}
// //                 </p>
// //                 <Button
// //                   onClick={resetFilters}
// //                   variant="outline"
// //                   size="lg"
// //                   data-testid="button-reset-filters"
// //                 >
// //                   {t("listings.resetFilters")}
// //                 </Button>
// //               </div>
// //             ) : (
// //               <>
// //                 <div
// //                   className={
// //                     viewMode === "grid"
// //                       ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
// //                       : "flex flex-col gap-8"
// //                   }
// //                 >
// //                   {cars.map((car, index) => {
// //                     const listing = sortedListings.find((l) => l.id === car.id);
// //                     const isOwner = Boolean(
// //                       user && listing && listing.userId === user.id
// //                     );
// //                     const isTopListing = Boolean(listing?.isTopListing);
// //                     const isPromoting = promotingListingId === car.id;

// //                     return (
// //                       <CarCard
// //                         key={car.id}
// //                         {...car}
// //                         viewMode={viewMode}
// //                         isOwner={isOwner}
// //                         isTopListing={isTopListing}
// //                         onPromote={handlePromote}
// //                         isPromoting={isPromoting}
// //                         onEdit={handleEdit}
// //                         onDelete={handleDelete}
// //                         priority={index < 3}
// //                       />
// //                     );
// //                   })}
// //                 </div>

// //                 {/* Load More */}
// //                 {pagination.hasMore && (
// //                   <div className="mt-8 flex justify-center">
// //                     <Button
// //                       variant="outline"
// //                       size="lg"
// //                       onClick={handleLoadMore}
// //                       disabled={isLoadingMore || isLoading}
// //                       className="min-w-[200px]"
// //                       data-testid="button-load-more"
// //                     >
// //                       {isLoadingMore ? (
// //                         <span className="flex items-center gap-2">
// //                           <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
// //                           {t("listings.loading")}
// //                         </span>
// //                       ) : language === "cs" ? (
// //                         "Další inzeráty"
// //                       ) : language === "uk" ? (
// //                         "Більше оголошень"
// //                       ) : (
// //                         "Load more listings"
// //                       )}
// //                     </Button>
// //                   </div>
// //                 )}

// //                 {/* Page Number Navigation */}
// //                 {totalPages > 1 && (
// //                   <div className="mt-6 flex justify-center">
// //                     <Pagination>
// //                       <PaginationContent>
// //                         <PaginationItem>
// //                           <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={() =>
// //                               goToPage(Math.max(1, currentPage - 1))
// //                             }
// //                             disabled={currentPage === 1}
// //                             data-testid="button-prev-page"
// //                           >
// //                             <ChevronLeft className="h-4 w-4" />
// //                           </Button>
// //                         </PaginationItem>

// //                         {getPageNumbers().map((page, index) => (
// //                           <PaginationItem key={index}>
// //                             {page === "ellipsis" ? (
// //                               <PaginationEllipsis />
// //                             ) : (
// //                               <PaginationLink
// //                                 onClick={() => goToPage(page)}
// //                                 isActive={currentPage === page}
// //                                 className="cursor-pointer"
// //                                 data-testid={`button-page-${page}`}
// //                               >
// //                                 {page}
// //                               </PaginationLink>
// //                             )}
// //                           </PaginationItem>
// //                         ))}

// //                         <PaginationItem>
// //                           <Button
// //                             variant="ghost"
// //                             size="icon"
// //                             onClick={() =>
// //                               goToPage(Math.min(totalPages, currentPage + 1))
// //                             }
// //                             disabled={currentPage === totalPages}
// //                             data-testid="button-next-page"
// //                           >
// //                             <ChevronRight className="h-4 w-4" />
// //                           </Button>
// //                         </PaginationItem>
// //                       </PaginationContent>
// //                     </Pagination>
// //                   </div>
// //                 )}

// //                 {/* Showing count */}
// //                 {pagination.total > 0 && (
// //                   <div className="mt-4 text-center text-sm text-muted-foreground">
// //                     {language === "cs"
// //                       ? `Zobrazeno ${sortedListings.length} z ${pagination.total} inzerátů`
// //                       : language === "uk"
// //                       ? `Показано ${sortedListings.length} з ${pagination.total} оголошень`
// //                       : `Showing ${sortedListings.length} of ${pagination.total} listings`}
// //                   </div>
// //                 )}
// //               </>
// //             )}
// //           </main>
// //         </div>
// //       </div>

// //       <Footer />

// //       {/* Edit Listing Dialog */}
// //       {editingListing && (
// //         <Suspense fallback={null}>
// //           <EditListingDialog
// //             open={editDialogOpen}
// //             onOpenChange={(open: boolean) => {
// //               setEditDialogOpen(open);
// //               if (!open) setEditingListing(null);
// //             }}
// //             listing={editingListing}
// //           />
// //         </Suspense>
// //       )}

// //       {/* Delete Confirmation Dialog */}
// //       <AlertDialog
// //         open={deleteDialogOpen}
// //         onOpenChange={(open) => {
// //           if (!deleteListingMutation.isPending) {
// //             setDeleteDialogOpen(open);
// //             if (!open) setDeletingListingId(null);
// //           }
// //         }}
// //       >
// //         <AlertDialogContent>
// //           <AlertDialogHeader>
// //             <AlertDialogTitle data-testid="dialog-delete-title">
// //               {t("listing.deleteConfirmTitle")}
// //             </AlertDialogTitle>
// //             <AlertDialogDescription data-testid="dialog-delete-description">
// //               {t("listing.deleteConfirmDescription")}
// //             </AlertDialogDescription>
// //           </AlertDialogHeader>
// //           <AlertDialogFooter>
// //             <Button
// //               variant="outline"
// //               onClick={() => {
// //                 setDeleteDialogOpen(false);
// //                 setDeletingListingId(null);
// //               }}
// //               disabled={deleteListingMutation.isPending}
// //               data-testid="button-delete-cancel"
// //             >
// //               {t("listing.deleteCancelButton")}
// //             </Button>
// //             <Button
// //               variant="destructive"
// //               onClick={confirmDelete}
// //               disabled={deleteListingMutation.isPending}
// //               data-testid="button-delete-confirm"
// //             >
// //               {deleteListingMutation.isPending ? (
// //                 <span className="flex items-center gap-2">
// //                   <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
// //                   {t("listing.deleting")}
// //                 </span>
// //               ) : (
// //                 t("listing.deleteConfirmButton")
// //               )}
// //             </Button>
// //           </AlertDialogFooter>
// //         </AlertDialogContent>
// //       </AlertDialog>
// //     </div>
// //   );
// // }
// import Header from "@/components/Header";
// import FilterSidebar from "@/components/FilterSidebar";
// import MobileFilters from "@/components/MobileFilters";
// import SortBar from "@/components/SortBar";
// import CarCard from "@/components/CarCard";
// import Footer from "@/components/Footer";

// import { SEO, generateListingsSchema } from "@/components/SEO";
// import { useTranslation, useLocalizedOptions } from "@/lib/translations";

// import { useQuery, useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";

// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useFilterParams } from "@/hooks/useFilterParams";

// import { formatDistanceToNow } from "date-fns";
// import { cs, uk, enUS } from "date-fns/locale";

// import { Button } from "@/components/ui/button";
// import {
//   AlertDialog,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationEllipsis,
// } from "@/components/ui/pagination";

// import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
// import { useSearch } from "wouter";

// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   lazy,
//   Suspense,
// } from "react";

// import type { Listing } from "@shared/schema";

// import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
// import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
// import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
// import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
// import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";

// const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));

// const bodyTypeImages: Record<string, string> = {
//   sedan: sedanImage,
//   suv: suvImage,
//   coupe: sportsImage,
//   hatchback: hatchbackImage,
//   pickup: truckImage,
// };

// const ITEMS_PER_PAGE = 20;

// interface PaginationInfo {
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
//   hasMore: boolean;
// }

// interface ListingsResponse {
//   listings: Listing[];
//   pagination: PaginationInfo;
// }

// /* ---------------- URL helpers ---------------- */
// const safeWindow = () => (typeof window !== "undefined" ? window : null);

// const readPageFromSearch = (searchString: string) => {
//   const params = new URLSearchParams(searchString || "");
//   const raw = params.get("page");
//   const n = raw ? Number(raw) : 1;
//   return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
// };

// const updateUrlPageParam = (page: number, mode: "push" | "replace") => {
//   const w = safeWindow();
//   if (!w) return;

//   const url = new URL(w.location.href);
//   if (page <= 1) url.searchParams.delete("page");
//   else url.searchParams.set("page", String(page));

//   if (mode === "push") w.history.pushState({}, "", url.toString());
//   else w.history.replaceState({}, "", url.toString());

//   w.dispatchEvent(new PopStateEvent("popstate"));
// };

// const replaceUrlParams = (mutate: (params: URLSearchParams) => void) => {
//   const w = safeWindow();
//   if (!w) return;

//   const url = new URL(w.location.href);
//   mutate(url.searchParams);
//   w.history.replaceState({}, "", url.toString());
//   w.dispatchEvent(new PopStateEvent("popstate"));
// };

// /* ---------------- component ---------------- */
// export default function ListingsPage() {
//   const t = useTranslation();
//   const { language } = useLanguage();
//   const localizedOptions = useLocalizedOptions();
//   const { filters, resetFilters } = useFilterParams();
//   const { user } = useAuth();
//   const { toast } = useToast();

//   const searchString = useSearch();
//   const urlParams = useMemo(
//     () => new URLSearchParams(searchString),
//     [searchString],
//   );
//   const userId = urlParams.get("userId");

//   const [sortBy, setSortBy] = useState("newest");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

//   const [currentPage, setCurrentPage] = useState(() =>
//     readPageFromSearch(safeWindow()?.location.search || ""),
//   );

//   const [accumulated, setAccumulated] = useState<Listing[]>([]);
//   const [isLoadingMore, setIsLoadingMore] = useState(false);

//   const [promotingListingId, setPromotingListingId] = useState<string | null>(
//     null,
//   );

//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [editingListing, setEditingListing] = useState<Listing | null>(null);

//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [deletingListingId, setDeletingListingId] = useState<string | null>(
//     null,
//   );

//   /* ----- sync page when url changes ----- */
//   useEffect(() => {
//     const pageFromUrl = readPageFromSearch(searchString);
//     setCurrentPage((prev) => (prev === pageFromUrl ? prev : pageFromUrl));

//     // when user navigates back/forward -> replace accumulated with server page
//     setAccumulated([]);
//     setIsLoadingMore(false);
//   }, [searchString]);

//   /* ----- reset when userId changes ----- */
//   useEffect(() => {
//     setCurrentPage(1);
//     setAccumulated([]);
//     setIsLoadingMore(false);
//     updateUrlPageParam(1, "replace");
//   }, [userId]);

//   /* ----- promotion completion (stripe redirect) ----- */
//   const promotedParam = urlParams.get("promoted");
//   const sessionIdParam = urlParams.get("session_id");
//   const [isCompletingPromotion, setIsCompletingPromotion] = useState(false);
//   const [promotionProcessed, setPromotionProcessed] = useState(false);

//   useEffect(() => {
//     const run = async () => {
//       if (sessionIdParam && !isCompletingPromotion && !promotionProcessed) {
//         setIsCompletingPromotion(true);
//         try {
//           const res = await apiRequest(
//             "POST",
//             "/api/checkout/complete-promotion",
//             {
//               stripeSessionId: sessionIdParam,
//             },
//           );
//           const data = await res.json();
//           if (!res.ok)
//             throw new Error(data?.error || "Failed to complete promotion");

//           toast({
//             title: t("listings.promoteSuccess"),
//             description: t("listings.promoteSuccessDescription"),
//           });

//           queryClient.invalidateQueries({
//             predicate: (q) => q.queryKey[0] === "/api/listings",
//             refetchType: "all",
//           });
//         } catch (e: any) {
//           toast({
//             variant: "destructive",
//             title: t("listings.promoteError"),
//             description: e?.message || t("listings.promoteErrorDescription"),
//           });
//         }

//         replaceUrlParams((p) => {
//           p.delete("promoted");
//           p.delete("session_id");
//         });

//         setIsCompletingPromotion(false);
//         setPromotionProcessed(true);
//       }

//       if (promotedParam === "cancelled") {
//         toast({
//           variant: "destructive",
//           title: t("listings.promoteCancelled"),
//           description: t("listings.promoteCancelledDescription"),
//         });
//         replaceUrlParams((p) => p.delete("promoted"));
//       }
//     };

//     run();
//   }, [
//     promotedParam,
//     sessionIdParam,
//     isCompletingPromotion,
//     promotionProcessed,
//     toast,
//     t,
//   ]);

//   /* ----- mutations ----- */
//   const promoteToTopMutation = useMutation({
//     mutationFn: async (listingId: string) => {
//       setPromotingListingId(listingId);
//       const res = await apiRequest(
//         "POST",
//         `/api/listings/${listingId}/checkout`,
//       );
//       return (await res.json()) as { url?: string };
//     },
//     onSuccess: (data) => {
//       if (data?.url) window.location.href = data.url;
//     },
//     onError: (error: any) => {
//       setPromotingListingId(null);
//       toast({
//         variant: "destructive",
//         title: t("listings.promoteError"),
//         description: error?.message || t("listings.promoteErrorDescription"),
//       });
//     },
//   });

//   const deleteListingMutation = useMutation({
//     mutationFn: async (listingId: string) => {
//       try {
//         const res = await apiRequest("DELETE", `/api/listings/${listingId}`);
//         return { ...(await res.json()), deletedId: listingId };
//       } catch (e: any) {
//         if (e?.message?.includes("404")) {
//           return { deletedId: listingId, alreadyDeleted: true };
//         }
//         throw e;
//       }
//     },
//     onSuccess: () => {
//       setDeleteDialogOpen(false);
//       setDeletingListingId(null);

//       setAccumulated([]);
//       setIsLoadingMore(false);
//       setCurrentPage(1);
//       updateUrlPageParam(1, "replace");

//       queryClient.removeQueries({
//         predicate: (q) => q.queryKey[0] === "/api/listings",
//       });

//       toast({
//         title: t("listing.deleteSuccess"),
//         description: t("listing.deleteSuccessDescription"),
//       });
//     },
//     onError: (error: any) => {
//       setDeleteDialogOpen(false);
//       setDeletingListingId(null);
//       toast({
//         variant: "destructive",
//         title: t("listing.deleteError"),
//         description: error?.message || t("listing.deleteErrorDescription"),
//       });
//     },
//   });

//   const handlePromote = useCallback(
//     (listingId: string) => promoteToTopMutation.mutate(listingId),
//     [promoteToTopMutation],
//   );

//   const handleDelete = (listingId: string) => {
//     setDeletingListingId(listingId);
//     setDeleteDialogOpen(true);
//   };

//   const confirmDelete = () => {
//     if (!deletingListingId || deleteListingMutation.isPending) return;
//     deleteListingMutation.mutate(deletingListingId);
//   };

//   /* ----- build query string (filters + sort + pagination) ----- */
//   const queryString = useMemo(() => {
//     const p = new URLSearchParams();

//     if (userId) p.set("userId", userId);
//     if (filters.search) p.set("search", filters.search);
//     if (filters.category) p.set("category", filters.category);
//     if (filters.vehicleType) p.set("vehicleType", filters.vehicleType);
//     if (filters.brand) p.set("brand", filters.brand);
//     if (filters.model) p.set("model", filters.model);

//     if (filters.priceMin !== undefined)
//       p.set("priceMin", String(filters.priceMin));
//     if (filters.priceMax !== undefined)
//       p.set("priceMax", String(filters.priceMax));
//     if (filters.yearMin !== undefined)
//       p.set("yearMin", String(filters.yearMin));
//     if (filters.yearMax !== undefined)
//       p.set("yearMax", String(filters.yearMax));
//     if (filters.mileageMin !== undefined)
//       p.set("mileageMin", String(filters.mileageMin));
//     if (filters.mileageMax !== undefined)
//       p.set("mileageMax", String(filters.mileageMax));

//     if (filters.fuel) p.set("fuel", filters.fuel);
//     if (filters.bodyType?.length) p.set("bodyType", filters.bodyType.join(","));
//     if (filters.transmission) p.set("transmission", filters.transmission);
//     if (filters.color) p.set("color", filters.color);
//     if (filters.trim) p.set("trim", filters.trim);
//     if (filters.region) p.set("region", filters.region);
//     if (filters.driveType) p.set("driveType", filters.driveType);

//     if (filters.engineMin !== undefined)
//       p.set("engineMin", String(filters.engineMin));
//     if (filters.engineMax !== undefined)
//       p.set("engineMax", String(filters.engineMax));
//     if (filters.powerMin !== undefined)
//       p.set("powerMin", String(filters.powerMin));
//     if (filters.powerMax !== undefined)
//       p.set("powerMax", String(filters.powerMax));

//     if (filters.doorsMin !== undefined)
//       p.set("doorsMin", String(filters.doorsMin));
//     if (filters.doorsMax !== undefined)
//       p.set("doorsMax", String(filters.doorsMax));
//     if (filters.seatsMin !== undefined)
//       p.set("seatsMin", String(filters.seatsMin));
//     if (filters.seatsMax !== undefined)
//       p.set("seatsMax", String(filters.seatsMax));

//     if (filters.ownersMin !== undefined)
//       p.set("ownersMin", String(filters.ownersMin));
//     if (filters.ownersMax !== undefined)
//       p.set("ownersMax", String(filters.ownersMax));

//     if (filters.airbagsMin !== undefined)
//       p.set("airbagsMin", String(filters.airbagsMin));
//     if (filters.airbagsMax !== undefined)
//       p.set("airbagsMax", String(filters.airbagsMax));

//     if (filters.sellerType) p.set("sellerType", filters.sellerType);

//     if (filters.listingAgeMin !== undefined)
//       p.set("listingAgeMin", String(filters.listingAgeMin));
//     if (filters.listingAgeMax !== undefined)
//       p.set("listingAgeMax", String(filters.listingAgeMax));

//     if (filters.condition?.length)
//       p.set("condition", filters.condition.join(","));
//     if (filters.extras?.length) p.set("extras", filters.extras.join(","));
//     if (filters.equipment?.length)
//       p.set("equipment", filters.equipment.join(","));

//     if (filters.vatDeductible) p.set("vatDeductible", "true");

//     // IMPORTANT: server-side sort for correct pagination
//     p.set("sort", sortBy);

//     // pagination
//     p.set("page", String(currentPage));
//     p.set("limit", String(ITEMS_PER_PAGE));

//     return p.toString();
//   }, [filters, userId, sortBy, currentPage]);

//   const apiUrl = useMemo(
//     () => (queryString ? `/api/listings?${queryString}` : "/api/listings"),
//     [queryString],
//   );

//   const { data: response, isLoading } = useQuery<ListingsResponse>({
//     queryKey: ["/api/listings", queryString],
//     queryFn: async () => {
//       const res = await apiRequest("GET", apiUrl);
//       return (await res.json()) as ListingsResponse;
//     },
//   });

//   const listings = response?.listings || [];
//   const pagination: PaginationInfo = response?.pagination || {
//     total: 0,
//     page: 1,
//     limit: ITEMS_PER_PAGE,
//     totalPages: 1,
//     hasMore: false,
//   };
//   // 1) чи є активні фільтри (окрім page/limit/sort) + окремо search/userId теж рахуємо як фільтри
//   const hasActiveFilters = useMemo(() => {
//     // якщо є userId або search в URL — це теж фільтрований режим
//     if (userId) return true;
//     if (filters.search && String(filters.search).trim()) return true;

//     // перевіряємо всі фільтри з useFilterParams
//     for (const [key, val] of Object.entries(filters)) {
//       if (key === "search") continue; // вже перевірили вище

//       if (val === undefined || val === null) continue;

//       // рядки
//       if (typeof val === "string") {
//         if (val.trim() !== "") return true;
//         continue;
//       }

//       // числа (0 теж може бути валідним значенням)
//       if (typeof val === "number") {
//         // якщо це саме фільтр — він активний
//         return true;
//       }

//       // boolean (наприклад vatDeductible)
//       if (typeof val === "boolean") {
//         if (val) return true;
//         continue;
//       }

//       // масиви (bodyType, condition, extras, equipment)
//       if (Array.isArray(val)) {
//         if (val.length > 0) return true;
//         continue;
//       }
//     }

//     return false;
//   }, [filters, userId]);

//   // 2) бонус тільки коли фільтрів немає
//   const DISPLAY_COUNT_BONUS = 98;
//   const countBonus = hasActiveFilters ? 0 : DISPLAY_COUNT_BONUS;

//   // 3) оновлені значення для UI
//   const displayTotal = pagination.total > 0 ? pagination.total + countBonus : 0;

//   /* ----- reset page when filters change (exclude page/limit/sort) ----- */
//   const didMountRef = useRef(false);
//   const filterOnlyKey = useMemo(() => {
//     const p = new URLSearchParams(queryString);
//     p.delete("page");
//     p.delete("limit");
//     p.delete("sort");
//     return p.toString();
//   }, [queryString]);

//   useEffect(() => {
//     if (!didMountRef.current) {
//       didMountRef.current = true;
//       return;
//     }
//     setCurrentPage(1);
//     setAccumulated([]);
//     setIsLoadingMore(false);
//     updateUrlPageParam(1, "replace");
//   }, [filterOnlyKey, sortBy]);

//   /* ----- accumulation ----- */
//   useEffect(() => {
//     if (isLoading) return;

//     if (isLoadingMore) {
//       setAccumulated((prev) => {
//         const ids = new Set(prev.map((l) => l.id));
//         const fresh = listings.filter((l) => !ids.has(l.id));
//         return [...prev, ...fresh];
//       });
//     } else {
//       setAccumulated(listings);
//     }
//     setIsLoadingMore(false);
//   }, [listings, isLoading, isLoadingMore]);

//   /* ----- clamp invalid pages ----- */
//   useEffect(() => {
//     if (isLoading) return;
//     if (!pagination.totalPages) return;

//     if (currentPage > pagination.totalPages) {
//       setCurrentPage(pagination.totalPages);
//       setAccumulated([]);
//       setIsLoadingMore(false);
//       updateUrlPageParam(pagination.totalPages, "replace");
//     }
//   }, [pagination.totalPages, currentPage, isLoading]);

//   const handleLoadMore = () => {
//     if (!pagination.hasMore || isLoading || isLoadingMore) return;
//     setIsLoadingMore(true);

//     setCurrentPage((prev) => {
//       const next = prev + 1;
//       updateUrlPageParam(next, "replace");
//       return next;
//     });
//   };

//   const goToPage = useCallback((page: number) => {
//     setIsLoadingMore(false);
//     setAccumulated([]);
//     setCurrentPage(page);
//     updateUrlPageParam(page, "push");
//     safeWindow()?.scrollTo({ top: 0, behavior: "smooth" });
//   }, []);

//   /* ----- UI helpers ----- */
//   const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

//   const displayListings = useMemo(() => {
//     if (!deletingListingId) return accumulated;
//     return accumulated.filter((l) => l.id !== deletingListingId);
//   }, [accumulated, deletingListingId]);

//   const sortedListings = useMemo(() => {
//     const top = displayListings.filter((l) => l.isTopListing);
//     const rest = displayListings.filter((l) => !l.isTopListing);
//     return [...top, ...rest];
//   }, [displayListings]);

//   const displayShown =
//     sortedListings.length > 0 ? sortedListings.length + countBonus : 0;
//   const listingsById = useMemo(() => {
//     const map = new Map<string, Listing>();
//     for (const l of sortedListings) map.set(l.id, l);
//     return map;
//   }, [sortedListings]);

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

//   const cars = useMemo(() => {
//     return sortedListings.map((listing) => {
//       const regionLabel =
//         regions.find((r) => r.value === listing.region)?.label ||
//         listing.region ||
//         "";

//       let image = sedanImage;
//       const firstPhoto = listing.photos?.[0];

//       if (typeof firstPhoto === "string" && firstPhoto.trim()) {
//         image = `/objects/${firstPhoto.trim().replace(/^\/+/, "")}`;
//       } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
//         image = bodyTypeImages[listing.bodyType];
//       }

//       const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
//         addSuffix: true,
//         locale: dateLocale,
//       });

//       const fuelType = listing.fuelType?.[0] || "";
//       const transmission = listing.transmission?.[0] || "";

//       const photos = (listing.photos || [])
//         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
//         .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

//       return {
//         id: listing.id,
//         image,
//         photos,
//         title: listing.title,
//         price: Number.parseFloat(listing.price),
//         year: listing.year,
//         mileage: listing.mileage,
//         fuel: fuelType ? (fuelLabels as any)[fuelType] || fuelType : "-",
//         transmission: transmission
//           ? (transmissionLabels as any)[transmission] || transmission
//           : "-",
//         location: regionLabel,
//         datePosted,
//         condition: listing.isTopListing ? t("detail.topListing") : undefined,
//       };
//     });
//   }, [sortedListings, regions, dateLocale, t, fuelLabels, transmissionLabels]);

//   const handleEdit = (listingId: string) => {
//     const listing = listingsById.get(listingId);
//     if (!listing) return;
//     setEditingListing(listing);
//     setEditDialogOpen(true);
//   };

//   const totalPages = pagination.totalPages;

//   const getPageNumbers = () => {
//     const pages: (number | "ellipsis")[] = [];
//     const maxVisiblePages = 5;

//     if (totalPages <= maxVisiblePages) {
//       for (let i = 1; i <= totalPages; i++) pages.push(i);
//       return pages;
//     }

//     if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
//     if (currentPage >= totalPages - 2)
//       return [
//         1,
//         "ellipsis",
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];

//     return [
//       1,
//       "ellipsis",
//       currentPage - 1,
//       currentPage,
//       currentPage + 1,
//       "ellipsis",
//       totalPages,
//     ];
//   };

//   /* ----- SEO ----- */
//   const seoDescriptions = {
//     cs: `Prohlédněte si ${pagination.total || ""} inzerátů aut, motocyklů a nákladních vozidel. Pokročilé filtry, snadné vyhledávání. NNAuto - prémiový marketplace vozidel.`,
//     uk: `Перегляньте ${pagination.total || ""} оголошень авто, мотоциклів та вантажівок. Розширені фільтри, легкий пошук. NNAuto - преміальний маркетплейс авто.`,
//     en: `Browse ${pagination.total || ""} car, motorcycle and truck listings. Advanced filters, easy search. NNAuto - premium vehicle marketplace.`,
//   };

//   const seoTitles = {
//     cs: "Inzeráty vozidel - Auta, Motocykly, Nákladní vozy | NNAuto",
//     uk: "Оголошення автомобілів - Авто, Мотоцикли, Вантажівки | NNAuto",
//     en: "Vehicle Listings - Cars, Motorcycles, Trucks | NNAuto",
//   };

//   const seoKeywords = {
//     cs: "inzeráty aut, prodej aut, bazar aut, ojetá auta, auto inzeráty, automobily na prodej, motocykly, nákladní vozy, autobazar, NNAuto",
//     uk: "оголошення авто, продаж авто, авторинок, вживані авто, автомобілі, мотоцикли, вантажівки, NNAuto",
//     en: "car listings, car sales, used cars, automobiles for sale, motorcycles, trucks, car market, NNAuto",
//   };

//   const listingsSchema =
//     sortedListings.length > 0
//       ? generateListingsSchema(
//           sortedListings.slice(0, 20).map((l) => ({
//             id: l.id,
//             brand: l.brand,
//             model: l.model,
//             year: l.year,
//             price: Number(l.price),
//             photos: l.photos || undefined,
//           })),
//         )
//       : undefined;

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
//         url="https://nnauto.cz/listings"
//         locale={
//           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
//         }
//         alternateLanguages={[
//           { lang: "cs", url: "https://nnauto.cz/listings" },
//           { lang: "uk", url: "https://nnauto.cz/listings" },
//           { lang: "en", url: "https://nnauto.cz/listings" },
//         ]}
//         structuredData={listingsSchema}
//       />

//       <Header />

//       {/* Top bar */}
//       <div className="border-b bg-card">
//         <div className="container mx-auto px-4">
//           <div className="flex items-center justify-between gap-4 py-4">
//             <div className="lg:hidden">
//               <MobileFilters />
//             </div>
//             <div className="flex-1 lg:flex-none">
//               <SortBar
//                 listingsCount={displayTotal}
//                 sortBy={sortBy}
//                 onSortChange={setSortBy}
//                 viewMode={viewMode}
//                 onViewModeChange={setViewMode}
//               />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Content */}
//       <div className="flex-1 container mx-auto px-4 py-6">
//         <div className="flex gap-6">
//           {/* Sidebar */}
//           <aside
//             className={[
//               "hidden lg:block shrink-0 transition-[width] duration-300",
//               sidebarCollapsed ? "w-0 overflow-hidden" : "w-96",
//             ].join(" ")}
//           >
//             <div
//               className={[
//                 "transition-opacity duration-200",
//                 sidebarCollapsed
//                   ? "opacity-0 pointer-events-none"
//                   : "opacity-100",
//               ].join(" ")}
//             >
//               <FilterSidebar />
//             </div>
//           </aside>

//           {/* ✅ Toggle button column (НЕ fixed; завжди між aside і main, не залазить у фільтри) */}
//           <div className="hidden lg:block w-0">
//             <div className="sticky top-1/2 -translate-y-1/2 z-40">
//               <button
//                 type="button"
//                 onClick={() => setSidebarCollapsed((v) => !v)}
//                 className={[
//                   "h-16 w-9",
//                   "rounded-xl border bg-background shadow-md",
//                   "flex items-center justify-center",
//                   "hover:bg-muted transition",
//                   // Тонкий мікрозсув у “проміжок” між сайдбаром і контентом:
//                   "-translate-x-1/2",
//                 ].join(" ")}
//                 title={
//                   sidebarCollapsed
//                     ? t("filters.showFilters")
//                     : t("filters.hideFilters")
//                 }
//                 aria-label={
//                   sidebarCollapsed
//                     ? t("filters.showFilters")
//                     : t("filters.hideFilters")
//                 }
//                 data-testid="button-toggle-sidebar"
//               >
//                 {sidebarCollapsed ? (
//                   <ChevronRight className="w-5 h-5 text-muted-foreground" />
//                 ) : (
//                   <ChevronLeft className="w-5 h-5 text-muted-foreground" />
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Main */}
//           <main className="flex-1">
//             {cars.length === 0 ? (
//               <div
//                 className="flex flex-col items-center justify-center py-16 px-4"
//                 data-testid="empty-state"
//               >
//                 <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
//                   <SearchX className="w-10 h-10 text-muted-foreground" />
//                 </div>
//                 <h3
//                   className="text-2xl font-semibold mb-3"
//                   data-testid="text-no-results"
//                 >
//                   {t("listings.noResults")}
//                 </h3>
//                 <p className="text-muted-foreground text-center mb-8 max-w-md">
//                   {t("listings.noResultsDescription")}
//                 </p>
//                 <Button
//                   onClick={resetFilters}
//                   variant="outline"
//                   size="lg"
//                   data-testid="button-reset-filters"
//                 >
//                   {t("listings.resetFilters")}
//                 </Button>
//               </div>
//             ) : (
//               <>
//                 <div
//                   className={
//                     viewMode === "grid"
//                       ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
//                       : "flex flex-col gap-8"
//                   }
//                 >
//                   {cars.map((car, index) => {
//                     const listing = listingsById.get(car.id);
//                     const isOwner = Boolean(
//                       user && listing && listing.userId === user.id,
//                     );
//                     const isTopListing = Boolean(listing?.isTopListing);
//                     const isPromoting = promotingListingId === car.id;

//                     return (
//                       <CarCard
//                         key={car.id}
//                         {...car}
//                         viewMode={viewMode}
//                         isOwner={isOwner}
//                         isTopListing={isTopListing}
//                         onPromote={handlePromote}
//                         isPromoting={isPromoting}
//                         onEdit={handleEdit}
//                         onDelete={handleDelete}
//                         priority={index < 3}
//                       />
//                     );
//                   })}
//                 </div>

//                 {pagination.hasMore && (
//                   <div className="mt-8 flex justify-center">
//                     <Button
//                       variant="outline"
//                       size="lg"
//                       onClick={handleLoadMore}
//                       disabled={isLoadingMore || isLoading}
//                       className="min-w-[200px]"
//                       data-testid="button-load-more"
//                     >
//                       {isLoadingMore ? (
//                         <span className="flex items-center gap-2">
//                           <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
//                           {t("listings.loading")}
//                         </span>
//                       ) : language === "cs" ? (
//                         "Další inzeráty"
//                       ) : language === "uk" ? (
//                         "Більше оголошень"
//                       ) : (
//                         "Load more listings"
//                       )}
//                     </Button>
//                   </div>
//                 )}

//                 {totalPages > 1 && (
//                   <div className="mt-6 flex justify-center">
//                     <Pagination>
//                       <PaginationContent>
//                         <PaginationItem>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() =>
//                               goToPage(Math.max(1, currentPage - 1))
//                             }
//                             disabled={currentPage === 1}
//                             data-testid="button-prev-page"
//                           >
//                             <ChevronLeft className="h-4 w-4" />
//                           </Button>
//                         </PaginationItem>

//                         {getPageNumbers().map((page, index) => (
//                           <PaginationItem key={index}>
//                             {page === "ellipsis" ? (
//                               <PaginationEllipsis />
//                             ) : (
//                               <PaginationLink
//                                 onClick={() => goToPage(page)}
//                                 isActive={currentPage === page}
//                                 className="cursor-pointer"
//                                 data-testid={`button-page-${page}`}
//                               >
//                                 {page}
//                               </PaginationLink>
//                             )}
//                           </PaginationItem>
//                         ))}

//                         <PaginationItem>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() =>
//                               goToPage(Math.min(totalPages, currentPage + 1))
//                             }
//                             disabled={currentPage === totalPages}
//                             data-testid="button-next-page"
//                           >
//                             <ChevronRight className="h-4 w-4" />
//                           </Button>
//                         </PaginationItem>
//                       </PaginationContent>
//                     </Pagination>
//                   </div>
//                 )}

//                 {pagination.total > 0 && (
//                   <div className="mt-4 text-center text-sm text-muted-foreground">
//                     {language === "cs"
//                       ? `Zobrazeno ${sortedListings.length} z ${displayTotal} inzerátů`
//                       : language === "uk"
//                         ? `Показано ${sortedListings.length} з ${displayTotal} оголошень`
//                         : `Showing ${sortedListings.length} of ${displayTotal} listings`}
//                   </div>
//                 )}
//               </>
//             )}
//           </main>
//         </div>
//       </div>

//       <Footer />

//       {/* Edit Listing Dialog */}
//       {editingListing && (
//         <Suspense fallback={null}>
//           <EditListingDialog
//             open={editDialogOpen}
//             onOpenChange={(open: boolean) => {
//               setEditDialogOpen(open);
//               if (!open) setEditingListing(null);
//             }}
//             listing={editingListing}
//           />
//         </Suspense>
//       )}

//       {/* Delete Confirmation Dialog */}
//       <AlertDialog
//         open={deleteDialogOpen}
//         onOpenChange={(open) => {
//           if (!deleteListingMutation.isPending) {
//             setDeleteDialogOpen(open);
//             if (!open) setDeletingListingId(null);
//           }
//         }}
//       >
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle data-testid="dialog-delete-title">
//               {t("listing.deleteConfirmTitle")}
//             </AlertDialogTitle>
//             <AlertDialogDescription data-testid="dialog-delete-description">
//               {t("listing.deleteConfirmDescription")}
//             </AlertDialogDescription>
//           </AlertDialogHeader>

//           <AlertDialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setDeleteDialogOpen(false);
//                 setDeletingListingId(null);
//               }}
//               disabled={deleteListingMutation.isPending}
//               data-testid="button-delete-cancel"
//             >
//               {t("listing.deleteCancelButton")}
//             </Button>

//             <Button
//               variant="destructive"
//               onClick={confirmDelete}
//               disabled={deleteListingMutation.isPending}
//               data-testid="button-delete-confirm"
//             >
//               {deleteListingMutation.isPending ? (
//                 <span className="flex items-center gap-2">
//                   <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
//                   {t("listing.deleting")}
//                 </span>
//               ) : (
//                 t("listing.deleteConfirmButton")
//               )}
//             </Button>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   );
// }
import Header from "@/components/Header";
import FilterSidebar from "@/components/FilterSidebar";
import MobileFilters from "@/components/MobileFilters";
import SortBar from "@/components/SortBar";
import CarCard from "@/components/CarCard";
import Footer from "@/components/Footer";

import { SEO, generateListingsSchema } from "@/components/SEO";
import { useTranslation, useLocalizedOptions } from "@/lib/translations";

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFilterParams } from "@/hooks/useFilterParams";

import { formatDistanceToNow } from "date-fns";
import { cs, uk, enUS } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";

import { SearchX, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearch } from "wouter";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";

import type { Listing } from "@shared/schema";

import sedanImage from "@assets/generated_images/Featured_car_sedan_3670cf96.png";
import suvImage from "@assets/generated_images/Featured_car_SUV_65e6ecf7.png";
import sportsImage from "@assets/generated_images/Featured_car_sports_0787b41f.png";
import hatchbackImage from "@assets/generated_images/Featured_car_hatchback_89d0679c.png";
import truckImage from "@assets/generated_images/Featured_car_truck_55bea7bf.png";
import { getListingMainTitle } from "@/lib/listingTitle";

const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));

const bodyTypeImages: Record<string, string> = {
  sedan: sedanImage,
  suv: suvImage,
  coupe: sportsImage,
  hatchback: hatchbackImage,
  pickup: truckImage,
};

const ITEMS_PER_PAGE = 20;
const DEFAULT_SORT = "newest";

/* ---------------- types ---------------- */
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface ListingsResponse {
  listings: Listing[];
  pagination: PaginationInfo;
}

/* ---------------- URL helpers ---------------- */
const safeWindow = () => (typeof window !== "undefined" ? window : null);

const readParam = (searchString: string, key: string) => {
  const params = new URLSearchParams(searchString || "");
  return params.get(key);
};

const readPageFromSearch = (searchString: string) => {
  const raw = readParam(searchString, "page");
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
};

const readSortFromSearch = (searchString: string) => {
  const raw = readParam(searchString, "sort");
  return raw && raw.trim() ? raw : DEFAULT_SORT;
};

const replaceUrlParams = (mutate: (params: URLSearchParams) => void) => {
  const w = safeWindow();
  if (!w) return;

  const url = new URL(w.location.href);
  mutate(url.searchParams);
  w.history.replaceState({}, "", url.toString());
  w.dispatchEvent(new PopStateEvent("popstate"));
};

const pushUrlParams = (mutate: (params: URLSearchParams) => void) => {
  const w = safeWindow();
  if (!w) return;

  const url = new URL(w.location.href);
  mutate(url.searchParams);
  w.history.pushState({}, "", url.toString());
  w.dispatchEvent(new PopStateEvent("popstate"));
};

const scrollToTop = () => {
  const w = safeWindow();
  if (!w) return;
  // щоб спрацювало стабільно навіть коли DOM ще не перемалювався
  requestAnimationFrame(() => {
    w.scrollTo({ top: 0, behavior: "smooth" });
  });
};

/* ---------------- component ---------------- */
export default function ListingsPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const localizedOptions = useLocalizedOptions();
  const { filters, resetFilters } = useFilterParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const searchString = useSearch();

  const urlParams = useMemo(
    () => new URLSearchParams(searchString),
    [searchString],
  );

  const userId = urlParams.get("userId");

  const [sortBy, setSortBy] = useState(() =>
    readSortFromSearch(safeWindow()?.location.search || ""),
  );

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [currentPage, setCurrentPage] = useState(() =>
    readPageFromSearch(safeWindow()?.location.search || ""),
  );

  const [accumulated, setAccumulated] = useState<Listing[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [promotingListingId, setPromotingListingId] = useState<string | null>(
    null,
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(
    null,
  );

  /* ----- sync page + sort when url changes (back/forward, manual edit) ----- */
  useEffect(() => {
    const pageFromUrl = readPageFromSearch(searchString);
    const sortFromUrl = readSortFromSearch(searchString);

    setCurrentPage((prev) => (prev === pageFromUrl ? prev : pageFromUrl));
    setSortBy((prev) => (prev === sortFromUrl ? prev : sortFromUrl));

    // при навігації назад/вперед — підтягуємо саме server page
    setAccumulated([]);
    setIsLoadingMore(false);
  }, [searchString]);

  /* ----- reset when userId changes ----- */
  useEffect(() => {
    setCurrentPage(1);
    setAccumulated([]);
    setIsLoadingMore(false);

    replaceUrlParams((p) => {
      p.delete("page");
    });
  }, [userId]);

  /* ----- promotion completion (stripe redirect) ----- */
  const promotedParam = urlParams.get("promoted");
  const sessionIdParam = urlParams.get("session_id");
  const [isCompletingPromotion, setIsCompletingPromotion] = useState(false);
  const [promotionProcessed, setPromotionProcessed] = useState(false);

  useEffect(() => {
    const run = async () => {
      if (sessionIdParam && !isCompletingPromotion && !promotionProcessed) {
        setIsCompletingPromotion(true);
        try {
          const res = await apiRequest(
            "POST",
            "/api/checkout/complete-promotion",
            { stripeSessionId: sessionIdParam },
          );
          const data = await res.json();
          if (!res.ok)
            throw new Error(data?.error || "Failed to complete promotion");

          toast({
            title: t("listings.promoteSuccess"),
            description: t("listings.promoteSuccessDescription"),
          });

          queryClient.invalidateQueries({
            predicate: (q) => q.queryKey[0] === "/api/listings",
            refetchType: "all",
          });
        } catch (e: any) {
          toast({
            variant: "destructive",
            title: t("listings.promoteError"),
            description: e?.message || t("listings.promoteErrorDescription"),
          });
        }

        replaceUrlParams((p) => {
          p.delete("promoted");
          p.delete("session_id");
        });

        setIsCompletingPromotion(false);
        setPromotionProcessed(true);
      }

      if (promotedParam === "cancelled") {
        toast({
          variant: "destructive",
          title: t("listings.promoteCancelled"),
          description: t("listings.promoteCancelledDescription"),
        });
        replaceUrlParams((p) => p.delete("promoted"));
      }
    };

    run();
  }, [
    promotedParam,
    sessionIdParam,
    isCompletingPromotion,
    promotionProcessed,
    toast,
    t,
  ]);

  /* ----- mutations ----- */
  const promoteToTopMutation = useMutation({
    mutationFn: async (listingId: string) => {
      setPromotingListingId(listingId);
      const res = await apiRequest(
        "POST",
        `/api/listings/${listingId}/checkout`,
      );
      return (await res.json()) as { url?: string };
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (error: any) => {
      setPromotingListingId(null);
      toast({
        variant: "destructive",
        title: t("listings.promoteError"),
        description: error?.message || t("listings.promoteErrorDescription"),
      });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      try {
        const res = await apiRequest("DELETE", `/api/listings/${listingId}`);
        return { ...(await res.json()), deletedId: listingId };
      } catch (e: any) {
        if (e?.message?.includes("404")) {
          return { deletedId: listingId, alreadyDeleted: true };
        }
        throw e;
      }
    },
    onSuccess: () => {
      setDeleteDialogOpen(false);
      setDeletingListingId(null);

      setAccumulated([]);
      setIsLoadingMore(false);
      setCurrentPage(1);

      replaceUrlParams((p) => {
        p.delete("page");
      });

      queryClient.removeQueries({
        predicate: (q) => q.queryKey[0] === "/api/listings",
      });

      toast({
        title: t("listing.deleteSuccess"),
        description: t("listing.deleteSuccessDescription"),
      });

      scrollToTop();
    },
    onError: (error: any) => {
      setDeleteDialogOpen(false);
      setDeletingListingId(null);
      toast({
        variant: "destructive",
        title: t("listing.deleteError"),
        description: error?.message || t("listing.deleteErrorDescription"),
      });
    },
  });

  const handlePromote = useCallback(
    (listingId: string) => promoteToTopMutation.mutate(listingId),
    [promoteToTopMutation],
  );

  const handleDelete = (listingId: string) => {
    setDeletingListingId(listingId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deletingListingId || deleteListingMutation.isPending) return;
    deleteListingMutation.mutate(deletingListingId);
  };

  /* ----- sort change handler (SYNC URL + reset page) ----- */
  const handleSortChange = useCallback((nextSort: string) => {
    setSortBy(nextSort);
    setCurrentPage(1);
    setAccumulated([]);
    setIsLoadingMore(false);

    // записуємо sort у URL, page видаляємо
    pushUrlParams((p) => {
      if (!nextSort || nextSort === DEFAULT_SORT) p.delete("sort");
      else p.set("sort", nextSort);
      p.delete("page");
    });

    scrollToTop();
  }, []);

  /* ----- build query string (filters + sort + pagination) ----- */
  const queryString = useMemo(() => {
    const p = new URLSearchParams();

    if (userId) p.set("userId", userId);

    if (filters.search) p.set("search", filters.search);
    if (filters.category) p.set("category", filters.category);
    if (filters.vehicleType) p.set("vehicleType", filters.vehicleType);
    if (filters.brand) p.set("brand", filters.brand);
    if (filters.model) p.set("model", filters.model);

    if (filters.priceMin !== undefined)
      p.set("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined)
      p.set("priceMax", String(filters.priceMax));

    if (filters.yearMin !== undefined)
      p.set("yearMin", String(filters.yearMin));
    if (filters.yearMax !== undefined)
      p.set("yearMax", String(filters.yearMax));

    if (filters.mileageMin !== undefined)
      p.set("mileageMin", String(filters.mileageMin));
    if (filters.mileageMax !== undefined)
      p.set("mileageMax", String(filters.mileageMax));

    if (filters.fuel) p.set("fuel", filters.fuel);
    if (filters.bodyType?.length) p.set("bodyType", filters.bodyType.join(","));
    if (filters.transmission) p.set("transmission", filters.transmission);
    if (filters.color) p.set("color", filters.color);
    if (filters.trim) p.set("trim", filters.trim);
    if (filters.region) p.set("region", filters.region);
    if (filters.driveType) p.set("driveType", filters.driveType);

    if (filters.engineMin !== undefined)
      p.set("engineMin", String(filters.engineMin));
    if (filters.engineMax !== undefined)
      p.set("engineMax", String(filters.engineMax));
    if (filters.powerMin !== undefined)
      p.set("powerMin", String(filters.powerMin));
    if (filters.powerMax !== undefined)
      p.set("powerMax", String(filters.powerMax));

    if (filters.doorsMin !== undefined)
      p.set("doorsMin", String(filters.doorsMin));
    if (filters.doorsMax !== undefined)
      p.set("doorsMax", String(filters.doorsMax));
    if (filters.seatsMin !== undefined)
      p.set("seatsMin", String(filters.seatsMin));
    if (filters.seatsMax !== undefined)
      p.set("seatsMax", String(filters.seatsMax));

    if (filters.ownersMin !== undefined)
      p.set("ownersMin", String(filters.ownersMin));
    if (filters.ownersMax !== undefined)
      p.set("ownersMax", String(filters.ownersMax));

    if (filters.airbagsMin !== undefined)
      p.set("airbagsMin", String(filters.airbagsMin));
    if (filters.airbagsMax !== undefined)
      p.set("airbagsMax", String(filters.airbagsMax));

    if (filters.sellerType) p.set("sellerType", filters.sellerType);

    if (filters.listingAgeMin !== undefined)
      p.set("listingAgeMin", String(filters.listingAgeMin));
    if (filters.listingAgeMax !== undefined)
      p.set("listingAgeMax", String(filters.listingAgeMax));

    if (filters.condition?.length)
      p.set("condition", filters.condition.join(","));
    if (filters.extras?.length) p.set("extras", filters.extras.join(","));
    if (filters.equipment?.length)
      p.set("equipment", filters.equipment.join(","));

    if (filters.vatDeductible) p.set("vatDeductible", "true");

    // ✅ server-side sort (головне!)
    p.set("sort", sortBy);

    // pagination
    p.set("page", String(currentPage));
    p.set("limit", String(ITEMS_PER_PAGE));

    return p.toString();
  }, [filters, userId, sortBy, currentPage]);

  const apiUrl = useMemo(
    () => (queryString ? `/api/listings?${queryString}` : "/api/listings"),
    [queryString],
  );

  // Prefetch next page for faster pagination
  useEffect(() => {
    const nextPage = currentPage + 1;
    const p = new URLSearchParams(queryString);
    p.set("page", String(nextPage));
    p.set("limit", String(ITEMS_PER_PAGE));
    const nextQueryString = p.toString();
    if (!nextQueryString) return;
    queryClient.prefetchQuery({
      queryKey: ["/api/listings", nextQueryString],
      queryFn: async () => {
        const res = await fetch(`/api/listings?${nextQueryString}`, {
          method: "GET",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return (await res.json()) as ListingsResponse;
      },
      staleTime: 30_000,
    });
  }, [currentPage, queryString]);

  /**
   * ✅ ВАЖЛИВО:
   * тут ми НЕ використовуємо HTTP cache, щоб не ловити 304 + старі дані
   */
  // const { data: response, isLoading } = useQuery<ListingsResponse>({
  //   queryKey: ["/api/listings", queryString],
  //   queryFn: async () => {
  //     const res = await fetch(apiUrl, {
  //       method: "GET",
  //       credentials: "same-origin",
  //       cache: "no-store",
  //       headers: {
  //         Accept: "application/json",
  //         "Cache-Control": "no-cache",
  //         Pragma: "no-cache",
  //       },
  //     });

  //     if (!res.ok) {
  //       let msg = `Request failed: ${res.status}`;
  //       try {
  //         const j = await res.json();
  //         msg = j?.error || msg;
  //       } catch {}
  //       throw new Error(msg);
  //     }

  //     return (await res.json()) as ListingsResponse;
  //   },
  //   staleTime: 0,
  //   refetchOnWindowFocus: false,
  // });
  const {
    data: response,
    isPending, // ✅ перше завантаження (v5)
    isFetching, // ✅ будь-яке завантаження (включно з refetch)
    isFetched, // ✅ запит хоча б раз завершився
  } = useQuery<ListingsResponse>({
    queryKey: ["/api/listings", queryString],
    queryFn: async () => {
      const res = await fetch(apiUrl, {
        method: "GET",
        credentials: "same-origin",
        cache: "default",
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        let msg = `Request failed: ${res.status}`;
        try {
          const j = await res.json();
          msg = j?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      return (await res.json()) as ListingsResponse;
    },
    // Keep previous page visible while fetching next page
    placeholderData: (prev) => prev,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const showLoader = isPending || (!isFetched && isFetching);

  function ListingsLoader({ language }: { language: string }) {
    const text =
      language === "cs"
        ? "Načítání inzerátů..."
        : language === "uk"
          ? "Завантаження оголошень..."
          : "Loading listings...";

    return (
      <div className="py-12">
        <div className="flex items-center justify-center gap-3 text-muted-foreground">
          <span className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          {text}
        </div>

        {/* ✅ Skeleton cards (щоб сторінка не виглядала пустою) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 space-y-3">
              <div className="h-44 w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-10 w-full rounded bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const listings = response?.listings || [];
  const showEmpty = isFetched && !isFetching && listings.length === 0;

  const pagination: PaginationInfo = response?.pagination || {
    total: 0,
    page: 1,
    limit: ITEMS_PER_PAGE,
    totalPages: 1,
    hasMore: false,
  };
  const baseListingsCount = pagination?.total ?? 0;

  // якщо +98 — маркетинговий “бонус”, залишаємо, але застосовуємо всюди однаково
  const listingsCount = baseListingsCount > 0 ? baseListingsCount + 98 : 0;
  /* ----- reset page when filters change (exclude page/limit/sort) ----- */
  const didMountRef = useRef(false);

  const filterOnlyKey = useMemo(() => {
    const p = new URLSearchParams(queryString);
    p.delete("page");
    p.delete("limit");
    p.delete("sort");
    return p.toString();
  }, [queryString]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setCurrentPage(1);
    setAccumulated([]);
    setIsLoadingMore(false);

    replaceUrlParams((p) => {
      p.delete("page");
    });

    scrollToTop();
  }, [filterOnlyKey]);

  /* ----- accumulation (load more) ----- */
  useEffect(() => {
    if (isFetching) return;

    if (isLoadingMore) {
      setAccumulated((prev) => {
        const ids = new Set(prev.map((l) => l.id));
        const fresh = listings.filter((l) => !ids.has(l.id));
        return [...prev, ...fresh];
      });
    } else {
      setAccumulated(listings);
    }
    setIsLoadingMore(false);
  }, [listings, isFetching, isLoadingMore]);

  /* ----- clamp invalid pages ----- */
  useEffect(() => {
    if (isFetching) return;
    if (!pagination.totalPages) return;

    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
      setAccumulated([]);
      setIsLoadingMore(false);

      replaceUrlParams((p) => {
        if (pagination.totalPages <= 1) p.delete("page");
        else p.set("page", String(pagination.totalPages));
      });

      scrollToTop();
    }
  }, [pagination.totalPages, currentPage, isFetching]);

  const handleLoadMore = () => {
    if (!pagination.hasMore || isFetching || isLoadingMore) return;
    setIsLoadingMore(true);

    setCurrentPage((prev) => {
      const next = prev + 1;
      replaceUrlParams((p) => p.set("page", String(next)));
      return next;
    });
  };

  const goToPage = useCallback((page: number) => {
    setIsLoadingMore(false);
    setAccumulated([]);
    setCurrentPage(page);

    pushUrlParams((p) => {
      if (page <= 1) p.delete("page");
      else p.set("page", String(page));
    });

    scrollToTop();
  }, []);

  /* ----- UI helpers ----- */
  const dateLocale = language === "cs" ? cs : language === "uk" ? uk : enUS;

  const displayListings = useMemo(() => {
    if (!deletingListingId) return accumulated;
    return accumulated.filter((l) => l.id !== deletingListingId);
  }, [accumulated, deletingListingId]);

  // якщо потрібно “TOP” завжди зверху — залишаємо
  const sortedListings = useMemo(() => {
    const top = displayListings.filter((l) => l.isTopListing);
    const rest = displayListings.filter((l) => !l.isTopListing);
    return [...top, ...rest];
  }, [displayListings]);

  const listingsById = useMemo(() => {
    const map = new Map<string, Listing>();
    for (const l of sortedListings) map.set(l.id, l);
    return map;
  }, [sortedListings]);

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

  const cars = useMemo(() => {
    return sortedListings.map((listing) => {
      const regionLabel =
        regions.find((r) => r.value === listing.region)?.label ||
        listing.region ||
        "";

      let image = sedanImage;
      const firstPhoto = listing.photos?.[0];

      if (typeof firstPhoto === "string" && firstPhoto.trim()) {
        image = `/objects/${firstPhoto.trim().replace(/^\/+/, "")}`;
      } else if (listing.bodyType && bodyTypeImages[listing.bodyType]) {
        image = bodyTypeImages[listing.bodyType];
      }

      const datePosted = formatDistanceToNow(new Date(listing.createdAt), {
        addSuffix: true,
        locale: dateLocale,
      });

      const fuelType = listing.fuelType?.[0] || "";
      const transmission = listing.transmission?.[0] || "";

      const photos = (listing.photos || [])
        .filter((p): p is string => typeof p === "string" && p.trim() !== "")
        .map((p) => `/objects/${p.replace(/^\/+/, "")}`);

      return {
        id: listing.id,
        image,
        photos,
        title: getListingMainTitle(listing),
        price: Number.parseFloat(listing.price),
        year: listing.year,
        mileage: listing.mileage,
        fuel: fuelType ? (fuelLabels as any)[fuelType] || fuelType : "-",
        transmission: transmission
          ? (transmissionLabels as any)[transmission] || transmission
          : "-",
        location: regionLabel,
        datePosted,
        condition: listing.isTopListing ? t("detail.topListing") : undefined,
      };
    });
  }, [sortedListings, regions, dateLocale, t, fuelLabels, transmissionLabels]);

  const handleEdit = (listingId: string) => {
    const listing = listingsById.get(listingId);
    if (!listing) return;
    setEditingListing(listing);
    setEditDialogOpen(true);
  };

  const totalPages = pagination.totalPages;

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
    if (currentPage >= totalPages - 2)
      return [
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];

    return [
      1,
      "ellipsis",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "ellipsis",
      totalPages,
    ];
  };

  /* ----- SEO ----- */
  // const seoDescriptions = {
  //   cs: `Prohlédněte si ${pagination.total || ""} inzerátů aut, motocyklů a nákladních vozidel. Pokročilé filtry, snadné vyhledávání. NNAuto - prémiový marketplace vozidel.`,
  //   uk: `Перегляньте ${pagination.total || ""} оголошень авто, мотоциклів та вантажівок. Розширені фільтри, легкий пошук. NNAuto - преміальний маркетплейс авто.`,
  //   en: `Browse ${pagination.total || ""} car, motorcycle and truck listings. Advanced filters, easy search. NNAuto - premium vehicle marketplace.`,
  // };
  const seoDescriptions = {
    cs: `Prohlédněte si ${listingsCount || ""} inzerátů aut, motocyklů a nákladních vozidel. Pokročilé filtry, snadné vyhledávání. NNAuto - prémiový marketplace vozidel.`,
    uk: `Перегляньте ${listingsCount || ""} оголошень авто, мотоциклів та вантажівок. Розширені фільтри, легкий пошук. NNAuto - преміальний маркетплейс авто.`,
    en: `Browse ${listingsCount || ""} car, motorcycle and truck listings. Advanced filters, easy search. NNAuto - premium vehicle marketplace.`,
  };

  const seoTitles = {
    cs: "Inzeráty vozidel - Auta, Motocykly, Nákladní vozy | NNAuto",
    uk: "Оголошення автомобілів - Авто, Мотоцикли, Вантажівки | NNAuto",
    en: "Vehicle Listings - Cars, Motorcycles, Trucks | NNAuto",
  };

  const seoKeywords = {
    cs: "inzeráty aut, prodej aut, bazar aut, ojetá auta, auto inzeráty, automobily na prodej, motocykly, nákladní vozy, autobazar, NNAuto",
    uk: "оголошення авто, продаж авто, авторинок, вживані авто, автомобілі, мотоцикли, вантажівки, NNAuto",
    en: "car listings, car sales, used cars, automobiles for sale, motorcycles, trucks, car market, NNAuto",
  };

  const listingsSchema =
    sortedListings.length > 0
      ? generateListingsSchema(
          sortedListings.slice(0, 20).map((l) => ({
            id: l.id,
            brand: l.brand,
            model: l.model,
            year: l.year,
            price: Number(l.price),
            photos: l.photos || undefined,
          })),
        )
      : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitles[language as keyof typeof seoTitles] || seoTitles.cs}
        description={
          seoDescriptions[language as keyof typeof seoDescriptions] ||
          seoDescriptions.cs
        }
        keywords={
          seoKeywords[language as keyof typeof seoKeywords] || seoKeywords.cs
        }
        url="https://nnauto.cz/listings"
        locale={
          language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
        }
        alternateLanguages={[
          { lang: "cs", url: "https://nnauto.cz/listings" },
          { lang: "uk", url: "https://nnauto.cz/listings" },
          { lang: "en", url: "https://nnauto.cz/listings" },
        ]}
        structuredData={listingsSchema}
      />

      <Header />

      <div className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-4">
            <div className="lg:hidden">
              <MobileFilters />
            </div>
            <div className="flex-1 lg:flex-none">
              <SortBar
                listingsCount={listingsCount}
                sortBy={sortBy}
                onSortChange={handleSortChange}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside
            className={[
              "hidden lg:block shrink-0 transition-[width] duration-300",
              sidebarCollapsed ? "w-0 overflow-hidden" : "w-96",
            ].join(" ")}
          >
            <div
              className={[
                "transition-opacity duration-200",
                sidebarCollapsed
                  ? "opacity-0 pointer-events-none"
                  : "opacity-100",
              ].join(" ")}
            >
              <FilterSidebar />
            </div>
          </aside>

          <div className="hidden lg:block w-0">
            <div className="sticky top-1/2 -translate-y-1/2 z-40">
              <button
                type="button"
                onClick={() => setSidebarCollapsed((v) => !v)}
                className={[
                  "h-16 w-9",
                  "rounded-xl border bg-background shadow-md",
                  "flex items-center justify-center",
                  "hover:bg-muted transition",
                  "-translate-x-1/2",
                ].join(" ")}
                title={
                  sidebarCollapsed
                    ? t("filters.showFilters")
                    : t("filters.hideFilters")
                }
                aria-label={
                  sidebarCollapsed
                    ? t("filters.showFilters")
                    : t("filters.hideFilters")
                }
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* <main className="flex-1">
            {cars.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  {t("listings.noResults")}
                </h3>
                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  {t("listings.noResultsDescription")}
                </p>
                <Button
                  onClick={() => {
                    resetFilters();
                    scrollToTop();
                  }}
                  variant="outline"
                  size="lg"
                >
                  {t("listings.resetFilters")}
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8"
                      : "flex flex-col gap-8"
                  }
                >
                  {cars.map((car, index) => {
                    const listing = listingsById.get(car.id);
                    const isOwner = Boolean(
                      user && listing && listing.userId === user.id,
                    );
                    const isTopListing = Boolean(listing?.isTopListing);
                    const isPromoting = promotingListingId === car.id;

                    return (
                      <CarCard
                        key={car.id}
                        {...car}
                        viewMode={viewMode}
                        isOwner={isOwner}
                        isTopListing={isTopListing}
                        onPromote={handlePromote}
                        isPromoting={isPromoting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        priority={index < 3}
                      />
                    );
                  })}
                </div>

                {pagination.hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || isLoading}
                      className="min-w-[200px]"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          {t("listings.loading")}
                        </span>
                      ) : language === "cs" ? (
                        "Další inzeráty"
                      ) : language === "uk" ? (
                        "Більше оголошень"
                      ) : (
                        "Load more listings"
                      )}
                    </Button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              goToPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </PaginationItem>

                        {getPageNumbers().map((page, index) => (
                          <PaginationItem key={index}>
                            {page === "ellipsis" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              goToPage(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

             
                {listingsCount > 0 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {language === "cs"
                      ? `Zobrazeno ${sortedListings.length} z ${listingsCount} inzerátů`
                      : language === "uk"
                        ? `Показано ${sortedListings.length} з ${listingsCount} оголошень`
                        : `Showing ${sortedListings.length} of ${listingsCount} listings`}
                  </div>
                )}
              </>
            )}
          </main> */}
          <main className="flex-1">
            {showLoader ? (
              <ListingsLoader language={language} />
            ) : showEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>

                <h3 className="text-2xl font-semibold mb-3">
                  {t("listings.noResults")}
                </h3>

                <p className="text-muted-foreground text-center mb-8 max-w-md">
                  {t("listings.noResultsDescription")}
                </p>

                <Button
                  onClick={() => {
                    resetFilters();
                    scrollToTop();
                  }}
                  variant="outline"
                  size="lg"
                >
                  {t("listings.resetFilters")}
                </Button>
              </div>
            ) : (
              /* ✅ 3) RESULTS STATE */
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8"
                      : "flex flex-col gap-8"
                  }
                >
                  {cars.map((car, index) => {
                    const listing = listingsById.get(car.id);
                    const isOwner = Boolean(
                      user && listing && listing.userId === user.id,
                    );
                    const isTopListing = Boolean(listing?.isTopListing);
                    const isPromoting = promotingListingId === car.id;

                    return (
                      <CarCard
                        key={car.id}
                        {...car}
                        viewMode={viewMode}
                        isOwner={isOwner}
                        isTopListing={isTopListing}
                        onPromote={handlePromote}
                        isPromoting={isPromoting}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        priority={index < 3}
                      />
                    );
                  })}
                </div>

                {pagination.hasMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || isFetching}
                      className="min-w-[200px]"
                    >
                      {isLoadingMore ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                          {t("listings.loading")}
                        </span>
                      ) : language === "cs" ? (
                        "Další inzeráty"
                      ) : language === "uk" ? (
                        "Більше оголошень"
                      ) : (
                        "Load more listings"
                      )}
                    </Button>
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    {/* pagination block залишається як у тебе */}
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              goToPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </PaginationItem>

                        {getPageNumbers().map((page, index) => (
                          <PaginationItem key={index}>
                            {page === "ellipsis" ? (
                              <PaginationEllipsis />
                            ) : (
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  goToPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              goToPage(Math.min(totalPages, currentPage + 1))
                            }
                            disabled={currentPage === totalPages}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

                {listingsCount > 0 && (
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    {language === "cs"
                      ? `Zobrazeno ${sortedListings.length} z ${listingsCount} inzerátů`
                      : language === "uk"
                        ? `Показано ${sortedListings.length} з ${listingsCount} оголошень`
                        : `Showing ${sortedListings.length} of ${listingsCount} listings`}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      <Footer />

      {editingListing && (
        <Suspense fallback={null}>
          <EditListingDialog
            open={editDialogOpen}
            onOpenChange={(open: boolean) => {
              setEditDialogOpen(open);
              if (!open) setEditingListing(null);
            }}
            listing={editingListing}
          />
        </Suspense>
      )}

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteListingMutation.isPending) {
            setDeleteDialogOpen(open);
            if (!open) setDeletingListingId(null);
          }
        }}
      >
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
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeletingListingId(null);
              }}
              disabled={deleteListingMutation.isPending}
            >
              {t("listing.deleteCancelButton")}
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteListingMutation.isPending}
            >
              {deleteListingMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  {t("listing.deleting")}
                </span>
              ) : (
                t("listing.deleteConfirmButton")
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
