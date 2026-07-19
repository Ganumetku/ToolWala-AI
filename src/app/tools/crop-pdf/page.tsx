"use client";

import ToolArticle from "@/components/ToolArticle";
import { toolArticles } from "@/data/toolArticles";
import ToolVisibilityGuard from "@/components/ToolVisibilityGuard";
import CropPdfEngine from "@/components/CropPdfEngine";

export default function CropPdfPage() {
  return (
    <ToolVisibilityGuard slug="crop-pdf">
      <CropPdfEngine
        seoArticle={
          toolArticles["crop-pdf"] && (
            <ToolArticle {...toolArticles["crop-pdf"]} />
          )
        }
      />
    </ToolVisibilityGuard>
  );
}
