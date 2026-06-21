import { supabaseAdmin } from '../src/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

// Load env variables manually from .env.local
try {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const val = parts.slice(1).join('=').trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
        if (key && !key.startsWith('#')) {
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {
  console.error("Failed to load .env.local", e);
}

async function main() {
  try {
    console.log("Querying Supabase...");
    const { data, error } = await supabaseAdmin
      .from('tools')
      .select('*')
      .eq('slug', 'signature-crop-tool');
      
    if (error) {
      console.error("Supabase Error:", error);
    } else {
      console.log("Supabase Data:", data);
    }

    const { data: allData, error: allErr } = await supabaseAdmin
      .from('tools')
      .select('slug, status, is_visible');
    if (allErr) {
      console.error("All Supabase Error:", allErr);
    } else {
      console.log("All tools in Supabase:", allData);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
