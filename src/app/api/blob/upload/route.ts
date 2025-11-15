import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const runtime = 'nodejs';

function generateRandomSlug(): string {
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Expected multipart/form-data' },
        { status: 400 },
      );
    }

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const folder = (form.get('folder') as string) || 'blog-covers';
    const slug = (form.get('slug') as string) || generateRandomSlug();

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, '_').toLowerCase();
    const key = `${folder}/${slug}/${Date.now()}-${safeName}`;

    // Upload to Vercel Blob
    const { url } = await put(key, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true, url, key, slug });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: 500 },
    );
  }
}
