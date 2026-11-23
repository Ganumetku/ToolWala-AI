"""
ToolWala PDF Engine — server-side editor and high-fidelity PDF to Word converter.

Run:
  cd services/pdf-engine
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
  .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8787
"""

from __future__ import annotations

import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from starlette.concurrency import run_in_threadpool

from .apply import apply_edits
from .extract import extract_document
from .models import ApplyRequest
from .pdf_to_word import convert_pdf_to_docx

app = FastAPI(title="ToolWala PDF Engine", version="0.2.0")

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=False,
  allow_methods=["*"],
  allow_headers=["*"],
  expose_headers=["Content-Disposition"],
)


@app.get("/health")
def health():
  return {"ok": True, "service": "pdf-engine", "features": ["extract", "apply", "pdf-to-word"]}


@app.post("/v1/pdf-to-word")
async def pdf_to_word(file: UploadFile = File(...)):
  """Converts an uploaded PDF to a genuine, flowable Microsoft Word (.docx) document."""
  if not file.filename or not file.filename.lower().endswith(".pdf"):
    raise HTTPException(400, "Please upload a valid PDF file.")

  data = await file.read()
  if len(data) == 0:
    raise HTTPException(400, "The uploaded PDF file is empty.")
  if len(data) > 60 * 1024 * 1024:
    raise HTTPException(413, "PDF file is too large (max 60MB).")

  try:
    docx_bytes = await run_in_threadpool(convert_pdf_to_docx, data)
  except Exception as exc:
    raise HTTPException(500, f"Conversion failed: {exc}") from exc

  base_name = os.path.splitext(file.filename)[0] or "converted"
  clean_name = f"{base_name}.docx"

  return Response(
    content=docx_bytes,
    media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    headers={"Content-Disposition": f'attachment; filename="{clean_name}"'},
  )


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
