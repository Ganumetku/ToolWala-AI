from __future__ import annotations

from typing import List, Optional, Tuple

from pydantic import BaseModel, Field


BBox = Tuple[float, float, float, float]


class TextSpan(BaseModel):
  id: str
  page: int
  text: str
  bbox: BBox
  origin: Tuple[float, float]
  font_size: float
  font_name: str
  color: Tuple[int, int, int] = (0, 0, 0)
  bold: bool = False
  italic: bool = False


class ExtractResponse(BaseModel):
  page_count: int
  spans: List[TextSpan]


class TextEdit(BaseModel):
  page: int = Field(..., ge=1)
  new_text: str
  span_id: Optional[str] = None
  text: Optional[str] = None
  bbox: Optional[BBox] = None


class ApplyRequest(BaseModel):
  edits: List[TextEdit]
