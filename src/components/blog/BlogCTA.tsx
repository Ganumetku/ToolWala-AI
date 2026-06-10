import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { Tool } from "@/data/tools";

interface BlogCTAProps {
  tool: Tool;
  title?: string;
  description?: string;
}

export default function BlogCTA({ tool, title, description }: BlogCTAProps) {
  return (
    <div className="my-10 relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10 p-8 sm:p-10">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center gap-2 text-blue-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Free Tool</span>
          </div>
          <h4 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
            {title || tool.title}
          </h4>
          <p className="text-sm text-gray-400 font-medium leading-relaxed">
            {description || tool.description}
          </p>
        </div>
        <Link
          href={tool.href}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all shrink-0 group"
        >
          Try Tool
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
