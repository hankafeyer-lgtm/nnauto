import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/lib/translations";
import { useLocation, Link } from "@/lib/navigation";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import LoginModal from "@/components/LoginModal";

type Conversation = {
  id: string;
  listingId: string;
  status: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  unreadClientCount: number;
  listing: { title?: string; brand?: string; model?: string; photos?: string[] | null } | null;
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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <Header />
        <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Moje zprávy</h1>
          <p className="text-muted-foreground mb-6">
            Pro zobrazení zpráv se prosím přihlaste.
          </p>
          <Button onClick={() => setShowLogin(true)}>Přihlásit se</Button>
          <LoginModal open={showLogin} onOpenChange={setShowLogin} />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Moje zprávy</h1>
          {selectedId ? (
            <ChatView
              conversationId={selectedId}
              onBack={() => setSelectedId(null)}
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
      <Card>
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
    <div className="space-y-2">
      {conversations.map((c) => {
        const title = c.listing
          ? `${c.listing.brand ?? ""} ${c.listing.model ?? ""}`.trim() || c.listing.title || "Inzerát"
          : "Inzerát";
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
              <div className="w-12 h-12 rounded-lg bg-muted shrink-0 flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{title}</p>
                {c.unreadClientCount > 0 && (
                  <span className="shrink-0 h-5 min-w-5 rounded-full bg-[#B8860B] text-white text-xs flex items-center justify-center px-1.5 font-medium">
                    {c.unreadClientCount}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate mt-0.5">
                {c.lastMessagePreview || "Žádné zprávy"}
              </p>
              {c.lastMessageAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(c.lastMessageAt).toLocaleDateString("cs-CZ")}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChatView({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/messages/conversations", conversationId, "messages"],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/messages/conversations/${conversationId}/messages`);
      return res.json() as Promise<{ conversation: any; messages: Message[] }>;
    },
    refetchInterval: 15_000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", `/api/messages/conversations/${conversationId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations"] });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  const messages = data?.messages ?? [];

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px]">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Zpět
        </Button>
        <span className="text-sm text-muted-foreground">Konverzace</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 border rounded-xl p-4 bg-muted/10">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 border-2 border-[#B8860B]/30 border-t-[#B8860B] rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Zatím žádné zprávy</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                m.sender === "client"
                  ? "ml-auto bg-[#B8860B] text-white"
                  : m.sender === "system"
                    ? "mx-auto bg-muted text-muted-foreground text-center text-xs"
                    : "mr-auto bg-card border"
              }`}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
              <p className={`text-[10px] mt-1 ${m.sender === "client" ? "text-white/70" : "text-muted-foreground"}`}>
                {new Date(m.createdAt).toLocaleString("cs-CZ", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "numeric" })}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <div className="mt-3 flex gap-2">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Napište zprávu..."
          className="min-h-[44px] max-h-32 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && draft.trim()) {
              e.preventDefault();
              sendMutation.mutate(draft.trim());
            }
          }}
        />
        <Button
          onClick={() => draft.trim() && sendMutation.mutate(draft.trim())}
          disabled={!draft.trim() || sendMutation.isPending}
          size="icon"
          className="shrink-0 h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
