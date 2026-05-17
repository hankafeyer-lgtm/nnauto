import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, ChevronLeft, ChevronRight, Video, Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import {
  getLightboxInstantUrl,
  getOptimizedImageUrl,
  getThumbnailUrl,
} from "@/lib/imageOptimizer";

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
const MOBILE_MAX_W = 1200;
const DESKTOP_MAX_W = 1600;
const QUALITY = 72;
const PREFETCH_RADIUS = 2;

function probeImageCached(url: string): boolean {
  if (!url || typeof window === "undefined") return false;
  const img = new Image();
  img.src = url;
  return img.complete && img.naturalWidth > 0;
}

function prefetchUrls(urls: string[], cache: Set<string>) {
  for (const url of urls) {
    if (!url || cache.has(url)) continue;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => cache.add(url);
    img.onerror = () => cache.add(url);
    img.src = url;
  }
}

/**
 * Fullscreen photo/video gallery used from the listing detail page.
 *
 * Speed strategy:
 *   - Instant layer uses carousel-sized URLs (w=560 / w=1120) — same as
 *     the detail page gallery, so opening or swiping usually hits cache.
 *   - Per-URL loaded cache survives slide changes (no flash on revisit).
 *   - On open + each swipe, prefetch full-res for ±2 neighbors via Image().
 *   - Full-res fades in only when not already warm in cache.
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
  const [instantOk, setInstantOk] = useState(false);

  const loadedUrlsRef = useRef<Set<string>>(new Set());

  const [renderWidth, setRenderWidth] = useState<number>(MOBILE_MAX_W);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === "undefined") return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const desktop = window.innerWidth >= DESKTOP_MIN_WIDTH;
    setIsDesktop(desktop);
    const cap = desktop ? DESKTOP_MAX_W : MOBILE_MAX_W;
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

  const buildInstantUrl = useCallback(
    (key: string) => getLightboxInstantUrl(key, isDesktop),
    [isDesktop],
  );

  const [isZoomed, setIsZoomed] = useState(false);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

  const lastTapRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(
    null,
  );
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
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
  const instantUrl = currentKey ? buildInstantUrl(currentKey) : "";
  const previewUrl = currentKey ? getThumbnailUrl(currentKey) : "";

  const thumbnailUrls = useMemo(
    () => photoKeys.map((k) => getThumbnailUrl(k)),
    [photoKeys],
  );

  const neighborFullUrls = useMemo(() => {
    if (isVideoSlide || photoKeys.length <= 1) return [];
    const urls: string[] = [];
    for (let offset = -PREFETCH_RADIUS; offset <= PREFETCH_RADIUS; offset++) {
      if (offset === 0) continue;
      const idx =
        (safePhotoIndex + offset + photoKeys.length) % photoKeys.length;
      urls.push(buildUrl(photoKeys[idx]));
    }
    return urls;
  }, [isVideoSlide, photoKeys, safePhotoIndex, buildUrl]);

  const neighborInstantUrls = useMemo(() => {
    if (isVideoSlide || photoKeys.length <= 1) return [];
    const urls: string[] = [];
    for (let offset = -PREFETCH_RADIUS; offset <= PREFETCH_RADIUS; offset++) {
      if (offset === 0) continue;
      const idx =
        (safePhotoIndex + offset + photoKeys.length) % photoKeys.length;
      urls.push(buildInstantUrl(photoKeys[idx]));
    }
    return urls;
  }, [isVideoSlide, photoKeys, safePhotoIndex, buildInstantUrl]);

  const applyCachedLoadState = useCallback((full: string, instant: string) => {
    const cache = loadedUrlsRef.current;
    const fullWarm = cache.has(full) || probeImageCached(full);
    const instantWarm =
      cache.has(instant) || probeImageCached(instant) || probeImageCached(full);
    if (fullWarm) cache.add(full);
    if (instantWarm) cache.add(instant);
    setImageLoaded(fullWarm);
    setInstantOk(instantWarm);
    setPreviewLoaded(instantWarm || fullWarm);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const safe = clamp(initialIndex ?? 0, 0, Math.max(0, totalItems - 1));
    setCurrentIndex(safe);
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, [isOpen, initialIndex, totalItems]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || isVideoSlide || !currentUrl) return;
    applyCachedLoadState(currentUrl, instantUrl);
  }, [isOpen, isVideoSlide, currentUrl, instantUrl, applyCachedLoadState]);

  useEffect(() => {
    if (!isOpen || isVideoSlide) return;
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, [currentIndex, isOpen, isVideoSlide]);

  useEffect(() => {
    if (!isOpen || isVideoSlide || !currentUrl) return;
    const cache = loadedUrlsRef.current;
    const batch = [
      currentUrl,
      instantUrl,
      ...neighborFullUrls,
      ...neighborInstantUrls,
    ];
    prefetchUrls(batch, cache);
  }, [
    isOpen,
    isVideoSlide,
    currentUrl,
    instantUrl,
    neighborFullUrls,
    neighborInstantUrls,
  ]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
  }, [totalItems]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
  }, [totalItems]);

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
    setIsZoomed(true);
    setPanPosition({
      x: (centerX - clientX) * 1,
      y: (centerY - clientY) * 1,
    });
    lastPanRef.current = {
      x: (centerX - clientX) * 1,
      y: (centerY - clientY) * 1,
    };
  }, []);

  const zoomOut = useCallback(() => {
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, []);

  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const now = Date.now();
      if (now - lastTapRef.current < 280) {
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
    if (absDx > minSwipeDistance && absDx > absDy) {
      if (dx > 0) handleNext();
      else handlePrev();
      return;
    }
    if (absDx < 10 && absDy < 10) handleTap(end.x, end.y);
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

  const markFullLoaded = useCallback(() => {
    if (currentUrl) loadedUrlsRef.current.add(currentUrl);
    setImageLoaded(true);
    setPreviewLoaded(true);
  }, [currentUrl]);

  const markInstantLoaded = useCallback(() => {
    if (instantUrl) loadedUrlsRef.current.add(instantUrl);
    setInstantOk(true);
    setPreviewLoaded(true);
  }, [instantUrl]);

  const markThumbLoaded = useCallback(() => {
    if (previewUrl) loadedUrlsRef.current.add(previewUrl);
    setPreviewLoaded(true);
  }, [previewUrl]);

  const thumbnails = useMemo(() => {
    if (totalItems <= 1) return null;
    return (
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[10000] flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
        {photoKeys.map((key, index) => (
          <button
            key={`thumb-${key}-${index}`}
            type="button"
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
              loading="eager"
              decoding="async"
            />
          </button>
        ))}
        {videoKey ? (
          <button
            type="button"
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
        ) : null}
      </div>
    );
  }, [totalItems, photoKeys, thumbnailUrls, videoKey, currentIndex, imageAltPrefix]);

  if (!isOpen) return null;

  const showInstant = instantOk && !imageLoaded;
  const showThumbFallback = previewLoaded && !instantOk && !imageLoaded;
  const showSpinner = !previewLoaded && !imageLoaded;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <button
        type="button"
        style={{
          position: "fixed",
          top: "16px",
          right: "16px",
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
            {/* Carousel-sized — usually cached from the detail gallery */}
            <img
              src={instantUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              onLoad={markInstantLoaded}
              onError={() => setInstantOk(false)}
              className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none pointer-events-none"
              style={{
                opacity: showInstant ? 1 : 0,
                filter: showInstant ? "blur(6px)" : undefined,
                transform: showInstant ? "scale(1.02)" : undefined,
                transition: "opacity 80ms ease-out",
              }}
              data-testid="img-lightbox-instant"
            />
            {/* Tiny thumb fallback if carousel size not warm yet */}
            <img
              src={previewUrl}
              alt=""
              aria-hidden="true"
              decoding="async"
              draggable={false}
              onLoad={markThumbLoaded}
              onError={() => undefined}
              className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none pointer-events-none"
              style={{
                opacity: showThumbFallback ? 1 : 0,
                filter: "blur(12px)",
                transform: "scale(1.04)",
                transition: "opacity 80ms ease-out",
              }}
              data-testid="img-lightbox-preview"
            />
            <img
              src={currentUrl}
              alt={`Photo ${currentIndex + 1}`}
              decoding="async"
              loading="eager"
              fetchPriority="high"
              draggable={false}
              onLoad={markFullLoaded}
              onError={markFullLoaded}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-0 m-auto max-w-full max-h-full object-contain select-none"
              style={{
                opacity: imageLoaded ? 1 : 0,
                transform: isZoomed
                  ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
                  : undefined,
                transition: imageLoaded
                  ? "opacity 120ms ease-out, transform 0.2s ease-out"
                  : "opacity 120ms ease-out",
                willChange: isZoomed ? "transform" : undefined,
              }}
              data-testid="img-lightbox"
            />
            {showSpinner ? (
              <div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                aria-hidden="true"
                data-testid="lightbox-loader"
              >
                <Loader2 className="h-10 w-10 text-white/70 animate-spin" />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {isZoomed ? (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
          {t("lightbox.zoomHint")}
        </div>
      ) : null}

      {totalItems > 1 && !isZoomed ? (
        <>
          <button
            type="button"
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
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            data-testid="button-lightbox-prev"
          >
            <ChevronLeft className="h-8 w-8 text-white" />
          </button>
          <button
            type="button"
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
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            data-testid="button-lightbox-next"
          >
            <ChevronRight className="h-8 w-8 text-white" />
          </button>
        </>
      ) : null}

      {!isZoomed ? (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
          {isVideoSlide ? <Video className="h-4 w-4" /> : null}
          <span>
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      ) : null}

      {!isZoomed ? thumbnails : null}
    </div>
  );
}
