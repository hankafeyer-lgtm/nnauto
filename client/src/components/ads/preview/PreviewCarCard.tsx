"use client";

import { cn } from "@/lib/utils";
import { formatPreviewCzk, type PreviewCar } from "./preview-types";

export function PreviewCarCard({
  car,
  className,
}: {
  car: PreviewCar;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border bg-white shadow-sm",
        className,
      )}
    >
      <div className="relative aspect-[16/10] bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={car.image}
          alt={`${car.brand} ${car.model}`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {car.top ? (
          <span className="absolute right-2 top-2 rounded-md bg-[#B8860B] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            ★ TOP
          </span>
        ) : null}
      </div>
      <div className="space-y-1 p-3">
        <h3 className="text-sm font-semibold leading-snug">
          {car.brand} {car.model}
        </h3>
        <p className="text-base font-bold text-[#B8860B]">
          {formatPreviewCzk(car.price)}
        </p>
        <p className="text-[11px] text-muted-foreground">
          {car.year} · {car.mileage.toLocaleString("cs-CZ")} km · {car.fuel} ·{" "}
          {car.city}
        </p>
      </div>
    </article>
  );
}
