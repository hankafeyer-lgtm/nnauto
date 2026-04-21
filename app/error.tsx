"use client";

import { useEffect } from "react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      console.error("[nnauto] route error:", error);
    } catch {}
  }, [error]);

  const hardReload = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.replace(window.location.pathname + window.location.search);
      }
    } catch {
      reset();
    }
  };

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        textAlign: "center",
        fontFamily:
          "var(--font-poppins), Poppins, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "22px", fontWeight: 600, marginBottom: "12px" }}>
        Něco se pokazilo
      </h1>
      <p style={{ color: "#6b7280", marginBottom: "20px", maxWidth: "420px" }}>
        Stránku se nepodařilo zobrazit. Zkuste to prosím znovu.
      </p>
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid rgba(0,0,0,0.12)",
            background: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Zkusit znovu
        </button>
        <button
          type="button"
          onClick={hardReload}
          style={{
            padding: "10px 18px",
            borderRadius: "10px",
            border: "1px solid #B8860B",
            background: "#B8860B",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Obnovit stránku
        </button>
      </div>
    </div>
  );
}
