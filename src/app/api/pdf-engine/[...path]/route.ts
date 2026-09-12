import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function engineBase(): string {
  return (process.env.PDF_ENGINE_URL || 'http://127.0.0.1:8787').replace(/\/$/, '');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  const rel = (resolved.path || []).filter(Boolean).join('/');
  if (rel !== 'health') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  try {
    const res = await fetch(`${engineBase()}/health`, { cache: 'no-store' });
    const json = await res.json();
    return NextResponse.json(json, { status: res.status });
  } catch {
    return NextResponse.json({ ok: false, error: 'PDF engine offline' }, { status: 503 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolved = await params;
  const rel = (resolved.path || []).filter(Boolean).join('/');
  if (rel !== 'extract' && rel !== 'apply') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const incoming = await request.formData();
  const file = incoming.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file' }, { status: 400 });
  }

  const outbound = new FormData();
  outbound.append('file', file, file.name || 'document.pdf');
  const edits = incoming.get('edits');
  if (typeof edits === 'string') {
    outbound.append('edits', edits);
  }

  try {
    const res = await fetch(`${engineBase()}/v1/${rel}`, {
      method: 'POST',
      body: outbound,
    });
    const buf = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    return new NextResponse(buf, {
      status: res.status,
      headers: { 'content-type': contentType },
    });
  } catch {
    return NextResponse.json({ error: 'PDF engine offline' }, { status: 503 });
  }
}
