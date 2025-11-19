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

const mockResponse = () =>
  new Response(JSON.stringify({ session: null, user: null }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

export async function GET(request: Request) {
  if (isTestMode) return mockResponse();
  return withCors(request, auth.handler);
}

export async function POST(request: Request) {
  if (isTestMode) return mockResponse();
  return withCors(request, auth.handler);
}

export async function PUT(request: Request) {
  if (isTestMode) return mockResponse();
  return withCors(request, auth.handler);
}

export async function DELETE(request: Request) {
  if (isTestMode) return mockResponse();
  return withCors(request, auth.handler);
}

export async function OPTIONS(request: Request) {
  if (isTestMode) return mockResponse();
  return withCors(request, auth.handler);
}
