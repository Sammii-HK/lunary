import crypto from 'crypto';

const getSecret = () => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not configured');
  return secret;
};

const EXPIRY_MS = {
  verify: 7 * 24 * 60 * 60 * 1000, // 7 days
  cancel: 30 * 24 * 60 * 60 * 1000, // 30 days (full grace period)
} as const;

type DeletionAction = keyof typeof EXPIRY_MS;

function createSignature(data: string): string {
  return crypto.createHmac('sha256', getSecret()).update(data).digest('hex');
}

export function generateDeletionToken(
  email: string,
  action: DeletionAction,
): string {
  const timestamp = Date.now().toString();
  const data = `${action}:${email}:${timestamp}`;
  const signature = createSignature(data);
  return `${timestamp}.${signature}`;
}

export function verifyDeletionToken(
  token: string,
  email: string,
  action: DeletionAction,
): { valid: boolean; expired: boolean } {
  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, expired: false };
  }

  const [timestamp, signature] = parts;
  const data = `${action}:${email}:${timestamp}`;
  const expectedSignature = createSignature(data);

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex'),
  );

  if (!isValid) {
    return { valid: false, expired: false };
  }

  const elapsed = Date.now() - parseInt(timestamp, 10);
  const isExpired = elapsed > EXPIRY_MS[action];

  return { valid: !isExpired, expired: isExpired };
}
