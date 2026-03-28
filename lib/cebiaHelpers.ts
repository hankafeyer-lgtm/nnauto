export function mergeRawResponse(
  existing: unknown,
  patch: Record<string, unknown>,
) {
  if (existing && typeof existing === "object" && !Array.isArray(existing))
    return { ...(existing as any), ...patch };
  return { ...patch };
}

export function getCebiaGuestToken(report: any): string | null {
  const rr = report?.rawResponse;
  if (!rr || typeof rr !== "object" || Array.isArray(rr)) return null;
  const token = (rr as any).guestToken;
  return typeof token === "string" && token.trim() ? token.trim() : null;
}

export function assertValidGuestAccess(
  report: any,
  token: string | undefined,
): boolean {
  const expected = getCebiaGuestToken(report);
  if (!expected) return false;
  if (!token || typeof token !== "string") return false;
  return token.trim() === expected;
}
