"use client";

import React from 'react';
import { toolsData } from '@/data/tools';
import ToolSchema from './ToolSchema';
import { useTranslation } from '@/components/I18nContext';

interface AutoToolSchemaProps {
  slug: string;
}

/**
 * AutoToolSchema component:
 * Automatically resolves tool metadata for any slug and renders 
 * a Google Rich Results compliant WebApplication JSON-LD schema.
 */
export default function AutoToolSchema({ slug }: AutoToolSchemaProps) {
  const { t, locale } = useTranslation();
  if (!slug || slug === 'pdf-tools') return null;

  // Clean slug
  const cleanSlug = slug.replace(/\/$/, '');

  // Match tool in static tools configuration
  const tool = toolsData.find(
    (t) => t.slug === cleanSlug || t.href.replace(/\/$/, '') === `/tools/${cleanSlug}`
  );

  let title = '';
  let description = '';
  let category = 'Utility Tools';

  if (tool) {
    title = t(`tools.${tool.slug}.title`, tool.title);
    description = t(`tools.${tool.slug}.description`, tool.description);
    category = tool.category;
  } else {
    // Format dynamic or unlisted tool slug into human-readable title
    const formattedTitle = cleanSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    title = formattedTitle;
    description = `Free online ${formattedTitle} tool by ToolWala. Fast, secure, and 100% browser-based.`;

    if (cleanSlug.includes('pdf')) {
      category = 'PDF Tools';
    } else if (cleanSlug.includes('image') || cleanSlug.includes('photo') || cleanSlug.includes('webp') || cleanSlug.includes('jpg') || cleanSlug.includes('png')) {
      category = 'Image Tools';
    } else if (cleanSlug.includes('calculator')) {
      category = 'Calculator Tools';
    } else if (cleanSlug.includes('resume') || cleanSlug.includes('ats')) {
      category = 'Resume & Career';
    } else {
      category = 'Utility Tools';
    }
  }

  const url = locale === 'en'
    ? `https://www.toolwala.co/tools/${cleanSlug}/`
    : `https://www.toolwala.co/${locale}/tools/${cleanSlug}/`;

  return (
    <ToolSchema
      name={title}
      description={description}
      url={url}
      category={category}
      slug={cleanSlug}
      imageUrl="https://www.toolwala.co/icon-512.png"
      disableHowTo={true}
      locale={locale}
    />
  );
}
