import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, ChevronLeft, ChevronRight, Video, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/lib/imageOptimizer";

interface MediaLightboxProps {
  photos: string[];
  video?: string | null;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  /** Prefix for thumbnail alt text, e.g. "Škoda Octavia 2018". */
  imageAltPrefix?: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));

const DESKTOP_MIN_WIDTH = 1024;
// Render widths chosen to keep the per-photo Sharp resize + watermark
// composite pipeline on the VPS under ~400ms on first hit and the over-
// the-wire transfer small enough for 4G. Going wider made the cold
// cache feel as slow as the original (multi-second blank screen).
const MOBILE_MAX_W = 1200;
const DESKTOP_MAX_W = 1600;
const QUALITY = 72;

/**
 * Fullscreen photo/video gallery used from the listing detail page.
 *
 * Strategy (after a few iterations that each had a flaw):
 *
 *   1. Preview source = thumbnail-strip URL (`getThumbnailUrl`, w=64).
 *      The bottom strip already needs every thumbnail, so we eagerly
 *      load all of them when the lightbox opens (≈ 29 photos × 5 KB).
 *      That gives a guaranteed-cached placeholder for ANY photo — not
 *      just photo 0 the way `getCardImageUrl` did.
 *
 *   2. A heavy 16 px blur masks the 64 px → screen-wide upscaling so
 *      the placeholder reads as "loading this photo" rather than "low
 *      quality photo".
 *
 *   3. Full-res = w=1200 mobile / w=1600 desktop, q=72. The VPS
 *      Sharp + watermark pipeline at these sizes finishes in ~300–
 *      500 ms cold and ~10 ms warm; the over-the-wire transfer on 4G
 *      is roughly halved compared to w=1800 q=78.
 *
 *   4. ONE prefetch — only the next photo — and only AFTER the current
 *      photo has finished loading. The active swipe never competes
 *      for bandwidth.
 *
 *   5. No `key={index}` and no `new Image()` cancel logic. Updating
 *      `src` on the same element is enough — the HTML image element
 *      aborts the previous fetch automatically when src changes.
 */
export function MediaLightbox({
  photos,
  video,
  initialIndex,
  isOpen,
  onClose,
  imageAltPrefix,
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
  const [previewLoaded, setPreviewLoaded] = useState(false);

  /** Width chosen once at lightbox open; stable URLs over the session. */
  const [renderWidth, setRenderWidth] = useState<number>(MOBILE_MAX_W);
  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
    const cap = isDesktop ? DESKTOP_MAX_W : MOBILE_MAX_W;
    setRenderWidth(Math.min(cap, Math.round(window.innerWidth * dpr)));
  }, [isOpen]);

  const buildUrl = useCallback(
    (key: string) =>
      getOptimizedImageUrl(key, {
        width: renderWidth,
        quality: QUALITY,
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
  // Same URL the bottom thumbnail strip renders for this photo. The
  // strip eager-loads all thumbnails (see `thumbnails` below), so by
  // the time the user swipes anywhere this URL is in browser cache
  // and the placeholder paints in the same frame as the index change.
  // Critically this works for EVERY photo, not just photo 0 the way
  // a card-image preview would.
  const previewUrl = currentKey ? getThumbnailUrl(currentKey) : "";
  // One-ahead key for the conservative prefetch hook below.
  const nextKey =
    !isVideoSlide && photoKeys.length > 1
      ? photoKeys[(safePhotoIndex + 1) % photoKeys.length]
      : null;

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
    setPreviewLoaded(false);
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
              alt={
                imageAltPrefix
                  ? `${imageAltPrefix} - foto ${index + 1}`
                  : `Thumbnail ${index + 1}`
              }
              className="w-full h-full object-cover"
              // Eager so that ALL thumbnails are warm in the browser
              // cache the moment the lightbox opens — that's what
              // makes the blurred preview show instantly when the
              // user swipes to any photo, not just photo 0. Each
              // thumb is ~5 KB so the sum (≈ 150 KB for a typical
              // listing) is cheap.
              loading="eager"
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
          <div className="relative w-full h-full flex items-center justify-center">
            {/*
              Layer 1 — low-res preview using the SAME url the catalogue
              card served. Almost always already in the browser cache,
              so it paints in the same frame as the index change. A
              small blur disguises the upscaling until the full-res
              version arrives. Hidden under the full image once that
              has finished loading.
            */}
            <img
              src={previewUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              draggable={false}
              onLoad={() => setPreviewLoaded(true)}
              onError={() => setPreviewLoaded(true)}
              className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none pointer-events-none transition-opacity duration-100"
              style={{
                opacity: previewLoaded && !imageLoaded ? 1 : 0,
                // 16px blur is enough to mask the 64 px → screen
                // upscaling so it reads as "loading" rather than "low
                // quality". The 1.04 overscale hides the blurred
                // edges that would otherwise peek over the black
                // background.
                filter: "blur(16px)",
                transform: "scale(1.04)",
                willChange: imageLoaded ? undefined : "opacity",
              }}
              data-testid="img-lightbox-preview"
            />

            {/*
              Layer 2 — full-resolution version. Fades in once `onLoad`
              fires. Updating its `src` on swipe is enough: the HTML
              image element aborts its previous fetch automatically.
            */}
            <img
              src={currentUrl}
              alt={`Photo ${currentIndex + 1}`}
              decoding="async"
              loading="eager"
              draggable={false}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none transition-opacity duration-150"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transform: isZoomed
                  ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
                  : "scale(1) translate(0, 0)",
                willChange: isZoomed ? "transform" : undefined,
              }}
              data-testid="img-lightbox"
            />

            {/*
              Spinner only when EVEN the preview hasn't painted yet
              (very rare — would only happen on a direct deep link
              where no catalogue card was visited beforehand).
            */}
            {!previewLoaded && !imageLoaded && (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
                data-testid="lightbox-loader"
              >
                <Loader2 className="h-10 w-10 text-white/70 animate-spin" />
              </div>
            )}

            {/*
              One-ahead prefetch — only mounted AFTER the current photo
              finishes loading. This guarantees the current swipe is
              never starved by a prefetch competing for bandwidth, but
              a steady swipe still finds the next photo warm.
              Rendered with display:none so it never affects layout.
            */}
            {imageLoaded && nextKey && (
              <img
                src={buildUrl(nextKey)}
                alt=""
                aria-hidden="true"
                decoding="async"
                style={{ display: "none" }}
                data-testid="img-lightbox-prefetch-next"
              />
            )}
          </div>
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
