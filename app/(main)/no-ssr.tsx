"use client";

import { useEffect, useState, type ReactNode } from "react";

function DefaultFallback() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      aria-label="Načítání"
    >
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "3px solid rgba(184,134,11,0.25)",
          borderTopColor: "#B8860B",
          borderRadius: "50%",
          animation: "nnSpin 1s linear infinite",
        }}
      />
      <style>
        {`@keyframes nnSpin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

export function NoSSR({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    try {
      (window as unknown as { __nn_mounted?: boolean }).__nn_mounted = true;
    } catch {
      /* ignore */
    }
  }, []);
  if (!mounted) return <>{fallback ?? <DefaultFallback />}</>;
  return <>{children}</>;
}
