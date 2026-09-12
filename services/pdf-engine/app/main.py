"""
ToolWala PDF Engine — server-side editor closer to iLovePDF.

This is NOT the browser cover-and-redraw path. It extracts fonts from the
PDF and rewrites text using those files (redact original span, draw with
the real face). True content-stream operator rewrite is a later phase.

Run:
  cd services/pdf-engine
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
  .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8787

Website: PDF_ENGINE_URL=http://127.0.0.1:8787
"""

from __future__ import annotations

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from .apply import apply_edits
from .extract import extract_document
from .models import ApplyRequest

app = FastAPI(title="ToolWala PDF Engine", version="0.1.0")
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


@app.get("/health")
def health():
  return {"ok": True}


@app.post("/v1/extract")
async def extract(file: UploadFile = File(...)):
  if not file.filename or not file.filename.lower().endswith(".pdf"):
    raise HTTPException(400, "Upload a PDF")
  data = await file.read()
  if len(data) > 40 * 1024 * 1024:
    raise HTTPException(413, "PDF too large")
  try:
    return extract_document(data)
  except Exception as exc:
    raise HTTPException(422, f"Extract failed: {exc}") from exc


@app.post("/v1/apply")
async def apply(file: UploadFile = File(...), edits: str = Form(...)):
  if not file.filename or not file.filename.lower().endswith(".pdf"):
    raise HTTPException(400, "Upload a PDF")
  data = await file.read()
  if len(data) > 40 * 1024 * 1024:
    raise HTTPException(413, "PDF too large")
  try:
    payload = ApplyRequest.model_validate_json(edits)
  except Exception as exc:
    raise HTTPException(400, f"Invalid edits JSON: {exc}") from exc
  try:
    out = apply_edits(data, payload.edits)
  except Exception as exc:
    raise HTTPException(422, f"Apply failed: {exc}") from exc
  return Response(content=out, media_type="application/pdf")
