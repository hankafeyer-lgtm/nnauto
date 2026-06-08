import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutDashboard,
  Car,
  Users,
  Building2,
  CreditCard,
  Link2,
  BarChart3,
  Settings,
  FileSpreadsheet,
  History,
  Menu,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  Icon: typeof LayoutDashboard;
  superOnly?: boolean;
};

const ITEMS: Item[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, superOnly: true },
  { id: "listings", label: "Inzeráty", Icon: Car },
  { id: "users", label: "Uživatelé", Icon: Users },
  { id: "dealers", label: "Dealeři", Icon: Building2 },
  { id: "payments", label: "Platby", Icon: CreditCard },
  { id: "integrace", label: "Integrace", Icon: Link2, superOnly: true },
  { id: "statistiky", label: "Statistiky", Icon: BarChart3, superOnly: true },
  { id: "nastaveni", label: "Nastavení", Icon: Settings, superOnly: true },
  { id: "cebia", label: "Cebia", Icon: FileSpreadsheet },
  { id: "deleted", label: "Smazané", Icon: History },
];

export default function AdminNav({
  activeTab,
  onSelect,
  superAdmin,
  counts,
  collapsed = false,
  onToggleCollapsed,
}: {
  activeTab: string;
  onSelect: (id: string) => void;
  superAdmin: boolean;
  counts: Record<string, number | undefined>;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const items = ITEMS.filter((i) => !i.superOnly || superAdmin);
  const active = items.find((i) => i.id === activeTab) ?? items[0];

  const Count = ({ id }: { id: string }) => {
    const n = counts[id];
    if (n === undefined) return null;
    return (
      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-bold tabular-nums text-muted-foreground">
        {n}
      </span>
    );
  };

  return (
    <div>
      {/* Mobile: section selector that opens the full menu */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left shadow-sm active:scale-[0.99]"
        >
          {active ? <active.Icon className="h-5 w-5 text-primary" /> : null}
          <span className="font-bold">{active?.label}</span>
          <Menu className="ml-auto h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] rounded-3xl p-4 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1">
            {items.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition active:scale-[0.99] ${
                    isActive
                      ? "border-primary/30 bg-primary/5 text-primary"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <item.Icon className="h-5 w-5 shrink-0" />
                  <span className="font-semibold">{item.label}</span>
                  <Count id={item.id} />
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop: sticky vertical sidebar (collapsible) */}
      <aside className="sticky top-4 hidden rounded-2xl border bg-card p-2 shadow-sm md:block">
        <div className={`mb-1 flex ${collapsed ? "justify-center" : "justify-end"}`}>
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label={collapsed ? "Rozbalit menu" : "Skrýt menu"}
            title={collapsed ? "Rozbalit menu" : "Skrýt menu"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className="grid gap-1">
          {items.map((item) => {
            const isActive = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                title={collapsed ? item.label : undefined}
                aria-label={item.label}
                className={`group flex items-center rounded-xl text-left text-sm transition ${
                  collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"
                } ${
                  isActive
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                  <>
                    <span className="truncate">{item.label}</span>
                    <Count id={item.id} />
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 transition ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                      }`}
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </div>
  );
}
