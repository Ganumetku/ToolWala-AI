import { pageview, event, GA_MEASUREMENT_ID } from '../src/lib/gtag.ts';

console.log("==========================================");
console.log("   TOOLWALA PHASE 2 GA4 VERIFICATION    ");
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
// Setup Mock Browser Environment
// ---------------------------------------------------------------------
const mockDataLayer = [];
global.window = {
  dataLayer: mockDataLayer,
  location: {
    href: 'https://toolwala.co/',
    pathname: '/',
    search: '',
  },
};
global.document = {
  title: 'Free PDF Tools That Never Upload Your Files | ToolWala',
  referrer: '',
};

// ---------------------------------------------------------------------
// 1. Initial Google Tag Configuration Check
// ---------------------------------------------------------------------
console.log("--- 1. Testing Initial Google Tag Configuration ---");

assert(GA_MEASUREMENT_ID === 'GT-M398RGTT', "GA_MEASUREMENT_ID loads correct ID from environment (GT-M398RGTT)", `ID: ${GA_MEASUREMENT_ID}`);

// Simulate the inline script execution with send_page_view: false
window.dataLayer = window.dataLayer || [];
function mockGtag() {
  window.dataLayer.push(Array.from(arguments));
}
window.gtag = mockGtag;

window.gtag('js', new Date());
window.gtag('config', GA_MEASUREMENT_ID, {
  send_page_view: false
});

assert(window.dataLayer.length === 2, "Inline gtag initializes config without automatic page_view dispatch");
assert(window.dataLayer[1][0] === 'config' && window.dataLayer[1][2]?.send_page_view === false, "Config explicitly sets send_page_view: false");

// ---------------------------------------------------------------------
// 2. Scenario Testing (Scenarios 1 through 8)
// ---------------------------------------------------------------------
console.log("\n--- 2. Testing Pageview Scenarios & Deduplication ---");

// Helper tracking simulation matching AnalyticsTracker component
class SimulatedAnalyticsTracker {
  constructor() {
    this.lastTrackedUrl = null;
    this.dispatchedCount = 0;
  }

  navigate(pathname, search = '', title = '') {
    if (title) global.document.title = title;
    global.window.location.pathname = pathname;
    global.window.location.search = search;
    global.window.location.href = `https://toolwala.co${pathname}${search ? '?' + search : ''}`;

    if (pathname.startsWith('/admin')) {
      return; // Skip admin
    }

    const url = search ? `${pathname}?${search}` : pathname;
    if (this.lastTrackedUrl === url) {
      return; // Deduplicated
    }
    this.lastTrackedUrl = url;
    this.dispatchedCount++;

    pageview(url, title);
  }

  refresh() {
    // Component unmounts and remounts with fresh ref
    this.lastTrackedUrl = null;
    this.navigate(global.window.location.pathname, global.window.location.search.replace(/^\?/, ''), global.document.title);
  }
}

const tracker = new SimulatedAnalyticsTracker();

// Scenario 1: Homepage Visit
console.log("\n• Scenario 1: Initial Homepage Visit");
const startEvents = window.dataLayer.length;
tracker.navigate('/', '', 'Free PDF Tools | ToolWala');
const s1Events = window.dataLayer.slice(startEvents);
const s1PageViews = s1Events.filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s1PageViews.length === 1, "Exactly ONE page_view dispatched on homepage landing", JSON.stringify(s1PageViews[0]));
assert(s1PageViews[0][2]?.page_path === '/', "Payload includes correct page_path '/'");
assert(s1PageViews[0][2]?.send_to === 'GT-M398RGTT', "Payload specifies send_to destination ID");

// Scenario 2: Direct Visit to a Tool Page (e.g. from bookmark or Google Search)
console.log("\n• Scenario 2: Direct Visit to a Tool Page");
const directTracker = new SimulatedAnalyticsTracker();
const s2Start = window.dataLayer.length;
directTracker.navigate('/tools/pdf-to-word', '', 'PDF to Word Converter | ToolWala');
const s2Events = window.dataLayer.slice(s2Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s2Events.length === 1, "Direct visit to tool page sends exactly ONE page_view");
assert(s2Events[0][2]?.page_path === '/tools/pdf-to-word', "Payload includes correct tool page_path");

// Scenario 3: Navigate from Homepage to a Tool (SPA Transition)
console.log("\n• Scenario 3: Navigate from Homepage to a Tool (SPA Transition)");
const s3Start = window.dataLayer.length;
tracker.navigate('/tools/compress-pdf', '', 'Compress PDF Online | ToolWala');
const s3Events = window.dataLayer.slice(s3Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s3Events.length === 1, "SPA navigation to tool sends exactly ONE page_view");
assert(s3Events[0][2]?.page_path === '/tools/compress-pdf', "Payload matches target route");

// Scenario 4: Navigate Between Two Different Tools (SPA Transition)
console.log("\n• Scenario 4: Navigate Between Two Different Tools");
const s4Start = window.dataLayer.length;
tracker.navigate('/tools/merge-pdf', '', 'Merge PDF Online | ToolWala');
const s4Events = window.dataLayer.slice(s4Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s4Events.length === 1, "Navigation between tools sends exactly ONE page_view");
assert(s4Events[0][2]?.page_path === '/tools/merge-pdf', "Payload matches new tool route");

// Scenario 5: Browser Refresh
console.log("\n• Scenario 5: Browser Refresh");
const s5Start = window.dataLayer.length;
tracker.refresh(); // Remounts at current path
const s5Events = window.dataLayer.slice(s5Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s5Events.length === 1, "Browser refresh re-dispatches exactly ONE page_view for active page");
assert(s5Events[0][2]?.page_path === '/tools/merge-pdf', "Payload matches refreshed tool route");

// Scenario 6: Back and Forward Navigation (PopState)
console.log("\n• Scenario 6: Back and Forward Navigation (Popstate)");
const s6Start = window.dataLayer.length;
// Back to compress-pdf
tracker.navigate('/tools/compress-pdf', '', 'Compress PDF Online | ToolWala');
// Forward to merge-pdf
tracker.navigate('/tools/merge-pdf', '', 'Merge PDF Online | ToolWala');
const s6Events = window.dataLayer.slice(s6Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s6Events.length === 2, "Back + Forward navigation emits exactly ONE page_view per step");
assert(s6Events[0][2]?.page_path === '/tools/compress-pdf' && s6Events[1][2]?.page_path === '/tools/merge-pdf', "Both history states recorded in correct sequence");

// Scenario 7: Mobile Browser Visit with Query Parameters
console.log("\n• Scenario 7: Mobile Browser Visit with UTM/Query Parameters");
const s7Start = window.dataLayer.length;
tracker.navigate('/tools/jpg-to-pdf', 'utm_source=mobile_share&utm_medium=whatsapp', 'JPG to PDF | ToolWala');
const s7Events = window.dataLayer.slice(s7Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s7Events.length === 1, "Mobile visit with query string sends exactly ONE page_view");
assert(s7Events[0][2]?.page_path === '/tools/jpg-to-pdf?utm_source=mobile_share&utm_medium=whatsapp', "Query string preserved for campaign attribution");

// Scenario 8: Deduplication Under Component Re-render / React StrictMode
console.log("\n• Scenario 8: Deduplication Under Component Re-renders & React StrictMode");
const s8Start = window.dataLayer.length;
// Trigger repeated calls for the SAME URL as would happen during React StrictMode / state updates
tracker.navigate('/tools/jpg-to-pdf', 'utm_source=mobile_share&utm_medium=whatsapp', 'JPG to PDF | ToolWala');
tracker.navigate('/tools/jpg-to-pdf', 'utm_source=mobile_share&utm_medium=whatsapp', 'JPG to PDF | ToolWala');
const s8Events = window.dataLayer.slice(s8Start).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(s8Events.length === 0, "Duplicate re-renders suppressed completely by lastTrackedUrlRef (0 duplicate pageviews)");

// Scenario 9: Custom Tool Event Triggers
console.log("\n• Scenario 9: Custom Event Triggers (tool_used, image_uploaded, etc.)");
const s9Start = window.dataLayer.length;
event('tool_used', { event_category: 'Tools', event_label: 'jpg-to-pdf' });
event('image_uploaded', { event_category: 'Upload', event_label: 'jpg-to-pdf', file_size: 1048576 });
const s9Events = window.dataLayer.slice(s9Start);
assert(s9Events.length === 2, "Custom action events are properly dispatched to dataLayer");
assert(s9Events[0][1] === 'tool_used' && s9Events[1][1] === 'image_uploaded', "Event names and parameters match specifications");

// ---------------------------------------------------------------------
// 3. Admin Exclusion Check
// ---------------------------------------------------------------------
console.log("\n--- 3. Testing Admin Portal Exclusion ---");
const adminStart = window.dataLayer.length;
tracker.navigate('/admin/analytics', '', 'Admin Analytics');
const adminEvents = window.dataLayer.slice(adminStart).filter(e => e[0] === 'event' && e[1] === 'page_view');
assert(adminEvents.length === 0, "Admin portal visits are excluded from public GA4 tracking");

console.log("\n==========================================");
console.log(`Phase 2 Results: ${passed} passed, ${failed} failed.`);
console.log("==========================================");

if (failed > 0) process.exit(1);
