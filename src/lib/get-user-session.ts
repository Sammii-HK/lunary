import { NextRequest } from 'next/server';
import { auth } from './auth';

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
