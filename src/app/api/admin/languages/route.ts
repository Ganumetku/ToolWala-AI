import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { getLanguagesConfig, saveLanguagesConfig } from '@/lib/languages';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getFlatKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  if (!obj || typeof obj !== 'object') return keys;
  
  for (const key in obj) {
    const pathKey = prefix ? `${prefix}.${key}` : key;
    if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      keys = keys.concat(getFlatKeys(obj[key], pathKey));
    } else {
      keys.push(pathKey);
    }
  }
  return keys;
}

function getValueAtKey(obj: any, key: string): any {
  const parts = key.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const langConfig = getLanguagesConfig();
    
    // Read en.json as ground truth base reference
    const messagesDir = path.join(process.cwd(), 'messages');
    const enContent = fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8');
    const enJson = JSON.parse(enContent);
    const enKeys = getFlatKeys(enJson);
    const totalKeys = enKeys.length;

    const languagesStats = Object.keys(langConfig).map((locale) => {
      const config = langConfig[locale];
      
      let progress = 100;
      let missingKeys: string[] = [];
      
      if (locale !== 'en') {
        try {
          const filePath = path.join(messagesDir, `${locale}.json`);
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const json = JSON.parse(content);
            
            // Compare keys
            const missing = enKeys.filter((key) => {
              const val = getValueAtKey(json, key);
              return val === undefined || val === null || val === '';
            });
            
            const presentCount = totalKeys - missing.length;
            progress = totalKeys > 0 ? Math.round((presentCount / totalKeys) * 100) : 100;
            missingKeys = missing;
          } else {
            progress = 0;
            missingKeys = enKeys;
          }
        } catch (e) {
          progress = 0;
          missingKeys = enKeys;
          console.error(`Error calculating translation stats for ${locale}`, e);
        }
      }

      return {
        code: locale,
        name: config.name,
        flag: config.flag,
        enabled: config.enabled,
        progress,
        missingKeysCount: missingKeys.length,
        missingKeys: missingKeys.slice(0, 15), // return top 15 missing keys
      };
    });

    return NextResponse.json({ success: true, languages: languagesStats, totalKeys });
  } catch (err) {
    console.error('Admin languages GET error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { locale, enabled } = body;
    
    if (!locale || enabled === undefined) {
      return NextResponse.json({ success: false, error: 'locale and enabled status required' }, { status: 400 });
    }
    
    // Cannot disable English (default)
    if (locale === 'en' && !enabled) {
      return NextResponse.json({ success: false, error: 'Cannot disable default language (English)' }, { status: 400 });
    }

    const config = getLanguagesConfig();
    if (!config[locale]) {
      return NextResponse.json({ success: false, error: 'Invalid locale code' }, { status: 400 });
    }

    config[locale].enabled = enabled;
    saveLanguagesConfig(config);

    return NextResponse.json({ success: true, message: `Language ${locale} status updated successfully.` });
  } catch (err) {
    console.error('Admin languages POST error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
