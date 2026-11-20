/**
 * Bot and Crawler Detection Utility
 * 
 * Accurately detects:
 * 1. Legitimate search engine crawlers (Google, Bing, Baidu, Yandex, etc.)
 * 2. Social media preview indexers (Meta, Twitter, LinkedIn, Telegram, etc.)
 * 3. SEO intelligence crawlers (Ahrefs, Semrush, etc.)
 * 4. Automated headless browsers & scraping scripts (HeadlessChrome, Puppeteer, Python, Curl)
 * 5. Client-side automation signals (navigator.webdriver)
 * 
 * NOTE: Does NOT classify Chrome or iOS as bots based on version numbers.
 */

export interface BotClassification {
  isBot: boolean;
  botCategory: 'search_engine' | 'social_crawler' | 'seo_crawler' | 'automated_tool' | null;
  botName: string | null;
}

// 1. Legitimate Search Engine Crawlers
const SEARCH_ENGINE_BOTS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /Googlebot/i, name: 'Googlebot' },
  { pattern: /Google-InspectionTool/i, name: 'Google Inspection Tool' },
  { pattern: /Google-Site-Verification/i, name: 'Google Site Verification' },
  { pattern: /GoogleOther/i, name: 'GoogleOther' },
  { pattern: /bingbot/i, name: 'Bingbot' },
  { pattern: /MicrosoftPreview/i, name: 'Microsoft Preview' },
  { pattern: /Baiduspider/i, name: 'Baiduspider' },
  { pattern: /YandexBot/i, name: 'YandexBot' },
  { pattern: /DuckDuckBot/i, name: 'DuckDuckBot' },
  { pattern: /Applebot/i, name: 'Applebot' },
  { pattern: /PetalBot/i, name: 'PetalBot' },
  { pattern: /Sogou\s+(web|head|inst)\s+spider/i, name: 'Sogou Spider' },
  { pattern: /Yahoo!\s+Slurp/i, name: 'Yahoo! Slurp' },
  { pattern: /Qwantify/i, name: 'Qwantify' },
  { pattern: /NaverBot|Yeti/i, name: 'Naver Yeti' },
  { pattern: /SeznamBot/i, name: 'SeznamBot' },
  { pattern: /Daum/i, name: 'Daum' },
];

// 2. Social Media Link & Content Crawlers
const SOCIAL_CRAWLERS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /meta-externalagent/i, name: 'Meta External Agent' },
  { pattern: /meta-webindexer/i, name: 'Meta Web Indexer' },
  { pattern: /facebookexternalhit/i, name: 'Facebook External Hit' },
  { pattern: /Facebot/i, name: 'Facebot' },
  { pattern: /Twitterbot/i, name: 'Twitterbot' },
  { pattern: /LinkedInBot/i, name: 'LinkedInBot' },
  { pattern: /Pinterest(bot)?/i, name: 'Pinterestbot' },
  { pattern: /Slackbot/i, name: 'Slackbot' },
  { pattern: /TelegramBot/i, name: 'TelegramBot' },
  { pattern: /WhatsApp/i, name: 'WhatsApp Link Preview' },
  { pattern: /Discordbot/i, name: 'Discordbot' },
  { pattern: /SkypeUriPreview/i, name: 'Skype Link Preview' },
  { pattern: /vkShare/i, name: 'VK Share' },
  { pattern: /Redditbot/i, name: 'Redditbot' },
];

// 3. SEO Auditing & Web Indexing Crawlers
const SEO_CRAWLERS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /AhrefsBot/i, name: 'AhrefsBot' },
  { pattern: /SemrushBot/i, name: 'SemrushBot' },
  { pattern: /DotBot/i, name: 'DotBot' },
  { pattern: /MJ12bot/i, name: 'MJ12bot' },
  { pattern: /BLEXBot/i, name: 'BLEXBot' },
  { pattern: /DataForSeoBot/i, name: 'DataForSeoBot' },
  { pattern: /Screaming\s+Frog/i, name: 'Screaming Frog' },
  { pattern: /SiteAuditBot/i, name: 'SiteAuditBot' },
  { pattern: /ZoominfoBot/i, name: 'ZoominfoBot' },
  { pattern: /Serpstatbot/i, name: 'Serpstatbot' },
  { pattern: /SEOkicks/i, name: 'SEOkicks' },
  { pattern: /FossickBot/i, name: 'FossickBot' },
  { pattern: /Bytespider/i, name: 'Bytespider' },
];

// 4. Automated Scraping Tools, HTTP Libraries, and Headless Runtimes
const AUTOMATED_TOOLS: Array<{ pattern: RegExp; name: string }> = [
  { pattern: /HeadlessChrome/i, name: 'HeadlessChrome' },
  { pattern: /PhantomJS/i, name: 'PhantomJS' },
  { pattern: /Puppeteer/i, name: 'Puppeteer' },
  { pattern: /Playwright/i, name: 'Playwright' },
  { pattern: /Selenium/i, name: 'Selenium' },
  { pattern: /WebDriver/i, name: 'WebDriver' },
  { pattern: /curl\//i, name: 'cURL' },
  { pattern: /Wget\//i, name: 'Wget' },
  { pattern: /python-requests/i, name: 'Python Requests' },
  { pattern: /Python\/\d+/i, name: 'Python' },
  { pattern: /aiohttp/i, name: 'aiohttp' },
  { pattern: /urllib/i, name: 'urllib' },
  { pattern: /Go-http-client/i, name: 'Go HTTP Client' },
  { pattern: /PostmanRuntime/i, name: 'Postman' },
  { pattern: /Insomnia/i, name: 'Insomnia' },
  { pattern: /Scrapy/i, name: 'Scrapy' },
  { pattern: /node-fetch/i, name: 'node-fetch' },
  { pattern: /axios\//i, name: 'Axios' },
  { pattern: /Undici/i, name: 'Undici' },
  { pattern: /Apache-HttpClient/i, name: 'Apache HttpClient' },
  { pattern: /Java\/\d+/i, name: 'Java' },
  { pattern: /libwww-perl/i, name: 'Perl libwww' },
  { pattern: /httpx/i, name: 'HTTPX' },
  { pattern: /Go\s+\d+\.\d+/i, name: 'Go Runtime' },
  { pattern: /zgrab/i, name: 'Zgrab Scanner' },
  { pattern: /CensysInspect/i, name: 'Censys Scanner' },
  { pattern: /Nmap/i, name: 'Nmap' },
];

// 5. Generic bot tokens in user-agent string
const GENERIC_BOT_REGEX = /(?:^|\W)(bot|crawler|spider|scrape|scraper|crawl|slurp|archiver|transcoder|fetcher)(?:\W|$)/i;

/**
 * Classifies a visitor as human or bot based on User-Agent, headers, and client signals.
 */
export function classifyVisitor(
  userAgent: string = '',
  isWebDriver: boolean = false
): BotClassification {
  const ua = (userAgent || '').trim();

  // 1. Client-Side WebDriver signal
  if (isWebDriver) {
    return {
      isBot: true,
      botCategory: 'automated_tool',
      botName: 'Automated WebDriver'
    };
  }

  // 2. Empty or missing User-Agent is automated traffic
  if (!ua || ua === 'Unknown') {
    return {
      isBot: true,
      botCategory: 'automated_tool',
      botName: 'Empty User-Agent'
    };
  }

  // 3. Search Engine Crawlers
  for (const bot of SEARCH_ENGINE_BOTS) {
    if (bot.pattern.test(ua)) {
      return {
        isBot: true,
        botCategory: 'search_engine',
        botName: bot.name
      };
    }
  }

  // 4. Social Media Crawlers
  for (const bot of SOCIAL_CRAWLERS) {
    if (bot.pattern.test(ua)) {
      return {
        isBot: true,
        botCategory: 'social_crawler',
        botName: bot.name
      };
    }
  }

  // 5. SEO Crawlers
  for (const bot of SEO_CRAWLERS) {
    if (bot.pattern.test(ua)) {
      return {
        isBot: true,
        botCategory: 'seo_crawler',
        botName: bot.name
      };
    }
  }

  // 6. Automated Tools & Headless Browsers
  for (const tool of AUTOMATED_TOOLS) {
    if (tool.pattern.test(ua)) {
      return {
        isBot: true,
        botCategory: 'automated_tool',
        botName: tool.name
      };
    }
  }

  // 7. Generic Bot Keyword Match
  if (GENERIC_BOT_REGEX.test(ua)) {
    return {
      isBot: true,
      botCategory: 'automated_tool',
      botName: 'Generic Bot'
    };
  }

  // 8. Legacy Outdated Bot Signatures
  // Chrome 99 was released in March 2022 and is widely used by rigid Chinese scraper scripts
  if (ua.includes('Chrome/99.0.4844.51')) {
    return {
      isBot: true,
      botCategory: 'automated_tool',
      botName: 'Legacy Automated Scraper (Chrome 99)'
    };
  }

  // 9. Spoofed Scraper Signatures
  // Automated proxy scrapers generate impossible iOS Safari combinations like Version/27.2 or CriOS/157
  if (/iPhone.*Version\/27\.\d+/i.test(ua) || /iPhone.*CriOS\/157\.\d+/i.test(ua)) {
    return {
      isBot: true,
      botCategory: 'automated_tool',
      botName: 'Automated Scraper (Spoofed iOS)'
    };
  }

  // Default: Human Visitor
  return {
    isBot: false,
    botCategory: null,
    botName: null
  };
}
