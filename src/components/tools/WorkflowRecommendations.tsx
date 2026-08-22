"use client";

import Link from 'next/link';
import { useTranslation } from '@/components/I18nContext';
import { toolsData, type Tool } from '@/data/tools';
import { getWorkflowRecommendations } from '@/data/workflow_recommendations';
import { Zap, TrendingUp, Workflow, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface WorkflowRecommendationsProps {
  slug: string;
}

export default function WorkflowRecommendations({ slug }: WorkflowRecommendationsProps) {
  const { t, locale, localizeHref } = useTranslation();

  // Find the current tool to resolve its category
  const currentTool = toolsData.find((t) => t.slug === slug);
  const category = currentTool?.category || 'PDF Tools';

  const recommendations = getWorkflowRecommendations(slug, category);

  // Look up full Tool details from static catalog
  const getToolDetails = (toolSlug: string): Tool | undefined => {
    return toolsData.find((t) => t.slug === toolSlug);
  };

  const nextTools = recommendations.nextRecommended
    .map(getToolDetails)
    .filter((t): t is Tool => !!t);

  const togetherTools = recommendations.mostUsedTogether
    .map(getToolDetails)
    .filter((t): t is Tool => !!t);

  const workflowSteps = recommendations.workflow;

  // Find active step index in workflow
  const activeStepIndex = workflowSteps.findIndex((step) => step.slug === slug);

  if (nextTools.length === 0 && togetherTools.length === 0 && workflowSteps.length === 0) {
    return null; // Don't render empty widget
  }

  return (
    <div className="mt-20 border-t border-gray-200 dark:border-white/5 pt-16 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header section with growth/productivity copies */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-200 dark:border-blue-500/20 shadow-sm">
          <Zap className="w-3.5 h-3.5 fill-blue-600/20 dark:fill-blue-400/20" />
          {t('growth.workflow_assistant', 'Smart Workflow Assistant')}
        </div>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter uppercase">
          {t('growth.complete_task_title', 'Supercharge Your PDF & Image Tasks')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium font-sans">
          {t('growth.complete_task_desc', 'Connect actions together without re-uploading documents. Save time and optimize your outputs locally.')}
        </p>
      </div>

      {/* 1. Complete Workflow Visual Stepper */}
      {workflowSteps.length > 0 && (
        <div className="bg-white dark:glass p-8 sm:p-10 rounded-[2.5rem] border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-6">
            <Workflow className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
              {t('growth.interactive_pipeline', 'Interactive Workflow Timeline')}
            </span>
          </div>

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4">
            {/* Visual Stepper Connectors (Desktop-only) */}
            <div className="hidden md:block absolute top-[28px] left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-white/5 z-0">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-transparent transition-all duration-500"
                style={{ 
                  width: activeStepIndex >= 0 
                    ? `${(activeStepIndex / (workflowSteps.length - 1)) * 100}%` 
                    : '0%' 
                }}
              />
            </div>

            {workflowSteps.map((step, idx) => {
              const stepTool = getToolDetails(step.slug);
              const isCurrent = step.slug === slug;
              const isCompleted = idx < activeStepIndex;

              const linkHref = localizeHref(stepTool?.href || `/tools/${step.slug}`);
              const title = t(`tools.${step.slug}.title`, stepTool?.title || step.label);

              const stepContent = (
                <div className="flex flex-col items-center text-center relative z-10 group/step">
                  {/* Step Bubble */}
                  <div 
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold border transition-all duration-300 shadow-sm
                      ${isCurrent 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md scale-110' 
                        : isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-50 dark:bg-[#0b0f19] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-500 hover:border-blue-500/30 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span>{step.icon}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <span 
                    className={`text-[10px] font-black uppercase tracking-widest mt-3 transition-colors duration-300
                      ${isCurrent 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : isCompleted
                        ? 'text-emerald-600/70 dark:text-emerald-500/70'
                        : 'text-gray-600 dark:text-gray-500 group-hover/step:text-gray-900 dark:group-hover/step:text-gray-300'
                      }
                    `}
                  >
                    {title}
                  </span>

                  <span className="text-[9px] text-gray-500 dark:text-gray-600 font-bold uppercase tracking-wider mt-0.5 font-sans">
                    {isCurrent 
                      ? t('growth.step_active', 'Active Task') 
                      : isCompleted 
                      ? t('growth.step_completed', 'Completed') 
                      : t('growth.step_upcoming', 'Next Step')
                    }
                  </span>
                </div>
              );

              if (isCurrent) {
                return (
                  <div key={step.slug}>
                    {stepContent}
                  </div>
                );
              }

              return (
                <Link key={step.slug} href={linkHref} className="cursor-pointer">
                  {stepContent}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid for Next Recommended & Most Used Together */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 2. Next Recommended Tools (2/3 width on large screens) */}
        {nextTools.length > 0 && (
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
              <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              {t('growth.next_recommended', 'Next Recommended Actions')}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nextTools.map((tool) => {
                const title = t(`tools.${tool.slug}.title`, tool.title);
                const desc = t(`tools.${tool.slug}.description`, tool.description);
                const linkHref = localizeHref(tool.href);

                return (
                  <Link 
                    key={tool.slug} 
                    href={linkHref}
                    className="bg-white dark:glass p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 transition-all group flex flex-col justify-between h-full relative overflow-hidden cursor-pointer shadow-sm"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
                    
                    <div className="space-y-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-white border border-blue-100 dark:border-blue-500/10 text-xl">
                        {tool.icon}
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-base font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                          {title}
                        </h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium font-sans leading-relaxed line-clamp-3">
                          {desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mt-4 group-hover:text-blue-700 dark:group-hover:text-white transition-colors">
                      {t('tools.try_tool', 'Try Tool')}
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Most Used Together (1/3 width on large screens) */}
        {togetherTools.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2 px-1">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {t('growth.most_used_together', 'Frequently Used Together')}
            </h4>

            <div className="bg-white dark:glass p-6 rounded-[2rem] border border-gray-200 dark:border-white/5 space-y-4 shadow-sm">
              {togetherTools.map((tool) => {
                const title = t(`tools.${tool.slug}.title`, tool.title);
                const linkHref = localizeHref(tool.href);

                return (
                  <Link 
                    key={tool.slug} 
                    href={linkHref}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#0b0f19]/40 hover:border-indigo-500/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-600/10 text-indigo-600 dark:text-white text-base">
                        {tool.icon}
                      </div>
                      <span className="text-xs font-black text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                        {title}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
