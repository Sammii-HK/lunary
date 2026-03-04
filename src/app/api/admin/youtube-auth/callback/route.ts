import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdminAuth } from '@/lib/admin-auth';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

function getRedirectUri() {
  const base = (
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  ).replace(/\/$/, '');
  return `${base}/api/admin/youtube-auth/callback`;
}

function getAdminBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'https://admin.lunary.app'
  ).replace(/\/$/, '');
}

/** GET — exchange authorization code for tokens, save refresh token to DB */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const adminBase = getAdminBaseUrl();
  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.redirect(
      `${adminBase}/podcasts?auth_error=${encodeURIComponent(error)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${adminBase}/podcasts?auth_error=Missing+code+parameter`,
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${adminBase}/podcasts?auth_error=Missing+Google+OAuth+credentials`,
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      getRedirectUri(),
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.refresh_token) {
      // Save refresh token to DB so it persists without needing Vercel env var
      await sql`
        CREATE TABLE IF NOT EXISTS app_settings (
          key   TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sql`
        INSERT INTO app_settings (key, value, updated_at)
        VALUES ('google_refresh_token', ${tokens.refresh_token}, NOW())
        ON CONFLICT (key) DO UPDATE
          SET value = EXCLUDED.value, updated_at = NOW()
      `;
      console.log('✅ Google refresh token saved to database');
    }

    return NextResponse.redirect(`${adminBase}/podcasts?auth_success=true`);
  } catch (err: any) {
    console.error('YouTube OAuth callback error:', err);
    return NextResponse.redirect(
      `${adminBase}/podcasts?auth_error=${encodeURIComponent(err.message || 'Token exchange failed')}`,
    );
  }
}
