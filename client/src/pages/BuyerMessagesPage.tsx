import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Send, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation, Link } from "@/lib/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import LoginModal from "@/components/LoginModal";
import { useTranslation } from "@/lib/translations";
import {
  CHAT_COMPOSE_PREFILL_STORAGE_KEY,
  type ChatComposePrefillPayload,
} from "@/lib/chatComposePrefill";

type Conversation = {
  id: string;
  listingId: string;
  status: string;
  role: "buyer" | "seller";
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  clientName: string | null;
  clientEmail: string | null;
  listing: {
    title?: string;
    brand?: string;
    model?: string;
    photos?: string[] | null;
  } | null;
};

type Message = {
  id: string;
  conversationId: string;
  sender: "client" | "dealer" | "system";
  content: string;
  createdAt: string;
};

export default function BuyerMessagesPage() {
  const t = useTranslation();
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginModalTab, setLoginModalTab] = useState<"login" | "register">(
    "login",
  );
  /** Avoid duplicate ensure POST (e.g. React Strict Mode double effect). */
  const listingEnsureLockRef = useRef(false);

  /** Open conversation from ?conversationId= or bootstrap from ?listingId= */
  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const cid = searchParams.get("conversationId");
    const lid = searchParams.get("listingId");

    if (cid) {
      setSelectedId(cid);
      return;
    }

    if (!lid || listingEnsureLockRef.current) return;
    listingEnsureLockRef.current = true;

    void (async () => {
      try {
        const res = await apiRequest(
          "POST",
          "/api/messages/conversations/ensure-from-listing",
          { listingId: lid },
        );
        const data = (await res.json()) as { conversationId?: string };
        if (data?.conversationId) {
          setSelectedId(data.conversationId);
          router.replace(
            `/zpravy?conversationId=${encodeURIComponent(data.conversationId)}`,
          );
        }
      } catch {
        /* ignore */
      } finally {
        listingEnsureLockRef.current = false;
      }
    })();
  }, [isLoading, isAuthenticated, searchParams, router]);

  const handleBackFromChat = useCallback(() => {
    setSelectedId(null);
    navigate("/zpravy");
  }, [navigate]);

  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{t("messages.heading")}</h1>
          <p className="text-muted-foreground text-center mb-2 max-w-md">
            Pro psaní do chatu je potřeba se zaregistrovat nebo přihlásit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setLoginModalTab("login");
                setShowLogin(true);
              }}
            >
              Přihlásit se
            </Button>
            <Button
              onClick={() => {
                setLoginModalTab("register");
                setShowLogin(true);
              }}
            >
              Registrovat se
            </Button>
          </div>
          <LoginModal
            open={showLogin}
            onOpenChange={setShowLogin}
            initialTab={loginModalTab}
          />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background flex flex-col">
        <div className="container mx-auto max-w-4xl px-4 py-6 flex flex-col flex-1 min-h-0 min-h-[calc(100dvh-10rem)]">
          <h1 className="text-2xl font-bold mb-4 shrink-0">{t("messages.heading")}</h1>
          {selectedId ? (
            <ChatView
              conversationId={selectedId}
              onBack={handleBackFromChat}
            />
          ) : (
            <ConversationList onSelect={setSelectedId} />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ConversationList({ onSelect }: { onSelect: (id: string) => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["/api/messages/conversations"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/messages/conversations");
      return res.json() as Promise<{ conversations: Conversation[] }>;
    },
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  const conversations = data?.conversations ?? [];

  if (conversations.length === 0) {
    return (
      <Card className="shrink-0">
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Zatím nemáte žádné zprávy. Napište prodejci z inzerátu auta.
          </p>
          <Link href="/listings">
            <Button variant="outline" className="mt-4">
              Prohlédnout inzeráty
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2 shrink-0 overflow-y-auto pb-4">
      {conversations.map((c) => {
        const carTitle = c.listing
          ? `${c.listing.brand ?? ""} ${c.listing.model ?? ""}`.trim() ||
            c.listing.title ||
            "Inzerát"
          : "Inzerát";
        const roleLabel =
          c.role === "seller"
            ? c.clientName || c.clientEmail || "Zájemce"
            : carTitle;
        const subtitle = c.role === "seller" ? carTitle : null;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c.id)}
            className="w-full text-left rounded-xl border p-4 hover:bg-accent transition-colors flex items-start gap-3"
          >
            {c.listing?.photos?.[0] ? (
              <img
                src={`/img/${c.listing.photos[0].replace(/^\/+/, "")}?w=80&q=70&f=webp`}
                alt=""
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                {(c.clientName || "?")[0].toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{roleLabel}</p>
                {c.unreadCount > 0 && (
                  <span className="shrink-0 h-5 min-w-5 rounded-full bg-[#B8860B] text-white text-xs flex items-center justify-center px-1.5 font-medium">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {c.lastMessagePreview || "Žádné zprávy"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    c.role === "seller"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {c.role === "seller" ? "Prodávám" : "Kupuji"}
                </span>
                {c.lastMessageAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.lastMessageAt).toLocaleDateString("cs-CZ")}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatView({
  conversationId,
  onBack,
}: {
  conversationId: string;
  onBack: () => void;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const [confirmDeleteChat, setConfirmDeleteChat] = useState(false);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState<
    string | null
  >(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/messages/conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        `/api/messages/conversations/${conversationId}/messages`,
      );
      return res.json() as Promise<{
        conversation: unknown;
        messages: Message[];
        role?: "buyer" | "seller";
      }>;
    },
    refetchInterval: 15_000,
  });

  const messages = data?.messages ?? [];
  const role = data?.role;
  /**
   * Only messages authored by the current user can be deleted. The
   * server enforces the same rule, but mirroring it on the client
   * avoids showing a delete affordance we know will 403.
   */
  const ownSender: "client" | "dealer" | null =
    role === "buyer" ? "client" : role === "seller" ? "dealer" : null;

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      await apiRequest(
        "DELETE",
        `/api/messages/conversations/${conversationId}/messages/${messageId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversations", conversationId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversations"],
      });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(
        "DELETE",
        `/api/messages/conversations/${conversationId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversations"],
      });
      onBack();
    },
  });

  /** Draft from listing detail — not sent until Odeslat. */
  useEffect(() => {
    if (isLoading) return;
    if (messages.length > 0) return;
    try {
      const raw = sessionStorage.getItem(CHAT_COMPOSE_PREFILL_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ChatComposePrefillPayload;
      if (parsed.conversationId !== conversationId || !parsed.text?.trim()) {
        return;
      }
      setDraft((d) => (d.trim() ? d : parsed.text.trim()));
      sessionStorage.removeItem(CHAT_COMPOSE_PREFILL_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, [isLoading, conversationId, messages.length]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest(
        "POST",
        `/api/messages/conversations/${conversationId}/messages`,
        { content },
      );
      return res.json();
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversations", conversationId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages/conversations"],
      });
    },
  });

  const send = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    sendMutation.mutate(t);
  }, [draft, sendMutation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-0">
      <div className="flex items-center gap-3 mb-3 shrink-0">
        <Button variant="ghost" size="sm" onClick={onBack} type="button">
          <ArrowLeft className="h-4 w-4 mr-1" /> Zpět
        </Button>
        <span className="text-sm text-muted-foreground">Konverzace</span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setConfirmDeleteChat(true)}
          disabled={deleteConversationMutation.isPending}
          className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
          aria-label="Smazat chat"
          data-testid="button-delete-chat"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">Smazat chat</span>
        </Button>
      </div>

      <div className="flex-1 min-h-0 flex flex-col rounded-xl border bg-muted/10 overflow-hidden">
        <div className="flex-1 overflow-y-auto overscroll-contain space-y-3 p-4 min-h-[200px]">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
            </div>
          ) : isError ? (
            <p className="text-center text-destructive py-8 text-sm">
              Konverzaci se nepodařilo načíst.
            </p>
          ) : messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Zatím žádné zprávy — napište první zprávu níže.
            </p>
          ) : (
            messages.map((m) => {
              const isOwn = ownSender !== null && m.sender === ownSender;
              const isSystem = m.sender === "system";
              return (
                <div
                  key={m.id}
                  className={`group relative max-w-[85%] sm:max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                    m.sender === "client"
                      ? "ml-auto bg-[#B8860B] text-white"
                      : isSystem
                        ? "mx-auto bg-muted text-muted-foreground text-center text-xs"
                        : "mr-auto bg-card border"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      m.sender === "client"
                        ? "text-white/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {new Date(m.createdAt).toLocaleString("cs-CZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "numeric",
                      month: "numeric",
                    })}
                  </p>
                  {isOwn && !isSystem && (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteMessageId(m.id)}
                      disabled={deleteMessageMutation.isPending}
                      title="Smazat zprávu"
                      aria-label="Smazat zprávu"
                      data-testid={`button-delete-message-${m.id}`}
                      className={`absolute -top-2 ${
                        m.sender === "client" ? "-left-2" : "-right-2"
                      } h-6 w-6 rounded-full bg-background border shadow-sm flex items-center justify-center text-destructive opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity disabled:opacity-50`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 border-t bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 items-stretch">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Napište zprávu..."
              className="min-h-[48px] max-h-40 resize-y sm:min-h-[44px] flex-1"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
                  e.preventDefault();
                  send();
                }
              }}
              aria-label="Text zprávy"
            />
            <Button
              type="button"
              onClick={send}
              disabled={!draft.trim() || sendMutation.isPending}
              className="shrink-0 h-11 sm:h-auto sm:min-w-[7.5rem] gap-2 bg-[#B8860B] hover:bg-[#9c7308]"
            >
              {sendMutation.isPending ? (
                <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
              ) : (
                <Send className="h-4 w-4 sm:mr-0" />
              )}
              <span>Odeslat</span>
            </Button>
          </div>
        </div>
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
