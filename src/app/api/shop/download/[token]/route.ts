import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  verifyDownloadToken,
  incrementDownloadCount,
} from '@/lib/shop/purchases';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DownloadRouteParams {
  params: Promise<{ token: string }>;
}

function generateHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

export async function GET(
  _request: NextRequest,
  { params }: DownloadRouteParams,
) {
  try {
    // ✅ THIS IS THE FIX
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Download token is required' },
        { status: 400 },
      );
    }

    console.log(`🔐 Download request: ${token.slice(0, 8)}…`);

    // 1. Verify token against DB
    const purchase = await verifyDownloadToken(token);

    if (!purchase) {
      console.error('❌ Token not found');
      return NextResponse.json(
        { error: 'Invalid or expired download token' },
        { status: 403 },
      );
    }

    // 2. Check limits
    if (purchase.downloadCount >= purchase.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 },
      );
    }

    // 3. Check expiry
    if (purchase.expiresAt && new Date() > new Date(purchase.expiresAt)) {
      return NextResponse.json(
        { error: 'Download link expired' },
        { status: 403 },
      );
    }

    // 4. Generate signed blob URL
    const signedUrl = generateSignedDownloadUrl(purchase.pack.downloadUrl);

    if (!signedUrl) {
      return NextResponse.json(
        { error: 'Unable to generate download link' },
        { status: 500 },
      );
    }

    // 5. Increment count
    await incrementDownloadCount(purchase.id);

    console.log(`✅ Download authorised for ${purchase.pack.name}`);

    return NextResponse.redirect(signedUrl);
  } catch (err) {
    console.error('❌ Download failed:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

function generateSignedDownloadUrl(blobUrl: string): string {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour
  const signature = generateHmacSignature(
    blobUrl + expiry,
    process.env.BLOB_READ_WRITE_TOKEN!,
  );

  return `${blobUrl}?expires=${expiry}&signature=${signature}`;
}
