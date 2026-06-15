"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

export default function BackToCabinetButton({ ownerId }: { ownerId: string }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  // Show the button when the dealer opened their own public profile from the
  // cabinet (?from=cabinet) or when the signed-in viewer is a dealer.
  // The link only opens /dealer (auth-gated), so it's safe.
  void ownerId;
  const fromCabinet = searchParams?.get("from") === "cabinet";
  const isDealer = !!user?.isDealer;

  if (!fromCabinet && !isDealer) {
    return null;
  }

  return (
    <Link
      href="/dealer"
      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-white px-4 text-sm font-black text-[#5c3b10] shadow-[0_10px_24px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#33220c] motion-safe:animate-attention"
      aria-label="Zpět do kabinetu"
    >
      <ArrowLeft className="h-4 w-4" />
      Zpět do kabinetu
    </Link>
  );
}
