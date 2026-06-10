"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "@/lib/blog-seo";

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

    const handleScroll = () => {
      let current = "";
      for (const h of headings) {
        if (h.getBoundingClientRect().top <= 120) current = h.id;
      }
      setActiveId(current || domItems[0]?.id || "");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [syncFromDom, contentKey]);

  if (!items.length) return null;

  return (
    <div className="glass rounded-[2rem] border border-white/5 p-6 space-y-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-3">
        Table of Contents
      </h3>
      <ul className="space-y-3 text-xs font-bold tracking-wide max-h-[50vh] overflow-y-auto">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 12}px` }}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`block transition-all hover:text-blue-400 line-clamp-2 ${
                activeId === item.id
                  ? "text-blue-500 pl-2 border-l-2 border-blue-500"
                  : "text-gray-500"
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
