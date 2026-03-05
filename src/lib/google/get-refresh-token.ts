import { sql } from '@vercel/postgres';

/**
 * Get the Google OAuth refresh token from the database.
 * Saved by the /api/admin/youtube-auth/callback route after OAuth flow.
 */
export async function getGoogleRefreshToken(): Promise<string | null> {
  try {
    const result = await sql`
      SELECT value FROM app_settings WHERE key = 'google_refresh_token'
    `;
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}
