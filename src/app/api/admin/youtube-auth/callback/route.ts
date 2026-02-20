import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireAdminAuth } from '@/lib/admin-auth';

function getRedirectUri() {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return `${base}/api/admin/youtube-auth/callback`;
}

/** GET — exchange authorization code for tokens, redirect to admin with token */
export async function GET(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const code = request.nextUrl.searchParams.get('code');
  const error = request.nextUrl.searchParams.get('error');

  if (error) {
    const adminUrl = new URL('/admin/podcasts', request.url);
    adminUrl.searchParams.set('auth_error', error);
    return NextResponse.redirect(adminUrl);
  }

  if (!code) {
    return NextResponse.json(
      { error: 'Missing code parameter' },
      { status: 400 },
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing Google OAuth credentials' },
      { status: 500 },
    );
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      getRedirectUri(),
    );

    const { tokens } = await oauth2Client.getToken(code);

    const adminUrl = new URL('/admin/podcasts', request.url);
    if (tokens.refresh_token) {
      adminUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    adminUrl.searchParams.set('auth_success', 'true');

    return NextResponse.redirect(adminUrl);
  } catch (err: any) {
    const adminUrl = new URL('/admin/podcasts', request.url);
    adminUrl.searchParams.set(
      'auth_error',
      err.message || 'Token exchange failed',
    );
    return NextResponse.redirect(adminUrl);
  }
}
