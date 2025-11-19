import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

// Skip auth checks ONLY in explicit test environments
// Never activate test mode in production
const isTestMode = (() => {
  // Explicitly prevent test mode in production
  if (process.env.VERCEL_ENV === 'production') return false;
  if (process.env.NODE_ENV === 'production') return false;

  // Only activate test mode in explicit test environments
  if (process.env.NODE_ENV === 'test') return true;
  if (process.env.PLAYWRIGHT_TEST_BASE_URL !== undefined) return true;

  // Only check CI if explicitly set to 'true' AND not in production
  if (process.env.CI === 'true' && process.env.VERCEL_ENV !== 'production') {
    return true;
  }

  return false;
})();

async function handleAuthRequest(request: Request) {
  // In test mode, return mock session immediately without any processing
  if (isTestMode) {
    return new Response(JSON.stringify({ session: null, user: null }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  // console.log('🔍 Auth request to get-session:', {
  //   method: request.method,
  //   url: request.url,
  //   headers: Object.fromEntries(request.headers.entries()),
  // });

  try {
    const response = await withCors(request, auth.handler);

    // Read the response body to check if it's valid JSON
    const text = await response.text().catch(() => '');

    // If empty, return a valid JSON response
    if (!text || text.trim() === '') {
      return new Response(JSON.stringify({ session: null }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          ...Object.fromEntries(response.headers.entries()),
        },
      });
    }

    // Try to parse to ensure it's valid JSON
    try {
      JSON.parse(text);
      // If valid JSON, recreate the response with the text
      return new Response(text, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (parseError) {
      // If parsing fails, return a valid JSON error response
      console.error('❌ Invalid JSON in get-session response:', {
        text: text.substring(0, 100),
        status: response.status,
      });
      return new Response(
        JSON.stringify({
          session: null,
          error: 'Invalid response format',
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries()),
          },
        },
      );
    }
  } catch (error) {
    console.error('❌ Error in get-session handler:', {
      error: error instanceof Error ? error.message : String(error),
      method: request.method,
      url: request.url,
    });

    // Return a valid JSON error response instead of throwing
    return new Response(
      JSON.stringify({
        error: 'Failed to get session',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}

export async function GET(request: Request) {
  // console.log('🔍 GET /api/auth/get-session called');
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
  // console.log('🔍 POST /api/auth/get-session called');
  return handleAuthRequest(request);
}

export async function PUT(request: Request) {
  return handleAuthRequest(request);
}

export async function DELETE(request: Request) {
  return handleAuthRequest(request);
}

export async function OPTIONS(request: Request) {
  return handleAuthRequest(request);
}
