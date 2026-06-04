import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";
import { useLocation } from "@/lib/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ToastAction } from "@/components/ui/toast";

/**
 * Polls the dealer unread-count endpoint and fires:
 *  - a toast (always, with a "Open inbox" action) and
 *  - an optional browser Notification (only when permission is already
 *    granted; we never auto-prompt — the inbox renders an explicit
 *    "Enable notifications" CTA for that, see DealerMessagesPage).
 *
 * The hook is safe to mount in multiple places at once because every
 * caller shares the same React Query cache key
 * (`/api/dealer/conversations/unread-count`); the actual network polling
 * happens once.
 *
 * Notifications fire only on a STRICT INCREASE between two adjacent
 * polls — re-renders, page navigations or the very first poll never
 * trigger a notification.
 */
const QUERY_KEY = ["/api/dealer/conversations/unread-count"];

export type DealerInboxRecent = {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  source: string;
  status: string;
  unreadCount: number;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  listingId: string;
  listingTitle: string | null;
  listingBrand: string | null;
  listingModel: string | null;
  listingPhoto: string | null;
};

export type DealerInboxSummary = {
  unread: number;
  conversationsWithUnread?: number;
  uniqueClients?: number;
  recent?: DealerInboxRecent[];
};

export function useDealerUnreadNotifier(opts?: {
  /** When false, the hook still polls but suppresses toasts/Notifications.
   *  Use this on /dealer/messages itself to avoid double-buzzing the
   *  dealer when they're already looking at the inbox. */
  enabled?: boolean;
}) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const t = useTranslation();
  const [, navigate] = useLocation();
  const previousRef = useRef<number | null>(null);
  const isDealer = !!user?.isDealer && isAuthenticated;
  const enabled = opts?.enabled !== false;

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/dealer/conversations/unread-count",
      );
      return res.json() as Promise<DealerInboxSummary>;
    },
    enabled: isDealer,
    // Notifier compares prev/next strictly, so 60s polling still catches every
    // increase. Cutting cadence in half halves dealer-side request cost on
    // every page that mounts this hook (cabinet pages + inbox shortcut).
    refetchInterval: 60_000,
  });

  useEffect(() => {
    if (!enabled || !isDealer) return;
    const next = query.data?.unread;
    if (typeof next !== "number") return;
    const prev = previousRef.current;
    previousRef.current = next;
    // First successful poll = baseline, do nothing.
    if (prev === null) return;
    if (next <= prev) return;

    const delta = next - prev;
    const clients = query.data?.uniqueClients ?? 0;
    const description =
      clients > 1
        ? t("messages.notification.newDescriptionMulti")
            .replace("{count}", String(delta))
            .replace("{clients}", String(clients))
        : t("messages.notification.newDescription").replace(
            "{count}",
            String(delta),
          );
    toast({
      title: t("messages.notification.newTitle"),
      description,
      action: (
        <ToastAction
          altText={t("messages.notification.openInbox")}
          onClick={() => navigate("/dealer/messages")}
        >
          {t("messages.notification.openInbox")}
        </ToastAction>
      ),
      duration: 6000,
    });

    // Audible ping. The browser will silence this if the tab doesn't
    // have an active user gesture history; that's the correct policy
    // and we never throw on failure.
    try {
      if (typeof window !== "undefined") {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(880, ctx.currentTime);
          o.frequency.exponentialRampToValueAtTime(
            1320,
            ctx.currentTime + 0.18,
          );
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);
          o.connect(g).connect(ctx.destination);
          o.start();
          o.stop(ctx.currentTime + 0.5);
          o.onended = () => ctx.close().catch(() => {});
        }
      }
    } catch {
      /* audio is best-effort */
    }

    // Browser notification — silent if permission isn't granted.
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const n = new Notification(t("messages.notification.newTitle"), {
          body: description,
          icon: "/logo.png",
          tag: "nnauto-dealer-inbox",
          // Re-using the same tag means a fresh notification replaces
          // the previous one — no notification spam if multiple
          // messages arrive between two polls.
        });
        n.onclick = () => {
          window.focus();
          navigate("/dealer/messages");
          n.close();
        };
      } catch {
        /* notifications can throw on iOS Safari without HTTPS, ignore */
      }
    }
  }, [
    enabled,
    isDealer,
    navigate,
    query.data?.unread,
    query.data?.uniqueClients,
    t,
    toast,
  ]);

  return query;
}

/**
 * One-shot helper to ask the user for browser-notification permission.
 * Returns the resulting permission. Safe to call without checking env —
 * it bails out cleanly when Notifications aren't available.
 */
export async function requestBrowserNotificationPermission(): Promise<
  NotificationPermission | "unsupported"
> {
  if (typeof window === "undefined") return "unsupported";
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}
