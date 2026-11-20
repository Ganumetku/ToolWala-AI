/**
 * Geographic Country Resolution Utility
 * 
 * Safely resolves CDN country codes and country strings to clean readable English names.
 * Never defaults to United States when country is unknown or proxy.
 */

const COUNTRY_CODE_MAP: Record<string, string> = {
  'US': 'United States',
  'USA': 'United States',
  'IN': 'India',
  'IND': 'India',
  'GB': 'United Kingdom',
  'UK': 'United Kingdom',
  'CA': 'Canada',
  'DE': 'Germany',
  'AU': 'Australia',
  'FR': 'France',
  'JP': 'Japan',
  'BR': 'Brazil',
  'ZA': 'South Africa',
  'SG': 'Singapore',
  'AE': 'United Arab Emirates',
  'NL': 'Netherlands',
  'IT': 'Italy',
  'ES': 'Spain',
  'CN': 'China',
  'TW': 'Taiwan',
  'HK': 'Hong Kong',
  'MO': 'Macau',
  'MX': 'Mexico',
  'ID': 'Indonesia',
  'PK': 'Pakistan',
  'BD': 'Bangladesh',
  'NG': 'Nigeria',
  'RU': 'Russia',
  'KR': 'South Korea',
  'CO': 'Colombia',
  'AR': 'Argentina',
  'CL': 'Chile',
  'PH': 'Philippines',
  'VN': 'Vietnam',
  'EG': 'Egypt',
  'SA': 'Saudi Arabia',
  'TR': 'Turkey',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'PL': 'Poland',
  'UA': 'Ukraine',
  'SE': 'Sweden',
  'NO': 'Norway',
  'FI': 'Finland',
  'DK': 'Denmark',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'BE': 'Belgium',
  'PT': 'Portugal',
  'IE': 'Ireland',
  'NZ': 'New Zealand',
  'LT': 'Lithuania',
  'RS': 'Serbia',
  'SC': 'Seychelles',
  'BF': 'Burkina Faso',
  'DZ': 'Algeria',
  'EC': 'Ecuador',
  'IQ': 'Iraq',
  'IR': 'Iran',
  'JO': 'Jordan',
  'RO': 'Romania',
  'SN': 'Senegal',
  'SV': 'El Salvador',
  'TG': 'Togo',
};

// Reverse map for lookup from lowercased name -> Canonical English Name
const CANONICAL_NAMES: Record<string, string> = {};
for (const [_, name] of Object.entries(COUNTRY_CODE_MAP)) {
  CANONICAL_NAMES[name.toLowerCase()] = name;
}

let regionNames: Intl.DisplayNames | null = null;
try {
  regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
} catch {
  // Fallback if Intl is not available
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function resolveCountryName(countryInput?: string | null): string {
  if (!countryInput) return 'Unknown';

  const raw = countryInput.trim();
  if (!raw || raw.toLowerCase() === 'unknown') return 'Unknown';

  const upper = raw.toUpperCase();

  // Proxies & Private Networks
  if (upper === 'XX' || upper === 'T1' || upper === 'A1' || upper === 'A2') {
    return 'Anonymous Proxy';
  }
  if (upper === '127.0.0.1' || upper === 'LOCALHOST' || upper === '::1') {
    return 'Local Development';
  }

  // Exact 2- or 3-letter ISO Code Match
  if (COUNTRY_CODE_MAP[upper]) {
    return COUNTRY_CODE_MAP[upper];
  }

  // Canonical name match (e.g. 'UNITED STATES' -> 'United States')
  const lower = raw.toLowerCase();
  if (CANONICAL_NAMES[lower]) {
    return CANONICAL_NAMES[lower];
  }

  // Standard Intl region lookup for 2-letter codes
  if (regionNames && upper.length === 2) {
    try {
      const name = regionNames.of(upper);
      if (name) return name;
    } catch {
      // Ignore Intl failure
    }
  }

  // If already a full readable name (longer than 2 characters), format nicely
  if (raw.length > 2) {
    return toTitleCase(raw);
  }

  return upper;
}
