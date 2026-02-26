// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { ChevronDown } from "lucide-react";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useTranslation } from "@/lib/translations";

// interface PriceRangeInputProps {
//   minValue: number | undefined;
//   maxValue: number | undefined;
//   onMinChange: (value: number | undefined) => void;
//   onMaxChange: (value: number | undefined) => void;
//   className?: string;
//   variant?: "hero" | "sidebar" | "mobile";
//   testIdPrefix?: string;
// }

// const priceOptions = [
//   0,
//   50000,
//   100000,
//   150000,
//   200000,
//   250000,
//   300000,
//   400000,
//   500000,
//   600000,
//   700000,
//   800000,
//   900000,
//   1000000,
//   1500000,
//   2000000,
//   3000000,
//   5000000,
//   10000000,
//   20000000,
// ];

// export function PriceRangeInput({
//   minValue,
//   maxValue,
//   onMinChange,
//   onMaxChange,
//   className = "",
//   variant = "sidebar",
//   testIdPrefix = "price",
// }: PriceRangeInputProps) {
//   const { language } = useLanguage();
//   const t = useTranslation();
//   const [showCustomInputs, setShowCustomInputs] = useState(false);
//   const [minOpen, setMinOpen] = useState(false);
//   const [maxOpen, setMaxOpen] = useState(false);
//   const [minInputValue, setMinInputValue] = useState("");
//   const [maxInputValue, setMaxInputValue] = useState("");
//   const [customMinValue, setCustomMinValue] = useState("");
//   const [customMaxValue, setCustomMaxValue] = useState("");
//   const customMinRef = useRef<HTMLInputElement>(null);

//   const formatNumber = (value: number): string => {
//     if (value === 0) return "";
//     return new Intl.NumberFormat(
//       language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US"
//     ).format(value);
//   };

//   const parseNumber = (str: string): number => {
//     const cleaned = str.replace(/[^\d]/g, "");
//     return parseInt(cleaned, 10) || 0;
//   };

//   useEffect(() => {
//     setMinInputValue(minValue && minValue > 0 ? formatNumber(minValue) : "");
//   }, [minValue, language]);

//   useEffect(() => {
//     setMaxInputValue(maxValue && maxValue < 20000000 ? formatNumber(maxValue) : "");
//   }, [maxValue, language]);

//   const handleMinSelect = (value: number) => {
//     if (value === 0) {
//       setMinInputValue("");
//       onMinChange(undefined);
//     } else {
//       setMinInputValue(formatNumber(value));
//       onMinChange(value);
//     }
//     setMinOpen(false);
//   };

//   const handleMaxSelect = (value: number) => {
//     if (value === 0) {
//       setMaxInputValue("");
//       onMaxChange(undefined);
//     } else {
//       setMaxInputValue(formatNumber(value));
//       onMaxChange(value);
//     }
//     setMaxOpen(false);
//   };

//   const handleCustomToggle = () => {
//     setShowCustomInputs(!showCustomInputs);
//     if (!showCustomInputs) {
//       setTimeout(() => {
//         customMinRef.current?.focus();
//       }, 100);
//     }
//   };

//   const handleCustomMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value;
//     const parsed = parseNumber(raw);
//     if (parsed > 0) {
//       setCustomMinValue(formatNumber(parsed));
//     } else {
//       setCustomMinValue("");
//     }
//   };

//   const handleCustomMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value;
//     const parsed = parseNumber(raw);
//     if (parsed > 0) {
//       setCustomMaxValue(formatNumber(parsed));
//     } else {
//       setCustomMaxValue("");
//     }
//   };

//   const handleCustomMinBlur = () => {
//     const parsed = parseNumber(customMinValue);
//     if (parsed > 0) {
//       onMinChange(parsed);
//       setMinInputValue(formatNumber(parsed));
//     } else {
//       onMinChange(undefined);
//       setMinInputValue("");
//     }
//   };

//   const handleCustomMaxBlur = () => {
//     const parsed = parseNumber(customMaxValue);
//     if (parsed > 0) {
//       onMaxChange(parsed);
//       setMaxInputValue(formatNumber(parsed));
//     } else {
//       onMaxChange(undefined);
//       setMaxInputValue("");
//     }
//   };

//   const dropdownInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white pr-8 cursor-pointer"
//     : "h-10 text-black dark:text-white pr-8 cursor-pointer";

//   const manualInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//     : "h-10 text-black dark:text-white";

//   const formatPriceLabel = (value: number): string => {
//     if (value === 0) return "-";
//     if (value >= 1000000) {
//       return `${(value / 1000000).toLocaleString(language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US")} M Kč`;
//     }
//     return `${value.toLocaleString(language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US")} Kč`;
//   };

//   const customLabel = language === "cs" ? "vlastní výběr" : language === "uk" ? "власний вибір" : "custom";

//   return (
//     <div className={`space-y-2 ${className}`}>
//       {/* Row 1: Dropdown fields */}
//       <div className="grid grid-cols-2 gap-2">
//         <Popover open={minOpen} onOpenChange={setMinOpen}>
//           <PopoverTrigger asChild>
//             <div className="relative cursor-pointer" onClick={() => setMinOpen(true)}>
//               <Input
//                 type="text"
//                 value={minInputValue}
//                 readOnly
//                 placeholder={t("hero.from")}
//                 className={dropdownInputClass}
//                 data-testid={`input-${testIdPrefix}-min`}
//               />
//               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
//             </div>
//           </PopoverTrigger>
//           <PopoverContent className="w-48 p-1 max-h-64 overflow-y-auto" align="start">
//             <div className="flex flex-col">
//               {priceOptions.map((price) => (
//                 <Button
//                   key={price}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMinSelect(price)}
//                   data-testid={`option-${testIdPrefix}-min-${price}`}
//                 >
//                   {formatPriceLabel(price)}
//                 </Button>
//               ))}
//             </div>
//           </PopoverContent>
//         </Popover>

//         <Popover open={maxOpen} onOpenChange={setMaxOpen}>
//           <PopoverTrigger asChild>
//             <div className="relative cursor-pointer" onClick={() => setMaxOpen(true)}>
//               <Input
//                 type="text"
//                 value={maxInputValue}
//                 readOnly
//                 placeholder={t("hero.to")}
//                 className={dropdownInputClass}
//                 data-testid={`input-${testIdPrefix}-max`}
//               />
//               <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
//             </div>
//           </PopoverTrigger>
//           <PopoverContent className="w-48 p-1 max-h-64 overflow-y-auto" align="end">
//             <div className="flex flex-col">
//               {priceOptions.filter(p => p === 0 || !minValue || p >= minValue).map((price) => (
//                 <Button
//                   key={price}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMaxSelect(price)}
//                   data-testid={`option-${testIdPrefix}-max-${price}`}
//                 >
//                   {formatPriceLabel(price)}
//                 </Button>
//               ))}
//             </div>
//           </PopoverContent>
//         </Popover>
//       </div>

//       {/* Row 2: Custom button */}
//       <Button
//         type="button"
//         variant={showCustomInputs ? "default" : "outline"}
//         className={`w-full h-auto py-2 px-3 text-xs ${!showCustomInputs ? 'text-black dark:text-white' : ''} ${showCustomInputs ? 'toggle-elevated' : ''} toggle-elevate`}
//         onClick={handleCustomToggle}
//         data-testid={`button-${testIdPrefix}-custom`}
//       >
//         {customLabel}
//       </Button>

//       {/* Row 3: Manual input fields (only shown when custom is active) */}
//       {showCustomInputs && (
//         <div className="grid grid-cols-2 gap-2">
//           <Input
//             ref={customMinRef}
//             type="text"
//             value={customMinValue}
//             onChange={handleCustomMinChange}
//             onBlur={handleCustomMinBlur}
//             placeholder={t("hero.from")}
//             className={manualInputClass}
//             data-testid={`input-${testIdPrefix}-custom-min`}
//           />
//           <Input
//             type="text"
//             value={customMaxValue}
//             onChange={handleCustomMaxChange}
//             onBlur={handleCustomMaxBlur}
//             placeholder={t("hero.to")}
//             className={manualInputClass}
//             data-testid={`input-${testIdPrefix}-custom-max`}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

interface PriceRangeInputProps {
  minValue: number | undefined;
  maxValue: number | undefined;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  className?: string;
  variant?: "hero" | "sidebar" | "mobile";
  testIdPrefix?: string;
}

const priceOptions = [
  0, 50000, 100000, 150000, 200000, 250000, 300000, 400000, 500000, 600000,
  700000, 800000, 900000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000,
  20000000,
];

export function PriceRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className = "",
  variant = "sidebar",
  testIdPrefix = "price",
}: PriceRangeInputProps) {
  const { language } = useLanguage();
  const t = useTranslation();

  const [showCustomInputs, setShowCustomInputs] = useState(false);
  const [minOpen, setMinOpen] = useState(false);
  const [maxOpen, setMaxOpen] = useState(false);

  const [minInputValue, setMinInputValue] = useState("");
  const [maxInputValue, setMaxInputValue] = useState("");
  const [customMinValue, setCustomMinValue] = useState("");
  const [customMaxValue, setCustomMaxValue] = useState("");

  const customMinRef = useRef<HTMLInputElement>(null);

  // ✅ “мобілка/тач” (coarse pointer) — не автофокусимо
  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }, []);

  // ✅ для кастомних інпутів: як у combobox
  const [canTypeMin, setCanTypeMin] = useState(false);
  const [canTypeMax, setCanTypeMax] = useState(false);

  const locale =
    language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US";

  const formatNumber = (value: number): string => {
    if (value === 0) return "";
    return new Intl.NumberFormat(locale).format(value);
  };

  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^\d]/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  useEffect(() => {
    setMinInputValue(minValue && minValue > 0 ? formatNumber(minValue) : "");
  }, [minValue, language]);

  useEffect(() => {
    setMaxInputValue(
      maxValue && maxValue < 20000000 ? formatNumber(maxValue) : "",
    );
  }, [maxValue, language]);

  const handleMinSelect = (value: number) => {
    if (value === 0) {
      setMinInputValue("");
      onMinChange(undefined);
    } else {
      setMinInputValue(formatNumber(value));
      onMinChange(value);
    }
    setMinOpen(false);
  };

  const handleMaxSelect = (value: number) => {
    if (value === 0) {
      setMaxInputValue("");
      onMaxChange(undefined);
    } else {
      setMaxInputValue(formatNumber(value));
      onMaxChange(value);
    }
    setMaxOpen(false);
  };

  const handleCustomToggle = () => {
    setShowCustomInputs((prev) => {
      const next = !prev;

      // ✅ при відкритті: НЕ фокусимо на мобілці (бо клава)
      if (next) {
        setCanTypeMin(false);
        setCanTypeMax(false);

        if (!isCoarsePointer) {
          window.setTimeout(() => customMinRef.current?.focus(), 100);
        }
      }

      return next;
    });
  };

  const handleCustomMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(e.target.value);
    setCustomMinValue(parsed > 0 ? formatNumber(parsed) : "");
  };

  const handleCustomMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseNumber(e.target.value);
    setCustomMaxValue(parsed > 0 ? formatNumber(parsed) : "");
  };

  const handleCustomMinBlur = () => {
    const parsed = parseNumber(customMinValue);
    if (parsed > 0) {
      onMinChange(parsed);
      setMinInputValue(formatNumber(parsed));
    } else {
      onMinChange(undefined);
      setMinInputValue("");
    }
    setCanTypeMin(false); // ✅ після blur знов “без вводу”
  };

  const handleCustomMaxBlur = () => {
    const parsed = parseNumber(customMaxValue);
    if (parsed > 0) {
      onMaxChange(parsed);
      setMaxInputValue(formatNumber(parsed));
    } else {
      onMaxChange(undefined);
      setMaxInputValue("");
    }
    setCanTypeMax(false);
  };

  const dropdownInputClass =
    variant === "hero"
      ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white pr-8 cursor-pointer"
      : "h-10 text-black dark:text-white pr-8 cursor-pointer";

  const manualInputClass =
    variant === "hero"
      ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white"
      : "h-10 text-black dark:text-white";

  const formatPriceLabel = (value: number): string => {
    if (value === 0) return "-";
    if (value >= 1000000)
      return `${(value / 1000000).toLocaleString(locale)} M Kč`;
    return `${value.toLocaleString(locale)} Kč`;
  };

  const customLabel =
    language === "cs"
      ? "vlastní výběr"
      : language === "uk"
        ? "власний вибір"
        : "custom";

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Row 1: Dropdown fields */}
      <div className="grid grid-cols-2 gap-2">
        <Popover open={minOpen} onOpenChange={setMinOpen}>
          <PopoverTrigger asChild>
            <div
              className="relative cursor-pointer"
              onClick={() => setMinOpen(true)}
            >
              <Input
                type="text"
                value={minInputValue}
                readOnly
                placeholder={t("hero.from")}
                className={dropdownInputClass}
                data-testid={`input-${testIdPrefix}-min`}
              />
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-1"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div
              className="max-h-64 overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {priceOptions.map((price) => (
                  <Button
                    key={price}
                    type="button"
                    variant="ghost"
                    className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                    onClick={() => handleMinSelect(price)}
                  >
                    {formatPriceLabel(price)}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={maxOpen} onOpenChange={setMaxOpen}>
          <PopoverTrigger asChild>
            <div
              className="relative cursor-pointer"
              onClick={() => setMaxOpen(true)}
            >
              <Input
                type="text"
                value={maxInputValue}
                readOnly
                placeholder={t("hero.to")}
                className={dropdownInputClass}
                data-testid={`input-${testIdPrefix}-max`}
              />
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="w-48 p-1"
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div
              className="max-h-64 overflow-y-auto"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {priceOptions
                  .filter((p) => p === 0 || !minValue || p >= minValue)
                  .map((price) => (
                    <Button
                      key={price}
                      type="button"
                      variant="ghost"
                      className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                      onClick={() => handleMaxSelect(price)}
                    >
                      {formatPriceLabel(price)}
                    </Button>
                  ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Row 2: Custom button */}
      <Button
        type="button"
        variant={showCustomInputs ? "default" : "outline"}
        className={`w-full h-auto py-2 px-3 text-xs ${
          !showCustomInputs ? "text-black dark:text-white" : ""
        } ${showCustomInputs ? "toggle-elevated" : ""} toggle-elevate`}
        onClick={handleCustomToggle}
        data-testid={`button-${testIdPrefix}-custom`}
      >
        {customLabel}
      </Button>

      {/* Row 3: Manual input fields */}
      {showCustomInputs && (
        <div className="grid grid-cols-2 gap-2">
          <Input
            ref={customMinRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customMinValue}
            onChange={handleCustomMinChange}
            onBlur={handleCustomMinBlur}
            placeholder={t("hero.from")}
            className={manualInputClass}
            // ✅ ключове: не відкривати клаву поки не “дозволили”
            readOnly={!canTypeMin}
            onPointerDown={() => setCanTypeMin(true)}
            onFocus={(e) => {
              if (!canTypeMin) e.target.blur();
            }}
            data-testid={`input-${testIdPrefix}-custom-min`}
          />

          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={customMaxValue}
            onChange={handleCustomMaxChange}
            onBlur={handleCustomMaxBlur}
            placeholder={t("hero.to")}
            className={manualInputClass}
            readOnly={!canTypeMax}
            onPointerDown={() => setCanTypeMax(true)}
            onFocus={(e) => {
              if (!canTypeMax) e.target.blur();
            }}
            data-testid={`input-${testIdPrefix}-custom-max`}
          />
        </div>
      )}
    </div>
  );
}
