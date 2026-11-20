import pg from 'pg';
import { classifyVisitor } from '../src/lib/bot-detection.ts';
import { resolveCountryName } from '../src/lib/geo.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log("=== STARTING PHASE 1 FAST ANALYTICS MIGRATION ===");

    // 1. Add bot classification columns with safe IF NOT EXISTS
    console.log("1. Ensuring bot classification columns exist...");
    await client.query(`
      ALTER TABLE visitor_sessions 
        ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS bot_category TEXT,
        ADD COLUMN IF NOT EXISTS bot_name TEXT;

      ALTER TABLE page_views 
        ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS bot_category TEXT,
        ADD COLUMN IF NOT EXISTS bot_name TEXT;

      ALTER TABLE tool_usage 
        ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS bot_category TEXT,
        ADD COLUMN IF NOT EXISTS bot_name TEXT;

      ALTER TABLE analytics_events 
        ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS bot_category TEXT,
        ADD COLUMN IF NOT EXISTS bot_name TEXT;
    `);

    // 2. Add performance indexes for is_bot filtering
    console.log("2. Ensuring performance indexes exist...");
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_visitor_sessions_is_bot ON visitor_sessions(is_bot);
      CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created_is_bot ON visitor_sessions(created_at, is_bot);
      CREATE INDEX IF NOT EXISTS idx_page_views_is_bot ON page_views(is_bot);
      CREATE INDEX IF NOT EXISTS idx_page_views_created_is_bot ON page_views(created_at, is_bot);
      CREATE INDEX IF NOT EXISTS idx_tool_usage_is_bot ON tool_usage(is_bot);
      CREATE INDEX IF NOT EXISTS idx_analytics_events_is_bot ON analytics_events(is_bot);
    `);

    // 3. Fast Country Code Normalization (Grouped by distinct country values)
    console.log("3. Normalizing distinct country codes in bulk...");
    const { rows: distinctCountries } = await client.query(`
      SELECT DISTINCT country FROM visitor_sessions WHERE country IS NOT NULL;
    `);
    
    let countriesUpdated = 0;
    for (const row of distinctCountries) {
      const orig = row.country;
      const normalized = resolveCountryName(orig);
      if (normalized !== orig) {
        countriesUpdated++;
        console.log(`Normalizing country '${orig}' -> '${normalized}'`);
        await client.query(`UPDATE visitor_sessions SET country = $1 WHERE country = $2;`, [normalized, orig]);
        await client.query(`UPDATE page_views SET country = $1 WHERE country = $2;`, [normalized, orig]);
        await client.query(`UPDATE tool_usage SET country = $1 WHERE country = $2;`, [normalized, orig]);
        await client.query(`UPDATE analytics_events SET country = $1 WHERE country = $2;`, [normalized, orig]);
      }
    }
    console.log(`Normalized ${countriesUpdated} distinct country codes.`);

    // 4. Retroactively classify historical records in visitor_sessions
    console.log("4. Classifying historical visitor sessions...");
    const { rows: sessions } = await client.query(`
      SELECT session_id, user_agent 
      FROM visitor_sessions;
    `);

    console.log(`Found ${sessions.length} historical sessions in database.`);

    // Group bot session IDs by their (botCategory + ':::' + botName)
    const botGroups = new Map(); // key -> { botCategory, botName, sessionIds: [] }
    let botCount = 0;
    let humanCount = 0;

    for (const s of sessions) {
      const classification = classifyVisitor(s.user_agent, false);
      if (classification.isBot) {
        botCount++;
        const key = `${classification.botCategory || ''}:::${classification.botName || ''}`;
        if (!botGroups.has(key)) {
          botGroups.set(key, {
            botCategory: classification.botCategory,
            botName: classification.botName,
            sessionIds: []
          });
        }
        botGroups.get(key).sessionIds.push(s.session_id);
      } else {
        humanCount++;
      }
    }

    console.log(`Classification summary: ${botCount} Bot Sessions, ${humanCount} Human Sessions.`);

    // 5. Bulk update bot sessions in groups with chunks of 500
    console.log("5. Bulk updating bot sessions across tables...");
    const CHUNK_SIZE = 500;
    for (const [key, group] of botGroups.entries()) {
      console.log(`Updating ${group.sessionIds.length} sessions for bot: "${group.botName}" (${group.botCategory})`);
      for (let i = 0; i < group.sessionIds.length; i += CHUNK_SIZE) {
        const chunk = group.sessionIds.slice(i, i + CHUNK_SIZE);
        await client.query(`
          UPDATE visitor_sessions 
          SET is_bot = TRUE, bot_category = $1, bot_name = $2 
          WHERE session_id = ANY($3::text[]);
        `, [group.botCategory, group.botName, chunk]);

        await client.query(`
          UPDATE page_views 
          SET is_bot = TRUE, bot_category = $1, bot_name = $2 
          WHERE session_id = ANY($3::text[]);
        `, [group.botCategory, group.botName, chunk]);

        await client.query(`
          UPDATE tool_usage 
          SET is_bot = TRUE, bot_category = $1, bot_name = $2 
          WHERE session_id = ANY($3::text[]);
        `, [group.botCategory, group.botName, chunk]);

        await client.query(`
          UPDATE analytics_events 
          SET is_bot = TRUE, bot_category = $1, bot_name = $2 
          WHERE session_id = ANY($3::text[]);
        `, [group.botCategory, group.botName, chunk]);
      }
    }

    // Set remaining records with NULL is_bot explicitly to FALSE (human)
    await client.query(`
      UPDATE visitor_sessions SET is_bot = FALSE WHERE is_bot IS NULL;
      UPDATE page_views SET is_bot = FALSE WHERE is_bot IS NULL;
      UPDATE tool_usage SET is_bot = FALSE WHERE is_bot IS NULL;
      UPDATE analytics_events SET is_bot = FALSE WHERE is_bot IS NULL;
    `);

    console.log("=== MIGRATION COMPLETE! ===");
    console.log(`Summary:`);
    console.log(`- Total Sessions Analyzed: ${sessions.length}`);
    console.log(`- Bots Tagged: ${botCount} (${((botCount / sessions.length) * 100).toFixed(1)}%)`);
    console.log(`- Humans Preserved: ${humanCount} (${((humanCount / sessions.length) * 100).toFixed(1)}%)`);
    console.log(`- Historical traffic with unknown bot status: safely preserved as is_bot=FALSE (human).`);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
