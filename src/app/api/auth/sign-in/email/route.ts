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
  });

  try {
    return await withCors(request, auth.handler);
  } catch (error) {
    console.error('❌ Error in sign-in handler:', error);
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
