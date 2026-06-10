"use client";

import { useMemo } from "react";
import type { Tool } from "@/data/tools";
import type { BlogPost } from "@/types/blog";
import { normalizeBlogContent } from "@/lib/blog-utils";
import { optimizeBlogContent } from "@/lib/blog-seo";
import BlogCTA from "./BlogCTA";
import TryToolButton from "./TryToolButton";

interface BlogRichContentProps {
  content: string;
  toolsBySlug: Record<string, Tool>;
  allTools?: Tool[];
  allBlogs?: BlogPost[];
  currentSlug?: string;
}

type ContentSegment =
  | { type: "html"; value: string }
  | { type: "cta"; slug: string; title?: string; description?: string }
  | { type: "try-tool"; slug: string; label?: string };

function parseContent(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const regex =
    /<div\s+data-blog-cta[^>]*data-tool-slug="([^"]+)"(?:[^>]*data-title="([^"]*)")?(?:[^>]*data-description="([^"]*)")?[^>]*><\/div>|<div\s+data-try-tool[^>]*data-tool-slug="([^"]+)"(?:[^>]*data-label="([^"]*)")?[^>]*><\/div>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "html", value: html.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      segments.push({
        type: "cta",
        slug: match[1],
        title: match[2] || undefined,
        description: match[3] || undefined,
      });
    } else if (match[4]) {
      segments.push({ type: "try-tool", slug: match[4], label: match[5] || undefined });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < html.length) {
    segments.push({ type: "html", value: html.slice(lastIndex) });
  }

  if (!segments.length) {
    segments.push({ type: "html", value: html });
  }

  return segments;
}

export default function BlogRichContent({
  content,
  toolsBySlug,
  allTools = [],
  allBlogs = [],
  currentSlug,
}: BlogRichContentProps) {
  const processedContent = useMemo(() => {
    const normalized = normalizeBlogContent(content);
    return optimizeBlogContent(normalized, allTools, allBlogs, currentSlug);
  }, [content, allTools, allBlogs, currentSlug]);

  const segments = useMemo(() => parseContent(processedContent), [processedContent]);

  return (
    <div className="prose prose-invert max-w-none text-gray-300 text-base sm:text-lg font-medium leading-relaxed font-sans select-text space-y-6 animate-fade-in [&_h2]:text-2xl [&_h2]:font-black [&_h2]:text-white [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h3]:text-xl [&_h3]:font-black [&_h3]:text-white [&_h3]:uppercase [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-28 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_a]:text-blue-400 [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:rounded-2xl [&_img]:my-6">
      {segments.map((segment, i) => {
        if (segment.type === "html") {
          return (
            <div
              key={`html-${i}`}
              dangerouslySetInnerHTML={{ __html: segment.value }}
            />
          );
        }

        const tool = toolsBySlug[segment.slug];
        if (!tool) return null;

        if (segment.type === "cta") {
          return (
            <BlogCTA
              key={`cta-${i}-${segment.slug}`}
              tool={tool}
              title={segment.title}
              description={segment.description}
            />
          );
        }

        return (
          <TryToolButton
            key={`tool-${i}-${segment.slug}`}
            tool={tool}
            label={segment.label}
          />
        );
      })}
    </div>
  );
}
