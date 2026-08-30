"use client";

import { Crop } from "lucide-react";
import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import InvoiceCropperEngine from "@/components/InvoiceCropperEngine";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";

export default function InvoiceCropperPage() {
  return (
    <ToolVisibilityGuard slug="invoice-cropper">
      <ToolLayout>
        {/* Main Workspace Card */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12">
          <ToolHero
            title="Invoice Cropper"
            description="Auto edge detection and clean border cropping for invoice receipts, documents, and bills."
            icon={<Crop className="w-6 h-6 sm:w-7 sm:h-7" />}
          />

          <div className="p-4 sm:p-8 lg:p-10">
            <InvoiceCropperEngine
              toolSlug="invoice-cropper"
              title="Invoice Cropper"
              description="Crop and resize invoice scans cleanly with edge detection."
            />
          </div>
        </div>

        {/* SEO Article */}
        {toolArticles["invoice-cropper"] && (
          <div className="mt-12 border-t border-slate-200 dark:border-white/5 pt-12">
            <ToolArticle {...toolArticles["invoice-cropper"]} />
          </div>
        )}
      </ToolLayout>
    </ToolVisibilityGuard>
  );
}
