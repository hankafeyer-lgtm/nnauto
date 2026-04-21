"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      console.error("[nnauto] global error:", error);
    } catch {}
  }, [error]);

  const hardReload = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch {
      reset();
    }
  };

  return (
    <html lang="cs-CZ">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#f7f3ea",
          color: "#2a1f0f",
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 12 }}>
            Stránka se nenačetla
          </h1>
          <p style={{ color: "#6b5a2a", marginBottom: 20 }}>
            Došlo k neočekávané chybě. Zkuste stránku obnovit.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.12)",
                background: "white",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Zkusit znovu
            </button>
            <button
              type="button"
              onClick={hardReload}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "1px solid #B8860B",
                background: "#B8860B",
                color: "white",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Obnovit stránku
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
