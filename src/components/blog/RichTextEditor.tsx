"use client";

import { useRef, useCallback, useEffect } from "react";
import {
  Bold, Italic, List, ListOrdered, Quote, Link, Image,
  Heading2, Heading3, Code, Minus,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const tools = [
  { cmd: "bold", icon: Bold, label: "Bold" },
  { cmd: "italic", icon: Italic, label: "Italic" },
  { cmd: "h2", icon: Heading2, label: "Heading 2" },
  { cmd: "h3", icon: Heading3, label: "Heading 3" },
  { cmd: "ul", icon: List, label: "Bullet list" },
  { cmd: "ol", icon: ListOrdered, label: "Numbered list" },
  { cmd: "quote", icon: Quote, label: "Quote" },
  { cmd: "link", icon: Link, label: "Link" },
  { cmd: "image", icon: Image, label: "Image" },
  { cmd: "code", icon: Code, label: "Code" },
  { cmd: "hr", icon: Minus, label: "Divider" },
] as const;

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const emitChange = useCallback(() => {
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }, [onChange]);

  const exec = (action: (typeof tools)[number]["cmd"]) => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();

    switch (action) {
      case "bold":
        document.execCommand("bold");
        break;
      case "italic":
        document.execCommand("italic");
        break;
      case "h2":
        document.execCommand("formatBlock", false, "h2");
        break;
      case "h3":
        document.execCommand("formatBlock", false, "h3");
        break;
      case "ul":
        document.execCommand("insertUnorderedList");
        break;
      case "ol":
        document.execCommand("insertOrderedList");
        break;
      case "quote":
        document.execCommand("formatBlock", false, "blockquote");
        break;
      case "link": {
        const url = prompt("Enter URL:");
        if (url) document.execCommand("createLink", false, url);
        break;
      }
      case "image": {
        const src = prompt("Enter image URL:");
        if (src) document.execCommand("insertImage", false, src);
        break;
      }
      case "code":
        document.execCommand("formatBlock", false, "pre");
        break;
      case "hr":
        document.execCommand("insertHorizontalRule");
        break;
    }

    emitChange();
  };

  const insertShortcode = (type: "cta" | "tool") => {
    const slug = prompt("Tool slug (e.g. pdf-ocr):");
    if (!slug) return;

    const el = editorRef.current;
    if (!el) return;

    let html = "";
    if (type === "cta") {
      const title = prompt("CTA title (optional):") || "";
      const desc = prompt("CTA description (optional):") || "";
      html = `<div data-blog-cta data-tool-slug="${slug}" data-title="${title}" data-description="${desc}"></div>`;
    } else {
      const label = prompt("Button label (optional):") || "Try Tool";
      html = `<div data-try-tool data-tool-slug="${slug}" data-label="${label}"></div>`;
    }

    document.execCommand("insertHTML", false, html);
    emitChange();
  };

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#0f172a]">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-white/[0.02]">
        {tools.map(({ cmd, icon: Icon, label }) => (
          <button
            key={cmd}
            type="button"
            onClick={() => exec(cmd)}
            title={label}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
        <span className="w-px h-6 bg-white/10 mx-1" />
        <button
          type="button"
          onClick={() => insertShortcode("cta")}
          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-600/10 cursor-pointer"
        >
          + CTA Block
        </button>
        <button
          type="button"
          onClick={() => insertShortcode("tool")}
          className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-600/10 cursor-pointer"
        >
          + Try Tool
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emitChange}
        onBlur={emitChange}
        data-placeholder={placeholder}
        className="min-h-[320px] max-h-[480px] overflow-y-auto p-5 text-sm text-gray-200 outline-none prose prose-invert max-w-none [&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-gray-600"
      />
    </div>
  );
}
