"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";
import { calculateBlogSeoScore } from "@/lib/blog-seo";
import type { BlogPost } from "@/types/blog";

interface BlogSeoScoreProps {
  blog: Pick<
    BlogPost,
    "title" | "slug" | "excerpt" | "content" | "thumbnail" | "tags" | "category" | "faqs" | "seoMetadata" | "status"
  >;
  compact?: boolean;
}

const gradeColors = {
  Excellent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  Good: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  Fair: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  Poor: "text-red-400 border-red-500/30 bg-red-500/10",
};

export default function BlogSeoScore({ blog, compact = false }: BlogSeoScoreProps) {
  const result = useMemo(() => calculateBlogSeoScore(blog), [blog]);
  const passed = result.checks.filter((c) => c.passed).length;
  const failed = result.checks.filter((c) => !c.passed && c.suggestion);

  return (
    <div className={`rounded-2xl border border-white/5 bg-white/[0.01] ${compact ? "p-4" : "p-6"} space-y-4`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white">SEO Score</span>
        </div>
        <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${gradeColors[result.grade]}`}>
          {result.grade}
        </div>
      </div>

      <div className="flex items-end gap-3">
        <span className="text-4xl font-black text-white tabular-nums">{result.score}</span>
        <span className="text-sm text-gray-500 font-bold pb-1">/ 100</span>
        <div className="flex-1 ml-2">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                result.score >= 85
                  ? "bg-emerald-500"
                  : result.score >= 70
                    ? "bg-blue-500"
                    : result.score >= 50
                      ? "bg-amber-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>
          <p className="text-[9px] text-gray-500 font-bold mt-1">
            {passed}/{result.checks.length} checks passed
          </p>
        </div>
      </div>

      {!compact && (
        <ul className="space-y-2 max-h-64 overflow-y-auto">
          {result.checks.map((check) => (
            <li
              key={check.id}
              className="flex items-start gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/5"
            >
              {check.passed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black text-white uppercase">{check.label}</span>
                  <span className="text-[9px] text-gray-500 shrink-0">{check.message}</span>
                </div>
                {check.suggestion && !check.passed && (
                  <p className="text-[9px] text-amber-400/80 mt-0.5">{check.suggestion}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {compact && failed.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[10px] text-amber-300/90 font-medium">
            {failed.length} issue{failed.length > 1 ? "s" : ""} to fix: {failed.slice(0, 2).map((c) => c.label).join(", ")}
            {failed.length > 2 ? ` +${failed.length - 2} more` : ""}
          </p>
        </div>
      )}
    </div>
  );
}
