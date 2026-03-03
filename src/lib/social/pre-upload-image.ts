import { put } from '@vercel/blob';

const VALID_IMAGE_EXT = /\.(png|jpg|jpeg|gif|webp|mp4)(\?|$)/i;

/**
 * Pre-upload a dynamic OG image to Vercel Blob so social platforms get a fast static URL.
 * Only processes URLs that point to our own /api/og routes.
 * Returns the blob URL on success, or the original URL if it can't be uploaded
 * (callers should validate the extension if they need a guaranteed-valid URL).
 */
export async function preUploadImage(imageUrl: string): Promise<string> {
  try {
    const url = new URL(imageUrl);
    // Only pre-upload our own dynamic OG images
    if (!url.pathname.startsWith('/api/og')) {
      return imageUrl;
    }

    const response = await fetch(imageUrl, {
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      console.error(
        `[preUploadImage] OG fetch failed (${response.status}): ${imageUrl}`,
      );
      return imageUrl;
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';
    const ext =
      contentType.includes('jpeg') || contentType.includes('jpg')
        ? 'jpg'
        : 'png';
    const hash =
      Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const blobKey = `social-images/${hash}.${ext}`;

    const blob = await put(blobKey, buffer, {
      access: 'public',
      contentType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    console.log(`📸 Pre-uploaded OG image to blob: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(
      '[preUploadImage] Blob upload failed, returning original URL:',
      error instanceof Error ? error.message : error,
    );
    return imageUrl;
  }
}

/**
 * Returns true if the URL has a file extension that social platforms accept.
 */
export function hasValidImageExtension(url: string): boolean {
  return VALID_IMAGE_EXT.test(url);
}
