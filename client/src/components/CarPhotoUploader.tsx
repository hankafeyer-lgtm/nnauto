import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photoItems.length;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);

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

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      const itemId = newItems[i].id;

      try {
        // Max 1000MB file size
        if (file.size > 1000 * 1024 * 1024) {
          throw new Error(`Soubor ${file.name} je příliš velký (max 1000MB)`);
        }

        if (!file.type.startsWith('image/')) {
          throw new Error(`Soubor ${file.name} není obrázek`);
        }

        const fileData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            if (typeof result !== "string" || !result.includes(",")) {
              reject(new Error(`Nepodařilo se načíst soubor ${file.name}`));
              return;
            }
            const base64 = result.split(",")[1];
            if (!base64) {
              reject(new Error(`Nepodařilo se zpracovat soubor ${file.name}`));
              return;
            }
            resolve(base64);
          };
          reader.onerror = () => reject(new Error(`Chyba čtení souboru ${file.name}`));
          reader.readAsDataURL(file);
        });

        const uploadRes = await apiRequest("POST", "/api/objects/upload-file", {
          fileData,
          fileName: file.name,
          contentType: file.type,
        });
        const uploadData = await uploadRes.json();
        const objectPath = uploadData.objectPath;

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

  const uploadingCount = photoItems.filter(p => p.isUploading).length;
  const canAddMore = photoItems.length < maxPhotos;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photoItems.map((item, index) => (
          <div key={item.id} className="relative aspect-square rounded-lg border bg-muted">
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <img
                src={item.localPreview || `/objects/${item.url}`}
                alt={`Fotografie ${index + 1}`}
                className={`w-full h-full object-cover ${item.isUploading ? 'opacity-60' : ''}`}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!item.localPreview) {
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EChyba%3C/text%3E%3C/svg%3E';
                  }
                }}
              />
            </div>
            {item.isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
            {!item.isUploading && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(item.id)}
                className="absolute -top-2 -right-2 z-10 p-1.5 bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
                data-testid={`button-remove-photo-${index}`}
                title="Odstranit fotografii"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 bg-background/80 text-foreground px-2 py-1 rounded text-xs z-10">
              {index + 1}
            </div>
          </div>
        ))}
        
        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed hover:border-primary transition-colors flex flex-col items-center justify-center gap-2 p-4 bg-background hover-elevate active-elevate-2"
            data-testid="button-add-photos"
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Přidat foto</span>
          </button>
        )}
      </div>
      
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
        {canAddMore && uploadingCount === 0 && ` • Můžete přidat ještě ${maxPhotos - photoItems.length}`}
      </p>
    </div>
  );
}
