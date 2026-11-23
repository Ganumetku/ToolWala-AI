from __future__ import annotations

import os
import tempfile
from pdf2docx import Converter


def convert_pdf_to_docx(pdf_bytes: bytes) -> bytes:
  """Converts PDF bytes into a Microsoft Word (.docx) document using layout reconstruction."""
  with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as in_f:
    in_path = in_f.name
    in_f.write(pdf_bytes)

  out_path = in_path.replace(".pdf", ".docx")
  try:
    cv = Converter(in_path)
    cv.convert(out_path, start=0, end=None)
    cv.close()

    with open(out_path, "rb") as out_f:
      return out_f.read()
  finally:
    for path in (in_path, out_path):
      if os.path.exists(path):
        try:
          os.remove(path)
        except OSError:
          pass
