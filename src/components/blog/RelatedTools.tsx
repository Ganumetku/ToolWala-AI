import type { Tool } from "@/data/tools";
import { useTranslation } from "@/components/I18nContext";
import ToolCard from "@/components/ToolCard";

interface RelatedToolsProps {
  tools: Tool[];
}

export default function RelatedTools({ tools }: RelatedToolsProps) {
  const { t } = useTranslation();

  if (!tools.length) return null;

  return (
    <section className="space-y-6 pt-6 animate-fade-in">
      <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('blog.related_tools', 'Related Tools')}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id || tool.slug}
            {...tool}
            isPopular={tool.popular}
            isTrending={tool.trending}
          />
        ))}
      </div>
    </section>
  );
}
