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
  processedHtml?: string;
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
  processedHtml,
}: BlogRichContentProps) {
  const processedContent = useMemo(() => {
    if (processedHtml) return processedHtml;
    const normalized = normalizeBlogContent(content);
    return optimizeBlogContent(normalized, allTools, allBlogs, currentSlug);
  }, [content, allTools, allBlogs, currentSlug, processedHtml]);

  const segments = useMemo(() => parseContent(processedContent), [processedContent]);

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 text-base sm:text-[17px] font-normal leading-[1.8] font-sans select-text space-y-6 animate-fade-in
      [&_h2]:text-2xl sm:[&_h2]:text-3xl [&_h2]:font-extrabold [&_h2]:text-slate-900 dark:[&_h2]:text-white [&_h2]:tracking-tight [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:scroll-mt-28 [&_h2]:pt-4 [&_h2]:border-t [&_h2]:border-slate-100 dark:[&_h2]:border-white/5
      [&_h3]:text-xl sm:[&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-900 dark:[&_h3]:text-white [&_h3]:tracking-tight [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:scroll-mt-28
      [&_h4]:text-lg [&_h4]:font-bold [&_h4]:text-slate-900 dark:[&_h4]:text-white [&_h4]:tracking-tight [&_h4]:mt-6 [&_h4]:mb-2
      [&_p]:mb-5 [&_p]:leading-[1.8]
      [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4 [&_ol]:space-y-1.5 [&_li]:mb-1.5 [&_li]:leading-relaxed
      [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:font-semibold [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-blue-700 dark:hover:[&_a]:text-blue-300 [&_a]:transition-colors
      [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50/60 dark:[&_blockquote]:bg-blue-950/20 [&_blockquote]:py-3.5 [&_blockquote]:px-5 [&_blockquote]:rounded-r-2xl [&_blockquote]:my-6 [&_blockquote]:not-italic [&_blockquote]:text-slate-800 dark:[&_blockquote]:text-slate-200
      [&_img]:rounded-2xl [&_img]:my-8 [&_img]:shadow-lg [&_img]:border [&_img]:border-slate-200 dark:[&_img]:border-white/10 [&_img]:max-w-full [&_img]:h-auto [&_img]:mx-auto
      [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:rounded-2xl [&_table]:overflow-hidden [&_table]:border [&_table]:border-slate-200 dark:[&_table]:border-white/10 [&_table]:shadow-sm [&_table]:block sm:[&_table]:table [&_table]:overflow-x-auto
      [&_th]:bg-slate-100 dark:[&_th]:bg-slate-800/80 [&_th]:text-slate-900 dark:[&_th]:text-white [&_th]:font-bold [&_th]:p-3.5 [&_th]:text-left [&_th]:text-sm [&_th]:whitespace-nowrap
      [&_td]:p-3.5 [&_td]:text-sm [&_td]:border-t [&_td]:border-slate-200 dark:[&_td]:border-white/10 [&_td]:text-slate-700 dark:[&_td]:text-slate-300
      [&_tr:hover]:bg-slate-50 dark:[&_tr:hover]:bg-white/[0.02]
      [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_strong]:font-semibold
      [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:bg-slate-100 dark:[&_code]:bg-slate-800 [&_code]:text-blue-600 dark:[&_code]:text-blue-400 [&_code]:font-mono [&_code]:text-sm
      [&_pre]:p-5 [&_pre]:rounded-2xl [&_pre]:bg-slate-950 [&_pre]:text-slate-100 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-slate-800 [&_pre]:my-6
    ">
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
