"use client";

import dynamic from "next/dynamic";

const BuyerMessagesPage = dynamic(
  () => import("@/pages/BuyerMessagesPage"),
  { ssr: false, loading: () => <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" /></div> },
);

export default function ZpravyClient() {
  return <BuyerMessagesPage />;
}
