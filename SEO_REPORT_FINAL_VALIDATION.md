# NNAuto Final Production SEO Validation

Date: 2026-07-12

## Scope

Production URL checked: `https://nnauto.cz`

No code, URL, route, sitemap, robots, canonical, or metadata API changes were made in this validation pass because no new real production issue was found.

## External Tool Availability

- Google Rich Results Test: no official public live-test API is available. Google rich result data is available programmatically through the Search Console URL Inspection API, which requires OAuth access to the verified Search Console property.
- Schema.org Validator: no supported public automation API is available. The public validator is rate-limited and not intended for automated crawling.
- Google Search Console: API access was connected through OAuth for the verified `sc-domain:nnauto.cz` property.

Because of these limits, validation was performed by fetching production HTML as a Google Inspection-style user agent and validating:

- JSON-LD parseability.
- Schema.org `@type` extraction.
- H1/H2 presence.
- Title and description presence.
- Canonical consistency.
- Robots meta.
- OpenGraph and Twitter tags.
- Sitemap inclusion.
- Robots.txt and sitemap availability.
- Internal link count.

## Full Sitemap Validation

Production sitemap: `https://nnauto.cz/sitemap.xml`

- Sitemap XML parse: passed.
- Sitemap URL count: 1872.
- Audited sitemap URLs: 1872.
- Fetch errors: 0.
- HTTP 200 pages: 1872.
- Missing title: 0.
- Missing description: 0.
- Missing H1: 0.
- Missing canonical: 0.
- Canonical mismatch: 0.
- Noindex pages in sitemap: 0.
- Missing OpenGraph: 0.
- Missing Twitter tags: 0.
- Missing JSON-LD: 0.
- Invalid JSON-LD: 0.

Robots: `https://nnauto.cz/robots.txt` is available and references sitemap.

## Checked Page Types

| Type | URL | Status |
| --- | --- | --- |
| Home | `https://nnauto.cz/` | OK |
| Listing detail | `https://nnauto.cz/auta/ford/kuga/ford-kuga-2018-f2ac9fb6` | OK |
| Brand | `https://nnauto.cz/auta/bmw` | OK |
| Model | `https://nnauto.cz/auta/skoda/octavia` | OK |
| Collection, model + facet | `https://nnauto.cz/auta/skoda/octavia/diesel` | OK |
| Collection, facet + facet | `https://nnauto.cz/auta/suv/diesel` | OK |

## Page Detail Status

### Home

- Status: 200.
- Title: present.
- Description: present.
- H1: `Prodej a nákup ojetých aut v ČR`.
- H2: present.
- Canonical: `https://nnauto.cz`.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `Organization`, `WebSite`, `SearchAction`, `ImageObject`, `ContactPoint`, `Country`, `EntryPoint`.
- Internal links: 59.
- Sitemap: present as `https://nnauto.cz`.

### Listing Detail

- Status: 200.
- Title: present.
- Description: present.
- H1: present.
- H2: present.
- Canonical: self-referencing.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `Vehicle`, `Product`, `Offer`, `Brand`, `Organization`, `BreadcrumbList`, `ListItem`, `QuantitativeValue`.
- Internal links: 14.
- Sitemap: present.

### Brand Page

- Status: 200.
- Title: present.
- Description: present.
- H1: `BMW na prodej`.
- H2: present.
- Canonical: self-referencing.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `CollectionPage`, `ItemList`, `AggregateOffer`, `FAQPage`, `BreadcrumbList`, `Product`, `Brand`.
- Internal links: 62.
- Sitemap: present.

### Model Page

- Status: 200.
- Title: present.
- Description: present.
- H1: `Škoda Octavia na prodej`.
- H2: present.
- Canonical: self-referencing.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `CollectionPage`, `ItemList`, `AggregateOffer`, `FAQPage`, `BreadcrumbList`, `Product`.
- Internal links: 58.
- Sitemap: present.

### Collection: Model + Facet

- Status: 200.
- URL: `https://nnauto.cz/auta/skoda/octavia/diesel`.
- Title: present.
- Description: present.
- H1: `Škoda Octavia Nafta na prodej`.
- H2: present.
- Canonical: self-referencing.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `CollectionPage`, `ItemList`, `AggregateOffer`, `FAQPage`, `Vehicle`, `Product`, `Offer`, `BreadcrumbList`.
- Internal links: 35.
- Sitemap: present.

### Collection: Facet + Facet

- Status: 200.
- URL: `https://nnauto.cz/auta/suv/diesel`.
- Title: present.
- Description: present.
- H1: `Auta SUV Nafta na prodej`.
- H2: present.
- Canonical: self-referencing.
- Robots: `index, follow`.
- OpenGraph: present.
- Twitter: present.
- JSON-LD: valid.
- Schema types: `CollectionPage`, `ItemList`, `AggregateOffer`, `FAQPage`, `Vehicle`, `Product`, `Offer`, `BreadcrumbList`.
- Internal links: 54.
- Sitemap: present.

## Google Search Console Validation

Property: `sc-domain:nnauto.cz`

Permission level: `siteOwner`

Date range: 2026-04-11 to 2026-07-10.

### GSC Performance Summary

| Segment | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| All query rows | 3166 | 14810 | 21.38% | 21.75 |
| Brand queries | 3046 | 4785 | 63.66% | 2.15 |
| Non-brand queries | 120 | 10025 | 1.20% | 31.11 |
| Page rows | 3621 | 49141 | 7.37% | 8.82 |

Finding: branded demand performs well, but non-brand SEO traffic is still early. The main limitation is not crawlability; it is low rankings and low CTR for competitive model/category terms.

### GSC URL Inspection

| Type | URL | Index status | Robots | Canonical | Rich results |
| --- | --- | --- | --- | --- | --- |
| Home | `https://nnauto.cz/` | Submitted and indexed | Allowed | User and Google canonical match | Not reported by GSC |
| Listing detail | `https://nnauto.cz/auta/ford/kuga/ford-kuga-2018-f2ac9fb6` | Submitted and indexed | Allowed | User and Google canonical match | PASS |
| Brand | `https://nnauto.cz/auta/bmw` | Submitted and indexed | Allowed | User and Google canonical match | PASS |
| Model | `https://nnauto.cz/auta/skoda/octavia` | Submitted and indexed | Allowed | User and Google canonical match | PASS |
| Collection, model + facet | `https://nnauto.cz/auta/skoda/octavia/diesel` | Google does not know this URL yet | Not available yet | Not available yet | Not available yet |
| Collection, facet + facet | `https://nnauto.cz/auta/suv/diesel` | Google does not know this URL yet | Not available yet | Not available yet | Not available yet |

Interpretation: the core indexable page types are indexed and canonicalized correctly. The new collection/facet URLs are live, valid, indexable, and present in the production sitemap, but Google has not crawled/indexed these sampled URLs yet.

### GSC Sitemap Status

GSC knows `https://nnauto.cz/sitemap.xml`.

- Last submitted: 2026-04-16.
- Last downloaded by Google: 2026-07-10.
- GSC currently reports: 1 warning and 1 error.
- Current live sitemap validation: passed, 1872 URLs, 0 invalid JSON-LD pages, 0 noindex pages in sitemap, 0 missing canonical pages.

Interpretation: the GSC sitemap warning/error is likely stale because Google's last sitemap download happened before the latest production sitemap fixes were validated. A sitemap resubmit was attempted through API, but the current OAuth token has read-only scope (`webmasters.readonly`), so Google returned `403 insufficient authentication scopes`. Manual resubmit in GSC is recommended.

### Low-CTR Non-Brand Queries

These queries have at least 50 impressions and CTR below 2%.

| Query | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| `škoda kodiaq` | 1 | 221 | 0.45% | 15.68 |
| `golf gti` | 0 | 177 | 0.00% | 22.12 |
| `renault megane prodej` | 0 | 170 | 0.00% | 26.03 |
| `prodám renault scenic` | 0 | 131 | 0.00% | 31.88 |
| `koupím renault megane` | 0 | 129 | 0.00% | 21.81 |
| `marketplace cz auto` | 0 | 96 | 0.00% | 9.00 |
| `mercedes c prodej` | 0 | 88 | 0.00% | 26.60 |
| `renault megane` | 0 | 91 | 0.00% | 44.02 |
| `ford mondeo` | 1 | 60 | 1.67% | 42.03 |
| `golf gti na prodej` | 0 | 50 | 0.00% | 8.02 |

CTR recommendation: prioritize title/meta testing and stronger above-the-fold content for `Škoda Kodiaq`, `Volkswagen Golf GTI`, `Renault Megane`, `Renault Scenic`, and `Mercedes-Benz C-Class`. These are already receiving impressions but are not earning clicks consistently.

### Low-CTR Pages

These pages have at least 50 impressions and CTR below 2%.

| Page | Clicks | Impressions | CTR | Avg. position |
| --- | ---: | ---: | ---: | ---: |
| `https://nnauto.cz/pricing` | 26 | 3542 | 0.73% | 1.15 |
| `https://nnauto.cz/auta/skoda` | 24 | 2921 | 0.82% | 1.08 |
| `https://nnauto.cz/auta/volkswagen` | 18 | 2359 | 0.76% | 1.34 |
| `https://nnauto.cz/about` | 11 | 2132 | 0.52% | 1.13 |
| `https://nnauto.cz/tips` | 8 | 2252 | 0.36% | 1.11 |
| `https://nnauto.cz/auta/renault` | 7 | 2377 | 0.29% | 3.34 |
| `https://nnauto.cz/auta/bmw` | 2 | 1085 | 0.18% | 3.47 |
| `https://nnauto.cz/auta/renault/megane` | 1 | 506 | 0.20% | 34.46 |
| `https://nnauto.cz/auta/volkswagen/golf-gti` | 3 | 312 | 0.96% | 18.10 |
| `https://nnauto.cz/auta/mercedes-benz/c-class` | 1 | 327 | 0.31% | 25.30 |

Note: Some low-CTR pages with very high average position are likely appearing for navigational or sitelink-like impressions where the searcher intent is not to click that specific URL. The clearest SEO opportunities are model/category pages with position worse than 8 and meaningful impressions.

### Device And Country Signals

- Mobile: 3403 clicks, 10332 impressions, 32.94% CTR, average position 6.08.
- Desktop: 124 clicks, 11397 impressions, 1.09% CTR, average position 28.10.
- Tablet: 23 clicks, 126 impressions, 18.25% CTR, average position 7.76.

Primary country remains Czechia: 3310 clicks, 19361 impressions, 17.10% CTR.

## Result

No real production SEO implementation problem was found in this final validation pass.

All audited indexable sitemap pages returned 200, had title, description, H1, canonical, indexable robots, OpenGraph/Twitter metadata, and valid JSON-LD.

GSC confirms that home, listing, brand, and model pages are submitted and indexed with matching user/Google canonicals. GSC also confirms rich results PASS for listing, brand, and model pages.

The main remaining SEO problem is growth-related: non-brand queries have low CTR and low average position. Collection/facet pages are technically ready but some are not known to Google yet.

## Recommendations

- Manually resubmit `https://nnauto.cz/sitemap.xml` in Google Search Console because the API token used for this audit is read-only and cannot submit sitemaps.
- Keep current technical SEO structure unchanged; no URL, canonical, robots, or sitemap code fix is needed from this validation.
- Prioritize CTR/title/meta experiments for high-impression model/category pages: `Škoda Kodiaq`, `Volkswagen Golf GTI`, `Renault Megane`, `Renault Scenic`, `Mercedes-Benz C-Class`, and important brand pages.
- Wait for Google to crawl the new collection/facet URLs, then re-run URL Inspection on those URLs.
- To run Schema.org Validator manually, test representative URLs in `https://validator.schema.org/`.
- To avoid public tool rate limits, keep local JSON-LD parse/schema checks in CI as a lightweight guard.
- Re-run this audit after large inventory imports, sitemap generation changes, or metadata template changes.
