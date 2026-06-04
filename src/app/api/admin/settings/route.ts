import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';

export async function GET() {
  try {
    const settingsObj: Record<string, string> = {};

    if (prisma) {
      const settings = await prisma.globalSetting.findMany();
      settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
    } else {
      const settings = jsonDb.getSettings();
      settings.forEach(s => {
        settingsObj[s.key] = s.value;
      });
    }

    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ success: false, error: 'Database fetch failure' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = body.settings; // Object containing key-value pairs

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'Settings object required' }, { status: 400 });
    }

    if (prisma) {
      const upserts = Object.entries(settings).map(([key, val]) => {
        const value = typeof val === 'string' ? val : JSON.stringify(val);
        return prisma.globalSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        });
      });
      await prisma.$transaction(upserts);
    } else {
      const current = jsonDb.getSettings();
      Object.entries(settings).forEach(([key, val]) => {
        const value = typeof val === 'string' ? val : JSON.stringify(val);
        const idx = current.findIndex(s => s.key === key);
        if (idx !== -1) {
          current[idx].value = value;
        } else {
          current.push({
            id: 'set-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            key,
            value,
            createdAt: new Date().toISOString()
          });
        }
      });
      jsonDb.saveSettings(current);
    }

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Failed to save settings:', error);
    return NextResponse.json({ success: false, error: 'Database upsert failure' }, { status: 500 });
  }
}
