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
      return res.json() as Promise<{ unread: number }>;
    },
    enabled: isDealer,
    refetchInterval: 30_000,
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
    toast({
      title: t("messages.notification.newTitle"),
      description: t("messages.notification.newDescription").replace(
        "{count}",
        String(delta),
      ),
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

    // Browser notification — silent if permission isn't granted.
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const n = new Notification(t("messages.notification.newTitle"), {
          body: t("messages.notification.newDescription").replace(
            "{count}",
            String(delta),
          ),
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
  }, [enabled, isDealer, navigate, query.data?.unread, t, toast]);

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
