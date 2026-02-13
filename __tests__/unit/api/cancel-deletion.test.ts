/**
 * Tests for GET /api/account/cancel-deletion
 */

// --- Mocks ---

const mockUserFindFirst = jest.fn();
const mockDeletionUpdateMany = jest.fn();

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: (...args: any[]) => mockUserFindFirst(...args) },
    deletion_requests: {
      updateMany: (...args: any[]) => mockDeletionUpdateMany(...args),
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
}));

jest.mock('@/lib/email-components/ComplianceEmails', () => ({
  generateDeletionCancelledEmailHTML: jest
    .fn()
    .mockResolvedValue('<html>cancelled</html>'),
}));

// --- Import after mocks ---

import { GET } from '@/app/api/account/cancel-deletion/route';
import { NextRequest } from 'next/server';

// --- Helpers ---

function makeRequest(params: Record<string, string>) {
  const url = new URL('https://lunary.app/api/account/cancel-deletion');
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return new NextRequest(url);
}

// --- Tests ---

describe('GET /api/account/cancel-deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects with error=invalid if params missing', async () => {
    const response = await GET(makeRequest({}));
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

  it('cancels deletion and sends email on valid token', async () => {
    mockVerifyToken.mockReturnValue({ valid: true, expired: false });
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
    });
    mockDeletionUpdateMany.mockResolvedValue({ count: 1 });

    const response = await GET(
      makeRequest({ token: 'valid.token', email: 'test@test.com' }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('cancelled=true');
    expect(mockDeletionUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { user_id: 'user-1', status: 'pending' },
        data: expect.objectContaining({ status: 'cancelled' }),
      }),
    );
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@test.com',
        subject: 'Account Deletion Cancelled - Lunary',
      }),
    );
  });

  it('redirects with error=no_request when no pending deletion exists', async () => {
    mockVerifyToken.mockReturnValue({ valid: true, expired: false });
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'test@test.com',
    });
    mockDeletionUpdateMany.mockResolvedValue({ count: 0 });

    const response = await GET(
      makeRequest({ token: 'valid.token', email: 'test@test.com' }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toContain('error=no_request');
  });
});
