import { auth } from '@/lib/auth';

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/sign-up/email called');
  return auth.handler(request);
}
