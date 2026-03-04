import { sql } from '@vercel/postgres';

/**
 * Get the Google OAuth refresh token.
 * Checks the environment variable first, then falls back to the database.
 * The token is saved to the database by the /api/admin/youtube-auth/callback route.
 */
export async function getGoogleRefreshToken(): Promise<string | null> {
  if (process.env.GOOGLE_REFRESH_TOKEN) {
    return process.env.GOOGLE_REFRESH_TOKEN;
  }
  try {
    const result = await sql`
      SELECT value FROM app_settings WHERE key = 'google_refresh_token'
    `;
    return result.rows[0]?.value ?? null;
  } catch {
    return null;
  }
}
