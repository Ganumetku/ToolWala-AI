import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runPhase3Migration() {
  const client = await pool.connect();
  try {
    console.log("=== STARTING PHASE 3 DATABASE OPTIMIZATION ===");

    // 1. Add visitor_id column to visitor_sessions and page_views
    console.log("1. Adding visitor_id column if not exists...");
    await client.query(`
      ALTER TABLE visitor_sessions 
        ADD COLUMN IF NOT EXISTS visitor_id TEXT;

      ALTER TABLE page_views 
        ADD COLUMN IF NOT EXISTS visitor_id TEXT;
    `);

    // 2. Add performance index on visitor_id
    console.log("2. Ensuring performance indexes exist for visitor_id...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_visitor_sessions_visitor_id ON visitor_sessions(visitor_id);
      CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id);
    `);

    // 3. Retroactively tag spoofed scraper sessions with Version/27. or CriOS/157
    console.log("3. Tagging spoofed scraper sessions (Version/27.* or CriOS/157.* on iOS)...");
    const { rowCount: taggedSessions } = await client.query(`
      UPDATE visitor_sessions
      SET is_bot = TRUE, bot_category = 'automated_tool', bot_name = 'Automated Scraper (Spoofed iOS)'
      WHERE is_bot = FALSE AND (
        user_agent ~* 'iPhone.*Version/27\\.' OR
        user_agent ~* 'iPhone.*CriOS/157\\.'
      );
    `);

    const { rowCount: taggedViews } = await client.query(`
      UPDATE page_views
      SET is_bot = TRUE, bot_category = 'automated_tool', bot_name = 'Automated Scraper (Spoofed iOS)'
      WHERE is_bot = FALSE AND session_id IN (
        SELECT session_id FROM visitor_sessions WHERE is_bot = TRUE
      );
    `);

    console.log(`Tagged ${taggedSessions} spoofed scraper sessions and ${taggedViews} associated page views as bots.`);

    console.log("=== PHASE 3 MIGRATION COMPLETE! ===");
  } finally {
    client.release();
    await pool.end();
  }
}

runPhase3Migration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
