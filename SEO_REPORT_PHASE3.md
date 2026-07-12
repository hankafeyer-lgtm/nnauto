# NNAuto SEO Phase 3 Report

Date: 2026-07-12

## Scope

Phase 3 focused on quality and CTR readiness for already-created SEO landing pages. No new URLs were created. Existing sitemap, robots.txt, and canonical logic were not changed.

## Implemented

- Added shared internal-linking blocks for SEO collection pages:
  - Související auta
  - Populární modely
  - Populární značky
  - Poslední inzeráty
  - Další auta této značky
  - Další auta tohoto modelu
  - Související vyhledávání
- Added Vehicle JSON-LD on collection pages for visible listing rows.
- Improved combined landing page SEO text so model+facet and facet+facet pages no longer share the same generic paragraph.
- Kept Title, Meta Description, H1, canonical, robots, sitemap behavior, and URL structure unchanged.
- Renamed the existing facet related-link heading to "Související vyhledávání" so it better matches search intent and the Phase 3 linking requirements.

## Audit Results

Representative local checks passed:

- `/auta/bmw/praha`
  - Title unique enough: yes
  - H1 matches title intent: yes
  - Canonical unchanged: yes
  - Robots: `index, follow`
  - Vehicle Schema: yes
  - AggregateOffer: yes
  - Breadcrumb Schema: yes
  - Internal links: brands, models, latest listings, same brand, related searches
- `/auta/skoda/octavia/diesel`
  - Title unique enough: yes
  - H1 matches title intent: yes
  - Canonical unchanged: yes
  - Robots: `index, follow`
  - Vehicle Schema: yes
  - AggregateOffer: yes
  - Breadcrumb Schema: yes
  - Internal links: brands, models, latest listings, same brand, same model, related searches
- `/auta/suv/diesel`
  - Title unique enough: yes
  - H1 matches title intent: yes
  - Canonical unchanged: yes
  - Robots: `index, follow`
  - Vehicle Schema: yes
  - AggregateOffer: yes
  - Breadcrumb Schema: yes
  - Internal links: related cars, brands, models, latest listings, related searches
- `/auta/skoda/octavia/cng`
  - Robots: `noindex, follow`
  - Not a CTR target until inventory becomes sufficient
  - Kept out of sitemap by existing Stage 2 rules
  - Related-search links remain available for crawl discovery

## Best SEO Pages

The strongest page types are:

- Model + Fuel pages, for example `/auta/skoda/octavia/diesel`.
- Brand + City pages, for example `/auta/bmw/praha`.
- Body + Fuel pages, for example `/auta/suv/diesel`.

They have clear search intent, sufficient inventory, indexable robots, canonical consistency, collection schema, item lists, vehicle schema, and useful internal links.

## Pages Needing Improvement

- Thin pages with fewer than 3 listings should remain `noindex, follow`. They should not receive CTR work until inventory grows.
- Pages with very similar facet labels can still look similar in SERP without Search Console data. They should be prioritized only after impressions appear.
- Some same-brand/same-model sections are omitted when the page does not have enough matching rows. This is intentional to avoid empty blocks.

## CTR Recommendations

Do not change production titles automatically without Google Search Console data. Once GSC is connected, prioritize pages with:

- More than 50 impressions.
- CTR below 2%.
- Average position between 3 and 20.

Recommended tests:

- Brand + City: `{Brand} {City} na prodej - {count} aut od {price} Kč | NNAuto`
- Model + Fuel: `{Brand} {Model} {Fuel} - aktuální nabídka a ceny | NNAuto`
- Body + Fuel: `{Body} {Fuel} na prodej - ověřené inzeráty | NNAuto`
- Model + Price: `{Brand} {Model} do {price} Kč - ojeté vozy skladem | NNAuto`

## Core Web Vitals Recommendations

- Keep collection pages SSR-rendered and avoid client-only SEO content.
- Keep images lazy-loaded below the fold and use fixed image dimensions to protect CLS.
- Avoid adding heavy client components to SEO blocks.
- Watch sitemap runtime after future inventory growth, but Phase 3 did not add sitemap queries.
- Pull CrUX/PageSpeed/GSC field data before making LCP/CLS/INP conclusions.

## Internal Linking Recommendations

- Keep new blocks near the lower part of collection pages so they support crawl paths without pushing listings down.
- Use model+facet pages as bridges between broad category searches and listing detail pages.
- Use brand+city pages as local-intent hubs.
- Keep thin pages crawlable via `noindex, follow`, but avoid pushing them aggressively from high-authority pages until inventory improves.

## Verification

- `npm run build` passed.
- `npm run seo:check` passed: 48 passed, 0 failed.
- Changed-file diagnostics: no linter errors.
- Local smoke checks passed for:
  - `/auta/bmw/praha`
  - `/auta/skoda/octavia/diesel`
  - `/auta/suv/diesel`
  - `/auta/skoda/octavia/cng`
  - `/sitemap.xml`
  - `/robots.txt`

## Production Readiness

Ready for review. No commit, push, or deploy was performed for Phase 3 in this step.
