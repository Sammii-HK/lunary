/**
 * Encryption utilities for sensitive user data
 *
 * Uses AES-256-GCM for authenticated encryption.
 * The encryption key is derived from ENCRYPTION_KEY or BETTER_AUTH_SECRET.
 */

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY or BETTER_AUTH_SECRET required for encryption',
    );
  }
  // Derive a 32-byte key from the secret
  return scryptSync(key, 'lunary-salt', 32);
}

/**
 * Encrypt sensitive data
 * @param text Plain text to encrypt
 * @returns Encrypted string in format: iv:authTag:encrypted
 */
export function encrypt(text: string): string {
  if (!text) return text;

  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt sensitive data
 * @param encryptedText Encrypted string in format: iv:authTag:encrypted
 * @returns Decrypted plain text
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  // Check if it looks like encrypted data (has two colons)
  if (!encryptedText.includes(':')) {
    // Not encrypted, return as-is (backwards compatibility)
    return encryptedText;
  }

  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    // Not in expected format, return as-is
    return encryptedText;
  }

  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error(
      'Decryption failed - data may be encrypted with a different key:',
      error,
    );
    // If decryption fails and data looks encrypted (has 3 colon-separated parts),
    // return empty to force user to re-enter data rather than use corrupted text
    if (parts.length === 3 && parts[0].length === 32) {
      console.warn(
        'Encrypted data cannot be decrypted - user needs to re-save profile',
      );
      return '';
    }
    // Otherwise return as-is (might be unencrypted legacy data)
    return encryptedText;
  }
}

/**
 * Check if a string appears to be encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  const parts = text.split(':');
  return parts.length === 3 && parts[0].length === 32; // IV is 16 bytes = 32 hex chars
}

/**
 * Encrypt birthday specifically (alias for clarity)
 */
export const encryptBirthday = encrypt;

/**
 * Decrypt birthday specifically (alias for clarity)
 */
export const decryptBirthday = decrypt;

/**
 * Encrypt a JSON object
 * Serializes to JSON, encrypts, returns encrypted string
 */
export function encryptJSON<T = any>(data: T): string {
  const jsonString = JSON.stringify(data);
  return encrypt(jsonString);
}

/**
 * Decrypt a JSON object
 * Decrypts string, parses JSON
 */
export function decryptJSON<T = any>(encrypted: string): T {
  const jsonString = decrypt(encrypted);
  return JSON.parse(jsonString) as T;
}

/**
 * Validate that encryption/decryption works correctly
 * Used in tests and health checks
 */
export function validateEncryption(): boolean {
  try {
    const testData = { test: 'encryption validation', timestamp: Date.now() };
    const encrypted = encryptJSON(testData);

    // Verify it's actually encrypted (not plaintext)
    if (encrypted.includes('encryption validation')) {
      throw new Error('Data appears to be in plaintext');
    }

    const decrypted = decryptJSON(encrypted);

    // Verify round-trip integrity
    if (JSON.stringify(decrypted) !== JSON.stringify(testData)) {
      throw new Error('Decrypted data does not match original');
    }

    return true;
  } catch (error) {
    console.error('Encryption validation failed:', error);
    return false;
  }
}
