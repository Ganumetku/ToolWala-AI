import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    if (prisma) {
      const media = await prisma.mediaLibrary.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, media });
    } else {
      const media = jsonDb.getMedia();
      return NextResponse.json({ success: true, media });
    }
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return NextResponse.json({ success: false, error: 'Database fetch failure' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create public/uploads directory if not exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = Date.now() + '_' + cleanFilename;
    const filePath = path.join(uploadDir, filename);

    // Write file locally
    await writeFile(filePath, buffer);
    const url = `/uploads/${filename}`;

    const mediaItem = {
      filename: file.name,
      url,
      mimeType: file.type,
      size: file.size
    };

    if (prisma) {
      const newMedia = await prisma.mediaLibrary.create({
        data: mediaItem
      });
      return NextResponse.json({ success: true, media: newMedia });
    } else {
      const media = jsonDb.getMedia();
      const localMedia = {
        id: 'm-' + Date.now(),
        ...mediaItem,
        createdAt: new Date().toISOString()
      };
      media.push(localMedia);
      jsonDb.saveMedia(media);
      return NextResponse.json({ success: true, media: localMedia });
    }
  } catch (error) {
    console.error('Failed to upload media:', error);
    return NextResponse.json({ success: false, error: 'Media upload failure' }, { status: 500 });
  }
}
