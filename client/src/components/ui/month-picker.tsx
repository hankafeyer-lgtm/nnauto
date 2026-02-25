import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

interface MonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
  className?: string;
  "data-testid"?: string;
}

const monthNames = {
  cs: [
    "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
    "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"
  ],
  uk: [
    "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
    "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень"
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]
};

export function MonthPicker({ value, onChange, minDate, className, "data-testid": testId }: MonthPickerProps) {
  const { language } = useLanguage();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear + i);
  
  const [selectedYear, selectedMonth] = value ? value.split("-") : ["", ""];
  
  const handleYearChange = (year: string) => {
    if (selectedMonth) {
      onChange(`${year}-${selectedMonth}`);
    } else {
      onChange(`${year}-01`);
    }
  };
  
  const handleMonthChange = (month: string) => {
    const year = selectedYear || String(currentYear);
    onChange(`${year}-${month}`);
  };
  
  const handleClear = () => {
    onChange("");
  };
  
  const months = monthNames[language] || monthNames.cs;
  
  return (
    <div className={`flex gap-2 ${className || ""}`}>
      <Select value={selectedMonth} onValueChange={handleMonthChange}>
        <SelectTrigger 
          className="flex-1 h-12 rounded-xl text-black dark:text-white" 
          data-testid={testId ? `${testId}-month` : undefined}
        >
          <SelectValue placeholder={language === "uk" ? "Місяць" : language === "en" ? "Month" : "Měsíc"} />
        </SelectTrigger>
        <SelectContent>
          {months.map((month, index) => (
            <SelectItem 
              key={index} 
              value={String(index + 1).padStart(2, "0")}
              className="text-black dark:text-white"
            >
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={selectedYear} onValueChange={handleYearChange}>
        <SelectTrigger 
          className="w-24 h-12 rounded-xl text-black dark:text-white"
          data-testid={testId ? `${testId}-year` : undefined}
        >
          <SelectValue placeholder={language === "uk" ? "Рік" : language === "en" ? "Year" : "Rok"} />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem 
              key={year} 
              value={String(year)}
              className="text-black dark:text-white"
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 h-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          data-testid={testId ? `${testId}-clear` : undefined}
        >
          ✕
        </button>
      )}
    </div>
  );
}
