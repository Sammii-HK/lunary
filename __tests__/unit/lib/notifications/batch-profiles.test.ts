import { NotificationEvent } from '@/lib/notifications/unified-service';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/app/api/cron/shared-notification-tracker', () => ({
  getSentEvents: jest.fn(),
  markEventAsSent: jest.fn(),
  cleanupOldDates: jest.fn(),
}));

jest.mock('@/lib/notifications/personalization', () => ({
  getUserProfile: jest.fn(),
  batchGetUserProfiles: jest.fn(),
  personalizeNotificationTitle: jest.fn((title: string) => title),
  personalizeNotificationBody: jest.fn((body: string) => body),
  shouldPersonalize: jest.fn(() => false),
}));

jest.mock('@/lib/notifications/content-generator', () => ({
  addContextualInfo: jest.fn((body: string) => body),
}));

describe('Batch User Profile Fetching', () => {
  const mockSql = require('@vercel/postgres').sql;
  const mockWebpush = require('web-push');
  const {
    getSentEvents,
    markEventAsSent,
    cleanupOldDates,
  } = require('@/app/api/cron/shared-notification-tracker');
  const {
    getUserProfile,
    batchGetUserProfiles,
    shouldPersonalize,
    personalizeNotificationTitle,
    personalizeNotificationBody,
  } = require('@/lib/notifications/personalization');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY =
      'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkOs-WLgJBsTfAIqR1DC6sP7Q5zLmq5jMbNvu5ELG4';
    process.env.VAPID_PRIVATE_KEY =
      'UUxI4o8-FbRouAevSmBQ6o18hgE4nSG3qwvJTfKc-ls';

    getSentEvents.mockResolvedValue(new Set());
    cleanupOldDates.mockResolvedValue(undefined);
    markEventAsSent.mockResolvedValue(undefined);
    shouldPersonalize.mockImplementation(
      (profile: any) => profile?.subscription?.isPaid && profile?.birthday,
    );
    personalizeNotificationTitle.mockImplementation((title: string) => title);
    personalizeNotificationBody.mockImplementation(
      (body: string, _type: string, profile: any) => {
        const firstName = profile?.name?.split(' ')[0];
        if (firstName && profile?.subscription?.isPaid) {
          return `${firstName}, ${body.charAt(0).toLowerCase()}${body.slice(1)}`;
        }
        return body;
      },
    );
  });

  it('makes only 1 batch query for profiles instead of N individual queries', async () => {
    const { sendUnifiedNotification } =
      await import('@/lib/notifications/unified-service');

    const event: NotificationEvent = {
      name: 'Full Moon',
      type: 'moon',
      priority: 10,
    };

    // First call: subscription query returns 5 subscribers
    const fiveSubscribers = [
      {
        endpoint: 'https://push.example.com/sub1',
        p256dh: 'key1',
        auth: 'auth1',
        user_id: 'user-1',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub2',
        p256dh: 'key2',
        auth: 'auth2',
        user_id: 'user-2',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub3',
        p256dh: 'key3',
        auth: 'auth3',
        user_id: 'user-3',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub4',
        p256dh: 'key4',
        auth: 'auth4',
        user_id: 'user-4',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub5',
        p256dh: 'key5',
        auth: 'auth5',
        user_id: 'user-5',
        preferences: {},
      },
    ];

    mockSql.mockResolvedValueOnce({ rows: fiveSubscribers });

    // batchGetUserProfiles returns a map with profiles for all users
    const profileMap = new Map();
    for (let i = 1; i <= 5; i++) {
      profileMap.set(`user-${i}`, {
        userId: `user-${i}`,
        name: `User ${i}`,
        birthday: '1990-01-01',
        subscription: { status: 'active', planType: 'premium', isPaid: true },
      });
    }
    batchGetUserProfiles.mockResolvedValueOnce(profileMap);

    // Mock the UPDATE queries for last_notification_sent (one per subscriber)
    for (let i = 0; i < 5; i++) {
      mockSql.mockResolvedValueOnce({ rows: [] });
    }

    await sendUnifiedNotification(event);

    // batchGetUserProfiles should be called exactly once with all 5 user IDs
    expect(batchGetUserProfiles).toHaveBeenCalledTimes(1);
    expect(batchGetUserProfiles).toHaveBeenCalledWith(
      expect.arrayContaining([
        'user-1',
        'user-2',
        'user-3',
        'user-4',
        'user-5',
      ]),
    );

    // getUserProfile should NOT be called at all (no N+1)
    expect(getUserProfile).not.toHaveBeenCalled();
  });

  it('personalizes notification content correctly using batch-fetched profiles', async () => {
    const { sendUnifiedNotification } =
      await import('@/lib/notifications/unified-service');

    const event: NotificationEvent = {
      name: 'Full Moon',
      type: 'moon',
      priority: 10,
    };

    const fiveSubscribers = [
      {
        endpoint: 'https://push.example.com/sub1',
        p256dh: 'key1',
        auth: 'auth1',
        user_id: 'user-1',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub2',
        p256dh: 'key2',
        auth: 'auth2',
        user_id: 'user-2',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub3',
        p256dh: 'key3',
        auth: 'auth3',
        user_id: 'user-3',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub4',
        p256dh: 'key4',
        auth: 'auth4',
        user_id: 'user-4',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/sub5',
        p256dh: 'key5',
        auth: 'auth5',
        user_id: 'user-5',
        preferences: {},
      },
    ];

    mockSql.mockResolvedValueOnce({ rows: fiveSubscribers });

    // Mix of paid and free users
    const profileMap = new Map();
    profileMap.set('user-1', {
      userId: 'user-1',
      name: 'Alice Smith',
      birthday: '1990-03-15',
      subscription: { status: 'active', planType: 'premium', isPaid: true },
    });
    profileMap.set('user-2', {
      userId: 'user-2',
      name: 'Bob Jones',
      birthday: '1985-07-22',
      subscription: { status: 'active', planType: 'premium', isPaid: true },
    });
    // user-3 is free, no personalization
    profileMap.set('user-3', {
      userId: 'user-3',
      name: 'Charlie Brown',
      subscription: { status: 'free', planType: 'free', isPaid: false },
    });
    // user-4 not in map (no profile found)
    // user-5 is paid but no birthday
    profileMap.set('user-5', {
      userId: 'user-5',
      name: 'Eve Wilson',
      subscription: { status: 'active', planType: 'premium', isPaid: true },
    });

    batchGetUserProfiles.mockResolvedValueOnce(profileMap);

    // Mock the UPDATE queries
    for (let i = 0; i < 5; i++) {
      mockSql.mockResolvedValueOnce({ rows: [] });
    }

    const result = await sendUnifiedNotification(event);

    expect(result.successful).toBe(5);

    // Verify webpush.sendNotification was called 5 times
    expect(mockWebpush.sendNotification).toHaveBeenCalledTimes(5);

    // shouldPersonalize should have been called for users with profiles
    expect(shouldPersonalize).toHaveBeenCalled();
    // personalizeNotificationBody should have been called for paid users with birthdays
    expect(personalizeNotificationBody).toHaveBeenCalledTimes(2);

    // Collect all notifications sent (order may vary due to async concurrency)
    const calls = mockWebpush.sendNotification.mock.calls;
    const notifications = calls.map((call: any[]) => JSON.parse(call[1]));
    const bodies = notifications.map((n: any) => n.body);

    // Exactly 2 notifications should be personalized (Alice and Bob)
    const personalizedBodies = bodies.filter(
      (b: string) => b.includes('Alice') || b.includes('Bob'),
    );
    expect(personalizedBodies).toHaveLength(2);
    expect(bodies).toContainEqual(expect.stringContaining('Alice'));
    expect(bodies).toContainEqual(expect.stringContaining('Bob'));

    // The remaining 3 notifications should be generic (no names injected)
    const genericBodies = bodies.filter(
      (b: string) =>
        !b.includes('Alice') &&
        !b.includes('Bob') &&
        !b.includes('Charlie') &&
        !b.includes('Eve'),
    );
    expect(genericBodies).toHaveLength(3);

    // No notification should contain 'undefined' as text
    for (const body of bodies) {
      expect(body).not.toContain('undefined');
    }
  });

  it('handles duplicate user_ids by deduplicating before batch fetch', async () => {
    const { sendUnifiedNotification } =
      await import('@/lib/notifications/unified-service');

    const event: NotificationEvent = {
      name: 'New Moon',
      type: 'moon',
      priority: 10,
    };

    // Same user_id on multiple subscriptions (e.g., multiple devices)
    const subscribers = [
      {
        endpoint: 'https://push.example.com/device-a',
        p256dh: 'key1',
        auth: 'auth1',
        user_id: 'user-1',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/device-b',
        p256dh: 'key2',
        auth: 'auth2',
        user_id: 'user-1',
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/device-c',
        p256dh: 'key3',
        auth: 'auth3',
        user_id: 'user-2',
        preferences: {},
      },
    ];

    mockSql.mockResolvedValueOnce({ rows: subscribers });

    const profileMap = new Map();
    profileMap.set('user-1', {
      userId: 'user-1',
      name: 'Alice',
      birthday: '1990-01-01',
      subscription: { status: 'active', planType: 'premium', isPaid: true },
    });
    profileMap.set('user-2', {
      userId: 'user-2',
      name: 'Bob',
      birthday: '1985-06-15',
      subscription: { status: 'active', planType: 'premium', isPaid: true },
    });
    batchGetUserProfiles.mockResolvedValueOnce(profileMap);

    for (let i = 0; i < 3; i++) {
      mockSql.mockResolvedValueOnce({ rows: [] });
    }

    await sendUnifiedNotification(event);

    // batchGetUserProfiles should receive deduplicated user IDs
    expect(batchGetUserProfiles).toHaveBeenCalledTimes(1);
    const calledWith = batchGetUserProfiles.mock.calls[0][0];
    expect(calledWith).toHaveLength(2);
    expect(calledWith).toContain('user-1');
    expect(calledWith).toContain('user-2');
  });

  it('skips batch fetch when no subscriptions have user_ids', async () => {
    const { sendUnifiedNotification } =
      await import('@/lib/notifications/unified-service');

    const event: NotificationEvent = {
      name: 'New Moon',
      type: 'moon',
      priority: 10,
    };

    const subscribers = [
      {
        endpoint: 'https://push.example.com/anon1',
        p256dh: 'key1',
        auth: 'auth1',
        user_id: null,
        preferences: {},
      },
      {
        endpoint: 'https://push.example.com/anon2',
        p256dh: 'key2',
        auth: 'auth2',
        user_id: undefined,
        preferences: {},
      },
    ];

    mockSql.mockResolvedValueOnce({ rows: subscribers });

    for (let i = 0; i < 2; i++) {
      mockSql.mockResolvedValueOnce({ rows: [] });
    }

    await sendUnifiedNotification(event);

    // batchGetUserProfiles should NOT be called since there are no user IDs
    expect(batchGetUserProfiles).not.toHaveBeenCalled();
    expect(getUserProfile).not.toHaveBeenCalled();
  });
});
