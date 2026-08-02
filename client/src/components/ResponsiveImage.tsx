import React, { useLayoutEffect, useState } from "react";

type ResponsiveImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  mobileSrc: string;
  desktopSrc: string;
  /** default: 1024 (Tailwind lg) */
  desktopMinWidth?: number;
  /** Якщо false — завжди лишається mobile */
  upgrade?: boolean;
};

const loadedDesktop = new Set<string>();

function isDesktopViewport(minWidth: number): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${minWidth}px)`).matches;
}

export function ResponsiveImage({
  mobileSrc,
  desktopSrc,
  desktopMinWidth = 1024,
  upgrade = true,
  ...imgProps
}: ResponsiveImageProps) {
  // Always start on mobileSrc so SSR + hydration match. layoutEffect upgrades
  // to desktop before paint — skips waiting on a second Image() preload.
  const [src, setSrc] = useState(mobileSrc);

  useLayoutEffect(() => {
    if (!upgrade) {
      setSrc(mobileSrc);
      return;
    }
    if (!isDesktopViewport(desktopMinWidth)) {
      setSrc(mobileSrc);
      return;
    }
    setSrc(desktopSrc);
    if (!loadedDesktop.has(desktopSrc)) {
      loadedDesktop.add(desktopSrc);
    }
  }, [mobileSrc, desktopSrc, desktopMinWidth, upgrade]);

  return <img {...imgProps} src={src} />;
}
