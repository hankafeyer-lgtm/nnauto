"use client";

import { useEffect } from "react";

type GtagFn = (
  command: string,
  eventName: string,
  params?: Record<string, unknown>,
) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
  }
}

/** Sends Core Web Vitals to GA4 for Search Console CWV reporting. */
export default function WebVitalsReporter() {
  useEffect(() => {
    void import("web-vitals").then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
      const report = (metric: {
        name: string;
        value: number;
        id: string;
        rating?: string;
      }) => {
        if (typeof window.gtag !== "function") return;
        window.gtag("event", metric.name, {
          value: Math.round(
            metric.name === "CLS" ? metric.value * 1000 : metric.value,
          ),
          event_category: "Web Vitals",
          event_label: metric.id,
          metric_rating: metric.rating,
          non_interaction: true,
        });
      };
      onCLS(report);
      onINP(report);
      onLCP(report);
      onFCP(report);
      onTTFB(report);
    });
  }, []);

  return null;
}
