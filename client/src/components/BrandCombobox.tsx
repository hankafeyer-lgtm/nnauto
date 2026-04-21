import { useEffect, useState } from "react";
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

const warmedBrandIconUrls = new Set<string>();

// Prefer the 120x-smaller WebP version when the source is a bundled brand logo.
function brandIconWarmUrl(src: string): string {
  try {
    if (src.startsWith("/brand-logos/")) {
      return src
        .replace("/brand-logos/", "/brand-logos-webp/")
        .replace(/\.(png|jpg|jpeg)$/i, ".webp");
    }
  } catch {
    /* fall back to original */
  }
  return src;
}

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

  useEffect(() => {
    const imageUrls = brands
      .map((brand) => (brand.icon?.type === "image" ? brand.icon.src : null))
      .filter((src): src is string => typeof src === "string" && src.length > 0)
      .filter((src) => !warmedBrandIconUrls.has(src));

    if (!imageUrls.length) return;

    const warm = (url: string) => {
      warmedBrandIconUrls.add(url);
      const img = new Image();
      img.decoding = "async";
      img.src = brandIconWarmUrl(url);
    };

    // Warm visible part quickly, rest in idle to avoid UI jank.
    const immediate = imageUrls.slice(0, 18);
    const deferred = imageUrls.slice(18);
    immediate.forEach(warm);

    if (!deferred.length) return;
    const idleApi = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout: number },
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleApi.requestIdleCallback) {
      const id = idleApi.requestIdleCallback(
        () => {
          deferred.forEach(warm);
        },
        { timeout: 250 },
      );
      return () => idleApi.cancelIdleCallback?.(id);
    }
    const timeout = window.setTimeout(() => {
      deferred.forEach(warm);
    }, 80);
    return () => window.clearTimeout(timeout);
  }, [brands]);

  const selectedBrand = brands.find((brand) => brand.value === value);
  const renderBrandIcon = (
    icon?: BrandIconEntry,
    sizeClass = "h-5 w-5",
    loading: "lazy" | "eager" = "eager",
  ) => {
    if (!icon) return null;

    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background shadow-sm">
        <BrandIconRenderer icon={icon} className={sizeClass} loading={loading} />
      </span>
    );
  };

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
            "w-full justify-between h-12 rounded-xl text-black dark:text-white touch-manipulation",
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
                {renderBrandIcon(selectedBrand.icon)}
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
        className="w-[--radix-popover-trigger-width] p-0 z-[100] touch-manipulation"
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
                  <div className="flex items-center gap-3">
                    {renderBrandIcon(brand.icon)}
                    <span className="font-medium">{brand.label}</span>
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
