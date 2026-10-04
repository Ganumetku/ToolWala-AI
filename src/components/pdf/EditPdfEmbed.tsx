"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "booting" | "opening" | "ready" | "error";

type EditorMessage =
  | { type: "EDITOR_READY" }
  | { type: "PDF_LOADED"; payload: { pages: number } }
  | { type: "PDF_SAVED"; payload: { buffer: ArrayBuffer; fileName: string; flattened: boolean } }
  | { type: "ERROR"; payload: { code: string; message: string } };

function isEditorMessage(data: unknown): data is EditorMessage {
  if (!data || typeof data !== "object") return false;
  const type = (data as { type?: unknown }).type;
  return type === "EDITOR_READY" || type === "PDF_LOADED" || type === "PDF_SAVED" || type === "ERROR";
}

export default function EditPdfEmbed({
  editorUrl,
  file,
  onSaved,
  onError,
}: {
  editorUrl: string;
  file: File;
  onSaved: (blob: Blob, fileName: string, flattened: boolean) => void;
  onError?: (message: string) => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef(file);
  const savedRef = useRef(onSaved);
  const errorRef = useRef(onError);
  const sentFor = useRef<File | null>(null);
  const [phase, setPhase] = useState<Phase>("booting");
  const [status, setStatus] = useState("Opening editor...");
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const editorOrigin = new URL(editorUrl).origin;

  useEffect(() => {
    fileRef.current = file;
    savedRef.current = onSaved;
    errorRef.current = onError;
  }, [file, onSaved, onError]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== editorOrigin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (!isEditorMessage(event.data)) return;

      if (event.data.type === "EDITOR_READY") {
        const target = iframeRef.current?.contentWindow;
        const current = fileRef.current;
        if (!target || sentFor.current === current) {
          setPhase((p) => (p === "booting" ? "opening" : p));
          return;
        }
        sentFor.current = current;
        void current.arrayBuffer().then((buffer) => {
          if (!iframeRef.current?.contentWindow) return;
          iframeRef.current.contentWindow.postMessage(
            { type: "LOAD_PDF", payload: { buffer, fileName: current.name } },
            editorOrigin,
            [buffer],
          );
        });
        setPhase("opening");
        setStatus("Opening PDF...");
        return;
      }
      if (event.data.type === "PDF_LOADED") {
        setPhase("ready");
        setStatus(`${event.data.payload.pages} page${event.data.payload.pages === 1 ? "" : "s"} ready`);
        return;
      }
      if (event.data.type === "PDF_SAVED") {
        const { buffer, fileName, flattened } = event.data.payload;
        savedRef.current(new Blob([buffer], { type: "application/pdf" }), fileName, flattened);
        return;
      }
      setPhase("error");
      setError(event.data.payload.message);
      errorRef.current?.(event.data.payload.message);
    };

    window.addEventListener("message", onMessage);
    setSrc(`${editorUrl.replace(/\/$/, "")}/?embed=1`);
    return () => window.removeEventListener("message", onMessage);
  }, [editorOrigin, editorUrl]);

  return (
    <div className="relative h-full min-h-0 w-full bg-slate-100">
      {phase !== "ready" && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-3">
          <p className="rounded-full bg-slate-900/85 px-3 py-1 text-xs font-medium text-white">
            {error ?? status}
          </p>
        </div>
      )}
      {src && (
        <iframe
          ref={iframeRef}
          title="Edit PDF"
          src={src}
          sandbox="allow-scripts allow-same-origin allow-downloads allow-modals"
          className="h-full w-full border-0"
        />
      )}
    </div>
  );
}
