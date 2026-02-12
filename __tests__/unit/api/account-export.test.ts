/**
 * Tests for GDPR data export route.
 * Verifies that all user data tables are included in the export
 * and that encrypted fields are decrypted.
 */

// ---------------------------------------------------------------------------
// Mocks — everything inside factory to survive jest.mock hoisting
// ---------------------------------------------------------------------------

jest.mock('@/lib/prisma', () => {
  function createModelProxy() {
    return {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
    };
  }

  const modelMocks: Record<string, any> = {};

  const proxy = new Proxy(
    {},
    {
      get(_target, prop: string) {
        if (!modelMocks[prop]) {
          modelMocks[prop] = createModelProxy();
        }
        return modelMocks[prop];
      },
    },
  );

  (globalThis as any).__exportTestMocks = { modelMocks, createModelProxy };

  return { prisma: proxy };
});

jest.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: jest.fn().mockResolvedValue({
        user: { id: 'user-123', email: 'test@lunary.app' },
      }),
    },
  },
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue(new Headers()),
}));

jest.mock('@/lib/encryption', () => ({
  decrypt: jest.fn((v: string) => {
    if (v.startsWith('encrypted:')) return v.replace('encrypted:', '');
    return `decrypted:${v}`;
  }),
}));

// ---------------------------------------------------------------------------
// Import (after mocks)
// ---------------------------------------------------------------------------

import { GET } from '@/app/api/account/export/route';
import { auth } from '@/lib/auth';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTestMocks() {
  return (globalThis as any).__exportTestMocks as {
    modelMocks: Record<string, any>;
    createModelProxy: () => any;
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Account data export', () => {
  beforeEach(() => {
    const { modelMocks, createModelProxy } = getTestMocks();

    jest.clearAllMocks();
    for (const key of Object.keys(modelMocks)) {
      delete modelMocks[key];
    }

    // Profile with encrypted fields
    const profileMock = createModelProxy();
    profileMock.findFirst.mockResolvedValue({
      id: 'prof-1',
      user_id: 'user-123',
      name: 'encrypted:Luna',
      birthday: 'encrypted:1990-04-15',
      birth_chart: { sun: 'Aries' },
    });
    modelMocks['user_profiles'] = profileMock;

    // Subscription
    const subMock = createModelProxy();
    subMock.findUnique.mockResolvedValue({
      status: 'active',
      user_id: 'user-123',
    });
    modelMocks['subscriptions'] = subMock;

    // AI threads
    const threadMock = createModelProxy();
    threadMock.findMany.mockResolvedValue([
      { id: 'thread-1', messages: [1, 2, 3] },
    ]);
    modelMocks['aiThread'] = threadMock;

    // Streaks
    const streakMock = createModelProxy();
    streakMock.findFirst.mockResolvedValue({
      user_id: 'user-123',
      current: 5,
    });
    modelMocks['user_streaks'] = streakMock;

    // User memory with encrypted fields
    const memoryMock = createModelProxy();
    memoryMock.findMany.mockResolvedValue([
      {
        id: 1,
        user_id: 'user-123',
        category: 'preference',
        fact_encrypted: 'abc:def:ghi',
        confidence: 0.9,
      },
    ]);
    modelMocks['user_memory'] = memoryMock;

    // Collections
    const colMock = createModelProxy();
    colMock.findMany.mockResolvedValue([{ id: 'col-1' }]);
    modelMocks['collections'] = colMock;

    // Tarot readings
    const tarotMock = createModelProxy();
    tarotMock.findMany.mockResolvedValue([{ id: 'tr-1' }]);
    modelMocks['tarot_readings'] = tarotMock;
  });

  it('returns 401 for unauthenticated requests', async () => {
    (auth.api.getSession as unknown as jest.Mock).mockResolvedValueOnce(null);

    const response = await GET();
    expect(response.status).toBe(401);
  });

  it('returns all expected data keys in the export', async () => {
    const response = await GET();
    expect(response.status).toBe(200);

    const body = JSON.parse(await response.text());

    const expectedKeys = [
      'exportedAt',
      'userId',
      'email',
      'profile',
      'subscription',
      'tarotReadings',
      'notes',
      'aiConversations',
      'streaks',
      'pushSubscriptions',
      'collections',
      'collectionFolders',
      'relationshipProfiles',
      'synastryReports',
      'cosmicReports',
      'ritualHabits',
      'weeklyRitualUsage',
      'emailPreferences',
      'friendConnections',
      'moonCircleInsights',
      'communityPosts',
      'userMemory',
      'userProgress',
      'consentLog',
      'analyticsActivity',
      'dataRetentionInfo',
    ];

    for (const key of expectedKeys) {
      expect(body).toHaveProperty(key);
    }
  });

  it('decrypts profile name and birthday', async () => {
    const response = await GET();
    const body = JSON.parse(await response.text());

    expect(body.profile.name).toBe('Luna');
    expect(body.profile.birthday).toBe('1990-04-15');
  });

  it('decrypts user_memory fact_encrypted fields', async () => {
    const response = await GET();
    const body = JSON.parse(await response.text());

    expect(body.userMemory).toHaveLength(1);
    expect(body.userMemory[0].fact).toBe('decrypted:abc:def:ghi');
    expect(body.userMemory[0].fact_encrypted).toBeUndefined();
  });

  it('includes message count in AI conversations', async () => {
    const response = await GET();
    const body = JSON.parse(await response.text());

    expect(body.aiConversations[0].messageCount).toBe(3);
  });

  it('sets Content-Disposition header for file download', async () => {
    const response = await GET();

    const disposition = response.headers.get('Content-Disposition');
    expect(disposition).toContain('attachment');
    expect(disposition).toContain('lunary-data-export-user-123');
  });

  it('queries all required Prisma models', async () => {
    const { modelMocks } = getTestMocks();

    await GET();

    const queriedModels = [
      'user_profiles',
      'subscriptions',
      'tarot_readings',
      'user_notes',
      'aiThread',
      'user_streaks',
      'push_subscriptions',
      'collections',
      'collection_folders',
      'relationship_profiles',
      'synastry_reports',
      'cosmic_reports',
      'ritual_habits',
      'weekly_ritual_usage',
      'email_preferences',
      'friend_connections',
      'moon_circle_insights',
      'community_posts',
      'user_memory',
      'user_progress',
      'consent_log',
      'analytics_user_activity',
    ];

    for (const model of queriedModels) {
      const mock = modelMocks[model];
      expect(mock).toBeDefined();
      const wasCalled =
        (mock.findMany?.mock.calls.length ?? 0) > 0 ||
        (mock.findFirst?.mock.calls.length ?? 0) > 0 ||
        (mock.findUnique?.mock.calls.length ?? 0) > 0;
      expect(wasCalled).toBe(true);
    }
  });
});
