import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadEnv() {
  const envPath = resolve(root, '.env.local');
  if (!existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const DATABASE_URL = process.env.DATABASE_URL?.trim();

if (!DATABASE_URL) {
  console.error('❌ Missing DATABASE_URL in .env.local');
  process.exit(1);
}

async function run() {
  console.log('⏳ Running migration 005_languages.sql...');
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const sqlPath = resolve(root, 'supabase/migrations/005_languages.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    await client.query(sql);
    console.log('✅ Migration 005 successfully applied to database');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
