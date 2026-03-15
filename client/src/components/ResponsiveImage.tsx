import React, { useEffect, useMemo, useState } from "react";

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

export function ResponsiveImage({
  mobileSrc,
  desktopSrc,
  desktopMinWidth = 1024,
  upgrade = true,
  ...imgProps
}: ResponsiveImageProps) {
  // ✅ default: mobile first
  const [src, setSrc] = useState(mobileSrc);

  // якщо картинка змінилась — знову стартуємо з mobile
  useEffect(() => {
    setSrc(mobileSrc);
  }, [mobileSrc]);

  const shouldUseDesktop = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${desktopMinWidth}px)`).matches;
  }, [desktopMinWidth]);

  useEffect(() => {
    if (!upgrade) return;
    if (typeof window === "undefined") return;

    // якщо не ПК — лишаємось на mobile
    if (!shouldUseDesktop) return;

    // якщо desktop вже кешований — просто ставимо
    if (loadedDesktop.has(desktopSrc)) {
      setSrc(desktopSrc);
      return;
    }

    // ✅ preload desktop і лише після onload міняємо src
    let cancelled = false;
    const img = new Image();
    img.decoding = "async";
    img.src = desktopSrc;

    img.onload = () => {
      if (cancelled) return;
      loadedDesktop.add(desktopSrc);
      setSrc(desktopSrc);
    };

    return () => {
      cancelled = true;
    };
  }, [desktopSrc, shouldUseDesktop, upgrade]);

  return <img {...imgProps} src={src} />;
}
