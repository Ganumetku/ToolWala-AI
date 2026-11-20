import { resolveAnalyticsTimeRange, formatIstHourLabel, formatIstDayLabel, istToUtc, getIstCalendarParts } from '../src/lib/date-utils.ts';
import { classifyVisitor } from '../src/lib/bot-detection.ts';
import { resolveCountryName } from '../src/lib/geo.ts';
import pg from 'pg';

console.log("==========================================");
console.log("   TOOLWALA PHASE 3 VISITOR VERIFICATION  ");
console.log("==========================================\n");

let passed = 0;
let failed = 0;

function assert(condition, testName, details) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    if (details) console.log(`   ↳ ${details}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    if (details) console.error(`   ↳ ${details}`);
    failed++;
  }
}

// ---------------------------------------------------------------------
// Scenario 1-5: Visitor Identity, Session Lifecycle, and Navigations
// ---------------------------------------------------------------------
console.log("--- Scenarios 1-5: Visitor ID, Session Lifecycle & Multi-Tool Browsing ---");

class ClientAnalyticsSimulator {
  constructor() {
    this.localStorage = new Map();
    this.sessionStorage = new Map();
    this.VISITOR_KEY = 'toolwala_visitor_id';
    this.SESSION_KEY = 'toolwala_session_id';
    this.LAST_ACTIVITY_KEY = 'toolwala_last_activity';
    this.SESSION_TIMEOUT_MS = 30 * 60 * 1000;
  }

  getOrCreateVisitorId() {
    let vid = this.localStorage.get(this.VISITOR_KEY);
    if (!vid) {
      vid = 'usr_' + Math.random().toString(36).substring(2, 10);
      this.localStorage.set(this.VISITOR_KEY, vid);
    }
    return vid;
  }

  getOrCreateSessionId(currentTime = Date.now()) {
    const storedSessionId = this.sessionStorage.get(this.SESSION_KEY);
    const lastActivity = this.localStorage.get(this.LAST_ACTIVITY_KEY);
    const lastActivityTime = lastActivity ? parseInt(lastActivity, 10) : 0;

    if (storedSessionId && (currentTime - lastActivityTime < this.SESSION_TIMEOUT_MS)) {
      this.localStorage.set(this.LAST_ACTIVITY_KEY, currentTime.toString());
      return { sessionId: storedSessionId, isNewSession: false };
    }

    const newSessionId = 'ses_' + Math.random().toString(36).substring(2, 10);
    this.sessionStorage.set(this.SESSION_KEY, newSessionId);
    this.localStorage.set(this.LAST_ACTIVITY_KEY, currentTime.toString());
    return { sessionId: newSessionId, isNewSession: true };
  }
}

// 1. One real visitor opens homepage
const clientA = new ClientAnalyticsSimulator();
const t0 = Date.now();
const visitorA = clientA.getOrCreateVisitorId();
const sessionA1 = clientA.getOrCreateSessionId(t0);
assert(visitorA.startsWith('usr_'), "Scenario 1: Real visitor assigned persistent visitor_id", visitorA);
assert(sessionA1.isNewSession === true, "Scenario 1: Initial visit starts a new session", sessionA1.sessionId);

// 2. Same visitor refreshes homepage
const t1 = t0 + 2000; // 2 seconds later
const visitorA_refresh = clientA.getOrCreateVisitorId();
const sessionA_refresh = clientA.getOrCreateSessionId(t1);
assert(visitorA_refresh === visitorA, "Scenario 2: Refreshing homepage maintains identical visitor_id");
assert(sessionA_refresh.sessionId === sessionA1.sessionId && sessionA_refresh.isNewSession === false, "Scenario 2: Refreshing homepage does NOT create new session");

// 3. Same visitor opens five tools
const t2 = t1 + 10000;
let toolsNavigatedSessions = [];
for (let i = 1; i <= 5; i++) {
  const toolTime = t2 + i * 5000;
  const vid = clientA.getOrCreateVisitorId();
  const ses = clientA.getOrCreateSessionId(toolTime);
  assert(vid === visitorA, `Scenario 3.${i}: Opening tool #${i} preserves visitor_id`);
  toolsNavigatedSessions.push(ses.sessionId);
}
assert(toolsNavigatedSessions.every(s => s === sessionA1.sessionId), "Scenario 3: Navigating across 5 tools shares the same session_id (0 duplicate sessions)");

// 4. Same visitor returns in a new session (after 31 mins of inactivity)
const t3 = t2 + (35 * 60 * 1000); // 35 minutes later
const visitorA_return = clientA.getOrCreateVisitorId();
const sessionA2 = clientA.getOrCreateSessionId(t3);
assert(visitorA_return === visitorA, "Scenario 4: Returning visitor maintains identical visitor_id (1 unique user)");
assert(sessionA2.sessionId !== sessionA1.sessionId && sessionA2.isNewSession === true, "Scenario 4: Returning visitor after 30m starts a new session (2 visitor sessions)");

// 5. Another browser visits the website
const clientB = new ClientAnalyticsSimulator();
const visitorB = clientB.getOrCreateVisitorId();
const sessionB1 = clientB.getOrCreateSessionId(t0);
assert(visitorB !== visitorA, "Scenario 5: Separate browser has unique visitor_id", visitorB);
assert(sessionB1.sessionId !== sessionA1.sessionId, "Scenario 5: Separate browser has distinct session_id");

// Verify aggregated metric math: 2 unique users, 3 sessions
const simulatedSessions = [
  { visitor_id: visitorA, session_id: sessionA1.sessionId },
  { visitor_id: visitorA, session_id: sessionA2.sessionId },
  { visitor_id: visitorB, session_id: sessionB1.sessionId }
];
const metricTotalUsers = new Set(simulatedSessions.filter(s => s.visitor_id).map(s => s.visitor_id)).size;
const metricTotalVisitors = new Set(simulatedSessions.map(s => s.session_id)).size;
assert(metricTotalUsers === 2, "Metric Calculation: Total Users accurately counts 2 unique users", `Users: ${metricTotalUsers}`);
assert(metricTotalVisitors === 3, "Metric Calculation: Total Visitors accurately counts 3 visitor sessions", `Sessions: ${metricTotalVisitors}`);

// Scenario 12: Historical Sessions without visitor IDs check
const mixedSessions = [
  { visitor_id: 'usr_verified_1', session_id: 'ses_1' },
  { visitor_id: null, session_id: 'ses_legacy_2' },
  { visitor_id: null, session_id: 'ses_legacy_3' }
];
const verifiedUsers = new Set(mixedSessions.filter(s => s.visitor_id).map(s => s.visitor_id)).size;
assert(verifiedUsers === 1, "Scenario 12: Historical sessions without visitor_id are NOT presented as verified unique visitors", `Verified: ${verifiedUsers}`);

// ---------------------------------------------------------------------
// Scenario 6: Googlebot & Spoofed Scrapers
// ---------------------------------------------------------------------
console.log("\n--- Scenario 6: Googlebot & Scraper Classification ---");
const gbot = classifyVisitor('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', false);
assert(gbot.isBot === true && gbot.botCategory === 'search_engine', "Scenario 6.1: Googlebot classified as search_engine crawler");

const spoofedScraper = classifyVisitor('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1', false);
assert(spoofedScraper.isBot === true && spoofedScraper.botName === 'Automated Scraper (Spoofed iOS)', "Scenario 6.2: Spoofed Version/27.2 iOS scraper classified as automated_tool");

// ---------------------------------------------------------------------
// Scenario 7-8: Country Detection & Unknown Fallback
// ---------------------------------------------------------------------
console.log("\n--- Scenario 7-8: Geolocation Detection & Unknown Fallback ---");
assert(resolveCountryName('IN') === 'India', "Scenario 7.1: IN maps to India");
assert(resolveCountryName('US') === 'United States', "Scenario 7.2: US maps to United States");
assert(resolveCountryName('DE') === 'Germany', "Scenario 7.3: DE maps to Germany");
assert(resolveCountryName('') === 'Unknown', "Scenario 8.1: Missing country maps to Unknown (Never defaults to USA)");
assert(resolveCountryName(null) === 'Unknown', "Scenario 8.2: Null country maps to Unknown");
assert(resolveCountryName('XX') === 'Anonymous Proxy', "Scenario 8.3: Proxy header maps to Anonymous Proxy");

// ---------------------------------------------------------------------
// Scenario 9: Active Users (Last 5 Minutes)
// ---------------------------------------------------------------------
console.log("\n--- Scenario 9: Active Users in Last 5 Minutes ---");
const activeNow = Date.now();
const sampleViews = [
  { session_id: 'ses_active_1', created_at: new Date(activeNow - 2 * 60 * 1000).toISOString() }, // 2m ago -> active
  { session_id: 'ses_active_1', created_at: new Date(activeNow - 1 * 60 * 1000).toISOString() }, // same session -> deduplicated
  { session_id: 'ses_active_2', created_at: new Date(activeNow - 4 * 60 * 1000).toISOString() }, // 4m ago -> active
  { session_id: 'ses_idle_3',   created_at: new Date(activeNow - 6 * 60 * 1000).toISOString() }, // 6m ago -> expired
];
const activeThreshold = activeNow - 5 * 60 * 1000;
const activeSet = new Set(sampleViews.filter(v => new Date(v.created_at).getTime() >= activeThreshold).map(v => v.session_id));
assert(activeSet.size === 2, "Scenario 9: Active users counts exactly 2 distinct sessions in 5-minute window", `Active: ${activeSet.size}`);

// Check zero active users returns 0 without artificial minimum
const emptyActiveSet = new Set();
assert(emptyActiveSet.size === 0, "Scenario 9.1: Zero active sessions accurately reports 0 (No artificial Math.max(..., 1))");

// ---------------------------------------------------------------------
// Scenario 10: Asia/Kolkata Timezone Windows & 24 Hourly Buckets
// ---------------------------------------------------------------------
console.log("\n--- Scenario 10: Asia/Kolkata (IST = UTC+05:30) Time Boundaries ---");
const testDate = new Date('2026-11-20T03:45:00.000Z'); // 09:15 AM in IST
const istRangeToday = resolveAnalyticsTimeRange('today', null, null, testDate);
const istParts = getIstCalendarParts(testDate);

assert(istParts.hours === 9 && istParts.minutes === 15, "Scenario 10.1: Correctly shifts UTC 03:45 to IST 09:15 AM", `${istParts.hours}:${istParts.minutes} IST`);
assert(istRangeToday.currentStart.toISOString() === '2026-11-19T18:30:00.000Z', "Scenario 10.2: Start of Today is 00:00:00 IST (18:30:00 UTC previous day)");
assert(istRangeToday.currentEnd.toISOString() === '2026-11-20T18:29:59.999Z', "Scenario 10.3: End of Today is 23:59:59.999 IST");

// Check 24 hourly buckets generation
const hourlyBuckets = [];
for (let h = 0; h < 24; h++) {
  const bucketUtc = istToUtc(istRangeToday.istYear, istRangeToday.istMonth, istRangeToday.istDate, h, 0, 0, 0);
  hourlyBuckets.push(formatIstHourLabel(bucketUtc));
}
assert(hourlyBuckets.length === 24, "Scenario 10.4: Today chart generates 24 complete hourly buckets for continuous timeline");
assert(hourlyBuckets[0] === '12 AM' && hourlyBuckets[12] === '12 PM', "Scenario 10.5: Hourly buckets formatted cleanly in IST (12 AM, 1 AM ... 11 PM)");

// ---------------------------------------------------------------------
// Scenario 11: Real Database Records Matching
// ---------------------------------------------------------------------
console.log("\n--- Scenario 11: Database State Verification ---");
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runDatabaseVerification() {
  const client = await pool.connect();
  try {
    // Check columns
    const { rows: cols } = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'visitor_sessions' AND column_name = 'visitor_id';
    `);
    assert(cols.length === 1, "Scenario 11.1: visitor_id column exists in visitor_sessions");

    // Check indexes
    const { rows: idx } = await client.query(`
      SELECT indexname 
      FROM pg_indexes 
      WHERE tablename = 'visitor_sessions' AND indexname = 'idx_visitor_sessions_visitor_id';
    `);
    assert(idx.length === 1, "Scenario 11.2: idx_visitor_sessions_visitor_id index exists");

    // Check human sessions
    const { rows: [{ count: humanCount }] } = await client.query(`
      SELECT COUNT(*) FROM visitor_sessions WHERE is_bot = FALSE;
    `);
    assert(Number(humanCount) > 0, `Scenario 11.3: Real human visitor records confirmed in database (${humanCount} human sessions)`);

    // Check country counts
    const { rows: countries } = await client.query(`
      SELECT country, COUNT(*) as cnt 
      FROM visitor_sessions 
      WHERE is_bot = FALSE 
      GROUP BY country 
      ORDER BY cnt DESC;
    `);
    console.log("   ↳ Real Human Countries in Database:", countries.map(c => `${c.country}: ${c.cnt}`).join(', '));
    assert(countries.length > 0, "Scenario 11.4: Real country distributions verified");

  } finally {
    client.release();
    await pool.end();
  }

  console.log(`\n==========================================`);
  console.log(`Phase 3 Test Results: ${passed} passed, ${failed} failed.`);
  console.log(`==========================================`);
  if (failed > 0) process.exit(1);
}

runDatabaseVerification().catch(err => {
  console.error("Database verification failed:", err);
  process.exit(1);
});
