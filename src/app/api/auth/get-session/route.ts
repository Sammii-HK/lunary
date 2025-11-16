import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

async function handleAuthRequest(request: Request) {
  if (
    process.env.NODE_ENV === 'development' &&
    process.env.DEBUG_AUTH === 'true'
  ) {
    console.log('🔍 Auth request to get-session:', {
      method: request.method,
      url: request.url,
    });
  }

  try {
    return await withCors(request, auth.handler);
  } catch (error) {
    console.error('❌ Error in get-session handler:', {
      error: error instanceof Error ? error.message : String(error),
      method: request.method,
      url: request.url,
    });
    throw error;
  }
}

export async function GET(request: Request) {
  return handleAuthRequest(request);
}

export async function POST(request: Request) {
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
