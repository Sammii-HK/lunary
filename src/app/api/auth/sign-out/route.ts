import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return withCors(request, auth.handler);
}

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/sign-out called');
  try {
    const response = await withCors(request, auth.handler);
    console.log('✅ Sign out response:', response.status);
    return response;
  } catch (error) {
    console.error('❌ Sign out error:', error);
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
