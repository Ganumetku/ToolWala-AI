from __future__ import annotations

from typing import List

import fitz

from .models import TextEdit
from .rewrite import rewrite_document


def apply_edits(pdf_bytes: bytes, edits: List[TextEdit]) -> bytes:
  if not edits:
    return pdf_bytes

  doc = fitz.open(stream=pdf_bytes, filetype="pdf")
  try:
    applied = rewrite_document(doc, edits)
    if applied == 0:
      raise ValueError("Could not find original text operators to rewrite")
    return doc.tobytes(deflate=True, garbage=3)
  finally:
    doc.close()
