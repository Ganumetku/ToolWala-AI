from __future__ import annotations

import fitz

from .models import ExtractResponse, TextSpan


def extract_document(pdf_bytes: bytes) -> dict:
  doc = fitz.open(stream=pdf_bytes, filetype="pdf")
  spans: list[TextSpan] = []
  try:
    for page_index in range(doc.page_count):
      page = doc[page_index]
      data = page.get_text("dict", flags=fitz.TEXT_PRESERVE_WHITESPACE)
      run_i = 0
      for block in data.get("blocks", []):
        if block.get("type") != 0:
          continue
        for line in block.get("lines", []):
          for span in line.get("spans", []):
            text = (span.get("text") or "").strip()
            if not text:
              continue
            bbox = tuple(float(v) for v in span["bbox"])
            origin = span.get("origin") or (bbox[0], bbox[3])
            color = span.get("color", 0)
            rgb = (
              (color >> 16) & 255,
              (color >> 8) & 255,
              color & 255,
            )
            flags = int(span.get("flags") or 0)
            spans.append(
              TextSpan(
                id=f"p{page_index + 1}_s{run_i}",
                page=page_index + 1,
                text=text,
                bbox=(bbox[0], bbox[1], bbox[2], bbox[3]),
                origin=(float(origin[0]), float(origin[1])),
                font_size=float(span.get("size") or 12),
                font_name=str(span.get("font") or "Helvetica"),
                color=rgb,
                bold=bool(flags & 2 ** 4),
                italic=bool(flags & 2 ** 1),
              )
            )
            run_i += 1
    return ExtractResponse(page_count=doc.page_count, spans=spans).model_dump()
  finally:
    doc.close()
