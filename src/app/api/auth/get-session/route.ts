import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';

export async function GET(request: Request) {
  console.log('🔍 GET /api/auth/get-session called');
  return withCors(request, auth.handler);
}

export async function POST(request: Request) {
  console.log('🔍 POST /api/auth/get-session called');
  return withCors(request, auth.handler);
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
