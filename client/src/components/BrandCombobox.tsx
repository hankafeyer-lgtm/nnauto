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
import { BrandIconRenderer, type BrandIconEntry } from "@/lib/brandIcons";

interface BrandOption {
  value: string;
  label: string;
  icon?: BrandIconEntry;
}

interface BrandComboboxProps {
  brands: BrandOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  placeholder: string;
  emptyMessage: string;
  className?: string;
  testId?: string;
}

const normalizeSearchText = (value: string) =>
  String(value)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function BrandCombobox({
  brands,
  value,
  onValueChange,
  disabled = false,
  placeholder,
  emptyMessage,
  className,
  testId = "combobox-brand",
}: BrandComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const selectedBrand = brands.find((brand) => brand.value === value);

  return (
    // <Popover open={open} onOpenChange={setOpen} modal={true}>
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          return;
        } else {
          setSearchValue(""); // опційно
        }
      }}
      modal={true}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between h-12 rounded-xl text-black dark:text-white",
            className,
          )}
          disabled={disabled}
          data-testid={testId}
        >
          <span
            className={cn(
              "flex items-center gap-2",
              !selectedBrand && "text-muted-foreground",
            )}
          >
            {selectedBrand ? (
              <>
                {selectedBrand.icon && (
                  <BrandIconRenderer
                    icon={selectedBrand.icon}
                    className="w-4 h-4"
                  />
                )}
                {selectedBrand.label}
              </>
            ) : (
              placeholder
            )}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0 z-[100]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // ✅ ключове
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <Command
          filter={(value, search, keywords) => {
            const haystack = [value, ...(keywords ?? [])].join(" ");
            return normalizeSearchText(haystack).includes(
              normalizeSearchText(search),
            )
              ? 1
              : 0;
          }}
        >
          {/* <CommandInput
            placeholder={placeholder}
            value={searchValue}
            onValueChange={setSearchValue}
            data-testid={`${testId}-input`}
          /> */}
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
                value="all-brands-clear"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                  setSearchValue("");
                }}
                data-testid={`${testId}-option-all`}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0",
                  )}
                />
                <span className="font-medium">{placeholder}</span>
              </CommandItem>
              {brands.map((brand) => (
                <CommandItem
                  key={brand.value}
                  value={brand.label}
                  onSelect={() => {
                    onValueChange(brand.value);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  data-testid={`${testId}-option-${brand.value}`}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === brand.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <div className="flex items-center gap-2">
                    {brand.icon && (
                      <BrandIconRenderer
                        icon={brand.icon}
                        className="w-4 h-4"
                      />
                    )}
                    <span>{brand.label}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
