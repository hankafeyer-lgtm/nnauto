import { test, expect } from "@playwright/test";

const PUBLIC_PATHS = [
  "/",
  "/listings",
  "/listings?category=used",
  "/about",
  "/pricing",
  "/tips",
  "/privacy",
  "/add-listing",
  "/profile",
  "/settings",
  "/admin",
  "/dealer",
  "/cebia/return",
];

for (const path of PUBLIC_PATHS) {
  test(`GET ${path} returns HTML without 5xx`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.status(), `HTTP status for ${path}`).toBeLessThan(500);
    const ct = (res.headers()["content-type"] || "").toLowerCase();
    expect(ct, `content-type for ${path}`).toContain("text/html");
    const body = await res.text();
    expect(body.toLowerCase()).toContain("<html");
    expect(body).not.toMatch(/internal server error/i);
  });
}

test("listing detail HTML when API returns an id", async ({ request }) => {
  const listRes = await request.get("/api/listings?limit=1");
  if (!listRes.ok()) {
    test.skip(true, `listings API unavailable: ${listRes.status()}`);
    return;
  }
  const data = (await listRes.json()) as { listings?: { id: string }[] };
  const id = data.listings?.[0]?.id;
  if (!id) {
    test.skip(true, "no listings in database");
    return;
  }
  const res = await request.get(`/listing/${id}`);
  expect(res.status()).toBeLessThan(500);
  const body = await res.text();
  expect(body.toLowerCase()).toContain("<html");
  expect(body).not.toMatch(/internal server error/i);
});
