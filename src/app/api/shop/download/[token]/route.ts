import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Using Node.js runtime for better compatibility
// export const runtime = 'edge';

function generateHmacSignature(data: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

interface DownloadParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: NextRequest, { params }: DownloadParams) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Download token is required' },
        { status: 400 },
      );
    }

    console.log(
      `🔐 Processing download request with token: ${token.substring(0, 8)}...`,
    );

    // Verify download token and get purchase info
    const purchaseData = await verifyDownloadToken(token);

    if (!purchaseData) {
      return NextResponse.json(
        { error: 'Invalid or expired download token' },
        { status: 403 },
      );
    }

    // Check download limits
    if (purchaseData.downloadCount >= purchaseData.maxDownloads) {
      return NextResponse.json(
        { error: 'Download limit exceeded' },
        { status: 403 },
      );
    }

    // Check expiry
    if (
      purchaseData.expiresAt &&
      new Date() > new Date(purchaseData.expiresAt)
    ) {
      return NextResponse.json(
        { error: 'Download link has expired' },
        { status: 403 },
      );
    }

    // Generate temporary signed URL for Vercel Blob
    const downloadUrl = await generateSignedDownloadUrl(
      purchaseData.pack.downloadUrl,
    );

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'Unable to generate download link' },
        { status: 500 },
      );
    }

    // Increment download count
    await incrementDownloadCount(purchaseData.id);

    console.log(`✅ Download authorized for pack: ${purchaseData.pack.name}`);

    // Return the signed URL for direct download
    return NextResponse.redirect(downloadUrl);
  } catch (error: any) {
    console.error('❌ Download failed:', error);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}

// Mock function - in production, this would query your database
async function verifyDownloadToken(token: string) {
  // This would typically query your database to find the purchase
  // For now, return mock data structure

  // In a real implementation, you'd:
  // 1. Hash the token and look it up in your database
  // 2. Return the associated purchase and pack data
  // 3. Verify the purchase status is 'completed'

  return {
    id: 'purchase_123',
    userId: 'user_123',
    packId: 'pack_123',
    status: 'completed',
    downloadCount: 0,
    maxDownloads: 5,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    pack: {
      id: 'pack_123',
      name: 'Moon Phases 2025',
      downloadUrl:
        'https://example.blob.vercel-storage.com/shop/packs/moon_phases/example.pdf',
      fileSize: 1024000,
    },
  };
}

async function generateSignedDownloadUrl(
  blobUrl: string,
): Promise<string | null> {
  try {
    // Extract the blob key from the URL
    const url = new URL(blobUrl);
    const pathname = url.pathname;

    // For Vercel Blob, we need to generate a signed URL
    // This is a simplified version - in production you'd use Vercel's SDK

    // Generate a temporary signed URL (expires in 1 hour)
    const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    const signature = generateHmacSignature(
      `${pathname}${expiry}`,
      process.env.BLOB_READ_WRITE_TOKEN || 'fallback',
    );

    const signedUrl = `${blobUrl}?expires=${expiry}&signature=${signature}`;

    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    return null;
  }
}

async function incrementDownloadCount(purchaseId: string) {
  // This would update the download count in your database
  console.log(`📈 Incrementing download count for purchase: ${purchaseId}`);

  // In a real implementation:
  // await database.purchases.update(purchaseId, {
  //   downloadCount: downloadCount + 1,
  //   updatedAt: new Date().toISOString()
  // });
}
