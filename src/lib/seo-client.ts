export function getLocalizedCanonicalUrl(pathname: string, locale: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.toolwala.co";
  const parts = pathname.split('/');
  const cleanPath = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'].includes(parts[1])
    ? '/' + parts.slice(2).join('/')
    : pathname;
  
  const cleanPathNoSlash = cleanPath.replace(/\/$/, '');
  
  if (locale === 'en') {
    return `${siteUrl}${cleanPathNoSlash}/`;
  }
  return `${siteUrl}/${locale}${cleanPathNoSlash}/`;
}
