// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { ChevronDown } from "lucide-react";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useTranslation } from "@/lib/translations";

// interface ListingAgeRangeInputProps {
//   minValue: number;
//   maxValue: number;
//   onMinChange: (value: number) => void;
//   onMaxChange: (value: number) => void;
//   className?: string;
//   variant?: "hero" | "sidebar" | "mobile";
//   testIdPrefix?: string;
// }

// const listingAgeOptions = [0, 1, 3, 7, 14, 30, 60, 90, 180, 365];

// export function ListingAgeRangeInput({
//   minValue,
//   maxValue,
//   onMinChange,
//   onMaxChange,
//   className = "",
//   variant = "sidebar",
//   testIdPrefix = "listing-age",
// }: ListingAgeRangeInputProps) {
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

//   const getDaysLabel = (days: number): string => {
//     if (days === 0) return "-";
//     if (language === "cs") {
//       if (days === 1) return "1 den";
//       if (days >= 2 && days <= 4) return `${days} dny`;
//       return `${days} dní`;
//     } else if (language === "uk") {
//       if (days === 1) return "1 день";
//       if (days >= 2 && days <= 4) return `${days} дні`;
//       return `${days} днів`;
//     } else {
//       if (days === 1) return "1 day";
//       return `${days} days`;
//     }
//   };

//   useEffect(() => {
//     setMinInputValue(minValue > 0 ? minValue.toString() : "");
//   }, [minValue]);

//   useEffect(() => {
//     setMaxInputValue(maxValue < 365 ? maxValue.toString() : "");
//   }, [maxValue]);

//   const handleMinSelect = (value: number) => {
//     if (value === 0) {
//       setMinInputValue("");
//       onMinChange(0);
//     } else {
//       setMinInputValue(value.toString());
//       onMinChange(value);
//     }
//     setMinOpen(false);
//   };

//   const handleMaxSelect = (value: number) => {
//     if (value === 0) {
//       setMaxInputValue("");
//       onMaxChange(365);
//     } else {
//       setMaxInputValue(value.toString());
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
//     const raw = e.target.value.replace(/\D/g, "");
//     setCustomMinValue(raw);
//   };

//   const handleCustomMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value.replace(/\D/g, "");
//     setCustomMaxValue(raw);
//   };

//   const handleCustomMinBlur = () => {
//     const parsed = parseInt(customMinValue, 10);
//     if (!isNaN(parsed) && parsed >= 0) {
//       onMinChange(parsed);
//       setMinInputValue(parsed.toString());
//     } else {
//       onMinChange(0);
//       setMinInputValue("");
//     }
//   };

//   const handleCustomMaxBlur = () => {
//     const parsed = parseInt(customMaxValue, 10);
//     if (!isNaN(parsed) && parsed > 0) {
//       onMaxChange(parsed);
//       setMaxInputValue(parsed.toString());
//     } else {
//       onMaxChange(365);
//       setMaxInputValue("");
//     }
//   };

//   const dropdownInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white pr-8 cursor-pointer"
//     : "h-10 text-black dark:text-white pr-8 cursor-pointer";

//   const manualInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//     : "h-10 text-black dark:text-white";

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
//           <PopoverContent className="w-32 p-1 max-h-64 overflow-y-auto" align="start">
//             <div className="flex flex-col">
//               {listingAgeOptions.map((days) => (
//                 <Button
//                   key={days}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMinSelect(days)}
//                   data-testid={`option-${testIdPrefix}-min-${days}`}
//                 >
//                   {getDaysLabel(days)}
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
//           <PopoverContent className="w-32 p-1 max-h-64 overflow-y-auto" align="end">
//             <div className="flex flex-col">
//               {listingAgeOptions.filter(d => d === 0 || d >= minValue).map((days) => (
//                 <Button
//                   key={days}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMaxSelect(days)}
//                   data-testid={`option-${testIdPrefix}-max-${days}`}
//                 >
//                   {getDaysLabel(days)}
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
//             maxLength={3}
//             data-testid={`input-${testIdPrefix}-custom-min`}
//           />
//           <Input
//             type="text"
//             value={customMaxValue}
//             onChange={handleCustomMaxChange}
//             onBlur={handleCustomMaxBlur}
//             placeholder={t("hero.to")}
//             className={manualInputClass}
//             maxLength={3}
//             data-testid={`input-${testIdPrefix}-custom-max`}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useMemo, useState, useRef, useEffect } from "react";
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

interface ListingAgeRangeInputProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  className?: string;
  variant?: "hero" | "sidebar" | "mobile";
  testIdPrefix?: string;
}

const listingAgeOptions = [0, 1, 3, 7, 14, 30, 60, 90, 180, 365];

export function ListingAgeRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className = "",
  variant = "sidebar",
  testIdPrefix = "listing-age",
}: ListingAgeRangeInputProps) {
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

  // ✅ coarse pointer = мобілка/тач
  const isCoarsePointer = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  }, []);

  // ✅ anti-keyboard
  const [canTypeMin, setCanTypeMin] = useState(false);
  const [canTypeMax, setCanTypeMax] = useState(false);

  const getDaysLabel = (days: number): string => {
    if (days === 0) return "-";
    if (language === "cs") {
      if (days === 1) return "1 den";
      if (days >= 2 && days <= 4) return `${days} dny`;
      return `${days} dní`;
    }
    if (language === "uk") {
      if (days === 1) return "1 день";
      if (days >= 2 && days <= 4) return `${days} дні`;
      return `${days} днів`;
    }
    return days === 1 ? "1 day" : `${days} days`;
  };

  useEffect(() => {
    setMinInputValue(minValue > 0 ? String(minValue) : "");
  }, [minValue]);

  useEffect(() => {
    setMaxInputValue(maxValue < 365 ? String(maxValue) : "");
  }, [maxValue]);

  const handleMinSelect = (value: number) => {
    if (value === 0) {
      setMinInputValue("");
      onMinChange(0);
    } else {
      setMinInputValue(String(value));
      onMinChange(value);
    }
    setMinOpen(false);
  };

  const handleMaxSelect = (value: number) => {
    if (value === 0) {
      setMaxInputValue("");
      onMaxChange(365);
    } else {
      setMaxInputValue(String(value));
      onMaxChange(value);
    }
    setMaxOpen(false);
  };

  const handleCustomToggle = () => {
    setShowCustomInputs((prev) => {
      const next = !prev;

      if (next) {
        setCanTypeMin(false);
        setCanTypeMax(false);

        // ✅ НЕ фокусимо на мобілці (бо клава)
        if (!isCoarsePointer) {
          window.setTimeout(() => customMinRef.current?.focus(), 100);
        }
      }

      return next;
    });
  };

  const handleCustomMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomMinValue(raw);
  };

  const handleCustomMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setCustomMaxValue(raw);
  };

  const handleCustomMinBlur = () => {
    const parsed = parseInt(customMinValue, 10);

    if (!Number.isNaN(parsed) && parsed >= 0) {
      onMinChange(parsed);
      setMinInputValue(parsed > 0 ? String(parsed) : "");
    } else {
      onMinChange(0);
      setMinInputValue("");
    }

    setCanTypeMin(false);
  };

  const handleCustomMaxBlur = () => {
    const parsed = parseInt(customMaxValue, 10);

    if (!Number.isNaN(parsed) && parsed > 0) {
      onMaxChange(parsed);
      setMaxInputValue(String(parsed));
    } else {
      onMaxChange(365);
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
            className="w-32 p-1"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div
              className="max-h-64 overflow-y-auto overscroll-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {listingAgeOptions.map((days) => (
                  <Button
                    key={days}
                    type="button"
                    variant="ghost"
                    className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                    onClick={() => handleMinSelect(days)}
                    data-testid={`option-${testIdPrefix}-min-${days}`}
                  >
                    {getDaysLabel(days)}
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
            className="w-32 p-1"
            align="end"
            onOpenAutoFocus={(e) => e.preventDefault()}
            onCloseAutoFocus={(e) => e.preventDefault()}
            onPointerDownCapture={(e) => e.stopPropagation()}
            onWheelCapture={(e) => e.stopPropagation()}
            onTouchMoveCapture={(e) => e.stopPropagation()}
          >
            <div
              className="max-h-64 overflow-y-auto overscroll-contain touch-pan-y"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheelCapture={(e) => e.stopPropagation()}
              onTouchMoveCapture={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col">
                {listingAgeOptions
                  .filter((d) => d === 0 || d >= minValue)
                  .map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant="ghost"
                      className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                      onClick={() => handleMaxSelect(days)}
                      data-testid={`option-${testIdPrefix}-max-${days}`}
                    >
                      {getDaysLabel(days)}
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
            maxLength={3}
            value={customMinValue}
            onChange={handleCustomMinChange}
            onBlur={handleCustomMinBlur}
            placeholder={t("hero.from")}
            className={manualInputClass}
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
            maxLength={3}
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
