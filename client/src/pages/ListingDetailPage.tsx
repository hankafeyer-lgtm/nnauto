// // import { useState, useEffect, useCallback, useMemo } from "react";
// // import { useRoute, Link } from "wouter";
// // import { useQuery, useMutation } from "@tanstack/react-query";
// // import {
// //   ArrowLeft,
// //   MapPin,
// //   Calendar,
// //   Gauge,
// //   Fuel,
// //   Heart,
// //   Share2,
// //   Phone,
// //   Check,
// //   Settings,
// //   Car,
// //   Palette,
// //   Package,
// //   Activity,
// //   Zap,
// //   DoorOpen,
// //   Users,
// //   Globe,
// //   Bus,
// //   Truck,
// //   Bike,
// //   User,
// //   Shield,
// //   Store,
// //   Mail,
// //   Star,
// //   FileText,
// //   Crown,
// //   Loader2,
// //   ChevronLeft,
// //   ChevronRight,
// //   Video,
// //   Play,
// // } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Badge } from "@/components/ui/badge";
// // import { Separator } from "@/components/ui/separator";
// // import {
// //   Carousel,
// //   CarouselContent,
// //   CarouselItem,
// //   type CarouselApi,
// // } from "@/components/ui/carousel";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogDescription,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// // import { useFavorites } from "@/contexts/FavoritesContext";
// // import { useAuth } from "@/hooks/useAuth";
// // import { useToast } from "@/hooks/use-toast";
// // import { apiRequest, queryClient } from "@/lib/queryClient";
// // import { format } from "date-fns";
// // import Header from "@/components/Header";
// // import { MediaLightbox } from "@/components/MediaLightbox";
// // import {
// //   SEO,
// //   generateVehicleSchema,
// //   generateBreadcrumbSchema,
// //   generateListingKeywords,
// // } from "@/components/SEO";
// // import { useLanguage } from "@/contexts/LanguageContext";
// // import type { Listing } from "@shared/schema";
// // import { getFullImageUrl, getThumbnailUrl } from "@/lib/imageOptimizer";

// // // Type for public contact information returned by /api/users/:id
// // type PublicContact = {
// //   id: string;
// //   email: string;
// //   phone: string | null;
// //   firstName: string | null;
// //   lastName: string | null;
// // };

// // export default function ListingDetailPage() {
// //   const t = useTranslation();
// //   const { language } = useLanguage();
// //   const localizedOptions = useLocalizedOptions();
// //   const { toggleFavorite, isFavorite } = useFavorites();
// //   const { toast } = useToast();
// //   const { user } = useAuth();
// //   const [, params] = useRoute("/listing/:id");
// //   const [showContactDialog, setShowContactDialog] = useState(false);
// //   const [carouselApi, setCarouselApi] = useState<CarouselApi>();
// //   const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
// //   const [photoCount, setPhotoCount] = useState(0);
// //   const [lightboxOpen, setLightboxOpen] = useState(false);
// //   const [lightboxIndex, setLightboxIndex] = useState(0);

// //   const {
// //     data: listing,
// //     isLoading,
// //     error,
// //   } = useQuery<Listing>({
// //     queryKey: [`/api/listings/${params?.id}`],
// //     enabled: !!params?.id,
// //   });

// //   const { data: seller } = useQuery<PublicContact>({
// //     queryKey: [`/api/users/${listing?.userId}`],
// //     enabled: !!listing?.userId,
// //   });

// //   // Handle promotion success/cancel from Stripe redirect
// //   useEffect(() => {
// //     const urlParams = new URLSearchParams(window.location.search);
// //     const promotedParam = urlParams.get("promoted");

// //     if (promotedParam === "success") {
// //       toast({
// //         title: t("listings.promoteSuccess"),
// //         description: t("listings.promoteSuccessDescription"),
// //       });
// //       queryClient.invalidateQueries({
// //         queryKey: [`/api/listings/${params?.id}`],
// //       });
// //       const newUrl = new URL(window.location.href);
// //       newUrl.searchParams.delete("promoted");
// //       window.history.replaceState({}, "", newUrl.toString());
// //     } else if (promotedParam === "cancelled") {
// //       toast({
// //         variant: "destructive",
// //         title: t("listings.promoteCancelled"),
// //         description: t("listings.promoteCancelledDescription"),
// //       });
// //       const newUrl = new URL(window.location.href);
// //       newUrl.searchParams.delete("promoted");
// //       window.history.replaceState({}, "", newUrl.toString());
// //     }
// //   }, [params?.id, t, toast]);

// //   // Carousel photo tracking
// //   useEffect(() => {
// //     if (!carouselApi) return;

// //     setPhotoCount(carouselApi.scrollSnapList().length);
// //     setCurrentPhotoIndex(carouselApi.selectedScrollSnap());

// //     carouselApi.on("select", () => {
// //       setCurrentPhotoIndex(carouselApi.selectedScrollSnap());
// //     });
// //   }, [carouselApi]);

// //   // Navigate to specific photo
// //   const scrollToPhoto = useCallback(
// //     (index: number) => {
// //       carouselApi?.scrollTo(index);
// //     },
// //     [carouselApi]
// //   );

// //   // Mutation to create Stripe checkout session for TOP promotion
// //   const promoteToTopMutation = useMutation({
// //     mutationFn: async (listingId: string) => {
// //       const res = await apiRequest(
// //         "POST",
// //         `/api/listings/${listingId}/checkout`
// //       );
// //       return await res.json();
// //     },
// //     onSuccess: (data: { url: string }) => {
// //       if (data.url) {
// //         window.location.href = data.url;
// //       }
// //     },
// //     onError: (error: any) => {
// //       toast({
// //         variant: "destructive",
// //         title: t("listings.promoteError"),
// //         description: error.message || t("listings.promoteErrorDescription"),
// //       });
// //     },
// //   });

// //   // Check if current user owns this listing
// //   const isOwner = user && listing && user.id === listing.userId;
// //   const canPromote = isOwner && !listing?.isTopListing;

// //   if (isLoading) {
// //     return (
// //       <>
// //         <Header />
// //         <div className="min-h-screen flex items-center justify-center">
// //           <div className="text-center space-y-4">
// //             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
// //             <p className="text-lg text-muted-foreground">
// //               {t("detail.loading")}
// //             </p>
// //           </div>
// //         </div>
// //       </>
// //     );
// //   }

// //   if (error || !listing) {
// //     return (
// //       <>
// //         <Header />
// //         <div className="min-h-screen flex items-center justify-center">
// //           <div className="text-center space-y-4">
// //             <h1 className="text-3xl font-bold">{t("detail.notFound")}</h1>
// //             <p className="text-muted-foreground">{t("detail.errorLoading")}</p>
// //             <Link href="/listings">
// //               <Button data-testid="button-back-listings">
// //                 <ArrowLeft className="w-4 h-4 mr-2" />
// //                 {t("detail.backToListings")}
// //               </Button>
// //             </Link>
// //           </div>
// //         </div>
// //       </>
// //     );
// //   }

// //   const bodyTypes = localizedOptions.getBodyTypes();
// //   const colors = localizedOptions.getColors();
// //   const driveTypes = localizedOptions.getDriveTypes();
// //   const regions = localizedOptions.getRegions();
// //   const importCountries = localizedOptions.getImportCountries();

// //   const getLocalizedBodyType = (value: string | null) => {
// //     if (!value) return "";
// //     return bodyTypes.find((bt) => bt.value === value)?.label || value;
// //   };

// //   const getLocalizedColor = (value: string | null) => {
// //     if (!value) return "";
// //     return colors.find((c) => c.value === value)?.label || value;
// //   };

// //   const getLocalizedDriveType = (values: string[] | string | null) => {
// //     if (!values) return "";
// //     const valuesArray = Array.isArray(values) ? values : [values];
// //     return valuesArray
// //       .map(
// //         (value) => driveTypes.find((dt) => dt.value === value)?.label || value
// //       )
// //       .join(", ");
// //   };

// //   const getLocalizedRegion = (value: string | null) => {
// //     if (!value) return "";
// //     return regions.find((r) => r.value === value)?.label || value;
// //   };

// //   const getLocalizedImportCountry = (value: string | null) => {
// //     if (!value) return "";
// //     return importCountries.find((ic) => ic.value === value)?.label || value;
// //   };

// //   const getTransmissionLabel = (values: string[] | string | null) => {
// //     if (!values) return "";
// //     const transmissionLabels: Record<string, string> = {
// //       manual: t("filters.manual"),
// //       automatic: t("filters.automatic"),
// //       robot: t("filters.robot"),
// //       cvt: t("filters.cvt"),
// //     };
// //     const valuesArray = Array.isArray(values) ? values : [values];
// //     return valuesArray
// //       .map((value) => transmissionLabels[value] || value)
// //       .join(", ");
// //   };

// //   const getFuelTypeLabel = (values: string[] | string | null) => {
// //     if (!values) return "";
// //     const fuelLabels: Record<string, string> = {
// //       benzin: t("hero.benzin"),
// //       diesel: t("hero.diesel"),
// //       hybrid: t("hero.hybrid"),
// //       electric: t("hero.electric"),
// //       lpg: t("hero.lpg"),
// //       cng: t("hero.cng"),
// //     };
// //     const valuesArray = Array.isArray(values) ? values : [values];
// //     return valuesArray.map((value) => fuelLabels[value] || value).join(", ");
// //   };

// //   const getVehicleTypeIcon = (
// //     type: string | null
// //   ): React.ComponentType<{ className?: string }> | null => {
// //     if (!type) return null;
// //     const icons: Record<string, React.ComponentType<{ className?: string }>> = {
// //       cars: Car,
// //       vans: Bus,
// //       trucks: Truck,
// //       motorcycles: Bike,
// //     };
// //     return icons[type] || null;
// //   };

// //   const getVehicleTypeLabel = (type: string | null) => {
// //     if (!type) return "";
// //     const labels: Record<string, string> = {
// //       cars: t("hero.cars"),
// //       vans: t("hero.vans"),
// //       trucks: t("hero.trucks"),
// //       motorcycles: t("hero.motorcycles"),
// //     };
// //     return labels[type] || type;
// //   };

// //   const equipmentOptions = [
// //     { value: "heatedSeats", label: t("filters.heatedSeats") },
// //     { value: "electricWindows", label: t("filters.electricWindows") },
// //     { value: "leatherInterior", label: t("filters.leatherInterior") },
// //     { value: "climateControl", label: t("filters.climateControl") },
// //     { value: "cruiseControl", label: t("filters.cruiseControl") },
// //     { value: "parkingSensors", label: t("filters.parkingSensors") },
// //     { value: "rearCamera", label: t("filters.rearCamera") },
// //     { value: "navigationSystem", label: t("filters.navigationSystem") },
// //     { value: "bluetooth", label: t("filters.bluetooth") },
// //     { value: "keylessEntry", label: t("filters.keylessEntry") },
// //     { value: "ledHeadlights", label: t("filters.ledHeadlights") },
// //     { value: "sunroof", label: t("filters.sunroof") },
// //     { value: "alloyWheels", label: t("filters.alloyWheels") },
// //     { value: "ventilatedSeats", label: t("filters.ventilatedSeats") },
// //     { value: "memorySeats", label: t("filters.memorySeats") },
// //     { value: "massageSeats", label: t("filters.massageSeats") },
// //     { value: "adaptiveCruise", label: t("filters.adaptiveCruise") },
// //     { value: "laneKeeping", label: t("filters.laneKeeping") },
// //     { value: "blindSpot", label: t("filters.blindSpot") },
// //     { value: "rainSensor", label: t("filters.rainSensor") },
// //     { value: "lightSensor", label: t("filters.lightSensor") },
// //     { value: "heatedSteeringWheel", label: t("filters.heatedSteeringWheel") },
// //     { value: "panoramicRoof", label: t("filters.panoramicRoof") },
// //     { value: "electricSeats", label: t("filters.electricSeats") },
// //     { value: "parkingAssist", label: t("filters.parkingAssist") },
// //     { value: "headUpDisplay", label: t("filters.headUpDisplay") },
// //     { value: "wirelessCharging", label: t("filters.wirelessCharging") },
// //     { value: "towHitch", label: t("filters.towHitch") },
// //   ];

// //   const extrasOptions = [
// //     { value: "vinCheck", label: t("filters.vinCheck") },
// //     { value: "serviceBook", label: t("filters.serviceBook") },
// //     { value: "notDamaged", label: t("filters.notDamaged") },
// //     { value: "notPainted", label: t("filters.notPainted") },
// //     { value: "warranty", label: t("filters.warranty") },
// //     { value: "exchange", label: t("filters.exchange") },
// //   ];

// //   const handleToggleFavorite = () => {
// //     if (!listing) return;

// //     const isCurrentlyFavorite = isFavorite(listing.id);
// //     toggleFavorite(listing.id);

// //     toast({
// //       title: isCurrentlyFavorite
// //         ? t("favorites.removed")
// //         : t("favorites.added"),
// //       description: isCurrentlyFavorite
// //         ? t("favorites.removedDescription")
// //         : t("favorites.addedDescription"),
// //     });
// //   };

// //   const handleShare = async () => {
// //     if (!listing) return;

// //     const shareUrl = window.location.href;
// //     const shareData = {
// //       title: listing.title,
// //       text: `${listing.brand} ${
// //         listing.model
// //       } - ${listing.price.toLocaleString()} Kč`,
// //       url: shareUrl,
// //     };

// //     if (navigator.share) {
// //       try {
// //         await navigator.share(shareData);
// //         toast({
// //           title: t("detail.shareSuccess"),
// //           description: t("detail.shareSuccessDescription"),
// //         });
// //       } catch (error) {
// //         if ((error as Error).name !== "AbortError") {
// //           console.error("Error sharing:", error);
// //         }
// //       }
// //     } else {
// //       try {
// //         await navigator.clipboard.writeText(shareUrl);
// //         toast({
// //           title: t("detail.linkCopied"),
// //           description: t("detail.linkCopiedDescription"),
// //         });
// //       } catch (error) {
// //         console.error("Error copying to clipboard:", error);
// //         toast({
// //           title: t("detail.shareError"),
// //           description: t("detail.shareErrorDescription"),
// //           variant: "destructive",
// //         });
// //       }
// //     }
// //   };

// //   // Generate SEO data for this listing
// //   const vehicleSchema = generateVehicleSchema({
// //     id: listing.id,
// //     brand: listing.brand,
// //     model: listing.model,
// //     year: listing.year,
// //     price: Number(listing.price),
// //     mileage: listing.mileage,
// //     fuelType: listing.fuelType || undefined,
// //     transmission: listing.transmission || undefined,
// //     color: listing.color || undefined,
// //     bodyType: listing.bodyType || undefined,
// //     engineVolume: listing.engineVolume || undefined,
// //     power: listing.power || undefined,
// //     vin: listing.vin || undefined,
// //     photos: listing.photos || undefined,
// //     description: listing.description || undefined,
// //     condition: listing.condition || undefined,
// //     sellerType: listing.sellerType || undefined,
// //   });

// //   const breadcrumbSchema = generateBreadcrumbSchema([
// //     {
// //       name: language === "cs" ? "Domů" : language === "uk" ? "Головна" : "Home",
// //       url: "https://nnauto.cz/",
// //     },
// //     {
// //       name:
// //         language === "cs"
// //           ? "Inzeráty"
// //           : language === "uk"
// //           ? "Оголошення"
// //           : "Listings",
// //       url: "https://nnauto.cz/listings",
// //     },
// //     {
// //       name: `${listing.year} ${listing.brand} ${listing.model}`,
// //       url: `https://nnauto.cz/listing/${listing.id}`,
// //     },
// //   ]);

// //   const seoTitle = `${listing.year} ${listing.brand} ${
// //     listing.model
// //   } - ${Number(listing.price).toLocaleString(
// //     language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US"
// //   )} ${language === "en" ? "CZK" : "Kč"} | Prodej`;
// //   const seoDescription =
// //     listing.description?.substring(0, 155) ||
// //     `Prodej ${listing.year} ${listing.brand} ${
// //       listing.model
// //     }. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km. ${
// //       listing.fuelType?.[0] || ""
// //     }, ${listing.transmission?.[0] || ""}. Cena ${Number(
// //       listing.price
// //     ).toLocaleString("cs-CZ")} Kč. ${
// //       language === "cs"
// //         ? "Koupit na NNAuto.cz"
// //         : language === "uk"
// //         ? "Купити на NNAuto.cz"
// //         : "Buy on NNAuto.cz"
// //     }`;
// //   const seoImage = listing.photos?.[0]
// //     ? `https://nnauto.cz/objects/${listing.photos[0].replace(/^\/+/, "")}`
// //     : undefined;
// //   const seoKeywords = generateListingKeywords({
// //     brand: listing.brand,
// //     model: listing.model,
// //     year: listing.year,
// //     bodyType: listing.bodyType || undefined,
// //     fuelType: listing.fuelType || undefined,
// //     region: listing.region || undefined,
// //     condition: listing.condition || undefined,
// //   });
// //   const listingUrl = `https://nnauto.cz/listing/${listing.id}`;

// //   return (
// //     <>
// //       <SEO
// //         title={seoTitle}
// //         description={seoDescription}
// //         keywords={seoKeywords}
// //         image={seoImage}
// //         url={listingUrl}
// //         type="product"
// //         locale={
// //           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
// //         }
// //         alternateLanguages={[
// //           { lang: "cs", url: listingUrl },
// //           { lang: "uk", url: listingUrl },
// //           { lang: "en", url: listingUrl },
// //         ]}
// //         structuredData={{
// //           "@context": "https://schema.org",
// //           "@graph": [vehicleSchema, breadcrumbSchema],
// //         }}
// //       />
// //       <Header />
// //       <div className="min-h-screen bg-background">
// //         <div className="container mx-auto px-4 py-8 max-w-7xl">
// //           {/* Back button */}
// //           <Button
// //             variant="ghost"
// //             className="mb-6"
// //             data-testid="button-back"
// //             onClick={() => {
// //               // Use browser history to preserve page number and filters
// //               if (window.history.length > 1) {
// //                 window.history.back();
// //               } else {
// //                 window.location.href = "/listings";
// //               }
// //             }}
// //           >
// //             <ArrowLeft className="w-4 h-4 mr-2" />
// //             {t("detail.backToListings")}
// //           </Button>

// //           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
// //             {/* Main content */}
// //             <div className="lg:col-span-2 space-y-6">
// //               {/* Image/Video Gallery with Carousel */}
// //               <Card className="overflow-hidden rounded-2xl">
// //                 {(() => {
// //                   const validPhotos = (listing.photos || []).filter(
// //                     (photo): photo is string =>
// //                       typeof photo === "string" && photo.trim() !== ""
// //                   );
// //                   const hasVideo =
// //                     listing.video &&
// //                     typeof listing.video === "string" &&
// //                     listing.video.trim() !== "";
// //                   const videoPath = hasVideo
// //                     ? listing.video!.replace(/^\/+/, "")
// //                     : "";
// //                   const totalItems = (hasVideo ? 1 : 0) + validPhotos.length;
// //                   const hasMultipleItems = totalItems > 1;
// //                   const defaultImage =
// //                     "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=675&fit=crop";

// //                   return (
// //                     <div className="relative">
// //                       {totalItems > 0 ? (
// //                         <Carousel
// //                           setApi={setCarouselApi}
// //                           className="w-full"
// //                           opts={{ loop: true }}
// //                         >
// //                           <CarouselContent>
// //                             {/* Photos first */}
// //                             {validPhotos.map((photo, index) => {
// //                               const photoPath = photo.replace(/^\/+/, "");
// //                               return (
// //                                 <CarouselItem key={`photo-${index}`}>
// //                                   <div
// //                                     className="aspect-[3/2] relative bg-muted cursor-pointer"
// //                                     onClick={() => {
// //                                       setLightboxIndex(index);
// //                                       setLightboxOpen(true);
// //                                     }}
// //                                   >
// //                                     <img
// //                                       src={getFullImageUrl(photoPath)}
// //                                       alt={`${listing.title} - ${index + 1}`}
// //                                       loading={index === 0 ? "eager" : "lazy"}
// //                                       decoding="async"
// //                                       sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px"
// //                                       className="w-full h-full object-cover object-center bg-muted"
// //                                       data-testid={`img-listing-${index}`}
// //                                     />
// //                                     <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
// //                                       <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
// //                                         {t("detail.clickToEnlarge") ||
// //                                           "Click to enlarge"}
// //                                       </div>
// //                                     </div>
// //                                     {/* Favorite Button - on each photo */}
// //                                     <button
// //                                       type="button"
// //                                       style={{
// //                                         position: "absolute",
// //                                         top: "12px",
// //                                         left: "12px",
// //                                         zIndex: 50,
// //                                       }}
// //                                       className={`h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm shadow-lg transition-all duration-200 flex items-center justify-center ${
// //                                         isFavorite(listing.id)
// //                                           ? "text-red-500"
// //                                           : "text-white"
// //                                       }`}
// //                                       onClick={(e) => {
// //                                         e.stopPropagation();
// //                                         toggleFavorite(listing.id);
// //                                       }}
// //                                       data-testid="button-favorite-detail"
// //                                     >
// //                                       <Heart
// //                                         className={`h-5 w-5 ${
// //                                           isFavorite(listing.id)
// //                                             ? "fill-current"
// //                                             : ""
// //                                         }`}
// //                                       />
// //                                     </button>
// //                                   </div>
// //                                 </CarouselItem>
// //                               );
// //                             })}
// //                             {/* Video last if exists */}
// //                             {hasVideo && (
// //                               <CarouselItem key="video">
// //                                 <div
// //                                   className="aspect-[3/2] relative bg-black cursor-pointer"
// //                                   onClick={() => {
// //                                     setLightboxIndex(validPhotos.length);
// //                                     setLightboxOpen(true);
// //                                   }}
// //                                 >
// //                                   <video
// //                                     src={`/objects/${videoPath}`}
// //                                     className="w-full h-full object-contain pointer-events-none"
// //                                     preload="metadata"
// //                                     data-testid="video-listing-main"
// //                                   >
// //                                     {t("video.browserNotSupported") ||
// //                                       "Your browser does not support the video tag."}
// //                                   </video>
// //                                   <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
// //                                     <Video className="h-4 w-4" />
// //                                     <span>
// //                                       {t("video.watchVideo") || "Video"}
// //                                     </span>
// //                                   </div>
// //                                   <div className="absolute inset-0 flex items-center justify-center">
// //                                     <div className="bg-black/60 text-white p-4 rounded-full">
// //                                       <Play className="h-12 w-12" />
// //                                     </div>
// //                                   </div>
// //                                 </div>
// //                               </CarouselItem>
// //                             )}
// //                           </CarouselContent>

// //                           {/* Navigation arrows - flex container ensures proper positioning */}
// //                           {hasMultipleItems && (
// //                             <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
// //                               <Button
// //                                 variant="outline"
// //                                 size="icon"
// //                                 className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
// //                                 onClick={() => carouselApi?.scrollPrev()}
// //                                 data-testid="button-photo-prev"
// //                               >
// //                                 <ChevronLeft className="h-6 w-6" />
// //                               </Button>
// //                               <Button
// //                                 variant="outline"
// //                                 size="icon"
// //                                 className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
// //                                 onClick={() => carouselApi?.scrollNext()}
// //                                 data-testid="button-photo-next"
// //                               >
// //                                 <ChevronRight className="h-6 w-6" />
// //                               </Button>
// //                             </div>
// //                           )}

// //                           {/* Media counter */}
// //                           {hasMultipleItems && (
// //                             <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
// //                               {hasVideo &&
// //                               currentPhotoIndex === validPhotos.length ? (
// //                                 <Video className="h-3 w-3" />
// //                               ) : null}
// //                               <span>
// //                                 {currentPhotoIndex + 1} / {totalItems}
// //                               </span>
// //                             </div>
// //                           )}
// //                         </Carousel>
// //                       ) : (
// //                         <div className="aspect-[3/2] relative bg-muted">
// //                           <img
// //                             src={defaultImage}
// //                             alt={listing.title}
// //                             loading="eager"
// //                             decoding="async"
// //                             className="w-full h-full object-cover object-center bg-muted"
// //                             data-testid="img-listing-main"
// //                           />
// //                         </div>
// //                       )}

// //                       {/* TOP Listing badge */}
// //                       {listing.isTopListing && (
// //                         <div className="absolute top-3 right-3 z-20">
// //                           <Badge className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black border-2 border-amber-300 rounded-lg px-4 py-2 shadow-[0_4px_12px_rgba(251,191,36,0.6)] text-sm font-bold flex items-center gap-1.5 animate-pulse">
// //                             <Star className="w-4 h-4 fill-black" />
// //                             <span className="uppercase tracking-wide">
// //                               {t("detail.topListing")}
// //                             </span>
// //                           </Badge>
// //                         </div>
// //                       )}

// //                       {/* Topovat Button - Detail Page */}
// //                       {canPromote && (
// //                         <button
// //                           onClick={() =>
// //                             promoteToTopMutation.mutate(listing.id)
// //                           }
// //                           disabled={promoteToTopMutation.isPending}
// //                           className="absolute top-3 right-3 z-20 group"
// //                           data-testid="button-topovat-detail"
// //                         >
// //                           <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-xl px-5 py-2.5 shadow-[0_4px_15px_rgba(251,191,36,0.5)] text-base font-bold flex items-center gap-2 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.7)] hover:scale-105 border-2 border-amber-300">
// //                             {promoteToTopMutation.isPending ? (
// //                               <Loader2 className="w-5 h-5 animate-spin" />
// //                             ) : (
// //                               <Crown className="w-5 h-5" />
// //                             )}
// //                             <span className="uppercase tracking-wide">
// //                               {t("listings.topovat")}
// //                             </span>
// //                           </div>
// //                         </button>
// //                       )}
// //                     </div>
// //                   );
// //                 })()}

// //                 {/* Thumbnail strip for video and photos */}
// //                 {(() => {
// //                   const validPhotos = (listing.photos || []).filter(
// //                     (photo): photo is string =>
// //                       typeof photo === "string" && photo.trim() !== ""
// //                   );
// //                   const hasVideo =
// //                     listing.video &&
// //                     typeof listing.video === "string" &&
// //                     listing.video.trim() !== "";
// //                   const totalItems = (hasVideo ? 1 : 0) + validPhotos.length;

// //                   if (totalItems <= 1) return null;

// //                   return (
// //                     <div className="p-3 bg-muted/50">
// //                       <div className="flex gap-2 overflow-x-auto pb-1">
// //                         {/* Photo thumbnails first */}
// //                         {validPhotos.map((photo, index) => {
// //                           const photoPath = photo.replace(/^\/+/, "");
// //                           const isActive = index === currentPhotoIndex;
// //                           return (
// //                             <button
// //                               key={index}
// //                               onClick={() => scrollToPhoto(index)}
// //                               className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
// //                                 isActive
// //                                   ? "border-primary ring-2 ring-primary/30"
// //                                   : "border-transparent hover:border-primary/50"
// //                               }`}
// //                               data-testid={`button-thumbnail-${index}`}
// //                             >
// //                               <img
// //                                 src={getThumbnailUrl(photoPath)}
// //                                 alt={`Thumbnail ${index + 1}`}
// //                                 loading="lazy"
// //                                 decoding="async"
// //                                 sizes="64px"
// //                                 className="w-full h-full object-cover"
// //                               />
// //                             </button>
// //                           );
// //                         })}
// //                         {/* Video thumbnail last */}
// //                         {hasVideo && (
// //                           <button
// //                             onClick={() => scrollToPhoto(validPhotos.length)}
// //                             className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
// //                               currentPhotoIndex === validPhotos.length
// //                                 ? "border-[#B8860B] ring-2 ring-[#B8860B]/30"
// //                                 : "border-transparent hover:border-[#B8860B]/50"
// //                             }`}
// //                             data-testid="button-thumbnail-video"
// //                           >
// //                             <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
// //                               <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] flex items-center justify-center">
// //                                 <Play className="w-4 h-4 text-black ml-0.5" />
// //                               </div>
// //                             </div>
// //                           </button>
// //                         )}
// //                       </div>
// //                     </div>
// //                   );
// //                 })()}
// //               </Card>

// //               {/* Title and basic info */}
// //               <div className="space-y-4">
// //                 <div>
// //                   <h1
// //                     className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
// //                     data-testid="text-listing-title"
// //                   >
// //                     {listing.title}
// //                   </h1>
// //                   <p className="text-lg text-black dark:text-white">
// //                     {listing.brand} {listing.model}
// //                   </p>
// //                 </div>

// //                 <div className="flex flex-wrap gap-6">
// //                   {listing.vehicleType &&
// //                     (() => {
// //                       const VehicleIcon = getVehicleTypeIcon(
// //                         listing.vehicleType
// //                       );
// //                       return VehicleIcon ? (
// //                         <div className="flex items-center gap-2 text-black dark:text-white">
// //                           <VehicleIcon className="w-5 h-5 text-[#B8860B]" />
// //                           <span className="font-medium">
// //                             {getVehicleTypeLabel(listing.vehicleType)}
// //                           </span>
// //                         </div>
// //                       ) : null;
// //                     })()}
// //                   <div className="flex items-center gap-2 text-black dark:text-white">
// //                     <Calendar className="w-5 h-5 text-[#B8860B]" />
// //                     <span className="font-medium">{listing.year}</span>
// //                   </div>
// //                   <div className="flex items-center gap-2 text-black dark:text-white">
// //                     <Gauge className="w-5 h-5 text-[#B8860B]" />
// //                     <span className="font-medium">
// //                       {listing.mileage.toLocaleString()} км
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center gap-2 text-black dark:text-white">
// //                     <Fuel className="w-5 h-5 text-[#B8860B]" />
// //                     <span className="font-medium">
// //                       {getFuelTypeLabel(listing.fuelType)}
// //                     </span>
// //                   </div>
// //                   <div className="flex items-center gap-2 text-black dark:text-white">
// //                     <MapPin className="w-5 h-5 text-[#B8860B]" />
// //                     <span className="font-medium">
// //                       {getLocalizedRegion(listing.region)}
// //                     </span>
// //                   </div>
// //                 </div>
// //               </div>

// //               <Separator />

// //               {/* Description */}
// //               {listing.description && (
// //                 <Card className="rounded-2xl overflow-hidden">
// //                   <CardContent className="p-0">
// //                     <div className="bg-gradient-to-r from-[#B8860B]/5 via-[#B8860B]/10 to-[#B8860B]/5 px-6 py-4 md:px-8 md:py-5 border-b border-[#B8860B]/10">
// //                       <div className="flex items-center gap-3">
// //                         <div className="p-2.5 rounded-xl bg-[#B8860B]/15 shadow-sm">
// //                           <FileText className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <h2 className="text-xl md:text-2xl font-semibold text-[#B8860B]">
// //                           {t("detail.description")}
// //                         </h2>
// //                       </div>
// //                     </div>
// //                     <div className="p-6 md:p-8">
// //                       <div className="relative">
// //                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B8860B]/40 via-[#B8860B]/20 to-transparent rounded-full" />
// //                         <p
// //                           className="pl-5 text-black dark:text-white leading-relaxed md:leading-loose text-base md:text-lg whitespace-pre-wrap font-medium tracking-wide"
// //                           data-testid="text-description"
// //                         >
// //                           {listing.description}
// //                         </p>
// //                       </div>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               )}

// //               {/* Technical Specifications */}
// //               <Card className="rounded-2xl">
// //                 <CardContent className="p-6 md:p-8">
// //                   <h2 className="text-2xl font-semibold mb-6">
// //                     {t("detail.technicalSpecs")}
// //                   </h2>
// //                   <div className="grid grid-cols-2 gap-4 md:gap-6">
// //                     {listing.transmission && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Settings className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.transmission")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-transmission"
// //                           >
// //                             {getTransmissionLabel(listing.transmission)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.fuelType && listing.fuelType.length > 0 && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Fuel className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.fuel")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-fuel"
// //                           >
// //                             {getFuelTypeLabel(listing.fuelType)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.bodyType && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Car className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.bodyType")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-body-type"
// //                           >
// //                             {getLocalizedBodyType(listing.bodyType)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.color && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Palette className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.color")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-color"
// //                           >
// //                             {getLocalizedColor(listing.color)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.trim && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Package className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("listing.trim")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-trim"
// //                           >
// //                             {listing.trim}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.driveType && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Gauge className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.driveType")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-drive-type"
// //                           >
// //                             {getLocalizedDriveType(listing.driveType)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.engineVolume && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Activity className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.engine")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-engine"
// //                           >
// //                             {listing.engineVolume} {t("detail.engineUnit")}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.power && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Zap className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.power")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-power"
// //                           >
// //                             {listing.power} kW
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.doors && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <DoorOpen className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.doors")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-doors"
// //                           >
// //                             {listing.doors}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.seats && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Users className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.seats")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-seats"
// //                           >
// //                             {listing.seats}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.owners && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <User className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.owners")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-owners"
// //                           >
// //                             {listing.owners}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.airbags && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Shield className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.airbags")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-airbags"
// //                           >
// //                             {listing.airbags}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.sellerType && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Store className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.sellerType")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-seller-type"
// //                           >
// //                             {listing.sellerType === "private"
// //                               ? t("detail.private")
// //                               : t("detail.dealer")}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.euroEmission && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <FileText className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.euroEmission")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-euro-emission"
// //                           >
// //                             {t(`filters.${listing.euroEmission}`)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.stkValidUntil && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Shield className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.stkValidUntil")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-stk-valid"
// //                           >
// //                             {new Date(listing.stkValidUntil).toLocaleDateString(
// //                               language === "cs"
// //                                 ? "cs-CZ"
// //                                 : language === "uk"
// //                                 ? "uk-UA"
// //                                 : "en-US"
// //                             )}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.hasServiceBook && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <FileText className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.serviceBook")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-service-book"
// //                           >
// //                             {t("common.yes")}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.isImported && listing.importCountry && (
// //                       <div className="flex items-start gap-3">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <Globe className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.importedFrom")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white"
// //                             data-testid="text-import-country"
// //                           >
// //                             {getLocalizedImportCountry(listing.importCountry)}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {listing.vin && (
// //                       <div className="flex items-start gap-3 col-span-2">
// //                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
// //                           <FileText className="w-5 h-5 text-[#B8860B]" />
// //                         </div>
// //                         <div className="flex-1 space-y-1 min-w-0">
// //                           <p className="text-sm text-muted-foreground">
// //                             {t("detail.vin")}
// //                           </p>
// //                           <p
// //                             className="font-semibold text-black dark:text-white font-mono uppercase break-all"
// //                             data-testid="text-vin"
// //                           >
// //                             {listing.vin}
// //                           </p>
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </CardContent>
// //               </Card>

// //               {/* Equipment & Comfort */}
// //               {listing.equipment && listing.equipment.length > 0 && (
// //                 <Card className="rounded-2xl">
// //                   <CardContent className="p-6 md:p-8">
// //                     <h2 className="text-2xl font-semibold mb-6">
// //                       {t("detail.equipment")}
// //                     </h2>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                       {listing.equipment.map((equipmentValue) => {
// //                         const option = equipmentOptions.find(
// //                           (opt) => opt.value === equipmentValue
// //                         );
// //                         return option ? (
// //                           <div
// //                             key={equipmentValue}
// //                             className="flex items-center gap-2"
// //                             data-testid={`equipment-${equipmentValue}`}
// //                           >
// //                             <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
// //                             <span className="text-sm text-black dark:text-white">
// //                               {option.label}
// //                             </span>
// //                           </div>
// //                         ) : null;
// //                       })}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               )}

// //               {/* Extras */}
// //               {listing.extras && listing.extras.length > 0 && (
// //                 <Card className="rounded-2xl">
// //                   <CardContent className="p-6 md:p-8">
// //                     <h2 className="text-2xl font-semibold mb-6">
// //                       {t("detail.extras")}
// //                     </h2>
// //                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
// //                       {listing.extras.map((extraValue) => {
// //                         const option = extrasOptions.find(
// //                           (opt) => opt.value === extraValue
// //                         );
// //                         return option ? (
// //                           <div
// //                             key={extraValue}
// //                             className="flex items-center gap-2"
// //                             data-testid={`extra-${extraValue}`}
// //                           >
// //                             <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
// //                             <span className="text-sm text-black dark:text-white">
// //                               {option.label}
// //                             </span>
// //                           </div>
// //                         ) : null;
// //                       })}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               )}
// //             </div>

// //             {/* Sidebar */}
// //             <div className="space-y-6">
// //               {/* Price & Action Card */}
// //               <Card className="sticky top-24 rounded-2xl shadow-xl">
// //                 <CardContent className="p-6 md:p-8 space-y-6">
// //                   <div>
// //                     <p className="text-sm text-muted-foreground mb-2">
// //                       {t("detail.price")}
// //                     </p>
// //                     <div className="flex items-baseline gap-2">
// //                       <p
// //                         className="text-4xl font-bold text-primary"
// //                         data-testid="text-price"
// //                       >
// //                         {new Intl.NumberFormat("cs-CZ").format(
// //                           Number(listing.price)
// //                         )}
// //                       </p>
// //                       <span className="text-2xl font-semibold text-primary/70">
// //                         Kč
// //                       </span>
// //                     </div>
// //                     {listing.vatDeductible && (
// //                       <div className="mt-3 space-y-1">
// //                         <p className="text-sm text-muted-foreground">
// //                           {t("detail.vatIncluded")}
// //                         </p>
// //                         <p
// //                           className="text-lg font-semibold text-primary"
// //                           data-testid="text-price-without-vat"
// //                         >
// //                           {t("detail.priceWithoutVat")}:{" "}
// //                           {new Intl.NumberFormat("cs-CZ").format(
// //                             Math.round(Number(listing.price) / 1.21)
// //                           )}{" "}
// //                           Kč
// //                         </p>
// //                       </div>
// //                     )}
// //                   </div>

// //                   <Separator />

// //                   <div className="space-y-3">
// //                     <Button
// //                       className="w-full"
// //                       size="lg"
// //                       onClick={() => setShowContactDialog(true)}
// //                       data-testid="button-contact-seller"
// //                     >
// //                       <Phone className="w-5 h-5 mr-2" />
// //                       {t("detail.contactSeller")}
// //                     </Button>
// //                     <div className="grid grid-cols-2 gap-3">
// //                       <Button
// //                         variant="outline"
// //                         size="lg"
// //                         onClick={handleToggleFavorite}
// //                         data-testid="button-favorite"
// //                       >
// //                         <Heart
// //                           className={`w-5 h-5 mr-2 ${
// //                             listing && isFavorite(listing.id)
// //                               ? "fill-primary text-primary"
// //                               : ""
// //                           }`}
// //                         />
// //                         {t("detail.favorite")}
// //                       </Button>
// //                       <Button
// //                         variant="outline"
// //                         size="lg"
// //                         onClick={handleShare}
// //                         data-testid="button-share"
// //                       >
// //                         <Share2 className="w-5 h-5 mr-2" />
// //                         {t("detail.share")}
// //                       </Button>
// //                     </div>
// //                   </div>

// //                   <Separator />

// //                   <div className="space-y-3 text-sm">
// //                     <div className="flex justify-between">
// //                       <span className="text-muted-foreground">
// //                         {t("detail.postedOn")}
// //                       </span>
// //                       <span className="font-medium">
// //                         {format(new Date(listing.createdAt), "dd.MM.yyyy")}
// //                       </span>
// //                     </div>
// //                     {listing.region && (
// //                       <div className="flex justify-between">
// //                         <span className="text-muted-foreground">
// //                           {t("detail.location")}
// //                         </span>
// //                         <span className="font-medium">
// //                           {getLocalizedRegion(listing.region)}
// //                         </span>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </CardContent>
// //               </Card>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Contact Seller Dialog */}
// //       <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
// //         <DialogContent data-testid="dialog-contact-seller">
// //           <DialogHeader>
// //             <DialogTitle>{t("detail.contactInfo")}</DialogTitle>
// //             <DialogDescription>{t("detail.contactSeller")}</DialogDescription>
// //           </DialogHeader>
// //           <div className="space-y-4 py-4">
// //             {seller?.email || listing.phone ? (
// //               <>
// //                 {seller?.email && (
// //                   <div
// //                     className="flex items-center gap-3"
// //                     data-testid="contact-email"
// //                   >
// //                     <Mail className="h-5 w-5 text-muted-foreground" />
// //                     <div>
// //                       <p className="text-sm font-medium text-muted-foreground">
// //                         {t("detail.email")}
// //                       </p>
// //                       <a
// //                         href={`mailto:${seller.email}`}
// //                         className="text-base hover:underline"
// //                       >
// //                         {seller.email}
// //                       </a>
// //                     </div>
// //                   </div>
// //                 )}
// //                 {listing.phone && (
// //                   <div
// //                     className="flex items-center gap-3"
// //                     data-testid="contact-phone"
// //                   >
// //                     <Phone className="h-5 w-5 text-muted-foreground" />
// //                     <div>
// //                       <p className="text-sm font-medium text-muted-foreground">
// //                         {t("detail.phone")}
// //                       </p>
// //                       <a
// //                         href={`tel:${listing.phone}`}
// //                         className="text-base hover:underline"
// //                       >
// //                         {listing.phone}
// //                       </a>
// //                     </div>
// //                   </div>
// //                 )}
// //               </>
// //             ) : (
// //               <p
// //                 className="text-sm text-muted-foreground"
// //                 data-testid="no-contact-info"
// //               >
// //                 {t("detail.noContactInfo")}
// //               </p>
// //             )}
// //           </div>
// //         </DialogContent>
// //       </Dialog>

// //       {/* Media Lightbox for fullscreen photo/video viewing */}
// //       <MediaLightbox
// //         photos={(listing.photos || []).filter(
// //           (photo): photo is string =>
// //             typeof photo === "string" && photo.trim() !== ""
// //         )}
// //         video={
// //           listing.video &&
// //           typeof listing.video === "string" &&
// //           listing.video.trim() !== ""
// //             ? listing.video
// //             : null
// //         }
// //         initialIndex={lightboxIndex}
// //         isOpen={lightboxOpen}
// //         onClose={() => setLightboxOpen(false)}
// //       />
// //     </>
// //   );
// // }
// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRoute, Link } from "wouter";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import {
//   ArrowLeft,
//   MapPin,
//   Calendar,
//   Gauge,
//   Fuel,
//   Heart,
//   Share2,
//   Phone,
//   Check,
//   Settings,
//   Car,
//   Palette,
//   Package,
//   Activity,
//   Zap,
//   DoorOpen,
//   Users,
//   Globe,
//   Bus,
//   Truck,
//   Bike,
//   User,
//   Shield,
//   Store,
//   Mail,
//   Star,
//   FileText,
//   Crown,
//   Loader2,
//   ChevronLeft,
//   ChevronRight,
//   Video,
//   Play,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Separator } from "@/components/ui/separator";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   type CarouselApi,
// } from "@/components/ui/carousel";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { useTranslation, useLocalizedOptions } from "@/lib/translations";
// import { useFavorites } from "@/contexts/FavoritesContext";
// import { useAuth } from "@/hooks/useAuth";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { format } from "date-fns";
// import Header from "@/components/Header";
// import { MediaLightbox } from "@/components/MediaLightbox";
// import {
//   SEO,
//   generateVehicleSchema,
//   generateBreadcrumbSchema,
//   generateListingKeywords,
// } from "@/components/SEO";
// import { useLanguage } from "@/contexts/LanguageContext";
// import type { Listing } from "@shared/schema";
// import {
//   getCardImageUrl,
//   getFullImageUrl,
//   getThumbnailUrl,
// } from "@/lib/imageOptimizer";
// import { ResponsiveImage } from "@/components/ResponsiveImage";

// // Type for public contact information returned by /api/users/:id
// type PublicContact = {
//   id: string;
//   email: string;
//   phone: string | null;
//   firstName: string | null;
//   lastName: string | null;
// };

// function PageLoaderInline({ text }: { text: string }) {
//   return (
//     <div className="min-h-screen flex items-center justify-center">
//       <div className="text-center space-y-4">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
//         <p className="text-lg text-muted-foreground">{text}</p>
//       </div>
//     </div>
//   );
// }

// export default function ListingDetailPage() {
//   const t = useTranslation();
//   const { language } = useLanguage();
//   const localizedOptions = useLocalizedOptions();
//   const { toggleFavorite, isFavorite } = useFavorites();
//   const { toast } = useToast();
//   const { user } = useAuth();

//   const [, params] = useRoute("/listing/:id");
//   const listingId = params?.id;

//   const [showContactDialog, setShowContactDialog] = useState(false);
//   const [carouselApi, setCarouselApi] = useState<CarouselApi>();
//   const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [lightboxIndex, setLightboxIndex] = useState(0);

//   const {
//     data: listing,
//     isLoading,
//     error,
//   } = useQuery<Listing>({
//     queryKey: [`/api/listings/${listingId}`],
//     enabled: !!listingId,
//   });

//   const { data: seller } = useQuery<PublicContact>({
//     queryKey: [`/api/users/${listing?.userId}`],
//     enabled: !!listing?.userId,
//   });

//   // Stripe redirect: promoted=success/cancelled
//   useEffect(() => {
//     if (!listingId) return;

//     const urlParams = new URLSearchParams(window.location.search);
//     const promotedParam = urlParams.get("promoted");

//     if (promotedParam === "success") {
//       toast({
//         title: t("listings.promoteSuccess"),
//         description: t("listings.promoteSuccessDescription"),
//       });
//       queryClient.invalidateQueries({
//         queryKey: [`/api/listings/${listingId}`],
//       });

//       const newUrl = new URL(window.location.href);
//       newUrl.searchParams.delete("promoted");
//       window.history.replaceState({}, "", newUrl.toString());
//     }

//     if (promotedParam === "cancelled") {
//       toast({
//         variant: "destructive",
//         title: t("listings.promoteCancelled"),
//         description: t("listings.promoteCancelledDescription"),
//       });
//       const newUrl = new URL(window.location.href);
//       newUrl.searchParams.delete("promoted");
//       window.history.replaceState({}, "", newUrl.toString());
//     }
//   }, [listingId, t, toast]);

//   // --- Media normalization (важливо для кешу/стабільних URL)
//   const photoKeys = useMemo(() => {
//     const raw = listing?.photos ?? [];
//     return raw
//       .filter((p): p is string => typeof p === "string" && p.trim() !== "")
//       .map((p) => p.replace(/^\/+/, "")); // важливо: стабільний ключ без leading "/"
//   }, [listing?.photos]);

//   const videoKey = useMemo(() => {
//     const v = listing?.video;
//     if (!v || typeof v !== "string") return null;
//     const trimmed = v.trim();
//     if (!trimmed) return null;
//     return trimmed.replace(/^\/+/, "");
//   }, [listing?.video]);

//   const hasVideo = !!videoKey;
//   const totalItems = photoKeys.length + (hasVideo ? 1 : 0);
//   const hasMultipleItems = totalItems > 1;

//   // Carousel state tracking
//   useEffect(() => {
//     if (!carouselApi) return;

//     const sync = () =>
//       setCurrentCarouselIndex(carouselApi.selectedScrollSnap());
//     sync();

//     carouselApi.on("select", sync);
//     return () => {
//       // Embla API підтримує off
//       // @ts-ignore
//       carouselApi.off?.("select", sync);
//     };
//   }, [carouselApi]);

//   const scrollToCarouselItem = useCallback(
//     (index: number) => {
//       carouselApi?.scrollTo(index);
//     },
//     [carouselApi]
//   );

//   const openLightboxAt = useCallback((index: number) => {
//     setLightboxIndex(index);
//     setLightboxOpen(true);
//   }, []);

//   // Promote TOP
//   const promoteToTopMutation = useMutation({
//     mutationFn: async (id: string) => {
//       const res = await apiRequest("POST", `/api/listings/${id}/checkout`);
//       return await res.json();
//     },
//     onSuccess: (data: { url: string }) => {
//       if (data?.url) window.location.href = data.url;
//     },
//     onError: (err: any) => {
//       toast({
//         variant: "destructive",
//         title: t("listings.promoteError"),
//         description: err?.message || t("listings.promoteErrorDescription"),
//       });
//     },
//   });

//   const isOwner = !!user && !!listing && user.id === listing.userId;
//   const canPromote = isOwner && !listing?.isTopListing;

//   // --- локалізаційні мапи (швидше за find на кожен рендер)
//   const bodyTypeMap = useMemo(() => {
//     const arr = localizedOptions.getBodyTypes();
//     return new Map(arr.map((x) => [x.value, x.label] as const));
//   }, [localizedOptions]);

//   const colorMap = useMemo(() => {
//     const arr = localizedOptions.getColors();
//     return new Map(arr.map((x) => [x.value, x.label] as const));
//   }, [localizedOptions]);

//   const driveTypeMap = useMemo(() => {
//     const arr = localizedOptions.getDriveTypes();
//     return new Map(arr.map((x) => [x.value, x.label] as const));
//   }, [localizedOptions]);

//   const regionMap = useMemo(() => {
//     const arr = localizedOptions.getRegions();
//     return new Map(arr.map((x) => [x.value, x.label] as const));
//   }, [localizedOptions]);

//   const importCountryMap = useMemo(() => {
//     const arr = localizedOptions.getImportCountries();
//     return new Map(arr.map((x) => [x.value, x.label] as const));
//   }, [localizedOptions]);

//   const getLocalizedBodyType = useCallback(
//     (value: string | null) => (value ? bodyTypeMap.get(value) || value : ""),
//     [bodyTypeMap]
//   );

//   const getLocalizedColor = useCallback(
//     (value: string | null) => (value ? colorMap.get(value) || value : ""),
//     [colorMap]
//   );

//   const getLocalizedDriveType = useCallback(
//     (values: string[] | string | null) => {
//       if (!values) return "";
//       const arr = Array.isArray(values) ? values : [values];
//       return arr.map((v) => driveTypeMap.get(v) || v).join(", ");
//     },
//     [driveTypeMap]
//   );

//   const getLocalizedRegion = useCallback(
//     (value: string | null) => (value ? regionMap.get(value) || value : ""),
//     [regionMap]
//   );

//   const getLocalizedImportCountry = useCallback(
//     (value: string | null) =>
//       value ? importCountryMap.get(value) || value : "",
//     [importCountryMap]
//   );

//   const transmissionLabels = useMemo(
//     () => ({
//       manual: t("filters.manual"),
//       automatic: t("filters.automatic"),
//       robot: t("filters.robot"),
//       cvt: t("filters.cvt"),
//     }),
//     [t]
//   );

//   const fuelLabels = useMemo(
//     () => ({
//       benzin: t("hero.benzin"),
//       diesel: t("hero.diesel"),
//       hybrid: t("hero.hybrid"),
//       electric: t("hero.electric"),
//       lpg: t("hero.lpg"),
//       cng: t("hero.cng"),
//     }),
//     [t]
//   );

//   const getTransmissionLabel = useCallback(
//     (values: string[] | string | null) => {
//       if (!values) return "";
//       const arr = Array.isArray(values) ? values : [values];
//       return arr.map((v) => transmissionLabels[v] || v).join(", ");
//     },
//     [transmissionLabels]
//   );

//   const getFuelTypeLabel = useCallback(
//     (values: string[] | string | null) => {
//       if (!values) return "";
//       const arr = Array.isArray(values) ? values : [values];
//       return arr.map((v) => fuelLabels[v] || v).join(", ");
//     },
//     [fuelLabels]
//   );

//   const getVehicleTypeIcon = useCallback(
//     (
//       type: string | null
//     ): React.ComponentType<{ className?: string }> | null => {
//       if (!type) return null;
//       const icons: Record<
//         string,
//         React.ComponentType<{ className?: string }>
//       > = {
//         cars: Car,
//         vans: Bus,
//         trucks: Truck,
//         motorcycles: Bike,
//       };
//       return icons[type] || null;
//     },
//     []
//   );

//   const getVehicleTypeLabel = useCallback(
//     (type: string | null) => {
//       if (!type) return "";
//       const labels: Record<string, string> = {
//         cars: t("hero.cars"),
//         vans: t("hero.vans"),
//         trucks: t("hero.trucks"),
//         motorcycles: t("hero.motorcycles"),
//       };
//       return labels[type] || type;
//     },
//     [t]
//   );

//   const equipmentOptions = useMemo(
//     () => [
//       { value: "heatedSeats", label: t("filters.heatedSeats") },
//       { value: "electricWindows", label: t("filters.electricWindows") },
//       { value: "leatherInterior", label: t("filters.leatherInterior") },
//       { value: "climateControl", label: t("filters.climateControl") },
//       { value: "cruiseControl", label: t("filters.cruiseControl") },
//       { value: "parkingSensors", label: t("filters.parkingSensors") },
//       { value: "rearCamera", label: t("filters.rearCamera") },
//       { value: "navigationSystem", label: t("filters.navigationSystem") },
//       { value: "bluetooth", label: t("filters.bluetooth") },
//       { value: "keylessEntry", label: t("filters.keylessEntry") },
//       { value: "ledHeadlights", label: t("filters.ledHeadlights") },
//       { value: "sunroof", label: t("filters.sunroof") },
//       { value: "alloyWheels", label: t("filters.alloyWheels") },
//       { value: "ventilatedSeats", label: t("filters.ventilatedSeats") },
//       { value: "memorySeats", label: t("filters.memorySeats") },
//       { value: "massageSeats", label: t("filters.massageSeats") },
//       { value: "adaptiveCruise", label: t("filters.adaptiveCruise") },
//       { value: "laneKeeping", label: t("filters.laneKeeping") },
//       { value: "blindSpot", label: t("filters.blindSpot") },
//       { value: "rainSensor", label: t("filters.rainSensor") },
//       { value: "lightSensor", label: t("filters.lightSensor") },
//       { value: "heatedSteeringWheel", label: t("filters.heatedSteeringWheel") },
//       { value: "panoramicRoof", label: t("filters.panoramicRoof") },
//       { value: "electricSeats", label: t("filters.electricSeats") },
//       { value: "parkingAssist", label: t("filters.parkingAssist") },
//       { value: "headUpDisplay", label: t("filters.headUpDisplay") },
//       { value: "wirelessCharging", label: t("filters.wirelessCharging") },
//       { value: "towHitch", label: t("filters.towHitch") },
//     ],
//     [t]
//   );

//   const extrasOptions = useMemo(
//     () => [
//       { value: "vinCheck", label: t("filters.vinCheck") },
//       { value: "serviceBook", label: t("filters.serviceBook") },
//       { value: "notDamaged", label: t("filters.notDamaged") },
//       { value: "notPainted", label: t("filters.notPainted") },
//       { value: "warranty", label: t("filters.warranty") },
//       { value: "exchange", label: t("filters.exchange") },
//     ],
//     [t]
//   );

//   const handleToggleFavorite = useCallback(() => {
//     if (!listing) return;

//     const isCurrentlyFavorite = isFavorite(listing.id);
//     toggleFavorite(listing.id);

//     toast({
//       title: isCurrentlyFavorite
//         ? t("favorites.removed")
//         : t("favorites.added"),
//       description: isCurrentlyFavorite
//         ? t("favorites.removedDescription")
//         : t("favorites.addedDescription"),
//     });
//   }, [listing, isFavorite, toggleFavorite, toast, t]);

//   const handleShare = useCallback(async () => {
//     if (!listing) return;

//     const shareUrl = window.location.href;
//     const shareData = {
//       title: listing.title,
//       text: `${listing.brand} ${
//         listing.model
//       } - ${listing.price.toLocaleString()} Kč`,
//       url: shareUrl,
//     };

//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//         toast({
//           title: t("detail.shareSuccess"),
//           description: t("detail.shareSuccessDescription"),
//         });
//       } catch (e) {
//         if ((e as Error)?.name !== "AbortError") console.error(e);
//       }
//       return;
//     }

//     try {
//       await navigator.clipboard.writeText(shareUrl);
//       toast({
//         title: t("detail.linkCopied"),
//         description: t("detail.linkCopiedDescription"),
//       });
//     } catch (e) {
//       console.error(e);
//       toast({
//         title: t("detail.shareError"),
//         description: t("detail.shareErrorDescription"),
//         variant: "destructive",
//       });
//     }
//   }, [listing, toast, t]);

//   // --- SEO (memoized)
//   const listingUrl = useMemo(
//     () => (listing ? `https://nnauto.cz/listing/${listing.id}` : ""),
//     [listing]
//   );

//   const vehicleSchema = useMemo(() => {
//     if (!listing) return null;
//     return generateVehicleSchema({
//       id: listing.id,
//       brand: listing.brand,
//       model: listing.model,
//       year: listing.year,
//       price: Number(listing.price),
//       mileage: listing.mileage,
//       fuelType: listing.fuelType || undefined,
//       transmission: listing.transmission || undefined,
//       color: listing.color || undefined,
//       bodyType: listing.bodyType || undefined,
//       engineVolume: listing.engineVolume || undefined,
//       power: listing.power || undefined,
//       vin: listing.vin || undefined,
//       photos: listing.photos || undefined,
//       description: listing.description || undefined,
//       condition: listing.condition || undefined,
//       sellerType: listing.sellerType || undefined,
//     });
//   }, [listing]);

//   const breadcrumbSchema = useMemo(() => {
//     if (!listing) return null;
//     return generateBreadcrumbSchema([
//       {
//         name:
//           language === "cs" ? "Domů" : language === "uk" ? "Головна" : "Home",
//         url: "https://nnauto.cz/",
//       },
//       {
//         name:
//           language === "cs"
//             ? "Inzeráty"
//             : language === "uk"
//             ? "Оголошення"
//             : "Listings",
//         url: "https://nnauto.cz/listings",
//       },
//       {
//         name: `${listing.year} ${listing.brand} ${listing.model}`,
//         url: `https://nnauto.cz/listing/${listing.id}`,
//       },
//     ]);
//   }, [listing, language]);

//   const seoTitle = useMemo(() => {
//     if (!listing) return "";
//     const price = Number(listing.price).toLocaleString(
//       language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US"
//     );
//     return `${listing.year} ${listing.brand} ${listing.model} - ${price} ${
//       language === "en" ? "CZK" : "Kč"
//     } | Prodej`;
//   }, [listing, language]);

//   const seoDescription = useMemo(() => {
//     if (!listing) return "";
//     return (
//       listing.description?.substring(0, 155) ||
//       `Prodej ${listing.year} ${listing.brand} ${
//         listing.model
//       }. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km. ${
//         listing.fuelType?.[0] || ""
//       }, ${listing.transmission?.[0] || ""}. Cena ${Number(
//         listing.price
//       ).toLocaleString("cs-CZ")} Kč. ${
//         language === "cs"
//           ? "Koupit na NNAuto.cz"
//           : language === "uk"
//           ? "Купити на NNAuto.cz"
//           : "Buy on NNAuto.cz"
//       }`
//     );
//   }, [listing, language]);

//   const seoImage = useMemo(() => {
//     const first = photoKeys[0];
//     return first ? `https://nnauto.cz/objects/${first}` : undefined;
//   }, [photoKeys]);

//   const seoKeywords = useMemo(() => {
//     if (!listing) return [];
//     return generateListingKeywords({
//       brand: listing.brand,
//       model: listing.model,
//       year: listing.year,
//       bodyType: listing.bodyType || undefined,
//       fuelType: listing.fuelType || undefined,
//       region: listing.region || undefined,
//       condition: listing.condition || undefined,
//     });
//   }, [listing]);

//   if (isLoading) {
//     return (
//       <>
//         <Header />
//         <PageLoaderInline text={t("detail.loading")} />
//       </>
//     );
//   }

//   if (error || !listing) {
//     return (
//       <>
//         <Header />
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="text-center space-y-4">
//             <h1 className="text-3xl font-bold">{t("detail.notFound")}</h1>
//             <p className="text-muted-foreground">{t("detail.errorLoading")}</p>
//             <Link href="/listings">
//               <Button data-testid="button-back-listings">
//                 <ArrowLeft className="w-4 h-4 mr-2" />
//                 {t("detail.backToListings")}
//               </Button>
//             </Link>
//           </div>
//         </div>
//       </>
//     );
//   }

//   return (
//     <>
//       <SEO
//         title={seoTitle}
//         description={seoDescription}
//         keywords={seoKeywords}
//         image={seoImage}
//         url={listingUrl}
//         type="product"
//         locale={
//           language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
//         }
//         alternateLanguages={[
//           { lang: "cs", url: listingUrl },
//           { lang: "uk", url: listingUrl },
//           { lang: "en", url: listingUrl },
//         ]}
//         structuredData={{
//           "@context": "https://schema.org",
//           "@graph": [
//             ...(vehicleSchema ? [vehicleSchema] : []),
//             ...(breadcrumbSchema ? [breadcrumbSchema] : []),
//           ],
//         }}
//       />

//       <Header />

//       <div className="min-h-screen bg-background">
//         <div className="container mx-auto px-4 py-8 max-w-7xl">
//           {/* Back button */}
//           <Button
//             variant="ghost"
//             className="mb-6"
//             data-testid="button-back"
//             onClick={() => {
//               if (window.history.length > 1) window.history.back();
//               else window.location.href = "/listings";
//             }}
//           >
//             <ArrowLeft className="w-4 h-4 mr-2" />
//             {t("detail.backToListings")}
//           </Button>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Main content */}
//             <div className="lg:col-span-2 space-y-6">
//               {/* Image/Video Gallery */}
//               <Card className="overflow-hidden rounded-2xl">
//                 <div className="relative">
//                   {totalItems > 0 ? (
//                     <Carousel
//                       setApi={setCarouselApi}
//                       className="w-full"
//                       opts={{ loop: true }}
//                     >
//                       <CarouselContent>
//                         {/* Photos first */}
//                         {photoKeys.map((key, index) => (
//                           <CarouselItem key={`photo-${key}-${index}`}>
//                             <div
//                               className="aspect-[3/2] relative bg-muted cursor-pointer"
//                               onClick={() => openLightboxAt(index)}
//                             >
//                               <ResponsiveImage
//                                 mobileSrc={getCardImageUrl(key)} // ✅ 400px first
//                                 desktopSrc={getFullImageUrl(key)} // ✅ 1200px after check (ПК)
//                                 desktopMinWidth={1024} // lg breakpoint
//                                 upgrade={index === currentCarouselIndex} // ✅ апгрейдимо тільки активний слайд
//                                 alt={`${listing.title} - ${index + 1}`}
//                                 loading={index === 0 ? "eager" : "lazy"}
//                                 decoding="async"
//                                 sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px"
//                                 className="w-full h-full object-cover object-center bg-muted"
//                                 data-testid={`img-listing-${index}`}
//                               />

//                               <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
//                                 <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
//                                   {t("detail.clickToEnlarge") ||
//                                     "Click to enlarge"}
//                                 </div>
//                               </div>

//                               {/* Favorite Button */}
//                               <button
//                                 type="button"
//                                 style={{
//                                   position: "absolute",
//                                   top: "12px",
//                                   left: "12px",
//                                   zIndex: 50,
//                                 }}
//                                 className={`h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm shadow-lg transition-all duration-200 flex items-center justify-center ${
//                                   isFavorite(listing.id)
//                                     ? "text-red-500"
//                                     : "text-white"
//                                 }`}
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleFavorite(listing.id);
//                                 }}
//                                 data-testid="button-favorite-detail"
//                               >
//                                 <Heart
//                                   className={`h-5 w-5 ${
//                                     isFavorite(listing.id) ? "fill-current" : ""
//                                   }`}
//                                 />
//                               </button>
//                             </div>
//                           </CarouselItem>
//                         ))}

//                         {/* Video last */}
//                         {hasVideo && (
//                           <CarouselItem key="video">
//                             <div
//                               className="aspect-[3/2] relative bg-black cursor-pointer"
//                               onClick={() => openLightboxAt(photoKeys.length)}
//                             >
//                               <video
//                                 src={`/objects/${videoKey!}`}
//                                 className="w-full h-full object-contain pointer-events-none"
//                                 preload="metadata"
//                                 data-testid="video-listing-main"
//                               >
//                                 {t("video.browserNotSupported") ||
//                                   "Your browser does not support the video tag."}
//                               </video>
//                               <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
//                                 <Video className="h-4 w-4" />
//                                 <span>{t("video.watchVideo") || "Video"}</span>
//                               </div>
//                               <div className="absolute inset-0 flex items-center justify-center">
//                                 <div className="bg-black/60 text-white p-4 rounded-full">
//                                   <Play className="h-12 w-12" />
//                                 </div>
//                               </div>
//                             </div>
//                           </CarouselItem>
//                         )}
//                       </CarouselContent>

//                       {/* Navigation arrows */}
//                       {hasMultipleItems && (
//                         <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
//                             onClick={() => carouselApi?.scrollPrev()}
//                             data-testid="button-photo-prev"
//                           >
//                             <ChevronLeft className="h-6 w-6" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
//                             onClick={() => carouselApi?.scrollNext()}
//                             data-testid="button-photo-next"
//                           >
//                             <ChevronRight className="h-6 w-6" />
//                           </Button>
//                         </div>
//                       )}

//                       {/* Media counter */}
//                       {hasMultipleItems && (
//                         <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
//                           {hasVideo &&
//                           currentCarouselIndex === photoKeys.length ? (
//                             <Video className="h-3 w-3" />
//                           ) : null}
//                           <span>
//                             {currentCarouselIndex + 1} / {totalItems}
//                           </span>
//                         </div>
//                       )}
//                     </Carousel>
//                   ) : (
//                     <div className="aspect-[3/2] relative bg-muted">
//                       <img
//                         src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=675&fit=crop"
//                         alt={listing.title}
//                         loading="eager"
//                         decoding="async"
//                         className="w-full h-full object-cover object-center bg-muted"
//                         data-testid="img-listing-main"
//                       />
//                     </div>
//                   )}

//                   {/* TOP badge */}
//                   {listing.isTopListing && (
//                     <div className="absolute top-3 right-3 z-20">
//                       <Badge className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black border-2 border-amber-300 rounded-lg px-4 py-2 shadow-[0_4px_12px_rgba(251,191,36,0.6)] text-sm font-bold flex items-center gap-1.5 animate-pulse">
//                         <Star className="w-4 h-4 fill-black" />
//                         <span className="uppercase tracking-wide">
//                           {t("detail.topListing")}
//                         </span>
//                       </Badge>
//                     </div>
//                   )}

//                   {/* Topovat button */}
//                   {canPromote && (
//                     <button
//                       onClick={() => promoteToTopMutation.mutate(listing.id)}
//                       disabled={promoteToTopMutation.isPending}
//                       className="absolute top-3 right-3 z-20 group"
//                       data-testid="button-topovat-detail"
//                     >
//                       <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-xl px-5 py-2.5 shadow-[0_4px_15px_rgba(251,191,36,0.5)] text-base font-bold flex items-center gap-2 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.7)] hover:scale-105 border-2 border-amber-300">
//                         {promoteToTopMutation.isPending ? (
//                           <Loader2 className="w-5 h-5 animate-spin" />
//                         ) : (
//                           <Crown className="w-5 h-5" />
//                         )}
//                         <span className="uppercase tracking-wide">
//                           {t("listings.topovat")}
//                         </span>
//                       </div>
//                     </button>
//                   )}
//                 </div>

//                 {/* Thumbnail strip */}
//                 {hasMultipleItems && (
//                   <div className="p-3 bg-muted/50">
//                     <div className="flex gap-2 overflow-x-auto pb-1">
//                       {photoKeys.map((key, index) => {
//                         const isActive = index === currentCarouselIndex;
//                         return (
//                           <button
//                             key={`thumb-${key}-${index}`}
//                             onClick={() => scrollToCarouselItem(index)}
//                             className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
//                               isActive
//                                 ? "border-primary ring-2 ring-primary/30"
//                                 : "border-transparent hover:border-primary/50"
//                             }`}
//                             data-testid={`button-thumbnail-${index}`}
//                           >
//                             <img
//                               src={getThumbnailUrl(key)}
//                               alt={`Thumbnail ${index + 1}`}
//                               loading="lazy"
//                               decoding="async"
//                               sizes="64px"
//                               className="w-full h-full object-cover"
//                             />
//                           </button>
//                         );
//                       })}

//                       {hasVideo && (
//                         <button
//                           onClick={() => scrollToCarouselItem(photoKeys.length)}
//                           className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
//                             currentCarouselIndex === photoKeys.length
//                               ? "border-[#B8860B] ring-2 ring-[#B8860B]/30"
//                               : "border-transparent hover:border-[#B8860B]/50"
//                           }`}
//                           data-testid="button-thumbnail-video"
//                         >
//                           <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
//                             <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] flex items-center justify-center">
//                               <Play className="w-4 h-4 text-black ml-0.5" />
//                             </div>
//                           </div>
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </Card>

//               {/* Title and basic info */}
//               <div className="space-y-4">
//                 <div>
//                   <h1
//                     className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
//                     data-testid="text-listing-title"
//                   >
//                     {listing.title}
//                   </h1>
//                   <p className="text-lg text-black dark:text-white">
//                     {listing.brand} {listing.model}
//                   </p>
//                 </div>

//                 <div className="flex flex-wrap gap-6">
//                   {listing.vehicleType &&
//                     (() => {
//                       const VehicleIcon = getVehicleTypeIcon(
//                         listing.vehicleType
//                       );
//                       return VehicleIcon ? (
//                         <div className="flex items-center gap-2 text-black dark:text-white">
//                           <VehicleIcon className="w-5 h-5 text-[#B8860B]" />
//                           <span className="font-medium">
//                             {getVehicleTypeLabel(listing.vehicleType)}
//                           </span>
//                         </div>
//                       ) : null;
//                     })()}
//                   <div className="flex items-center gap-2 text-black dark:text-white">
//                     <Calendar className="w-5 h-5 text-[#B8860B]" />
//                     <span className="font-medium">{listing.year}</span>
//                   </div>
//                   <div className="flex items-center gap-2 text-black dark:text-white">
//                     <Gauge className="w-5 h-5 text-[#B8860B]" />
//                     <span className="font-medium">
//                       {listing.mileage.toLocaleString()} км
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-black dark:text-white">
//                     <Fuel className="w-5 h-5 text-[#B8860B]" />
//                     <span className="font-medium">
//                       {getFuelTypeLabel(listing.fuelType)}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-2 text-black dark:text-white">
//                     <MapPin className="w-5 h-5 text-[#B8860B]" />
//                     <span className="font-medium">
//                       {getLocalizedRegion(listing.region)}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <Separator />

//               {/* Description */}
//               {listing.description && (
//                 <Card className="rounded-2xl overflow-hidden">
//                   <CardContent className="p-0">
//                     <div className="bg-gradient-to-r from-[#B8860B]/5 via-[#B8860B]/10 to-[#B8860B]/5 px-6 py-4 md:px-8 md:py-5 border-b border-[#B8860B]/10">
//                       <div className="flex items-center gap-3">
//                         <div className="p-2.5 rounded-xl bg-[#B8860B]/15 shadow-sm">
//                           <FileText className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <h2 className="text-xl md:text-2xl font-semibold text-[#B8860B]">
//                           {t("detail.description")}
//                         </h2>
//                       </div>
//                     </div>
//                     <div className="p-6 md:p-8">
//                       <div className="relative">
//                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B8860B]/40 via-[#B8860B]/20 to-transparent rounded-full" />
//                         <p
//                           className="pl-5 text-black dark:text-white leading-relaxed md:leading-loose text-base md:text-lg whitespace-pre-wrap font-medium tracking-wide"
//                           data-testid="text-description"
//                         >
//                           {listing.description}
//                         </p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Technical Specifications */}
//               <Card className="rounded-2xl">
//                 <CardContent className="p-6 md:p-8">
//                   <h2 className="text-2xl font-semibold mb-6">
//                     {t("detail.technicalSpecs")}
//                   </h2>
//                   <div className="grid grid-cols-2 gap-4 md:gap-6">
//                     {listing.transmission && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Settings className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.transmission")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-transmission"
//                           >
//                             {getTransmissionLabel(listing.transmission)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.fuelType && listing.fuelType.length > 0 && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Fuel className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.fuel")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-fuel"
//                           >
//                             {getFuelTypeLabel(listing.fuelType)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.bodyType && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Car className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.bodyType")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-body-type"
//                           >
//                             {getLocalizedBodyType(listing.bodyType)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.color && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Palette className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.color")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-color"
//                           >
//                             {getLocalizedColor(listing.color)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.trim && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Package className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("listing.trim")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-trim"
//                           >
//                             {listing.trim}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.driveType && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Gauge className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.driveType")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-drive-type"
//                           >
//                             {getLocalizedDriveType(listing.driveType)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.engineVolume && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Activity className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.engine")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-engine"
//                           >
//                             {listing.engineVolume} {t("detail.engineUnit")}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.power && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Zap className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.power")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-power"
//                           >
//                             {listing.power} kW
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.doors && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <DoorOpen className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.doors")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-doors"
//                           >
//                             {listing.doors}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.seats && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Users className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.seats")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-seats"
//                           >
//                             {listing.seats}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.owners && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <User className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.owners")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-owners"
//                           >
//                             {listing.owners}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.airbags && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Shield className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.airbags")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-airbags"
//                           >
//                             {listing.airbags}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.sellerType && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Store className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.sellerType")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-seller-type"
//                           >
//                             {listing.sellerType === "private"
//                               ? t("detail.private")
//                               : t("detail.dealer")}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.euroEmission && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <FileText className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.euroEmission")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-euro-emission"
//                           >
//                             {t(`filters.${listing.euroEmission}`)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.stkValidUntil && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Shield className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.stkValidUntil")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-stk-valid"
//                           >
//                             {new Date(listing.stkValidUntil).toLocaleDateString(
//                               language === "cs"
//                                 ? "cs-CZ"
//                                 : language === "uk"
//                                 ? "uk-UA"
//                                 : "en-US"
//                             )}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.hasServiceBook && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <FileText className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.serviceBook")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-service-book"
//                           >
//                             {t("common.yes")}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.isImported && listing.importCountry && (
//                       <div className="flex items-start gap-3">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <Globe className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.importedFrom")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white"
//                             data-testid="text-import-country"
//                           >
//                             {getLocalizedImportCountry(listing.importCountry)}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {listing.vin && (
//                       <div className="flex items-start gap-3 col-span-2">
//                         <div className="p-2 rounded-lg bg-[#B8860B]/10">
//                           <FileText className="w-5 h-5 text-[#B8860B]" />
//                         </div>
//                         <div className="flex-1 space-y-1 min-w-0">
//                           <p className="text-sm text-muted-foreground">
//                             {t("detail.vin")}
//                           </p>
//                           <p
//                             className="font-semibold text-black dark:text-white font-mono uppercase break-all"
//                             data-testid="text-vin"
//                           >
//                             {listing.vin}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>

//               {/* Equipment & Comfort */}
//               {listing.equipment && listing.equipment.length > 0 && (
//                 <Card className="rounded-2xl">
//                   <CardContent className="p-6 md:p-8">
//                     <h2 className="text-2xl font-semibold mb-6">
//                       {t("detail.equipment")}
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {listing.equipment.map((equipmentValue) => {
//                         const option = equipmentOptions.find(
//                           (opt) => opt.value === equipmentValue
//                         );
//                         return option ? (
//                           <div
//                             key={equipmentValue}
//                             className="flex items-center gap-2"
//                             data-testid={`equipment-${equipmentValue}`}
//                           >
//                             <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
//                             <span className="text-sm text-black dark:text-white">
//                               {option.label}
//                             </span>
//                           </div>
//                         ) : null;
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}

//               {/* Extras */}
//               {listing.extras && listing.extras.length > 0 && (
//                 <Card className="rounded-2xl">
//                   <CardContent className="p-6 md:p-8">
//                     <h2 className="text-2xl font-semibold mb-6">
//                       {t("detail.extras")}
//                     </h2>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                       {listing.extras.map((extraValue) => {
//                         const option = extrasOptions.find(
//                           (opt) => opt.value === extraValue
//                         );
//                         return option ? (
//                           <div
//                             key={extraValue}
//                             className="flex items-center gap-2"
//                             data-testid={`extra-${extraValue}`}
//                           >
//                             <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
//                             <span className="text-sm text-black dark:text-white">
//                               {option.label}
//                             </span>
//                           </div>
//                         ) : null;
//                       })}
//                     </div>
//                   </CardContent>
//                 </Card>
//               )}
//             </div>

//             {/* Sidebar */}
//             <div className="space-y-6">
//               <Card className="sticky top-24 rounded-2xl shadow-xl">
//                 <CardContent className="p-6 md:p-8 space-y-6">
//                   <div>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       {t("detail.price")}
//                     </p>
//                     <div className="flex items-baseline gap-2">
//                       <p
//                         className="text-4xl font-bold text-primary"
//                         data-testid="text-price"
//                       >
//                         {new Intl.NumberFormat("cs-CZ").format(
//                           Number(listing.price)
//                         )}
//                       </p>
//                       <span className="text-2xl font-semibold text-primary/70">
//                         Kč
//                       </span>
//                     </div>

//                     {listing.vatDeductible && (
//                       <div className="mt-3 space-y-1">
//                         <p className="text-sm text-muted-foreground">
//                           {t("detail.vatIncluded")}
//                         </p>
//                         <p
//                           className="text-lg font-semibold text-primary"
//                           data-testid="text-price-without-vat"
//                         >
//                           {t("detail.priceWithoutVat")}:{" "}
//                           {new Intl.NumberFormat("cs-CZ").format(
//                             Math.round(Number(listing.price) / 1.21)
//                           )}{" "}
//                           Kč
//                         </p>
//                       </div>
//                     )}
//                   </div>

//                   <Separator />

//                   <div className="space-y-3">
//                     <Button
//                       className="w-full"
//                       size="lg"
//                       onClick={() => setShowContactDialog(true)}
//                       data-testid="button-contact-seller"
//                     >
//                       <Phone className="w-5 h-5 mr-2" />
//                       {t("detail.contactSeller")}
//                     </Button>

//                     <div className="grid grid-cols-2 gap-3">
//                       <Button
//                         variant="outline"
//                         size="lg"
//                         onClick={handleToggleFavorite}
//                         data-testid="button-favorite"
//                       >
//                         <Heart
//                           className={`w-5 h-5 mr-2 ${
//                             isFavorite(listing.id)
//                               ? "fill-primary text-primary"
//                               : ""
//                           }`}
//                         />
//                         {t("detail.favorite")}
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="lg"
//                         onClick={handleShare}
//                         data-testid="button-share"
//                       >
//                         <Share2 className="w-5 h-5 mr-2" />
//                         {t("detail.share")}
//                       </Button>
//                     </div>
//                   </div>

//                   <Separator />

//                   <div className="space-y-3 text-sm">
//                     <div className="flex justify-between">
//                       <span className="text-muted-foreground">
//                         {t("detail.postedOn")}
//                       </span>
//                       <span className="font-medium">
//                         {format(new Date(listing.createdAt), "dd.MM.yyyy")}
//                       </span>
//                     </div>

//                     {listing.region && (
//                       <div className="flex justify-between">
//                         <span className="text-muted-foreground">
//                           {t("detail.location")}
//                         </span>
//                         <span className="font-medium">
//                           {getLocalizedRegion(listing.region)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Contact dialog */}
//       <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
//         <DialogContent data-testid="dialog-contact-seller">
//           <DialogHeader>
//             <DialogTitle>{t("detail.contactInfo")}</DialogTitle>
//             <DialogDescription>{t("detail.contactSeller")}</DialogDescription>
//           </DialogHeader>
//           <div className="space-y-4 py-4">
//             {seller?.email || listing.phone ? (
//               <>
//                 {seller?.email && (
//                   <div
//                     className="flex items-center gap-3"
//                     data-testid="contact-email"
//                   >
//                     <Mail className="h-5 w-5 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">
//                         {t("detail.email")}
//                       </p>
//                       <a
//                         href={`mailto:${seller.email}`}
//                         className="text-base hover:underline"
//                       >
//                         {seller.email}
//                       </a>
//                     </div>
//                   </div>
//                 )}

//                 {listing.phone && (
//                   <div
//                     className="flex items-center gap-3"
//                     data-testid="contact-phone"
//                   >
//                     <Phone className="h-5 w-5 text-muted-foreground" />
//                     <div>
//                       <p className="text-sm font-medium text-muted-foreground">
//                         {t("detail.phone")}
//                       </p>
//                       <a
//                         href={`tel:${listing.phone}`}
//                         className="text-base hover:underline"
//                       >
//                         {listing.phone}
//                       </a>
//                     </div>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <p
//                 className="text-sm text-muted-foreground"
//                 data-testid="no-contact-info"
//               >
//                 {t("detail.noContactInfo")}
//               </p>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* Lightbox */}
//       <MediaLightbox
//         photos={photoKeys}
//         video={videoKey}
//         initialIndex={lightboxIndex}
//         isOpen={lightboxOpen}
//         onClose={() => setLightboxOpen(false)}
//       />
//     </>
//   );
// }
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  ArrowLeft,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Heart,
  Share2,
  Phone,
  Check,
  Settings,
  Car,
  Palette,
  Package,
  Activity,
  Zap,
  DoorOpen,
  Users,
  Globe,
  Bus,
  Truck,
  Bike,
  User,
  Shield,
  Store,
  Mail,
  Star,
  FileText,
  Crown,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Video,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation, useLocalizedOptions } from "@/lib/translations";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError, queryClient } from "@/lib/queryClient";
import { getListingMainTitle } from "@/lib/listingTitle";
import { format } from "date-fns";
import Header from "@/components/Header";
import { MediaLightbox } from "@/components/MediaLightbox";
import {
  LISTINGS_RETURN_URL_KEY,
} from "@/components/ScrollToTop";
import {
  SEO,
  generateVehicleSchema,
  generateBreadcrumbSchema,
  generateListingKeywords,
} from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Listing } from "@shared/schema";
import {
  getOptimizedImageUrl,
  getCardImageUrl,
  getFullImageUrl,
  getThumbnailUrl,
} from "@/lib/imageOptimizer";
import { ResponsiveImage } from "@/components/ResponsiveImage";

// Type for public contact information returned by /api/users/:id
type PublicContact = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
};

type ListingAnalytics = {
  listingId: string;
  views: number;
  contactClicks: number;
  whatsappClicks: number;
};

function PageLoaderInline({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

export default function ListingDetailPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const localizedOptions = useLocalizedOptions();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { user } = useAuth();

  const [, params] = useRoute("/listing/:id");
  const listingId = params?.id;
  const isEmbedded =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embedded") === "1";

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [cebiaDialogOpen, setCebiaDialogOpen] = useState(false);
  const swipeStartXRef = useRef<number | null>(null);
  const swipeStartYRef = useRef<number | null>(null);
  const [cebiaGuest, setCebiaGuest] = useState<{ reportId: string; token: string } | null>(
    null,
  );
  const [cebiaGuestStatus, setCebiaGuestStatus] = useState<string | null>(null);
  const [cebiaGuestHasPdf, setCebiaGuestHasPdf] = useState(false);

  const redirectToCheckout = useCallback((url: string) => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.location.assign(url);
        return;
      }
    } catch {
      // Cross-origin protections are expected in some embedding scenarios.
    }
    window.location.assign(url);
  }, []);

  useEffect(() => {
    if (!listingId) return;
    try {
      const raw = localStorage.getItem(`cebia:guest:${listingId}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.reportId === "string" &&
        typeof parsed.token === "string"
      ) {
        setCebiaGuest({ reportId: parsed.reportId, token: parsed.token });
      }
    } catch {
      // ignore
    }
  }, [listingId]);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<Listing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
  });

  const { data: seller } = useQuery<PublicContact>({
    queryKey: [`/api/users/${listing?.userId}`],
    enabled: !!listing?.userId,
  });

  const canSeeListingAnalytics =
    !!listing && !!user && (user.isAdmin || user.id === listing.userId);

  const { data: listingAnalytics } = useQuery<ListingAnalytics>({
    queryKey: [`/api/listings/${listingId}/analytics`],
    enabled: !!listingId && canSeeListingAnalytics,
    refetchInterval: canSeeListingAnalytics ? 15000 : false,
    retry: false,
  });

  const { data: cebiaConfig } = useQuery<{
    enabled: boolean;
    paymentsFrozen: boolean;
    autoRequestOnPaid?: boolean;
    priceCents?: number;
    currency?: string;
  }>({
    queryKey: ["/api/cebia/config"],
  });

  const cebiaPaymentsFrozen = cebiaConfig?.paymentsFrozen !== false; // default: frozen
  const listingVin = (listing?.vin || "").trim().toUpperCase();
  const listingVinValid = /^[A-HJ-NPR-Z0-9]{17}$/.test(listingVin);

  const handleCebiaClick = useCallback(() => {
    if (!listingVinValid) {
      toast({
        variant: "destructive",
        title: t("cebia.unavailable"),
        description: t("cebia.requiresListingVin"),
      });
      return;
    }
    setCebiaDialogOpen(true);
  }, [listingVinValid, t, toast]);

  // Stripe redirect: promoted=success/cancelled
  useEffect(() => {
    if (!listingId) return;

    const urlParams = new URLSearchParams(window.location.search);
    const promotedParam = urlParams.get("promoted");

    if (promotedParam === "success") {
      toast({
        title: t("listings.promoteSuccess"),
        description: t("listings.promoteSuccessDescription"),
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/listings/${listingId}`],
      });

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("promoted");
      window.history.replaceState({}, "", newUrl.toString());
    }

    if (promotedParam === "cancelled") {
      toast({
        variant: "destructive",
        title: t("listings.promoteCancelled"),
        description: t("listings.promoteCancelledDescription"),
      });
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("promoted");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [listingId, t, toast]);

  // --- Media normalization (важливо для кешу/стабільних URL)
  const photoKeys = useMemo(() => {
    const raw = listing?.photos ?? [];
    return raw
      .filter((p): p is string => typeof p === "string" && p.trim() !== "")
      .map((p) => p.replace(/^\/+/, "")); // важливо: стабільний ключ без leading "/"
  }, [listing?.photos]);

  const videoKey = useMemo(() => {
    const v = listing?.video;
    if (!v || typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) return null;
    return trimmed.replace(/^\/+/, "");
  }, [listing?.video]);

  const hasVideo = !!videoKey;
  const totalItems = photoKeys.length + (hasVideo ? 1 : 0);
  const hasMultipleItems = totalItems > 1;

  // Carousel state tracking
  useEffect(() => {
    if (!carouselApi) return;

    const sync = () =>
      setCurrentCarouselIndex(carouselApi.selectedScrollSnap());
    sync();

    carouselApi.on("select", sync);
    return () => {
      // Embla API підтримує off
      // @ts-ignore
      carouselApi.off?.("select", sync);
    };
  }, [carouselApi]);

  // Preload neighbor images to reduce swipe stutter
  useEffect(() => {
    const len = photoKeys.length;
    if (!len) return;

    const idx = Math.max(0, Math.min(currentCarouselIndex, len - 1));
    const neighbors = new Set<string>();
    neighbors.add(photoKeys[(idx + 1) % len]);
    neighbors.add(photoKeys[(idx - 1 + len) % len]);

    for (const key of neighbors) {
      const img = new Image();
      img.decoding = "async";
      img.src = getOptimizedImageUrl(key, {
        width: 1200,
        quality: 80,
        format: "webp",
      });
    }
  }, [currentCarouselIndex, photoKeys]);

  const scrollToCarouselItem = useCallback(
    (index: number) => {
      carouselApi?.scrollTo(index);
    },
    [carouselApi],
  );

  const openLightboxAt = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  // Promote TOP
  const promoteToTopMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/listings/${id}/checkout`);
      return await res.json();
    },
    onSuccess: (data: { url: string }) => {
      if (data?.url) redirectToCheckout(data.url);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: t("listings.promoteError"),
        description: err?.message || t("listings.promoteErrorDescription"),
      });
    },
  });

  const isOwner = !!user && !!listing && user.id === listing.userId;
  const canPromote = isOwner && !listing?.isTopListing;

  const cebiaCheckoutMutation = useMutation({
    mutationFn: async () => {
      if (cebiaPaymentsFrozen) {
        throw new Error("503: {\"error\":\"Payments are temporarily disabled\"}");
      }
      if (!listingVinValid) {
        throw new Error(t("cebia.requiresListingVin"));
      }
      const vin = listingVin;
      const endpoint = user ? "/api/cebia/checkout" : "/api/cebia/guest/checkout";
      const res = await apiRequest("POST", endpoint, {
        vin,
        listingId,
      });
      return (await res.json()) as { url?: string; reportId?: string; guestToken?: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
        if (!user && data?.reportId && data?.guestToken && listingId) {
          try {
            localStorage.setItem(
              `cebia:guest:${listingId}`,
              JSON.stringify({ reportId: data.reportId, token: data.guestToken }),
            );
            setCebiaGuest({ reportId: data.reportId, token: data.guestToken });

            localStorage.setItem(
              "cebia:last",
              JSON.stringify({
                listingId,
                reportId: data.reportId,
                token: data.guestToken,
                ts: Date.now(),
              }),
            );
          } catch {
            // ignore
          }
        }
        redirectToCheckout(data.url);
        return;
      }
      toast({
        variant: "destructive",
        title: "Chyba platby",
        description: "Stripe URL nebyla vrácena serverem.",
      });
    },
    onError: (err: any) => {
      const parsed = parseApiError(err);
      toast({
        variant: "destructive",
        title: "Nepodařilo se vytvořit platbu",
        description: parsed.message,
      });
    },
  });

  const cebiaRefreshMutation = useMutation({
    mutationFn: async () => {
      if (!cebiaGuest) throw new Error("Missing guest report");
      const res = await apiRequest(
        "GET",
        `/api/cebia/guest/reports/${encodeURIComponent(
          cebiaGuest.reportId,
        )}?token=${encodeURIComponent(cebiaGuest.token)}`,
      );
      return await res.json();
    },
    onSuccess: (data: any) => {
      const status = data?.status;
      setCebiaGuestStatus(typeof status === "string" ? status : null);
      setCebiaGuestHasPdf(!!data?.hasPdf);
      if (status === "paid") {
        toast({ title: "Platba potvrzena", description: "Můžete vygenerovat PDF report." });
      } else if (status === "ready") {
        toast({ title: "Report je připraven", description: "PDF je dostupné ke stažení." });
      } else {
        toast({ title: "Stav reportu", description: String(status || "unknown") });
      }
    },
    onError: (err: any) => {
      const parsed = parseApiError(err);
      toast({
        variant: "destructive",
        title: "Nelze načíst stav",
        description: parsed.message,
      });
    },
  });

  const cebiaGuestRequestMutation = useMutation({
    mutationFn: async () => {
      if (!cebiaGuest) throw new Error("Missing guest report");
      const res = await apiRequest(
        "POST",
        `/api/cebia/guest/reports/${encodeURIComponent(cebiaGuest.reportId)}/request`,
        { token: cebiaGuest.token },
      );
      return await res.json();
    },
    onSuccess: () => {
      toast({ title: "Žádost o report odeslána", description: "Za chvíli zkuste zkontrolovat stav." });
      cebiaRefreshMutation.mutate();
    },
    onError: (err: any) => {
      const parsed = parseApiError(err);
      toast({ variant: "destructive", title: "Nelze vytvořit report", description: parsed.message });
    },
  });

  const cebiaGuestPollMutation = useMutation({
    mutationFn: async () => {
      if (!cebiaGuest) throw new Error("Missing guest report");
      const res = await apiRequest(
        "POST",
        `/api/cebia/guest/reports/${encodeURIComponent(cebiaGuest.reportId)}/poll`,
        { token: cebiaGuest.token },
      );
      return await res.json();
    },
    onSuccess: (data: any) => {
      const status = data?.status;
      if (status === "ready") {
        toast({ title: "Report je připraven", description: "Otevírám PDF…" });
        if (cebiaGuest) {
          window.open(
            `/api/cebia/guest/reports/${encodeURIComponent(
              cebiaGuest.reportId,
            )}/pdf?token=${encodeURIComponent(cebiaGuest.token)}`,
            "_blank",
          );
        }
      } else {
        toast({ title: "Report se připravuje", description: "Zkuste to prosím znovu za chvíli." });
      }
      cebiaRefreshMutation.mutate();
    },
    onError: (err: any) => {
      const parsed = parseApiError(err);
      toast({ variant: "destructive", title: "Nelze zkontrolovat report", description: parsed.message });
    },
  });

  // --- локалізаційні мапи (швидше за find на кожен рендер)
  const bodyTypeMap = useMemo(() => {
    const arr = localizedOptions.getBodyTypes();
    return new Map(arr.map((x) => [x.value, x.label] as const));
  }, [localizedOptions]);

  const colorMap = useMemo(() => {
    const arr = localizedOptions.getColors();
    return new Map(arr.map((x) => [x.value, x.label] as const));
  }, [localizedOptions]);

  const driveTypeMap = useMemo(() => {
    const arr = localizedOptions.getDriveTypes();
    return new Map(arr.map((x) => [x.value, x.label] as const));
  }, [localizedOptions]);

  const regionMap = useMemo(() => {
    const arr = localizedOptions.getRegions();
    return new Map(arr.map((x) => [x.value, x.label] as const));
  }, [localizedOptions]);

  const importCountryMap = useMemo(() => {
    const arr = localizedOptions.getImportCountries();
    return new Map(arr.map((x) => [x.value, x.label] as const));
  }, [localizedOptions]);

  const getLocalizedBodyType = useCallback(
    (value: string | null) => (value ? bodyTypeMap.get(value) || value : ""),
    [bodyTypeMap],
  );

  const getLocalizedColor = useCallback(
    (value: string | null) => (value ? colorMap.get(value) || value : ""),
    [colorMap],
  );

  const getLocalizedDriveType = useCallback(
    (values: string[] | string | null) => {
      if (!values) return "";
      const arr = Array.isArray(values) ? values : [values];
      return arr.map((v) => driveTypeMap.get(v) || v).join(", ");
    },
    [driveTypeMap],
  );

  const getLocalizedRegion = useCallback(
    (value: string | null) => (value ? regionMap.get(value) || value : ""),
    [regionMap],
  );

  const getLocalizedImportCountry = useCallback(
    (value: string | null) =>
      value ? importCountryMap.get(value) || value : "",
    [importCountryMap],
  );

  const transmissionLabels = useMemo(
    () => ({
      manual: t("filters.manual"),
      automatic: t("filters.automatic"),
      robot: t("filters.robot"),
      cvt: t("filters.cvt"),
    }),
    [t],
  );

  const fuelLabels = useMemo(
    () => ({
      benzin: t("hero.benzin"),
      diesel: t("hero.diesel"),
      hybrid: t("hero.hybrid"),
      electric: t("hero.electric"),
      lpg: t("hero.lpg"),
      cng: t("hero.cng"),
    }),
    [t],
  );

  const getTransmissionLabel = useCallback(
    (values: string[] | string | null) => {
      if (!values) return "";
      const arr = Array.isArray(values) ? values : [values];
      return arr.map((v) => transmissionLabels[v] || v).join(", ");
    },
    [transmissionLabels],
  );

  const getFuelTypeLabel = useCallback(
    (values: string[] | string | null) => {
      if (!values) return "";
      const arr = Array.isArray(values) ? values : [values];
      return arr.map((v) => fuelLabels[v] || v).join(", ");
    },
    [fuelLabels],
  );

  const getVehicleTypeIcon = useCallback(
    (
      type: string | null,
    ): React.ComponentType<{ className?: string }> | null => {
      if (!type) return null;
      const icons: Record<
        string,
        React.ComponentType<{ className?: string }>
      > = {
        cars: Car,
        vans: Bus,
        trucks: Truck,
        motorcycles: Bike,
      };
      return icons[type] || null;
    },
    [],
  );

  const getVehicleTypeLabel = useCallback(
    (type: string | null) => {
      if (!type) return "";
      const labels: Record<string, string> = {
        cars: t("hero.cars"),
        vans: t("hero.vans"),
        trucks: t("hero.trucks"),
        motorcycles: t("hero.motorcycles"),
      };
      return labels[type] || type;
    },
    [t],
  );

  const equipmentOptions = useMemo(
    () => [
      { value: "heatedSeats", label: t("filters.heatedSeats") },
      { value: "electricWindows", label: t("filters.electricWindows") },
      { value: "leatherInterior", label: t("filters.leatherInterior") },
      { value: "climateControl", label: t("filters.climateControl") },
      { value: "cruiseControl", label: t("filters.cruiseControl") },
      { value: "parkingSensors", label: t("filters.parkingSensors") },
      { value: "rearCamera", label: t("filters.rearCamera") },
      { value: "navigationSystem", label: t("filters.navigationSystem") },
      { value: "bluetooth", label: t("filters.bluetooth") },
      { value: "keylessEntry", label: t("filters.keylessEntry") },
      { value: "ledHeadlights", label: t("filters.ledHeadlights") },
      { value: "sunroof", label: t("filters.sunroof") },
      { value: "alloyWheels", label: t("filters.alloyWheels") },
      { value: "ventilatedSeats", label: t("filters.ventilatedSeats") },
      { value: "memorySeats", label: t("filters.memorySeats") },
      { value: "massageSeats", label: t("filters.massageSeats") },
      { value: "adaptiveCruise", label: t("filters.adaptiveCruise") },
      { value: "laneKeeping", label: t("filters.laneKeeping") },
      { value: "blindSpot", label: t("filters.blindSpot") },
      { value: "rainSensor", label: t("filters.rainSensor") },
      { value: "lightSensor", label: t("filters.lightSensor") },
      { value: "heatedSteeringWheel", label: t("filters.heatedSteeringWheel") },
      { value: "panoramicRoof", label: t("filters.panoramicRoof") },
      { value: "electricSeats", label: t("filters.electricSeats") },
      { value: "parkingAssist", label: t("filters.parkingAssist") },
      { value: "headUpDisplay", label: t("filters.headUpDisplay") },
      { value: "wirelessCharging", label: t("filters.wirelessCharging") },
      { value: "towHitch", label: t("filters.towHitch") },
    ],
    [t],
  );

  const extrasOptions = useMemo(
    () => [
      { value: "vinCheck", label: t("filters.vinCheck") },
      { value: "serviceBook", label: t("filters.serviceBook") },
      { value: "notDamaged", label: t("filters.notDamaged") },
      { value: "notPainted", label: t("filters.notPainted") },
      { value: "warranty", label: t("filters.warranty") },
      { value: "exchange", label: t("filters.exchange") },
    ],
    [t],
  );

  const handleToggleFavorite = useCallback(() => {
    if (!listing) return;

    const isCurrentlyFavorite = isFavorite(listing.id);
    toggleFavorite(listing.id);

    toast({
      title: isCurrentlyFavorite
        ? t("favorites.removed")
        : t("favorites.added"),
      description: isCurrentlyFavorite
        ? t("favorites.removedDescription")
        : t("favorites.addedDescription"),
    });
  }, [listing, isFavorite, toggleFavorite, toast, t]);

  const handleShare = useCallback(async () => {
    if (!listing) return;

    const shareUrl = window.location.href;
    const mainTitle = getListingMainTitle(listing);
    const shareData = {
      title: mainTitle,
      text: `${listing.brand} ${
        listing.model
      } - ${listing.price.toLocaleString()} Kč`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({
          title: t("detail.shareSuccess"),
          description: t("detail.shareSuccessDescription"),
        });
      } catch (e) {
        if ((e as Error)?.name !== "AbortError") console.error(e);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: t("detail.linkCopied"),
        description: t("detail.linkCopiedDescription"),
      });
    } catch (e) {
      console.error(e);
      toast({
        title: t("detail.shareError"),
        description: t("detail.shareErrorDescription"),
        variant: "destructive",
      });
    }
  }, [listing, toast, t]);

  const trackListingAnalyticsEvent = useCallback(
    async (eventType: "view" | "contact_click" | "whatsapp_click") => {
      if (!listingId) return;
      try {
        await apiRequest(
          "POST",
          `/api/listings/${encodeURIComponent(listingId)}/analytics/${eventType}`,
          {},
        );
        if (canSeeListingAnalytics) {
          queryClient.invalidateQueries({
            queryKey: [`/api/listings/${listingId}/analytics`],
          });
        }
      } catch {
        // Analytics should never block user actions.
      }
    },
    [listingId, canSeeListingAnalytics],
  );

  useEffect(() => {
    if (!listingId || !listing) return;
    const sessionKey = `listing-analytics:view:${listingId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    void trackListingAnalyticsEvent("view");
  }, [listingId, listing, trackListingAnalyticsEvent]);

  const handleBack = useCallback(() => {
    if (isEmbedded && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "nnauto-close-listing-overlay" }, "*");
      return;
    }

    const returnUrl = sessionStorage.getItem(LISTINGS_RETURN_URL_KEY);
    if (window.history.length > 1) {
      const currentUrl = window.location.href;
      window.history.back();
      window.setTimeout(() => {
        if (window.location.href !== currentUrl) return;
        if (returnUrl) {
          window.location.assign(returnUrl);
          return;
        }
        window.location.assign("/listings");
      }, 180);
      return;
    }
    if (returnUrl) {
      window.location.assign(returnUrl);
      return;
    }
    window.location.assign("/listings");
  }, [isEmbedded]);

  // Match browser-style back swipe: left-edge swipe should trigger the same flow as "zpět".
  useEffect(() => {
    if (!isEmbedded) return;

    const edgeThreshold = 28; // px from left edge
    const minHorizontalDistance = 70; // px
    const maxVerticalDrift = 60; // px

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (t.clientX > edgeThreshold) {
        swipeStartXRef.current = null;
        swipeStartYRef.current = null;
        return;
      }
      swipeStartXRef.current = t.clientX;
      swipeStartYRef.current = t.clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (swipeStartXRef.current == null || swipeStartYRef.current == null) return;
      const t = e.changedTouches[0];
      if (!t) return;

      const deltaX = t.clientX - swipeStartXRef.current;
      const deltaY = Math.abs(t.clientY - swipeStartYRef.current);

      swipeStartXRef.current = null;
      swipeStartYRef.current = null;

      if (deltaX > minHorizontalDistance && deltaY < maxVerticalDrift) {
        handleBack();
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleBack, isEmbedded]);
  // (Cebia UI placeholder only for now)

  // --- SEO (memoized)
  const listingUrl = useMemo(
    () => (listing ? `https://nnauto.cz/listing/${listing.id}` : ""),
    [listing],
  );

  const vehicleSchema = useMemo(() => {
    if (!listing) return null;
    return generateVehicleSchema({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      price: Number(listing.price),
      mileage: listing.mileage,
      fuelType: listing.fuelType || undefined,
      transmission: listing.transmission || undefined,
      color: listing.color || undefined,
      bodyType: listing.bodyType || undefined,
      engineVolume: listing.engineVolume || undefined,
      power: listing.power || undefined,
      vin: listing.vin || undefined,
      photos: listing.photos || undefined,
      description: listing.description || undefined,
      condition: listing.condition || undefined,
      sellerType: listing.sellerType || undefined,
    });
  }, [listing]);

  const breadcrumbSchema = useMemo(() => {
    if (!listing) return null;
    return generateBreadcrumbSchema([
      {
        name:
          language === "cs" ? "Domů" : language === "uk" ? "Головна" : "Home",
        url: "https://nnauto.cz/",
      },
      {
        name:
          language === "cs"
            ? "Inzeráty"
            : language === "uk"
              ? "Оголошення"
              : "Listings",
        url: "https://nnauto.cz/listings",
      },
      {
        name: `${listing.year} ${listing.brand} ${listing.model}`,
        url: `https://nnauto.cz/listing/${listing.id}`,
      },
    ]);
  }, [listing, language]);

  const seoTitle = useMemo(() => {
    if (!listing) return "";
    const price = Number(listing.price).toLocaleString(
      language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US",
    );
    return `${listing.year} ${listing.brand} ${listing.model} - ${price} ${
      language === "en" ? "CZK" : "Kč"
    } | Prodej`;
  }, [listing, language]);

  const seoDescription = useMemo(() => {
    if (!listing) return "";
    return (
      listing.description?.substring(0, 155) ||
      `Prodej ${listing.year} ${listing.brand} ${
        listing.model
      }. Najeto ${listing.mileage.toLocaleString("cs-CZ")} km. ${
        listing.fuelType?.[0] || ""
      }, ${listing.transmission?.[0] || ""}. Cena ${Number(
        listing.price,
      ).toLocaleString("cs-CZ")} Kč. ${
        language === "cs"
          ? "Koupit na NNAuto.cz"
          : language === "uk"
            ? "Купити на NNAuto.cz"
            : "Buy on NNAuto.cz"
      }`
    );
  }, [listing, language]);

  const seoImage = useMemo(() => {
    const first = photoKeys[0];
    return first ? `https://nnauto.cz/objects/${first}` : undefined;
  }, [photoKeys]);

  const seoKeywords = useMemo(() => {
    if (!listing) return [];
    return generateListingKeywords({
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      bodyType: listing.bodyType || undefined,
      fuelType: listing.fuelType || undefined,
      region: listing.region || undefined,
      condition: listing.condition || undefined,
    });
  }, [listing]);

  if (isLoading) {
    return (
      <>
        <Header />
        <PageLoaderInline text={t("detail.loading")} />
      </>
    );
  }
  function tuneImgUrl(url: string, w: number, dpr = 2) {
    try {
      // window.location.origin потрібен щоб URL() коректно парсив відносні шляхи
      const base =
        typeof window !== "undefined"
          ? window.location.origin
          : "https://nnauto.cz";
      const u = new URL(url, base);

      // якщо твій backend/роутер підтримує ?w=&dpr= (у тебе так і є)
      u.searchParams.set("w", String(w));
      u.searchParams.set("dpr", String(dpr));

      return u.toString();
    } catch {
      return url;
    }
  }
  if (error || !listing) {
    return (
      <>
        {!isEmbedded && <Header />}
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">{t("detail.notFound")}</h1>
            <p className="text-muted-foreground">{t("detail.errorLoading")}</p>
            <Link href="/listings">
              <Button data-testid="button-back-listings">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("detail.backToListings")}
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        url={listingUrl}
        type="product"
        locale={
          language === "cs" ? "cs_CZ" : language === "uk" ? "uk_UA" : "en_US"
        }
        alternateLanguages={[
          { lang: "cs", url: listingUrl },
          { lang: "uk", url: listingUrl },
          { lang: "en", url: listingUrl },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            ...(vehicleSchema ? [vehicleSchema] : []),
            ...(breadcrumbSchema ? [breadcrumbSchema] : []),
          ],
        }}
      />

      {!isEmbedded && <Header />}

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Button
                variant="ghost"
                className="w-fit bg-black/55 hover:bg-black/70 text-white"
                data-testid="button-back"
                onClick={handleBack}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("detail.backToListings")}
              </Button>

              {/* Image/Video Gallery */}
              <Card className="overflow-hidden rounded-2xl">
                <div className="relative">
                  {totalItems > 0 ? (
                    <Carousel
                      setApi={setCarouselApi}
                      className="w-full"
                      opts={{ loop: true }}
                    >
                      <CarouselContent>
                        {/* Photos first */}
                        {photoKeys.map((key, index) => (
                          <CarouselItem key={`photo-${key}-${index}`}>
                            <div
                              className="aspect-[3/2] relative bg-muted cursor-pointer"
                              onClick={() => openLightboxAt(index)}
                            >
                              <ResponsiveImage
                                // було 400px → робимо 768px, щоб на мобільному/retina було чітко
                                mobileSrc={getOptimizedImageUrl(key, {
                                  width: 768,
                                  quality: 82,
                                  format: "webp",
                                })}
                                // було 1200px → робимо 1600px для деталки (виглядає значно різкіше)
                                desktopSrc={getOptimizedImageUrl(key, {
                                  width: 1600,
                                  quality: 85,
                                  format: "webp",
                                })}
                                desktopMinWidth={1024}
                                upgrade={index === currentCarouselIndex}
                                alt={`${getListingMainTitle(listing)} - ${index + 1}`}
                                loading={index === 0 ? "eager" : "lazy"}
                                decoding="async"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 800px"
                                className="w-full h-full object-cover object-center bg-muted"
                                data-testid={`img-listing-${index}`}
                              />

                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                                <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
                                  {t("detail.clickToEnlarge") ||
                                    "Click to enlarge"}
                                </div>
                              </div>

                              {/* Favorite Button */}
                              <button
                                type="button"
                                style={{
                                  position: "absolute",
                                  top: "12px",
                                  left: "12px",
                                  zIndex: 50,
                                }}
                                className={`h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm shadow-lg transition-all duration-200 flex items-center justify-center ${
                                  isFavorite(listing.id)
                                    ? "text-red-500"
                                    : "text-white"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFavorite(listing.id);
                                }}
                                data-testid="button-favorite-detail"
                              >
                                <Heart
                                  className={`h-5 w-5 ${
                                    isFavorite(listing.id) ? "fill-current" : ""
                                  }`}
                                />
                              </button>
                            </div>
                          </CarouselItem>
                        ))}

                        {/* Video last */}
                        {hasVideo && (
                          <CarouselItem key="video">
                            <div
                              className="aspect-[3/2] relative bg-black cursor-pointer"
                              onClick={() => openLightboxAt(photoKeys.length)}
                            >
                              <video
                                src={`/objects/${videoKey!}`}
                                className="w-full h-full object-contain pointer-events-none"
                                preload="metadata"
                                data-testid="video-listing-main"
                              >
                                {t("video.browserNotSupported") ||
                                  "Your browser does not support the video tag."}
                              </video>
                              <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-black px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                <Video className="h-4 w-4" />
                                <span>{t("video.watchVideo") || "Video"}</span>
                              </div>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black/60 text-white p-4 rounded-full">
                                  <Play className="h-12 w-12" />
                                </div>
                              </div>
                            </div>
                          </CarouselItem>
                        )}
                      </CarouselContent>

                      {/* Navigation arrows */}
                      {hasMultipleItems && (
                        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
                            onClick={() => carouselApi?.scrollPrev()}
                            data-testid="button-photo-prev"
                          >
                            <ChevronLeft className="h-6 w-6" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background pointer-events-auto"
                            onClick={() => carouselApi?.scrollNext()}
                            data-testid="button-photo-next"
                          >
                            <ChevronRight className="h-6 w-6" />
                          </Button>
                        </div>
                      )}

                      {/* Media counter */}
                      {hasMultipleItems && (
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-2">
                          {hasVideo &&
                          currentCarouselIndex === photoKeys.length ? (
                            <Video className="h-3 w-3" />
                          ) : null}
                          <span>
                            {currentCarouselIndex + 1} / {totalItems}
                          </span>
                        </div>
                      )}
                    </Carousel>
                  ) : (
                    <div className="aspect-[3/2] relative bg-muted">
                      <img
                        src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=675&fit=crop"
                        alt={getListingMainTitle(listing)}
                        loading="eager"
                        decoding="async"
                        className="w-full h-full object-cover object-center bg-muted"
                        data-testid="img-listing-main"
                      />
                    </div>
                  )}

                  {/* TOP badge */}
                  {listing.isTopListing && (
                    <div className="absolute top-3 right-3 z-20">
                      <Badge className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 text-black border-2 border-amber-300 rounded-lg px-4 py-2 shadow-[0_4px_12px_rgba(251,191,36,0.6)] text-sm font-bold flex items-center gap-1.5 animate-pulse">
                        <Star className="w-4 h-4 fill-black" />
                        <span className="uppercase tracking-wide">
                          {t("detail.topListing")}
                        </span>
                      </Badge>
                    </div>
                  )}

                  {/* Topovat button */}
                  {canPromote && (
                    <button
                      onClick={() => promoteToTopMutation.mutate(listing.id)}
                      disabled={promoteToTopMutation.isPending}
                      className="absolute top-3 right-3 z-20 group"
                      data-testid="button-topovat-detail"
                    >
                      <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black rounded-xl px-5 py-2.5 shadow-[0_4px_15px_rgba(251,191,36,0.5)] text-base font-bold flex items-center gap-2 transition-all duration-300 hover:shadow-[0_6px_20px_rgba(251,191,36,0.7)] hover:scale-105 border-2 border-amber-300">
                        {promoteToTopMutation.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Crown className="w-5 h-5" />
                        )}
                        <span className="uppercase tracking-wide">
                          {t("listings.topovat")}
                        </span>
                      </div>
                    </button>
                  )}
                </div>

                {/* Thumbnail strip */}
                {hasMultipleItems && (
                  <div className="p-3 bg-muted/50">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photoKeys.map((key, index) => {
                        const isActive = index === currentCarouselIndex;
                        return (
                          <button
                            key={`thumb-${key}-${index}`}
                            onClick={() => scrollToCarouselItem(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                              isActive
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent hover:border-primary/50"
                            }`}
                            data-testid={`button-thumbnail-${index}`}
                          >
                            <ResponsiveImage
                              mobileSrc={getOptimizedImageUrl(key, {
                                width: 96,
                                quality: 70,
                                format: "webp",
                              })}
                              desktopSrc={getOptimizedImageUrl(key, {
                                width: 192,
                                quality: 75,
                                format: "webp",
                              })}
                              desktopMinWidth={1024}
                              upgrade={
                                Math.abs(index - currentCarouselIndex) <= 6
                              }
                              alt={`Thumbnail ${index + 1}`}
                              loading={index < 8 ? "eager" : "lazy"}
                              decoding="async"
                              sizes="64px"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}

                      {hasVideo && (
                        <button
                          onClick={() => scrollToCarouselItem(photoKeys.length)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative ${
                            currentCarouselIndex === photoKeys.length
                              ? "border-[#B8860B] ring-2 ring-[#B8860B]/30"
                              : "border-transparent hover:border-[#B8860B]/50"
                          }`}
                          data-testid="button-thumbnail-video"
                        >
                          <div className="w-full h-full bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] flex items-center justify-center">
                              <Play className="w-4 h-4 text-black ml-0.5" />
                            </div>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Title and basic info */}
              <div className="space-y-4">
                <div>
                  <h1
                    className="text-3xl md:text-4xl font-bold tracking-tight mb-2"
                    data-testid="text-listing-title"
                  >
                    {getListingMainTitle(listing)}
                  </h1>
                  {listing.title ? (
                    <p className="text-sm text-muted-foreground">
                      {listing.title}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-6">
                  {listing.vehicleType &&
                    (() => {
                      const VehicleIcon = getVehicleTypeIcon(
                        listing.vehicleType,
                      );
                      return VehicleIcon ? (
                        <div className="flex items-center gap-2 text-black dark:text-white">
                          <VehicleIcon className="w-5 h-5 text-[#B8860B]" />
                          <span className="font-medium">
                            {getVehicleTypeLabel(listing.vehicleType)}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Calendar className="w-5 h-5 text-[#B8860B]" />
                    <span className="font-medium">{listing.year}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Gauge className="w-5 h-5 text-[#B8860B]" />
                    <span className="font-medium">
                      {listing.mileage.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <Fuel className="w-5 h-5 text-[#B8860B]" />
                    <span className="font-medium">
                      {getFuelTypeLabel(listing.fuelType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-black dark:text-white">
                    <MapPin className="w-5 h-5 text-[#B8860B]" />
                    <span className="font-medium">
                      {getLocalizedRegion(listing.region)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              {listing.description && (
                <Card className="rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-[#B8860B]/5 via-[#B8860B]/10 to-[#B8860B]/5 px-6 py-4 md:px-8 md:py-5 border-b border-[#B8860B]/10">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#B8860B]/15 shadow-sm">
                          <FileText className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-semibold text-[#B8860B]">
                          {t("detail.description")}
                        </h2>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#B8860B]/40 via-[#B8860B]/20 to-transparent rounded-full" />
                        <p
                          className="pl-5 text-black dark:text-white leading-relaxed md:leading-loose text-base md:text-lg whitespace-pre-wrap font-medium tracking-wide"
                          data-testid="text-description"
                        >
                          {listing.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Technical Specifications */}
              <Card className="rounded-2xl">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl font-semibold mb-6">
                    {t("detail.technicalSpecs")}
                  </h2>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {listing.transmission && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Settings className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.transmission")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-transmission"
                          >
                            {getTransmissionLabel(listing.transmission)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.fuelType && listing.fuelType.length > 0 && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Fuel className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.fuel")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-fuel"
                          >
                            {getFuelTypeLabel(listing.fuelType)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.bodyType && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Car className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.bodyType")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-body-type"
                          >
                            {getLocalizedBodyType(listing.bodyType)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.color && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Palette className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.color")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-color"
                          >
                            {getLocalizedColor(listing.color)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.trim && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Package className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("listing.trim")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-trim"
                          >
                            {listing.trim}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.driveType && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Gauge className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.driveType")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-drive-type"
                          >
                            {getLocalizedDriveType(listing.driveType)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.engineVolume && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Activity className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.engine")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-engine"
                          >
                            {listing.engineVolume} {t("detail.engineUnit")}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.power && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Zap className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.power")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-power"
                          >
                            {listing.power} kW
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.doors && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <DoorOpen className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.doors")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-doors"
                          >
                            {listing.doors}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.seats && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Users className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.seats")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-seats"
                          >
                            {listing.seats}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.owners && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <User className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.owners")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-owners"
                          >
                            {listing.owners}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.airbags && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Shield className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.airbags")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-airbags"
                          >
                            {listing.airbags}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.sellerType && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Store className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.sellerType")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-seller-type"
                          >
                            {listing.sellerType === "private"
                              ? t("detail.private")
                              : t("detail.dealer")}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.euroEmission && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <FileText className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.euroEmission")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-euro-emission"
                          >
                            {t(`filters.${listing.euroEmission}`)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.stkValidUntil && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Shield className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.stkValidUntil")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-stk-valid"
                          >
                            {new Date(listing.stkValidUntil).toLocaleDateString(
                              language === "cs"
                                ? "cs-CZ"
                                : language === "uk"
                                  ? "uk-UA"
                                  : "en-US",
                            )}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.hasServiceBook && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <FileText className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.serviceBook")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-service-book"
                          >
                            {t("common.yes")}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.isImported && listing.importCountry && (
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <Globe className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.importedFrom")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white"
                            data-testid="text-import-country"
                          >
                            {getLocalizedImportCountry(listing.importCountry)}
                          </p>
                        </div>
                      </div>
                    )}

                    {listing.vin && (
                      <div className="flex items-start gap-3 col-span-2">
                        <div className="p-2 rounded-lg bg-[#B8860B]/10">
                          <FileText className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <p className="text-sm text-muted-foreground">
                            {t("detail.vin")}
                          </p>
                          <p
                            className="font-semibold text-black dark:text-white font-mono uppercase break-all"
                            data-testid="text-vin"
                          >
                            {listing.vin}
                          </p>
                          <div className="pt-2 space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={handleCebiaClick}
                              data-testid="button-cebia-placeholder"
                            >
                              Cebia Autotracer (PDF) – koupit report
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Dočasně uzamčeno. Aktivujeme platbu přes Stripe a
                              potom půjde report koupit přímo na této stránce.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment & Comfort */}
              {listing.equipment && listing.equipment.length > 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-semibold mb-6">
                      {t("detail.equipment")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listing.equipment.map((equipmentValue) => {
                        const option = equipmentOptions.find(
                          (opt) => opt.value === equipmentValue,
                        );
                        return option ? (
                          <div
                            key={equipmentValue}
                            className="flex items-center gap-2"
                            data-testid={`equipment-${equipmentValue}`}
                          >
                            <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
                            <span className="text-sm text-black dark:text-white">
                              {option.label}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Extras */}
              {listing.extras && listing.extras.length > 0 && (
                <Card className="rounded-2xl">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-2xl font-semibold mb-6">
                      {t("detail.extras")}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listing.extras.map((extraValue) => {
                        const option = extrasOptions.find(
                          (opt) => opt.value === extraValue,
                        );
                        return option ? (
                          <div
                            key={extraValue}
                            className="flex items-center gap-2"
                            data-testid={`extra-${extraValue}`}
                          >
                            <Check className="w-5 h-5 text-[#B8860B] flex-shrink-0" />
                            <span className="text-sm text-black dark:text-white">
                              {option.label}
                            </span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="sticky top-24 rounded-2xl shadow-xl">
                <CardContent className="p-6 md:p-8 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {t("detail.price")}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p
                        className="text-4xl font-bold text-primary"
                        data-testid="text-price"
                      >
                        {new Intl.NumberFormat("cs-CZ").format(
                          Number(listing.price),
                        )}
                      </p>
                      <span className="text-2xl font-semibold text-primary/70">
                        Kč
                      </span>
                    </div>

                    {listing.vatDeductible && (
                      <div className="mt-3 space-y-1">
                        <p className="text-sm text-muted-foreground">
                          {t("detail.vatIncluded")}
                        </p>
                        <p
                          className="text-lg font-semibold text-primary"
                          data-testid="text-price-without-vat"
                        >
                          {t("detail.priceWithoutVat")}:{" "}
                          {new Intl.NumberFormat("cs-CZ").format(
                            Math.round(Number(listing.price) / 1.21),
                          )}{" "}
                          Kč
                        </p>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        void trackListingAnalyticsEvent("contact_click");
                        setShowContactDialog(true);
                      }}
                      data-testid="button-contact-seller"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      {t("detail.contactSeller")}
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleToggleFavorite}
                        data-testid="button-favorite"
                      >
                        <Heart
                          className={`w-5 h-5 mr-2 ${
                            isFavorite(listing.id)
                              ? "fill-primary text-primary"
                              : ""
                          }`}
                        />
                        {t("detail.favorite")}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleShare}
                        data-testid="button-share"
                      >
                        <Share2 className="w-5 h-5 mr-2" />
                        {t("detail.share")}
                      </Button>

                      {/* {cebiaCoupon?.couponNumber && (
                        <a
                          className="text-sm underline"
                          href={`/api/cebia/pdf?coupon=${encodeURIComponent(cebiaCoupon.couponNumber)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open PDF
                        </a>
                      )} */}
                    </div>
                    {listing.phone ? (
                      // <ContactChatButtons
                      //   phone={listing.phone}
                      //   waText={t("detail.writeWhatsApp") || "WhatsApp"}
                      //   tgText={t("detail.writeTelegram") || "Telegram"}
                      //   className="pt-2"
                      // />
                      <ContactChatButtons
                        phone={listing.phone}
                        carTitle={
                          `${listing.brand} ${listing.model}`.trim() ||
                          listing.title
                        }
                        waText={t("detail.writeWhatsApp") || "WhatsApp"}
                        tgText={t("detail.writeTelegram") || "Telegram"}
                        className="pt-2"
                        toastFn={toast}
                        onWhatsAppClick={() =>
                          void trackListingAnalyticsEvent("whatsapp_click")
                        }
                      />
                    ) : null}

                    {/* Cebia widget is available only when seller provided a valid VIN */}
                    {listingVinValid ? (
                    <div
                      className="rounded-2xl border border-[#B8860B]/30 bg-[#B8860B]/5 p-4 space-y-3"
                      data-testid="cebia-widget"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-white/70 dark:bg-black/20 border border-[#B8860B]/20">
                          <Shield className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-black dark:text-white">
                            Cebia Autotracer
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Prověření historie vozidla podle VIN (PDF report)
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">VIN</p>
                        <div className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono uppercase break-all min-h-10 flex items-center">
                          {listingVinValid ? listingVin : "—"}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cena</span>
                        <span className="font-semibold text-black dark:text-white">
                          {new Intl.NumberFormat("cs-CZ").format(549)} Kč
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleCebiaClick}
                        data-testid="button-cebia-open"
                        disabled={cebiaPaymentsFrozen || !listingVinValid}
                      >
                        {cebiaPaymentsFrozen ? "Platby dočasně vypnuté" : t("cebia.orderCheck")}
                      </Button>

                      <p className="text-xs text-muted-foreground">
                        {!listingVinValid
                          ? t("cebia.requiresListingVin")
                          : cebiaPaymentsFrozen
                          ? "Platby jsou dočasně vypnuté."
                          : "Nejprve proběhne platba přes Stripe. Přístup k VIN reportu se zpřístupní až po úspěšné platbě."}
                      </p>
                    </div>
                    ) : null}
                  </div>

                  <Separator />

                  {canSeeListingAnalytics && listingAnalytics ? (
                    <div className="space-y-3 text-sm rounded-xl border p-3 bg-muted/20">
                      <p className="font-semibold">
                        {language === "uk"
                          ? "Аналітика оголошення"
                          : language === "cs"
                            ? "Statistiky inzerátu"
                            : "Listing analytics"}
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            {language === "uk"
                              ? "Перегляди"
                              : language === "cs"
                                ? "Zobrazení"
                                : "Views"}
                          </p>
                          <p className="font-semibold" data-testid="text-analytics-views">
                            {listingAnalytics.views}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            {language === "uk"
                              ? "Контакт"
                              : language === "cs"
                                ? "Kontakt"
                                : "Contact"}
                          </p>
                          <p
                            className="font-semibold"
                            data-testid="text-analytics-contact-clicks"
                          >
                            {listingAnalytics.contactClicks}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            WhatsApp
                          </p>
                          <p
                            className="font-semibold"
                            data-testid="text-analytics-whatsapp-clicks"
                          >
                            {listingAnalytics.whatsappClicks}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {t("detail.postedOn")}
                      </span>
                      <span className="font-medium">
                        {format(new Date(listing.createdAt), "dd.MM.yyyy")}
                      </span>
                    </div>

                    {listing.region && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {t("detail.location")}
                        </span>
                        <span className="font-medium">
                          {getLocalizedRegion(listing.region)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Contact dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent data-testid="dialog-contact-seller">
          <DialogHeader>
            <DialogTitle>{t("detail.contactInfo")}</DialogTitle>
            <DialogDescription>{t("detail.contactSeller")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {seller?.email || listing.phone ? (
              <>
                {seller?.email && (
                  <div
                    className="flex items-center gap-3"
                    data-testid="contact-email"
                  >
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("detail.email")}
                      </p>
                      <a
                        href={`mailto:${seller.email}`}
                        className="text-base hover:underline"
                      >
                        {seller.email}
                      </a>
                    </div>
                  </div>
                )}

                {listing.phone && (
                  <div
                    className="flex items-center gap-3"
                    data-testid="contact-phone"
                  >
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {t("detail.phone")}
                      </p>
                      <a
                        href={`tel:${listing.phone}`}
                        className="text-base hover:underline"
                      >
                        {listing.phone}
                      </a>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p
                className="text-sm text-muted-foreground"
                data-testid="no-contact-info"
              >
                {t("detail.noContactInfo")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cebia dialog (placeholder) */}
      <Dialog open={cebiaDialogOpen} onOpenChange={setCebiaDialogOpen}>
        <DialogContent data-testid="dialog-cebia-placeholder">
          <DialogHeader>
            <DialogTitle>Cebia Autotracer — prověření VIN</DialogTitle>
            <DialogDescription>
              Platba proběhne přes Stripe. Report se zpřístupní až po úspěšné
              platbě.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">VIN</span>
                <span className="text-sm font-mono uppercase break-all">
                  {listingVinValid ? listingVin : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">Cena</span>
                <span className="text-sm font-semibold">549 Kč</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Po zaplacení se VIN report zpřístupní pro tento účet. Poté půjde
                vygenerovat a stáhnout PDF.
              </p>
            </div>

            {!user ? (
              <p className="text-sm text-muted-foreground">
                Není potřeba registrace. Po zaplacení se report zpřístupní v tomto prohlížeči.
              </p>
            ) : null}

            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => setCebiaDialogOpen(false)}
              >
                Zavřít
              </Button>
              <Button
                disabled={
                  !listingVinValid ||
                  cebiaCheckoutMutation.isPending ||
                  cebiaPaymentsFrozen
                }
                onClick={() => cebiaCheckoutMutation.mutate()}
                data-testid="button-cebia-stripe-pay"
              >
                {cebiaPaymentsFrozen
                  ? "Platby dočasně vypnuté"
                  : cebiaCheckoutMutation.isPending
                    ? t("cebia.payProcessing")
                    : t("cebia.payButton")}
              </Button>
            </div>

            {!user && cebiaGuest ? (
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => cebiaRefreshMutation.mutate()}
                  disabled={cebiaRefreshMutation.isPending}
                  data-testid="button-cebia-guest-refresh"
                >
                  {cebiaRefreshMutation.isPending ? "Kontroluji…" : "Zkontrolovat stav po platbě"}
                </Button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                  <Button
                    variant="secondary"
                    onClick={() => cebiaGuestRequestMutation.mutate()}
                    disabled={
                      cebiaGuestRequestMutation.isPending ||
                      !(cebiaGuestStatus === "paid" || cebiaGuestStatus === "requested")
                    }
                    data-testid="button-cebia-guest-request"
                  >
                    {cebiaGuestRequestMutation.isPending ? "Odesílám…" : "Vygenerovat PDF"}
                  </Button>
                  <Button
                    onClick={() => cebiaGuestPollMutation.mutate()}
                    disabled={cebiaGuestPollMutation.isPending || cebiaGuestStatus !== "requested"}
                    data-testid="button-cebia-guest-poll"
                  >
                    {cebiaGuestPollMutation.isPending ? "Kontroluji…" : "Získat PDF"}
                  </Button>
                </div>

                {cebiaGuestHasPdf ? (
                  <div className="pt-3">
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.open(
                          `/api/cebia/guest/reports/${encodeURIComponent(
                            cebiaGuest.reportId,
                          )}/pdf?token=${encodeURIComponent(cebiaGuest.token)}`,
                          "_blank",
                        );
                      }}
                      data-testid="button-cebia-guest-open-pdf"
                    >
                      Otevřít PDF report
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      {/* Lightbox */}
      <MediaLightbox
        photos={photoKeys}
        video={videoKey}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

function phoneToDigits(phone: string | null | undefined) {
  const raw = String(phone || "").trim();
  if (!raw) return null;

  const normalized = raw.startsWith("00") ? `+${raw.slice(2)}` : raw;
  const digits = normalized.replace(/\D/g, "");
  return digits || null;
}

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback для старих браузерів
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function ContactChatButtons({
  phone,
  carTitle,
  waText = "Napsat na WhatsApp",
  tgText = "Napsat na Telegram",
  className = "",
  toastFn,
  onWhatsAppClick,
}: {
  phone?: string | null;
  carTitle: string;
  waText?: string;
  tgText?: string;
  className?: string;
  toastFn?: (args: {
    title: string;
    description?: string;
    variant?: "default" | "destructive";
  }) => void;
  onWhatsAppClick?: () => void;
}) {
  const digits = phoneToDigits(phone);
  if (!digits) return null;

  const safeCar = (carTitle || "").trim() || "váš vůz";

  const message =
    `Dobrý den,\n` +
    `zaujala mě vaše nabídka na vůz ${safeCar} z NNAuto.cz. ` +
    `Je prosím stále k dispozici? Děkuji za odpověď.`;

  const encoded = encodeURIComponent(message);

  // ✅ WhatsApp: працює
  const waHref = `https://wa.me/${digits}?text=${encoded}`;

  // ✅ Telegram: надійно — відкриємо Telegram, текст скопіюємо
  const tgOpenHref = `tg://resolve?phone=${digits}`; // спроба відкрити чат/контакт
  const tgWebFallback = `https://t.me/`; // якщо tg:// не відкрився

  const btn = "w-full h-16 px-2.5 sm:px-3 py-2 !whitespace-normal";
  const link =
    "w-full h-full grid grid-cols-[18px_1fr] items-center gap-2 min-w-0";
  const text =
    "min-w-0 max-w-full text-center break-words !whitespace-normal " +
    "text-[12px] sm:text-[13px] leading-[1.1] font-medium";

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${className}`}>
      <Button asChild variant="outline" size="lg" className={btn}>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onWhatsAppClick}
          className={link}
        >
          <MessageCircle className="h-4 w-4 flex-none text-[#25D366]" />
          <span className={text}>{waText}</span>
        </a>
      </Button>

      <Button
        variant="outline"
        size="lg"
        className={`${btn} border-[#B8860B]/30 hover:border-[#B8860B] hover:bg-[#B8860B]/5`}
        onClick={async () => {
          // 1) копіюємо текст (і перевіряємо чи реально скопіювало)
          const ok = await copyToClipboard(message);

          // якщо не скопіювало — хоча б покажи alert/toast
          if (!ok) {
            toastFn?.({
              variant: "destructive",
              title: "Не вдалося скопіювати текст",
              description:
                "Дайте дозвіл на буфер обміну або відкрийте сайт через HTTPS.",
            });
          } else {
            toastFn?.({
              title: "Текст скопійовано",
              description: "Відкриваю Telegram — вставте повідомлення у чат.",
            });
          }

          // 2) пробуємо відкрити Telegram через tg://
          const tgDeep = `tg://resolve?phone=${digits}`;

          // 3) fallback: t.me за номером (інколи відкриє контакт/чат)
          const tgWeb = `https://t.me/+${digits}`;

          // Хак: ставимо таймер — якщо tg:// не спрацює, відкриємо web
          let opened = false;

          const timer = setTimeout(() => {
            if (!opened) {
              window.open(tgWeb, "_blank", "noopener,noreferrer");
            }
          }, 700);

          // пробуємо tg:// (деякі браузери блокують — тоді timer відкриє web)
          try {
            opened = true;
            window.location.href = tgDeep;
          } catch {
            opened = false;
          } finally {
            // якщо tg:// реально спрацював — timer не треба
            setTimeout(() => clearTimeout(timer), 1200);
          }
        }}
        data-testid="button-telegram-prefill"
      >
        <span className={link}>
          <Send className="h-4 w-4 flex-none text-[#229ED9]" />
          <span className={text}>
            {tgText}
            {/* <span className="block text-[10px] opacity-70">
              (текст скопійовано)
            </span> */}
          </span>
        </span>
      </Button>
    </div>
  );
}
