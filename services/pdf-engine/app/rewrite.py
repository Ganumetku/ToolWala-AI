"""Rewrite original PDF text operators (Tj/TJ) in place — iLovePDF-style.

Keeps Tf, Tm, color, and the embedded font. Only the shown string bytes change.
"""

from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple

import fitz

from .font_encoding import FontEncoder, page_font_encoders
from .models import TextEdit

WHITESPACE = b"\x00\t\n\x0c\r "
DELIMS = b"()<>[]{}/%"


@dataclass
class Tok:
  kind: str
  raw: bytes
  start: int
  end: int


def _decode_literal(raw: bytes) -> bytes:
  # raw includes surrounding parentheses
  inner = raw[1:-1]
  out = bytearray()
  i = 0
  while i < len(inner):
    ch = inner[i]
    if ch != 0x5C:  # backslash
      out.append(ch)
      i += 1
      continue
    i += 1
    if i >= len(inner):
      break
    esc = inner[i]
    mapping = {ord("n"): 10, ord("r"): 13, ord("t"): 9, ord("b"): 8, ord("f"): 12, ord("("): 40, ord(")"): 41, ord("\\"): 92}
    if esc in mapping:
      out.append(mapping[esc])
      i += 1
    elif 0x30 <= esc <= 0x37:
      octal = [esc]
      i += 1
      while i < len(inner) and len(octal) < 3 and 0x30 <= inner[i] <= 0x37:
        octal.append(inner[i])
        i += 1
      out.append(int(bytes(octal), 8) & 0xFF)
    else:
      out.append(esc)
      i += 1
  return bytes(out)


def _decode_hex(raw: bytes) -> bytes:
  inner = raw[1:-1].replace(b" ", b"").replace(b"\n", b"").replace(b"\r", b"").replace(b"\t", b"")
  if len(inner) % 2:
    inner += b"0"
  return bytes.fromhex(inner.decode("ascii"))


def encode_pdf_string(data: bytes, prefer_hex: bool) -> bytes:
  if prefer_hex:
    return b"<" + data.hex().upper().encode("ascii") + b">"
  out = bytearray(b"(")
  for b in data:
    if b in (0x28, 0x29, 0x5C):  # ( ) \
      out.extend(b"\\")
      out.append(b)
    elif b == 0x0A:
      out.extend(b"\\n")
    elif b == 0x0D:
      out.extend(b"\\r")
    else:
      out.append(b)
  out.append(0x29)
  return bytes(out)


def tokenize(stream: bytes) -> List[Tok]:
  tokens: List[Tok] = []
  i = 0
  n = len(stream)
  while i < n:
    ch = stream[i]
    if ch in WHITESPACE:
      i += 1
      continue
    if ch == 0x25:  # %
      while i < n and stream[i] not in (10, 13):
        i += 1
      continue
    start = i
    if ch == 0x28:  # (
      depth = 1
      i += 1
      while i < n and depth:
        if stream[i] == 0x5C:
          i += 2
          continue
        if stream[i] == 0x28:
          depth += 1
        elif stream[i] == 0x29:
          depth -= 1
        i += 1
      tokens.append(Tok("string", stream[start:i], start, i))
      continue
    if ch == 0x3C:  # <
      if i + 1 < n and stream[i + 1] == 0x3C:
        tokens.append(Tok("dict_start", b"<<", start, i + 2))
        i += 2
        continue
      i += 1
      while i < n and stream[i] != 0x3E:
        i += 1
      i += 1
      tokens.append(Tok("hex", stream[start:i], start, i))
      continue
    if ch == 0x3E:  # >
      if i + 1 < n and stream[i + 1] == 0x3E:
        tokens.append(Tok("dict_end", b">>", start, i + 2))
        i += 2
        continue
      tokens.append(Tok("gt", b">", start, i + 1))
      i += 1
      continue
    if ch == 0x5B:
      tokens.append(Tok("array_start", b"[", start, i + 1))
      i += 1
      continue
    if ch == 0x5D:
      tokens.append(Tok("array_end", b"]", start, i + 1))
      i += 1
      continue
    if ch == 0x2F:  # /
      i += 1
      while i < n and stream[i] not in WHITESPACE and stream[i] not in DELIMS:
        i += 1
      tokens.append(Tok("name", stream[start:i], start, i))
      continue
    if ch in (0x7B, 0x7D):  # { }
      tokens.append(Tok("brace", stream[start : i + 1], start, i + 1))
      i += 1
      continue
    while i < n and stream[i] not in WHITESPACE and stream[i] not in DELIMS:
      i += 1
    raw = stream[start:i]
    kind = "number" if raw[:1] in b"+-0123456789." else "op"
    tokens.append(Tok(kind, raw, start, i))
  return tokens


def _string_bytes(tok: Tok) -> Optional[Tuple[bytes, bool]]:
  if tok.kind == "string":
    return _decode_literal(tok.raw), False
  if tok.kind == "hex":
    try:
      return _decode_hex(tok.raw), True
    except ValueError:
      return None
  return None


def _decode_tj_array(tokens: List[Tok], start: int, end: int, encoder: FontEncoder) -> str:
  parts: List[str] = []
  for tok in tokens[start + 1 : end]:
    parsed = _string_bytes(tok)
    if not parsed:
      continue
    data, _ = parsed
    parts.append(encoder.decode_bytes(data))
  return "".join(parts)


def _find_array_start(tokens: List[Tok], tj_index: int) -> Optional[int]:
  depth = 0
  for i in range(tj_index - 1, -1, -1):
    kind = tokens[i].kind
    if kind == "array_end":
      depth += 1
    elif kind == "array_start":
      if depth == 0:
        return i
      depth -= 1
  return None


def rewrite_stream(stream: bytes, encoders: Dict[str, FontEncoder], replacements: List[Tuple[str, str]]) -> Tuple[bytes, List[Tuple[str, str]], int]:
  if not replacements:
    return stream, replacements, 0
  tokens = tokenize(stream)
  encoder: FontEncoder = FontEncoder("simple")
  patches: List[Tuple[int, int, bytes]] = []
  used = 0
  remaining = list(replacements)

  def apply_text(decoded: str) -> Optional[str]:
    nonlocal used
    for idx, (old, new) in enumerate(remaining):
      if not old:
        continue
      if decoded == old or old in decoded:
        remaining.pop(idx)
        used += 1
        if decoded == old:
          return new
        return decoded.replace(old, new, 1)
    return None

  i = 0
  while i < len(tokens):
    tok = tokens[i]
    if tok.kind == "op" and tok.raw == b"Tf" and i >= 2 and tokens[i - 2].kind == "name":
      name = tokens[i - 2].raw[1:].decode("latin1", errors="ignore")
      encoder = encoders.get(name) or encoders.get(name.split("+")[-1]) or encoder
      i += 1
      continue

    if tok.kind == "op" and tok.raw in (b"Tj", b"'", b'"'):
      str_tok = None
      if tok.raw == b'"' and i >= 3:
        str_tok = tokens[i - 1]
        span_start = tokens[i - 1].start
      elif i >= 1:
        str_tok = tokens[i - 1]
        span_start = str_tok.start
      parsed = _string_bytes(str_tok) if str_tok else None
      if parsed:
        data, prefer_hex = parsed
        decoded = encoder.decode_bytes(data)
        updated = apply_text(decoded)
        if updated is not None:
          encoded = encode_pdf_string(encoder.encode_text(updated), prefer_hex or encoder.kind == "cid")
          patches.append((span_start, str_tok.end, encoded))
      i += 1
      continue

    if tok.kind == "op" and tok.raw == b"TJ":
      arr_i = _find_array_start(tokens, i)
      if arr_i is not None:
        decoded = _decode_tj_array(tokens, arr_i, i, encoder)
        updated = apply_text(decoded)
        if updated is not None:
          prefer_hex = encoder.kind == "cid" or any(t.kind == "hex" for t in tokens[arr_i:i])
          encoded = encode_pdf_string(encoder.encode_text(updated), prefer_hex)
          patches.append((tokens[arr_i].start, tok.end, encoded + b" Tj"))
      i += 1
      continue
    i += 1

  if not patches:
    return stream, remaining, 0
  patches.sort(key=lambda p: p[0], reverse=True)
  out = bytearray(stream)
  for start, end, new in patches:
    out[start:end] = new
  return bytes(out), remaining, used


def rewrite_document(doc: fitz.Document, edits: List[TextEdit]) -> int:
  by_page: Dict[int, List[Tuple[str, str]]] = defaultdict(list)
  for edit in edits:
    if edit.text and edit.text != edit.new_text:
      by_page[edit.page].append((edit.text, edit.new_text))
  if not by_page:
    return 0

  applied = 0
  for page_index, page in enumerate(doc):
    leftover = list(by_page.get(page_index + 1, []))
    if not leftover:
      continue
    encoders = page_font_encoders(page)
    for xref in page.get_contents():
      stream = doc.xref_stream(xref)
      new_stream, leftover, used = rewrite_stream(stream, encoders, leftover)
      if used:
        doc.update_stream(xref, new_stream)
        applied += used
      if not leftover:
        break
  return applied
