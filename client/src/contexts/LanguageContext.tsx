import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "cs" | "uk" | "en" | "de";

const supportedLanguages: Language[] = ["cs", "uk", "en", "de"];

const isLanguage = (value: string | null): value is Language =>
  !!value && supportedLanguages.includes(value as Language);

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const urlLanguage =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("lang")
        : null;
    if (isLanguage(urlLanguage)) return urlLanguage;

    const saved = localStorage.getItem("language");
    return isLanguage(saved) ? saved : "cs";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  useEffect(() => {
    // Set full locale codes for proper browser date picker localization
    const localeMap: Record<Language, string> = {
      cs: 'cs-CZ',
      uk: 'uk-UA', 
      en: 'en-US',
      de: 'de-DE',
    };
    document.documentElement.lang = localeMap[language] || language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
