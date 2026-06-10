import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, RotateCcw, Search, Trash2 } from "lucide-react";

type DeletedConversation = {
  id: string;
  dealerUserId: string;
  dealerEmail: string | null;
  clientName: string | null;
  clientEmail: string | null;
  clientPhone: string | null;
  source: string;
  status: string;
  listingId: string;
  listingTitle: string | null;
  listingBrand: string | null;
  listingModel: string | null;
  lastMessagePreview: string | null;
  messageCount: number;
  deletedAt: string | null;
  createdAt: string | null;
};

function carLabel(c: DeletedConversation): string {
  return (
    c.listingTitle ||
    [c.listingBrand, c.listingModel].filter(Boolean).join(" ") ||
    "Vozidlo"
  );
}

function fmtDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("cs-CZ");
}

export default function AdminDeletedMessages() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery<{ conversations: DeletedConversation[] }>({
    queryKey: ["/api/admin/messages/deleted"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/messages/deleted");
      return res.json();
    },
  });

  const conversations = useMemo(
    () => data?.conversations ?? [],
    [data],
  );

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/admin/messages/${id}/restore`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages/deleted"] });
      toast({ title: "Konverzace obnovena" });
    },
    onError: () => {
      toast({ title: "Obnovení se nezdařilo", variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) =>
      [
        carLabel(c),
        c.clientName,
        c.clientEmail,
        c.clientPhone,
        c.dealerEmail,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [conversations, search]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Smazané zprávy
            </CardTitle>
            <CardDescription>
              Konverzace smazané dealery nebo zájemci zůstávají v databázi a lze je obnovit.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Hledat (auto, klient, dealer)…"
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Načítám…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
            <Trash2 className="h-10 w-10 opacity-30" />
            <p className="font-semibold">
              {conversations.length === 0
                ? "Žádné smazané konverzace"
                : "Nic neodpovídá hledání"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Auto</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Dealer</TableHead>
                  <TableHead className="text-center">Zpráv</TableHead>
                  <TableHead>Smazáno</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-semibold">{carLabel(c)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{c.clientName || "Zájemce"}</span>
                        <span className="text-xs text-muted-foreground">
                          {c.clientEmail || c.clientPhone || "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.dealerEmail || c.dealerUserId}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{c.messageCount}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtDate(c.deletedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => restoreMutation.mutate(c.id)}
                        disabled={
                          restoreMutation.isPending &&
                          restoreMutation.variables === c.id
                        }
                      >
                        {restoreMutation.isPending &&
                        restoreMutation.variables === c.id ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-1 h-3.5 w-3.5" />
                        )}
                        Obnovit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
