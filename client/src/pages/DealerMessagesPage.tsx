import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Bell,
  BellOff,
  Bot,
  Building2,
  CheckCheck,
  ChevronDown,
  Inbox,
  Mail,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Smartphone,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/translations";
import { useLocation, Link } from "@/lib/navigation";
import { apiRequest } from "@/lib/queryClient";
import { buildListingPath } from "@/lib/listingUrl";
import {
  requestBrowserNotificationPermission,
  useDealerUnreadNotifier,
} from "@/hooks/useDealerUnreadNotifier";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Conversation,
  ConversationSource,
  ConversationStatus,
  Message,
  QuickReply,
} from "@shared/schema";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ListingSummary = {
  id: string;
  title: string;
  brand: string;
  model: string;
  price: string;
  photos: string[] | null;
};

type ConversationWithListing = Conversation & {
  listing: ListingSummary | null;
};

type StatusFilter = "all" | ConversationStatus;

const STATUS_TABS: Array<{ value: StatusFilter; key: string }> = [
  { value: "all", key: "messages.filter.all" },
  { value: "new", key: "messages.filter.new" },
  { value: "in_progress", key: "messages.filter.inProgress" },
  { value: "closed", key: "messages.filter.closed" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function DealerMessagesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const t = useTranslation();
  const [, navigate] = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-bold">{t("dealer.cabinet")}</h1>
          <p className="text-muted-foreground">
            {t("messages.authRequired")}
          </p>
          <Button onClick={() => navigate("/")}>{t("messages.goHome")}</Button>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user.isDealer) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-bold">{t("dealer.cabinet")}</h1>
          <p className="text-muted-foreground">{t("messages.dealerOnly")}</p>
          <Button onClick={() => navigate("/dealer")}>
            {t("messages.openCabinet")}
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SEO title={t("messages.pageTitle")} noindex />
      <Header />
      <main className="flex-1 bg-[radial-gradient(circle_at_top_left,rgba(245,205,116,0.16),transparent_34%),linear-gradient(180deg,#fffaf0_0%,#ffffff_36%)]">
        <div className="container mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-7">
        <div className="mb-4 overflow-hidden rounded-3xl border border-amber-100 bg-white/90 p-4 shadow-[0_18px_55px_rgba(120,72,12,0.10)] backdrop-blur sm:mb-5 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#3d260c_0%,#8a641f_100%)] text-white shadow-lg">
                <Inbox className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#8a641f]">
                  NNAuto Pro
                </p>
                <h1 className="truncate text-2xl font-black tracking-tight text-[#5c3b10] sm:text-3xl">
                  {t("messages.heading")}
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {t("messages.subtitle")}
                </p>
              </div>
            </div>
            <Link
              href="/dealer"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 text-sm font-bold text-[#6f4c17] shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
              data-testid="link-back-to-cabinet"
            >
              <Building2 className="h-4 w-4" />
              {t("messages.backToCabinet")}
            </Link>
          </div>
        </div>

        <MessagesShell />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Premium inbox overview
// ─────────────────────────────────────────────────────────────────────────────

function InboxSummaryBar({
  conversations,
  loading,
}: {
  conversations: ConversationWithListing[];
  loading: boolean;
}) {
  const t = useTranslation();
  const unread = conversations.reduce((sum, c) => sum + (c.unreadDealerCount || 0), 0);
  const fresh = conversations.filter((c) => c.status === "new").length;
  const active = conversations.filter((c) => c.status !== "closed").length;

  const stats = [
    { label: t("messages.summary.newMessages"), value: Math.max(fresh, unread), Icon: Bell },
    { label: t("messages.summary.activeRequests"), value: active, Icon: MessageCircle },
  ];

  return (
    <div className="mb-3 grid grid-cols-2 overflow-hidden rounded-3xl border border-amber-100 bg-white/90 shadow-[0_12px_34px_rgba(120,72,12,0.08)]">
      {stats.map(({ label, value, Icon }) => (
        <div
          key={label}
          className="border-r border-amber-100 p-2.5 last:border-r-0 sm:p-3"
        >
          <div className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fff4d8] text-[#7a5518]">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wide text-muted-foreground sm:text-xs">{label}</p>
              <p className="text-lg font-black leading-tight text-[#5c3b10] sm:text-xl">
                {loading ? "…" : value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell — list + chat split layout
// ─────────────────────────────────────────────────────────────────────────────

function MessagesShell() {
  const t = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest(
        "DELETE",
        `/api/dealer/conversations/${conversationId}`,
      );
    },
    onSuccess: (_data, conversationId) => {
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations/unread-count"],
      });
      setSelectedId((prev) => (prev === conversationId ? null : prev));
    },
    onError: (e: unknown) =>
      toast({
        title: "Smazání chatu selhalo",
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      }),
  });

  // Keep the unread cache fresh and pre-warmed (so /dealer page picks up
  // changes the moment the dealer leaves the inbox), but suppress
  // toast/Notification while the dealer is *looking at* the inbox to
  // avoid double-buzz (the new conversation will appear in the list
  // anyway thanks to the 30s list refetch).
  useDealerUnreadNotifier({ enabled: false });

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  const conversationsQuery = useQuery({
    queryKey: [
      "/api/dealer/conversations",
      { status: statusFilter, search: debouncedSearch },
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (debouncedSearch) params.set("search", debouncedSearch);
      const qs = params.toString();
      const res = await apiRequest(
        "GET",
        `/api/dealer/conversations${qs ? `?${qs}` : ""}`,
      );
      return res.json() as Promise<{ conversations: ConversationWithListing[] }>;
    },
    refetchInterval: 30_000,
  });

  const conversations = conversationsQuery.data?.conversations ?? [];

  // Auto-select the first conversation on first successful load (desktop only).
  useEffect(() => {
    if (selectedId) return;
    if (typeof window === "undefined") return;
    if (window.innerWidth < 1024) return; // mobile shows the list, not auto-open
    if (conversations.length > 0) setSelectedId(conversations[0].id);
  }, [conversations, selectedId]);

  const selected = useMemo(
    () => conversations.find((c) => c.id === selectedId) || null,
    [conversations, selectedId],
  );

  return (
    <>
      <InboxSummaryBar conversations={conversations} loading={conversationsQuery.isLoading} />
      <BrowserNotificationsPrompt />
      <div className="grid h-[calc(100vh-260px)] min-h-[590px] grid-cols-1 overflow-hidden rounded-[2rem] border border-amber-100 bg-white/95 shadow-[0_24px_70px_rgba(120,72,12,0.12)] lg:grid-cols-[390px_minmax(0,1fr)]">
      {/* List pane */}
      <aside
        className={`border-r border-amber-100 bg-[#fffaf0]/70 flex flex-col ${
          selected ? "hidden lg:flex" : "flex"
        }`}
        data-testid="conversation-list-pane"
      >
        <div className="space-y-3 border-b border-amber-100 bg-white/80 p-3.5 backdrop-blur">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a641f]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("messages.searchPlaceholder")}
              className="h-11 rounded-2xl border-amber-100 bg-white pl-10 shadow-sm focus-visible:ring-amber-300"
              data-testid="input-search-conversations"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={statusFilter === tab.value ? "default" : "outline"}
                className={`h-8 rounded-full px-3 text-xs font-black ${
                  statusFilter === tab.value
                    ? "bg-[#6f4c17] text-white shadow-md hover:bg-[#5a3a10]"
                    : "border-amber-100 bg-white text-[#6f4c17] hover:bg-amber-50"
                }`}
                onClick={() => setStatusFilter(tab.value)}
                data-testid={`filter-${tab.value}`}
              >
                {t(tab.key)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {conversationsQuery.isLoading ? (
            <ListSkeleton />
          ) : conversationsQuery.isError ? (
            <div className="m-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
              {t("messages.loadError")}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyList />
          ) : (
            <ul className="space-y-2">
              {conversations.map((c) => (
                <ConversationListItem
                  key={c.id}
                  c={c}
                  selected={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                  onRequestDelete={() => setConfirmDeleteId(c.id)}
                  deleting={deleteConversationMutation.isPending}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat pane */}
      <section
        className={`min-w-0 bg-white flex flex-col ${selected ? "flex" : "hidden lg:flex"}`}
        data-testid="chat-pane"
      >
        {selected ? (
          <ChatPane
            conversationId={selected.id}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <ChatEmptyState />
        )}
      </section>
    </div>

      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat chat</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tento chat? Tuto akci nelze vrátit zpět.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversationMutation.isPending}>
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (!confirmDeleteId) return;
                deleteConversationMutation.mutate(confirmDeleteId, {
                  onSettled: () => setConfirmDeleteId(null),
                });
              }}
              disabled={deleteConversationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Subtle one-shot prompt: rendered only when the browser supports
 * Notifications and permission is still in the "default" state.
 * Dismissing or granting/denying both hide it for the rest of the
 * session. We deliberately don't auto-call requestPermission() —
 * Chrome flags those as abusive and revokes the permission entirely.
 */
function BrowserNotificationsPrompt() {
  const t = useTranslation();
  const { toast } = useToast();
  const [state, setState] = useState<"loading" | "show" | "hide">("loading");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("hide");
      return;
    }
    if (Notification.permission !== "default") {
      setState("hide");
      return;
    }
    if (sessionStorage.getItem("nnauto.notifPromptDismissed") === "1") {
      setState("hide");
      return;
    }
    setState("show");
  }, []);

  if (state !== "show") return null;

  return (
    <div
      className="mb-4 flex items-center gap-3 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-3.5 shadow-[0_12px_32px_rgba(120,72,12,0.08)]"
      data-testid="browser-notifications-prompt"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
        <Bell className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-amber-900">
          {t("messages.notification.enableTitle")}
        </p>
        <p className="text-xs text-amber-800">
          {t("messages.notification.enableDescription")}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 rounded-xl border-amber-200 bg-white font-bold text-amber-900 hover:bg-amber-50"
        onClick={async () => {
          const result = await requestBrowserNotificationPermission();
          setState("hide");
          if (result === "granted") {
            toast({
              title: t("messages.notification.enabledTitle"),
              description: t("messages.notification.enabledDescription"),
            });
          }
        }}
        data-testid="button-enable-notifications"
      >
        <Bell className="h-3.5 w-3.5" />
        {t("messages.notification.enable")}
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="rounded-xl text-amber-900 hover:bg-amber-100"
        onClick={() => {
          sessionStorage.setItem("nnauto.notifPromptDismissed", "1");
          setState("hide");
        }}
        data-testid="button-dismiss-notifications"
        title={t("messages.notification.dismiss")}
      >
        <BellOff className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List item
// ─────────────────────────────────────────────────────────────────────────────

function ConversationListItem({
  c,
  selected,
  onClick,
  onRequestDelete,
  deleting,
}: {
  c: ConversationWithListing;
  selected: boolean;
  onClick: () => void;
  onRequestDelete: () => void;
  deleting: boolean;
}) {
  const t = useTranslation();
  const initials = (c.clientName || c.clientEmail || c.clientPhone || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <li
      className={`relative overflow-hidden rounded-3xl border transition ${
        selected
          ? "border-[#d7b46a] bg-[linear-gradient(135deg,#fff8e8_0%,#ffffff_100%)] shadow-[0_14px_34px_rgba(120,72,12,0.13)]"
          : "border-transparent bg-white/80 hover:border-amber-100 hover:bg-white hover:shadow-sm"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 p-3.5 pr-12 text-left"
        data-testid={`conversation-row-${c.id}`}
      >
        <div className="relative shrink-0">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-amber-100 text-base font-black text-amber-800 ring-1 ring-amber-200">
            {initials}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-white text-muted-foreground shadow-sm">
            <SourceIcon
              source={c.source as ConversationSource}
              className="h-3.5 w-3.5"
            />
          </div>
          {c.unreadDealerCount > 0 && (
            <span className="absolute -left-1.5 -top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow-md ring-2 ring-white">
              {c.unreadDealerCount}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-black text-[#5c3b10]">
              {c.clientName || c.clientEmail || c.clientPhone || t("messages.anonymous")}
            </span>
          </div>
          <div className="mt-0.5 truncate text-xs font-bold text-[#8a641f]">
            {c.listing
              ? `${c.listing.brand.toUpperCase()} ${c.listing.model}`
              : t("messages.unknownListing")}
          </div>
          <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {c.lastMessagePreview || t("messages.noMessages")}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={c.status as ConversationStatus} />
            <span className="text-[10px] text-muted-foreground">
              {formatRelative(c.lastMessageAt || c.updatedAt)}
            </span>
          </div>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRequestDelete();
        }}
        disabled={deleting}
        aria-label="Smazat chat"
        title="Smazat chat"
        data-testid={`button-delete-conversation-${c.id}`}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-xl text-destructive opacity-70 hover:bg-destructive/10 hover:opacity-100 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat pane
// ─────────────────────────────────────────────────────────────────────────────

function ChatPane({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
  const t = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [viaEmailToggle, setViaEmailToggle] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<
    string | null
  >(null);

  const conversationQuery = useQuery({
    queryKey: ["/api/dealer/conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/dealer/conversations/${conversationId}/messages`,
      );
      return res.json() as Promise<{
        conversation: Conversation & { listing?: ListingSummary | null };
        messages: Message[];
      }>;
    },
    refetchInterval: 15_000,
  });

  const conversation = conversationQuery.data?.conversation;
  const messages = conversationQuery.data?.messages ?? [];

  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/dealer/conversations/${conversationId}/messages`,
        {
          content: draft,
          viaEmail: viaEmailToggle && !!conversation?.clientEmail,
        },
      );
      return res.json();
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({
        queryKey: [
          "/api/dealer/conversations",
          conversationId,
          "messages",
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations/unread-count"],
      });
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Send failed";
      toast({
        title: t("messages.sendError"),
        description: msg,
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: ConversationStatus) => {
      const res = await apiRequest(
        "PATCH",
        `/api/dealer/conversations/${conversationId}/status`,
        { status },
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/conversations"] });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations", conversationId, "messages"],
      });
    },
  });

  // AI reply (placeholder — server returns heuristic mock today, will swap
  // to a real LLM later without changing this client code).
  const aiReplyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        "POST",
        `/api/dealer/conversations/${conversationId}/ai-reply`,
      );
      return res.json() as Promise<{ draft: string; provider: string }>;
    },
    onSuccess: (data) => {
      setDraft(data.draft);
      toast({
        title: t("messages.aiReplyReady"),
        description: t("messages.aiReplyHint"),
      });
    },
    onError: (e: unknown) =>
      toast({
        title: t("messages.aiReplyError"),
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      }),
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest(
        "DELETE",
        `/api/dealer/conversations/${conversationId}/messages/${messageId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations", conversationId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations"],
      });
    },
    onError: (e: unknown) =>
      toast({
        title: "Smazání zprávy selhalo",
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      }),
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(
        "DELETE",
        `/api/dealer/conversations/${conversationId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/dealer/conversations/unread-count"],
      });
      onBack();
    },
    onError: (e: unknown) =>
      toast({
        title: "Smazání chatu selhalo",
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      }),
  });

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Once we open the conversation, also bust the cabinet-wide unread badge.
  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: ["/api/dealer/conversations/unread-count"],
    });
  }, [conversationId, queryClient]);

  if (conversationQuery.isLoading || !conversation) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-700" />
      </div>
    );
  }

  const canSendEmail = !!conversation.clientEmail;
  const willDeliverViaEmail =
    conversation.source === "email" || (viaEmailToggle && canSendEmail);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onChangeStatus={(s) => statusMutation.mutate(s)}
        onDeleteChat={() => setConfirmDeleteChat(true)}
        deleteChatDisabled={deleteConversationMutation.isPending}
      />

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(245,205,116,0.15),transparent_30%),linear-gradient(180deg,#fffaf0_0%,#ffffff_42%)] px-3 py-4 sm:px-6"
      >
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            {t("messages.threadEmpty")}
          </div>
        ) : (
          messages.map((m) => (
            <MessageBubble
              key={m.id}
              m={m}
              canDelete={m.sender === "dealer"}
              onDelete={() => setConfirmDeleteMessageId(m.id)}
              deleting={deleteMessageMutation.isPending}
            />
          ))
        )}
      </div>

      <div className="space-y-3 border-t border-amber-100 bg-white/95 p-3 shadow-[0_-10px_35px_rgba(120,72,12,0.06)] sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <QuickRepliesMenu
            onPick={(text) => setDraft((d) => (d ? `${d}\n${text}` : text))}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => aiReplyMutation.mutate()}
            disabled={aiReplyMutation.isPending}
            className="gap-1.5 rounded-xl border-amber-200 bg-white font-bold text-[#6f4c17] hover:bg-amber-50"
            data-testid="button-ai-reply"
            title={t("messages.aiReplyTooltip")}
          >
            <Bot className="h-3.5 w-3.5" />
            {aiReplyMutation.isPending
              ? t("messages.aiThinking")
              : t("messages.aiReply")}
          </Button>
          {canSendEmail && conversation.source !== "email" && (
            <label className="flex cursor-pointer select-none items-center gap-1.5 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-1.5 text-xs text-[#6f4c17]">
              <input
                type="checkbox"
                className="h-3.5 w-3.5"
                checked={viaEmailToggle}
                onChange={(e) => setViaEmailToggle(e.target.checked)}
                data-testid="checkbox-via-email"
              />
              <Mail className="h-3.5 w-3.5" />
              {t("messages.alsoSendEmail")}
            </label>
          )}
          {willDeliverViaEmail && (
            <Badge variant="outline" className="gap-1 border-amber-200 bg-amber-50 text-[10px] text-[#6f4c17]">
              <Mail className="h-3 w-3" />
              {t("messages.willSendEmail")}
            </Badge>
          )}
        </div>
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("messages.replyPlaceholder")}
            className="min-h-[62px] max-h-40 resize-none rounded-2xl border-amber-100 bg-white p-4 shadow-inner focus-visible:ring-amber-300"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && draft.trim()) {
                e.preventDefault();
                sendMutation.mutate();
              }
            }}
            data-testid="textarea-reply"
          />
          <Button
            onClick={() => draft.trim() && sendMutation.mutate()}
            disabled={!draft.trim() || sendMutation.isPending}
            className="h-[62px] gap-2 rounded-2xl bg-[#6f4c17] px-5 font-black text-white shadow-md hover:bg-[#5a3a10]"
            data-testid="button-send-reply"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">
              {sendMutation.isPending ? t("messages.sending") : t("messages.send")}
            </span>
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          {t("messages.shortcutHint")}
        </p>
      </div>

      <AlertDialog
        open={confirmDeleteChat}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteChat(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat chat</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tento chat? Tuto akci nelze vrátit zpět.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConversationMutation.isPending}>
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteConversationMutation.mutate(undefined, {
                  onSettled: () => setConfirmDeleteChat(false),
                });
              }}
              disabled={deleteConversationMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={confirmDeleteMessageId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteMessageId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Smazat zprávu</AlertDialogTitle>
            <AlertDialogDescription>
              Opravdu chcete smazat tuto zprávu? Tuto akci nelze vrátit zpět.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMessageMutation.isPending}>
              Zrušit
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (!confirmDeleteMessageId) return;
                deleteMessageMutation.mutate(confirmDeleteMessageId, {
                  onSettled: () => setConfirmDeleteMessageId(null),
                });
              }}
              disabled={deleteMessageMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Smazat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat header
// ─────────────────────────────────────────────────────────────────────────────

function ChatHeader({
  conversation,
  onBack,
  onChangeStatus,
  onDeleteChat,
  deleteChatDisabled,
}: {
  conversation: Conversation & { listing?: ListingSummary | null };
  onBack: () => void;
  onChangeStatus: (s: ConversationStatus) => void;
  onDeleteChat: () => void;
  deleteChatDisabled: boolean;
}) {
  const t = useTranslation();
  const listing = conversation.listing;
  return (
    <div className="flex flex-col gap-3 border-b border-amber-100 bg-white/95 p-3.5 sm:p-4 lg:flex-row lg:items-center">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="self-start rounded-xl lg:hidden"
        data-testid="button-back-to-list"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff4d8] text-[#7a5518] ring-1 ring-amber-200">
          <SourceIcon
            source={conversation.source as ConversationSource}
            className="h-5 w-5"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-base font-black text-[#5c3b10] sm:text-lg">
            {conversation.clientName ||
              conversation.clientEmail ||
              conversation.clientPhone ||
              t("messages.anonymous")}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {conversation.clientEmail && (
              <span className="inline-flex items-center gap-1">
                <Mail className="h-3 w-3" /> {conversation.clientEmail}
              </span>
            )}
            {conversation.clientPhone && (
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" /> {conversation.clientPhone}
              </span>
            )}
          </div>
          {listing && (
            <Link
              href={buildListingPath({
                id: listing.id,
                brand: listing.brand,
                model: listing.model,
                year: listing.year,
              })}
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-[#7a5518] hover:bg-amber-100"
              data-testid="link-listing"
            >
              <Smartphone className="h-3 w-3" />
              {listing.brand.toUpperCase()} {listing.model} ·{" "}
              {Number(listing.price).toLocaleString("cs-CZ")} Kč
            </Link>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Select
          value={conversation.status}
          onValueChange={(v) => onChangeStatus(v as ConversationStatus)}
        >
          <SelectTrigger className="h-11 w-[155px] rounded-2xl border-amber-100 bg-white font-bold text-[#6f4c17]" data-testid="select-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">{t("messages.filter.new")}</SelectItem>
            <SelectItem value="in_progress">{t("messages.filter.inProgress")}</SelectItem>
            <SelectItem value="closed">{t("messages.filter.closed")}</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDeleteChat}
          disabled={deleteChatDisabled}
          className="rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive"
          aria-label="Smazat chat"
          title="Smazat chat"
          data-testid="button-delete-chat"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({
  m,
  canDelete = false,
  onDelete,
  deleting = false,
}: {
  m: Message;
  canDelete?: boolean;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const t = useTranslation();
  if (m.sender === "system") {
    return (
      <div className="flex justify-center">
        <div className="max-w-[86%] rounded-full border border-amber-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-amber-900 shadow-sm">
          <Sparkles className="inline h-3 w-3 mr-1" />
          {m.content}
        </div>
      </div>
    );
  }

  const isDealer = m.sender === "dealer";
  return (
    <div className={`flex ${isDealer ? "justify-end" : "justify-start"}`}>
      <div
        className={`group relative max-w-[88%] rounded-3xl px-4 py-3 shadow-sm sm:max-w-[70%] ${
          isDealer
            ? "rounded-br-md bg-[linear-gradient(135deg,#8a4b12_0%,#b86417_100%)] text-white shadow-[0_12px_28px_rgba(180,83,9,0.22)]"
            : "rounded-bl-md border border-amber-100 bg-white text-[#3d260c] shadow-[0_8px_22px_rgba(120,72,12,0.06)]"
        }`}
        data-testid={`message-bubble-${m.id}`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {m.content}
        </div>
        <div
          className={`mt-2 flex items-center gap-1.5 text-[10px] ${
            isDealer ? "text-white/80 justify-end" : "text-muted-foreground"
          }`}
        >
          {m.channel === "email" && (
            <Badge
              variant="outline"
              className={`gap-1 text-[9px] py-0 h-4 ${
                isDealer ? "border-white/40 text-white/90" : ""
              }`}
            >
              <Mail className="h-2.5 w-2.5" />
              {t("messages.channel.email")}
            </Badge>
          )}
          <span>{formatTime(m.createdAt)}</span>
          {isDealer && m.read && (
            <CheckCheck className="h-3 w-3 ml-0.5" aria-label={t("messages.read")} />
          )}
        </div>
        {canDelete && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            title="Smazat zprávu"
            aria-label="Smazat zprávu"
            data-testid={`button-delete-message-${m.id}`}
            className={`absolute -top-2 ${
              isDealer ? "-left-2" : "-right-2"
            } h-6 w-6 rounded-full bg-background border shadow-sm flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity disabled:opacity-50`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick replies dropdown
// ─────────────────────────────────────────────────────────────────────────────

function QuickRepliesMenu({ onPick }: { onPick: (text: string) => void }) {
  const t = useTranslation();
  const [manageOpen, setManageOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["/api/dealer/quick-replies"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/dealer/quick-replies");
      return res.json() as Promise<{ quickReplies: QuickReply[] }>;
    },
  });

  const items = data?.quickReplies ?? [];

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-xl border-amber-200 bg-white font-bold text-[#6f4c17] hover:bg-amber-50"
            data-testid="button-quick-replies"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t("messages.templates")}
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 max-w-[90vw] rounded-2xl border-amber-100">
          <DropdownMenuLabel>{t("messages.templates")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {items.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              {t("messages.noTemplates")}
            </div>
          ) : (
            items.map((it) => (
              <DropdownMenuItem
                key={it.id}
                onClick={() => onPick(it.message)}
                className="flex flex-col items-start gap-0.5 rounded-xl"
                data-testid={`quick-reply-${it.id}`}
              >
                <span className="text-xs font-semibold">{it.title}</span>
                <span className="text-[11px] text-muted-foreground line-clamp-2">
                  {it.message}
                </span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setManageOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t("messages.manageTemplates")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ManageQuickRepliesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        items={items}
      />
    </>
  );
}

function ManageQuickRepliesDialog({
  open,
  onOpenChange,
  items,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: QuickReply[];
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const create = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/dealer/quick-replies", {
        title: title.trim(),
        message: message.trim(),
      });
      return res.json();
    },
    onSuccess: () => {
      setTitle("");
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/quick-replies"] });
    },
    onError: (e: unknown) =>
      toast({
        title: t("messages.templateError"),
        description: e instanceof Error ? e.message : "",
        variant: "destructive",
      }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/dealer/quick-replies/${id}`);
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/api/dealer/quick-replies"] }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("messages.manageTemplates")}</DialogTitle>
          <DialogDescription>{t("messages.manageTemplatesHint")}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 max-h-[40vh] overflow-y-auto">
          {items.map((it) => (
            <li
              key={it.id}
              className="flex items-start justify-between gap-3 border rounded-md p-2"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold">{it.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {it.message}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove.mutate(it.id)}
                disabled={remove.isPending}
                data-testid={`button-delete-template-${it.id}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
          {items.length === 0 && (
            <li className="text-xs text-muted-foreground text-center py-3">
              {t("messages.noTemplates")}
            </li>
          )}
        </ul>

        <div className="space-y-2 border-t pt-3">
          <Label htmlFor="qr-title">{t("messages.templateTitle")}</Label>
          <Input
            id="qr-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            data-testid="input-template-title"
          />
          <Label htmlFor="qr-message">{t("messages.templateMessage")}</Label>
          <Textarea
            id="qr-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            data-testid="textarea-template-message"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-1" />
            {t("messages.close")}
          </Button>
          <Button
            disabled={!title.trim() || !message.trim() || create.isPending}
            onClick={() => create.mutate()}
            data-testid="button-add-template"
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("messages.addTemplate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Misc UI bits
// ─────────────────────────────────────────────────────────────────────────────

function SourceIcon({
  source,
  className,
}: {
  source: ConversationSource;
  className?: string;
}) {
  switch (source) {
    case "email":
      return <Mail className={className} aria-label="email" />;
    case "whatsapp":
      return <Smartphone className={className} aria-label="whatsapp" />;
    case "telegram":
      return <Send className={className} aria-label="telegram" />;
    case "chat":
    default:
      return <MessageCircle className={className} aria-label="chat" />;
  }
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  const t = useTranslation();
  const map: Record<ConversationStatus, { label: string; className: string }> = {
    new: {
      label: t("messages.filter.new"),
      className: "bg-sky-100 text-sky-800 border-sky-200",
    },
    in_progress: {
      label: t("messages.filter.inProgress"),
      className: "bg-amber-100 text-amber-800 border-amber-200",
    },
    closed: {
      label: t("messages.filter.closed"),
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };
  const m = map[status];
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${m.className}`}
    >
      {m.label}
    </span>
  );
}

function ChatEmptyState() {
  const t = useTranslation();
  return (
    <div className="flex flex-1 items-center justify-center p-8 text-center">
      <div className="max-w-sm space-y-3 rounded-[2rem] border border-amber-100 bg-white/80 p-8 shadow-[0_18px_55px_rgba(120,72,12,0.08)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
          <Inbox className="h-7 w-7 text-amber-700" />
        </div>
        <h2 className="font-black text-[#5c3b10]">{t("messages.empty.title")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("messages.empty.subtitle")}
        </p>
      </div>
    </div>
  );
}

function EmptyList() {
  const t = useTranslation();
  return (
    <div className="m-2 space-y-2 rounded-3xl border border-dashed border-amber-200 bg-white/70 p-8 text-center">
      <Inbox className="mx-auto h-8 w-8 text-amber-600" />
      <p className="text-sm text-muted-foreground">{t("messages.listEmpty")}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex animate-pulse gap-3 rounded-3xl bg-white/80 p-3.5">
          <div className="h-12 w-12 rounded-2xl bg-amber-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded bg-amber-100 w-1/2" />
            <div className="h-2.5 rounded bg-amber-100 w-3/4" />
            <div className="h-2.5 rounded bg-amber-100 w-2/3" />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatTime(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" });
}

function formatRelative(d: string | Date | null | undefined): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "teď";
  if (min < 60) return `${min} min`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} d`;
  return date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit" });
}
