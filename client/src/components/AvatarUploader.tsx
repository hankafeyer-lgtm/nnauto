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
      const presignRes = await apiRequest("POST", "/api/objects/upload", {
        contentType: file.type,
      });
      const presign = await presignRes.json() as { url: string; objectKey: string };
      const putRes = await fetch(presign.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) {
        throw new Error(`Nahrání selhalo (${putRes.status})`);
      }
      const finRes = await apiRequest("POST", "/api/objects/finalize-upload", {
        objectKey: presign.objectKey,
      });
      const fin = await finRes.json() as { objectPath?: string };
      if (!fin?.objectPath) {
        toast({
          variant: "destructive",
          title: t("profile.avatarUpdateError"),
          description: "Nepodařilo se nahrát soubor - chybí cesta k objektu",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setIsUploading(false);
        return;
      }

      const bareKey = fin.objectPath.replace(/^\/objects\//, "");
      onUploadComplete(bareKey);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: unknown) {
      console.error("Upload error:", error);
      toast({
        variant: "destructive",
        title: t("profile.avatarUpdateError"),
        description:
          error instanceof Error ? error.message : "Nepodařilo se nahrát soubor",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
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
