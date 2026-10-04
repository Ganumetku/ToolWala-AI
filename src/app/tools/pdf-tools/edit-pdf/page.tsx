"use client";

import React, { useState } from "react";
import { AlertCircle, Download, FilePenLine } from "lucide-react";
import ToolLayout from "@/components/tools/ToolLayout";
import ToolHero from "@/components/tools/ToolHero";
import UploadZone from "@/components/tools/UploadZone";
import ToolArticle from "@/components/ToolArticle";
import EditPdfEmbed from "@/components/pdf/EditPdfEmbed";
import { toolArticles } from "@/data/toolArticles";

const EDITOR_URL =
  process.env.NEXT_PUBLIC_EDIT_PDF_EDITOR_URL || "https://apna-website-two.vercel.app";

export default function EditPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<{ url: string; fileName: string; flattened: boolean } | null>(null);

  const startOver = () => {
    if (saved?.url) URL.revokeObjectURL(saved.url);
    setSaved(null);
    setFile(null);
    setError(null);
  };

  if (file && !saved) {
    return (
      <div className="fixed inset-0 z-[200] flex flex-col bg-white">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-slate-200 px-3">
          <button
            type="button"
            onClick={startOver}
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Back
          </button>
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{file.name}</p>
        </div>
        <EditPdfEmbed
          editorUrl={EDITOR_URL}
          file={file}
          onError={setError}
          onSaved={(blob, fileName, flattened) => {
            setSaved({ url: URL.createObjectURL(blob), fileName, flattened });
          }}
        />
        {error && (
          <p className="sr-only" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (saved) {
    return (
      <ToolLayout>
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12 p-6 sm:p-10 text-center">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your PDF is ready</h1>
          <p className="mt-2 text-sm text-slate-500">{saved.fileName}</p>
          {saved.flattened && (
            <p className="mt-4 text-sm text-amber-700 dark:text-amber-400">
              This PDF was encrypted or malformed, so it was saved as images. Original text is no longer selectable.
            </p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href={saved.url}
              download={saved.fileName}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
            <button
              type="button"
              onClick={startOver}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-slate-200"
            >
              Edit another PDF
            </button>
          </div>
        </div>
      </ToolLayout>
    );
  }

  return (
    <ToolLayout>
      <div
        data-testid="edit-pdf-landing"
        data-libs-ready="true"
        className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12"
      >
        <ToolHero
          title="Edit PDF Online"
          description="Rebuild, annotate, edit text, draw shapes, and sign PDF documents directly in your browser."
          icon={<FilePenLine className="w-6 h-6" />}
        />

        <div className="p-6 sm:p-10">
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-5 rounded-2xl flex items-start gap-4 border border-red-200 dark:border-red-900/50 text-left mb-6">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <UploadZone
            onFilesSelected={(selectedFiles) => {
              const next = selectedFiles?.[0];
              if (!next) return;
              if (next.type !== "application/pdf" && !next.name.toLowerCase().endsWith(".pdf")) {
                setError("Please choose a PDF file.");
                return;
              }
              setError(null);
              setFile(next);
            }}
            accept="application/pdf"
            multiple={false}
            title="Upload PDF Document to Edit"
            description="Drag and drop your PDF here, or click to choose from your device. 100% private and processed locally."
            buttonText="Select PDF File"
          />
        </div>
      </div>

      {toolArticles["edit-pdf"] && <ToolArticle {...toolArticles["edit-pdf"]} />}
    </ToolLayout>
  );
}
