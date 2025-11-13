import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

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

export async function OPTIONS(request: Request) {
  return withCors(request, auth.handler);
}
