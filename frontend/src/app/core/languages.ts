export interface Language {
  code: string;
  label: string;
}

export const LANGUAGE_STORAGE_KEY = 'aldis.language';

export const LANGUAGES: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'cs', label: 'Čeština' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'pt_BR', label: 'Português (Brasil)' },
  { code: 'ru', label: 'Русский' },
  { code: 'uk', label: 'Українська' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh_CN', label: '简体中文' },
  { code: 'zh_TW', label: '繁體中文' },
];

export function storeLanguage(code: string): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  } catch {
    return;
  }
}

export function initialLanguage(): string {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    stored = null;
  }

  if (stored && LANGUAGES.some((language) => language.code === stored)) {
    return stored;
  }

  const browser = navigator.language?.replace('-', '_') ?? 'en';
  const exact = LANGUAGES.find((language) => language.code === browser);
  if (exact) {
    return exact.code;
  }

  const short = browser.split('_')[0];
  return LANGUAGES.find((language) => language.code === short)?.code ?? 'en';
}
