import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

// Skip auth processing ONLY in explicit test environments
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

export async function GET(request: Request) {
  if (isTestMode) {
    return new Response(
      JSON.stringify({ error: 'Method not allowed in test mode' }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
  return withCors(request, auth.handler);
}

export async function POST(request: Request) {
  // In test mode, return mock response immediately
  if (isTestMode) {
    return new Response(
      JSON.stringify({
        error: { code: 'INVALID_EMAIL', message: 'Invalid email' },
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  const origin = request.headers.get('origin');
  console.log('🔍 POST /api/auth/sign-in/email called', {
    origin,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    console.log('🔍 Calling Better Auth handler for sign-in/email');
    const response = await withCors(request, auth.handler);
    console.log('✅ Better Auth handler response:', {
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  } catch (error) {
    console.error('❌ Error in sign-in handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      origin,
      url: request.url,
    });
    throw error;
  }
}

export async function PUT(request: Request) {
  return withCors(request, auth.handler);
}

export async function DELETE(request: Request) {
  return withCors(request, auth.handler);
}

export async function OPTIONS(request: Request) {
  return withCors(request, auth.handler);
}
