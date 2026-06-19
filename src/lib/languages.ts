import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabase-admin';

export interface LanguageConfig {
  enabled: boolean;
  name: string;
  flag: string;
  seo_enabled: boolean;
  display_order: number;
}

const LANGUAGES_FILE = path.join(process.cwd(), 'src/data/languages.json');

const FLAGS: Record<string, string> = {
  en: "🇺🇸",
  hi: "🇮🇳",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  pt: "🇧🇷",
  ar: "🇸🇦",
  id: "🇮🇩"
};

const DEFAULT_LANGUAGES: Record<string, LanguageConfig> = {
  en: { enabled: true, name: "English", flag: "🇺🇸", seo_enabled: true, display_order: 1 },
  hi: { enabled: true, name: "हिन्दी", flag: "🇮🇳", seo_enabled: true, display_order: 2 },
  es: { enabled: true, name: "Español", flag: "🇪🇸", seo_enabled: true, display_order: 3 },
  pt: { enabled: true, name: "Português", flag: "🇧🇷", seo_enabled: true, display_order: 4 },
  fr: { enabled: false, name: "Français", flag: "🇫🇷", seo_enabled: false, display_order: 5 },
  de: { enabled: false, name: "Deutsch", flag: "🇩🇪", seo_enabled: false, display_order: 6 },
  id: { enabled: false, name: "Bahasa Indonesia", flag: "🇮🇩", seo_enabled: false, display_order: 7 },
  ar: { enabled: false, name: "العربية", flag: "🇸🇦", seo_enabled: false, display_order: 8 }
};

export function getLanguagesConfig(): Record<string, LanguageConfig> {
  try {
    if (!fs.existsSync(LANGUAGES_FILE)) {
      fs.mkdirSync(path.dirname(LANGUAGES_FILE), { recursive: true });
      fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(DEFAULT_LANGUAGES, null, 2), 'utf-8');
      return DEFAULT_LANGUAGES;
    }
    const content = fs.readFileSync(LANGUAGES_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    
    // Ensure new fields exist with fallback values
    let modified = false;
    for (const key in parsed) {
      if (parsed[key].seo_enabled === undefined) {
        parsed[key].seo_enabled = parsed[key].enabled;
        modified = true;
      }
      if (parsed[key].display_order === undefined) {
        parsed[key].display_order = DEFAULT_LANGUAGES[key]?.display_order || 99;
        modified = true;
      }
    }
    if (modified) {
      fs.writeFileSync(LANGUAGES_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
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

/** Get list of enabled locale strings sorted by display_order */
export function getEnabledLocales(): string[] {
  const config = getLanguagesConfig();
  return Object.keys(config)
    .filter(key => config[key].enabled)
    .sort((a, b) => (config[a].display_order || 0) - (config[b].display_order || 0));
}

let lastSyncTime = 0;
const SYNC_INTERVAL = 30 * 1000; // 30 seconds

/** Synchronize database language records to local JSON file cache */
export async function syncLanguagesDbToJSON(force = false): Promise<Record<string, LanguageConfig>> {
  const now = Date.now();
  if (!force && (now - lastSyncTime < SYNC_INTERVAL)) {
    return getLanguagesConfig();
  }
  lastSyncTime = now;

  try {
    const { data, error } = await supabaseAdmin
      .from('languages')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.warn('[syncLanguagesDbToJSON] db select error:', error.message);
      return getLanguagesConfig();
    }

    if (!data || data.length === 0) {
      console.log('[syncLanguagesDbToJSON] Database is empty. Seeding defaults...');
      const rowsToInsert = Object.entries(DEFAULT_LANGUAGES).map(([code, cfg]) => ({
        language_name: cfg.name,
        language_code: code,
        enabled: cfg.enabled,
        seo_enabled: cfg.seo_enabled,
        display_order: cfg.display_order
      }));

      const { error: insertErr } = await supabaseAdmin.from('languages').insert(rowsToInsert);
      if (insertErr) {
        console.error('[syncLanguagesDbToJSON] Seeding failed:', insertErr.message);
      }
      // Write default config to json
      saveLanguagesConfig(DEFAULT_LANGUAGES);
      return DEFAULT_LANGUAGES;
    }

    // Merge database state into config object
    const newConfig: Record<string, LanguageConfig> = {};
    data.forEach((row: any) => {
      newConfig[row.language_code] = {
        enabled: row.enabled,
        name: row.language_name,
        flag: FLAGS[row.language_code] || '🌐',
        seo_enabled: row.seo_enabled,
        display_order: row.display_order
      };
    });

    // Save configuration
    saveLanguagesConfig(newConfig);
    console.log('[syncLanguagesDbToJSON] Successfully synced DB state to JSON cache.');
    return newConfig;
  } catch (err) {
    console.error('[syncLanguagesDbToJSON] Unexpected error:', err);
    return getLanguagesConfig();
  }
}
