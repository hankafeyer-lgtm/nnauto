import type {
  AdCampaign,
  AdInvoice,
  Advertiser,
  AdsDemoUser,
  AdsStoreSnapshot,
} from "./types";

export const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80";

/** Primary DEMO advertiser — used by "Demo Advertiser" session. */
export const DEMO_ADVERTISER: Advertiser = {
  id: "adv-demo-a",
  companyName: "Demo Advertiser",
  email: "demo-advertiser@nnauto.demo",
  status: "active",
  createdAt: "2026-01-15T10:00:00.000Z",
};

/** Second company — only visible to Admin (isolation check). */
export const DEMO_ADVERTISER_B: Advertiser = {
  id: "adv-demo-b",
  companyName: "Demo Partner B",
  email: "partner-b@nnauto.demo",
  status: "active",
  createdAt: "2026-02-01T10:00:00.000Z",
};

export const DEMO_ADMIN_USER: AdsDemoUser = {
  id: "user-demo-admin",
  name: "Demo Admin",
  role: "ADMIN",
  advertiserId: null,
};

export const DEMO_ADVERTISER_USER: AdsDemoUser = {
  id: "user-demo-advertiser",
  name: "Demo Advertiser",
  role: "ADVERTISER",
  advertiserId: DEMO_ADVERTISER.id,
};

function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function createSeedCampaigns(): AdCampaign[] {
  const now = new Date().toISOString();
  return [
    {
      id: "camp-demo-1",
      advertiserId: DEMO_ADVERTISER.id,
      name: "Demo Campaign 1",
      status: "active",
      placement: "homepage_top",
      headline: "Demo banner — Homepage",
      description:
        "DEMO DATA. Ukázková aktivní kampaň pro placement homepage_top.",
      image: DEMO_IMAGE,
      ctaText: "Zjistit více",
      targetUrl: "https://nnauto.cz/about",
      dailyBudget: 400,
      totalBudget: 4000,
      startDate: isoToday(),
      endDate: isoPlusDays(30),
      impressions: 8400,
      clicks: 168,
      spend: 980,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "camp-demo-2",
      advertiserId: DEMO_ADVERTISER.id,
      name: "Demo Campaign 2",
      status: "paused",
      placement: "listing_top",
      headline: "Demo banner — Seznam vozidel",
      description: "DEMO DATA. Pozastavená kampaň — na webu se nezobrazí.",
      image: DEMO_IMAGE,
      ctaText: "Zobrazit nabídku",
      targetUrl: "https://nnauto.cz/listings",
      dailyBudget: 250,
      totalBudget: 2500,
      startDate: isoToday(),
      endDate: isoPlusDays(14),
      impressions: 2100,
      clicks: 42,
      spend: 310,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "camp-demo-3",
      advertiserId: DEMO_ADVERTISER.id,
      name: "Demo Campaign 3",
      status: "pending_review",
      placement: "featured_top",
      headline: "Demo banner — Doporučené",
      description:
        "DEMO DATA. Ukázková kampaň pro placement featured_top (Doporučené).",
      image: DEMO_IMAGE,
      ctaText: "Více informací",
      targetUrl: "https://nnauto.cz/",
      dailyBudget: 200,
      totalBudget: 2000,
      startDate: isoToday(),
      endDate: isoPlusDays(21),
      impressions: 0,
      clicks: 0,
      spend: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "camp-demo-b1",
      advertiserId: DEMO_ADVERTISER_B.id,
      name: "Demo Campaign B1",
      status: "active",
      placement: "listing_inline",
      headline: "Demo Partner B — mezi inzeráty",
      description:
        "DEMO DATA. Kampaň druhé firmy — Demo Advertiser ji nesmí vidět.",
      image: DEMO_IMAGE,
      ctaText: "Zjistit více",
      targetUrl: "https://nnauto.cz/pricing",
      dailyBudget: 180,
      totalBudget: 1800,
      startDate: isoToday(),
      endDate: isoPlusDays(20),
      impressions: 3200,
      clicks: 64,
      spend: 420,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export function createSeedInvoices(): AdInvoice[] {
  return [
    {
      id: "inv-demo-1",
      number: "DEMO-2026-001",
      advertiserId: DEMO_ADVERTISER.id,
      campaignId: "camp-demo-1",
      campaignName: "Demo Campaign 1",
      amount: 4000,
      status: "paid",
      issuedAt: "2026-08-01",
    },
    {
      id: "inv-demo-2",
      number: "DEMO-2026-002",
      advertiserId: DEMO_ADVERTISER.id,
      campaignId: "camp-demo-2",
      campaignName: "Demo Campaign 2",
      amount: 2500,
      status: "pending",
      issuedAt: "2026-08-15",
    },
    {
      id: "inv-demo-3",
      number: "DEMO-2026-003",
      advertiserId: DEMO_ADVERTISER.id,
      campaignId: null,
      campaignName: "Kredit na účet",
      amount: 10000,
      status: "paid",
      issuedAt: "2026-07-20",
    },
    {
      id: "inv-demo-b1",
      number: "DEMO-2026-B01",
      advertiserId: DEMO_ADVERTISER_B.id,
      campaignId: "camp-demo-b1",
      campaignName: "Demo Campaign B1",
      amount: 1800,
      status: "cancelled",
      issuedAt: "2026-08-10",
    },
  ];
}

export function createSeedStore(): AdsStoreSnapshot {
  return {
    version: 2,
    advertisers: [DEMO_ADVERTISER, DEMO_ADVERTISER_B],
    campaigns: createSeedCampaigns(),
    invoices: createSeedInvoices(),
    budgets: {
      [DEMO_ADVERTISER.id]: 25_000,
      [DEMO_ADVERTISER_B.id]: 12_000,
    },
  };
}

/** Display name helper (supports legacy snapshots). */
export function advertiserDisplayName(a: Advertiser | undefined | null): string {
  if (!a) return "—";
  return a.companyName || a.company || a.name || a.id;
}
