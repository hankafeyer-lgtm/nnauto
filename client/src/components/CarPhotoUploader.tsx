import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2, Camera, ImagePlus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImageViaPresignOrLegacy } from "@/lib/uploadImagePresignOrLegacy";
import { useTranslation } from "@/lib/translations";

interface PhotoItem {
  id: string;
  url: string;
  isUploading: boolean;
  isLocal: boolean;
  localPreview?: string;
}

interface CarPhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  onUploadingChange?: (isUploading: boolean) => void;
}

export function CarPhotoUploader({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 30,
  onUploadingChange,
}: CarPhotoUploaderProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoItems, setPhotoItems] = useState<PhotoItem[]>(() => {
    return photos.map((url, index) => ({
      id: `existing-${index}-${url}`,
      url,
      isUploading: false,
      isLocal: false,
    }));
  });
  const isMountedRef = useRef(true);
  const [draggedPhotoId, setDraggedPhotoId] = useState<string | null>(null);

  const syncWithParent = useCallback((items: PhotoItem[]) => {
    const uploadedPaths = items
      .filter(item => !item.isUploading && item.url)
      .map(item => item.url);
    onPhotosChange(uploadedPaths);
  }, [onPhotosChange]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setPhotoItems(prev => {
      const uploadingItems = prev.filter(item => item.isUploading);
      
      if (uploadingItems.length === 0) {
        return photos.map((url, index) => ({
          id: `existing-${index}-${url}`,
          url,
          isUploading: false,
          isLocal: false,
        }));
      }
      
      const existingItems = photos.map((url, index) => ({
        id: `existing-${index}-${url}`,
        url,
        isUploading: false,
        isLocal: false,
      }));
      
      const newExisting = existingItems.filter(
        ex => !uploadingItems.some(up => up.url === ex.url)
      );
      return [...newExisting, ...uploadingItems];
    });
  }, [photos]);

  useEffect(() => {
    onUploadingChange?.(photoItems.some((item) => item.isUploading));
  }, [photoItems, onUploadingChange]);

  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    await uploadFiles(Array.from(files));
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (draggedPhotoId) {
      setDraggedPhotoId(null);
      return;
    }
    const dropped = Array.from(e.dataTransfer?.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (dropped.length > 0) {
      await uploadFiles(dropped);
    }
  };

  const uploadFiles = async (incoming: File[]) => {
    const remainingSlots = maxPhotos - photoItems.length;
    const filesToUpload = incoming.slice(0, remainingSlots);

    if (filesToUpload.length === 0) {
      toast({
        variant: "destructive",
        title: "Maximum dosaženo",
        description: `Můžete nahrát maximálně ${maxPhotos} fotografií`,
      });
      return;
    }

    const newItems: PhotoItem[] = filesToUpload.map((file, index) => ({
      id: `local-${Date.now()}-${index}`,
      url: "",
      isUploading: true,
      isLocal: true,
      localPreview: URL.createObjectURL(file),
    }));

    setPhotoItems(prev => [...prev, ...newItems]);

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const itemId = newItems[i].id;

      try {
        const maxBytes = 20 * 1024 * 1024;
        if (file.size > maxBytes) {
          throw new Error(`Soubor ${file.name} je příliš velký (max 20MB)`);
        }

        if (file.type && !file.type.startsWith("image/")) {
          throw new Error(`Soubor ${file.name} není obrázek`);
        }

        const objectPath = await uploadImageViaPresignOrLegacy(file);

        if (!isMountedRef.current) return;
        setPhotoItems(prev => {
          const updated = prev.map(item => {
            if (item.id === itemId) {
              if (item.localPreview) {
                URL.revokeObjectURL(item.localPreview);
              }
              return {
                ...item,
                url: objectPath,
                isUploading: false,
                isLocal: false,
                localPreview: undefined,
              };
            }
            return item;
          });
          
          setTimeout(() => syncWithParent(updated), 0);
          
          return updated;
        });

      } catch (error: any) {
        if (!isMountedRef.current) return;
        setPhotoItems(prev => {
          const item = prev.find(p => p.id === itemId);
          if (item?.localPreview) {
            URL.revokeObjectURL(item.localPreview);
          }
          return prev.filter(p => p.id !== itemId);
        });
        
        toast({
          variant: "destructive",
          title: "Chyba nahrávání",
          description: error instanceof Error ? error.message : "Nepodařilo se nahrát fotografii",
        });
      }
    }
  };

  const handleRemovePhoto = (itemId: string) => {
    setPhotoItems(prev => {
      const item = prev.find(p => p.id === itemId);
      if (item?.localPreview) {
        URL.revokeObjectURL(item.localPreview);
      }
      const updated = prev.filter(p => p.id !== itemId);
      
      setTimeout(() => syncWithParent(updated), 0);
      
      return updated;
    });
  };

  const reorderPhotos = (fromIndex: number, toIndex: number) => {
    setPhotoItems((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return prev;
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      setTimeout(() => syncWithParent(updated), 0);
      return updated;
    });
  };

  const makeMainPhoto = (itemId: string) => {
    const currentIndex = photoItems.findIndex((item) => item.id === itemId);
    if (currentIndex > 0) reorderPhotos(currentIndex, 0);
  };

  const uploadingCount = photoItems.filter(p => p.isUploading).length;
  const canAddMore = photoItems.length < maxPhotos;

  const hasPhotos = photoItems.length > 0;

  return (
    <div
      className="space-y-4"
      onDragOver={(e) => {
        e.preventDefault();
        if (canAddMore && !isDragging) setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (e.currentTarget === e.target) setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      {!hasPhotos ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`group relative w-full min-h-[192px] sm:min-h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 p-5 sm:p-6 text-center transition-all touch-manipulation ${
            isDragging
              ? "border-[#B8860B] bg-[#B8860B]/10 scale-[1.005]"
              : "border-[#B8860B]/40 bg-gradient-to-br from-background via-[#B8860B]/5 to-[#D4AF37]/10 hover:border-[#B8860B] hover:from-[#B8860B]/10 hover:to-[#D4AF37]/15"
          }`}
          data-testid="button-add-photos"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-[#B8860B]/30 rounded-full blur-2xl scale-150 transition-all group-hover:blur-3xl" />
            <div className="relative p-4 sm:p-5 bg-gradient-to-br from-[#B8860B] to-[#D4AF37] rounded-full shadow-lg transition-all group-hover:scale-110">
              <Camera className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="block text-lg sm:text-2xl font-bold text-foreground group-hover:text-[#B8860B] transition-colors">
              Přetáhněte fotografie sem
            </span>
            <span className="block text-sm sm:text-base text-muted-foreground">
              nebo <span className="font-semibold text-[#B8860B] underline underline-offset-2">vyberte fotografie</span> ze zařízení
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
            {["JPG", "PNG", "WebP"].map((fmt) => (
              <span key={fmt} className="px-2.5 py-1 bg-[#B8860B]/10 text-[#B8860B] text-xs font-medium rounded-full">
                {fmt}
              </span>
            ))}
            <span className="px-2.5 py-1 bg-[#B8860B]/10 text-[#B8860B] text-xs font-medium rounded-full">
              max {maxPhotos} fotek
            </span>
          </div>
        </button>
      ) : (
        <div
          className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 rounded-2xl transition-all ${
            isDragging ? "ring-2 ring-[#B8860B] ring-offset-2 bg-[#B8860B]/5 p-2" : ""
          }`}
        >
          {photoItems.map((item, index) => (
            <div
              key={item.id}
              draggable={!item.isUploading}
              onDragStart={() => setDraggedPhotoId(item.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const fromIndex = photoItems.findIndex((p) => p.id === draggedPhotoId);
                reorderPhotos(fromIndex, index);
                setDraggedPhotoId(null);
              }}
              onDragEnd={() => setDraggedPhotoId(null)}
              className={`group relative aspect-square rounded-xl border bg-muted overflow-hidden shadow-sm transition-all hover:shadow-md ${
                index === 0 ? "ring-2 ring-[#B8860B]" : ""
              } ${draggedPhotoId === item.id ? "scale-95 opacity-70 ring-2 ring-[#B8860B]" : ""}`}
            >
              <img
                src={item.localPreview || `/objects/${item.url}`}
                alt={`Fotografie ${index + 1}`}
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${item.isUploading ? 'opacity-60' : ''}`}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!item.localPreview) {
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EChyba%3C/text%3E%3C/svg%3E';
                  }
                }}
              />
              {item.isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
              {!item.isUploading && (
                <div className="absolute right-1.5 top-1.5 z-10 flex gap-1 opacity-0 transition-all group-hover:opacity-100 group-focus-within:opacity-100">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => makeMainPhoto(item.id)}
                      className="rounded-full bg-[#B8860B] p-1.5 text-white shadow-lg hover:bg-[#a3760a]"
                      data-testid={`button-make-main-photo-${index}`}
                      title="Nastavit jako hlavní fotografii"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(item.id)}
                    className="rounded-full bg-black/55 p-1.5 text-white shadow-lg hover:bg-destructive"
                    data-testid={`button-remove-photo-${index}`}
                    title="Odstranit fotografii"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              {index === 0 ? (
                <div className="absolute bottom-1.5 left-1.5 z-10 inline-flex items-center gap-1 bg-gradient-to-r from-[#B8860B] to-[#D4AF37] text-white px-2 py-0.5 rounded-md text-[11px] font-semibold shadow">
                  <Star className="h-3 w-3 fill-white" />
                  Hlavní
                </div>
              ) : (
                <div className="absolute bottom-1.5 left-1.5 z-10 bg-background/80 text-foreground px-2 py-0.5 rounded-md text-[11px] font-medium">
                  {index + 1}
                </div>
              )}
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-[#B8860B]/40 hover:border-[#B8860B] hover:bg-[#B8860B]/5 transition-all flex flex-col items-center justify-center gap-2 p-4 touch-manipulation"
              data-testid="button-add-photos"
            >
              <ImagePlus className="h-7 w-7 text-[#B8860B]" />
              <span className="text-sm font-medium text-[#B8860B]">Přidat foto</span>
            </button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-photos"
      />

      <p className="text-sm text-muted-foreground">
        {photoItems.filter(p => !p.isUploading).length} / {maxPhotos} fotografií nahráno
        {uploadingCount > 0 && ` • Nahrávání ${uploadingCount} ${uploadingCount === 1 ? 'fotografie' : 'fotografií'}...`}
        {canAddMore && uploadingCount === 0 && hasPhotos && ` • Můžete přidat ještě ${maxPhotos - photoItems.length}`}
      </p>
      <p className="rounded-xl border border-[#B8860B]/20 bg-[#B8860B]/5 px-3 py-2 text-sm font-medium text-[#7a5a08]">
        Doporučujeme přidat alespoň 10 fotografií pro rychlejší prodej.
      </p>
    </div>
  );
}
