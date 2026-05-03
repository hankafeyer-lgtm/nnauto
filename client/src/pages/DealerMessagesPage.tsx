import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
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
      <main className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-7xl">
        <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 px-2 sm:px-0">
          <div className="flex items-center gap-3 min-w-0">
            <Inbox className="h-6 w-6 text-amber-700 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold truncate">
              {t("messages.heading")}
            </h1>
          </div>
          <Link
            href="/dealer"
            className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
            data-testid="link-back-to-cabinet"
          >
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("messages.backToCabinet")}</span>
          </Link>
        </div>

        <MessagesShell />
      </main>
      <Footer />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Shell — list + chat split layout
// ─────────────────────────────────────────────────────────────────────────────

function MessagesShell() {
  const t = useTranslation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    <div className="grid grid-cols-1 lg:grid-cols-[360px_minmax(0,1fr)] gap-0 lg:gap-4 border rounded-2xl overflow-hidden bg-card shadow-sm h-[calc(100vh-220px)] min-h-[520px]">
      {/* List pane */}
      <aside
        className={`border-r flex flex-col ${
          selected ? "hidden lg:flex" : "flex"
        }`}
        data-testid="conversation-list-pane"
      >
        <div className="p-3 border-b space-y-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("messages.searchPlaceholder")}
              className="pl-9"
              data-testid="input-search-conversations"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab.value}
                size="sm"
                variant={statusFilter === tab.value ? "default" : "outline"}
                className="h-7 text-xs px-2"
                onClick={() => setStatusFilter(tab.value)}
                data-testid={`filter-${tab.value}`}
              >
                {t(tab.key)}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.isLoading ? (
            <ListSkeleton />
          ) : conversationsQuery.isError ? (
            <div className="p-6 text-sm text-destructive">
              {t("messages.loadError")}
            </div>
          ) : conversations.length === 0 ? (
            <EmptyList />
          ) : (
            <ul className="divide-y">
              {conversations.map((c) => (
                <ConversationListItem
                  key={c.id}
                  c={c}
                  selected={c.id === selectedId}
                  onClick={() => setSelectedId(c.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Chat pane */}
      <section
        className={`flex flex-col ${selected ? "flex" : "hidden lg:flex"}`}
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
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// List item
// ─────────────────────────────────────────────────────────────────────────────

function ConversationListItem({
  c,
  selected,
  onClick,
}: {
  c: ConversationWithListing;
  selected: boolean;
  onClick: () => void;
}) {
  const t = useTranslation();
  const initials = (c.clientName || c.clientEmail || c.clientPhone || "?")
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`w-full text-left p-3 hover:bg-muted/50 transition flex gap-3 items-start ${
          selected ? "bg-muted/70" : ""
        }`}
        data-testid={`conversation-row-${c.id}`}
      >
        <div className="relative shrink-0">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-semibold">
            {initials}
          </div>
          <SourceIcon
            source={c.source as ConversationSource}
            className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-background border p-[2px] text-muted-foreground"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {c.clientName || c.clientEmail || c.clientPhone || t("messages.anonymous")}
            </span>
            {c.unreadDealerCount > 0 && (
              <Badge className="ml-auto bg-amber-700 hover:bg-amber-800 text-[10px] px-1.5">
                {c.unreadDealerCount}
              </Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {c.listing
              ? `${c.listing.brand.toUpperCase()} ${c.listing.model}`
              : t("messages.unknownListing")}
          </div>
          <div className="text-xs text-muted-foreground/90 line-clamp-1 mt-0.5">
            {c.lastMessagePreview || t("messages.noMessages")}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={c.status as ConversationStatus} />
            <span className="text-[10px] text-muted-foreground">
              {formatRelative(c.lastMessageAt || c.updatedAt)}
            </span>
          </div>
        </div>
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
    <div className="flex-1 flex flex-col min-h-0">
      <ChatHeader
        conversation={conversation}
        onBack={onBack}
        onChangeStatus={(s) => statusMutation.mutate(s)}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 bg-muted/30">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-12">
            {t("messages.threadEmpty")}
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} m={m} />)
        )}
      </div>

      <div className="border-t p-3 sm:p-4 space-y-2 bg-background">
        <div className="flex items-center gap-2 flex-wrap">
          <QuickRepliesMenu
            onPick={(text) => setDraft((d) => (d ? `${d}\n${text}` : text))}
          />
          {canSendEmail && conversation.source !== "email" && (
            <label className="text-xs flex items-center gap-1.5 cursor-pointer select-none">
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
            <Badge variant="outline" className="text-[10px] gap-1">
              <Mail className="h-3 w-3" />
              {t("messages.willSendEmail")}
            </Badge>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("messages.replyPlaceholder")}
            className="min-h-[56px] max-h-40 resize-none"
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
            className="gap-2 h-[56px]"
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
}: {
  conversation: Conversation & { listing?: ListingSummary | null };
  onBack: () => void;
  onChangeStatus: (s: ConversationStatus) => void;
}) {
  const t = useTranslation();
  const listing = conversation.listing;
  return (
    <div className="border-b p-3 sm:p-4 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="lg:hidden"
        data-testid="button-back-to-list"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <SourceIcon
        source={conversation.source as ConversationSource}
        className="h-5 w-5 text-muted-foreground shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate text-sm sm:text-base">
          {conversation.clientName ||
            conversation.clientEmail ||
            conversation.clientPhone ||
            t("messages.anonymous")}
        </div>
        <div className="text-xs text-muted-foreground truncate flex items-center gap-2">
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
            href={`/listing/${listing.id}`}
            className="text-xs text-amber-700 hover:underline inline-flex items-center gap-1"
            data-testid="link-listing"
          >
            <Smartphone className="h-3 w-3" />
            {listing.brand.toUpperCase()} {listing.model} ·{" "}
            {Number(listing.price).toLocaleString("cs-CZ")} Kč
          </Link>
        )}
      </div>
      <Select
        value={conversation.status}
        onValueChange={(v) => onChangeStatus(v as ConversationStatus)}
      >
        <SelectTrigger className="w-[150px]" data-testid="select-status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">{t("messages.filter.new")}</SelectItem>
          <SelectItem value="in_progress">{t("messages.filter.inProgress")}</SelectItem>
          <SelectItem value="closed">{t("messages.filter.closed")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ m }: { m: Message }) {
  const t = useTranslation();
  if (m.sender === "system") {
    return (
      <div className="flex justify-center">
        <div className="bg-amber-50 text-amber-900 border border-amber-200 text-xs rounded-full px-3 py-1 max-w-[80%]">
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
        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isDealer
            ? "bg-amber-700 text-white rounded-br-sm"
            : "bg-card border rounded-bl-sm"
        }`}
        data-testid={`message-bubble-${m.id}`}
      >
        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
          {m.content}
        </div>
        <div
          className={`flex items-center gap-1.5 mt-1 text-[10px] ${
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
            className="gap-1.5"
            data-testid="button-quick-replies"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            {t("messages.templates")}
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80 max-w-[90vw]">
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
                className="flex flex-col items-start gap-0.5"
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
      className: "bg-blue-100 text-blue-800 border-blue-200",
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
      className={`text-[10px] px-1.5 py-0 border rounded-full ${m.className}`}
    >
      {m.label}
    </span>
  );
}

function ChatEmptyState() {
  const t = useTranslation();
  return (
    <div className="flex-1 flex items-center justify-center text-center p-8">
      <div className="space-y-3 max-w-sm">
        <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto flex items-center justify-center">
          <Inbox className="h-7 w-7 text-amber-700" />
        </div>
        <h2 className="font-semibold">{t("messages.empty.title")}</h2>
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
    <div className="p-8 text-center space-y-2">
      <Inbox className="h-8 w-8 mx-auto text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{t("messages.listEmpty")}</p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <ul className="divide-y">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="p-3 flex gap-3 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-2.5 bg-muted rounded w-3/4" />
            <div className="h-2.5 bg-muted rounded w-2/3" />
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
