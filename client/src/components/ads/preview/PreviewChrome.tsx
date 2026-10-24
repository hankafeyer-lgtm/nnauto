"use client";

import { cn } from "@/lib/utils";
import type { PreviewDevice } from "./preview-types";

/** Lightweight NNAuto chrome for constructor preview only (not production Header). */
export function PreviewHeader({ device }: { device: PreviewDevice }) {
  return (
    <header className="border-b bg-white">
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2.5",
          device === "mobile" ? "gap-1.5" : "gap-3",
        )}
      >
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
            N
          </span>
          <span className="text-sm font-semibold tracking-tight">
            <span className="text-[#B8860B]">NN</span>Auto
          </span>
        </div>
        {device !== "mobile" ? (
          <div className="h-8 flex-1 rounded-full border bg-[#f7f3ea] px-3 text-[11px] leading-8 text-muted-foreground">
            Hledat automobily…
          </div>
        ) : (
          <div className="h-7 flex-1 rounded-full border bg-[#f7f3ea]" />
        )}
        {device === "desktop" ? (
          <span className="shrink-0 rounded-lg bg-[#B8860B] px-3 py-1.5 text-[11px] font-semibold text-white">
            + Přidat inzerát
          </span>
        ) : null}
      </div>
    </header>
  );
}

export function PreviewFooter() {
  return (
    <footer className="mt-6 border-t bg-white px-3 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span>
          <span className="font-semibold text-foreground">
            <span className="text-[#B8860B]">NN</span>Auto
          </span>{" "}
          · Marketplace automobilů
        </span>
        <span>Preview režim konstruktoru</span>
      </div>
    </footer>
  );
}
