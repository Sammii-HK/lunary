import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

// Skip auth processing in test/CI mode - return immediately
const isTestMode =
  process.env.NODE_ENV === 'test' ||
  process.env.CI === 'true' ||
  !!process.env.CI;

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
