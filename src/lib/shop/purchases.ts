import { sql } from '@vercel/postgres';

type VerifiedPurchase = {
  id: string;
  userId: string;
  packId: string;
  status: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string | null;
  pack: {
    id: string;
    name: string;
    slug: string | null;
    downloadUrl: string;
  };
};

export async function verifyDownloadToken(
  token: string,
): Promise<VerifiedPurchase | null> {
  const { rows } = await sql`
    SELECT
      id,
      user_id,
      pack_id,
      status,
      download_count,
      max_downloads,
      expires_at,
      pack_name,
      pack_slug,
      blob_url
    FROM shop_purchases
    WHERE download_token = ${token}
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  // Basic validity checks
  if (row.status !== 'completed') return null;

  if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
    return null;
  }

  if ((row.download_count ?? 0) >= (row.max_downloads ?? 5)) {
    return null;
  }

  if (!row.blob_url) {
    // This is the key fix: if blob_url is missing you will fall back to "coming soon"
    return null;
  }

  return {
    id: row.id,
    userId: row.user_id,
    packId: row.pack_id,
    status: row.status,
    downloadCount: row.download_count ?? 0,
    maxDownloads: row.max_downloads ?? 5,
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    pack: {
      id: row.pack_id,
      name: row.pack_name || 'Digital Pack',
      slug: row.pack_slug || null,
      downloadUrl: row.blob_url,
    },
  };
}

export async function incrementDownloadCount(purchaseId: string) {
  await sql`
    UPDATE shop_purchases
    SET download_count = COALESCE(download_count, 0) + 1
    WHERE id = ${purchaseId}
  `;
}
