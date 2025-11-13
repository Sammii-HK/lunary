import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/sign-in/email called');
  return withCors(request, auth.handler);
}

export async function OPTIONS(request: Request) {
  return withCors(request, auth.handler);
}
