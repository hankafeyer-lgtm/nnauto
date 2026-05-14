import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, ChevronLeft, ChevronRight, Video, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { getThumbnailUrl, getOptimizedImageUrl } from "@/lib/imageOptimizer";

interface MediaLightboxProps {
  photos: string[];
  video?: string | null;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const DESKTOP_MIN_WIDTH = 1024;

/**
 * Fullscreen photo/video gallery used from the listing detail page.
 *
 * Performance contract for fast swiping (the main reason for this
 * component's design):
 *
 *   1. The active <img> uses `key={safePhotoIndex}` so swiping unmounts
 *      the previous element. That makes the browser drop the in-flight
 *      HTTP request for the previous photo — without it, swiping past
 *      a half-loaded image would keep its connection alive and starve
 *      the next request out of the per-host parallel-connection budget
 *      (~6 in Chrome/Safari), which is exactly the "you're already on
 *      the 10th photo but 5–6–7 are still downloading" symptom.
 *
 *   2. Preloading is intentionally limited to ONE neighbour on each
 *      side (idx-1, idx+1). The effect's cleanup empties their `src`
 *      on swipe, which releases their connection slot too.
 *
 *   3. The image's render width is captured ONCE per lightbox open
 *      based on viewport + DPR. We don't run a per-slide "upgrade"
 *      flow (mobile → desktop) because that would fire an additional
 *      preload for every swipe.
 *
 *   4. While the current frame is not yet loaded a single spinner
 *      overlay is rendered so the user gets feedback that the gallery
 *      is alive — without it the previous frame would visibly "stick"
 *      on slow networks.
 */
export function MediaLightbox({
  photos,
  video,
  initialIndex,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  const t = useTranslation();

  const photoKeys = useMemo(
    () =>
      (photos || [])
        .filter((p): p is string => typeof p === "string" && p.trim() !== "")
        .map((p) => p.replace(/^\/+/, "")),
    [photos],
  );

  const videoKey = useMemo(() => {
    if (!video || typeof video !== "string") return null;
    const v = video.trim();
    return v ? v.replace(/^\/+/, "") : null;
  }, [video]);

  const totalItems = photoKeys.length + (videoKey ? 1 : 0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  /**
   * Render-target width captured once at mount based on viewport + DPR.
   * Stable across swipes so the URL is identical between display and
   * neighbour preload — letting the browser cache hit on every swipe.
   */
  const [renderWidth, setRenderWidth] = useState<number>(1000);
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
    const w = isDesktop
      ? Math.min(1600, Math.round(window.innerWidth * dpr))
      : Math.min(900, Math.round(window.innerWidth * dpr));
    setRenderWidth(w);
  }, [isOpen]);

  const buildUrl = useCallback(
    (key: string) =>
      getOptimizedImageUrl(key, {
        width: renderWidth,
        quality: renderWidth > 1200 ? 75 : 68,
        format: "webp",
      }),
    [renderWidth],
  );

  // Zoom + pan
  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const lastTapRef = useRef<number>(0);

  // Swipe refs
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(
    null,
  );
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);

  // Pan refs (smooth via rAF)
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panRafRef = useRef<number | null>(null);

  const isVideoSlide = !!videoKey && currentIndex === photoKeys.length;

  const safePhotoIndex = useMemo(() => {
    if (photoKeys.length === 0) return 0;
    return clamp(currentIndex, 0, photoKeys.length - 1);
  }, [currentIndex, photoKeys.length]);

  const currentKey = photoKeys[safePhotoIndex];
  const currentUrl = currentKey ? buildUrl(currentKey) : "";

  const thumbnailUrls = useMemo(
    () => photoKeys.map((k) => getThumbnailUrl(k)),
    [photoKeys],
  );

  // Init index on open
  useEffect(() => {
    if (!isOpen) return;
    const safe = clamp(initialIndex ?? 0, 0, Math.max(0, totalItems - 1));
    setCurrentIndex(safe);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, [isOpen, initialIndex, totalItems]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  // Reset zoom + loading state on slide change
  useEffect(() => {
    if (!isOpen) return;
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
    setImageLoaded(false);
  }, [currentIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
  }, [totalItems]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
  }, [totalItems]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, handlePrev, handleNext]);

  /**
   * Preload ±1 neighbour and cancel the in-flight requests on cleanup.
   *
   * Setting `img.src = ""` on an HTMLImageElement with no other live
   * references causes Chrome/Firefox/Safari to abort the in-flight
   * download. That's our "AbortController for <img>" — when the user
   * swipes past a still-loading neighbour, the connection slot is
   * freed immediately so the new neighbour gets to start.
   */
  useEffect(() => {
    if (!isOpen) return;
    if (photoKeys.length === 0) return;

    const idx = clamp(currentIndex, 0, photoKeys.length - 1);
    const neighbors = [idx - 1, idx + 1].filter(
      (i, pos, arr) => i >= 0 && i < photoKeys.length && arr.indexOf(i) === pos,
    );

    const preloads: HTMLImageElement[] = [];
    for (const i of neighbors) {
      const img = new Image();
      img.decoding = "async";
      img.src = buildUrl(photoKeys[i]);
      preloads.push(img);
    }

    return () => {
      for (const img of preloads) {
        try {
          img.src = "";
        } catch {
          /* ignore */
        }
      }
    };
  }, [isOpen, currentIndex, photoKeys, buildUrl]);

  // Pan smooth
  const setPanSmooth = useCallback((x: number, y: number) => {
    panTargetRef.current = { x, y };
    if (panRafRef.current) return;

    panRafRef.current = window.requestAnimationFrame(() => {
      panRafRef.current = null;
      setPanPosition(panTargetRef.current);
    });
  }, []);

  const zoomInAt = useCallback((clientX: number, clientY: number) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (centerX - clientX) * 1;
    const offsetY = (centerY - clientY) * 1;

    setIsZoomed(true);
    setPanPosition({ x: offsetX, y: offsetY });
    lastPanRef.current = { x: offsetX, y: offsetY };
  }, []);

  const zoomOut = useCallback(() => {
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, []);

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      const DOUBLE_TAP_DELAY = 280;

      if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
        lastTapRef.current = 0;
        if (isZoomed) zoomOut();
        else zoomInAt(clientX, clientY);
        return;
      }

      lastTapRef.current = now;
    },
    [isZoomed, zoomInAt, zoomOut],
  );

  const minSwipeDistance = 50;

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isOpen) return;
      const t0 = e.touches[0];
      touchStartRef.current = { x: t0.clientX, y: t0.clientY, t: Date.now() };
      touchEndRef.current = null;

      if (isZoomed && e.touches.length === 1) {
        panStartRef.current = { x: t0.clientX, y: t0.clientY };
      }
    },
    [isOpen, isZoomed],
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isOpen) return;
      const t0 = e.touches[0];
      touchEndRef.current = { x: t0.clientX, y: t0.clientY };

      if (isZoomed && panStartRef.current && e.touches.length === 1) {
        const dx = t0.clientX - panStartRef.current.x;
        const dy = t0.clientY - panStartRef.current.y;
        setPanSmooth(lastPanRef.current.x + dx, lastPanRef.current.y + dy);
      }
    },
    [isOpen, isZoomed, setPanSmooth],
  );

  const onTouchEnd = useCallback(() => {
    if (!isOpen) return;

    if (isZoomed && panStartRef.current) {
      lastPanRef.current = { ...panTargetRef.current };
      panStartRef.current = null;
    }

    const start = touchStartRef.current;
    const end = touchEndRef.current;
    touchStartRef.current = null;
    touchEndRef.current = null;

    if (!start || !end) return;

    const dx = start.x - end.x;
    const dy = start.y - end.y;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (isZoomed) return;

    const isSwipe = absDx > minSwipeDistance && absDx > absDy;
    if (isSwipe) {
      if (dx > 0) handleNext();
      else handlePrev();
      return;
    }

    const isTap = absDx < 10 && absDy < 10;
    if (isTap) handleTap(end.x, end.y);
  }, [isOpen, isZoomed, handleNext, handlePrev, handleTap]);

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isVideoSlide) return;
      if (isZoomed) zoomOut();
      else zoomInAt(e.clientX, e.clientY);
    },
    [isZoomed, isVideoSlide, zoomInAt, zoomOut],
  );

  const onSingleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isVideoSlide) return;
      handleTap(e.clientX, e.clientY);
    },
    [handleTap, isVideoSlide],
  );

  const thumbnails = useMemo(() => {
    if (totalItems <= 1) return null;

    return (
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[10000] flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
        {photoKeys.map((key, index) => (
          <button
            key={`thumb-${key}-${index}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
              currentIndex === index
                ? "border-primary ring-2 ring-primary/50"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            data-testid={`button-lightbox-thumb-${index}`}
          >
            <img
              src={thumbnailUrls[index]}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}

        {videoKey && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(photoKeys.length);
            }}
            className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-black/80 ${
              currentIndex === photoKeys.length
                ? "border-primary ring-2 ring-primary/50"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            data-testid="button-lightbox-thumb-video"
          >
            <Video className="h-6 w-6 text-white" />
          </button>
        )}
      </div>
    );
  }, [totalItems, photoKeys, thumbnailUrls, videoKey, currentIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Close button */}
      <button
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
          left: "auto",
          zIndex: 10001,
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        data-testid="button-lightbox-close"
      >
        <X className="h-7 w-7 text-black" />
      </button>

      {/* Media container */}
      <div
        className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
        onClick={onSingleClick}
        onDoubleClick={onDoubleClick}
        style={{ touchAction: isZoomed ? "none" : "pan-x" }}
      >
        {isVideoSlide ? (
          <video
            src={`/objects/${videoKey!}`}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain"
            data-testid="video-lightbox"
            onClick={(e) => e.stopPropagation()}
          />
        ) : currentKey ? (
          <>
            <img
              key={`slide-${safePhotoIndex}`}
              src={currentUrl}
              alt={`Photo ${currentIndex + 1}`}
              decoding="async"
              loading="eager"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-full max-h-full object-contain select-none transition-opacity duration-150 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: isZoomed
                  ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
                  : "scale(1) translate(0, 0)",
                willChange: isZoomed ? "transform" : undefined,
              }}
              data-testid="img-lightbox"
            />
            {!imageLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
                data-testid="lightbox-loader"
              >
                <Loader2 className="h-10 w-10 text-white/70 animate-spin" />
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* Zoom indicator */}
      {isZoomed && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
          {t("lightbox.zoomHint")}
        </div>
      )}

      {/* Navigation arrows */}
      {totalItems > 1 && !isZoomed && (
        <>
          <button
            style={{
              position: "fixed",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10001,
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
            }
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            data-testid="button-lightbox-prev"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>

          <button
            style={{
              position: "fixed",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10001,
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
            }
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            data-testid="button-lightbox-next"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </>
      )}

      {/* Counter */}
      {!isZoomed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          {isVideoSlide && <Video className="h-4 w-4" />}
          <span>
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      )}

      {!isZoomed && thumbnails}
    </div>
  );
}
