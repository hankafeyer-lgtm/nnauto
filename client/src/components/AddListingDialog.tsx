import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertListingSchema, type InsertListing } from "@shared/schema";
import { carBrands, carModels } from "@shared/carDatabase";
import { useTranslation, useLocalizedOptions, getModelsForVehicleType } from "@/lib/translations";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CarPhotoUploader } from "@/components/CarPhotoUploader";
import { VideoUploader } from "@/components/VideoUploader";

interface AddListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export default function AddListingDialog({ open, onOpenChange, userId }: AddListingDialogProps) {
  const t = useTranslation();
  const localizedOptions = useLocalizedOptions();
  const { toast } = useToast();

  const createListingMutation = useMutation({
    mutationFn: async (data: InsertListing) => {
      const res = await apiRequest("POST", "/api/listings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: t("listing.success") || "Inzerát úspěšně vytvořen",
        description: t("listing.successDescription") || "Váš inzerát byl úspěšně publikován.",
      });
      setPhotos([]);
      setVideo(null);
      form.reset();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t("listing.error") || "Chyba",
        description: error.message || "Nepodařilo se vytvořit inzerát.",
      });
    },
  });

  const vehicleTypes = [
    { value: "osobni-auta", label: t("hero.cars") },
    { value: "dodavky", label: t("hero.dodavky") },
    { value: "nakladni-vozy", label: t("hero.trucks") },
    { value: "motorky", label: t("hero.motorky") },
  ];

  const fuelTypes = [
    { value: "benzin", label: t("hero.benzin") },
    { value: "diesel", label: t("hero.diesel") },
    { value: "hybrid", label: t("hero.hybrid") },
    { value: "electric", label: t("hero.electric") },
    { value: "lpg", label: t("hero.lpg") },
    { value: "cng", label: t("hero.cng") },
  ];

  const transmissionTypes = [
    { value: "manual", label: t("filters.manual") },
    { value: "automatic", label: t("filters.automatic") },
    { value: "robot", label: t("filters.robot") },
    { value: "cvt", label: t("filters.cvt") },
  ];

  const bodyTypes = localizedOptions.getBodyTypes();
  const colors = localizedOptions.getColors();
  const driveTypes = localizedOptions.getDriveTypes();
  const regions = localizedOptions.getRegions();

  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);

  const form = useForm<InsertListing>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      userId: userId,
      title: "",
      description: undefined,
      price: "0",
      brand: "",
      model: "",
      year: undefined,
      mileage: 0,
      fuelType: "",
      transmission: undefined,
      bodyType: undefined,
      color: undefined,
      trim: undefined,
      driveType: undefined,
      engineVolume: undefined,
      power: undefined,
      doors: undefined,
      seats: undefined,
      region: undefined,
      vehicleType: undefined,
      category: undefined,
      isTopListing: false,
      vatDeductible: true,
      isImported: false,
      importCountry: undefined,
      photos: undefined,
    },
  });

  const selectedBrand = form.watch("brand");
  const selectedVehicleType = form.watch("vehicleType");
  const isTopListing = form.watch("isTopListing");
  const availableModels = selectedBrand ? getModelsForVehicleType(selectedBrand, selectedVehicleType ?? undefined) : [];

  const onSubmit = async (data: InsertListing) => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: t("auth.loginRequired"),
        description: t("auth.loginRequiredDescription"),
      });
      return;
    }
    createListingMutation.mutate({ 
      ...data, 
      photos: photos.length > 0 ? photos : undefined,
      video: video || undefined,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPhotos([]);
      setVideo(null);
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-add-listing">
        <DialogHeader>
          <DialogTitle data-testid="text-dialog-title">{t("listing.addTitle")}</DialogTitle>
          <DialogDescription>
            {t("listing.basicInfo")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("listing.basicInfo")}</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("listing.title")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("listing.titlePlaceholder")}
                        data-testid="input-title"
                        {...field}
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
                        data-testid="input-description"
                        {...field}
                        value={field.value || ""}
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
                        data-testid="input-price"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fotografie</h3>
              <CarPhotoUploader 
                photos={photos}
                onPhotosChange={setPhotos}
                maxPhotos={30}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("video.title") || "Video"}</h3>
              <VideoUploader 
                video={video}
                onVideoChange={setVideo}
                maxDurationSeconds={300}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("listing.vehicleDetails")}</h3>
              
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
                          form.setValue("model", "");
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-brand">
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
                        value={field.value}
                        disabled={!selectedBrand}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-model">
                            <SelectValue placeholder={selectedBrand ? t("hero.allModels") : t("hero.selectBrand")} />
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-vehicle-type">
                            <SelectValue placeholder={t("listing.selectVehicleType")} />
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
                          data-testid="input-year"
                          placeholder={t("listing.year")}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : parseInt(value, 10));
                          }}
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
                          data-testid="input-mileage"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-fuel-type">
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-transmission">
                            <SelectValue placeholder={t("filters.transmission")} />
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
                      <FormLabel>{t("listing.bodyType")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-body-type">
                            <SelectValue placeholder={t("filters.allTypes")} />
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
                      <FormLabel>{t("listing.color")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-color">
                            <SelectValue placeholder={t("filters.allColors")} />
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
                  name="trim"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listing.trim")}</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-trim"
                          placeholder="e.g. M Sport, Ambition, Elegance"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driveType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("listing.driveType")}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-drive-type">
                            <SelectValue placeholder={t("filters.driveType")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {driveTypes.map((drive) => (
                            <SelectItem key={drive.value} value={drive.value}>
                              {drive.label}
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
                          data-testid="input-engine-volume"
                          {...field}
                          value={field.value || ""}
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
                          data-testid="input-power"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
                          data-testid="input-doors"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
                          data-testid="input-seats"
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : 0)}
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
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-region">
                            <SelectValue placeholder={t("filters.allRegions")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
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

            <FormField
              control={form.control}
              name="isTopListing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-top-listing"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {t("listing.topListing")}
                    </FormLabel>
                    <FormDescription>
                      {t("listing.topListingDesc")}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                {t("listing.cancel")}
              </Button>
              <Button type="submit" disabled={createListingMutation.isPending} data-testid="button-submit">
                {createListingMutation.isPending
                  ? t("listing.submitting") || "Odesílání..."
                  : isTopListing
                  ? t("listing.submitWithPayment")
                  : t("listing.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
