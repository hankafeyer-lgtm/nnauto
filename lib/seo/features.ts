/**
 * Central SEO feature flags — flip any block off without code surgery.
 *
 * Master rollback (visible SEO UI only):
 *   SEO_FEATURES.classicUI = true
 *   SEO_FEATURES.enableSeoUi = false
 *   NEXT_PUBLIC_CLASSIC_UI=true
 *   NEXT_PUBLIC_SEO_ENABLE_UI=false
 *
 * Per-flag env override: NEXT_PUBLIC_SEO_FEATURE_<KEY>=false
 * e.g. NEXT_PUBLIC_SEO_FEATURE_BRAND_FAQ=false
 */

export const SEO_FEATURES = {
  /**
   * Master: production-like UI — disables all new visible SEO blocks at once.
   * Technical SEO (metadata, JSON-LD, canonical, sitemap) is unaffected.
   */
  classicUI: false,
  /** Master inverse of classicUI — set false to hide all new SEO UI. */
  enableSeoUi: true,
  /** Homepage «Prozkoumat katalog» hub chips */
  homepageExploreSection: true,
  /** Homepage bottom sections: brands, models, recent, top searches */
  homepageSeoBlocks: true,
  /** Brand long intro paragraphs + «Proč si vybrat» + stats */
  brandSeoIntro: true,
  brandFaq: true,
  brandCategories: true,
  brandNewestCars: true,
  /** Model intro paragraphs + why-buy / watch-out prose */
  modelSeoIntro: true,
  modelFaq: true,
  modelCategories: true,
  modelRelatedModels: true,
  /** SSR clip summary for crawlers on listing detail */
  listingSeoSummary: true,
  /** Similar cars grid + «Související nabídky» chips */
  listingRelatedOffers: true,
  /** Breadcrumb with «Auta» level (listing detail desktop nav) */
  listingBreadcrumbExtended: true,
  /** /auta/diesel, /auta/bmw/suv, etc. */
  facetPages: true,
  /** /auta index hub */
  autoHub: true,
  /** Master switch for long-form prose (home, listings footer, model legacy, «O tomto voze») */
  seoTexts: true,
} as const;

export type SeoFeatureKey = keyof typeof SEO_FEATURES;

type MasterSwitchKey = "classicUI" | "enableSeoUi";
export type SeoUiFeatureKey = Exclude<SeoFeatureKey, MasterSwitchKey>;

const ENV_PREFIX = "NEXT_PUBLIC_SEO_FEATURE_";

function parseEnvBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined || raw === "") return undefined;
  if (raw === "true" || raw === "1") return true;
  if (raw === "false" || raw === "0") return false;
  return undefined;
}

function envOverride(key: SeoUiFeatureKey): boolean | undefined {
  const envKey = `${ENV_PREFIX}${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`;
  const raw = process.env[envKey];
  if (raw === undefined || raw === "") return undefined;
  return raw !== "false" && raw !== "0";
}

function readClassicUiFromEnv(): boolean | undefined {
  return parseEnvBool(process.env.NEXT_PUBLIC_CLASSIC_UI);
}

function readEnableSeoUiFromEnv(): boolean | undefined {
  return parseEnvBool(process.env.NEXT_PUBLIC_SEO_ENABLE_UI);
}

/**
 * Master gate for visible SEO UI. When false, all `isSeoUiFeatureEnabled` checks fail.
 * Does not affect metadata, JSON-LD, canonical, robots, or sitemap.
 */
export function isSeoUiEnabled(): boolean {
  const envClassic = readClassicUiFromEnv();
  if (envClassic === true) return false;

  const envEnable = readEnableSeoUiFromEnv();
  if (envEnable === false) return false;

  const classicUi = envClassic ?? SEO_FEATURES.classicUI;
  if (classicUi) return false;

  const enableSeoUi = envEnable ?? SEO_FEATURES.enableSeoUi;
  return enableSeoUi;
}

/** Individual flag value — ignores classicUI / enableSeoUi (for technical SEO). */
export function isSeoFeatureConfigured(key: SeoUiFeatureKey): boolean {
  const fromEnv = envOverride(key);
  if (fromEnv !== undefined) return fromEnv;
  return SEO_FEATURES[key];
}

/** Visible SEO UI — master gate + per-flag override. */
export function isSeoUiFeatureEnabled(key: SeoUiFeatureKey): boolean {
  if (!isSeoUiEnabled()) return false;
  return isSeoFeatureConfigured(key);
}

/** @deprecated Prefer `isSeoUiFeatureEnabled` for UI; alias kept for existing imports. */
export function isSeoFeatureEnabled(key: SeoFeatureKey): boolean {
  if (key === "classicUI") return SEO_FEATURES.classicUI;
  if (key === "enableSeoUi") return SEO_FEATURES.enableSeoUi;
  return isSeoUiFeatureEnabled(key);
}

export function isSeoTextsEnabled(): boolean {
  return isSeoUiFeatureEnabled("seoTexts");
}

export function isSeoTextsConfigured(): boolean {
  return isSeoFeatureConfigured("seoTexts");
}

/** Prose blocks that also require a granular feature flag (visible UI only). */
export function shouldRenderSeoText(feature: SeoUiFeatureKey): boolean {
  return isSeoTextsEnabled() && isSeoUiFeatureEnabled(feature);
}

/** FAQ visible UI */
export function shouldRenderFaq(feature: "brandFaq" | "modelFaq"): boolean {
  return isSeoUiFeatureEnabled(feature) && isSeoTextsEnabled();
}

/** FAQPage JSON-LD — technical SEO, ignores classicUI master switch. */
export function shouldEmitFaqJsonLd(feature: "brandFaq" | "modelFaq"): boolean {
  return isSeoFeatureConfigured(feature) && isSeoTextsConfigured();
}
