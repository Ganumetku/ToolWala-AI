import fs from 'fs';
import path from 'path';

export interface LanguageConfig {
  enabled: boolean;
  name: string;
  flag: string;
}

const LANGUAGES_FILE = path.join(process.cwd(), 'src/data/languages.json');

const DEFAULT_LANGUAGES: Record<string, LanguageConfig> = {
  en: { enabled: true, name: "English", flag: "🇺🇸" },
  hi: { enabled: true, name: "हिन्दी", flag: "🇮🇳" },
  es: { enabled: false, name: "Español", flag: "🇪🇸" },
  fr: { enabled: false, name: "Français", flag: "🇫🇷" },
  de: { enabled: false, name: "Deutsch", flag: "🇩🇪" },
  pt: { enabled: false, name: "Português", flag: "🇵🇹" },
  ar: { enabled: false, name: "العربية", flag: "🇸🇦" },
  id: { enabled: false, name: "Bahasa Indonesia", flag: "🇮🇩" }
};

export function getLanguagesConfig(): Record<string, LanguageConfig> {
  try {
    if (!fs.existsSync(LANGUAGES_FILE)) {
      fs.mkdirSync(path.dirname(LANGUAGES_FILE), { recursive: true });
      fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(DEFAULT_LANGUAGES, null, 2), 'utf-8');
      return DEFAULT_LANGUAGES;
    }
    const content = fs.readFileSync(LANGUAGES_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to read languages.json', e);
    return DEFAULT_LANGUAGES;
  }
}

export function saveLanguagesConfig(config: Record<string, LanguageConfig>) {
  try {
    fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write languages.json', e);
  }
}

/** Get list of enabled locale strings (e.g. ['en', 'hi']) */
export function getEnabledLocales(): string[] {
  const config = getLanguagesConfig();
  return Object.keys(config).filter(key => config[key].enabled);
}
