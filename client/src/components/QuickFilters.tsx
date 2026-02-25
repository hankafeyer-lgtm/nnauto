import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export default function QuickFilters() {
  const filters = [
    "SUV",
    "Sedan",
    "Hatchback",
    "Elektro",
    "Pod €20,000",
    "Automatická",
    "2020+",
  ];

  const handleFilterClick = (filter: string) => {
    console.log("Quick filter clicked:", filter);
  };

  const handleClearAll = () => {
    console.log("Clear all filters");
  };

  return (
    <div className="bg-card border-b p-4">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Rychlé filtry:</span>
          <div className="flex gap-2 flex-nowrap">
            {filters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="whitespace-nowrap cursor-pointer hover-elevate active-elevate-2"
                onClick={() => handleFilterClick(filter)}
                data-testid={`badge-filter-${filter.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {filter}
              </Badge>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-1" />
            Vymazat
          </Button>
        </div>
      </div>
    </div>
  );
}
