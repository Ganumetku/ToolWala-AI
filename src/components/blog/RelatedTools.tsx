import Link from "next/link";
import type { Tool } from "@/data/tools";
import { useTranslation } from "@/components/I18nContext";
import ToolIcon, { getCategoryStyle } from "@/components/ToolIcon";

interface RelatedToolsProps {
  tools: Tool[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  const { t } = useTranslation();

  if (!tools.length) return null;

  return (
    <section className="space-y-6 pt-6 animate-fade-in">
      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('blog.related_tools', 'Related Tools')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tools.map((tool) => {
          const catStyle = getCategoryStyle(tool.category);
          return (
            <Link
              key={tool.slug}
              href={tool.href}
              className="group flex items-start gap-4 p-5 rounded-2xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01] hover:bg-gray-100 dark:hover:bg-white/[0.03] hover:border-blue-500/20 transition-all"
            >
              <div className={`w-10 h-10 rounded-xl ${catStyle.bg} ${catStyle.text} border ${catStyle.border} flex items-center justify-center shrink-0`}>
                <ToolIcon icon={tool.icon} className="w-5 h-5" strokeWidth={1.75} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-sm font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {tool.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed">{tool.description}</p>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  {tool.category}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
