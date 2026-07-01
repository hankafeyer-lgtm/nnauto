#!/usr/bin/env node
/**
 * SEO competitiveness score (0–100 per category + overall).
 * Run: npm run seo:score
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const scores = {
  technical: { earned: 0, max: 0 },
  internalLinking: { earned: 0, max: 0 },
  structuredData: { earned: 0, max: 0 },
  crawlability: { earned: 0, max: 0 },
  indexability: { earned: 0, max: 0 },
  metadata: { earned: 0, max: 0 },
  cwv: { earned: 0, max: 0 },
  richResults: { earned: 0, max: 0 },
};

function read(rel) {
  const p = join(ROOT, rel);
  return existsSync(p) ? readFileSync(p, "utf8") : "";
}

function score(cat, pts, max, ok, note) {
  scores[cat].max += max;
  if (ok) scores[cat].earned += pts;
  return { ok, note };
}

function pct(cat) {
  const s = scores[cat];
  return s.max ? Math.round((s.earned / s.max) * 100) : 0;
}

function overall() {
  let e = 0;
  let m = 0;
  for (const s of Object.values(scores)) {
    e += s.earned;
    m += s.max;
  }
  return m ? Math.round((e / m) * 100) : 0;
}

const checks = [];

// Technical SEO
checks.push(
  score("technical", 10, 10, !!read("lib/seo/site-url.ts"), "site-url.ts"),
);
checks.push(
  score(
    "technical",
    10,
    10,
    read("lib/seo/canonical.ts").includes("resolveListingsCanonicalUrl"),
    "canonical helpers",
  ),
);
checks.push(
  score(
    "technical",
    10,
    10,
    read("app/sitemap.ts").includes("/auta") && read("app/sitemap.ts").includes("queryIndexableFacetUrls"),
    "sitemap with facets",
  ),
);
checks.push(
  score(
    "technical",
    10,
    10,
    read("app/robots.ts").includes("sitemap.xml"),
    "robots sitemap",
  ),
);
checks.push(
  score(
    "technical",
    10,
    10,
    read("lib/seo/sanitize-jsonld.ts").includes("sanitizeJsonLd"),
    "JSON-LD sanitizer",
  ),
);

// Internal linking
checks.push(
  score(
    "internalLinking",
    10,
    10,
    read("lib/seo/SeoHubLinks.tsx").includes("SEO_ARCHITECTURE_LINKS"),
    "architecture hub links",
  ),
);
checks.push(
  score(
    "internalLinking",
    10,
    10,
    read("lib/seo/facets.ts").includes("getBrandFacetClusterLinks"),
    "brand facet clusters",
  ),
);
checks.push(
  score(
    "internalLinking",
    10,
    10,
    read("lib/seo/listing-meta.ts").includes("buildListingInternalLinks"),
    "listing internal links",
  ),
);
checks.push(
  score(
    "internalLinking",
    10,
    10,
    read("app/(main)/auta/page.tsx").includes("listGlobalFacets"),
    "/auta facet links",
  ),
);

// Structured data
for (const type of [
  "Vehicle",
  "Product",
  "Offer",
  "BreadcrumbList",
  "CollectionPage",
  "FAQPage",
  "ItemList",
  "WebSite",
  "SearchAction",
  "Organization",
]) {
  checks.push(
    score(
      "structuredData",
      5,
      5,
      read("lib/seo/structured-data.ts").includes(type),
      `schema: ${type}`,
    ),
  );
}

// Crawlability
checks.push(
  score(
    "crawlability",
    15,
    15,
    read("lib/seo/facets.ts").includes("MIN_FACET_LISTINGS"),
    "thin facet guard (≥3)",
  ),
);
checks.push(
  score(
    "crawlability",
    15,
    15,
    read("lib/seo/slug.ts").includes("slugVariants"),
    "slugVariants for model matching",
  ),
);
checks.push(
  score(
    "crawlability",
    10,
    10,
    read("app/(main)/auta/[brand]/[model]/page.tsx").includes(
      "countModelListingsWithVariants",
    ),
    "model page slug fix",
  ),
);
checks.push(
  score(
    "crawlability",
    10,
    10,
    !read("app/sitemap.ts").match(/[?&](page|from|sort|filter)=/),
    "sitemap no query URLs",
  ),
);

// Indexability
checks.push(
  score(
    "indexability",
    12,
    12,
    read("lib/seo/facets.ts").includes("buildGlobalFacetPath"),
    "indexable facet URLs",
  ),
);
checks.push(
  score(
    "indexability",
    12,
    12,
    read("lib/seo/listings-metadata.ts").includes("shouldNoindexListings"),
    "filter noindex",
  ),
);
checks.push(
  score(
    "indexability",
    11,
    11,
    read("app/sitemap.ts").includes("images"),
    "image URLs in sitemap",
  ),
);

// Metadata
const metaPages = [
  "app/(main)/page.tsx",
  "app/(main)/auta/page.tsx",
  "app/(main)/auta/[brand]/page.tsx",
  "app/(main)/auta/[brand]/[model]/page.tsx",
  "app/(main)/listing/[id]/listing-detail-shared.tsx",
];
for (const p of metaPages) {
  const src = read(p);
  checks.push(
    score(
      "metadata",
      4,
      4,
      src.includes("generateMetadata") || src.includes("buildListingMetadata"),
      `metadata: ${p.split("/").pop()}`,
    ),
  );
}

// CWV readiness
checks.push(
  score(
    "cwv",
    15,
    15,
    read("app/(main)/listing/[id]/listing-detail-shared.tsx").includes(
      'rel="preload"',
    ),
    "LCP image preload",
  ),
);
checks.push(
  score(
    "cwv",
    10,
    10,
    read("app/(main)/listing/[id]/listing-detail-shared.tsx").includes(
      "fetchPriority",
    ),
    "fetchpriority high",
  ),
);
checks.push(
  score(
    "cwv",
    10,
    10,
    read("lib/seo/FacetCollectionPage.tsx").includes('loading="lazy"'),
    "lazy images on collections",
  ),
);
checks.push(
  score(
    "cwv",
    5,
    5,
    read("lib/seo/listing-meta.ts").includes("hlavní fotografie"),
    "image alt for LCP context",
  ),
);

// Rich results
checks.push(
  score(
    "richResults",
    15,
    15,
    read("lib/seo/structured-data.ts").includes("buildAggregateOfferJsonLd"),
    "AggregateOffer",
  ),
);
checks.push(
  score(
    "richResults",
    15,
    15,
    read("lib/seo/structured-data.ts").includes("contactPoint"),
    "Organization contactPoint",
  ),
);
checks.push(
  score(
    "richResults",
    10,
    10,
    read("lib/seo/FacetCollectionPage.tsx").includes("buildFaqPageJsonLd"),
    "FAQ on facet pages",
  ),
);
checks.push(
  score(
    "richResults",
    10,
    10,
    read("lib/seo/JsonLd.tsx").includes("toJsonLdScript"),
    "sanitized JSON-LD output",
  ),
);

console.log("\n═══════════════════════════════════════");
console.log("  NNAuto SEO Score Report");
console.log("═══════════════════════════════════════\n");

const categories = [
  ["Technical SEO", "technical"],
  ["Internal Linking", "internalLinking"],
  ["Structured Data", "structuredData"],
  ["Crawlability", "crawlability"],
  ["Indexability", "indexability"],
  ["Metadata", "metadata"],
  ["Core Web Vitals readiness", "cwv"],
  ["Rich Results readiness", "richResults"],
];

for (const [label, key] of categories) {
  const p = pct(key);
  const bar = "█".repeat(Math.round(p / 5)) + "░".repeat(20 - Math.round(p / 5));
  console.log(`${label.padEnd(28)} ${String(p).padStart(3)}%  ${bar}`);
}

console.log("\n───────────────────────────────────────");
console.log(`OVERALL SEO SCORE:          ${overall()}%`);
console.log("───────────────────────────────────────\n");

const failed = checks.filter((c) => !c.ok);
if (failed.length) {
  console.log("Failed checks:");
  for (const f of failed) console.log(`  ✗ ${f.note}`);
  console.log();
}

process.exit(failed.length ? 1 : 0);
