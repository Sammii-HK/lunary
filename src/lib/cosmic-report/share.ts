import { randomBytes } from 'crypto';

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

export function createShareToken() {
  return randomBytes(16).toString('hex');
}

export function buildShareUrl(token: string) {
  return `${DEFAULT_BASE_URL}/cosmic-report/${token}`;
}

export function normalizeSharePayload({
  id,
  token,
}: {
  id: number;
  token?: string | null;
}) {
  if (!token) return undefined;

  return {
    share_token: token,
    share_url: buildShareUrl(token),
    pdf_url: `${DEFAULT_BASE_URL}/api/cosmic-report/${id}/pdf`,
  };
}
