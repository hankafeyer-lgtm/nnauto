import { redirect } from "next/navigation";

/** Statistiky sloučeny do Přehledu — uživatelský kabinet. */
export default function StatsRoute() {
  redirect("/business/advertising/prehled");
}
