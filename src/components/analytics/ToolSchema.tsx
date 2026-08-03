import React from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ToolSchemaProps {
  name: string;
  description: string;
  url: string;
  category?: string;
  imageUrl?: string;
  ratingValue?: number;
  ratingCount?: number;
  faqs?: FAQItem[];
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
  imageUrl = 'https://toolwala.co/icon-512.png',
  ratingValue,
  ratingCount,
  faqs = [],
}: ToolSchemaProps) {
  const canonicalUrl = url.endsWith('/') ? url : `${url}/`;
  const appCategory = mapToApplicationCategory(category);

  // Construct Google Rich Results compliant SoftwareApplication schema
  const softwareAppSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: name,
    description: description,
    url: canonicalUrl,
    image: imageUrl,
    applicationCategory: appCategory,
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5 web browser.',
    softwareVersion: '1.0.0',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'ToolWala AI',
      url: 'https://toolwala.co',
      logo: {
        '@type': 'ImageObject',
        url: 'https://toolwala.co/icon-512.png',
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

  // Construct FAQPage schema if FAQs exist
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

  return (
    <>
      <script
        type="application/ld+json"
        id={`schema-software-app-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          id={`schema-faq-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
