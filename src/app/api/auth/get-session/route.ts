import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

async function handleAuthRequest(request: Request) {
  console.log('🔍 Auth request to get-session:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  });

  try {
    return await withCors(request, auth.handler);
  } catch (error) {
    console.error('❌ Error in get-session handler:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      method: request.method,
      url: request.url,
    });
    throw error;
  }
}

export async function GET(request: Request) {
  console.log('🔍 GET /api/auth/get-session called');
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/get-session called');
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
