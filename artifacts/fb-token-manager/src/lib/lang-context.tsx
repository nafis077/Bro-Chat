import { createContext, useContext, useState, type ReactNode } from "react";
import { translations, type Lang, type T } from "./i18n";

interface LangContextValue {
  lang: Lang;
  t: T;
  toggle: () => void;
}

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "vi") return stored;
  } catch {}
  return "en";
}

export const LangContext = createContext<LangContextValue>({
  lang: "en",
  t: translations.en,
  toggle: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  const toggle = () => {
    setLang((l) => {
      const next: Lang = l === "en" ? "vi" : "en";
      try { localStorage.setItem("lang", next); } catch {}
      return next;
    });
  };

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
