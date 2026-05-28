export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * TikTok OAuth callback.
 *
 * Two jobs:
 *  - No `code` in the query → render a "Connect TikTok" page with the authorize link
 *    (handy for kicking off / re-running the flow).
 *  - With a `code` → exchange it for a user access token, then make live test calls
 *    (user.info + video.list) so we can confirm the app's scopes actually work.
 *
 * This is the foundation for the comments + analytics integration. Token persistence
 * is intentionally NOT wired yet — this first cut proves the OAuth round-trip and
 * surfaces the refresh_token so it can be stashed for the integration build.
 *
 * Required env (Vercel project settings — never commit these):
 *   TIKTOK_CLIENT_KEY     = 7644780708853989392
 *   TIKTOK_CLIENT_SECRET  = <app secret>
 * Optional:
 *   TIKTOK_REDIRECT_URI   = https://lunary.app/api/tiktok/callback (default)
 */

const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const USER_INFO_URL =
  'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,display_name,follower_count,following_count,likes_count,video_count';
const VIDEO_LIST_URL =
  'https://open.tiktokapis.com/v2/video/list/?fields=id,title,view_count,like_count,comment_count,share_count,create_time';

const SCOPES = [
  'user.info.basic',
  'user.info.stats',
  'user.info.profile',
  'video.list',
  'video.insights',
  'user.insights',
  'comment.list',
  'comment.list.manage',
].join(',');

function redirectUri(): string {
  return process.env.TIKTOK_REDIRECT_URI || 'https://lunary.app/api/tiktok/callback';
}

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TikTok connect</title><style>body{font-family:system-ui,sans-serif;background:#0b0b14;color:#e8e8f0;max-width:760px;margin:40px auto;padding:0 20px;line-height:1.5}code,pre{background:#16161f;border:1px solid #2a2a3a;border-radius:6px;padding:2px 6px;font-size:13px;word-break:break-all}pre{padding:12px;overflow:auto}a.btn{display:inline-block;background:#fe2c55;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600}.ok{color:#3ddc84}.err{color:#ff6b6b}h1,h2{font-weight:650}.muted{color:#9a9ab0;font-size:13px}</style></head><body>${body}</body></html>`,
    { status, headers: { 'content-type': 'text/html; charset=utf-8' } },
  );
}

function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const errorDesc = url.searchParams.get('error_description');

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

  if (!clientKey || !clientSecret) {
    return html(
      `<h1 class="err">Not configured</h1><p>Missing <code>TIKTOK_CLIENT_KEY</code> / <code>TIKTOK_CLIENT_SECRET</code> in the Vercel environment.</p>`,
      500,
    );
  }

  // TikTok returned an error on the consent screen.
  if (error) {
    return html(
      `<h1 class="err">Authorization failed</h1><p><code>${esc(error)}</code></p><p>${esc(errorDesc)}</p><p><a class="btn" href="/api/tiktok/callback">Try again</a></p>`,
      400,
    );
  }

  // No code yet → show the connect button.
  if (!code) {
    const authorize =
      'https://www.tiktok.com/v2/auth/authorize?' +
      new URLSearchParams({
        client_key: clientKey,
        scope: SCOPES,
        response_type: 'code',
        redirect_uri: redirectUri(),
        state: 'lunary',
      }).toString();
    return html(
      `<h1>Connect TikTok</h1><p class="muted">Authorize the Lunary app to read your posts, analytics and comments. Scopes requested:</p><pre>${esc(SCOPES)}</pre><p><a class="btn" href="${esc(authorize)}">Authorize TikTok →</a></p>`,
    );
  }

  // Exchange the authorization code for a user access token.
  let token: Record<string, unknown>;
  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri(),
      }).toString(),
      cache: 'no-store',
    });
    token = await res.json();
  } catch (e) {
    return html(`<h1 class="err">Token exchange threw</h1><pre>${esc((e as Error).message)}</pre>`, 502);
  }

  const accessToken = token.access_token as string | undefined;
  if (!accessToken) {
    return html(
      `<h1 class="err">Token exchange failed</h1><p class="muted">Most often a redirect_uri mismatch (must equal <code>${esc(redirectUri())}</code> exactly in the portal) or an expired/used code.</p><pre>${esc(JSON.stringify(token, null, 2))}</pre>`,
      400,
    );
  }

  // Live test calls — prove the scopes actually return data.
  const authHeader = { Authorization: `Bearer ${accessToken}` };
  const [userInfo, videoList] = await Promise.all([
    fetch(USER_INFO_URL, { headers: authHeader, cache: 'no-store' })
      .then((r) => r.json())
      .catch((e) => ({ error: (e as Error).message })),
    fetch(VIDEO_LIST_URL, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ max_count: 5 }),
      cache: 'no-store',
    })
      .then((r) => r.json())
      .catch((e) => ({ error: (e as Error).message })),
  ]);

  return html(
    `<h1 class="ok">TikTok connected ✓</h1>
     <p class="muted">Granted scopes — confirms what the app can actually do:</p>
     <pre>${esc(token.scope)}</pre>
     <h2>user.info</h2><pre>${esc(JSON.stringify(userInfo, null, 2))}</pre>
     <h2>video.list (latest 5)</h2><pre>${esc(JSON.stringify(videoList, null, 2))}</pre>
     <h2 class="muted">refresh_token — copy this once, it won't show again</h2>
     <pre>${esc(token.refresh_token)}</pre>
     <p class="muted">open_id: <code>${esc(token.open_id)}</code> · expires_in: ${esc(token.expires_in)}s</p>`,
  );
}
