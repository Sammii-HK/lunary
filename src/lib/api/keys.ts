import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

const API_KEY_PREFIX = 'lun_';
const API_KEY_LENGTH = 32;

export type ApiTier = 'free' | 'starter' | 'developer' | 'business';

export interface ApiTierConfig {
  name: string;
  price: number;
  requestLimit: number;
  rateLimit: number;
  features: string[];
}

export const API_TIERS: Record<ApiTier, ApiTierConfig> = {
  free: {
    name: 'Free',
    price: 0,
    requestLimit: 100,
    rateLimit: 10,
    features: [
      'Basic endpoints',
      'Moon phases',
      'Daily cosmic weather',
      'Grimoire search',
    ],
  },
  starter: {
    name: 'Starter',
    price: 9,
    requestLimit: 5000,
    rateLimit: 30,
    features: [
      'All free tier features',
      'Birth chart calculations',
      'Tarot readings',
      'Ritual suggestions',
      'Priority support',
    ],
  },
  developer: {
    name: 'Developer',
    price: 29,
    requestLimit: 25000,
    rateLimit: 60,
    features: [
      'All starter features',
      'Planetary transits',
      'Compatibility analysis',
      'Custom integrations',
      'Email support',
    ],
  },
  business: {
    name: 'Business',
    price: 99,
    requestLimit: 100000,
    rateLimit: 120,
    features: [
      'All developer features',
      'Webhook notifications',
      'Dedicated support',
      'Custom rate limits',
      'SLA guarantee',
    ],
  },
};

export function generateApiKey(): {
  key: string;
  hash: string;
  prefix: string;
} {
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH);
  const key =
    API_KEY_PREFIX + randomBytes.toString('base64url').slice(0, API_KEY_LENGTH);
  const hash = hashApiKey(key);
  const prefix = key.slice(0, 8);

  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function createApiKey(
  userId: string,
  tier: ApiTier = 'free',
  name: string = 'Default API Key',
) {
  const { key, hash, prefix } = generateApiKey();
  const tierConfig = API_TIERS[tier];

  const apiKey = await prisma.apiKey.create({
    data: {
      keyHash: hash,
      keyPrefix: prefix,
      userId,
      name,
      tier,
      requestLimit: tierConfig.requestLimit,
      rateLimit: tierConfig.rateLimit,
      resetAt: getNextResetDate(),
    },
  });

  return { ...apiKey, key };
}

export async function validateApiKey(key: string) {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const hash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
  });

  if (!apiKey) {
    return { valid: false, error: 'API key not found' };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: 'API key is disabled' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  const now = new Date();
  if (apiKey.resetAt < now) {
    await prisma.apiKey.update({
      where: { id: apiKey.id },
      data: {
        requests: 0,
        resetAt: getNextResetDate(),
      },
    });
    apiKey.requests = 0;
  }

  if (apiKey.requests >= apiKey.requestLimit) {
    return { valid: false, error: 'Monthly request limit exceeded' };
  }

  return { valid: true, apiKey };
}

export async function incrementApiKeyUsage(keyHash: string) {
  await prisma.apiKey.update({
    where: { keyHash },
    data: {
      requests: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });
}

export async function getUserApiKeys(userId: string) {
  return prisma.apiKey.findMany({
    where: { userId },
    select: {
      id: true,
      keyPrefix: true,
      name: true,
      tier: true,
      requests: true,
      requestLimit: true,
      rateLimit: true,
      isActive: true,
      lastUsedAt: true,
      resetAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteApiKey(id: string, userId: string) {
  return prisma.apiKey.deleteMany({
    where: { id, userId },
  });
}

export async function updateApiKeyTier(
  id: string,
  userId: string,
  tier: ApiTier,
) {
  const tierConfig = API_TIERS[tier];

  return prisma.apiKey.updateMany({
    where: { id, userId },
    data: {
      tier,
      requestLimit: tierConfig.requestLimit,
      rateLimit: tierConfig.rateLimit,
    },
  });
}

export async function regenerateApiKey(id: string, userId: string) {
  const existing = await prisma.apiKey.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new Error('API key not found');
  }

  const { key, hash, prefix } = generateApiKey();

  await prisma.apiKey.update({
    where: { id },
    data: {
      keyHash: hash,
      keyPrefix: prefix,
    },
  });

  return { key, prefix };
}

function getNextResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}
