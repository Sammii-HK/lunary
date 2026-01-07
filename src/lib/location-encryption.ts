import { decrypt, encrypt } from '@/lib/encryption';

export interface EncryptedLocationPayload {
  encrypted: string;
}

export function encryptLocation(
  location: Record<string, any>,
): EncryptedLocationPayload {
  const payload = JSON.stringify(location);
  return { encrypted: encrypt(payload) };
}

export function decryptLocation(location: any): Record<string, any> | null {
  if (!location) {
    return null;
  }

  if (typeof location === 'object' && typeof location.encrypted === 'string') {
    try {
      const decrypted = decrypt(location.encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('[LocationEncryption] Failed to decrypt location:', error);
      return null;
    }
  }

  return location;
}
