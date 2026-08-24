import { NextRequest, NextResponse } from 'next/server';

const IMGLY_CDN_BASE = 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  const resolvedParams = await params;
  const filePath = (resolvedParams.file || []).join('/');

  if (!filePath) {
    return new NextResponse('File path required', { status: 400 });
  }

  // Prevent directory traversal
  const cleanPath = filePath.replace(/\.\./g, '');
  const targetUrl = `${IMGLY_CDN_BASE}/${cleanPath}`;

  try {
    const upstreamRes = await fetch(targetUrl, {
      cache: 'force-cache',
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Upstream error: ${upstreamRes.statusText}`, {
        status: upstreamRes.status,
      });
    }

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (cleanPath.endsWith('.json')
        ? 'application/json'
        : cleanPath.endsWith('.wasm')
        ? 'application/wasm'
        : cleanPath.endsWith('.mjs') || cleanPath.endsWith('.js')
        ? 'application/javascript'
        : 'application/octet-stream');

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error proxying imgly asset:', error);
    return new NextResponse('Failed to fetch AI asset', { status: 502 });
  }
}
