"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { LANGUAGES, type Language } from "@/lib/i18n";

const LABELS: Record<Language, string> = { it: "Italiano", en: "English" };

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className={`flex items-center rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] p-1 ${className}`}
      role="group"
      aria-label={t("nav", "language")}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={language === lang}
          aria-label={LABELS[lang]}
          onClick={() => setLanguage(lang)}
          className={`min-h-[44px] min-w-[44px] rounded-full px-3 text-sm font-semibold transition-colors ${
            language === lang
              ? "bg-white text-black"
              : "text-[var(--text-secondary)] hover:text-white"
          }`}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
