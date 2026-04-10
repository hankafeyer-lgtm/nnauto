export { buildCanonical, buildPaginationLinks, BASE_URL } from "./canonical";
export { shouldIndexSearch, getRobotsDirective } from "./index-rules";
export {
  buildSearchMetadata,
  buildBrandMetadata,
  buildBrandModelMetadata,
  buildArticleMetadata,
} from "./metadata";
export {
  JsonLd,
  breadcrumbJsonLd,
  vehicleJsonLd,
  itemListJsonLd,
  articleJsonLd,
  blogJsonLd,
} from "./jsonld";
export {
  resolveBrandBySlug,
  resolveModelBySlug,
  getBrandListingStats,
  getBrandModelListingStats,
  getModelsForBrand,
  getModelListingCounts,
} from "./resolve";
export type { ListingStats } from "./resolve";
export { autolinkBrandModel } from "./autolink";
