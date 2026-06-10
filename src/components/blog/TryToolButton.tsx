import Link from "next/link";
import { Wrench } from "lucide-react";
import type { Tool } from "@/data/tools";

interface TryToolButtonProps {
  tool: Tool;
  label?: string;
}

export default function TryToolButton({ tool, label = "Try Tool" }: TryToolButtonProps) {
  return (
    <div className="my-6 flex justify-center">
      <Link
        href={tool.href}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-blue-500/30 hover:bg-blue-600/10 hover:border-blue-500/50 text-blue-400 text-xs font-black uppercase tracking-widest transition-all group"
      >
        <Wrench className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        {label} — {tool.title}
      </Link>
    </div>
  );
}
