import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Grid3x3, List } from "lucide-react";
import { useTranslation } from "@/lib/translations";

interface SortBarProps {
  listingsCount?: number;
  sortBy: string;
  onSortChange: (value: string) => void;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
}

export default function SortBar({ 
  listingsCount = 0, 
  sortBy, 
  onSortChange,
  viewMode = "grid",
  onViewModeChange 
}: SortBarProps) {
  const t = useTranslation();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-card">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground" data-testid="text-listing-count">
          {t("hero.found")} <strong className="text-foreground">{listingsCount.toLocaleString()}</strong> {t("hero.automobiles")}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">{t("sort.sortBy")}:</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[180px]" data-testid="select-sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">{t("sort.newest")}</SelectItem>
              <SelectItem value="price-asc">{t("sort.priceAsc")}</SelectItem>
              <SelectItem value="price-desc">{t("sort.priceDesc")}</SelectItem>
              <SelectItem value="year-desc">{t("sort.yearDesc")}</SelectItem>
              <SelectItem value="year-asc">{t("sort.yearAsc")}</SelectItem>
              <SelectItem value="mileage-asc">{t("sort.mileageAsc")}</SelectItem>
              <SelectItem value="mileage-desc">{t("sort.mileageDesc")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="hidden sm:flex items-center gap-1 border rounded-md p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${viewMode === "grid" ? "toggle-elevate toggle-elevated" : ""}`}
            onClick={() => onViewModeChange?.("grid")}
            data-testid="button-view-grid"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${viewMode === "list" ? "toggle-elevate toggle-elevated" : ""}`}
            onClick={() => onViewModeChange?.("list")}
            data-testid="button-view-list"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
