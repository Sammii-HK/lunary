import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

export async function GET(request: Request) {
  return withCors(request, auth.handler);
}

export async function POST(request: Request) {
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
