/**
 * Shared blog tag archive indexability policy.
 * 
 * Defines high-value topic hubs that meet indexability criteria:
 * - Meaningful independent search intent
 * - 2+ substantive articles (or unique high-intent government portal topics)
 * - Demonstrated organic impressions or non-duplicative topic scope
 * 
 * Low-value / single-article duplicate clusters are marked `noindex, follow`
 * and excluded from sitemap.xml while remaining accessible with HTTP 200.
 */

export const RETAINED_INDEXABLE_TAGS = new Set<string>([
  // Core multi-article topic hubs (3+ articles)
  'image-compression',
  'pdf',
  'compress-pdf',
  'government-forms',
  'ssc',
  'photo-resize',
  'upsc',
  'aadhaar',
  'pan-card',
  'nsdl',
  'passport',
  'photo-sizing',
  'free-tools',
  'toolwala',

  // High-value portal & search intent hubs (2 articles, verified individual relevance)
  'govt-guidelines',
  'form-upload',
  'pdf-compressor',
  'pdf-compress',
  'passport-photo',
  'signature',
  'biometric-photo',
  'uidai',
  'epfo',
  '20kb-limit',
  'image-tools',
  'ai-tools',
  'document-management',

  // High-value specific document topics
  'pdf-editor',
  'pdf-tools',
  'document-compression',
  'pan-card-photo-size',
  'passport-photo-size-india-2026',
  'passport-photo-maker',
  'passport-seva',
  'image-converter',
  'income-tax',
  'tax-invoicing',
  'aadhaar-card',
  'utiitsl'
]);

export function isIndexableTag(tagSlug: string): boolean {
  if (!tagSlug) return false;
  const normalized = tagSlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return RETAINED_INDEXABLE_TAGS.has(normalized);
}
