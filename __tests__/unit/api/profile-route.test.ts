/**
 * Tests for Profile API Route (GET handler)
 * Verifies response shape, auth handling, empty state, and parallel query execution.
 */

import { NextRequest, NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks - must be declared before the module under test is imported
// ---------------------------------------------------------------------------

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('@/lib/get-user-session', () => ({
  getCurrentUser: jest.fn(),
}));

jest.mock('@/lib/encryption', () => ({
  encrypt: jest.fn((v: string) => `encrypted:${v}`),
  decrypt: jest.fn((v: string) =>
    v.startsWith('encrypted:') ? v.replace('encrypted:', '') : v,
  ),
}));

jest.mock('@/lib/date-only', () => ({
  normalizeIsoDateOnly: jest.fn((v: string | null) => v),
}));

jest.mock('@/lib/location-encryption', () => ({
  decryptLocation: jest.fn((v: any) => (v ? { city: 'Portland' } : null)),
  encryptLocation: jest.fn((v: any) => ({ encrypted: 'enc:location' })),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/profile/route';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { decrypt } from '@/lib/encryption';
import { normalizeIsoDateOnly } from '@/lib/date-only';
import { decryptLocation } from '@/lib/location-encryption';

const sqlMock = sql as unknown as jest.Mock;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(url = 'https://lunary.app/api/profile') {
  return new NextRequest(url);
}

/**
 * Spy on NextResponse.json to capture the data and init args it receives.
 * This avoids issues with jsdom's polyfilled Response body handling.
 */
let jsonSpy: jest.SpyInstance;
let lastJsonCall: { data: any; init: any } | null = null;

function installJsonSpy() {
  lastJsonCall = null;
  jsonSpy = jest
    .spyOn(NextResponse, 'json')
    .mockImplementation((data: any, init?: any) => {
      lastJsonCall = { data, init };
      // Return a minimal response-like object with correct status
      return { status: init?.status || 200 } as any;
    });
}

function cleanupJsonSpy() {
  jsonSpy?.mockRestore();
}

const fakeUser = { id: 'user-123', email: 'test@lunary.app', name: 'Test' };

const fakeProfileRow = {
  id: 'prof-1',
  user_id: 'user-123',
  name: 'encrypted:Luna',
  birthday: 'encrypted:1990-04-15',
  birth_chart: { sun: 'Aries' },
  personal_card: { card: 'The Moon' },
  location: { encrypted: 'enc:location' },
  stripe_customer_id: 'cus_abc',
  intention: 'self-discovery',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z',
};

const fakeSubscriptionRow = {
  status: 'active',
  plan_type: 'premium',
  stripe_customer_id: 'cus_abc',
  stripe_subscription_id: 'sub_xyz',
  trial_ends_at: null,
  current_period_end: '2025-01-01T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Profile API Route - GET', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    installJsonSpy();
  });

  afterEach(() => {
    cleanupJsonSpy();
  });

  it('returns 401 for unauthenticated requests', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET(makeRequest());

    expect(response.status).toBe(401);
    expect(lastJsonCall?.data).toEqual({ error: 'Unauthorized' });
  });

  it('returns correct shape with profile and subscription', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(fakeUser);
    sqlMock
      .mockResolvedValueOnce({ rows: [fakeProfileRow] })
      .mockResolvedValueOnce({ rows: [fakeSubscriptionRow] });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);

    const body = lastJsonCall?.data;

    // Profile shape
    expect(body.profile).toEqual({
      id: 'prof-1',
      userId: 'user-123',
      name: 'Luna',
      birthday: '1990-04-15',
      birthChart: { sun: 'Aries' },
      personalCard: { card: 'The Moon' },
      location: { city: 'Portland' },
      stripeCustomerId: 'cus_abc',
      intention: 'self-discovery',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-06-01T00:00:00Z',
    });

    // Subscription shape
    expect(body.subscription).toEqual({
      status: 'active',
      planType: 'premium',
      stripeCustomerId: 'cus_abc',
      stripeSubscriptionId: 'sub_xyz',
      trialEndsAt: null,
      currentPeriodEnd: '2025-01-01T00:00:00Z',
    });

    // Verify helpers were called
    expect(decrypt).toHaveBeenCalledWith('encrypted:Luna');
    expect(decrypt).toHaveBeenCalledWith('encrypted:1990-04-15');
    expect(normalizeIsoDateOnly).toHaveBeenCalled();
    expect(decryptLocation).toHaveBeenCalledWith(fakeProfileRow.location);
  });

  it('returns { profile: null, subscription: { status: "free" } } for user with no data', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(fakeUser);
    sqlMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);

    const body = lastJsonCall?.data;
    expect(body.profile).toBeNull();
    expect(body.subscription).toEqual({ status: 'free' });
  });

  it('runs both queries in parallel using Promise.all', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(fakeUser);

    // Track the order of events to verify parallelism.
    // If queries run sequentially the first promise resolves before the second
    // is even created.  With Promise.all both promises are created (sql called
    // twice) before either has resolved.
    const callOrder: string[] = [];

    sqlMock.mockImplementation(() => {
      const callIndex = callOrder.length;
      callOrder.push(`sql-called-${callIndex}`);
      return new Promise((resolve) => {
        // Use setTimeout so the second call can be registered before
        // the first resolves (setImmediate is not available in jsdom).
        setTimeout(() => {
          callOrder.push(`sql-resolved-${callIndex}`);
          resolve({ rows: [] });
        }, 0);
      });
    });

    await GET(makeRequest());

    // Both sql calls should be registered before either resolves.
    // With Promise.all the order is:
    //   sql-called-0, sql-called-1, sql-resolved-0, sql-resolved-1
    // With sequential await the order would be:
    //   sql-called-0, sql-resolved-0, sql-called-1, sql-resolved-1
    expect(callOrder[0]).toBe('sql-called-0');
    expect(callOrder[1]).toBe('sql-called-1');
    expect(callOrder[2]).toBe('sql-resolved-0');
    expect(callOrder[3]).toBe('sql-resolved-1');
  });

  it('selects specific columns instead of SELECT *', async () => {
    (getCurrentUser as jest.Mock).mockResolvedValueOnce(fakeUser);
    sqlMock
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    await GET(makeRequest());

    // The sql tagged template is called with template string arrays.
    // Inspect the first argument (the template strings) of each call.
    expect(sqlMock).toHaveBeenCalledTimes(2);

    const profileQuery = sqlMock.mock.calls[0][0][0];
    const subscriptionQuery = sqlMock.mock.calls[1][0][0];

    // Neither query should use SELECT *
    expect(profileQuery).not.toContain('SELECT *');
    expect(subscriptionQuery).not.toContain('SELECT *');

    // Profile query should select specific columns
    expect(profileQuery).toContain('id');
    expect(profileQuery).toContain('user_id');
    expect(profileQuery).toContain('name');
    expect(profileQuery).toContain('birthday');
    expect(profileQuery).toContain('birth_chart');
    expect(profileQuery).toContain('personal_card');
    expect(profileQuery).toContain('location');
    expect(profileQuery).toContain('stripe_customer_id');
    expect(profileQuery).toContain('intention');
    expect(profileQuery).toContain('created_at');
    expect(profileQuery).toContain('updated_at');

    // Subscription query should select specific columns
    expect(subscriptionQuery).toContain('status');
    expect(subscriptionQuery).toContain('plan_type');
    expect(subscriptionQuery).toContain('stripe_customer_id');
    expect(subscriptionQuery).toContain('stripe_subscription_id');
    expect(subscriptionQuery).toContain('trial_ends_at');
    expect(subscriptionQuery).toContain('current_period_end');
  });
});
