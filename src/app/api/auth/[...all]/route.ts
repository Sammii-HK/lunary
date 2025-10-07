import { auth } from '@/lib/auth';

// Handle all HTTP methods for Better Auth
export async function GET(request: Request) {
  return auth.handler(request);
}

export async function POST(request: Request) {
  return auth.handler(request);
}
