# NNAuto SEO Stage 2 Report

Date: 2026-07-12

## Scope

Implemented the second additive SEO expansion without changing existing canonical listing URLs, existing brand/model URLs, robots.txt rules, or existing indexed SEO page behavior. New pages are generated from active inventory and become indexable only when they have at least 3 active listings.

## Implemented

- Added inventory-driven `brand + facet` coverage for city, fuel, transmission, body, price, mileage, drive, and year pages through existing `/auta/{brand}/{facet}` URLs.
- Added `model + facet` pages on `/auta/{brand}/{model}/{facet}` for model + city/fuel/price/transmission/year/body/drive.
- Added controlled `facet + facet` pages on `/auta/{facet}/{facet}` for the requested combinations:
  - Body + Fuel
  - Body + Price
  - Body + City
  - Fuel + Price
  - Fuel + City
  - Transmission + City
  - Transmission + Price
  - Drive + Price
  - Drive + City
  - Year + Price
  - Year + City
- Added SSR rendering for new combination pages with:
  - Title and Meta Description
  - H1 and H2
  - SEO text
  - FAQ and FAQ Schema
  - Breadcrumb and Breadcrumb Schema
  - CollectionPage, ItemList, and AggregateOffer JSON-LD where applicable
  - Canonical
  - OpenGraph and Twitter Cards
  - Internal related links
- Added sitemap inclusion for new inventory combinations only when active inventory is sufficient.
- Added `noindex, follow` for thin combination pages and kept them out of sitemap.
- Blocked non-whitelisted facet/facet duplicates such as `/auta/cng/2025`.

## Local Audit Results

- Production build passed: `npm run build`.
- SEO check passed: `npm run seo:check` -> 48 passed, 0 failed.
- IDE diagnostics for changed files: no linter errors.
- Local sitemap status: 200, `application/xml`.
- Local robots status: 200, `text/plain`.
- Local sitemap contained 1873 URLs.
- New indexable combination pages in sitemap:
  - Brand + City: 97 URLs
  - Model + Facet: 266 URLs
  - Facet + Facet: 112 URLs
- Representative local checks:
  - `/auta/bmw/praha`: 200, `index, follow`, canonical OK, JSON-LD present, in sitemap
  - `/auta/skoda/octavia/diesel`: 200, `index, follow`, canonical OK, JSON-LD present, in sitemap
  - `/auta/suv/diesel`: 200, `index, follow`, canonical OK, JSON-LD present, in sitemap
  - `/auta/skoda/octavia/cng`: 200, `noindex, follow`, canonical OK, not in sitemap
  - `/auta/bmw/cng`: 200, `noindex, follow`, canonical OK, not in sitemap
  - `/auta/cng/2025`: 404, not in sitemap

## What Is Good

- Existing technical SEO foundation is strong: sitemap, robots, canonical, OpenGraph, Twitter metadata, BreadcrumbList, CollectionPage, FAQPage, ItemList, Vehicle, Product, Offer, Organization, and WebSite schemas are present.
- New pages are SSR-rendered and ready in HTML for Googlebot.
- Thin pages are not sent to Google through sitemap and are protected with `noindex, follow`.
- Existing listing URLs remain canonical and unchanged.
- New combination pages are driven by inventory, so they automatically grow as new cars are added.

## What Needs Improvement

- Google Search Console data could not be analyzed automatically in this run because no Search Console or Google Analytics MCP/API access is available in the current toolset. Only browser tools are available, which cannot safely export GSC query/page data.
- `npm run check` still fails on pre-existing TypeScript issues outside the SEO stage 2 changes, mostly in client components and missing asset imports.
- Core Web Vitals field data (LCP, CLS, INP) requires CrUX/PageSpeed/GSC data. This run verified SSR/build/runtime behavior but did not have field data access.
- Low CTR recommendations should be generated after connecting Search Console export/API. The rule should be: pages with impressions > 50 and CTR < 2% get suggested Title/Description changes, not automatic changes.

## Highest Traffic Opportunities

- Brand + City pages: examples like BMW Praha, Škoda Praha, Audi Brno. These match local buying intent and can capture users searching for specific cars near them.
- Model + Fuel pages: examples like Škoda Octavia diesel, Volkswagen Passat benzin, BMW X5 hybrid. These match common Czech used-car search patterns.
- Model + Price pages: examples like Octavia do 300 000 Kč or Passat do 500 000 Kč. These are high-intent commercial queries.
- Body + Fuel and Body + Price pages: examples like SUV diesel, kombi do 300 000 Kč. These help broader non-branded discovery queries.
- Year + Price pages: useful for users searching by budget and age, but should be watched for duplication risk and thin inventory.

## Next Recommended Pages

These should be additive and only if inventory supports them:

- Editorial guides for buying-intent queries: "nejlepší SUV do 500 000 Kč", "nejlepší kombi pro rodinu", "diesel nebo benzin u ojetého auta".
- Comparison pages for high-impression model pairs from GSC once available.
- City landing pages with local intro content for Praha, Brno, Ostrava, Plzeň if they keep enough inventory.
- Internal linking from relevant editorial pages into the new model+facet and brand+city pages.

## Title And Description Recommendations

Do not change existing indexed titles automatically without GSC data. Once Search Console data is connected, prioritize pages with:

- Impressions > 50
- CTR < 2%
- Average position 3-20

Recommended template tests:

- Brand + City: `{Brand} {City} na prodej - {count} aut od {price} Kč | NNAuto`
- Model + Fuel: `{Brand} {Model} {Fuel} na prodej - ceny a nabídka | NNAuto`
- Model + Price: `{Brand} {Model} do {price} Kč - aktuální inzeráty | NNAuto`
- Body + Fuel: `{Body} {Fuel} na prodej - ojetá auta skladem | NNAuto`

## Production Readiness

Ready for code review and deployment after accepting the known repository-wide TypeScript debt. The stage 2 SEO changes passed build, SEO checks, local route checks, sitemap checks, robots checks, canonical checks, and schema presence checks.
