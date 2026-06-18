import Link from "next/link";
import type { Tool } from "@/data/tools";
import { useTranslation } from "@/components/I18nContext";

interface RelatedToolsProps {
  tools: Tool[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  const { t } = useTranslation();

  if (!tools.length) return null;

  return (
    <section className="space-y-6 pt-6 animate-fade-in">
      <h3 className="text-lg font-black text-white uppercase tracking-widest">{t('blog.related_tools', 'Related Tools')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={tool.href}
            className="group flex items-start gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-blue-500/20 transition-all"
          >
            <span className="text-2xl shrink-0">{tool.icon}</span>
            <div className="space-y-1 min-w-0">
              <h4 className="text-sm font-black text-white uppercase group-hover:text-blue-400 transition-colors line-clamp-1">
                {tool.title}
              </h4>
              <p className="text-xs text-gray-500 font-medium line-clamp-2">{tool.description}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500/80">
                {tool.category}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
