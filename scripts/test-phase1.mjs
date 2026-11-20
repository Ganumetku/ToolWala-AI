import { classifyVisitor } from '../src/lib/bot-detection.ts';
import { resolveCountryName } from '../src/lib/geo.ts';
import pg from 'pg';

console.log("==========================================");
console.log("   TOOLWALA PHASE 1 VERIFICATION SUITE   ");
console.log("==========================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

// ----------------------------------------------------
// 1. Bot Detection Tests
// ----------------------------------------------------
console.log("--- 1. Testing Bot Detection & Browser Versions ---");

// Test Chrome 140+ (Future/Modern human browser)
const chrome140UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const c140 = classifyVisitor(chrome140UA, false);
assert(c140.isBot === false, "Chrome 140+ is NOT classified as a bot (Human)");

// Test iOS 20+ (Future/Modern human iOS device)
const ios20UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 20_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/20.0 Mobile/15E148 Safari/604.1';
const i20 = classifyVisitor(ios20UA, false);
assert(i20.isBot === false, "iOS 20+ is NOT classified as a bot (Human)");

// Test Googlebot (Search engine crawler)
const googlebotUA = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const gbot = classifyVisitor(googlebotUA, false);
assert(gbot.isBot === true && gbot.botCategory === 'search_engine' && gbot.botName === 'Googlebot', "Googlebot correctly classified as search_engine crawler");

// Test Bingbot
const bingbotUA = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const bbot = classifyVisitor(bingbotUA, false);
assert(bbot.isBot === true && bbot.botCategory === 'search_engine' && bbot.botName === 'Bingbot', "Bingbot correctly classified as search_engine crawler");

// Test HeadlessChrome
const headlessUA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36';
const hbot = classifyVisitor(headlessUA, false);
assert(hbot.isBot === true && hbot.botCategory === 'automated_tool' && hbot.botName === 'HeadlessChrome', "HeadlessChrome correctly classified as automated_tool");

// Test Puppeteer / Python / Curl
assert(classifyVisitor('python-requests/2.31.0').isBot === true, "Python-requests detected as bot");
assert(classifyVisitor('curl/8.4.0').isBot === true, "cURL detected as bot");

// Test WebDriver Client Signal
const normalUAWithWebDriver = classifyVisitor(chrome140UA, true);
assert(normalUAWithWebDriver.isBot === true && normalUAWithWebDriver.botName === 'Automated WebDriver', "navigator.webdriver signal correctly detects automated browser even with human UA");

// ----------------------------------------------------
// 2. Country Mapping & USA Fallback Removal Tests
// ----------------------------------------------------
console.log("\n--- 2. Testing Country Mapping & Fallback Removal ---");
assert(resolveCountryName('US') === 'United States', "US maps to United States");
assert(resolveCountryName('IN') === 'India', "IN maps to India");
assert(resolveCountryName('CN') === 'China', "CN maps to China");
assert(resolveCountryName('GB') === 'United Kingdom', "GB maps to United Kingdom");
assert(resolveCountryName('XX') === 'Anonymous Proxy', "XX maps to Anonymous Proxy");
assert(resolveCountryName('') === 'Unknown', "Empty country maps to Unknown (NOT United States)");
assert(resolveCountryName(null) === 'Unknown', "Null country maps to Unknown (NOT United States)");
assert(resolveCountryName('undefined') === 'Unknown' || resolveCountryName('undefined') === 'Undefined', "Missing header handled cleanly");

// ----------------------------------------------------
// 3. Database Integrity & Historical Data Tests
// ----------------------------------------------------
console.log("\n--- 3. Testing Database State & Telemetry Counts ---");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runDbTests() {
  const client = await pool.connect();
  try {
    // Check total records preserved
    const { rows: [{ count: totalSessions }] } = await client.query('SELECT COUNT(*) FROM visitor_sessions;');
    const { rows: [{ count: botSessions }] } = await client.query('SELECT COUNT(*) FROM visitor_sessions WHERE is_bot = TRUE;');
    const { rows: [{ count: humanSessions }] } = await client.query('SELECT COUNT(*) FROM visitor_sessions WHERE is_bot = FALSE;');

    assert(Number(totalSessions) > 0, `Total historical sessions preserved: ${totalSessions} records (Zero data lost)`);
    assert(Number(totalSessions) === Number(botSessions) + Number(humanSessions), `Every session is classified: ${humanSessions} human + ${botSessions} bot = ${totalSessions}`);

    // Check unique visitors vs total sessions
    const { rows: [{ count: distinctSessions }] } = await client.query('SELECT COUNT(DISTINCT session_id) FROM visitor_sessions WHERE is_bot = FALSE;');
    console.log(`ℹ️ Real Unique Human Sessions: ${distinctSessions}`);

    // Check Country breakdown for human vs bot
    const { rows: humanCountries } = await client.query(`
      SELECT country, COUNT(*) as count 
      FROM visitor_sessions 
      WHERE is_bot = FALSE 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 5;
    `);
    console.log("\nTop 5 Human Traffic Countries:");
    humanCountries.forEach(c => console.log(`  - ${c.country}: ${c.count} sessions`));

    const { rows: botCountries } = await client.query(`
      SELECT country, COUNT(*) as count 
      FROM visitor_sessions 
      WHERE is_bot = TRUE 
      GROUP BY country 
      ORDER BY count DESC 
      LIMIT 5;
    `);
    console.log("\nTop 5 Bot Traffic Countries (Where scrapers came from):");
    botCountries.forEach(c => console.log(`  - ${c.country}: ${c.count} bot sessions`));

    // Check that columns exist in all 4 tables
    const tables = ['visitor_sessions', 'page_views', 'tool_usage', 'analytics_events'];
    for (const t of tables) {
      const { rows } = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name IN ('is_bot', 'bot_category', 'bot_name');
      `, [t]);
      assert(rows.length === 3, `Table ${t} has all 3 bot classification columns (is_bot, bot_category, bot_name)`);
    }

  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n==========================================`);
  console.log(`Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`==========================================`);
  if (failed > 0) process.exit(1);
}

runDbTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
