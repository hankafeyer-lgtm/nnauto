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
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  lazy,
  Suspense,
} from "react";
import { useLocation, Link, useParams, usePathname } from "@/lib/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";

import {
  ArrowLeft,
  Search,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Heart,
  Share2,
  Navigation,
  ExternalLink,
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
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Send, MessageCircle } from "lucide-react";
import ContactSellerForm from "@/components/ContactSellerForm";

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
import { displayViews } from "@/lib/displayStats";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/hooks/useAuth";
import { useListingStats } from "@/hooks/useListingStats";
import ListingAnalyticsCard from "@/components/ListingAnalyticsCard";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, parseApiError, queryClient } from "@/lib/queryClient";
import { canPrefetchHeavyResources } from "@/lib/queryClient";
import { getListingMainTitle } from "@/lib/listingTitle";
import { buildListingAbsoluteUrl, buildListingPath } from "@/lib/listingUrl";
import { format } from "date-fns";
import { extractShortIdFromSlug } from "@lib/seo/listing-url";
import { normalizeSlug } from "@lib/seo/slug";
import Header from "@/components/Header";
import MobileFilters from "@/components/MobileFilters";
import { MediaLightbox } from "@/components/MediaLightbox";
import {
  LISTING_STATE_KEY,
  LISTINGS_RETURN_URL_KEY,
  LISTINGS_TARGET_ID_KEY,
} from "@/components/ScrollToTop";
import { isLgViewport, isMobileViewport } from "@/lib/viewport";
import { restoreDebug } from "@/lib/restoreDebug";
import {
  SEO,
  generateVehicleSchema,
  generateBreadcrumbSchema,
  generateListingKeywords,
} from "@/components/SEO";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Listing } from "@shared/schema";
import { appendListingSourceTag } from "@shared/messageSource";
import {
  CHAT_COMPOSE_PREFILL_STORAGE_KEY,
  type ChatComposePrefillPayload,
} from "@/lib/chatComposePrefill";
import {
  getOptimizedImageUrl,
  getCardImageUrl,
  getFullImageUrl,
  getThumbnailUrl,
  getLightboxInstantUrl,
} from "@/lib/imageOptimizer";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { trackContact, trackViewContent } from "@/lib/analytics";
import StickyContactBar from "@/components/StickyContactBar";

const EditListingDialog = lazy(() => import("@/components/EditListingDialog"));
const ChatLoginModal = lazy(() => import("@/components/LoginModal"));

// Type for public contact information returned by /api/users/:id
type PublicContact = {
  id: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
};

type DealerProfileForDetail = {
  id: string;
  ownerId: string;
  companyName: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  region: string | null;
  isVerified: boolean;
  createdAt: string | Date;
};

type DealerInventoryItem = {
  id: string;
  title: string;
  price: string;
  brand: string;
  model: string;
  year: number;
  mileage: number | null;
  fuelType: string[] | null;
  transmission: string[] | null;
  photos: string[] | null;
  isTopListing: boolean;
};

type ListingAnalytics = {
  listingId: string;
  views: number;
  contactClicks: number;
  whatsappClicks: number;
  telegramClicks: number;
};

type DealerLocalSettingsForDetail = {
  workingHours?: Record<string, { closed: boolean; open: string; close: string }>;
  socialLinks?: Record<string, string>;
  integrations?: {
    useSamePhone?: boolean;
    countryCode?: string;
    sharedPhone?: string;
    whatsappPhone?: string;
    telegramPhone?: string;
    whatsappConnected?: boolean;
    telegramConnected?: boolean;
  };
};

const detailDayKeys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const detailDayShort: Record<(typeof detailDayKeys)[number], string> = {
  mon: "Po",
  tue: "Út",
  wed: "St",
  thu: "Čt",
  fri: "Pá",
  sat: "So",
  sun: "Ne",
};

function normalizeDealerUrl(value?: string | null) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function readDealerLocalSettings(dealerId?: string | null): DealerLocalSettingsForDetail {
  if (!dealerId || typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`nnauto_dealer_settings_${dealerId}`);
    return raw ? (JSON.parse(raw) as DealerLocalSettingsForDetail) : {};
  } catch {
    return {};
  }
}

function formatDealerWorkingHours(settings: DealerLocalSettingsForDetail) {
  const hours = settings.workingHours;
  if (!hours) return { short: "Po–Pá", today: "Dnes otevřeno podle domluvy" };
  const openDays = detailDayKeys.filter((day) => !hours[day]?.closed);
  if (openDays.length === 0) return { short: "Zavřeno", today: "Dnes zavřeno" };
  if (openDays.length === 7) return { short: "Nonstop", today: "Dnes otevřeno" };
  const first = openDays[0];
  const last = openDays[openDays.length - 1];
  const consecutive = openDays.every((day, index) => detailDayKeys.indexOf(day) === detailDayKeys.indexOf(first) + index);
  const short = consecutive && first !== last
    ? `${detailDayShort[first]}–${detailDayShort[last]}`
    : openDays.map((day) => detailDayShort[day]).join(", ");
  const jsDay = new Date().getDay();
  const todayKey = detailDayKeys[jsDay === 0 ? 6 : jsDay - 1];
  const today = hours[todayKey];
  return {
    short,
    today: today?.closed ? "Dnes zavřeno" : `Dnes otevřeno do ${today?.close || "18:00"}`,
  };
}

const safeWindow = () => (typeof window !== "undefined" ? window : null);

/** Same listing may appear as full UUID in session or as SEO slug in the path. */
/** Avoid hard crash if the URL segment contains malformed %-encoding. */
function safeDecodePathSegment(segment: string): string {
  if (!segment) return "";
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** date-fns `format` throws on Invalid Date — that took down the whole listing page. */
function formatListingDateCs(value: unknown): string {
  try {
    const d =
      value instanceof Date ? value : new Date(value as string | number);
    if (Number.isNaN(d.getTime())) return "—";
    return format(d, "dd.MM.yyyy");
  } catch {
    return "—";
  }
}

function listingSegmentsReferToSameListing(a: string, b: string): boolean {
  if (a === b) return true;
  const norm = (s: string) => s.replace(/-/g, "").toLowerCase();
  const na = norm(a);
  const nb = norm(b);
  if (na.length >= 8 && nb.length >= 8) {
    if (na.startsWith(nb.slice(0, 8)) || nb.startsWith(na.slice(0, 8)))
      return true;
  }
  const tail = (s: string) =>
    s.match(/([a-f0-9]{8})$/i)?.[1]?.toLowerCase() ?? "";
  const ta = tail(a);
  const tb = tail(b);
  if (ta && tb && ta === tb) return true;
  if (ta && nb.startsWith(ta)) return true;
  if (tb && na.startsWith(tb)) return true;
  return false;
}

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

type ListingDetailPageProps = {
  initialListing?: Listing | null;
  initialListingId?: string;
  initialDealerProfile?: DealerProfileForDetail | null;
  initialDealerInventory?: DealerInventoryItem[];
  embeddedMode?: boolean;
  /** When `delegated`, SSR owns the visible `<h1>` — title here is `sr-only` for tests/a11y text. */
  primaryHeading?: "page" | "delegated";
};

export default function ListingDetailPage({
  initialListing = null,
  initialListingId,
  initialDealerProfile = null,
  initialDealerInventory = [],
  embeddedMode,
  primaryHeading = "page",
}: ListingDetailPageProps = {}) {
  const t = useTranslation();
  const { language } = useLanguage();
  const localizedOptions = useLocalizedOptions();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const pathname = usePathname();

  const routeParams = useParams();
  // Prefer the server-provided UUID (initialListingId) over URL-parsed
  // values which may be SEO slug segments (…-507296e4) instead of raw UUIDs.
  const idFromPathname =
    pathname.match(/\/auta\/[^/]+\/[^/]+\/([^/?#]+)/)?.[1] ||
    pathname.match(/\/listing\/([^/?#]+)/)?.[1] ||
    "";
  const rawRouteId = safeDecodePathSegment(
    (routeParams?.id as string) || idFromPathname || "",
  );
  const isFullUuid =
    /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      rawRouteId,
    );
  const seoSlugShortId = extractShortIdFromSlug(rawRouteId);
  const listingId =
    initialListingId ||
    (isFullUuid ? rawRouteId : null) ||
    (seoSlugShortId ? rawRouteId : null) ||
    initialListing?.id ||
    (typeof window !== "undefined"
      ? (() => {
          const path = window.location.pathname;
          const legacyMatch = path.match(
            /\/listing\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
          );
          if (legacyMatch) return legacyMatch[1];
          return null;
        })()
      : null) ||
    undefined;
  const isEmbedded = embeddedMode ?? (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("embedded") === "1"
  );

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showChatLoginModal, setShowChatLoginModal] = useState(false);
  const [chatAuthPromptOpen, setChatAuthPromptOpen] = useState(false);
  const [chatLoginInitialTab, setChatLoginInitialTab] = useState<
    "login" | "register"
  >("register");
  const [embeddedSearchQuery, setEmbeddedSearchQuery] = useState("");
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [cebiaDialogOpen, setCebiaDialogOpen] = useState(false);
  const tiktokTrackedListingRef = useRef<string | null>(null);
  const [cebiaGuest, setCebiaGuest] = useState<{ reportId: string; token: string } | null>(
    null,
  );
  const [cebiaGuestStatus, setCebiaGuestStatus] = useState<string | null>(null);
  const [cebiaGuestHasPdf, setCebiaGuestHasPdf] = useState(false);
  const [listingEditOpen, setListingEditOpen] = useState(false);
  const [dealerHoursOpen, setDealerHoursOpen] = useState(false);

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

  const getReturnUrl = useCallback(() => {
    const parseListingStateReturnUrl = () => {
      try {
        const raw = sessionStorage.getItem(LISTING_STATE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
          listingId?: string | null;
          returnUrl?: string;
          savedAt?: number;
        };
        if (!parsed || typeof parsed.returnUrl !== "string") return null;
        if (!parsed.returnUrl.startsWith("/")) return null;
        if (
          typeof parsed.savedAt === "number" &&
          Number.isFinite(parsed.savedAt) &&
          Date.now() - parsed.savedAt > 10 * 60 * 1000
        ) {
          return null;
        }
        if (
          parsed.listingId &&
          listingId &&
          !listingSegmentsReferToSameListing(parsed.listingId, listingId)
        ) {
          return null;
        }
        return parsed.returnUrl;
      } catch {
        return null;
      }
    };

    const fromHistoryState =
      window.history.state &&
      typeof window.history.state === "object" &&
      typeof (window.history.state as { from?: unknown }).from === "string"
        ? (window.history.state as { from: string }).from
        : null;
    if (fromHistoryState && fromHistoryState.startsWith("/")) {
      restoreDebug("detail", "get-return-url:history-state", {
        listingId,
        returnUrl: fromHistoryState,
      });
      return fromHistoryState;
    }

    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (fromParam && fromParam.startsWith("/")) {
      restoreDebug("detail", "get-return-url:from-param", {
        listingId,
        returnUrl: fromParam,
      });
      return fromParam;
    }
    const fromListingState = parseListingStateReturnUrl();
    if (fromListingState) {
      restoreDebug("detail", "get-return-url:listing-state", {
        listingId,
        returnUrl: fromListingState,
      });
      return fromListingState;
    }
    const fromSession = sessionStorage.getItem(LISTINGS_RETURN_URL_KEY);
    if (fromSession) {
      restoreDebug("detail", "get-return-url:session", {
        listingId,
        returnUrl: fromSession,
      });
      return fromSession;
    }
    if (!listingId) return null;

    // Last-resort fallback: derive source route from same-origin referrer.
    // This keeps back behavior deterministic even if storage/query context is lost.
    try {
      if (!document.referrer) return null;
      const ref = new URL(document.referrer);
      if (ref.origin !== window.location.origin) return null;
      if (ref.pathname !== "/" && ref.pathname !== "/listings") return null;
      const refPath = `${ref.pathname}${ref.search}`;
      const hashTargetId = initialListingId ?? listingId;
      const fallbackUrl = `${refPath}#listing-${encodeURIComponent(hashTargetId)}`;
      restoreDebug("detail", "get-return-url:referrer-fallback", {
        listingId,
        returnUrl: fallbackUrl,
      });
      return fallbackUrl;
    } catch {
      restoreDebug("detail", "get-return-url:none", { listingId });
      return null;
    }
  }, [listingId, initialListingId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromParam = new URLSearchParams(window.location.search).get("from");
    if (!fromParam || !fromParam.startsWith("/")) return;

    // Keep one canonical return target per opened detail page.
    sessionStorage.setItem(LISTINGS_RETURN_URL_KEY, fromParam);
    sessionStorage.setItem(
      LISTING_STATE_KEY,
      JSON.stringify({
        listingId: (initialListingId ?? listingId) ?? null,
        returnUrl: fromParam,
        scrollY: null,
        savedAt: Date.now(),
      }),
    );

    const hashIndex = fromParam.indexOf("#listing-");
    if (hashIndex === -1) return;
    const targetId = fromParam.slice(hashIndex + "#listing-".length);
    if (!targetId) return;
    sessionStorage.setItem(LISTINGS_TARGET_ID_KEY, decodeURIComponent(targetId));
    restoreDebug("detail", "canonicalized-from-to-session", {
      listingId,
      fromParam,
      targetId: decodeURIComponent(targetId),
    });
  }, [listingId, initialListingId]);

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery<Listing>({
    queryKey: [`/api/listings/${listingId}`],
    enabled: !!listingId,
    initialData: initialListing ?? undefined,
  });

  useEffect(() => {
    const storageKeyId =
      listing?.id ?? (isFullUuid ? listingId : undefined);
    if (!storageKeyId) return;
    try {
      const raw = localStorage.getItem(`cebia:guest:${storageKeyId}`);
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
  }, [listing?.id, listingId, isFullUuid]);

  const resolvedListingUuid =
    listing?.id ??
    initialListingId ??
    (isFullUuid ? rawRouteId : undefined);

  const { data: seller } = useQuery<PublicContact>({
    queryKey: [`/api/users/${listing?.userId}`],
    enabled: !!listing?.userId,
  });
  const [dealerLocalSettings, setDealerLocalSettings] =
    useState<DealerLocalSettingsForDetail>({});

  const isDealerListing =
    !!listing &&
    !!initialDealerProfile;

  useEffect(() => {
    if (!initialDealerProfile?.id) return;
    setDealerLocalSettings(readDealerLocalSettings(initialDealerProfile.id));
  }, [initialDealerProfile?.id]);

  useEffect(() => {
    if (!listing?.id) return;
    if (tiktokTrackedListingRef.current === listing.id) return;
    if (typeof window === "undefined") return;

    const ttq = (window as typeof window & { ttq?: { track?: Function } }).ttq;
    if (typeof ttq === "undefined" || typeof ttq.track !== "function") return;

    ttq.track("ViewContent", {
      content_type: "product",
      content_category: "car",
      content_name: document.title,
      currency: "CZK",
    });
    tiktokTrackedListingRef.current = listing.id;
  }, [listing?.id]);

  const canSeeListingAnalytics =
    !!listing && !!user && (user.isAdmin || user.id === listing.userId);

  // Use the shared batch hook so the numbers on the detail page come from
  // the same react-query cache as the numbers shown on listing cards in
  // /listings?userId=me and on the home catalogue for admins. The hook
  // internally hits /api/listings/analytics/batch with a single id.
  const { stats: sharedStats } = useListingStats(
    resolvedListingUuid,
    { enabled: canSeeListingAnalytics && !!resolvedListingUuid },
  );

  const listingAnalyticsSafe: ListingAnalytics = {
    listingId: resolvedListingUuid ?? listing?.id ?? listingId ?? "",
    views: sharedStats?.views ?? 0,
    contactClicks: sharedStats?.contactClicks ?? 0,
    whatsappClicks: sharedStats?.whatsappClicks ?? 0,
    telegramClicks: sharedStats?.telegramClicks ?? 0,
  };

  const listingVinRaw = (listing?.vin || "").trim().toUpperCase();
  const hasValidVin = /^[A-HJ-NPR-Z0-9]{17}$/.test(listingVinRaw);

  const { data: cebiaConfig } = useQuery<{
    enabled: boolean;
    paymentsFrozen: boolean;
    autoRequestOnPaid?: boolean;
    priceCents?: number;
    currency?: string;
  }>({
    queryKey: ["/api/cebia/config"],
    enabled: hasValidVin,
    staleTime: 30 * 60 * 1000,
  });

  const cebiaPaymentsFrozen = cebiaConfig?.paymentsFrozen === true;
  const listingVin = listingVinRaw;
  const listingVinValid = hasValidVin;

  const clearInteractionLocks = useCallback(() => {
    document.body.style.pointerEvents = "";
    document.body.style.overflow = "";
    document.body.style.touchAction = "";
    document.body.style.overscrollBehavior = "";
    document.documentElement.style.pointerEvents = "";
    document.documentElement.style.overflow = "";
    document.documentElement.style.touchAction = "";
    document.documentElement.style.overscrollBehavior = "";
  }, []);

  const handleCebiaClick = useCallback(() => {
    if (!listingVinValid) {
      toast({
        variant: "destructive",
        title: t("cebia.unavailable"),
        description: t("cebia.requiresListingVin"),
      });
      return;
    }
    clearInteractionLocks();
    setCebiaDialogOpen(true);
  }, [clearInteractionLocks, listingVinValid, t, toast]);

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

  // Stripe Cebia redirect: ensure dialog state and page interactivity are restored.
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cebiaParam = urlParams.get("cebia");
    if (!cebiaParam) return;

    // Close potentially stale dialog state after returning from payment.
    setCebiaDialogOpen(false);
    clearInteractionLocks();

    if (cebiaParam === "success") {
      toast({
        title: t("cebia.paySuccess"),
      });
    } else if (cebiaParam === "cancelled") {
      toast({
        variant: "destructive",
        title: t("cebia.payCancelled"),
      });
    }

    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete("cebia");
    newUrl.searchParams.delete("session_id");
    newUrl.searchParams.delete("report_id");
    newUrl.searchParams.delete("nnauto_report_id");
    window.history.replaceState({}, "", newUrl.toString());
  }, [clearInteractionLocks, t, toast]);

  useEffect(() => {
    const restoreAfterReturn = () => {
      // Browsers can keep stale modal/pointer lock state after external redirect.
      setCebiaDialogOpen(false);
      clearInteractionLocks();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        restoreAfterReturn();
      }
    };

    window.addEventListener("pageshow", restoreAfterReturn);
    window.addEventListener("focus", restoreAfterReturn);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("pageshow", restoreAfterReturn);
      window.removeEventListener("focus", restoreAfterReturn);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [clearInteractionLocks]);

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
  const preloadedCarouselUrlsRef = useRef<Set<string>>(new Set());

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

  // Preload nearby photos (current + next 2) for fast swipe; rest load on demand.
  useEffect(() => {
    const len = photoKeys.length;
    if (!len) return;
    const w = safeWindow();
    if (!w) return;
    if (!canPrefetchHeavyResources()) return;

    const isDesktop = isLgViewport();
    const preloadWidth = isDesktop ? 960 : 520;
    const preloadQuality = isDesktop ? 76 : 64;
    const preloadCount = Math.min(isDesktop ? 3 : 1, len);

    const preload = () => {
      for (let i = 0; i < preloadCount; i++) {
        const idx = (currentCarouselIndex + i) % len;
        const key = photoKeys[idx];
        const url = getOptimizedImageUrl(key, {
          width: preloadWidth,
          quality: preloadQuality,
          format: "webp",
        });
        if (preloadedCarouselUrlsRef.current.has(url)) continue;
        preloadedCarouselUrlsRef.current.add(url);
        const img = new Image();
        img.decoding = "async";
        img.src = url;
      }
    };

    const idleApi = w as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleApi.requestIdleCallback) {
      const idleId = idleApi.requestIdleCallback(preload, { timeout: isDesktop ? 220 : 700 });
      return () => idleApi.cancelIdleCallback?.(idleId);
    }
    const timeoutId = w.setTimeout(preload, isDesktop ? 80 : 300);
    return () => w.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoKeys.length, currentCarouselIndex]);

  // Lightbox pre-warm: once the detail page is interactive, drip-feed
  // lightbox-sized URLs for ALL photos into the browser cache so the very
  // first fullscreen open and any later fast swipe paint immediately. The
  // /img/ route ships `immutable` headers, so repeat hits cost zero. Runs
  // exclusively on idle frames; never competes with the carousel.
  const preloadedLightboxUrlsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    const len = photoKeys.length;
    if (len <= 1) return;
    const w = safeWindow();
    if (!w) return;
    if (!canPrefetchHeavyResources()) return;
    const isDesktop = isLgViewport();
    const seen = preloadedLightboxUrlsRef.current;

    const idleApi = w as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const schedule = (cb: () => void) =>
      idleApi.requestIdleCallback
        ? idleApi.requestIdleCallback(cb, { timeout: 2000 })
        : (w.setTimeout(cb, 600) as unknown as number);
    const cancel = (id: number) => {
      if (idleApi.cancelIdleCallback) idleApi.cancelIdleCallback(id);
      else w.clearTimeout(id);
    };

    let cancelled = false;
    let handle: number | null = null;

    const step = (i: number) => {
      if (cancelled || i >= len) return;
      handle = schedule(() => {
        if (cancelled) return;
        const key = photoKeys[i];
        const instantUrl = getLightboxInstantUrl(key, isDesktop);
        if (!seen.has(instantUrl)) {
          seen.add(instantUrl);
          const img = new Image();
          img.decoding = "async";
          img.src = instantUrl;
        }
        step(i + 1);
      });
    };
    // Skip the first photo — carousel handles it eagerly already.
    step(1);

    return () => {
      cancelled = true;
      if (handle != null) cancel(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoKeys]);

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

  const handlePhotoThumbnailClick = useCallback(
    (index: number) => {
      // If user taps the already selected thumbnail, open gallery immediately.
      if (index === currentCarouselIndex) {
        openLightboxAt(index);
        return;
      }
      scrollToCarouselItem(index);
    },
    [currentCarouselIndex, openLightboxAt, scrollToCarouselItem],
  );

  const handleVideoThumbnailClick = useCallback(() => {
    const videoIndex = photoKeys.length;
    if (currentCarouselIndex === videoIndex) {
      openLightboxAt(videoIndex);
      return;
    }
    scrollToCarouselItem(videoIndex);
  }, [currentCarouselIndex, openLightboxAt, photoKeys.length, scrollToCarouselItem]);

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

  const toggleSoldMutation = useMutation({
    mutationFn: async ({ isSold }: { isSold: boolean }) => {
      const row = listingId
        ? queryClient.getQueryData<Listing>([`/api/listings/${listingId}`])
        : undefined;
      const id = row?.id;
      if (!id) throw new Error("Missing listing");
      const res = await apiRequest("PUT", `/api/listings/${id}`, {
        isSold,
      });
      return (await res.json()) as Listing;
    },
    onSuccess: (updated) => {
      if (listingId) {
        queryClient.setQueryData([`/api/listings/${listingId}`], updated);
      }
      if (updated?.id && updated.id !== listingId) {
        queryClient.setQueryData([`/api/listings/${updated.id}`], updated);
      }
      queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "/api/listings",
        refetchType: "all",
      });
      toast({
        title: t("listing.soldStatusUpdated"),
        description: t("listing.soldStatusUpdatedDescription"),
      });
    },
    onError: (err: any) => {
      const parsed = parseApiError(err);
      toast({
        variant: "destructive",
        title: t("listing.updateError"),
        description: parsed.message || t("listing.updateErrorDescription"),
      });
    },
  });

  const isOwner = !!user && !!listing && user.id === listing.userId;
  const canPromote =
    isOwner && !listing?.isTopListing && !listing?.isSold;

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
        listingId: listing!.id,
      });
      return (await res.json()) as { url?: string; reportId?: string; guestToken?: string };
    },
    onSuccess: (data) => {
      if (data?.url) {
        if (!user && data?.reportId && data?.guestToken && listing?.id) {
          try {
            localStorage.setItem(
              `cebia:guest:${listing.id}`,
              JSON.stringify({ reportId: data.reportId, token: data.guestToken }),
            );
            setCebiaGuest({ reportId: data.reportId, token: data.guestToken });

            localStorage.setItem(
              "cebia:last",
              JSON.stringify({
                listingId: listing.id,
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

  useEffect(() => {
    const resetCebiaPendingState = () => {
      // BFCache/Stripe return can preserve stale mutation pending flags.
      cebiaCheckoutMutation.reset();
      cebiaRefreshMutation.reset();
      cebiaGuestRequestMutation.reset();
      cebiaGuestPollMutation.reset();
    };

    const recoverCebiaUiState = () => {
      setCebiaDialogOpen(false);
      clearInteractionLocks();
      resetCebiaPendingState();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recoverCebiaUiState();
      }
    };

    window.addEventListener("pageshow", recoverCebiaUiState);
    window.addEventListener("focus", recoverCebiaUiState);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pageshow", recoverCebiaUiState);
      window.removeEventListener("focus", recoverCebiaUiState);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [
    cebiaCheckoutMutation,
    cebiaGuestPollMutation,
    cebiaGuestRequestMutation,
    cebiaRefreshMutation,
    clearInteractionLocks,
  ]);

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
      ethanol: t("hero.ethanol"),
      hydrogen: t("hero.hydrogen"),
      other: t("hero.otherFuel"),
    }),
    [t],
  );

  const getTransmissionLabel = useCallback(
    (values: string[] | string | null) => {
      if (!values) return "";
      const arr = Array.isArray(values) ? values : [values];
      return arr.map((v) => transmissionLabels[v as keyof typeof transmissionLabels] || v).join(", ");
    },
    [transmissionLabels],
  );

  const getFuelTypeLabel = useCallback(
    (values: string[] | string | null) => {
      if (!values) return "";
      const arr = Array.isArray(values) ? values : [values];
      return arr.map((v) => fuelLabels[v as keyof typeof fuelLabels] || v).join(", ");
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

  const handleOpenChat = useCallback(async () => {
    if (!listing) return;
    if (!user) {
      setChatAuthPromptOpen(true);
      return;
    }
    if (user.id === listing.userId) {
      toast({ title: "Nelze psát sám sobě", variant: "destructive" });
      return;
    }
    const vehicleLabel =
      getListingMainTitle(listing) ||
      [listing.brand, listing.model].filter(Boolean).join(" ").trim() ||
      listing.title?.trim() ||
      "auto";
    try {
      const res = await apiRequest(
        "POST",
        "/api/messages/conversations/ensure-from-listing",
        { listingId: listing.id },
      );
      const data = (await res.json()) as { conversationId?: string };
      if (data?.conversationId) {
        const prefill: ChatComposePrefillPayload = {
          conversationId: data.conversationId,
          text: `Dobrý den, píšu vám ohledně vašeho auta: ${vehicleLabel}`,
        };
        try {
          sessionStorage.setItem(
            CHAT_COMPOSE_PREFILL_STORAGE_KEY,
            JSON.stringify(prefill),
          );
        } catch {
          /* ignore */
        }
        navigate(
          `/zpravy?conversationId=${encodeURIComponent(data.conversationId)}`,
        );
        return;
      }
    } catch {
      /* fall through to generic inbox */
    }
    navigate("/zpravy");
  }, [listing, user, toast, navigate]);

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

    const shareUrl = buildListingAbsoluteUrl({
      id: listing.id,
      brand: listing.brand,
      model: listing.model,
    });
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
    async (
      eventType:
        | "view"
        | "contact_click"
        | "whatsapp_click"
        | "telegram_click",
    ) => {
      if (!resolvedListingUuid) return;
      try {
        await apiRequest(
          "POST",
          `/api/listings/${encodeURIComponent(resolvedListingUuid)}/analytics/${eventType}`,
          {},
        );
        if (canSeeListingAnalytics) {
          // Invalidate every batch-analytics cache entry so both the
          // detail page and the listing cards pick up the fresh number.
          queryClient.invalidateQueries({
            predicate: (q) => {
              const key = q.queryKey?.[0];
              return (
                typeof key === "string" &&
                key.startsWith("/api/listings/analytics/batch")
              );
            },
          });
        }
      } catch {
        // Analytics should never block user actions.
      }
    },
    [resolvedListingUuid, canSeeListingAnalytics],
  );

  useEffect(() => {
    if (!resolvedListingUuid || !listing) return;
    const sessionKey = `listing-analytics:view:${resolvedListingUuid}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    void trackListingAnalyticsEvent("view");
    try {
      const priceNum = Number.parseFloat(String(listing.price ?? ""));
      trackViewContent({
        contentId: resolvedListingUuid,
        contentName: getListingMainTitle(listing),
        contentCategory: listing.bodyType || listing.category || undefined,
        value: Number.isFinite(priceNum) ? priceNum : undefined,
        currency: "CZK",
      });
    } catch { /* analytics must never break the app */ }
  }, [resolvedListingUuid, listing, trackListingAnalyticsEvent]);

  // ⚠️ CRITICAL UX LOGIC
  // Swipe/back + "zpět na inzeráty" must behave identically
  // Preserves listing context (filters, page, scroll, item)
  // DO NOT MODIFY without full regression testing
  const handleBack = useCallback(() => {
    if (isEmbedded && window.parent && window.parent !== window) {
      window.parent.postMessage({ type: "nnauto-close-listing-overlay" }, "*");
      return;
    }

    const preferredReturnUrl = getReturnUrl();
    restoreDebug("detail", "button-back-triggered", {
      listingId,
      returnUrl: preferredReturnUrl ?? null,
      historyLength: window.history.length,
      isEmbedded,
    });
    if (preferredReturnUrl) {
      navigate(preferredReturnUrl);
      return;
    }
    if (window.history.length > 1) {
      const currentUrl = window.location.href;
      window.history.back();
      window.setTimeout(() => {
        if (window.location.href !== currentUrl) return;
        if (preferredReturnUrl) {
          navigate(preferredReturnUrl);
          return;
        }
        navigate("/listings");
      }, 180);
      return;
    }
    if (preferredReturnUrl) {
      navigate(preferredReturnUrl);
      return;
    }
    navigate("/listings");
  }, [getReturnUrl, isEmbedded, navigate]);

  useEffect(() => {
    if (isEmbedded) return;
    if (typeof window === "undefined") return;
    if (!isMobileViewport()) return;

    // Keep swipe-back on the exact same path as the button: call handleBack directly.
    const handleMobileSwipeBack = (event: PopStateEvent) => {
      restoreDebug("detail", "mobile-popstate-back", {
        listingId,
        nextStateKeys:
          event.state && typeof event.state === "object"
            ? Object.keys(event.state)
            : [],
      });
      window.removeEventListener("popstate", handleMobileSwipeBack);
      handleBack();
    };

    window.addEventListener("popstate", handleMobileSwipeBack);
    return () => {
      window.removeEventListener("popstate", handleMobileSwipeBack);
    };
  }, [handleBack, isEmbedded, listingId]);

  const handleEmbeddedSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const term = embeddedSearchQuery.trim();
      const target = term
        ? `/listings?search=${encodeURIComponent(term)}`
        : "/listings";

      if (isEmbedded && window.parent && window.parent !== window) {
        window.parent.location.assign(target);
        return;
      }
      window.location.assign(target);
    },
    [embeddedSearchQuery, isEmbedded],
  );

  // Do not add custom touch-swipe handling here.
  // Native browser swipe/back must be the single source of truth to avoid
  // duplicate navigation paths (touch handler + browser back) and inconsistent restore.

  // (Cebia UI placeholder only for now)

  // --- SEO (memoized)
  const listingUrl = useMemo(
    () =>
      listing
        ? buildListingAbsoluteUrl({
            id: listing.id,
            brand: listing.brand,
            model: listing.model,
            year: listing.year,
          })
        : "",
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
    const brandSlug = normalizeSlug(listing.brand);
    const modelSlug = normalizeSlug(listing.model);
    const brandLabel = String(listing.brand ?? "").trim();
    const modelLabel = String(listing.model ?? "").trim();
    return generateBreadcrumbSchema([
      {
        name:
          language === "cs" ? "Domů" : language === "uk" ? "Головна" : "Home",
        url: "https://nnauto.cz/",
      },
      ...(brandSlug
        ? [
            {
              name: brandLabel,
              url: `https://nnauto.cz/auta/${brandSlug}`,
            },
          ]
        : []),
      ...(brandSlug && modelSlug
        ? [
            {
              name: modelLabel,
              url: `https://nnauto.cz/auta/${brandSlug}/${modelSlug}`,
            },
          ]
        : []),
      {
        name: `${listing.year} ${listing.brand} ${listing.model}`.trim(),
        url: buildListingAbsoluteUrl({
          id: listing.id,
          brand: listing.brand,
          model: listing.model,
          year: listing.year,
        }),
      },
    ]);
  }, [listing, language]);

  const seoTitle = useMemo(() => {
    if (!listing) return "";
    const price = Number(listing.price).toLocaleString(
      language === "cs"
        ? "cs-CZ"
        : language === "uk"
          ? "uk-UA"
          : language === "de"
            ? "de-DE"
            : "en-US",
    );
    return `${listing.year} ${listing.brand} ${listing.model} - ${price} ${
      language === "en" ? "CZK" : "Kč"
    } | Prodej`;
  }, [listing, language]);

  const seoDescription = useMemo(() => {
    if (!listing) return "";
    const price = Number(listing.price).toLocaleString("cs-CZ");
    const km = listing.mileage.toLocaleString("cs-CZ");
    const fuel = listing.fuelType?.[0] || "";
    const trans = listing.transmission?.[0] || "";
    const power = listing.power ? `, ${listing.power} kW` : "";
    const engine = listing.engineVolume ? ` ${listing.engineVolume}l` : "";
    const region = listing.region ? `, ${listing.region}` : "";
    const base = `${listing.year} ${listing.brand} ${listing.model}${engine}${power}. ${km} km, ${fuel}, ${trans}. ${price} Kč${region}.`;
    const cta = language === "cs" ? "Koupit na NNAuto.cz" : language === "uk" ? "Купити на NNAuto.cz" : language === "de" ? "Kaufen auf NNAuto.cz" : "Buy on NNAuto.cz";
    const desc = listing.description ? listing.description.substring(0, 100).replace(/\n/g, " ") + "..." : "";
    return `${base} ${desc} ${cta}`.substring(0, 160);
  }, [listing, language]);

  const seoImage = useMemo(() => {
    const first = photoKeys[0];
    return first ? `https://nnauto.cz/objects/${first}` : undefined;
  }, [photoKeys]);

  const seoKeywords = useMemo(() => {
    if (!listing) return "";
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
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip overscroll-x-none touch-pan-y">
        <Header compactMobile={isEmbedded} showMobileSearch={!isEmbedded} />
        <PageLoaderInline text={t("detail.loading")} />
      </div>
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
      <div className="min-h-screen w-full max-w-[100vw] overflow-x-clip overscroll-x-none touch-pan-y">
        <Header compactMobile={isEmbedded} showMobileSearch={!isEmbedded} />
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
      </div>
    );
  }

  const dealerHours = formatDealerWorkingHours(dealerLocalSettings);
  const dealerPublicUrl = initialDealerProfile
    ? `/dealer/${initialDealerProfile.id}`
    : "";
  const dealerMapQuery =
    initialDealerProfile?.address ||
    initialDealerProfile?.region ||
    getLocalizedRegion(listing.region) ||
    "";
  const dealerMapHref = dealerMapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        dealerMapQuery,
      )}`
    : "";
  const dealerMapEmbedSrc = dealerMapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(
        dealerMapQuery,
      )}&output=embed`
    : "";
  const dealerInitials = initialDealerProfile?.companyName
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NN";
  const dealerPhone =
    (dealerLocalSettings.integrations?.useSamePhone
      ? dealerLocalSettings.integrations?.sharedPhone
      : dealerLocalSettings.integrations?.whatsappPhone) ||
    initialDealerProfile?.phone ||
    listing.phone ||
    seller?.phone ||
    "";
  const dealerWhatsappEnabled =
    !!dealerLocalSettings.integrations?.whatsappConnected && !!dealerPhone;
  const dealerTelegramEnabled =
    !!dealerLocalSettings.integrations?.telegramConnected &&
    !!(
      dealerLocalSettings.integrations?.useSamePhone
        ? dealerLocalSettings.integrations?.sharedPhone
        : dealerLocalSettings.integrations?.telegramPhone
    );
  const dealerSocialLinks = [
    ["Web", dealerLocalSettings.socialLinks?.website || initialDealerProfile?.website || ""],
    ["Facebook", dealerLocalSettings.socialLinks?.facebook || ""],
    ["Instagram", dealerLocalSettings.socialLinks?.instagram || ""],
    ["TikTok", dealerLocalSettings.socialLinks?.tiktok || ""],
    ["YouTube", dealerLocalSettings.socialLinks?.youtube || ""],
  ].filter(([, value]) => String(value).trim());
  const dealerActiveSince = initialDealerProfile?.createdAt
    ? new Date(initialDealerProfile.createdAt).getFullYear()
    : 2026;
  const vehicleHighlights = [
    getTransmissionLabel(listing.transmission),
    listing.hasServiceBook ? "Servisní historie" : "",
    listing.owners === 1 ? "1. majitel" : "",
    listing.extras?.includes("notDamaged") ? "Nehavarované" : "",
    listing.vatDeductible ? "Možnost odpočtu DPH" : "",
  ].filter(Boolean).slice(0, 5);
  const monthlyFinance = Math.max(1900, Math.round(Number(listing.price) / 72 / 100) * 100);

  return (
    <div
      className={`min-h-screen w-full max-w-[100vw] overflow-x-clip overscroll-x-none touch-pan-y ${
        listing && !isEmbedded
          ? "pb-[calc(5rem+env(safe-area-inset-bottom,0px))]"
          : ""
      }`}
    >
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        image={seoImage}
        url={listingUrl}
        type="product"
        locale={
          language === "cs"
            ? "cs_CZ"
            : language === "uk"
              ? "uk_UA"
              : language === "de"
                ? "de_DE"
                : "en_US"
        }
        alternateLanguages={[
          { lang: "cs", url: listingUrl },
          { lang: "uk", url: listingUrl },
          { lang: "en", url: listingUrl },
          { lang: "de", url: listingUrl },
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@graph": [
            ...(vehicleSchema ? [vehicleSchema] : []),
            ...(breadcrumbSchema ? [breadcrumbSchema] : []),
          ],
        }}
      />

      <Header compactMobile={isEmbedded} showMobileSearch={!isEmbedded} />

      <div
        className={`min-h-screen bg-background ${isEmbedded ? "pb-24 md:pb-0" : ""}`}
      >
        {isEmbedded && (
          <div className="md:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="px-4 py-3 flex items-center gap-2">
              <div className="shrink-0">
                <MobileFilters
                  autoApply={false}
                  applyButtonLabel={t("hero.search")}
                />
              </div>
              <form onSubmit={handleEmbeddedSearchSubmit} className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder={t("header.search")}
                    className="pl-12 h-12 rounded-xl w-full min-w-0"
                    value={embeddedSearchQuery}
                    onChange={(e) => setEmbeddedSearchQuery(e.target.value)}
                    data-testid="input-embedded-search-mobile"
                  />
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
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
                <div className="relative group/gallery">
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
                              className="aspect-[3/2] relative bg-muted cursor-pointer touch-manipulation"
                              onClick={() => openLightboxAt(index)}
                            >
                              <ResponsiveImage
                                // було 400px → робимо 768px, щоб на мобільному/retina було чітко
                                mobileSrc={getOptimizedImageUrl(key, {
                                  width: 560,
                                  quality: 78,
                                  format: "webp",
                                })}
                                // було 1200px → робимо 1600px для деталки (виглядає значно різкіше)
                                desktopSrc={getOptimizedImageUrl(key, {
                                  width: 1120,
                                  quality: 84,
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

                              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20 z-20">
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
                                  bottom: "12px",
                                  right: "12px",
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

                      {/* Navigation arrows - hidden by default, visible on hover */}
                      {hasMultipleItems && (
                        <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 z-10 flex justify-between pointer-events-none opacity-0 group-hover/gallery:opacity-100 transition-opacity duration-200">
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
                    <div className="flex gap-2 overflow-x-auto overscroll-x-contain touch-pan-x pb-1">
                      {photoKeys.map((key, index) => {
                        const isActive = index === currentCarouselIndex;
                        return (
                          <button
                            type="button"
                            key={`thumb-${key}-${index}`}
                            onClick={() => handlePhotoThumbnailClick(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all touch-manipulation ${
                              isActive
                                ? "border-primary ring-2 ring-primary/30"
                                : "border-transparent hover:border-primary/50"
                            }`}
                            data-testid={`button-thumbnail-${index}`}
                          >
                            <ResponsiveImage
                              mobileSrc={getOptimizedImageUrl(key, {
                                width: 80,
                                quality: 70,
                                format: "webp",
                              })}
                              desktopSrc={getOptimizedImageUrl(key, {
                                width: 144,
                                quality: 76,
                                format: "webp",
                              })}
                              desktopMinWidth={1024}
                              upgrade={index === currentCarouselIndex}
                              alt={`${getListingMainTitle(listing)}${listing.year ? ` ${listing.year}` : ""} – foto ${index + 1}`}
                              loading={index === 0 ? "eager" : "lazy"}
                              decoding="async"
                              sizes="64px"
                              className="w-full h-full object-cover"
                            />
                          </button>
                        );
                      })}

                      {hasVideo && (
                        <button
                          type="button"
                          onClick={handleVideoThumbnailClick}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all relative touch-manipulation ${
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

              {canSeeListingAnalytics && listing ? (
                <ListingAnalyticsCard
                  listingId={listing.id}
                  listing={{
                    photos: listing.photos ?? null,
                    video: listing.video ?? null,
                    vin: listing.vin ?? null,
                    description: listing.description ?? null,
                    price: listing.price ?? null,
                    year: listing.year ?? null,
                    mileage: listing.mileage ?? null,
                    brand: listing.brand ?? null,
                    model: listing.model ?? null,
                    fuelType: listing.fuelType ?? null,
                    transmission: listing.transmission ?? null,
                    bodyType: listing.bodyType ?? null,
                  }}
                />
              ) : null}

              {/* Title and basic info */}
              <div className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1
                      className="text-3xl md:text-4xl font-bold tracking-tight"
                      data-testid="text-listing-title"
                    >
                      {getListingMainTitle(listing)}
                    </h1>
                    {listing.isSold ? (
                      <Badge
                        variant="secondary"
                        className="bg-zinc-800 text-white border-zinc-600 text-sm"
                      >
                        {t("listing.soldBadge")}
                      </Badge>
                    ) : null}
                  </div>
                  {listing.title ? (
                    <p className="text-sm text-muted-foreground">
                      {listing.title}
                    </p>
                  ) : null}
                  {isDealerListing && vehicleHighlights.length > 0 ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {vehicleHighlights.map((highlight) => (
                        <Badge
                          key={highlight}
                          variant="secondary"
                          className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-800"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {isOwner && listing && !isEmbedded ? (
                    <div className="flex flex-wrap gap-2 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setListingEditOpen(true)}
                        className="gap-1.5"
                        data-testid="button-detail-edit-listing"
                      >
                        <Pencil className="h-4 w-4" />
                        {t("listing.editButton")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          toggleSoldMutation.mutate({
                            isSold: !listing.isSold,
                          })
                        }
                        disabled={toggleSoldMutation.isPending}
                        className="gap-1.5"
                        data-testid="button-detail-toggle-sold"
                      >
                        {toggleSoldMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {listing.isSold
                          ? t("listing.markAvailable")
                          : t("listing.markSold")}
                      </Button>
                    </div>
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
                  <div className="ml-auto text-right lg:hidden">
                    <p
                      className="text-2xl font-bold leading-tight text-primary"
                      data-testid="text-price-top"
                    >
                      {new Intl.NumberFormat("cs-CZ").format(
                        Number(listing.price),
                      )}{" "}
                      Kč
                    </p>
                    {listing.vatDeductible ? (
                      <p className="text-xs text-muted-foreground">
                        {t("detail.vatIncluded")}
                      </p>
                    ) : null}
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
                              onClick={() => {
                                cebiaCheckoutMutation.reset();
                                handleCebiaClick();
                              }}
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

              {isDealerListing && initialDealerProfile ? (
                <section className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B8860B]">
                        Prodejce vozidla
                      </p>
                      <h2 className="mt-1 text-xl font-black text-zinc-950">
                        {initialDealerProfile.companyName}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          void trackListingAnalyticsEvent("contact_click");
                          setShowContactDialog(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B8860B] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700"
                      >
                        <Mail className="h-4 w-4" />
                        Napsat prodejci
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          void trackListingAnalyticsEvent("contact_click");
                          setShowContactDialog(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-900 transition hover:bg-amber-100"
                      >
                        <Phone className="h-4 w-4" />
                        Zobrazit kontakt
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <a
                            href={dealerPublicUrl}
                            className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-50 text-lg font-black text-amber-900 ring-1 ring-amber-100"
                          >
                            {initialDealerProfile.logoUrl ? (
                              <img
                                src={initialDealerProfile.logoUrl}
                                alt={initialDealerProfile.companyName}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              dealerInitials
                            )}
                          </a>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold uppercase tracking-wide text-[#B8860B]">
                                Autobazar
                              </span>
                              {initialDealerProfile.isVerified ? (
                                <Badge className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 hover:bg-emerald-50">
                                  <Shield className="mr-1 h-3 w-3" />
                                  Ověřený
                                </Badge>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                              {initialDealerProfile.description ||
                                "Ověřený autobazar s nabídkou vozů na NNAuto."}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <a
                                href={dealerPublicUrl}
                                className="inline-flex items-center rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
                              >
                                Profil prodejce
                              </a>
                              <a
                                href={`${dealerPublicUrl}#inventory`}
                                className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100"
                              >
                                {initialDealerInventory.length + 1} vozů v nabídce
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl bg-zinc-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                              Adresa
                            </p>
                            <div className="mt-2 flex gap-2 text-sm text-zinc-700">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#B8860B]" />
                              <span>
                                {initialDealerProfile.address ||
                                  initialDealerProfile.region ||
                                  getLocalizedRegion(listing.region)}
                              </span>
                            </div>
                          </div>
                          <div className="rounded-2xl bg-zinc-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                              Kontakt
                            </p>
                            <div className="mt-2 space-y-2 text-sm">
                              {dealerPhone ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    void trackListingAnalyticsEvent("contact_click");
                                    setShowContactDialog(true);
                                  }}
                                  className="flex items-center gap-2 font-semibold text-zinc-800 hover:text-[#B8860B]"
                                >
                                  <Phone className="h-4 w-4 text-[#B8860B]" />
                                  Zobrazit telefon
                                </button>
                              ) : null}
                              {(initialDealerProfile.email || seller?.email) ? (
                                <a
                                  href={`mailto:${initialDealerProfile.email || seller?.email}`}
                                  className="flex items-center gap-2 text-zinc-700 hover:text-[#B8860B]"
                                >
                                  <Mail className="h-4 w-4 text-[#B8860B]" />
                                  {initialDealerProfile.email || seller?.email}
                                </a>
                              ) : null}
                              {initialDealerProfile.website ? (
                                <a
                                  href={normalizeDealerUrl(initialDealerProfile.website)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 text-zinc-700 hover:text-[#B8860B]"
                                >
                                  <Globe className="h-4 w-4 text-[#B8860B]" />
                                  Web prodejce
                                </a>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 lg:p-3">
                        <div className="flex items-start justify-between gap-3 lg:mb-2">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wide text-[#B8860B]">
                              Otevírací doba
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDealerHoursOpen((open) => !open)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#B8860B] bg-[#B8860B] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition hover:bg-amber-700 lg:hidden"
                            aria-expanded={dealerHoursOpen}
                          >
                            {dealerHoursOpen ? "Skrýt" : "Zobrazit"}
                            <ChevronRight
                              className={`h-3.5 w-3.5 transition-transform ${
                                dealerHoursOpen ? "rotate-90" : ""
                              }`}
                            />
                          </button>
                        </div>
                        <div
                          className={`${
                            dealerHoursOpen ? "block" : "hidden"
                          } mt-3 space-y-1.5 lg:mt-0 lg:block lg:space-y-1`}
                        >
                          {detailDayKeys.map((day) => {
                            const dayHours = dealerLocalSettings.workingHours?.[day];
                            const isClosed = !!dayHours?.closed;
                            return (
                              <div
                                key={day}
                                className="flex items-center justify-between gap-4 rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-amber-100/70 lg:rounded-lg lg:px-2.5 lg:py-1.5 lg:text-xs"
                              >
                                <span className="font-bold text-zinc-800">
                                  {detailDayShort[day]}
                                </span>
                                <span
                                  className={
                                    isClosed
                                      ? "font-semibold text-zinc-400"
                                      : "font-semibold text-zinc-950"
                                  }
                                >
                                  {isClosed
                                    ? "Zavřeno"
                                    : `${dayHours?.open || "09:00"} - ${dayHours?.close || "17:00"}`}
                                </span>
                              </div>
                            );
                          })}
                          <p className="mt-3 text-xs text-zinc-500 lg:mt-2 lg:text-[11px]">
                            Na NNAuto od {dealerActiveSince}
                          </p>
                        </div>
                      </div>
                    </div>

                    {dealerMapEmbedSrc ? (
                      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                        <iframe
                          title={`Mapa - ${initialDealerProfile.companyName}`}
                          src={dealerMapEmbedSrc}
                          loading="lazy"
                          className="h-48 w-full border-0 xl:h-full xl:min-h-[260px]"
                        />
                        <div className="flex items-center justify-between gap-2 border-t border-zinc-200 bg-white px-3 py-2">
                          <span className="truncate text-xs font-medium text-zinc-500">
                            {dealerMapQuery}
                          </span>
                          <a
                            href={dealerMapHref}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-xs font-bold text-[#B8860B] hover:underline"
                          >
                            Otevřít mapu
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-28 lg:self-start lg:z-10">
              <Card className="min-h-[26rem] rounded-2xl shadow-xl sm:min-h-[28rem]">
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
                        try {
                          trackContact("phone", {
                            listingId: listing.id,
                            listingName: getListingMainTitle(listing),
                          });
                        } catch { /* noop */ }
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

                    </div>

                    {/* Internal chat button — same row style as WhatsApp/Telegram */}
                    {listing.userId !== user?.id && (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full gap-2"
                        onClick={handleOpenChat}
                        data-testid="button-open-chat"
                      >
                        <MessageCircle className="h-5 w-5 text-[#B8860B]" />
                        Napsat do chatu
                      </Button>
                    )}

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
                        onWhatsAppClick={() => {
                          void trackListingAnalyticsEvent("whatsapp_click");
                          try {
                            trackContact("whatsapp", {
                              listingId: listing.id,
                              listingName: getListingMainTitle(listing),
                            });
                          } catch { /* noop */ }
                        }}
                        onTelegramClick={() => {
                          void trackListingAnalyticsEvent("telegram_click");
                          try {
                            trackContact("telegram", {
                              listingId: listing.id,
                              listingName: getListingMainTitle(listing),
                            });
                          } catch { /* noop */ }
                        }}
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
                        onClick={() => {
                          cebiaCheckoutMutation.reset();
                          handleCebiaClick();
                        }}
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

                  {canSeeListingAnalytics ? (
                    <div className="space-y-3 text-sm rounded-xl border p-3 bg-muted/20">
                      <p className="font-semibold">
                        {language === "uk"
                          ? "Аналітика оголошення"
                          : language === "cs"
                            ? "Statistiky inzerátu"
                            : "Listing analytics"}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            {language === "uk"
                              ? "Перегляди"
                              : language === "cs"
                                ? "Zobrazení"
                                : "Views"}
                          </p>
                          <p className="font-semibold" data-testid="text-analytics-views">
                            {displayViews(listingAnalyticsSafe.views)}
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
                            {listingAnalyticsSafe.contactClicks}
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
                            {listingAnalyticsSafe.whatsappClicks}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-muted-foreground text-xs">
                            Telegram
                          </p>
                          <p
                            className="font-semibold"
                            data-testid="text-analytics-telegram-clicks"
                          >
                            {listingAnalyticsSafe.telegramClicks}
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
                        {formatListingDateCs(listing.createdAt)}
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

          {isDealerListing && initialDealerProfile && initialDealerInventory.length > 0 ? (
            <section className="mt-8 rounded-3xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6" id="dealer-inventory">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black">Další vozy tohoto prodejce</h2>
                  <p className="text-sm text-muted-foreground">
                    Prohlédněte si aktuální nabídku dealera {initialDealerProfile.companyName}.
                  </p>
                </div>
                <a
                  href={`${dealerPublicUrl}#inventory`}
                  className="inline-flex items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-bold hover:bg-amber-50"
                >
                  Zobrazit všechny vozy
                </a>
              </div>
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
                {initialDealerInventory.map((item) => {
                  const photo = item.photos?.[0];
                  const href = buildListingPath({
                    id: item.id,
                    brand: item.brand,
                    model: item.model,
                    year: item.year,
                  });
                  return (
                    <a
                      key={item.id}
                      href={href}
                      className="group w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg sm:w-auto"
                    >
                      <div className="aspect-[4/3] bg-muted">
                        {photo ? (
                          <img
                            src={`/img/${photo.replace(/^\/+/, "")}?w=420&h=315&fit=cover`}
                            alt={item.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Car className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="line-clamp-2 font-bold">{item.title || `${item.brand} ${item.model}`}</p>
                          {item.isTopListing ? (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-500">TOP</Badge>
                          ) : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.year} · {item.mileage?.toLocaleString("cs-CZ")} km · {Array.isArray(item.fuelType) ? item.fuelType[0] : ""}
                        </p>
                        <p className="text-lg font-black text-amber-800">
                          {Number(item.price).toLocaleString("cs-CZ")} Kč
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>
            </section>
          ) : null}
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
                        href={(() => {
                          const carTitle = getListingMainTitle(listing);
                          const subject = encodeURIComponent(
                            carTitle ? `Zájem o vůz ${carTitle}` : "Zájem o vůz",
                          );
                          // Same prefilled body shape as the WhatsApp /
                          // Telegram / contact-form widgets so the source
                          // tag is identical no matter which channel the
                          // user picks. appendListingSourceTag() keeps it
                          // idempotent.
                          const body = encodeURIComponent(
                            appendListingSourceTag(
                              carTitle
                                ? `Dobrý den, mám zájem o vůz ${carTitle}. Je ještě k dispozici?`
                                : "Dobrý den, mám zájem o vůz. Je ještě k dispozici?",
                            ),
                          );
                          return `mailto:${seller.email}?subject=${subject}&body=${body}`;
                        })()}
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
                        onClick={() => {
                          try {
                            trackContact("phone", {
                              listingId: listing.id,
                              listingName: getListingMainTitle(listing),
                            });
                          } catch { /* noop */ }
                        }}
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

            {/*
              The contact form (which writes into the dealer inbox at
              /dealer/messages) is shown only for dealer listings.
              Private sellers don't have a dashboard to read it from,
              so we deliberately hide the form for them and surface
              just phone + email above. Listings without an explicit
              sellerType (legacy data) keep the form by default so we
              don't regress the dealer-heavy production dataset.
            */}
            {/* Internal chat option in contact dialog */}
            {listing.userId !== user?.id && (
              <>
                <Separator />
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={() => {
                    setShowContactDialog(false);
                    handleOpenChat();
                  }}
                  data-testid="button-chat-in-dialog"
                >
                  <MessageCircle className="h-5 w-5 text-[#B8860B]" />
                  Napsat do chatu NNAuto
                </Button>
              </>
            )}

            {listing.sellerType !== "private" && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-sm font-semibold">
                    {t("detail.contactFormHeading")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("detail.contactFormSubheading")}
                  </p>
                  <ContactSellerForm
                    listingId={listing.id}
                    defaultName={
                      user
                        ? [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
                          undefined
                        : undefined
                    }
                    defaultEmail={user?.email || undefined}
                    defaultPhone={user?.phone || undefined}
                    defaultMessage={`${t("detail.contactSellerDefaultMessage")} ${getListingMainTitle(listing)}`.trim()}
                  />
                </div>
              </>
            )}

            {listing.sellerType === "private" && (seller?.email || listing.phone) && (
              <p
                className="text-xs text-muted-foreground italic"
                data-testid="private-seller-note"
              >
                {t("detail.privateSellerContactOnly")}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cebia dialog (placeholder) */}
      <Dialog
        open={cebiaDialogOpen}
        onOpenChange={(open) => {
          setCebiaDialogOpen(open);
          if (!open) clearInteractionLocks();
        }}
      >
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
        imageAltPrefix={
          listing
            ? `${getListingMainTitle(listing)}${listing.year ? ` ${listing.year}` : ""}`
            : undefined
        }
      />
      {listing ? (
        <Suspense fallback={null}>
          <EditListingDialog
            open={listingEditOpen}
            onOpenChange={setListingEditOpen}
            listing={listing}
          />
        </Suspense>
      ) : null}

      {/* Fixed bottom contact bar (mobile + desktop). Hidden when the listing
          is rendered inside an iframe overlay so it does not duplicate the
          parent page UI. */}
      {listing && !isEmbedded ? (
        <StickyContactBar
          variant="minimal"
          phone={listing.phone}
          email={seller?.email ?? null}
          carTitle={getListingMainTitle(listing)}
          onNNAutoChat={handleOpenChat}
          showWhatsApp={!isDealerListing || dealerWhatsappEnabled}
          showTelegram={!isDealerListing || dealerTelegramEnabled}
          onCall={() => {
            void trackListingAnalyticsEvent("contact_click");
            try {
              trackContact("phone", {
                listingId: listing.id,
                listingName: getListingMainTitle(listing),
              });
            } catch {
              /* noop */
            }
          }}
          onMessage={(channel) => {
            if (channel === "whatsapp") {
              void trackListingAnalyticsEvent("whatsapp_click");
              try {
                trackContact("whatsapp", {
                  listingId: listing.id,
                  listingName: getListingMainTitle(listing),
                });
              } catch {
                /* noop */
              }
            } else if (channel === "telegram") {
              void trackListingAnalyticsEvent("telegram_click");
              try {
                trackContact("telegram", {
                  listingId: listing.id,
                  listingName: getListingMainTitle(listing),
                });
              } catch {
                /* noop */
              }
            } else if (channel === "email") {
              void trackListingAnalyticsEvent("contact_click");
              try {
                trackContact("email", {
                  listingId: listing.id,
                  listingName: getListingMainTitle(listing),
                });
              } catch {
                /* noop */
              }
            }
          }}
        />
      ) : null}

      {/* Chat login: load modal chunk only when needed so Turnstile/deps never block listing detail. */}
      {showChatLoginModal ? (
        <Suspense fallback={null}>
          <ChatLoginModal
            open={showChatLoginModal}
            onOpenChange={setShowChatLoginModal}
            initialTab={chatLoginInitialTab}
          />
        </Suspense>
      ) : null}
      <Dialog open={chatAuthPromptOpen} onOpenChange={setChatAuthPromptOpen}>
        <DialogContent data-testid="dialog-chat-auth-required">
          <DialogHeader>
            <DialogTitle>Napsat do chatu NNAuto</DialogTitle>
            <DialogDescription>
              Pro psaní do chatu je potřeba se zaregistrovat nebo přihlásit.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setChatAuthPromptOpen(false);
                setChatLoginInitialTab("login");
                setShowChatLoginModal(true);
              }}
              data-testid="button-chat-auth-login"
            >
              Přihlásit se
            </Button>
            <Button
              onClick={() => {
                setChatAuthPromptOpen(false);
                setChatLoginInitialTab("register");
                setShowChatLoginModal(true);
              }}
              data-testid="button-chat-auth-register"
            >
              Registrovat se
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
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
  onTelegramClick,
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
  onTelegramClick?: () => void;
}) {
  const digits = phoneToDigits(phone);
  if (!digits) return null;

  const safeCar = (carTitle || "").trim() || "váš vůz";

  // Body of the chat message buyers prefill on WhatsApp / Telegram.
  // The "Inzerát z NNAuto.cz" attribution is appended once via the
  // shared helper — never inlined into the body, never duplicated.
  const message = appendListingSourceTag(
    `Dobrý den,\n` +
      `zaujala mě vaše nabídka na vůz ${safeCar}. ` +
      `Je prosím stále k dispozici? Děkuji za odpověď.`,
  );

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
          // Track owner analytics: Telegram click.
          try {
            onTelegramClick?.();
          } catch {
            /* analytics never blocks UX */
          }
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
