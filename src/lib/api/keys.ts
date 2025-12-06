import crypto from 'crypto';
import { sql } from '@vercel/postgres';

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

export interface ApiKeyRecord {
  id: string;
  key_hash: string;
  key_prefix: string;
  user_id: string;
  name: string;
  tier: string;
  is_active: boolean;
  requests: number;
  request_limit: number;
  rate_limit: number;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
  last_used_at: Date | null;
  reset_at: Date;
}

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

function generateId(): string {
  return crypto.randomBytes(12).toString('base64url');
}

function getNextResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

export async function createApiKey(
  userId: string,
  tier: ApiTier = 'free',
  name: string = 'Default API Key',
) {
  const { key, hash, prefix } = generateApiKey();
  const tierConfig = API_TIERS[tier];
  const id = generateId();
  const resetAt = getNextResetDate().toISOString();

  const result = await sql`
    INSERT INTO api_keys (id, key_hash, key_prefix, user_id, name, tier, request_limit, rate_limit, reset_at)
    VALUES (${id}, ${hash}, ${prefix}, ${userId}, ${name}, ${tier}, ${tierConfig.requestLimit}, ${tierConfig.rateLimit}, ${resetAt})
    RETURNING *
  `;

  return { ...(result.rows[0] as ApiKeyRecord), key };
}

export async function validateApiKey(key: string) {
  if (!key.startsWith(API_KEY_PREFIX)) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const hash = hashApiKey(key);

  const result = await sql`
    SELECT * FROM api_keys WHERE key_hash = ${hash}
  `;

  const apiKey = result.rows[0] as ApiKeyRecord | undefined;

  if (!apiKey) {
    return { valid: false, error: 'API key not found' };
  }

  if (!apiKey.is_active) {
    return { valid: false, error: 'API key is disabled' };
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  const now = new Date();
  if (new Date(apiKey.reset_at) < now) {
    await sql`
      UPDATE api_keys 
      SET requests = 0, reset_at = ${getNextResetDate().toISOString()}
      WHERE id = ${apiKey.id}
    `;
    apiKey.requests = 0;
  }

  if (apiKey.requests >= apiKey.request_limit) {
    return { valid: false, error: 'Monthly request limit exceeded' };
  }

  return { valid: true, apiKey };
}

export async function incrementApiKeyUsage(keyHash: string) {
  await sql`
    UPDATE api_keys 
    SET requests = requests + 1, last_used_at = NOW()
    WHERE key_hash = ${keyHash}
  `;
}

export async function getUserApiKeys(userId: string) {
  const result = await sql`
    SELECT id, key_prefix, name, tier, requests, request_limit, rate_limit, is_active, last_used_at, reset_at, created_at
    FROM api_keys
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `;

  return result.rows;
}

export async function deleteApiKey(id: string, userId: string) {
  const result = await sql`
    DELETE FROM api_keys WHERE id = ${id} AND user_id = ${userId}
  `;
  return result.rowCount;
}

export async function updateApiKeyTier(
  id: string,
  userId: string,
  tier: ApiTier,
) {
  const tierConfig = API_TIERS[tier];

  const result = await sql`
    UPDATE api_keys 
    SET tier = ${tier}, request_limit = ${tierConfig.requestLimit}, rate_limit = ${tierConfig.rateLimit}
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return result.rowCount;
}

export async function regenerateApiKey(id: string, userId: string) {
  const existing = await sql`
    SELECT * FROM api_keys WHERE id = ${id} AND user_id = ${userId}
  `;

  if (existing.rows.length === 0) {
    throw new Error('API key not found');
  }

  const { key, hash, prefix } = generateApiKey();

  await sql`
    UPDATE api_keys 
    SET key_hash = ${hash}, key_prefix = ${prefix}
    WHERE id = ${id}
  `;

  return { key, prefix };
}
