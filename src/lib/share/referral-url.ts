import { auth } from '@/lib/auth';
import { getReferralCode } from '@/lib/referrals';

export async function getShareReferralCode(
  headers: Headers,
): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user?.id) return null;
    return await getReferralCode(session.user.id);
  } catch {
    return null;
  }
}

export function appendRef(url: string, refCode: string | null): string {
  if (!refCode) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ref=${refCode}`;
}
