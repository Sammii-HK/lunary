import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

/**
 * Returns a 401 NextResponse if the request has no valid session.
 * Use this to guard any route that should only be accessible to authenticated users.
 *
 * @example
 * const authResult = await requireAuth(request);
 * if (authResult instanceof NextResponse) return authResult;
 * const { id: userId } = authResult;
 */
export async function requireAuth(
  request: NextRequest,
): Promise<{ id: string; email: string; name: string } | NextResponse> {
  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return user;
}

export async function getCurrentUser(request: NextRequest) {
  try {
    const headers = Object.fromEntries(request.headers.entries());
    const sessionResponse = await (auth as any).api.getSession({
      headers,
    });

    const user =
      sessionResponse?.data?.user ??
      sessionResponse?.user ??
      sessionResponse?.session?.user;

    if (!user?.id) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}
