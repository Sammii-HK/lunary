/**
 * Tests for POST /api/account/request-deletion
 */

import { NextResponse } from 'next/server';

// --- Mocks ---

const mockUserFindFirst = jest.fn();
const mockDeletionFindFirst = jest.fn().mockResolvedValue(null);

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findFirst: (...args: any[]) => mockUserFindFirst(...args) },
    deletion_requests: {
      findFirst: (...args: any[]) => mockDeletionFindFirst(...args),
    },
  },
}));

const mockSendEmail = jest.fn().mockResolvedValue({ id: 'msg-1' });
jest.mock('@/lib/email', () => ({
  sendEmail: (...args: any[]) => mockSendEmail(...args),
}));

jest.mock('@/lib/deletion-tokens', () => ({
  generateDeletionToken: jest.fn().mockReturnValue('123.abc'),
}));

jest.mock('@/lib/email-components/ComplianceEmails', () => ({
  generateDeletionVerifyEmailHTML: jest
    .fn()
    .mockResolvedValue('<html>verify</html>'),
  generateDeletionVerifyEmailText: jest.fn().mockReturnValue('verify text'),
}));

// --- Import after mocks ---

import { POST } from '@/app/api/account/request-deletion/route';

// --- Helpers ---

function makeRequest(body: object) {
  return { json: () => Promise.resolve(body) } as any;
}

let jsonSpy: jest.SpyInstance;
let lastJsonCall: { data: any; init: any } | null = null;

function installJsonSpy() {
  lastJsonCall = null;
  jsonSpy = jest
    .spyOn(NextResponse, 'json')
    .mockImplementation((data: any, init?: any) => {
      lastJsonCall = { data, init };
      return { status: init?.status || 200 } as any;
    });
}

// --- Tests ---

describe('POST /api/account/request-deletion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeletionFindFirst.mockResolvedValue(null);
    installJsonSpy();
  });

  afterEach(() => {
    jsonSpy?.mockRestore();
  });

  it('returns 400 if email is missing', async () => {
    await POST(makeRequest({}));
    expect(lastJsonCall?.init?.status).toBe(400);
    expect(lastJsonCall?.data.error).toBe('Email is required');
  });

  it('returns generic success when no user found (no leaking)', async () => {
    mockUserFindFirst.mockResolvedValue(null);

    await POST(makeRequest({ email: 'noone@example.com' }));

    expect(lastJsonCall?.data.success).toBe(true);
    expect(lastJsonCall?.init?.status).toBeUndefined();
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  it('sends verification email when user exists', async () => {
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    });

    await POST(makeRequest({ email: 'user@example.com' }));

    expect(lastJsonCall?.data.success).toBe(true);
    expect(mockSendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Confirm Account Deletion - Lunary',
      }),
    );
  });

  it('normalizes email to lowercase', async () => {
    mockUserFindFirst.mockResolvedValue(null);

    await POST(makeRequest({ email: '  User@Example.COM  ' }));

    expect(mockUserFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'user@example.com' },
      }),
    );
  });

  it('returns generic success when deletion already pending', async () => {
    mockUserFindFirst.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
    });
    mockDeletionFindFirst.mockResolvedValue({ id: 'existing-del' });

    await POST(makeRequest({ email: 'user@example.com' }));

    expect(lastJsonCall?.data.success).toBe(true);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });
});
