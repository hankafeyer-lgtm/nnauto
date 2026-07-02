import { useEffect, useState } from "react";

export function useIsAndroidDevice(): boolean {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent || "";
    const detected = /Android/i.test(ua);
    setIsAndroid(detected);
    document.documentElement.classList.toggle("android", detected);

    return () => {
      document.documentElement.classList.remove("android");
    };
  }, []);

  return isAndroid;
}
