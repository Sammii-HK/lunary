import { auth } from '@/lib/auth';

// Helper to check if origin is allowed
function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://lunary.app',
    'https://www.lunary.app',
  ];

  if (process.env.NEXT_PUBLIC_APP_URL) {
    allowedOrigins.push(process.env.NEXT_PUBLIC_APP_URL);
  }

  return allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
}

// Handle all HTTP methods for Better Auth
export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const response = await auth.handler(request);

  // Add CORS headers if origin is allowed (Better Auth should handle this, but we ensure it)
  if (origin && isOriginAllowed(origin)) {
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    return new Response(response.body, { ...response, headers });
  }

  return response;
}

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Log auth requests for debugging
    if (pathname.includes('sign-in') || pathname.includes('sign-up')) {
      console.log('[Auth] POST request:', {
        pathname,
        origin,
        hasSecret: !!process.env.BETTER_AUTH_SECRET,
        secretLength: process.env.BETTER_AUTH_SECRET?.length || 0,
      });
    }

    const response = await auth.handler(request);

    // Log response status for debugging
    if (pathname.includes('sign-in') || pathname.includes('sign-up')) {
      console.log('[Auth] Response status:', response.status);
      if (response.status !== 200) {
        const clonedResponse = response.clone();
        const text = await clonedResponse
          .text()
          .catch(() => 'Could not read response');
        console.error('[Auth] Error response:', text.substring(0, 500));
      }
    }

    // Add CORS headers if origin is allowed
    if (origin && isOriginAllowed(origin)) {
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Credentials', 'true');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      headers.set(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );
      return new Response(response.body, { ...response, headers });
    }

    return response;
  } catch (error) {
    console.error('[Auth] POST handler error:', error);
    return new Response(
      JSON.stringify({
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get('origin');

  if (origin && isOriginAllowed(origin)) {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  return auth.handler(request);
}
