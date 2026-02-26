// // import { useState, useEffect, useCallback, useMemo, useRef } from "react";
// // import { X, ChevronLeft, ChevronRight, Video } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { useTranslation } from "@/lib/translations";
// // import { getLightboxImageUrl, getThumbnailUrl } from "@/lib/imageOptimizer";

// // interface MediaLightboxProps {
// //   photos: string[];
// //   video?: string | null;
// //   initialIndex: number;
// //   isOpen: boolean;
// //   onClose: () => void;
// // }

// // export function MediaLightbox({
// //   photos,
// //   video,
// //   initialIndex,
// //   isOpen,
// //   onClose,
// // }: MediaLightboxProps) {
// //   const t = useTranslation();
// //   const [currentIndex, setCurrentIndex] = useState(initialIndex);
// //   const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
// //   const touchStartRef = useRef<number | null>(null);
// //   const touchEndRef = useRef<number | null>(null);

// //   // Zoom state
// //   const [isZoomed, setIsZoomed] = useState(false);
// //   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
// //   const lastTapRef = useRef<number>(0);
// //   const doubleTapPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
// //   const imageContainerRef = useRef<HTMLDivElement>(null);

// //   // Pan state when zoomed
// //   const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
// //   const panStartRef = useRef<{ x: number; y: number } | null>(null);
// //   const lastPanRef = useRef({ x: 0, y: 0 });

// //   const totalItems = photos.length + (video ? 1 : 0);
// //   const isVideoSlide = video && currentIndex === photos.length;

// //   // Memoize photo URLs to avoid recalculation - use optimized high quality for lightbox
// //   const photoUrls = useMemo(
// //     () => photos.map((photo) => getLightboxImageUrl(photo)),
// //     [photos]
// //   );

// //   // Thumbnail URLs for preloading indicator
// //   const thumbnailUrls = useMemo(
// //     () => photos.map((photo) => getThumbnailUrl(photo)),
// //     [photos]
// //   );

// //   // Preload adjacent images for instant switching
// //   useEffect(() => {
// //     if (!isOpen || photos.length === 0) return;

// //     const imagesToPreload: number[] = [];

// //     // Preload current, previous, and next images
// //     const indices = [
// //       currentIndex,
// //       (currentIndex - 1 + photos.length) % photos.length,
// //       (currentIndex + 1) % photos.length,
// //       // Also preload 2 ahead for faster swiping
// //       (currentIndex + 2) % photos.length,
// //     ];

// //     indices.forEach((idx) => {
// //       if (idx < photos.length && !loadedImages.has(idx)) {
// //         imagesToPreload.push(idx);
// //       }
// //     });

// //     imagesToPreload.forEach((idx) => {
// //       const img = new Image();
// //       img.onload = () => {
// //         setLoadedImages((prev) => new Set(prev).add(idx));
// //       };
// //       img.src = photoUrls[idx];
// //     });
// //   }, [currentIndex, isOpen, photos.length, photoUrls, loadedImages]);

// //   // Preload all images when lightbox opens
// //   useEffect(() => {
// //     if (!isOpen || photos.length === 0) return;

// //     // Preload all images in background after a short delay
// //     const timer = setTimeout(() => {
// //       photoUrls.forEach((url, idx) => {
// //         if (!loadedImages.has(idx)) {
// //           const img = new Image();
// //           img.onload = () => {
// //             setLoadedImages((prev) => new Set(prev).add(idx));
// //           };
// //           img.src = url;
// //         }
// //       });
// //     }, 300);

// //     return () => clearTimeout(timer);
// //   }, [isOpen, photoUrls, loadedImages, photos.length]);

// //   useEffect(() => {
// //     setCurrentIndex(initialIndex);
// //   }, [initialIndex, isOpen]);

// //   // Reset zoom when changing slides or closing
// //   useEffect(() => {
// //     setIsZoomed(false);
// //     setPanPosition({ x: 0, y: 0 });
// //     lastPanRef.current = { x: 0, y: 0 };
// //   }, [currentIndex, isOpen]);

// //   // Double tap handler for zoom toggle
// //   const handleDoubleTap = useCallback(
// //     (e: React.TouchEvent | React.MouseEvent) => {
// //       const now = Date.now();
// //       const DOUBLE_TAP_DELAY = 300;

// //       if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
// //         // Double tap detected
// //         e.preventDefault();
// //         e.stopPropagation();

// //         if (isZoomed) {
// //           // Zoom out
// //           setIsZoomed(false);
// //           setPanPosition({ x: 0, y: 0 });
// //           lastPanRef.current = { x: 0, y: 0 };
// //         } else {
// //           // Zoom in at tap position
// //           let clientX: number, clientY: number;
// //           if ("touches" in e) {
// //             clientX = e.touches[0]?.clientX || doubleTapPositionRef.current.x;
// //             clientY = e.touches[0]?.clientY || doubleTapPositionRef.current.y;
// //           } else {
// //             clientX = e.clientX;
// //             clientY = e.clientY;
// //           }

// //           // Calculate zoom origin relative to center of screen
// //           const centerX = window.innerWidth / 2;
// //           const centerY = window.innerHeight / 2;
// //           const offsetX = (centerX - clientX) * 1; // Offset to center zoom on tap point
// //           const offsetY = (centerY - clientY) * 1;

// //           setZoomPosition({ x: clientX, y: clientY });
// //           setPanPosition({ x: offsetX, y: offsetY });
// //           lastPanRef.current = { x: offsetX, y: offsetY };
// //           setIsZoomed(true);
// //         }
// //         lastTapRef.current = 0;
// //       } else {
// //         // Record tap for potential double tap
// //         lastTapRef.current = now;
// //         if ("touches" in e && e.touches[0]) {
// //           doubleTapPositionRef.current = {
// //             x: e.touches[0].clientX,
// //             y: e.touches[0].clientY,
// //           };
// //         } else if ("clientX" in e) {
// //           doubleTapPositionRef.current = { x: e.clientX, y: e.clientY };
// //         }
// //       }
// //     },
// //     [isZoomed]
// //   );

// //   useEffect(() => {
// //     if (isOpen) {
// //       document.body.style.overflow = "hidden";
// //     } else {
// //       document.body.style.overflow = "";
// //     }
// //     return () => {
// //       document.body.style.overflow = "";
// //     };
// //   }, [isOpen]);

// //   const handlePrev = useCallback(() => {
// //     setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
// //   }, [totalItems]);

// //   const handleNext = useCallback(() => {
// //     setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
// //   }, [totalItems]);

// //   useEffect(() => {
// //     const handleKeyDown = (e: KeyboardEvent) => {
// //       if (!isOpen) return;
// //       if (e.key === "Escape") onClose();
// //       if (e.key === "ArrowLeft") handlePrev();
// //       if (e.key === "ArrowRight") handleNext();
// //     };

// //     window.addEventListener("keydown", handleKeyDown);
// //     return () => window.removeEventListener("keydown", handleKeyDown);
// //   }, [isOpen, onClose, handlePrev, handleNext]);

// //   const minSwipeDistance = 50;

// //   // Use refs for touch handling to avoid re-renders during swipe
// //   const onTouchStart = useCallback(
// //     (e: React.TouchEvent) => {
// //       touchEndRef.current = null;
// //       touchStartRef.current = e.targetTouches[0].clientX;

// //       // Handle pan when zoomed
// //       if (isZoomed && e.touches.length === 1) {
// //         panStartRef.current = {
// //           x: e.touches[0].clientX,
// //           y: e.touches[0].clientY,
// //         };
// //       }
// //     },
// //     [isZoomed]
// //   );

// //   const onTouchMove = useCallback(
// //     (e: React.TouchEvent) => {
// //       touchEndRef.current = e.targetTouches[0].clientX;

// //       // Handle pan when zoomed
// //       if (isZoomed && panStartRef.current && e.touches.length === 1) {
// //         const deltaX = e.touches[0].clientX - panStartRef.current.x;
// //         const deltaY = e.touches[0].clientY - panStartRef.current.y;

// //         setPanPosition({
// //           x: lastPanRef.current.x + deltaX,
// //           y: lastPanRef.current.y + deltaY,
// //         });
// //       }
// //     },
// //     [isZoomed]
// //   );

// //   const onTouchEnd = useCallback(() => {
// //     // Save last pan position
// //     if (isZoomed && panStartRef.current) {
// //       lastPanRef.current = { ...panPosition };
// //       panStartRef.current = null;
// //     }

// //     // Only handle swipe when not zoomed
// //     if (!isZoomed) {
// //       if (!touchStartRef.current || !touchEndRef.current) return;
// //       const distance = touchStartRef.current - touchEndRef.current;
// //       const isLeftSwipe = distance > minSwipeDistance;
// //       const isRightSwipe = distance < -minSwipeDistance;
// //       if (isLeftSwipe) handleNext();
// //       if (isRightSwipe) handlePrev();
// //     }

// //     touchStartRef.current = null;
// //     touchEndRef.current = null;
// //   }, [handleNext, handlePrev, isZoomed, panPosition]);

// //   // Memoize thumbnail rendering
// //   const thumbnails = useMemo(() => {
// //     if (totalItems <= 1) return null;

// //     return (
// //       <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[10000] flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
// //         {photos.map((photo, index) => (
// //           <button
// //             key={`thumb-${index}`}
// //             onClick={(e) => {
// //               e.stopPropagation();
// //               setCurrentIndex(index);
// //             }}
// //             className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
// //               currentIndex === index
// //                 ? "border-primary ring-2 ring-primary/50"
// //                 : "border-transparent opacity-60 hover:opacity-100"
// //             }`}
// //             data-testid={`button-lightbox-thumb-${index}`}
// //           >
// //             <img
// //               src={photoUrls[index]}
// //               alt={`Thumbnail ${index + 1}`}
// //               className="w-full h-full object-cover"
// //               loading="lazy"
// //             />
// //           </button>
// //         ))}
// //         {video && (
// //           <button
// //             onClick={(e) => {
// //               e.stopPropagation();
// //               setCurrentIndex(photos.length);
// //             }}
// //             className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-black/80 ${
// //               currentIndex === photos.length
// //                 ? "border-primary ring-2 ring-primary/50"
// //                 : "border-transparent opacity-60 hover:opacity-100"
// //             }`}
// //             data-testid="button-lightbox-thumb-video"
// //           >
// //             <Video className="h-6 w-6 text-white" />
// //           </button>
// //         )}
// //       </div>
// //     );
// //   }, [photos, video, currentIndex, photoUrls, totalItems]);

// //   if (!isOpen) return null;

// //   return (
// //     <div
// //       className="fixed inset-0 z-[9999] bg-black"
// //       onClick={onClose}
// //       onTouchStart={onTouchStart}
// //       onTouchMove={onTouchMove}
// //       onTouchEnd={onTouchEnd}
// //     >
// //       {/* Preload hidden images - absolutely positioned, zero size, invisible */}
// //       <div
// //         style={{
// //           position: "absolute",
// //           width: 0,
// //           height: 0,
// //           overflow: "hidden",
// //           opacity: 0,
// //           pointerEvents: "none",
// //         }}
// //       >
// //         {photoUrls.map((url, idx) => (
// //           <img key={`preload-${idx}`} src={url} alt="" />
// //         ))}
// //       </div>

// //       {/* Close button - fixed top right corner */}
// //       <button
// //         style={{
// //           position: "fixed",
// //           top: "16px",
// //           right: "16px",
// //           left: "auto",
// //           zIndex: 10001,
// //           width: "48px",
// //           height: "48px",
// //           borderRadius: "50%",
// //           backgroundColor: "white",
// //           border: "none",
// //           boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
// //           display: "flex",
// //           alignItems: "center",
// //           justifyContent: "center",
// //           cursor: "pointer",
// //         }}
// //         onClick={(e) => {
// //           e.stopPropagation();
// //           onClose();
// //         }}
// //         data-testid="button-lightbox-close"
// //       >
// //         <X className="h-7 w-7 text-black" />
// //       </button>

// //       {/* Image/Video container */}
// //       <div
// //         ref={imageContainerRef}
// //         className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
// //         onClick={(e) => {
// //           e.stopPropagation();
// //           handleDoubleTap(e);
// //         }}
// //         onTouchEnd={(e) => {
// //           handleDoubleTap(e);
// //         }}
// //         style={{ touchAction: isZoomed ? "none" : "pan-x" }}
// //       >
// //         {isVideoSlide ? (
// //           <video
// //             src={`/objects/${video!.replace(/^\/+/, "")}`}
// //             controls
// //             autoPlay
// //             className="max-w-full max-h-full object-contain"
// //             data-testid="video-lightbox"
// //           />
// //         ) : (
// //           <img
// //             src={photoUrls[currentIndex]}
// //             alt={`Photo ${currentIndex + 1}`}
// //             className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
// //             draggable={false}
// //             style={{
// //               transform: isZoomed
// //                 ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${
// //                     panPosition.y / 2.5
// //                   }px)`
// //                 : "scale(1) translate(0, 0)",
// //             }}
// //             data-testid="img-lightbox"
// //           />
// //         )}
// //       </div>

// //       {/* Zoom indicator */}
// //       {isZoomed && (
// //         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
// //           {t("lightbox.zoomHint")}
// //         </div>
// //       )}

// //       {/* Navigation arrows - rendered AFTER image container so they're on top */}
// //       {totalItems > 1 && !isZoomed && (
// //         <>
// //           <button
// //             style={{
// //               position: "fixed",
// //               left: "16px",
// //               top: "50%",
// //               transform: "translateY(-50%)",
// //               zIndex: 10001,
// //               width: "56px",
// //               height: "56px",
// //               borderRadius: "50%",
// //               backgroundColor: "rgba(0, 0, 0, 0.4)",
// //               border: "1px solid rgba(255, 255, 255, 0.2)",
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               cursor: "pointer",
// //               transition: "background-color 0.2s ease",
// //             }}
// //             onMouseEnter={(e) =>
// //               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
// //             }
// //             onMouseLeave={(e) =>
// //               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
// //             }
// //             onClick={(e) => {
// //               e.stopPropagation();
// //               handlePrev();
// //             }}
// //             data-testid="button-lightbox-prev"
// //           >
// //             <ChevronLeft className="h-8 w-8 text-white" />
// //           </button>

// //           <button
// //             style={{
// //               position: "fixed",
// //               right: "16px",
// //               top: "50%",
// //               transform: "translateY(-50%)",
// //               zIndex: 10001,
// //               width: "56px",
// //               height: "56px",
// //               borderRadius: "50%",
// //               backgroundColor: "rgba(0, 0, 0, 0.4)",
// //               border: "1px solid rgba(255, 255, 255, 0.2)",
// //               display: "flex",
// //               alignItems: "center",
// //               justifyContent: "center",
// //               cursor: "pointer",
// //               transition: "background-color 0.2s ease",
// //             }}
// //             onMouseEnter={(e) =>
// //               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
// //             }
// //             onMouseLeave={(e) =>
// //               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
// //             }
// //             onClick={(e) => {
// //               e.stopPropagation();
// //               handleNext();
// //             }}
// //             data-testid="button-lightbox-next"
// //           >
// //             <ChevronRight className="h-8 w-8 text-white" />
// //           </button>
// //         </>
// //       )}

// //       {!isZoomed && (
// //         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
// //           {isVideoSlide && <Video className="h-4 w-4" />}
// //           <span>
// //             {currentIndex + 1} / {totalItems}
// //           </span>
// //         </div>
// //       )}

// //       {!isZoomed && thumbnails}
// //     </div>
// //   );
// // }
// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { X, ChevronLeft, ChevronRight, Video } from "lucide-react";
// import { useTranslation } from "@/lib/translations";
// import {
//   getCardImageUrl,
//   getFullImageUrl,
//   getThumbnailUrl,
//   getOptimizedImageUrl,
// } from "@/lib/imageOptimizer";
// import { ResponsiveImage } from "@/components/ResponsiveImage";

// interface MediaLightboxProps {
//   photos: string[];
//   video?: string | null;
//   initialIndex: number;
//   isOpen: boolean;
//   onClose: () => void;
// }

// const clamp = (n: number, min: number, max: number) =>
//   Math.max(min, Math.min(max, n));

// const DESKTOP_MIN_WIDTH = 1024; // >= 1024px апгрейдимо на full (ПК). Заміни на 768/640 якщо треба.

// export function MediaLightbox({
//   photos,
//   video,
//   initialIndex,
//   isOpen,
//   onClose,
// }: MediaLightboxProps) {
//   const t = useTranslation();

//   // Normalize keys (стабільні URL -> кращий кеш)
//   const photoKeys = useMemo(
//     () =>
//       (photos || [])
//         .filter((p): p is string => typeof p === "string" && p.trim() !== "")
//         .map((p) => p.replace(/^\/+/, "")),
//     [photos],
//   );

//   const videoKey = useMemo(() => {
//     if (!video || typeof video !== "string") return null;
//     const v = video.trim();
//     return v ? v.replace(/^\/+/, "") : null;
//   }, [video]);

//   const totalItems = photoKeys.length + (videoKey ? 1 : 0);

//   const [currentIndex, setCurrentIndex] = useState(0);

//   // ✅ MOBILE FIRST: спочатку рендеримо мобільний src, потім (на ПК) робимо upgrade
//   const [allowUpgrade, setAllowUpgrade] = useState(false);

//   // Zoom + pan
//   const [isZoomed, setIsZoomed] = useState(false);
//   const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });

//   const lastTapRef = useRef<number>(0);
//   const lastTapPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

//   // Swipe refs
//   const touchStartRef = useRef<{ x: number; y: number; t: number } | null>(
//     null,
//   );
//   const touchEndRef = useRef<{ x: number; y: number } | null>(null);

//   // Pan refs (smooth via rAF)
//   const panStartRef = useRef<{ x: number; y: number } | null>(null);
//   const lastPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const panTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
//   const panRafRef = useRef<number | null>(null);

//   // Preload refs
//   const loadedSmallRef = useRef<Set<number>>(new Set());
//   const loadedFullRef = useRef<Set<number>>(new Set());

//   const isVideoSlide = !!videoKey && currentIndex === photoKeys.length;

//   const safePhotoIndex = useMemo(() => {
//     if (photoKeys.length === 0) return 0;
//     return clamp(currentIndex, 0, photoKeys.length - 1);
//   }, [currentIndex, photoKeys.length]);

//   const currentKey = photoKeys[safePhotoIndex]; // може бути undefined якщо нема фото

//   const thumbnailUrls = useMemo(
//     () => photoKeys.map((k) => getThumbnailUrl(k)),
//     [photoKeys],
//   );

//   // Init index on open
//   useEffect(() => {
//     if (!isOpen) return;

//     const safe = clamp(initialIndex ?? 0, 0, Math.max(0, totalItems - 1));
//     setCurrentIndex(safe);

//     // reset zoom/pan
//     setIsZoomed(false);
//     setPanPosition({ x: 0, y: 0 });
//     lastPanRef.current = { x: 0, y: 0 };

//     // ✅ важливо: Mobile-first (перший кадр без апгрейду)
//     setAllowUpgrade(false);
//     const raf = window.requestAnimationFrame(() => {
//       // другий кадр — дозволяємо ResponsiveImage перевірити ширину і апгрейдити на ПК
//       setAllowUpgrade(true);
//     });

//     return () => window.cancelAnimationFrame(raf);
//   }, [isOpen, initialIndex, totalItems]);

//   // Lock body scroll
//   useEffect(() => {
//     if (!isOpen) return;
//     const prev = document.body.style.overflow;
//     document.body.style.overflow = "hidden";
//     return () => {
//       document.body.style.overflow = prev || "";
//     };
//   }, [isOpen]);

//   // Reset zoom on slide change
//   useEffect(() => {
//     if (!isOpen) return;
//     setIsZoomed(false);
//     setPanPosition({ x: 0, y: 0 });
//     lastPanRef.current = { x: 0, y: 0 };

//     // ✅ знов mobile-first при перемиканні слайду
//     setAllowUpgrade(false);
//     const raf = window.requestAnimationFrame(() => setAllowUpgrade(true));
//     return () => window.cancelAnimationFrame(raf);
//   }, [currentIndex, isOpen]);

//   const handlePrev = useCallback(() => {
//     setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
//   }, [totalItems]);

//   const handleNext = useCallback(() => {
//     setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
//   }, [totalItems]);

//   // Keyboard
//   useEffect(() => {
//     const onKey = (e: KeyboardEvent) => {
//       if (!isOpen) return;
//       if (e.key === "Escape") onClose();
//       if (e.key === "ArrowLeft") handlePrev();
//       if (e.key === "ArrowRight") handleNext();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [isOpen, onClose, handlePrev, handleNext]);

//   // Preload neighbors (small always), full only on desktop + allowUpgrade
//   useEffect(() => {
//     if (!isOpen) return;
//     if (photoKeys.length === 0) return;

//     const idx = clamp(currentIndex, 0, photoKeys.length - 1);
//     const candidates = [idx, idx - 1, idx + 1].filter(
//       (i) => i >= 0 && i < photoKeys.length,
//     );

//     const runSmall = () => {
//       for (const i of candidates) {
//         if (loadedSmallRef.current.has(i)) continue;
//         const img = new Image();
//         img.src = getCardImageUrl(photoKeys[i]);
//         img.onload = () => loadedSmallRef.current.add(i);
//       }
//     };

//     const runFull = () => {
//       // тільки якщо реально є сенс вантажити full
//       if (!allowUpgrade) return;
//       if (typeof window === "undefined") return;
//       if (window.innerWidth < DESKTOP_MIN_WIDTH) return;

//       for (const i of candidates) {
//         if (loadedFullRef.current.has(i)) continue;
//         const img = new Image();
//         img.src = getFullImageUrl(photoKeys[i]);
//         img.onload = () => loadedFullRef.current.add(i);
//       }
//     };

//     // @ts-ignore
//     if (window.requestIdleCallback) {
//       // @ts-ignore
//       const id = window.requestIdleCallback(
//         () => {
//           runSmall();
//           runFull();
//         },
//         { timeout: 250 },
//       );
//       return () => {
//         // @ts-ignore
//         window.cancelIdleCallback?.(id);
//       };
//     }

//     const tm = window.setTimeout(() => {
//       runSmall();
//       runFull();
//     }, 60);

//     return () => window.clearTimeout(tm);
//   }, [isOpen, currentIndex, photoKeys, allowUpgrade]);

//   const setPanSmooth = useCallback((x: number, y: number) => {
//     panTargetRef.current = { x, y };
//     if (panRafRef.current) return;

//     panRafRef.current = window.requestAnimationFrame(() => {
//       panRafRef.current = null;
//       setPanPosition(panTargetRef.current);
//     });
//   }, []);

//   const zoomInAt = useCallback((clientX: number, clientY: number) => {
//     const centerX = window.innerWidth / 2;
//     const centerY = window.innerHeight / 2;

//     const offsetX = (centerX - clientX) * 1;
//     const offsetY = (centerY - clientY) * 1;

//     setIsZoomed(true);
//     setPanPosition({ x: offsetX, y: offsetY });
//     lastPanRef.current = { x: offsetX, y: offsetY };
//   }, []);

//   const zoomOut = useCallback(() => {
//     setIsZoomed(false);
//     setPanPosition({ x: 0, y: 0 });
//     lastPanRef.current = { x: 0, y: 0 };
//   }, []);

//   const handleTap = useCallback(
//     (clientX: number, clientY: number) => {
//       const now = Date.now();
//       const DOUBLE_TAP_DELAY = 280;

//       if (now - lastTapRef.current < DOUBLE_TAP_DELAY) {
//         lastTapRef.current = 0;
//         if (isZoomed) zoomOut();
//         else zoomInAt(clientX, clientY);
//         return;
//       }

//       lastTapRef.current = now;
//       lastTapPosRef.current = { x: clientX, y: clientY };
//     },
//     [isZoomed, zoomInAt, zoomOut],
//   );

//   const minSwipeDistance = 50;

//   const onTouchStart = useCallback(
//     (e: React.TouchEvent) => {
//       if (!isOpen) return;
//       const t0 = e.touches[0];
//       touchStartRef.current = { x: t0.clientX, y: t0.clientY, t: Date.now() };
//       touchEndRef.current = null;

//       if (isZoomed && e.touches.length === 1) {
//         panStartRef.current = { x: t0.clientX, y: t0.clientY };
//       }
//     },
//     [isOpen, isZoomed],
//   );

//   const onTouchMove = useCallback(
//     (e: React.TouchEvent) => {
//       if (!isOpen) return;
//       const t0 = e.touches[0];
//       touchEndRef.current = { x: t0.clientX, y: t0.clientY };

//       if (isZoomed && panStartRef.current && e.touches.length === 1) {
//         const dx = t0.clientX - panStartRef.current.x;
//         const dy = t0.clientY - panStartRef.current.y;
//         setPanSmooth(lastPanRef.current.x + dx, lastPanRef.current.y + dy);
//       }
//     },
//     [isOpen, isZoomed, setPanSmooth],
//   );

//   const onTouchEnd = useCallback(() => {
//     if (!isOpen) return;

//     if (isZoomed && panStartRef.current) {
//       lastPanRef.current = { ...panTargetRef.current };
//       panStartRef.current = null;
//     }

//     const start = touchStartRef.current;
//     const end = touchEndRef.current;
//     touchStartRef.current = null;
//     touchEndRef.current = null;

//     if (!start || !end) return;

//     const dx = start.x - end.x;
//     const dy = start.y - end.y;

//     const absDx = Math.abs(dx);
//     const absDy = Math.abs(dy);

//     if (isZoomed) return;

//     const isSwipe = absDx > minSwipeDistance && absDx > absDy;
//     if (isSwipe) {
//       if (dx > 0) handleNext();
//       else handlePrev();
//       return;
//     }

//     const isTap = absDx < 10 && absDy < 10;
//     if (isTap) handleTap(end.x, end.y);
//   }, [isOpen, isZoomed, handleNext, handlePrev, handleTap]);

//   const onDoubleClick = useCallback(
//     (e: React.MouseEvent) => {
//       e.preventDefault();
//       e.stopPropagation();
//       if (isVideoSlide) return;
//       if (isZoomed) zoomOut();
//       else zoomInAt(e.clientX, e.clientY);
//     },
//     [isZoomed, isVideoSlide, zoomInAt, zoomOut],
//   );

//   const onSingleClick = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation();
//       if (isVideoSlide) return;
//       handleTap(e.clientX, e.clientY);
//     },
//     [handleTap, isVideoSlide],
//   );

//   const thumbnails = useMemo(() => {
//     if (totalItems <= 1) return null;

//     return (
//       <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-[10000] flex gap-2 max-w-[90vw] overflow-x-auto py-2 px-4">
//         {photoKeys.map((key, index) => (
//           <button
//             key={`thumb-${key}-${index}`}
//             onClick={(e) => {
//               e.stopPropagation();
//               setCurrentIndex(index);
//             }}
//             className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all ${
//               currentIndex === index
//                 ? "border-primary ring-2 ring-primary/50"
//                 : "border-transparent opacity-60 hover:opacity-100"
//             }`}
//             data-testid={`button-lightbox-thumb-${index}`}
//           >
//             <img
//               src={thumbnailUrls[index]}
//               alt={`Thumbnail ${index + 1}`}
//               className="w-full h-full object-cover"
//               loading="lazy"
//               decoding="async"
//             />
//           </button>
//         ))}

//         {videoKey && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setCurrentIndex(photoKeys.length);
//             }}
//             className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center bg-black/80 ${
//               currentIndex === photoKeys.length
//                 ? "border-primary ring-2 ring-primary/50"
//                 : "border-transparent opacity-60 hover:opacity-100"
//             }`}
//             data-testid="button-lightbox-thumb-video"
//           >
//             <Video className="h-6 w-6 text-white" />
//           </button>
//         )}
//       </div>
//     );
//   }, [totalItems, photoKeys, thumbnailUrls, videoKey, currentIndex]);

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 z-[9999] bg-black"
//       onClick={onClose}
//       onTouchStart={onTouchStart}
//       onTouchMove={onTouchMove}
//       onTouchEnd={onTouchEnd}
//     >
//       {/* Close button */}
//       <button
//         style={{
//           position: "fixed",
//           top: "16px",
//           right: "16px",
//           left: "auto",
//           zIndex: 10001,
//           width: "48px",
//           height: "48px",
//           borderRadius: "50%",
//           backgroundColor: "white",
//           border: "none",
//           boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           cursor: "pointer",
//         }}
//         onClick={(e) => {
//           e.stopPropagation();
//           onClose();
//         }}
//         data-testid="button-lightbox-close"
//       >
//         <X className="h-7 w-7 text-black" />
//       </button>

//       {/* Media container */}
//       <div
//         className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
//         onClick={onSingleClick}
//         onDoubleClick={onDoubleClick}
//         style={{ touchAction: isZoomed ? "none" : "pan-x" }}
//       >
//         {isVideoSlide ? (
//           <video
//             src={`/objects/${videoKey!}`}
//             controls
//             autoPlay
//             className="max-w-full max-h-full object-contain"
//             data-testid="video-lightbox"
//             onClick={(e) => e.stopPropagation()}
//           />
//         ) : currentKey ? (
//           <ResponsiveImage
//             // ✅ на мобільних даємо реально “лайтбокс” розмір, не “card”
//             mobileSrc={getOptimizedImageUrl(currentKey, {
//               width: 1000,
//               quality: 82,
//               format: "webp",
//             })}
//             // ✅ на десктопі ще трохи більше (або лишай full)
//             desktopSrc={getOptimizedImageUrl(currentKey, {
//               width: 2400,
//               quality: 88,
//               format: "webp",
//             })}
//             desktopMinWidth={DESKTOP_MIN_WIDTH}
//             upgrade={allowUpgrade}
//             alt={`Photo ${currentIndex + 1}`}
//             className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
//             draggable={false}
//             style={{
//               transform: isZoomed
//                 ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
//                 : "scale(1) translate(0, 0)",
//             }}
//             data-testid="img-lightbox"
//             onClick={(e) => e.stopPropagation()}
//           />
//         ) : null}
//       </div>

//       {/* Zoom indicator */}
//       {isZoomed && (
//         <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium">
//           {t("lightbox.zoomHint")}
//         </div>
//       )}

//       {/* Navigation arrows */}
//       {totalItems > 1 && !isZoomed && (
//         <>
//           <button
//             style={{
//               position: "fixed",
//               left: "16px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               zIndex: 10001,
//               width: "56px",
//               height: "56px",
//               borderRadius: "50%",
//               backgroundColor: "rgba(0, 0, 0, 0.4)",
//               border: "1px solid rgba(255, 255, 255, 0.2)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               transition: "background-color 0.2s ease",
//             }}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
//             }
//             onClick={(e) => {
//               e.stopPropagation();
//               handlePrev();
//             }}
//             data-testid="button-lightbox-prev"
//           >
//             <ChevronLeft className="h-8 w-8 text-white" />
//           </button>

//           <button
//             style={{
//               position: "fixed",
//               right: "16px",
//               top: "50%",
//               transform: "translateY(-50%)",
//               zIndex: 10001,
//               width: "56px",
//               height: "56px",
//               borderRadius: "50%",
//               backgroundColor: "rgba(0, 0, 0, 0.4)",
//               border: "1px solid rgba(255, 255, 255, 0.2)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//               transition: "background-color 0.2s ease",
//             }}
//             onMouseEnter={(e) =>
//               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.6)")
//             }
//             onMouseLeave={(e) =>
//               (e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.4)")
//             }
//             onClick={(e) => {
//               e.stopPropagation();
//               handleNext();
//             }}
//             data-testid="button-lightbox-next"
//           >
//             <ChevronRight className="h-8 w-8 text-white" />
//           </button>
//         </>
//       )}

//       {/* Counter */}
//       {!isZoomed && (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10000] bg-black/60 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
//           {isVideoSlide && <Video className="h-4 w-4" />}
//           <span>
//             {currentIndex + 1} / {totalItems}
//           </span>
//         </div>
//       )}

//       {!isZoomed && thumbnails}
//     </div>
//   );
// }
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { X, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { useTranslation } from "@/lib/translations";
import { getThumbnailUrl, getOptimizedImageUrl } from "@/lib/imageOptimizer";
import { ResponsiveImage } from "@/components/ResponsiveImage";

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

// ✅ Тюнінг під швидкість/якість
const MOBILE_MAX_W = 1200; // не роздуваємо мобільні
const MOBILE_Q = 78; // швидко, майже без втрат у webp
const DESKTOP_W = 2400; // або 2000 якщо хочеш ще швидше
const DESKTOP_Q = 86;

export function MediaLightbox({
  photos,
  video,
  initialIndex,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  const t = useTranslation();

  // Normalize keys (стабільні URL -> кращий кеш)
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

  // ✅ mobile-first: desktop апгрейд тільки після першого кадру (без “мигання”)
  const [allowUpgrade, setAllowUpgrade] = useState(false);

  // ✅ розумна ширина для мобільних з урахуванням DPR
  const [mobileW, setMobileW] = useState(1000);

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

  // Preload refs
  const loadedMobileRef = useRef<Set<number>>(new Set());
  const loadedDesktopRef = useRef<Set<number>>(new Set());

  const isVideoSlide = !!videoKey && currentIndex === photoKeys.length;

  const safePhotoIndex = useMemo(() => {
    if (photoKeys.length === 0) return 0;
    return clamp(currentIndex, 0, photoKeys.length - 1);
  }, [currentIndex, photoKeys.length]);

  const currentKey = photoKeys[safePhotoIndex];

  const thumbnailUrls = useMemo(
    () => photoKeys.map((k) => getThumbnailUrl(k)),
    [photoKeys],
  );

  // ✅ URL генератори: важливо щоб preload грів ТІ Ж URL, що показуються
  const getMobileUrl = useCallback(
    (key: string) =>
      getOptimizedImageUrl(key, {
        width: mobileW,
        quality: MOBILE_Q,
        format: "webp",
      }),
    [mobileW],
  );

  const getDesktopUrl = useCallback(
    (key: string) =>
      getOptimizedImageUrl(key, {
        width: DESKTOP_W,
        quality: DESKTOP_Q,
        format: "webp",
      }),
    [],
  );

  // Init index on open + mobileW
  useEffect(() => {
    if (!isOpen) return;

    const safe = clamp(initialIndex ?? 0, 0, Math.max(0, totalItems - 1));
    setCurrentIndex(safe);

    // reset zoom/pan
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };

    // ✅ мобільна ширина під DPR
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = Math.min(MOBILE_MAX_W, Math.round(window.innerWidth * dpr));
    setMobileW(w);

    // ✅ дозволяємо desktop-upgrade лише після першого кадру
    setAllowUpgrade(false);
    const raf = window.requestAnimationFrame(() => setAllowUpgrade(true));
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, initialIndex, totalItems]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [isOpen]);

  // Reset zoom on slide change (без allowUpgrade toggle — менше ререндерів)
  useEffect(() => {
    if (!isOpen) return;
    setIsZoomed(false);
    setPanPosition({ x: 0, y: 0 });
    lastPanRef.current = { x: 0, y: 0 };
  }, [currentIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
  }, [totalItems]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
  }, [totalItems]);

  // Keyboard
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

  // ✅ PRELOAD: гріємо ОДРАЗУ next/prev тим же URL + decode()
  useEffect(() => {
    if (!isOpen) return;
    if (photoKeys.length === 0) return;

    const idx = clamp(currentIndex, 0, photoKeys.length - 1);

    const neighbors = [idx - 1, idx + 1].filter(
      (i) => i >= 0 && i < photoKeys.length,
    );

    const preload = (url: string, onDone: () => void) => {
      const img = new Image();
      // @ts-ignore
      img.decoding = "async";
      img.src = url;

      // decode знімає “лаг” у момент підміни src (де підтримується)
      // @ts-ignore
      img.decode?.().catch(() => {});
      img.onload = onDone;
    };

    // mobile URLs — завжди
    for (const i of neighbors) {
      if (loadedMobileRef.current.has(i)) continue;
      const url = getMobileUrl(photoKeys[i]);
      preload(url, () => loadedMobileRef.current.add(i));
    }

    // desktop URLs — тільки якщо реально десктоп і upgrade дозволений
    if (
      allowUpgrade &&
      typeof window !== "undefined" &&
      window.innerWidth >= DESKTOP_MIN_WIDTH
    ) {
      const desktopCandidates = [idx, ...neighbors].filter(
        (i) => i >= 0 && i < photoKeys.length,
      );

      for (const i of desktopCandidates) {
        if (loadedDesktopRef.current.has(i)) continue;
        const url = getDesktopUrl(photoKeys[i]);
        preload(url, () => loadedDesktopRef.current.add(i));
      }
    }
  }, [
    isOpen,
    currentIndex,
    photoKeys,
    allowUpgrade,
    getMobileUrl,
    getDesktopUrl,
  ]);

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
          <ResponsiveImage
            // ✅ mobile-first + стабільні параметри + preload сусідів цими ж URL
            mobileSrc={getMobileUrl(currentKey)}
            desktopSrc={getDesktopUrl(currentKey)}
            desktopMinWidth={DESKTOP_MIN_WIDTH}
            upgrade={allowUpgrade}
            alt={`Photo ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            draggable={false}
            // якщо ResponsiveImage прокидує пропси в <img />
            // @ts-ignore
            decoding="async"
            // @ts-ignore
            loading="eager"
            style={{
              transform: isZoomed
                ? `scale(2.5) translate(${panPosition.x / 2.5}px, ${panPosition.y / 2.5}px)`
                : "scale(1) translate(0, 0)",
              willChange: isZoomed ? "transform" : undefined,
            }}
            data-testid="img-lightbox"
            onClick={(e) => e.stopPropagation()}
          />
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
    </div>
  );
}
