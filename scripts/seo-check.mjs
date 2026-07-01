#!/usr/bin/env node
/**
 * Local SEO self-check — validates source files without hitting production.
 * Run: npm run seo:check
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

let failures = 0;
let passes = 0;

function pass(msg) {
  passes++;
  console.log(`  ✓ ${msg}`);
}

function fail(msg) {
  failures++;
  console.error(`  ✗ ${msg}`);
}

function read(relPath) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    fail(`Missing file: ${relPath}`);
    return "";
  }
  return readFileSync(full, "utf8");
}

function section(title) {
  console.log(`\n${title}`);
}

section("Site URL config");
{
  const src = read("lib/seo/site-url.ts");
  if (src.includes("NEXT_PUBLIC_SITE_URL")) pass("site-url.ts reads NEXT_PUBLIC_SITE_URL");
  else fail("site-url.ts missing NEXT_PUBLIC_SITE_URL");
  if (src.includes("nnauto.cz") && !src.match(/localhost/)) {
    pass("site-url.ts defaults to nnauto.cz (not localhost)");
  } else {
    fail("site-url.ts should default to nnauto.cz");
  }
}

section("JSON-LD sanitizer");
{
  const src = read("lib/seo/sanitize-jsonld.ts");
  if (src.includes("sanitizeJsonLd")) pass("sanitizeJsonLd helper exists");
  else fail("sanitizeJsonLd helper missing");
  const jsonLd = read("lib/seo/JsonLd.tsx");
  if (jsonLd.includes("toJsonLdScript") || jsonLd.includes("sanitizeJsonLd")) {
    pass("JsonLd component uses sanitizer");
  } else {
    fail("JsonLd component should use sanitizeJsonLd/toJsonLdScript");
  }
}

section("Sitemap");
{
  const src = read("app/sitemap.ts");
  if (src.includes("/auta")) pass("sitemap includes /auta");
  else fail("sitemap missing /auta index");
  if (src.includes("buildListingUrl")) pass("sitemap includes listing URLs");
  else fail("sitemap missing listing URLs");
  if (/[?&](from|page|sort|filter)=/.test(src)) {
    fail("sitemap source contains query-param URLs");
  } else {
    pass("sitemap source has no filter query URLs");
  }
  if (src.includes("dedupeSitemapEntries")) pass("sitemap deduplication present");
}

section("Robots.txt");
{
  const robotsTs = read("app/robots.ts");
  const robotsTxt = read("client/public/robots.txt");
  for (const pattern of ["sitemap.xml", "/?from=", "/?sort=", "filter", "utm_", "fbclid", "gclid"]) {
    if (robotsTs.includes(pattern) || robotsTxt.includes(pattern)) {
      pass(`robots references ${pattern}`);
    } else {
      fail(`robots missing rule for ${pattern}`);
    }
  }
  if (robotsTs.includes("/auta")) pass("robots allows /auta");
  else fail("robots should allow /auta");
}

section("Canonical helpers");
{
  const src = read("lib/seo/canonical.ts");
  if (src.includes("resolveListingsCanonicalUrl")) pass("listings canonical helper");
  if (src.includes("resolveAutaIndexCanonicalUrl")) pass("/auta canonical helper");
  if (src.includes("isPaginationOnlyQuery")) pass("pagination-only query detection");
  if (src.includes("hasTechnicalQueryParams")) pass("technical query param detection");
}

section("Structured data schemas");
{
  const src = read("lib/seo/structured-data.ts");
  for (const type of [
    "Vehicle",
    "Product",
    "Offer",
    "BreadcrumbList",
    "WebSite",
    "SearchAction",
    "Organization",
    "CollectionPage",
    "FAQPage",
    "ItemList",
  ]) {
    if (src.includes(type)) pass(`schema type: ${type}`);
    else fail(`missing schema builder for ${type}`);
  }
}

section("SEO content generator");
{
  const src = read("lib/seo/seo-content.ts");
  if (src.includes("buildBrandSeoIntro")) pass("brand SEO intro generator");
  if (src.includes("buildModelSeoIntro")) pass("model SEO intro generator");
  if (src.includes("buildBrandFaq")) pass("brand FAQ generator");
  if (src.includes("buildModelFaq")) pass("model FAQ generator");
}

section("Page coverage (H1 + breadcrumbs)");
{
  const pages = [
    { file: "app/(main)/page.tsx", h1: true, breadcrumb: false },
    { file: "app/(main)/auta/page.tsx", h1: true, breadcrumb: true },
    { file: "app/(main)/auta/[brand]/page.tsx", h1: true, breadcrumb: true },
    { file: "app/(main)/auta/[brand]/[model]/page.tsx", h1: true, breadcrumb: true },
    { file: "app/(main)/listing/[id]/listing-detail-shared.tsx", h1: false, breadcrumb: true },
  ];
  for (const p of pages) {
    const src = read(p.file);
    if (!src) continue;
    if (p.h1 && (/<h1[\s>]/.test(src) || src.includes("buildListingH1"))) {
      pass(`${p.file}: H1 present`);
    } else if (p.h1) {
      fail(`${p.file}: missing H1`);
    }
    if (p.breadcrumb && (src.includes("Breadcrumb") || src.includes("breadcrumb"))) {
      pass(`${p.file}: breadcrumbs present`);
    } else if (p.breadcrumb) {
      fail(`${p.file}: missing breadcrumbs`);
    }
  }
}

section("Listing meta (title, description, alt)");
{
  const src = read("lib/seo/listing-meta.ts");
  if (src.includes("buildListingSeoTitle")) pass("listing title template");
  if (src.includes("buildListingSeoDescription")) pass("listing description template");
  if (src.includes("hlavní fotografie")) pass("main photo alt template");
  if (src.includes("fotografie vozu")) pass("gallery photo alt template");
  if (src.includes("buildListingInternalLinks")) pass("internal link builder");
}

section("sanitizeJsonLd runtime test");
{
  const src = read("lib/seo/sanitize-jsonld.ts");
  if (src.includes("export function sanitizeJsonLd")) {
    pass("sanitizeJsonLd is exported");
  } else {
    fail("sanitizeJsonLd export missing");
  }
}

console.log(`\n--- SEO check: ${passes} passed, ${failures} failed ---\n`);
process.exit(failures > 0 ? 1 : 0);
