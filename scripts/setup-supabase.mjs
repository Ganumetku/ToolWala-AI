/**
 * ToolWala AI — Supabase one-time setup
 *
 * Runs:
 *  1. Database migration (schema + RLS)
 *  2. Admin user creation (developtechx@gmail.com)
 *  3. Admin role on profiles table
 *
 * Usage:
 *   node scripts/setup-supabase.mjs
 *
 * Required in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   DATABASE_URL  (Supabase → Settings → Database → URI)
 *   ADMIN_EMAIL   (optional, default: developtechx@gmail.com)
 *   ADMIN_PASSWORD (required for new user)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Load .env.local manually
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const DATABASE_URL = process.env.DATABASE_URL?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim() || 'developtechx@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD?.trim();

function validateEnv() {
  const errors = [];
  if (!SUPABASE_URL) errors.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SERVICE_KEY) errors.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!DATABASE_URL) errors.push('DATABASE_URL');
  if (!ADMIN_PASSWORD) errors.push('ADMIN_PASSWORD');

  if (errors.length) {
    console.error('\n❌ Missing in .env.local:\n');
    errors.forEach((e) => console.error(`   - ${e}`));
    console.error('\n📋 Get DATABASE_URL from:');
    console.error('   Supabase Dashboard → Project Settings → Database → Connection string → URI');
    console.error('\n📋 Add to .env.local:');
    console.error('   DATABASE_URL=postgresql://postgres.[ref]:[password]@...');
    console.error('   ADMIN_PASSWORD=YourSecurePassword123!');
    process.exit(1);
  }

  if (!SUPABASE_URL.includes('.supabase.co')) {
    console.warn('⚠️  SUPABASE_URL does not look like a valid Supabase project URL');
  }
  if (!SERVICE_KEY.startsWith('eyJ')) {
    console.warn('⚠️  SERVICE_ROLE_KEY should start with eyJ (JWT format)');
  }
}

async function runMigration() {
  console.log('\n📦 Step 1: Running database migration...');
  const sqlPath = resolve(root, 'supabase/migrations/001_initial_schema.sql');
  const sql = readFileSync(sqlPath, 'utf-8');

  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query(sql);
    console.log('✅ Migration complete (tables, RLS, categories seeded)');
  } finally {
    await client.end();
  }
}

async function createAdminUser() {
  console.log('\n👤 Step 2: Creating admin user...');
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData?.users?.find((u) => u.email === ADMIN_EMAIL);

  let userId;

  if (existing) {
    console.log(`   User already exists: ${ADMIN_EMAIL}`);
    userId = existing.id;

    // Reset password
    const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
      password: ADMIN_PASSWORD,
    });
    if (updateErr) throw new Error(`Password update failed: ${updateErr.message}`);
    console.log('✅ Password updated');
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (error) throw new Error(`Create user failed: ${error.message}`);
    userId = data.user.id;
    console.log(`✅ User created: ${ADMIN_EMAIL}`);
  }

  return userId;
}

async function setAdminRole(userId) {
  console.log('\n🔐 Step 3: Setting admin role...');
  const client = new pg.Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    await client.query(
      `INSERT INTO profiles (id, email, role, status)
       VALUES ($1, $2, 'admin', 'active')
       ON CONFLICT (id) DO UPDATE
       SET role = 'admin', status = 'active', email = EXCLUDED.email`,
      [userId, ADMIN_EMAIL]
    );
    console.log('✅ Admin role granted');
  } finally {
    await client.end();
  }
}

async function main() {
  console.log('🚀 ToolWala AI — Supabase Setup');
  validateEnv();

  try {
    await runMigration();
    const userId = await createAdminUser();
    await setAdminRole(userId);

    console.log('\n🎉 Setup complete!\n');
    console.log('   Login URL:  http://localhost:3000/login/');
    console.log(`   Email:      ${ADMIN_EMAIL}`);
    console.log(`   Password:   ${ADMIN_PASSWORD}`);
    console.log('\n   Restart dev server: npm run dev\n');
  } catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    process.exit(1);
  }
}

main();
