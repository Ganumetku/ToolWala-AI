"""Decode/encode PDF show-text strings using WinAnsi or inverted ToUnicode."""

from __future__ import annotations

import re
from typing import Dict, Optional, Tuple

import fitz

# ASCII + WinAnsi for the bytes we actually see in English PDFs.
WINANSI = {i: chr(i) for i in range(128)}
WINANSI.update(
  {
    0x80: "\u20ac",
    0x82: "\u201a",
    0x83: "\u0192",
    0x84: "\u201e",
    0x85: "\u2026",
    0x86: "\u2020",
    0x87: "\u2021",
    0x88: "\u02c6",
    0x89: "\u2030",
    0x8a: "\u0160",
    0x8b: "\u2039",
    0x8c: "\u0152",
    0x8e: "\u017d",
    0x91: "\u2018",
    0x92: "\u2019",
    0x93: "\u201c",
    0x94: "\u201d",
    0x95: "\u2022",
    0x96: "\u2013",
    0x97: "\u2014",
    0x98: "\u02dc",
    0x99: "\u2122",
    0x9a: "\u0161",
    0x9b: "\u203a",
    0x9c: "\u0153",
    0x9e: "\u017e",
    0x9f: "\u0178",
  }
)
for i in range(0xA0, 256):
  WINANSI.setdefault(i, chr(i))
UNI_TO_WINANSI = {ord(ch): b for b, ch in WINANSI.items()}


class FontEncoder:
  def __init__(self, kind: str, cid_to_uni: Optional[Dict[int, str]] = None, uni_to_cid: Optional[Dict[int, int]] = None):
    self.kind = kind  # "simple" | "cid"
    self.cid_to_uni = cid_to_uni or {}
    self.uni_to_cid = uni_to_cid or {}

  def decode_bytes(self, data: bytes) -> str:
    if self.kind == "cid":
      out = []
      for i in range(0, len(data) - 1, 2):
        cid = (data[i] << 8) | data[i + 1]
        out.append(self.cid_to_uni.get(cid, "\ufffd"))
      return "".join(out)
    return "".join(WINANSI.get(b, chr(b)) for b in data)

  def encode_text(self, text: str) -> bytes:
    if self.kind == "cid":
      out = bytearray()
      for ch in text:
        cid = self.uni_to_cid.get(ord(ch))
        if cid is None:
          raise ValueError(f"glyph missing for {ch!r}")
        out.append((cid >> 8) & 0xFF)
        out.append(cid & 0xFF)
      return bytes(out)
    out = bytearray()
    for ch in text:
      b = UNI_TO_WINANSI.get(ord(ch))
      if b is None:
        raise ValueError(f"WinAnsi cannot encode {ch!r}")
      out.append(b)
    return bytes(out)


def _parse_hex_int(raw: bytes) -> int:
  return int(raw.decode("ascii"), 16)


def _utf16_to_str(hex_bytes: bytes) -> str:
  hex_bytes = re.sub(rb"\s+", b"", hex_bytes)
  if len(hex_bytes) % 2:
    hex_bytes = b"0" + hex_bytes
  data = bytes.fromhex(hex_bytes.decode("ascii"))
  if len(data) >= 2 and data[:2] == b"\xfe\xff":
    data = data[2:]
  return data.decode("utf-16-be", errors="replace")


def parse_tounicode(cmap: bytes) -> Tuple[Dict[int, str], Dict[int, int]]:
  cid_to_uni: Dict[int, str] = {}
  text = cmap.replace(b"\r", b"\n")

  bfchar = re.compile(
    rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>",
    re.DOTALL,
  )
  for block in re.finditer(rb"beginbfchar(.*?)endbfchar", text, re.S):
    for src, dst in bfchar.findall(block.group(1)):
      cid = _parse_hex_int(src)
      uni = _utf16_to_str(dst)
      cid_to_uni[cid] = uni

  bfrange_src = re.compile(
    rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>",
  )
  for block in re.finditer(rb"beginbfrange(.*?)endbfrange", text, re.S):
    body = block.group(1)
    for start, end, dst in bfrange_src.findall(body):
      a, b = _parse_hex_int(start), _parse_hex_int(end)
      base = _parse_hex_int(dst)
      for i, cid in enumerate(range(a, b + 1)):
        cid_to_uni[cid] = chr(base + i)
    for m in re.finditer(
      rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[(.*?)\]",
      body,
      re.S,
    ):
      a, b = _parse_hex_int(m.group(1)), _parse_hex_int(m.group(2))
      dests = re.findall(rb"<([0-9A-Fa-f]+)>", m.group(3))
      for cid, dst in zip(range(a, b + 1), dests):
        cid_to_uni[cid] = _utf16_to_str(dst)

  uni_to_cid: Dict[int, int] = {}
  for cid, uni in cid_to_uni.items():
    if len(uni) == 1:
      uni_to_cid.setdefault(ord(uni), cid)
  return cid_to_uni, uni_to_cid


def encoder_for_font(doc: fitz.Document, font_tuple) -> FontEncoder:
  xref = font_tuple[0]
  encoding = (font_tuple[5] or "").lower() if len(font_tuple) > 5 else ""
  tu = doc.xref_get_key(xref, "ToUnicode")
  if tu and tu[0] == "xref":
    tux = int(tu[1].split()[0])
    cid_to_uni, uni_to_cid = parse_tounicode(doc.xref_stream(tux))
    if cid_to_uni:
      return FontEncoder("cid", cid_to_uni, uni_to_cid)
  if "identity" in encoding:
    tu2 = doc.xref_get_key(xref, "ToUnicode")
    if tu2 and tu2[0] == "xref":
      tux = int(tu2[1].split()[0])
      cid_to_uni, uni_to_cid = parse_tounicode(doc.xref_stream(tux))
      return FontEncoder("cid", cid_to_uni, uni_to_cid)
  return FontEncoder("simple")


def page_font_encoders(page: fitz.Page) -> Dict[str, FontEncoder]:
  doc = page.parent
  encoders: Dict[str, FontEncoder] = {}
  for font in page.get_fonts(full=True):
    res_name = (font[4] or font[3] or "").lstrip("/")
    base = (font[3] or "").lstrip("/")
    enc = encoder_for_font(doc, font)
    if res_name:
      encoders[res_name] = enc
    if base:
      encoders.setdefault(base, enc)
  return encoders
