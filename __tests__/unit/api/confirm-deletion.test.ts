/**
 * Tests for GET /api/account/confirm-deletion
 */

// --- Mocks ---

const mockUserFindFirst = jest.fn();
const mockDeletionFindFirst = jest.fn().mockResolvedValue(null);
const mockDeletionCreate = jest.fn().mockResolvedValue({});

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: (...args: any[]) => mockUserFindFirst(...args) },
    deletion_requests: {
      findFirst: (...args: any[]) => mockDeletionFindFirst(...args),
      create: (...args: any[]) => mockDeletionCreate(...args),
    },
  },
}));

const mockSendEmail = jest.fn().mockResolvedValue({ id: 'msg-1' });
jest.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}));

const mockVerifyToken = jest.fn();
jest.mock('@/lib/deletion-tokens', () => ({
  verifyDeletionToken: (...args: any[]) => mockVerifyToken(...args),
  generateDeletionToken: jest.fn().mockReturnValue('cancel-token.sig'),
}));

jest.mock('@/lib/email-components/ComplianceEmails', () => ({
  generateDeletionScheduledEmailHTML: jest
    .fn()
    .mockResolvedValue('<html>scheduled</html>'),
  generateDeletionScheduledEmailText: jest
    .fn()
    .mockReturnValue('scheduled text'),
}));

// --- Import after mocks ---

import { GET } from '@/app/api/account/confirm-deletion/route';
import { NextRequest } from 'next/server';

// --- Helpers ---

function makeRequest(params: Record<string, string>) {
  const url = new URL('https://lunary.app/api/account/confirm-deletion');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

// --- Tests ---

describe('GET /api/account/confirm-deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects with error=invalid if token is missing', async () => {
    const response = await GET(makeRequest({ email: 'test@test.com' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid');
  });

  it('redirects with error=invalid if email is missing', async () => {
    const response = await GET(makeRequest({ token: 'some-token' }));
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid');
  });

  it('redirects with error=expired for expired token', async () => {
    mockVerifyToken.mockReturnValue({ valid: false, expired: true });

    const response = await GET(
      makeRequest({ token: 'expired.token', email: 'test@test.com' }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=expired');
  });

  it('redirects with error=invalid for invalid token', async () => {
    mockVerifyToken.mockReturnValue({ valid: false, expired: false });

    const response = await GET(
      makeRequest({ token: 'bad.token', email: 'test@test.com' }),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=invalid');
  });

  it('creates deletion request and sends scheduled email on valid token', async () => {
    mockVerifyToken.mockReturnValue({ valid: true, expired: false });
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
    });

    const response = await GET(
      makeRequest({ token: 'valid.token', email: 'test@test.com' }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('confirmed=true');
    expect(mockDeletionCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          user_id: 'user-1',
          user_email: 'test@test.com',
          status: 'pending',
        }),
      }),
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@test.com',
        subject: 'Account Deletion Scheduled - Lunary',
      }),
    );
  });

  it('redirects with confirmed=true if deletion already pending', async () => {
    mockVerifyToken.mockReturnValue({ valid: true, expired: false });
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
    });
    mockDeletionFindFirst.mockResolvedValue({ id: 'existing-del' });

    const response = await GET(
      makeRequest({ token: 'valid.token', email: 'test@test.com' }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('confirmed=true');
    expect(mockDeletionCreate).not.toHaveBeenCalled();
  });
});
