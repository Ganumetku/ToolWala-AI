# ToolWala PDF Engine

Server-side PDF text editor used by the website. This is the path toward iLovePDF-like results: **real fonts from the file**, not browser Helvetica/Noto cover-up.

## Why a separate project

Browser `pdf-lib` cannot safely rewrite PDF text operators or reuse the original embedded font. iLovePDF does that on a dedicated engine. This service is that engine. The Next.js app stays the UI; it sends the PDF + edits here and downloads the result.

Files are processed in memory and discarded. Self-host it if you want data to stay on your machines.

## Run

```bash
cd services/pdf-engine
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8787
```

## API

- `GET /health`
- `POST /v1/extract` multipart field `file` → `{ page_count, spans[] }`
- `POST /v1/apply` multipart `file` + form field `edits` (JSON) → PDF bytes

`edits` example:

```json
{
  "edits": [
    { "page": 1, "text": "INV-EDIT-ME", "new_text": "INV-00042" }
  ]
}
```

Optional `bbox: [x0, y0, x1, y1]` (PDF points, origin top-left via MuPDF) for precise targeting.

## Website

Set `PDF_ENGINE_URL=http://127.0.0.1:8787`. The app proxies through `/api/pdf-engine/*` so the browser never talks to the engine origin directly.

## Honest limits (v0.2)

- English: rewrites original `Tj`/`TJ` bytes (same font, size, color, matrix). This is the iLovePDF look.
- New characters must already exist in that font (subset fonts cannot invent missing glyphs).
- Scanned PDFs with no text layer cannot be edited as text.
