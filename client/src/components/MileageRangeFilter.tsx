import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/lib/translations";

interface MileageRangeFilterProps {
  mileageMin: number;
  mileageMax: number;
  onMileageChange: (min: number, max: number) => void;
  variant?: "desktop" | "hero" | "mobile";
}

const MILEAGE_PRESETS = [
  { label: "0-50k", min: 0, max: 50000 },
  { label: "50-100k", min: 50000, max: 100000 },
  { label: "100-150k", min: 100000, max: 150000 },
  { label: "150-200k", min: 150000, max: 200000 },
  { label: "200-300k", min: 200000, max: 300000 },
  { label: "300k+", min: 300000, max: 300000 },
];

export default function MileageRangeFilter({
  mileageMin,
  mileageMax,
  onMileageChange,
  variant = "desktop"
}: MileageRangeFilterProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat(language === "cs" ? "cs-CZ" : language === "uk" ? "uk-UA" : "en-US").format(value);
  };

  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/\s/g, "").replace(/,/g, "");
    return parseInt(cleaned) || 0;
  };

  useEffect(() => {
    if (mileageMin > 0 || mileageMax < 300000) {
      setMinValue(mileageMin > 0 ? formatNumber(mileageMin) : "");
      setMaxValue(mileageMax < 300000 ? formatNumber(mileageMax) : "");
    }
  }, [mileageMin, mileageMax, language]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(e.target.value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(e.target.value);
  };

  const handleMinBlur = () => {
    const parsed = parseNumber(minValue);
    const clamped = Math.max(0, Math.min(parsed, mileageMax));
    setMinValue(formatNumber(clamped));
    onMileageChange(clamped, mileageMax);
  };

  const handleMaxBlur = () => {
    const parsed = parseNumber(maxValue);
    const clamped = Math.max(mileageMin, Math.min(parsed, 300000));
    setMaxValue(formatNumber(clamped));
    onMileageChange(mileageMin, clamped);
  };

  const handlePresetClick = (preset: typeof MILEAGE_PRESETS[0]) => {
    setMinValue(formatNumber(preset.min));
    setMaxValue(formatNumber(preset.max));
    onMileageChange(preset.min, preset.max);
  };

  const isPresetActive = (preset: typeof MILEAGE_PRESETS[0]) => {
    return mileageMin === preset.min && mileageMax === preset.max;
  };

  const isCondensed = variant === "hero";
  const isVertical = variant === "mobile";

  return (
    <div className="space-y-4">
      <Label className={`text-base font-medium ${isCondensed ? 'text-sm' : ''}`}>
        {t("filters.mileage")}
      </Label>
      
      <div className={`grid ${isVertical ? 'grid-cols-2' : 'grid-cols-3'} gap-2`}>
        {MILEAGE_PRESETS.map((preset) => {
          const isActive = isPresetActive(preset);
          return (
            <Button
              key={preset.label}
              type="button"
              variant={isActive ? "default" : "outline"}
              size={isCondensed ? "sm" : "default"}
              className={`${isActive ? 'toggle-elevated' : ''} toggle-elevate text-xs ${!isActive ? 'text-foreground' : ''}`}
              onClick={() => handlePresetClick(preset)}
              data-testid={`button-mileage-preset-${preset.label.replace('+', 'plus')}`}
            >
              {preset.label}
            </Button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          type="text"
          value={minValue}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          placeholder={t("hero.from")}
          className={isCondensed ? 'h-9' : 'h-10'}
          data-testid="input-mileage-min"
        />
        <Input
          type="text"
          value={maxValue}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          placeholder={t("hero.to")}
          className={isCondensed ? 'h-9' : 'h-10'}
          data-testid="input-mileage-max"
        />
      </div>
    </div>
  );
}
