"use client";

import Footer from "@/components/Footer";
import { NoSSR } from "../../../no-ssr";

export default function ModelFooter() {
  return (
    <NoSSR>
      <Footer />
    </NoSSR>
  );
}
