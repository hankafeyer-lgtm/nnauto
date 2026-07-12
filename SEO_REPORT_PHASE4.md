# NNAuto Production SEO Audit - Phase 4

Date: 2026-07-12

## Scope

This was a production SEO audit of indexable URLs currently exposed through `https://nnauto.cz/sitemap.xml`.

Constraints followed:

- No new URLs were created.
- Existing routes were not changed.
- Existing metadata API structure was not changed.
- Canonical URL format was not changed.
- Robots rules were changed only indirectly where a real sitemap/indexation mismatch was found.
- Sitemap logic was changed only to fix a real XML validity problem.

## Production Crawl Summary

Source: production `https://nnauto.cz/sitemap.xml`

- Sitemap URLs crawled: 1872
- Fetch errors: 0
- HTTP 200 pages: 1872
- Average internal links per audited page: 21.0
- Average HTML size: 113 KB
- Average script tags per page: 22.5
- Average images per page: 12.2
- Lazy image ratio: 97%
- Priority/eager image count: 688

Schema detected during production crawl:

- `Vehicle`: 1699 pages
- `Product`: 1766 pages
- `Offer`: 1699 pages
- `AggregateOffer`: 1078 pages
- `BreadcrumbList`: 1868 pages
- `ItemList`: 1123 pages
- `CollectionPage`: 1106 pages
- `FAQPage`: 1179 pages
- `Organization`: 1700 pages
- `WebSite`: 1 page

## Issues Found And Fixed

### 1. Sitemap XML Was Not Well-Formed

Production sitemap contained raw `&` characters inside image URLs:

`?w=1200&q=80&f=webp`

This caused XML parsing to fail at production line 7116.

Fix:

- Escaped sitemap image query separators to `&amp;`.
- Verified locally that `sitemap.xml` now parses as valid XML.

Files changed:

- `app/sitemap.ts`

Verification:

- Local XML parse: passed.
- Local sitemap contains escaped image URLs.

### 2. Sitemap Included 10 Noindex Pages

Production sitemap contained 10 URLs that rendered `noindex, follow`, for example:

- `/auta/benzin/ceske-budejovice`
- `/auta/skoda/hradec-kralove`
- `/auta/manual/pardubice`

Root cause:

- Sitemap inventory matching used slug-normalized values.
- Runtime facet stats used exact lowercase DB matching.
- Values with Czech diacritics or normalized slugs did not match consistently, e.g. `Škoda` vs `skoda`, `Benzín` vs `benzin`, city/region labels with diacritics.

Fix:

- Updated SEO facet DB matching to compare slug-normalized values for brand, model, fuel, transmission, body, drive, and region facets.
- This aligns sitemap inclusion and runtime robots metadata.

Files changed:

- `lib/seo/facet-queries.ts`

Verification:

- The previously affected URLs now render `index, follow` locally when included by inventory threshold.

### 3. Listing Detail Pages Missed SSR H1

Production crawl reported listing detail pages without an SSR `<h1>`.

Root cause:

- `ListingSeoSummary` used a paragraph with `id="listing-primary-heading"` instead of a real `<h1>`.

Fix:

- Changed the existing SSR listing summary heading from `<p>` to `<h1>`.
- No visual route/layout change; this remains inside the existing SEO summary block.

Files changed:

- `app/(main)/listing/[id]/ListingSeoSummary.tsx`

Verification:

- Local listing detail page now has an SSR H1.

### 4. Internal Listing Links Caused 308 Redirects

Production crawl found internal links to non-canonical listing URLs missing the year segment, e.g. `/auta/audi/a4/audi-a4-40c0eb41`.

Root cause:

- Some `buildListingUrl()` calls had `id`, `brand`, and `model`, but did not pass `year`.
- The route self-healed those URLs with 308/301 redirects to canonical listing URLs.

Fix:

- Passed `year` into existing listing URL builders where row data already had it.

Files changed:

- `app/(main)/prodej/[slug]/page.tsx`
- `app/(main)/[modelSlug]/page.tsx`
- `app/(main)/auta/[brand]/page.tsx`
- `app/(main)/auta/[brand]/[model]/page.tsx`
- `lib/seo/components/brand/BrandListingGrid.tsx`
- `lib/seo/components/brand/BrandNewestCars.tsx`
- `lib/seo/components/model/ModelListingGrid.tsx`

Verification:

- Local sample collection links now resolve directly with HTTP 200 and no redirect.

### 5. Static Indexable Pages Lacked SSR SEO Support

Production crawl found `/pricing`, `/about`, `/tips`, and `/privacy` had missing or weak SSR SEO signals:

- Missing Breadcrumb JSON-LD.
- Missing H2.
- Very low or zero SSR internal links.
- `/privacy` had no SSR H1.

Fix:

- Added Breadcrumb JSON-LD.
- Added SSR H1/H2 where missing.
- Added hidden SSR internal navigation links.

Files changed:

- `app/(main)/pricing/page.tsx`
- `app/(main)/about/page.tsx`
- `app/(main)/tips/page.tsx`
- `app/(main)/privacy/page.tsx`

Verification:

- Each page now has 1 H1, 1 H2, Breadcrumb JSON-LD, and at least 4 internal links locally.

## Issues Found But Not Changed Automatically

### Duplicate Listing Titles/Descriptions

Production crawl found a few duplicate listing titles/descriptions. These appear to be real duplicate or very similar inventory entries, not metadata template bugs.

Examples:

- `BMW 5 Series 530 2008 na prodej | 160 kW | 90 000 Kč | NNAuto`
- `Hyundai Santa Fe 2.2 l 2014 na prodej | 145 kW | 380 000 Kč | NNAuto`
- `Mercedes-Benz C-Class 2009 na prodej | 245 000 Kč | NNAuto`

Recommendation:

- Do not rewrite listing metadata automatically.
- Review duplicate inventory records or enrich titles with trim/mileage/location only if duplicates are genuine separate vehicles.

### Duplicate Facet Descriptions

Some facet descriptions repeat when pages have the same count and same facet label type, especially mileage and city pages.

Recommendation:

- Future improvement: include page scope in description for all combined facets, e.g. brand/model/city/year context.
- Not changed in this pass because it touches broad metadata wording and should be CTR-tested.

### Orphan / Weakly Linked Pages

The crawl found many sitemap URLs not linked from the sampled fetched pages, especially deep year+price and model+facet combinations.

Recommendation:

- Continue improving hub pages and related-search blocks.
- Avoid linking aggressively to thin pages.
- Prioritize internal links to pages with inventory and impressions.

## Core Web Vitals Audit

PageSpeed Insights API returned HTTP 429, so live field/lab CWV could not be pulled in this run.

Available local/build signals:

- Lazy loading ratio: 97% of detected images.
- Priority/eager image count: 688, mainly listing hero/primary images.
- JS static assets after build: 258 JS files, 3.38 MB total uncompressed.
- Largest JS chunks:
  - 420.6 KB `.next/static/chunks/3110-...js`
  - 248.5 KB `.next/static/chunks/8873...js`
  - 218.6 KB `.next/static/chunks/3794-...js`
  - 195.2 KB `.next/static/chunks/4bd1b696-...js`

Recommendations:

- Run PageSpeed/CrUX with authenticated quota for representative pages:
  - `/`
  - `/auta/bmw/praha`
  - `/auta/skoda/octavia/diesel`
  - `/auta/suv/diesel`
  - listing detail page
- Watch listing detail LCP because hero image is intentionally priority-loaded.
- Keep SEO text/link blocks SSR and lightweight.
- Avoid moving SEO blocks into client components.
- Investigate large shared JS chunks in a separate performance pass; do not mix that with SEO URL/indexation work.

## Verification After Fixes

Commands run:

- `npm run build` - passed.
- `npm run seo:check` - passed, 48/48.
- Changed-file diagnostics - no linter errors.

Local targeted checks:

- `sitemap.xml` parses as XML.
- Sitemap image URLs use `&amp;`.
- Previously noindex sitemap URLs now render `index, follow`.
- Listing detail page has SSR H1.
- Static pages `/pricing`, `/about`, `/tips`, `/privacy` have H1, H2, Breadcrumb JSON-LD, and SSR internal links.
- Sample collection listing links return direct 200 without redirect.

## Remaining Risk

Production still needs redeploy before the local fixes are live. After deploy, rerun:

- XML parse of `https://nnauto.cz/sitemap.xml`
- noindex-in-sitemap check
- listing H1 sample
- internal redirect sample
- static page JSON-LD/H1/H2/internal-link check
