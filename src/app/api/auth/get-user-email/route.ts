import { auth } from '@/lib/auth';
import { withCors } from '@/lib/auth-cors';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  return withCors(request, async (req) => {
    try {
      // Get cookies from the request
      const cookieHeader = req.headers.get('cookie') || '';
      const cookieStore = await cookies();

      // Try to get session using Better Auth's API with cookies
      const sessionResponse = await auth.api.getSession({
        headers: new Headers({
          cookie: cookieHeader,
        }),
      });

      console.log('🔍 Server-side session check:', {
        hasSession: !!sessionResponse,
        sessionKeys: sessionResponse ? Object.keys(sessionResponse) : [],
      });

      if (sessionResponse?.user?.email) {
        return Response.json({ email: sessionResponse.user.email });
      }

      // If Better Auth API fails, try reading from the handler directly
      // This is a fallback that should work if cookies are valid
      return Response.json({ email: null }, { status: 200 });
    } catch (error) {
      console.error('❌ Error getting user email:', error);
      return Response.json(
        { error: 'Failed to get user email', details: String(error) },
        { status: 500 },
      );
    }
  });
}

export async function OPTIONS(request: Request) {
  return withCors(request, auth.handler);
}
