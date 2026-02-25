import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RegionOption {
  value: string;
  label: string;
}

interface RegionComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  regions: RegionOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

export function RegionCombobox({
  value,
  onValueChange,
  regions,
  placeholder = "Všechny regiony",
  emptyMessage = "Region nenalezen",
  disabled = false,
  className,
  testId = "select-region"
}: RegionComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedRegion = regions.find((region) => region.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-12 rounded-xl text-black dark:text-white",
            className
          )}
          disabled={disabled}
          data-testid={testId}
        >
          <span className="text-black dark:text-white">
            {selectedRegion ? selectedRegion.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[100]" align="start">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            data-testid={`${testId}-input`}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-regions-clear"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                  setSearchValue("");
                }}
                className="text-black dark:text-white"
                data-testid={`${testId}-option-all`}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="font-medium">{placeholder}</span>
              </CommandItem>
              {regions.map((region) => (
                <CommandItem
                  key={region.value}
                  value={region.label}
                  onSelect={() => {
                    onValueChange(region.value);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="text-black dark:text-white"
                  data-testid={`${testId}-option-${region.value}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === region.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>{region.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
