// import { useState, useRef, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { ChevronDown } from "lucide-react";
// import { useLanguage } from "@/contexts/LanguageContext";
// import { useTranslation } from "@/lib/translations";

// interface MileageRangeInputProps {
//   minValue: number;
//   maxValue: number;
//   onMinChange: (value: number) => void;
//   onMaxChange: (value: number) => void;
//   className?: string;
//   variant?: "hero" | "sidebar" | "mobile";
//   testIdPrefix?: string;
// }

// const mileageOptions = [
//   0,
//   10000,
//   20000,
//   30000,
//   50000,
//   75000,
//   100000,
//   125000,
//   150000,
//   200000,
//   250000,
//   300000,
//   400000,
//   500000,
//   600000,
// ];

// export function MileageRangeInput({
//   minValue,
//   maxValue,
//   onMinChange,
//   onMaxChange,
//   className = "",
//   variant = "sidebar",
//   testIdPrefix = "mileage",
// }: MileageRangeInputProps) {
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
//     setMinInputValue(minValue > 0 ? formatNumber(minValue) : "");
//   }, [minValue, language]);

//   useEffect(() => {
//     setMaxInputValue(maxValue < 600000 ? formatNumber(maxValue) : "");
//   }, [maxValue, language]);

//   const handleMinSelect = (value: number) => {
//     if (value === 0) {
//       setMinInputValue("");
//       onMinChange(0);
//     } else {
//       setMinInputValue(formatNumber(value));
//       onMinChange(value);
//     }
//     setMinOpen(false);
//   };

//   const handleMaxSelect = (value: number) => {
//     if (value === 0) {
//       setMaxInputValue("");
//       onMaxChange(600000);
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
//     onMinChange(parsed);
//     setMinInputValue(parsed > 0 ? formatNumber(parsed) : "");
//   };

//   const handleCustomMaxBlur = () => {
//     const parsed = parseNumber(customMaxValue);
//     if (parsed > 0) {
//       onMaxChange(parsed);
//       setMaxInputValue(formatNumber(parsed));
//     } else {
//       onMaxChange(600000);
//       setMaxInputValue("");
//     }
//   };

//   const dropdownInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white pr-8 cursor-pointer"
//     : "h-10 text-black dark:text-white pr-8 cursor-pointer";

//   const manualInputClass = variant === "hero"
//     ? "h-10 bg-white/10 border-primary/30 text-black dark:text-white"
//     : "h-10 text-black dark:text-white";

//   const formatMileageLabel = (value: number): string => {
//     if (value === 0) return "-";
//     return `${value.toLocaleString(language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US")} km`;
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
//               {mileageOptions.map((km) => (
//                 <Button
//                   key={km}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMinSelect(km)}
//                   data-testid={`option-${testIdPrefix}-min-${km}`}
//                 >
//                   {formatMileageLabel(km)}
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
//               {mileageOptions.filter(km => km === 0 || km >= minValue).map((km) => (
//                 <Button
//                   key={km}
//                   type="button"
//                   variant="ghost"
//                   className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
//                   onClick={() => handleMaxSelect(km)}
//                   data-testid={`option-${testIdPrefix}-max-${km}`}
//                 >
//                   {formatMileageLabel(km)}
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

interface MileageRangeInputProps {
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  className?: string;
  variant?: "hero" | "sidebar" | "mobile";
  testIdPrefix?: string;
}

const mileageOptions = [
  0, 10000, 20000, 30000, 50000, 75000, 100000, 125000, 150000, 200000, 250000,
  300000, 400000, 500000, 600000,
];

export function MileageRangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  className = "",
  variant = "sidebar",
  testIdPrefix = "mileage",
}: MileageRangeInputProps) {
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

  // ✅ anti-keyboard: поки false — інпут readOnly і не фокусується
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
    setMinInputValue(minValue > 0 ? formatNumber(minValue) : "");
  }, [minValue, language]);

  useEffect(() => {
    setMaxInputValue(maxValue < 600000 ? formatNumber(maxValue) : "");
  }, [maxValue, language]);

  const handleMinSelect = (value: number) => {
    if (value === 0) {
      setMinInputValue("");
      onMinChange(0);
    } else {
      setMinInputValue(formatNumber(value));
      onMinChange(value);
    }
    setMinOpen(false);
  };

  const handleMaxSelect = (value: number) => {
    if (value === 0) {
      setMaxInputValue("");
      onMaxChange(600000);
    } else {
      setMaxInputValue(formatNumber(value));
      onMaxChange(value);
    }
    setMaxOpen(false);
  };

  const handleCustomToggle = () => {
    setShowCustomInputs((prev) => {
      const next = !prev;

      if (next) {
        // ✅ при відкритті: скидаємо режим вводу
        setCanTypeMin(false);
        setCanTypeMax(false);

        // ✅ НЕ фокусимо на мобілці (бо клава одразу)
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
    onMinChange(parsed);
    setMinInputValue(parsed > 0 ? formatNumber(parsed) : "");
    setCanTypeMin(false);
  };

  const handleCustomMaxBlur = () => {
    const parsed = parseNumber(customMaxValue);
    if (parsed > 0) {
      onMaxChange(parsed);
      setMaxInputValue(formatNumber(parsed));
    } else {
      onMaxChange(600000);
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

  const formatMileageLabel = (value: number): string => {
    if (value === 0) return "-";
    return `${value.toLocaleString(locale)} km`;
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
            onPointerDownCapture={(e) => e.stopPropagation()}
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
                {mileageOptions.map((km) => (
                  <Button
                    key={km}
                    type="button"
                    variant="ghost"
                    className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                    onClick={() => handleMinSelect(km)}
                    data-testid={`option-${testIdPrefix}-min-${km}`}
                  >
                    {formatMileageLabel(km)}
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
            onPointerDownCapture={(e) => e.stopPropagation()}
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
                {mileageOptions
                  .filter((km) => km === 0 || km >= minValue)
                  .map((km) => (
                    <Button
                      key={km}
                      type="button"
                      variant="ghost"
                      className="justify-start h-8 px-2 text-sm font-normal hover-elevate"
                      onClick={() => handleMaxSelect(km)}
                      data-testid={`option-${testIdPrefix}-max-${km}`}
                    >
                      {formatMileageLabel(km)}
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
