import { useState, useRef } from "react";
import { Video, X, Loader2, Play, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";

interface VideoUploaderProps {
  video: string | null;
  onVideoChange: (video: string | null) => void;
  maxDurationSeconds?: number;
}

export function VideoUploader({
  video,
  onVideoChange,
  maxDurationSeconds = 300,
}: VideoUploaderProps) {
  const { toast } = useToast();
  const t = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPhase, setUploadPhase] = useState<"uploading" | "processing">(
    "uploading"
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const validateVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        if (duration > maxDurationSeconds) {
          reject(
            new Error(
              `Video příliš dlouhé. Maximum je ${formatDuration(
                maxDurationSeconds
              )}, vaše video má ${formatDuration(duration)}`
            )
          );
        } else {
          resolve(duration);
        }
      };

      video.onerror = () => {
        reject(new Error("Nepodařilo se načíst video"));
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    if (!file.type.startsWith("video/")) {
      toast({
        variant: "destructive",
        title: t("video.error") || "Chyba",
        description: t("video.notVideo") || "Vybraný soubor není video",
      });
      return;
    }

    const maxSize = 200 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: t("video.error") || "Chyba",
        description: t("video.tooLarge") || "Video je příliš velké (max 200MB)",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadPhase("uploading");

    try {
      await validateVideoDuration(file);
      setUploadProgress(10);

      // Get JWT token for auth
      const token = localStorage.getItem("nnauto_token");

      // Upload via FormData to backend (avoids CORS issues with R2)
      const formData = new FormData();
      formData.append("video", file);

      const result = await new Promise<{ objectPath: string }>(
        (resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = 10 + (event.loaded / event.total) * 85;
              setUploadProgress(progress);

              // When upload reaches 95%, switch to processing phase
              if (progress >= 95) {
                setUploadPhase("processing");
              }
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch {
                reject(new Error("Invalid response from server"));
              }
            } else {
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    errorResponse.error ||
                      `Upload failed with status ${xhr.status}`
                  )
                );
              } catch {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.open("POST", "/api/objects/upload-video");

          // Add authorization header
          if (token) {
            xhr.setRequestHeader("Authorization", `Bearer ${token}`);
          }

          xhr.withCredentials = true;
          xhr.send(formData);
        }
      );

      setUploadProgress(100);
      onVideoChange(result.objectPath);

      toast({
        title: t("video.uploaded") || "Video nahráno",
        description: t("video.uploadSuccess") || "Video bylo úspěšně nahráno",
      });
    } catch (error: any) {
      console.error("Video upload error:", error);
      toast({
        variant: "destructive",
        title: t("video.uploadError") || "Chyba nahrávání",
        description:
          error.message ||
          t("video.uploadFailed") ||
          "Nepodařilo se nahrát video",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveVideo = () => {
    onVideoChange(null);
  };

  return (
    <div className="w-full">
      {video ? (
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#B8860B]/40 bg-black shadow-xl">
          <div className="aspect-[16/9] sm:aspect-video relative">
            <video
              ref={videoRef}
              src={`/objects/${video}`}
              controls
              className="w-full h-full object-contain bg-black"
              preload="metadata"
              playsInline
              data-testid="video-preview"
            >
              Váš prohlížeč nepodporuje video tag.
            </video>
            <button
              type="button"
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:scale-110 transition-all z-10"
              data-testid="button-remove-video"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 bg-gradient-to-r from-[#B8860B]/20 to-[#D4AF37]/20 px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 sm:p-2 bg-[#B8860B] rounded-full">
                <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
              </div>
              <span className="text-sm sm:text-base font-medium text-foreground">
                {t("video.videoUploaded") || "Video nahráno"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-[#B8860B] font-medium">
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">
                {t("video.ready") || "Připraveno"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full min-h-[180px] sm:min-h-[220px] rounded-2xl border-2 border-dashed border-[#B8860B]/50 hover:border-[#B8860B] transition-all flex flex-col items-center justify-center gap-3 sm:gap-4 p-4 sm:p-6 bg-gradient-to-br from-background via-[#B8860B]/5 to-[#D4AF37]/10 hover:from-[#B8860B]/10 hover:via-[#B8860B]/15 hover:to-[#D4AF37]/20 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99] touch-manipulation"
          data-testid="button-add-video"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-xs">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                {uploadPhase === "processing" ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 text-[#B8860B] animate-spin" />
                  </div>
                ) : (
                  <>
                    <svg
                      className="w-full h-full -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        className="text-muted stroke-current"
                        strokeWidth="8"
                        fill="none"
                        r="42"
                        cx="50"
                        cy="50"
                      />
                      <circle
                        className="text-[#B8860B] stroke-current transition-all duration-300"
                        strokeWidth="8"
                        strokeLinecap="round"
                        fill="none"
                        r="42"
                        cx="50"
                        cy="50"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 42}`,
                          strokeDashoffset: `${
                            2 * Math.PI * 42 * (1 - uploadProgress / 100)
                          }`,
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base sm:text-lg font-bold text-[#B8860B]">
                        {Math.round(uploadProgress)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
              <div className="text-center space-y-1">
                <span className="text-sm sm:text-base text-foreground font-medium block">
                  {uploadPhase === "processing"
                    ? t("video.processing") || "Zpracování videa..."
                    : t("video.uploading") || "Nahrávání videa..."}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {uploadPhase === "processing"
                    ? t("video.processingHint") ||
                      "Ukládání do cloudu, může to trvat několik minut"
                    : t("video.pleaseWait") || "Prosím čekejte"}
                </span>
              </div>
              {uploadPhase === "uploading" && (
                <div className="w-full max-w-[200px] h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
              {uploadPhase === "processing" && (
                <div className="w-full max-w-[200px] h-1.5 sm:h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-[#B8860B] to-[#D4AF37] animate-pulse" />
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="relative">
                <div className="absolute inset-0 bg-[#B8860B]/30 rounded-full blur-2xl group-hover:blur-3xl transition-all scale-150" />
                <div className="relative p-4 sm:p-5 bg-gradient-to-br from-[#B8860B] to-[#D4AF37] rounded-full shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all">
                  <Video className="h-7 w-7 sm:h-9 sm:w-9 text-white" />
                </div>
              </div>
              <div className="text-center space-y-1.5 sm:space-y-2">
                <span className="text-base sm:text-lg font-semibold text-foreground group-hover:text-[#B8860B] transition-colors block">
                  {t("video.addVideo") || "Přidat video"}
                </span>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#B8860B]" />
                    <span>
                      {t("video.maxDuration") ||
                        `Max ${formatDuration(maxDurationSeconds)}`}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-muted-foreground/50">
                    •
                  </span>
                  <span>Max 200MB</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-1">
                {["MP4", "MOV", "WebM"].map((format) => (
                  <span
                    key={format}
                    className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#B8860B]/10 text-[#B8860B] text-xs font-medium rounded-full"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-video"
      />
    </div>
  );
}
