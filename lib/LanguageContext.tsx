'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  t as translate,
  type Language,
  type TranslationKey,
} from './i18n';

export const LANGUAGE_STORAGE_KEY = 'grok-hackathon-language';
const CHANGE_EVENT = 'grok-hackathon-language-change';

/**
 * Italian by default. `?lang=en|it` in the URL wins, then the visitor's
 * explicit choice from the switcher (localStorage).
 */
function readLanguage(): Language {
  try {
    const fromQuery = new URLSearchParams(window.location.search).get('lang');
    if (isLanguage(fromQuery)) return fromQuery;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    /* private mode: keep default */
  }
  return DEFAULT_LANGUAGE;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
    window.removeEventListener('popstate', onChange);
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: TranslationKey, key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, readLanguage, () => DEFAULT_LANGUAGE);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      const url = new URL(window.location.href);
      if (url.searchParams.has('lang')) {
        url.searchParams.set('lang', lang);
        window.history.replaceState(window.history.state, '', url);
      }
    } catch {
      /* ignore quota / private mode */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const t = useCallback(
    (section: TranslationKey, key: string) => translate(section, key, language),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
