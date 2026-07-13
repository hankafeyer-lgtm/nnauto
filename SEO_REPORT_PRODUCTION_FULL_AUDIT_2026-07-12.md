# NNAuto Production SEO Audit

Date: 2026-07-12

Production audited: `https://nnauto.cz`

## Executive Summary

The production site is technically crawlable and the sitemap is now accepted by Google Search Console with `0` warnings and `0` errors.

Google Search Console confirms that the main ranking page types are indexed and canonicalized correctly: home, listings, auto hub, listing detail, brand pages, and model pages. Rich Results are passing for listing, brand, model, listings, and auto hub pages where GSC reports rich result status.

The main SEO growth problem is not technical indexability. It is weak non-brand visibility: non-brand queries have low CTR and low average position compared with branded queries.

## Production Checks

### Sitemap And Robots

- `https://nnauto.cz/sitemap.xml`: 200, valid XML.
- Google Search Console sitemap status after resubmit: successful.
- GSC sitemap warnings: 0.
- GSC sitemap errors: 0.
- GSC last submitted: 2026-07-12.
- GSC last downloaded: 2026-07-12.
- GSC submitted web URLs: 1873.
- GSC submitted images: 3344.
- `https://nnauto.cz/robots.txt`: 200, readable, sitemap referenced.

### Technical Resources

- `favicon.ico`: 200.
- `apple-touch-icon.png`: 200.
- `site.webmanifest`: 200, `application/manifest+json`.
- `manifest.json`: 404, but this is not a production SEO issue because the site uses `site.webmanifest`.

### Full Crawl

- Sitemap URLs fetched: 1875 during production crawl.
- HTML pages audited: 1875.
- Unique internal links checked: 2672.
- Sitemap XML parse: passed.
- JSON-LD parse: passed on audited HTML pages.
- No sitemap URL returned a confirmed persistent 404.
- Two sitemap URLs timed out during the large crawl but returned 200 on recheck.

Confirmed production issue found:

- 5 internal links returned persistent 404:
  - `https://nnauto.cz/auta/automat`
  - `https://nnauto.cz/auta/elektro`
  - `https://nnauto.cz/auta/plug-in-hybrid`
  - `https://nnauto.cz/auta/fiat/500`
  - `https://nnauto.cz/auta/volkswagen/transporter-t6-1`

False positives / non-blocking signals:

- 602 internal link checks timed out during high-concurrency crawling, but samples rechecked as 200. These are crawl-load/timeouts, not confirmed broken links.
- Some long titles/descriptions and duplicate descriptions exist, mostly on listing/detail or templated facet pages. These are CTR optimization opportunities, not blocking technical errors.
- Some pages have low internal link counts, especially static/editorial/prodat-auto pages. This is an internal linking improvement opportunity.

## Google Search Console

Property: `sc-domain:nnauto.cz`

Date range: 2026-04-11 to 2026-07-10.


| Segment           | Clicks | Impressions | CTR    | Avg. position |
| ----------------- | ------ | ----------- | ------ | ------------- |
| All queries       | 3166   | 14810       | 21.38% | 21.75         |
| Brand queries     | 3129   | 4903        | 63.82% | 2.15          |
| Non-brand queries | 37     | 9907        | 0.37%  | 31.45         |
| Pages             | 3621   | 49141       | 7.37%  | 8.82          |


Finding: branded SEO is strong, but non-brand SEO is still weak. The site needs stronger authority, content depth, CTR snippets, and internal links for model/category queries.

### URL Inspection


| Type           | URL                                                        | GSC index status                  | Robots          | Canonical                    | Rich Results      |
| -------------- | ---------------------------------------------------------- | --------------------------------- | --------------- | ---------------------------- | ----------------- |
| Home           | `https://nnauto.cz/`                                       | Submitted and indexed             | Allowed         | Match                        | Not reported      |
| Listings       | `https://nnauto.cz/listings`                               | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Auto hub       | `https://nnauto.cz/auta`                                   | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Listing detail | `https://nnauto.cz/auta/ford/kuga/ford-kuga-2018-f2ac9fb6` | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Brand          | `https://nnauto.cz/auta/bmw`                               | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Brand          | `https://nnauto.cz/auta/renault`                           | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Model          | `https://nnauto.cz/auta/skoda/octavia`                     | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Model          | `https://nnauto.cz/auta/volkswagen/golf-gti`               | Submitted and indexed             | Allowed         | Match                        | PASS              |
| Model          | `https://nnauto.cz/auta/renault/megane`                    | Submitted and indexed             | Allowed         | Google canonical matches URL | PASS              |
| Collection     | `https://nnauto.cz/auta/skoda/octavia/diesel`              | Discovered, currently not indexed | Not crawled yet | Not available yet            | Not available yet |
| Collection     | `https://nnauto.cz/auta/suv/diesel`                        | Discovered, currently not indexed | Not crawled yet | Not available yet            | Not available yet |


Interpretation: collection/facet pages are technically discoverable. Google has found them but has not indexed sampled pages yet. This is expected for newly expanded SEO surfaces.

## Fixes Applied Locally

These are local code fixes. They have not been committed, pushed, or deployed in this pass.

### Fixed Broken Internal Links

1. Global facet pages no longer 404 when inventory is thin or empty.
  - File: `app/(main)/auta/[brand]/page.tsx`
  - Result: pages can render as `noindex, follow` instead of 404 when there is not enough inventory.
2. Facet matching now understands real stored values.
  - File: `lib/seo/facets.ts`
  - Added synonyms:
    - `automatic` -> `automat`
    - `electric`, `ev` -> `elektro`
    - `plug in hybrid` -> `plug-in-hybrid`
3. Sitemap/facet query mapping now maps DB values to canonical SEO slugs.
  - File: `lib/seo/facet-queries.ts`
  - Prevents mismatches such as `automatic` not generating `/auta/automat`.
4. Model pages now use slug-normalized matching for models with dots/special characters.
  - Files:
    - `app/(main)/auta/[brand]/[model]/page.tsx`
    - `lib/seo/facet-queries.ts`
  - Fixes URLs like `volkswagen/transporter-t6-1`.
5. Removed hardcoded priority link to a currently non-existing `fiat-500` model page.
  - File: `lib/seo/top-models.ts`
  - Result: no internal SEO block points to `/auta/fiat/500`.
6. Credentials protection.
  - File: `.gitignore`
  - Added `private/` so GSC OAuth credentials and audit JSON files are never committed.

## Local Verification After Fixes

`npm run build`: passed.

Local route checks after build:


| URL                                 | Status | Robots            |
| ----------------------------------- | ------ | ----------------- |
| `/auta/automat`                     | 200    | `index, follow`   |
| `/auta/elektro`                     | 200    | `index, follow`   |
| `/auta/plug-in-hybrid`              | 200    | `noindex, follow` |
| `/auta/volkswagen/transporter-t6-1` | 200    | `noindex, follow` |
| `/sitemap.xml`                      | 200    | valid XML         |


`/auta/fiat/500` still returns 404 locally, intentionally, because there is no valid indexable model page for it now and the internal link was removed.

## Core Web Vitals And Speed

Google PageSpeed Insights API returned `429 quota exceeded`, so official PSI lab metrics could not be collected in this pass.

Available signals:

- GSC URL Inspection fetch state is successful for indexed sampled pages.
- GSC mobile usability result is not reporting active mobile errors for sampled URLs.
- Sitemap and HTML fetches are accessible to crawlers.

Recommendation: repeat PageSpeed Insights later with an API key or manually check:

- Home.
- Listings.
- Listing detail.
- Brand page.
- Model page.
- Collection/facet page.

## Hreflang

No hreflang implementation is needed right now because the site is operating as a Czech-market site with Czech canonical pages. Adding hreflang only makes sense if stable multilingual URL versions are introduced.

## Pagination

The primary SEO pages use canonical collection URLs. Pagination did not show a confirmed technical indexing problem in this pass. Continue keeping filter/listing views that are not canonical SEO landing pages as `noindex, follow` where appropriate.

## CTR And Traffic Opportunities

High-impression / low-CTR non-brand queries:

- `škoda kodiaq`
- `golf gti`
- `renault megane prodej`
- `prodám renault scenic`
- `koupím renault megane`
- `marketplace cz auto`
- `mercedes c prodej`
- `renault megane`
- `ford mondeo`
- `golf gti na prodej`

Priority pages for CTR work:

- `https://nnauto.cz/auta/renault/megane`
- `https://nnauto.cz/auta/volkswagen/golf-gti`
- `https://nnauto.cz/auta/mercedes-benz/c-class`
- `https://nnauto.cz/prodej/skoda-kodiaq`
- `https://nnauto.cz/auta/skoda/octavia`
- `https://nnauto.cz/auta/skoda/superb`

## Recommendations To Grow Against Sauto.cz And AutoScout24

1. Build topical authority, not just technical pages.
  - Add strong buying guides for the highest-impression models.
  - Add comparison pages that answer real Czech buyer queries.
  - Add ownership-cost and common-failure sections for priority models.
2. Improve CTR snippets for non-brand pages.
  - Test titles with price, count, year, and trust signals.
  - Avoid generic titles for competitive model pages.
  - Add stronger meta descriptions with inventory count and value proposition.
3. Strengthen internal linking to discovered-but-not-indexed collection pages.
  - Link collection/facet pages from brand/model pages only when relevant.
  - Keep thin pages `noindex, follow` until inventory is sufficient.
  - Add “popular searches” blocks to high-authority pages.
4. Increase external authority.
  - Sauto.cz and AutoScout24 win largely through authority and brand demand.
  - NNAuto needs partnerships, PR links, dealer pages, and useful editorial content that earns backlinks.
5. Use GSC weekly.
  - Track pages with impressions > 50 and CTR < 2%.
  - Track discovered/not indexed collection pages.
  - Request indexing for priority pages after deployment.

## Current Status

Production is technically healthy after sitemap resubmit.

Real SEO bugs found in this pass were internal broken links caused by facet/model slug mismatches. Fixes are implemented locally and build successfully. Deploy is required for these fixes to affect production.