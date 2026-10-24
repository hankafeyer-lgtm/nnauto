import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { trackEvent } from "@lib/ads/service";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      campaignId?: string;
      eventType?: "impression" | "click";
      placement?: string;
      device?: string;
      sessionKey?: string;
    };

    if (!body.campaignId || !body.eventType) {
      return error("campaignId and eventType required", 400);
    }
    if (body.eventType !== "impression" && body.eventType !== "click") {
      return error("Invalid eventType", 400);
    }

    const result = await trackEvent({
      campaignId: body.campaignId,
      eventType: body.eventType,
      placement: body.placement,
      device: body.device || null,
      sessionKey: body.sessionKey || null,
    });

    return json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    return error(msg, 500);
  }
}
