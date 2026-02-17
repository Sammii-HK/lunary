import { put } from '@vercel/blob';

/**
 * Pre-upload a dynamic OG image to Vercel Blob so Ayrshare gets a fast static URL.
 * Only processes URLs that point to our own /api/og routes.
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
      console.warn(
        `Failed to fetch OG image (${response.status}): ${imageUrl}`,
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
    });

    console.log(`📸 Pre-uploaded OG image to blob: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.warn('Failed to pre-upload image, using original URL:', error);
    return imageUrl;
  }
}
