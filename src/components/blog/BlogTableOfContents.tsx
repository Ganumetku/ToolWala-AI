"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog-seo";
import { useTranslation } from "@/components/I18nContext";

interface BlogTableOfContentsProps {
  items: TocItem[];
  /** If true, also scan DOM for headings (client hydration) */
  syncFromDom?: boolean;
  contentKey?: string;
}

export default function BlogTableOfContents({
  items: initialItems,
  syncFromDom = true,
  contentKey,
}: BlogTableOfContentsProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(initialItems[0]?.id ?? "");

  useEffect(() => {
    if (!syncFromDom) return;

    const articleBody = document.getElementById("blog-article-body");
    if (!articleBody) return;

    const headings = articleBody.querySelectorAll("h2, h3");
    const domItems: TocItem[] = [];

    headings.forEach((heading, idx) => {
      const text = heading.textContent || "";
      const id = heading.id || `heading-${idx}`;
      if (!heading.id) heading.id = id;
      domItems.push({
        id,
        text,
        level: heading.tagName.toLowerCase() === "h2" ? 2 : 3,
      });
    });

    if (domItems.length > 0) setItems(domItems);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -75% 0px",
        threshold: 0,
      }
    );

    headings.forEach((h) => observer.observe(h));

    return () => {
      observer.disconnect();
    };
  }, [syncFromDom, contentKey]);

  if (!items.length) return null;

  return (
    <div className="bg-white dark:bg-[#0c1222]/90 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm p-5 space-y-3.5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
        <span>{t('blog.table_of_contents', 'Table of Contents')}</span>
        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{items.length} sections</span>
      </h3>
      <ul className="space-y-2 text-xs font-medium tracking-normal max-h-[50vh] overflow-y-auto pr-1">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block transition-all hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2 py-0.5 ${
                activeId === item.id
                  ? "text-blue-600 dark:text-blue-400 font-bold pl-2 border-l-2 border-blue-600 dark:border-blue-500 bg-blue-50/60 dark:bg-blue-900/10 rounded-r"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
