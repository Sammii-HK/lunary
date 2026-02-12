/**
 * Tests for process-deletions cron route.
 * Verifies that every user-facing table is deleted or anonymized,
 * and that audit tables (consent_log, deletion_requests) are preserved.
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks — everything must be created inside the factory since it's hoisted
// ---------------------------------------------------------------------------

jest.mock('@/lib/prisma', () => {
  function createModelProxy() {
    return {
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      updateMany: jest.fn().mockResolvedValue({ count: 0 }),
      delete: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
    };
  }

  const modelMocks: Record<string, any> = {};
  const mockTransaction = jest.fn().mockImplementation((ops: any[]) => {
    return Promise.resolve(ops.map(() => ({ count: 0 })));
  });

  const proxy = new Proxy(
    { $transaction: mockTransaction },
    {
      get(target, prop: string) {
        if (prop === '$transaction') return target.$transaction;
        if (!modelMocks[prop]) {
          modelMocks[prop] = createModelProxy();
        }
        return modelMocks[prop];
      },
    },
  );

  // Expose internals for test assertions
  (globalThis as any).__deletionTestMocks = {
    modelMocks,
    mockTransaction,
    createModelProxy,
  };

  return { prisma: proxy };
});

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    subscriptions: {
      cancel: jest.fn().mockResolvedValue({}),
    },
  }));
});

// ---------------------------------------------------------------------------
// Import (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/cron/process-deletions/route';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTestMocks() {
  return (globalThis as any).__deletionTestMocks as {
    modelMocks: Record<string, any>;
    mockTransaction: jest.Mock;
    createModelProxy: () => any;
  };
}

function makeRequest(cronSecret?: string) {
  const headers: Record<string, string> = {};
  if (cronSecret) {
    headers['authorization'] = `Bearer ${cronSecret}`;
  }
  return new Request('https://lunary.app/api/cron/process-deletions', {
    headers,
  });
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

const TEST_CRON_SECRET = 'test-secret';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('process-deletions cron', () => {
  beforeEach(() => {
    const { modelMocks, mockTransaction, createModelProxy } = getTestMocks();

    jest.clearAllMocks();
    // Clear model mocks but keep the proxy alive
    for (const key of Object.keys(modelMocks)) {
      delete modelMocks[key];
    }

    installJsonSpy();
    process.env.CRON_SECRET = TEST_CRON_SECRET;

    // Set up a pending deletion
    const deletionMock = createModelProxy();
    deletionMock.findMany.mockResolvedValue([
      {
        id: 'del-1',
        user_id: 'user-123',
        status: 'pending',
        scheduled_for: new Date('2020-01-01'),
      },
    ]);
    modelMocks['deletion_requests'] = deletionMock;

    // No active subscription
    const subMock = createModelProxy();
    subMock.findUnique.mockResolvedValue(null);
    modelMocks['subscriptions'] = subMock;
  });

  afterEach(() => {
    jsonSpy?.mockRestore();
  });

  it('returns 401 without valid cron secret', async () => {
    const response = await GET(makeRequest('wrong-secret'));
    expect(response.status).toBe(401);
  });

  it('calls $transaction with all deletion operations', async () => {
    const { mockTransaction } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    const ops = mockTransaction.mock.calls[0][0];
    expect(ops.length).toBeGreaterThanOrEqual(50);
  });

  it('deletes all user content tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    const contentTables = [
      'collections',
      'collection_folders',
      'synastry_reports',
      'relationship_profiles',
      'cosmic_reports',
      'cosmic_snapshots',
      'daily_horoscopes',
      'daily_thread_modules',
      'monthly_insights',
      'ai_prompts',
      'user_memory',
      'conversation_snippets',
      'pattern_analysis',
      'year_analysis',
    ];

    for (const table of contentTables) {
      expect(modelMocks[table]?.deleteMany).toHaveBeenCalled();
    }
  });

  it('deletes all engagement and gamification tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    const tables = [
      'daily_rituals',
      'challenge_completions',
      'milestones_achieved',
      'ritual_habits',
      'weekly_ritual_usage',
      'user_progress',
      'onboarding_completion',
      'tourProgress',
      'feature_announcements_seen',
    ];

    for (const table of tables) {
      expect(modelMocks[table]?.deleteMany).toHaveBeenCalled();
    }
  });

  it('deletes all social and community tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    const tables = [
      'cosmic_gifts',
      'friend_celebrations',
      'friend_connections',
      'friend_invites',
      'community_posts',
      'community_memberships',
      'moon_circle_insights',
    ];

    for (const table of tables) {
      expect(modelMocks[table]?.deleteMany).toHaveBeenCalled();
    }
  });

  it('deletes notification and preference tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    const tables = [
      'native_push_tokens',
      'push_subscriptions',
      'email_preferences',
      'newsletter_subscribers',
    ];

    for (const table of tables) {
      expect(modelMocks[table]?.deleteMany).toHaveBeenCalled();
    }
  });

  it('anonymizes analytics tables with updateMany', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    const anonymizedTables = [
      'analytics_user_activity',
      'analytics_conversions',
      'analytics_ai_usage',
    ];

    for (const table of anonymizedTables) {
      expect(modelMocks[table]?.updateMany).toHaveBeenCalled();
    }
  });

  it('deletes analytics identity and notification tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(
      modelMocks['analytics_notification_events']?.deleteMany,
    ).toHaveBeenCalled();
    expect(
      modelMocks['analytics_identity_links']?.deleteMany,
    ).toHaveBeenCalled();
    expect(modelMocks['user_attribution']?.deleteMany).toHaveBeenCalled();
  });

  it('deletes referral and campaign tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(modelMocks['user_referrals']?.deleteMany).toHaveBeenCalled();
    expect(modelMocks['referral_codes']?.deleteMany).toHaveBeenCalled();
    expect(
      modelMocks['re_engagement_campaigns']?.deleteMany,
    ).toHaveBeenCalled();
  });

  it('deletes misc tables', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(modelMocks['legacy_fallback_usage']?.deleteMany).toHaveBeenCalled();
    expect(modelMocks['subscription_audit_log']?.deleteMany).toHaveBeenCalled();
    expect(modelMocks['pending_checkouts']?.deleteMany).toHaveBeenCalled();
  });

  it('deletes BetterAuth tables (account, session, user)', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(modelMocks['account']?.deleteMany).toHaveBeenCalled();
    expect(modelMocks['session']?.deleteMany).toHaveBeenCalled();
    expect(modelMocks['user']?.delete).toHaveBeenCalled();
  });

  it('does NOT delete consent_log (legal requirement)', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(
      modelMocks['consent_log']?.deleteMany?.mock?.calls?.length ?? 0,
    ).toBe(0);
  });

  it('marks deletion_requests as completed (not deleted)', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(modelMocks['deletion_requests']?.update).toHaveBeenCalled();
  });

  it('handles social tables with OR conditions for bidirectional relations', async () => {
    const { modelMocks } = getTestMocks();

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(modelMocks['friend_celebrations']?.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ sender_id: 'user-123' }, { receiver_id: 'user-123' }],
      },
    });

    expect(modelMocks['friend_connections']?.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [{ user_id: 'user-123' }, { friend_id: 'user-123' }],
      },
    });

    expect(modelMocks['user_referrals']?.deleteMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { referrer_user_id: 'user-123' },
          { referred_user_id: 'user-123' },
        ],
      },
    });
  });

  it('returns success response with processing details', async () => {
    await GET(makeRequest(TEST_CRON_SECRET));

    expect(lastJsonCall?.data).toEqual({
      success: true,
      processed: 1,
      errors: 0,
      details: [{ userId: 'user-123', success: true }],
    });
  });

  it('processes no deletions when none are pending', async () => {
    const { modelMocks, mockTransaction, createModelProxy } = getTestMocks();

    modelMocks['deletion_requests'] = createModelProxy();
    modelMocks['deletion_requests'].findMany.mockResolvedValue([]);

    await GET(makeRequest(TEST_CRON_SECRET));

    expect(mockTransaction).not.toHaveBeenCalled();
    expect(lastJsonCall?.data).toEqual({
      success: true,
      processed: 0,
      errors: 0,
      details: [],
    });
  });
});
