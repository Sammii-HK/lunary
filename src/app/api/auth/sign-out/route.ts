import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/sign-out called');
  try {
    const response = await auth.handler(request);
    console.log('✅ Sign out response:', response.status);
    return response;
  } catch (error) {
    console.error('❌ Sign out error:', error);
    throw error;
  }
}
