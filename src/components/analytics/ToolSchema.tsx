import React from 'react';
import { buildHowToSchema } from '@/lib/howto-schema';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSchemaProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  slug?: string;
  imageUrl?: string;
  ratingValue?: number;
  ratingCount?: number;
  faqs?: FAQItem[];
  disableHowTo?: boolean;
  locale?: string;
}

/**
 * Maps ToolWala tool categories to valid Schema.org applicationCategory values
 * @see https://schema.org/applicationCategory
 */
export function mapToApplicationCategory(category?: string): string {
  if (!category) return 'UtilitiesApplication';
  
  const cat = category.toLowerCase();
  if (cat.includes('pdf') || cat.includes('document')) {
    return 'UtilitiesApplication';
  }
  if (cat.includes('image') || cat.includes('photo') || cat.includes('social') || cat.includes('media')) {
    return 'MultimediaApplication';
  }
  if (cat.includes('business') || cat.includes('resume') || cat.includes('career') || cat.includes('invoice')) {
    return 'BusinessApplication';
  }
  if (cat.includes('seo') || cat.includes('developer') || cat.includes('code')) {
    return 'DeveloperApplication';
  }
  if (cat.includes('calculator') || cat.includes('finance')) {
    return 'UtilitiesApplication';
  }
  
  return 'UtilitiesApplication';
}

export default function ToolSchema({
  name,
  description,
  url,
  category = 'Utility Tools',
  slug,
  imageUrl = 'https://www.toolwala.co/icon-512.png',
  ratingValue,
  ratingCount,
  faqs = [],
  disableHowTo = false,
  locale = 'en',
}: ToolSchemaProps) {
  const canonicalUrl = url.endsWith('/') ? url : `${url}/`;
  const appCategory = mapToApplicationCategory(category);
  const toolSlug = slug || url.replace(/^https?:\/\/[^\/]+\/tools\//, '').replace(/\/$/, '');
  const inLanguage = locale === 'hi' ? 'hi-IN' : locale === 'en' ? 'en-US' : `${locale}-${locale.toUpperCase()}`;

  // 1. Construct Google Rich Results compliant WebApplication/SoftwareApplication schema
  const softwareAppSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': ['WebApplication', 'SoftwareApplication'],
    '@id': `${canonicalUrl}#webapp`,
    name: name,
    description: description,
    url: canonicalUrl,
    image: imageUrl,
    applicationCategory: appCategory,
    operatingSystem: 'Any (Web Browser)',
    browserRequirements: 'Requires HTML5 and JavaScript compatible modern web browser',
    inLanguage: inLanguage,
    featureList: [
      '100% Client-Side Processing in Browser RAM',
      'Zero Server Uploads for Supported Tools',
      'No Account or Registration Required',
      'Free Access'
    ],
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://www.toolwala.co/#organization',
      name: 'ToolWala',
      url: 'https://www.toolwala.co/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.toolwala.co/icon-512.png',
      },
    },
  };

  // Add aggregateRating ONLY if real valid ratings exist
  if (
    typeof ratingValue === 'number' &&
    ratingValue > 0 &&
    typeof ratingCount === 'number' &&
    ratingCount > 0
  ) {
    softwareAppSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      ratingCount: ratingCount.toString(),
      'bestRating': '5',
      'worstRating': '1',
    };
  }

  // 2. Construct Google Rich Results compliant HowTo schema
  const howToSchema = !disableHowTo && toolSlug
    ? buildHowToSchema({
        slug: toolSlug,
        title: name,
        category: category,
        description: description,
      })
    : null;

  // 3. Construct FAQPage schema if FAQs exist
  const faqSchema = faqs && faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  const sanitizeId = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <>
      <script
        type="application/ld+json"
        id={`schema-software-app-${sanitizeId(name)}`}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {howToSchema && (
        <script
          type="application/ld+json"
          id={`schema-howto-${sanitizeId(name)}`}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
      )}
      {faqSchema && (
        <script
          type="application/ld+json"
          id={`schema-faq-${sanitizeId(name)}`}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
