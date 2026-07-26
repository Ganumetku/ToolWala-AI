import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name) || '.jpg';
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const timestamp = Date.now();
    const filename = `${base}_${timestamp}${ext}`;

    // 1. Try Supabase Storage (Cloud / Production)
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const bucketName = 'uploads';
        const { data: buckets } = await supabaseAdmin.storage.listBuckets();
        const bucketExists = buckets?.some((b) => b.name === bucketName);
        if (!bucketExists) {
          await supabaseAdmin.storage.createBucket(bucketName, { public: true });
        }

        const mimeType = file.type || 'image/jpeg';
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

    // 3. Data URL Fallback (Guaranteed to work in serverless read-only environments without cloud storage)
    const mimeType = file.type || 'image/png';
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({ success: true, url: dataUrl });
  } catch (err) {
    console.error('File upload error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : 'Upload failed',
      },
      { status: 500 }
    );
  }
}
