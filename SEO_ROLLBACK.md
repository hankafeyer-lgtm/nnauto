# SEO rollback guide

All new SEO UI is gated by `lib/seo/features.ts`. Change one flag, restart dev server — no code edits needed.

## Instant rollback to production-like UI (10 seconds)

Disable **all** new visible SEO blocks at once. Technical SEO (metadata, schema.org, canonical, robots, sitemap, OpenGraph, title, description) keeps working.

**Option A — edit `lib/seo/features.ts`:**

```ts
SEO_FEATURES.classicUI = true
// or equivalently:
SEO_FEATURES.enableSeoUi = false
```

**Option B — `.env.local` (no code change):**

```bash
NEXT_PUBLIC_CLASSIC_UI=true
# or:
NEXT_PUBLIC_SEO_ENABLE_UI=false
```

Restart dev server after changing env.

### What classic UI turns off

| Block | Flag affected |
|-------|----------------|
| Homepage SEO sections | `homepageSeoBlocks` |
| «Prozkoumat katalog» | `homepageExploreSection` |
| Brand intro / FAQ / categories / newest | `brandSeoIntro`, `brandFaq`, `brandCategories`, `brandNewestCars` |
| Model intro / FAQ / related | `modelSeoIntro`, `modelFaq`, `modelRelatedModels`, `modelCategories` |
| Listing summary clip | `listingSeoSummary` |
| Similar cars / related offers | `listingRelatedOffers` |
| Extended breadcrumbs (visible) | `listingBreadcrumbExtended`, `autoHub` |
| Listings footer prose | `seoTexts` |
| `/auta` hub | `autoHub` → 404 |
| Facet pages (`/auta/diesel`, …) | `facetPages` → 404 |
| Facet intro / FAQ (visible) | `seoTexts` |
| All long-form prose | `seoTexts` |

### What classic UI does **not** turn off

- `generateMetadata()` — title, description, OpenGraph
- JSON-LD (CollectionPage, ItemList, FAQPage, BreadcrumbList, Vehicle, …)
- Canonical URLs
- `robots.txt` / `sitemap.xml`

## Quick kills (granular)

| Goal | Flag | Value |
|------|------|-------|
| Turn off all long SEO prose | `seoTexts` | `false` |
| Turn off `/auta` hub | `autoHub` | `false` |
| Turn off facet pages (`/auta/diesel`, `/auta/bmw/suv`, …) | `facetPages` | `false` |
| Turn off homepage SEO blocks | `homepageSeoBlocks` | `false` |
| Turn off «Prozkoumat katalog» | `homepageExploreSection` | `false` |

## Per-page blocks

### Homepage (`app/(main)/page.tsx`)

| Block | Flag |
|-------|------|
| All sections below hero | `homepageSeoBlocks` |
| «Prozkoumat katalog» chips | `homepageExploreSection` |
| Long prose at bottom | `seoTexts` (also needs `homepageSeoBlocks`) |

Component: `lib/seo/components/home/HomeSeoBlocks.tsx`, `ExploreCatalog.tsx`

### Brand (`/auta/{brand}`)

| Block | Flag |
|-------|------|
| Intro paragraphs | `brandSeoIntro` + `seoTexts` |
| «Proč si vybrat» + stats | `brandSeoIntro` + `seoTexts` |
| FAQ | `brandFaq` + `seoTexts` |
| «Kategorie {brand}» | `brandCategories` |
| «Nejnovější vozy» chips | `brandNewestCars` |
| «Podobné značky» / top searches | `seoTexts` |

Components: `lib/seo/components/brand/*`

### Model (`/auta/{brand}/{model}`)

| Block | Flag |
|-------|------|
| Intro / why-buy / watch-out | `modelSeoIntro` + `seoTexts` |
| FAQ | `modelFaq` + `seoTexts` |
| Legacy long-form block | `seoTexts` |
| Sibling / similar models | `modelRelatedModels` |
| «Kategorie» + facet search links | `modelCategories` |

Components: `lib/seo/components/model/*`

### Listing detail

| Block | Flag |
|-------|------|
| SSR clip summary (crawlers) | `listingSeoSummary` |
| Similar cars + chip links | `listingRelatedOffers` |
| «O tomto voze» | `seoTexts` |
| Extended breadcrumb (desktop) | `listingBreadcrumbExtended` |
| «Auta» in breadcrumb | `listingBreadcrumbExtended` + `autoHub` |

Components: `ListingSeoSummary.tsx`, `lib/seo/components/listing/RelatedOffers.tsx`  
Helpers: `lib/seo/helpers/breadcrumb.tsx`

### Listings catalog (`/listings`)

| Block | Flag |
|-------|------|
| Footer brand links + prose | `seoTexts` |

Component: `lib/seo/components/listings/ListingsSeoFooter.tsx`

### `/auta` index

| Block | Flag |
|-------|------|
| Entire page | `autoHub` → returns 404 |
| Navigace + prose footer | `seoTexts` |

Component: `lib/seo/components/auta/AutaHubSeoFooter.tsx`

### Facet collection pages

| Block | Flag |
|-------|------|
| Entire route | `facetPages` → 404 |
| Intro + FAQ | `seoTexts` |
| Related category chips | `brandCategories` |

Component: `lib/seo/FacetCollectionPage.tsx`

## Environment overrides (optional)

Without editing code, set in `.env.local`:

```bash
# Master rollback — production-like visible UI
NEXT_PUBLIC_CLASSIC_UI=true

# Granular overrides
NEXT_PUBLIC_SEO_FEATURE_SEO_TEXTS=false
NEXT_PUBLIC_SEO_FEATURE_BRAND_FAQ=false
NEXT_PUBLIC_SEO_FEATURE_FACET_PAGES=false
```

Pattern: `NEXT_PUBLIC_SEO_FEATURE_<SNAKE_CASE_KEY>=false`

## What stays unchanged

- `HomeClient`, `ListingsClient`, `ListingDetailClient` — core product UI
- Legacy routes (`/listing/[id]`, `/listings`, …) — only SEO blocks appended after existing components
- Colors, fonts, header, footer, gallery, filters

## Remove a component entirely

Delete the file under `lib/seo/components/` and remove its import from the page — core layout still works if the matching flag is `false`.
