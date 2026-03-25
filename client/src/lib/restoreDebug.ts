type DebugPayload = Record<string, unknown> | undefined;

declare global {
  interface Window {
    __NNAUTO_RESTORE_DEBUG__?: boolean;
  }
}

function isRestoreDebugEnabled(): boolean {
  if (typeof window === "undefined") return false;
  // Production default: disabled. Enable manually when debugging:
  // window.__NNAUTO_RESTORE_DEBUG__ = true
  return window.__NNAUTO_RESTORE_DEBUG__ === true;
}

export function restoreDebug(
  scope: string,
  event: string,
  payload?: DebugPayload,
): void {
  if (!isRestoreDebugEnabled()) return;
  const now = new Date().toISOString();
  if (payload) {
    console.info(`[restore][${scope}] ${event}`, { ts: now, ...payload });
    return;
  }
  console.info(`[restore][${scope}] ${event}`, { ts: now });
}
