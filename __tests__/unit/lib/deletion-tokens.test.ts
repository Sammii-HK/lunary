/**
 * Tests for HMAC-based deletion token utilities.
 */

const TEST_SECRET = 'test-secret-key-for-hmac';

beforeAll(() => {
  process.env.BETTER_AUTH_SECRET = TEST_SECRET;
});

import {
  generateDeletionToken,
  verifyDeletionToken,
} from '@/lib/deletion-tokens';

describe('deletion-tokens', () => {
  describe('generateDeletionToken', () => {
    it('returns a string with timestamp.signature format', () => {
      const token = generateDeletionToken('user@example.com', 'verify');
      expect(token).toMatch(/^\d+\.[a-f0-9]+$/);
    });

    it('generates different tokens for different emails', () => {
      const token1 = generateDeletionToken('user1@example.com', 'verify');
      const token2 = generateDeletionToken('user2@example.com', 'verify');
      expect(token1).not.toBe(token2);
    });

    it('generates different tokens for different actions', () => {
      const token1 = generateDeletionToken('user@example.com', 'verify');
      const token2 = generateDeletionToken('user@example.com', 'cancel');
      // Signatures will differ since action is part of the signed data
      const sig1 = token1.split('.')[1];
      const sig2 = token2.split('.')[1];
      expect(sig1).not.toBe(sig2);
    });
  });

  describe('verifyDeletionToken', () => {
    it('verifies a valid verify token', () => {
      const token = generateDeletionToken('user@example.com', 'verify');
      const result = verifyDeletionToken(token, 'user@example.com', 'verify');
      expect(result).toEqual({ valid: true, expired: false });
    });

    it('verifies a valid cancel token', () => {
      const token = generateDeletionToken('user@example.com', 'cancel');
      const result = verifyDeletionToken(token, 'user@example.com', 'cancel');
      expect(result).toEqual({ valid: true, expired: false });
    });

    it('rejects token with wrong email', () => {
      const token = generateDeletionToken('user@example.com', 'verify');
      const result = verifyDeletionToken(token, 'other@example.com', 'verify');
      expect(result.valid).toBe(false);
    });

    it('rejects token with wrong action', () => {
      const token = generateDeletionToken('user@example.com', 'verify');
      const result = verifyDeletionToken(token, 'user@example.com', 'cancel');
      expect(result.valid).toBe(false);
    });

    it('rejects malformed token', () => {
      const result = verifyDeletionToken(
        'not-a-valid-token',
        'user@example.com',
        'verify',
      );
      expect(result.valid).toBe(false);
    });

    it('rejects token with tampered signature', () => {
      const token = generateDeletionToken('user@example.com', 'verify');
      const [timestamp] = token.split('.');
      const tamperedToken = `${timestamp}.${'a'.repeat(64)}`;
      const result = verifyDeletionToken(
        tamperedToken,
        'user@example.com',
        'verify',
      );
      expect(result.valid).toBe(false);
    });

    it('detects expired verify token (7-day expiry)', () => {
      const realNow = Date.now;
      // Generate token "8 days ago"
      const eightDaysMs = 8 * 24 * 60 * 60 * 1000;
      Date.now = jest.fn().mockReturnValue(realNow() - eightDaysMs);
      const token = generateDeletionToken('user@example.com', 'verify');
      Date.now = realNow;

      const result = verifyDeletionToken(token, 'user@example.com', 'verify');
      expect(result).toEqual({ valid: false, expired: true });
    });

    it('accepts cancel token within 30-day window', () => {
      const realNow = Date.now;
      // Generate token "25 days ago"
      const twentyFiveDaysMs = 25 * 24 * 60 * 60 * 1000;
      Date.now = jest.fn().mockReturnValue(realNow() - twentyFiveDaysMs);
      const token = generateDeletionToken('user@example.com', 'cancel');
      Date.now = realNow;

      const result = verifyDeletionToken(token, 'user@example.com', 'cancel');
      expect(result).toEqual({ valid: true, expired: false });
    });

    it('detects expired cancel token (30-day expiry)', () => {
      const realNow = Date.now;
      // Generate token "31 days ago"
      const thirtyOneDaysMs = 31 * 24 * 60 * 60 * 1000;
      Date.now = jest.fn().mockReturnValue(realNow() - thirtyOneDaysMs);
      const token = generateDeletionToken('user@example.com', 'cancel');
      Date.now = realNow;

      const result = verifyDeletionToken(token, 'user@example.com', 'cancel');
      expect(result).toEqual({ valid: false, expired: true });
    });
  });
});
