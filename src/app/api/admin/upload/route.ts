import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Allowed MIME types for admin uploads (blog images, tool images)
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// Allowed extensions (must match MIME)
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

// Max upload size: 5 MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum upload size is 5 MB.' },
        { status: 413 }
      );
    }

    // MIME type validation
    const mimeType = (file.type || '').toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file type. Please upload a JPG, PNG, WebP, or GIF image.' },
        { status: 415 }
      );
    }

    // Extension validation
    const rawExt = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { success: false, error: 'Unsupported file extension. Please upload a JPG, PNG, WebP, or GIF image.' },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename: keep only safe characters, cap length
    const base = path.basename(file.name, rawExt).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 60);
    const timestamp = Date.now();
    const filename = `${base}_${timestamp}${rawExt}`;

    // 1. Try Supabase Storage (Cloud / Production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const bucketName = 'uploads';
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);
        if (!bucketExists) {
          await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        }

        const { error: uploadError } = await supabaseAdmin.storage
          .from(bucketName)
          .upload(filename, buffer, {
            contentType: mimeType,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from(bucketName)
            .getPublicUrl(filename);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
          }
        } else {
          console.warn('Supabase storage upload error:', uploadError);
        }
      } catch (sbErr) {
        console.warn('Supabase storage exception:', sbErr);
      }
    }

    // 2. Try Local Filesystem (Local Development)
    try {
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const relativeUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: relativeUrl });
    } catch (fsErr) {
      console.warn('Local filesystem write failed (read-only / serverless environment):', fsErr);
    }

    // 3. Data URL Fallback (for serverless read-only environments without cloud storage)
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Upload failed. Please try again.',
      },
      { status: 500 }
    );
  }
}
