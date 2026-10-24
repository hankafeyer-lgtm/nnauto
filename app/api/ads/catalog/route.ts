import { json, error } from "@lib/api-helpers";
import { getCatalogWithPrices } from "@lib/ads/service";

/** Public catalog — catalog defaults merged with DB price overrides. */
export async function GET() {
  try {
    const catalog = await getCatalogWithPrices();
    return json(catalog);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
