import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/translations";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvatarUploaderProps {
  onUploadComplete: (objectPath: string) => void;
  buttonClassName?: string;
}

export function AvatarUploader({ onUploadComplete, buttonClassName }: AvatarUploaderProps) {
  const t = useTranslation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: t("profile.avatarUpdateError"),
        description: "Vyberte prosím obrazový soubor",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: t("profile.avatarUpdateError"),
        description: "Soubor je příliš velký. Maximální velikost je 5MB",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // Remove data URI prefix (e.g., "data:image/png;base64,")
        const base64Only = base64Data.split(',')[1];

        try {
          const uploadRes = await apiRequest("POST", "/api/objects/upload-file", {
            fileData: base64Only,
            fileName: file.name,
            contentType: file.type,
          });

          const uploadData = await uploadRes.json();
          
          if (!uploadData?.objectPath) {
            toast({
              variant: "destructive",
              title: t("profile.avatarUpdateError"),
              description: "Nepodařilo se nahrát soubor - chybí cesta k objektu",
            });
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
            setIsUploading(false);
            return;
          }
          
          const bareKey = uploadData.objectPath.replace(/^\/objects\//, "");
          onUploadComplete(bareKey);
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error: any) {
          console.error("Upload error:", error);
          toast({
            variant: "destructive",
            title: t("profile.avatarUpdateError"),
            description: error.message || "Nepodařilo se nahrát soubor",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        toast({
          variant: "destructive",
          title: t("profile.avatarUpdateError"),
          description: "Nepodařilo se načíst soubor",
        });
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File reading error:", error);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-avatar-file"
      />
      <Button
        type="button"
        onClick={handleButtonClick}
        disabled={isUploading}
        variant="outline"
        className={buttonClassName}
        data-testid="button-upload-avatar"
      >
        {isUploading ? (
          <Upload className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </>
  );
}
