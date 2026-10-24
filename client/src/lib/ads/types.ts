/**
 * NNAuto Advertising — shared client types.
 * Demo store still uses localStorage; DB/API path uses the same shape where possible.
 */

export type {
  AdPlacementId,
  AdDurationDays,
  AdCampaignStatus,
} from "@shared/adCatalog";

import type {
  AdPlacementId,
  AdDurationDays,
  AdCampaignStatus,
} from "@shared/adCatalog";

/** @deprecated Prefer AdCampaignStatus — maps old demo statuses. */
export type CampaignStatus =
  | AdCampaignStatus
  | "pending_review"; // legacy demo alias → pending_approval

export type AdvertiserStatus = "active" | "paused" | "pending";

export type AdsRole = "ADMIN" | "ADVERTISER";

export type AdsDemoUser = {
  id: string;
  name: string;
  role: AdsRole;
  advertiserId: string | null;
};

export type Advertiser = {
  id: string;
  companyName: string;
  email: string;
  status: AdvertiserStatus;
  createdAt: string;
  name?: string;
  company?: string;
};

export type AdCampaign = {
  id: string;
  advertiserId: string;
  /** Display name from DB when available */
  advertiserName?: string | null;
  name: string;
  status: CampaignStatus;
  placement: AdPlacementId;
  headline: string;
  description: string;
  image: string;
  videoUrl?: string;
  ctaText: string;
  targetUrl: string;
  dailyBudget: number;
  totalBudget: number;
  durationDays?: AdDurationDays | number;
  priceKc?: number;
  startDate: string;
  endDate: string;
  brandFilter?: string | null;
  categoryFilter?: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  rejectionReason?: string;
  paidAt?: string | null;
  approvedAt?: string | null;
  localDemo?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CampaignDraft = {
  name: string;
  placement: AdPlacementId | null;
  headline: string;
  description: string;
  image: string;
  videoUrl?: string;
  ctaText: string;
  targetUrl: string;
  dailyBudget: number;
  totalBudget: number;
  durationDays: AdDurationDays;
  priceKc: number;
  startDate: string;
  endDate: string;
  brandFilter?: string;
  categoryFilter?: string;
};

export type InvoiceStatus = "paid" | "pending" | "cancelled";

export type AdInvoice = {
  id: string;
  number: string;
  advertiserId: string;
  campaignId: string | null;
  campaignName: string;
  amount: number;
  status: InvoiceStatus;
  issuedAt: string;
};

export type AdsStoreSnapshot = {
  version: 2;
  advertisers: Advertiser[];
  campaigns: AdCampaign[];
  invoices: AdInvoice[];
  budgets: Record<string, number>;
};
