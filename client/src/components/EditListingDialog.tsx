// import { useState, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { insertListingSchema, type InsertListing, type Listing } from "@shared/schema";
// import { carBrands } from "@shared/carDatabase";
// import { useTranslation, useLocalizedOptions, getModelsForVehicleType } from "@/lib/translations";
// import { useMutation } from "@tanstack/react-query";
// import { apiRequest, queryClient } from "@/lib/queryClient";
// import { useToast } from "@/hooks/use-toast";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
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
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Button } from "@/components/ui/button";
// import { Trash2, Loader2 } from "lucide-react";
// import { CarPhotoUploader } from "@/components/CarPhotoUploader";
// import { VideoUploader } from "@/components/VideoUploader";

// interface EditListingDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   listing: Listing;
// }

// export default function EditListingDialog({ open, onOpenChange, listing }: EditListingDialogProps) {
//   const t = useTranslation();
//   const localizedOptions = useLocalizedOptions();
//   const { toast } = useToast();
//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//   const updateListingMutation = useMutation({
//     mutationFn: async (data: Partial<InsertListing>) => {
//       const res = await apiRequest("PUT", `/api/listings/${listing.id}`, data);
//       return await res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
//       queryClient.invalidateQueries({ queryKey: ["/api/listings", listing.id] });
//       toast({
//         title: t("listing.updateSuccess") || "Inzerát aktualizován",
//         description: t("listing.updateSuccessDescription") || "Váš inzerát byl úspěšně aktualizován.",
//       });
//       onOpenChange(false);
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("listing.error") || "Chyba",
//         description: error.message || "Nepodařilo se aktualizovat inzerát.",
//       });
//     },
//   });

//   const deleteListingMutation = useMutation({
//     mutationFn: async () => {
//       const res = await apiRequest("DELETE", `/api/listings/${listing.id}`);
//       return await res.json();
//     },
//     onSuccess: () => {
//       // Invalidate all listings queries (including those with filters)
//       queryClient.invalidateQueries({
//         predicate: (query) => query.queryKey[0] === '/api/listings',
//         refetchType: 'all'
//       });
//       toast({
//         title: t("listing.deleteSuccess") || "Inzerát smazán",
//         description: t("listing.deleteSuccessDescription") || "Váš inzerát byl úspěšně smazán.",
//       });
//       onOpenChange(false);
//     },
//     onError: (error: any) => {
//       toast({
//         variant: "destructive",
//         title: t("listing.error") || "Chyba",
//         description: error.message || "Nepodařilo se smazat inzerát.",
//       });
//     },
//   });

//   const vehicleTypes = [
//     { value: "osobni-auta", label: t("hero.cars") },
//     { value: "dodavky", label: t("hero.dodavky") },
//     { value: "nakladni-vozy", label: t("hero.trucks") },
//     { value: "motorky", label: t("hero.motorky") },
//   ];

//   const fuelTypes = [
//     { value: "benzin", label: t("hero.benzin") },
//     { value: "diesel", label: t("hero.diesel") },
//     { value: "hybrid", label: t("hero.hybrid") },
//     { value: "electric", label: t("hero.electric") },
//     { value: "lpg", label: t("hero.lpg") },
//     { value: "cng", label: t("hero.cng") },
//   ];

//   const transmissionTypes = [
//     { value: "manual", label: t("filters.manual") },
//     { value: "automatic", label: t("filters.automatic") },
//     { value: "robot", label: t("filters.robot") },
//     { value: "cvt", label: t("filters.cvt") },
//   ];

//   const bodyTypes = localizedOptions.getBodyTypes();
//   const colors = localizedOptions.getColors();
//   const driveTypes = localizedOptions.getDriveTypes();
//   const regions = localizedOptions.getRegions();

//   const [photos, setPhotos] = useState<string[]>(listing.photos || []);
//   const [video, setVideo] = useState<string | null>(listing.video || null);

//   // Helper to extract first element from array or return string
//   const getFirstValue = (val: string | string[] | null | undefined): string => {
//     if (Array.isArray(val)) return val[0] || "";
//     return val || "";
//   };

//   // Store single values for the form but convert them to arrays on submit
//   const [selectedFuelType, setSelectedFuelType] = useState<string>(getFirstValue(listing.fuelType));
//   const [selectedTransmission, setSelectedTransmission] = useState<string>(getFirstValue(listing.transmission));
//   const [selectedDriveType, setSelectedDriveType] = useState<string>(getFirstValue(listing.driveType));

//   const form = useForm<InsertListing>({
//     resolver: zodResolver(insertListingSchema),
//     defaultValues: {
//       userId: listing.userId,
//       title: listing.title,
//       description: listing.description || undefined,
//       price: listing.price,
//       brand: listing.brand,
//       model: listing.model,
//       year: listing.year,
//       mileage: listing.mileage,
//       fuelType: listing.fuelType || undefined,
//       transmission: listing.transmission || undefined,
//       bodyType: listing.bodyType || undefined,
//       color: listing.color || undefined,
//       trim: listing.trim || undefined,
//       driveType: listing.driveType || undefined,
//       engineVolume: listing.engineVolume || undefined,
//       power: listing.power || undefined,
//       doors: listing.doors || undefined,
//       seats: listing.seats || undefined,
//       region: listing.region || undefined,
//       vehicleType: listing.vehicleType || undefined,
//       category: listing.category || undefined,
//       isTopListing: listing.isTopListing || false,
//       vatDeductible: listing.vatDeductible || false,
//       isImported: listing.isImported || false,
//       importCountry: listing.importCountry || undefined,
//       photos: listing.photos || undefined,
//     },
//   });

//   useEffect(() => {
//     if (open) {
//       setPhotos(listing.photos || []);
//       setVideo(listing.video || null);
//       setSelectedFuelType(getFirstValue(listing.fuelType));
//       setSelectedTransmission(getFirstValue(listing.transmission));
//       setSelectedDriveType(getFirstValue(listing.driveType));
//       form.reset({
//         userId: listing.userId,
//         title: listing.title,
//         description: listing.description || undefined,
//         price: listing.price,
//         brand: listing.brand,
//         model: listing.model,
//         year: listing.year,
//         mileage: listing.mileage,
//         fuelType: listing.fuelType || undefined,
//         transmission: listing.transmission || undefined,
//         bodyType: listing.bodyType || undefined,
//         color: listing.color || undefined,
//         trim: listing.trim || undefined,
//         driveType: listing.driveType || undefined,
//         engineVolume: listing.engineVolume || undefined,
//         power: listing.power || undefined,
//         doors: listing.doors || undefined,
//         seats: listing.seats || undefined,
//         region: listing.region || undefined,
//         vehicleType: listing.vehicleType || undefined,
//         category: listing.category || undefined,
//         isTopListing: listing.isTopListing || false,
//         vatDeductible: listing.vatDeductible || false,
//         isImported: listing.isImported || false,
//         importCountry: listing.importCountry || undefined,
//         photos: listing.photos || undefined,
//       });
//     }
//   }, [open, listing, form]);

//   const selectedBrand = form.watch("brand");
//   const selectedVehicleType = form.watch("vehicleType");
//   const availableModels = selectedBrand ? getModelsForVehicleType(selectedBrand, selectedVehicleType ?? undefined) : [];

//   const onSubmit = async (data: InsertListing) => {
//     updateListingMutation.mutate({
//       ...data,
//       photos: photos.length > 0 ? photos : undefined,
//       video: video || undefined,
//     });
//   };

//   const handleDelete = () => {
//     setShowDeleteConfirm(true);
//   };

//   const confirmDelete = () => {
//     deleteListingMutation.mutate();
//     setShowDeleteConfirm(false);
//   };

//   return (
//     <>
//       <Dialog open={open} onOpenChange={onOpenChange}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-listing">
//           <DialogHeader>
//             <DialogTitle data-testid="text-dialog-title">{t("listing.editTitle")}</DialogTitle>
//             <DialogDescription>
//               {t("listing.editDescription")}
//             </DialogDescription>
//           </DialogHeader>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">{t("listing.basicInfo")}</h3>

//                 <FormField
//                   control={form.control}
//                   name="title"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>{t("listing.title")}</FormLabel>
//                       <FormControl>
//                         <Input
//                           placeholder={t("listing.titlePlaceholder")}
//                           data-testid="input-edit-title"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="description"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>{t("listing.description")}</FormLabel>
//                       <FormControl>
//                         <Textarea
//                           placeholder={t("listing.descriptionPlaceholder")}
//                           data-testid="input-edit-description"
//                           {...field}
//                           value={field.value || ""}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="price"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>{t("listing.price")}</FormLabel>
//                       <FormControl>
//                         <Input
//                           type="number"
//                           placeholder={t("listing.pricePlaceholder")}
//                           data-testid="input-edit-price"
//                           {...field}
//                         />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">{t("tips.photosTitle")}</h3>
//                 <CarPhotoUploader
//                   photos={photos}
//                   onPhotosChange={setPhotos}
//                   maxPhotos={30}
//                 />
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">{t("video.title")}</h3>
//                 <VideoUploader
//                   video={video}
//                   onVideoChange={setVideo}
//                   maxDurationSeconds={300}
//                 />
//               </div>

//               <div className="space-y-4">
//                 <h3 className="text-lg font-medium">{t("listing.vehicleDetails")}</h3>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <FormField
//                     control={form.control}
//                     name="brand"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("hero.brand")}</FormLabel>
//                         <Select
//                           onValueChange={(value) => {
//                             field.onChange(value);
//                             form.setValue("model", "");
//                           }}
//                           value={field.value}
//                         >
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-brand">
//                               <SelectValue placeholder={t("hero.allBrands")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {carBrands.map((brand) => (
//                               <SelectItem key={brand.value} value={brand.value}>
//                                 {brand.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="model"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("hero.model")}</FormLabel>
//                         <Select
//                           onValueChange={field.onChange}
//                           value={field.value}
//                           disabled={!selectedBrand}
//                         >
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-model">
//                               <SelectValue placeholder={selectedBrand ? t("hero.allModels") : t("hero.selectBrand")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {availableModels.map((model) => (
//                               <SelectItem key={model} value={model}>
//                                 {model}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="vehicleType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.vehicleType")}</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value || ""}>
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-vehicle-type">
//                               <SelectValue placeholder={t("listing.selectVehicleType")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {vehicleTypes.map((type) => (
//                               <SelectItem key={type.value} value={type.value}>
//                                 {type.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="year"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.year")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             data-testid="input-edit-year"
//                             {...field}
//                             onChange={(e) => field.onChange(parseInt(e.target.value))}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="mileage"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.mileage")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             data-testid="input-edit-mileage"
//                             {...field}
//                             onChange={(e) => field.onChange(parseInt(e.target.value))}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="fuelType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.fuelType")}</FormLabel>
//                         <Select
//                           onValueChange={(val) => {
//                             setSelectedFuelType(val);
//                             field.onChange([val]);
//                           }}
//                           value={selectedFuelType}
//                         >
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-fuel-type">
//                               <SelectValue placeholder={t("hero.allFuels")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {fuelTypes.map((fuel) => (
//                               <SelectItem key={fuel.value} value={fuel.value}>
//                                 {fuel.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="transmission"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.transmission")}</FormLabel>
//                         <Select
//                           onValueChange={(val) => {
//                             setSelectedTransmission(val);
//                             field.onChange([val]);
//                           }}
//                           value={selectedTransmission}
//                         >
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-transmission">
//                               <SelectValue placeholder={t("filters.allTransmissions")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {transmissionTypes.map((trans) => (
//                               <SelectItem key={trans.value} value={trans.value}>
//                                 {trans.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="bodyType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("hero.bodyType")}</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value || ""}>
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-body-type">
//                               <SelectValue placeholder={t("hero.allBodyTypes")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {bodyTypes.map((type) => (
//                               <SelectItem key={type.value} value={type.value}>
//                                 {type.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="color"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("filters.color")}</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value || ""}>
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-color">
//                               <SelectValue placeholder={t("filters.allColors")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {colors.map((color) => (
//                               <SelectItem key={color.value} value={color.value}>
//                                 {color.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="driveType"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("filters.driveType")}</FormLabel>
//                         <Select
//                           onValueChange={(val) => {
//                             setSelectedDriveType(val);
//                             field.onChange([val]);
//                           }}
//                           value={selectedDriveType}
//                         >
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-drive-type">
//                               <SelectValue placeholder={t("filters.allDriveTypes")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {driveTypes.map((type) => (
//                               <SelectItem key={type.value} value={type.value}>
//                                 {type.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="engineVolume"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.engineVolume")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             step="0.1"
//                             data-testid="input-edit-engine-volume"
//                             {...field}
//                             value={field.value || ""}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="power"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.power")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             data-testid="input-edit-power"
//                             value={field.value ?? 0}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="doors"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.doors")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             data-testid="input-edit-doors"
//                             value={field.value ?? 0}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="seats"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.seats")}</FormLabel>
//                         <FormControl>
//                           <Input
//                             type="number"
//                             data-testid="input-edit-seats"
//                             value={field.value ?? 0}
//                             onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="region"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>{t("listing.region")}</FormLabel>
//                         <Select onValueChange={field.onChange} value={field.value || ""}>
//                           <FormControl>
//                             <SelectTrigger data-testid="select-edit-region">
//                               <SelectValue placeholder={t("filters.allRegions")} />
//                             </SelectTrigger>
//                           </FormControl>
//                           <SelectContent>
//                             {regions.map((region) => (
//                               <SelectItem key={region.value} value={region.value}>
//                                 {region.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>

//               <DialogFooter className="flex flex-col sm:flex-row gap-2">
//                 <Button
//                   type="button"
//                   variant="destructive"
//                   onClick={handleDelete}
//                   disabled={deleteListingMutation.isPending}
//                   data-testid="button-delete-listing"
//                   className="sm:mr-auto"
//                 >
//                   {deleteListingMutation.isPending ? (
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   ) : (
//                     <Trash2 className="mr-2 h-4 w-4" />
//                   )}
//                   {t("listing.deleteButton")}
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => onOpenChange(false)}
//                   data-testid="button-cancel-edit"
//                 >
//                   {t("listing.cancel")}
//                 </Button>
//                 <Button
//                   type="submit"
//                   disabled={updateListingMutation.isPending}
//                   data-testid="button-save-listing"
//                 >
//                   {updateListingMutation.isPending ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       {t("listing.updating")}
//                     </>
//                   ) : (
//                     t("listing.saveChanges")
//                   )}
//                 </Button>
//               </DialogFooter>
//             </form>
//           </Form>
//         </DialogContent>
//       </Dialog>

//       <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
//         <AlertDialogContent data-testid="dialog-delete-confirm">
//           <AlertDialogHeader>
//             <AlertDialogTitle>{t("listing.deleteConfirmTitle")}</AlertDialogTitle>
//             <AlertDialogDescription>
//               {t("listing.deleteConfirmDescription")}
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel data-testid="button-cancel-delete">
//               {t("listing.deleteCancelButton")}
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={confirmDelete}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               data-testid="button-confirm-delete"
//             >
//               {t("listing.deleteConfirmButton")}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </>
//   );
// }
"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertListingSchema,
  type InsertListing,
  type Listing,
} from "@shared/schema";
import { carBrands } from "@shared/carDatabase";
import {
  useTranslation,
  useLocalizedOptions,
  getModelsForVehicleType,
} from "@/lib/translations";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";

import { CarPhotoUploader } from "@/components/CarPhotoUploader";
import { VideoUploader } from "@/components/VideoUploader";

interface EditListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: Listing;
}

// ---------- helpers (мінімально, лише щоб не ламало submit) ----------
const asString = (v: unknown) =>
  typeof v === "string" ? v : v == null ? "" : String(v);

const firstFromMaybeArray = (v: unknown) => {
  if (Array.isArray(v)) return asString(v[0]);
  return asString(v);
};

const toArrayIfString = (v: unknown) => {
  if (Array.isArray(v)) return v.filter(Boolean).map(asString);
  const s = asString(v);
  return s ? [s] : [];
};

// ⚠️ якщо в схемі required ці поля — дамо дефолти, щоб Zod не блокував submit
const DEFAULT_SELLER_TYPE = "private";
const DEFAULT_CONDITION = "used";

function buildDefaults(l: any): Partial<InsertListing> {
  return {
    userId: asString(l?.userId),
    title: asString(l?.title),
    description: l?.description || undefined,
    price: l?.price as any,

    brand: asString(l?.brand),
    model: asString(l?.model),
    year: l?.year as any,
    mileage: l?.mileage as any,

    fuelType: toArrayIfString(l?.fuelType) as any,
    transmission: toArrayIfString(l?.transmission) as any,
    driveType: toArrayIfString(l?.driveType) as any,

    bodyType: l?.bodyType || undefined,
    color: l?.color || undefined,
    trim: l?.trim || undefined,

    engineVolume: l?.engineVolume || undefined,
    power: l?.power ?? undefined,
    doors: l?.doors ?? undefined,
    seats: l?.seats ?? undefined,

    region: l?.region || undefined,
    vehicleType: l?.vehicleType || undefined,
    category: l?.category || undefined,

    isTopListing: Boolean(l?.isTopListing),
    vatDeductible: Boolean(l?.vatDeductible),
    isImported: Boolean(l?.isImported),
    importCountry: l?.importCountry || undefined,

    photos: Array.isArray(l?.photos) ? l.photos : undefined,

    // ✅ якщо schema цього вимагає — тримаємо в формі, але UI не додаємо
    phone: asString(l?.phone) as any,
    sellerType: (asString(l?.sellerType) || DEFAULT_SELLER_TYPE) as any,
    condition: (asString(l?.condition) || DEFAULT_CONDITION) as any,
  } as any;
}

export default function EditListingDialog({
  open,
  onOpenChange,
  listing,
}: EditListingDialogProps) {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();
  const { toast } = useToast();

  // ✅ підтримка id або _id
  const listingId = asString((listing as any)?.id || (listing as any)?._id);

  // ✅ тримаємо актуальний listing (щоб не було старого snapshot)
  const [currentListing, setCurrentListing] = useState<Listing>(listing);

  useEffect(() => {
    setCurrentListing(listing);
  }, [listing]);

  // ✅ підтягуємо “свіжий” listing при відкритті
  const { data: freshListing, isFetching: isFetchingListing } = useQuery({
    queryKey: ["/api/listings", listingId],
    enabled: open && Boolean(listingId),
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/listings/${listingId}`);
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Failed to load listing");
      }
      return (await res.json()) as Listing;
    },
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (open && freshListing) setCurrentListing(freshListing);
  }, [open, freshListing]);

  const vehicleTypes = useMemo(
    () => [
      { value: "osobni-auta", label: t("hero.cars") },
      { value: "dodavky", label: t("hero.dodavky") },
      { value: "nakladni-vozy", label: t("hero.trucks") },
      { value: "motorky", label: t("hero.motorky") },
    ],
    [t],
  );

  const fuelTypes = useMemo(
    () => [
      { value: "benzin", label: t("hero.benzin") },
      { value: "diesel", label: t("hero.diesel") },
      { value: "hybrid", label: t("hero.hybrid") },
      { value: "electric", label: t("hero.electric") },
      { value: "lpg", label: t("hero.lpg") },
      { value: "cng", label: t("hero.cng") },
    ],
    [t],
  );

  const transmissionTypes = useMemo(
    () => [
      { value: "manual", label: t("filters.manual") },
      { value: "automatic", label: t("filters.automatic") },
      { value: "robot", label: t("filters.robot") },
      { value: "cvt", label: t("filters.cvt") },
    ],
    [t],
  );

  const bodyTypes = localizedOptions.getBodyTypes();
  const colors = localizedOptions.getColors();
  const driveTypes = localizedOptions.getDriveTypes();
  const regions = localizedOptions.getRegions();

  const [photos, setPhotos] = useState<string[]>(
    Array.isArray((currentListing as any)?.photos)
      ? ((currentListing as any).photos as any)
      : [],
  );
  const [video, setVideo] = useState<string | null>(
    typeof (currentListing as any)?.video === "string"
      ? ((currentListing as any).video as any)
      : null,
  );

  // single-select UI states
  const [selectedFuelType, setSelectedFuelType] = useState<string>(
    firstFromMaybeArray((currentListing as any)?.fuelType),
  );
  const [selectedTransmission, setSelectedTransmission] = useState<string>(
    firstFromMaybeArray((currentListing as any)?.transmission),
  );
  const [selectedDriveType, setSelectedDriveType] = useState<string>(
    firstFromMaybeArray((currentListing as any)?.driveType),
  );

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: buildDefaults(currentListing) as any,
    mode: "onSubmit",
  });

  // ✅ синхронізація при open / currentListing change
  useEffect(() => {
    if (!open) return;

    const l: any = currentListing;

    setPhotos(Array.isArray(l?.photos) ? l.photos : []);
    setVideo(typeof l?.video === "string" ? l.video : null);

    setSelectedFuelType(firstFromMaybeArray(l?.fuelType));
    setSelectedTransmission(firstFromMaybeArray(l?.transmission));
    setSelectedDriveType(firstFromMaybeArray(l?.driveType));

    form.reset(buildDefaults(l) as any);
  }, [open, currentListing, form]);

  const selectedBrand = form.watch("brand");
  const selectedVehicleType = form.watch("vehicleType");
  const brandValue = asString(selectedBrand);
  const vehicleTypeValue = selectedVehicleType
    ? asString(selectedVehicleType)
    : undefined;

  const availableModels = useMemo(() => {
    if (!brandValue) return [];
    return getModelsForVehicleType(brandValue, vehicleTypeValue);
  }, [brandValue, vehicleTypeValue]);

  const updateListingMutation = useMutation({
    mutationFn: async (data: Partial<InsertListing>) => {
      const res = await apiRequest("PUT", `/api/listings/${listingId}`, data);

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((json as any)?.message || "Не вдалося зберегти");
      }
      return json as any;
    },
    onSuccess: (updated: any) => {
      // ✅ оновлюємо кеш конкретного listing (якщо бек повертає об’єкт)
      const updId = asString(updated?.id || updated?._id) || listingId;
      if (updId) queryClient.setQueryData(["/api/listings", updId], updated);

      // ✅ оновлюємо/інвалідуємо ВСІ варіанти списків (/api/listings з фільтрами також)
      queryClient.setQueriesData(
        { predicate: (q) => q.queryKey?.[0] === "/api/listings" },
        (old: any) => {
          const u = updated;
          const id = asString(u?.id || u?._id);
          if (!id) return old;

          if (Array.isArray(old)) {
            return old.map((x) =>
              asString((x as any)?.id || (x as any)?._id) === id ? u : x,
            );
          }
          if (old && Array.isArray(old.items)) {
            return {
              ...old,
              items: old.items.map((x: any) =>
                asString(x?.id || x?._id) === id ? u : x,
              ),
            };
          }
          return old;
        },
      );

      toast({
        title: t("listing.updateSuccess") || "Inzerát aktualizován",
        description:
          t("listing.updateSuccessDescription") ||
          "Váš inzerát byl úspěšně aktualizován.",
      });

      if (updated) setCurrentListing(updated as Listing);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error?.message || "Nepodařilo se aktualizovat inzerát.",
      });
    },
  });

  const deleteListingMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/listings/${listingId}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error((json as any)?.message || "Не вдалося видалити");
      return json;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey?.[0] === "/api/listings",
        refetchType: "all",
      });
      toast({
        title: t("listing.deleteSuccess") || "Inzerát smazán",
        description:
          t("listing.deleteSuccessDescription") ||
          "Váš inzerát byl úspěšně smazán.",
      });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error?.message || "Nepodařilo se smazat inzerát.",
      });
    },
  });

  const onSubmit = (data: InsertListing) => {
    // ✅ гарантуємо масиви навіть якщо з бекенда/форми прилетіло як string
    const fuel = selectedFuelType
      ? [selectedFuelType]
      : toArrayIfString((data as any).fuelType);
    const tr = selectedTransmission
      ? [selectedTransmission]
      : toArrayIfString((data as any).transmission);
    const dr = selectedDriveType
      ? [selectedDriveType]
      : toArrayIfString((data as any).driveType);

    updateListingMutation.mutate({
      ...data,

      photos: photos.length > 0 ? photos : undefined,
      video: video || undefined,

      fuelType: fuel.length ? (fuel as any) : undefined,
      transmission: tr.length ? (tr as any) : undefined,
      driveType: dr.length ? (dr as any) : undefined,

      // ✅ якщо schema це вимагає — залишаємо значення з defaults
      phone: asString(
        (data as any).phone || (currentListing as any)?.phone,
      ) as any,
      sellerType: (asString((data as any).sellerType) ||
        asString((currentListing as any)?.sellerType) ||
        DEFAULT_SELLER_TYPE) as any,
      condition: (asString((data as any).condition) ||
        asString((currentListing as any)?.condition) ||
        DEFAULT_CONDITION) as any,
    } as any);
  };

  const onInvalid = (errors: any) => {
    console.log("❌ INVALID", errors);
    toast({
      variant: "destructive",
      title: "Форма не збережена",
      description: "Є помилки в полях (дивись під полями або console).",
    });
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => setShowDeleteConfirm(true);
  const confirmDelete = () => {
    deleteListingMutation.mutate();
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-3xl max-h-[90vh] overflow-y-auto"
          data-testid="dialog-edit-listing"
        >
          <DialogHeader>
            <DialogTitle
              data-testid="text-dialog-title"
              className="flex items-center gap-2"
            >
              {t("listing.editTitle")}
              {isFetchingListing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
            </DialogTitle>
            <DialogDescription>
              {t("listing.editDescription")}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              className="space-y-6"
            >
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("listing.basicInfo")}
                </h3>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listing.title")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("listing.titlePlaceholder")}
                          data-testid="input-edit-title"
                          {...field}
                          value={asString(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listing.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("listing.descriptionPlaceholder")}
                          data-testid="input-edit-description"
                          {...field}
                          value={asString(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listing.price")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("listing.pricePlaceholder")}
                          data-testid="input-edit-price"
                          {...field}
                          value={asString(field.value)}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("tips.photosTitle")}</h3>
                <CarPhotoUploader
                  photos={photos}
                  onPhotosChange={setPhotos}
                  maxPhotos={30}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">{t("video.title")}</h3>
                <VideoUploader
                  video={video}
                  onVideoChange={setVideo}
                  maxDurationSeconds={300}
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("listing.vehicleDetails")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hero.brand")}</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("model", "" as any, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }}
                          value={asString(field.value)}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-brand">
                              <SelectValue placeholder={t("hero.allBrands")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {carBrands.map((brand) => (
                              <SelectItem key={brand.value} value={brand.value}>
                                {brand.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hero.model")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={asString(field.value)}
                          disabled={!brandValue}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-model">
                              <SelectValue
                                placeholder={
                                  brandValue
                                    ? t("hero.allModels")
                                    : t("hero.selectBrand")
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableModels.map((model) => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vehicleType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.vehicleType")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={asString(field.value) || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-vehicle-type">
                              <SelectValue
                                placeholder={t("listing.selectVehicleType")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.year")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="input-edit-year"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="mileage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.mileage")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="input-edit-mileage"
                            value={field.value ?? ""}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fuelType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.fuelType")}</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            setSelectedFuelType(val);
                            field.onChange(val ? [val] : []);
                          }}
                          value={selectedFuelType}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-fuel-type">
                              <SelectValue placeholder={t("hero.allFuels")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fuelTypes.map((fuel) => (
                              <SelectItem key={fuel.value} value={fuel.value}>
                                {fuel.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="transmission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.transmission")}</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            setSelectedTransmission(val);
                            field.onChange(val ? [val] : []);
                          }}
                          value={selectedTransmission}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-transmission">
                              <SelectValue
                                placeholder={t("filters.allTransmissions")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {transmissionTypes.map((trans) => (
                              <SelectItem key={trans.value} value={trans.value}>
                                {trans.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("hero.bodyType")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={asString(field.value) || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-body-type">
                              <SelectValue
                                placeholder={t("hero.allBodyTypes")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bodyTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("filters.color")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={asString(field.value) || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-color">
                              <SelectValue
                                placeholder={t("filters.allColors")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colors.map((color) => (
                              <SelectItem key={color.value} value={color.value}>
                                {color.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="driveType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("filters.driveType")}</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            setSelectedDriveType(val);
                            field.onChange(val ? [val] : []);
                          }}
                          value={selectedDriveType}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-drive-type">
                              <SelectValue
                                placeholder={t("filters.allDriveTypes")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {driveTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="engineVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.engineVolume")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            data-testid="input-edit-engine-volume"
                            {...field}
                            value={asString(field.value)}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="power"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.power")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="input-edit-power"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="doors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.doors")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="input-edit-doors"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seats"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.seats")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            data-testid="input-edit-seats"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? parseInt(e.target.value, 10)
                                  : 0,
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("listing.region")}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={asString(field.value) || ""}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-edit-region">
                              <SelectValue
                                placeholder={t("filters.allRegions")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map((region) => (
                              <SelectItem
                                key={region.value}
                                value={region.value}
                              >
                                {region.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteListingMutation.isPending}
                  data-testid="button-delete-listing"
                  className="sm:mr-auto"
                >
                  {deleteListingMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  {t("listing.deleteButton")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  data-testid="button-cancel-edit"
                >
                  {t("listing.cancel")}
                </Button>

                <Button
                  type="submit"
                  disabled={
                    updateListingMutation.isPending || isFetchingListing
                  }
                  data-testid="button-save-listing"
                >
                  {updateListingMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("listing.updating")}
                    </>
                  ) : (
                    t("listing.saveChanges")
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("listing.deleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("listing.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              {t("listing.deleteCancelButton")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {t("listing.deleteConfirmButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
