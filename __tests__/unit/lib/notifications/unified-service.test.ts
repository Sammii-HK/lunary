import { NotificationEvent } from '@/lib/notifications/unified-service';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn(),
}));

jest.mock('@/app/api/cron/shared-notification-tracker', () => ({
  getSentEvents: jest.fn(),
  markEventAsSent: jest.fn(),
  cleanupOldDates: jest.fn(),
}));

jest.mock('@/lib/notifications/personalization', () => ({
  getUserProfile: jest.fn(),
  personalizeNotificationTitle: jest.fn((title) => title),
  personalizeNotificationBody: jest.fn((body) => body),
  shouldPersonalize: jest.fn(() => false),
}));

describe('Unified Notification Service', () => {
  const mockSql = require('@vercel/postgres').sql;
  const mockWebpush = require('web-push');
  const {
    getSentEvents,
    markEventAsSent,
    cleanupOldDates,
  } = require('@/app/api/cron/shared-notification-tracker');

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPID_PUBLIC_KEY = 'test-public-key';
    process.env.VAPID_PRIVATE_KEY = 'test-private-key';

    getSentEvents.mockResolvedValue(new Set());
    cleanupOldDates.mockResolvedValue(undefined);
    markEventAsSent.mockResolvedValue(undefined);
  });

  describe('createEventKey', () => {
    it('creates correct event key format', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };

      mockSql.mockResolvedValueOnce({
        rows: [],
      });

      const result = await sendUnifiedNotification(event);

      expect(markEventAsSent).toHaveBeenCalledWith(
        expect.any(String),
        'moon-New Moon-10',
        'moon',
        'New Moon',
        10,
        'daily',
      );
    });

    it('handles missing event name', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: '',
        type: 'moon',
        priority: 10,
      };

      mockSql.mockResolvedValueOnce({
        rows: [],
      });

      await sendUnifiedNotification(event);

      expect(markEventAsSent).toHaveBeenCalledWith(
        expect.any(String),
        'moon-unknown-10',
        'moon',
        '',
        10,
        'daily',
      );
    });
  });

  describe('deduplication', () => {
    it('skips already sent events', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };

      getSentEvents.mockResolvedValueOnce(new Set(['moon-New Moon-10']));

      mockSql.mockResolvedValueOnce({
        rows: [],
      });

      const result = await sendUnifiedNotification(event);

      expect(result.recipientCount).toBe(0);
      expect(result.successful).toBe(0);
      expect(mockWebpush.sendNotification).not.toHaveBeenCalled();
    });
  });

  describe('preference filtering', () => {
    it('filters subscriptions by moon phase preference', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };

      mockSql.mockImplementation((...args: any[]) => {
        const queryParts = args.filter((arg) => typeof arg === 'string');
        const queryStr = queryParts.join(' ');

        if (queryStr.includes('SELECT') && queryStr.includes('moonPhases')) {
          return Promise.resolve({
            rows: [
              {
                endpoint: 'endpoint1',
                p256dh: 'key1',
                auth: 'auth1',
                user_id: 'user1',
                preferences: { moonPhases: true },
              },
            ],
          });
        }
        if (
          queryStr.includes('UPDATE') &&
          queryStr.includes('last_notification_sent')
        ) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      mockWebpush.sendNotification.mockResolvedValueOnce(undefined);

      const result = await sendUnifiedNotification(event);

      expect(mockSql).toHaveBeenCalled();
      expect(result.recipientCount).toBe(1);
      expect(result.successful).toBe(1);
    });
  });

  describe('notification creation', () => {
    it('creates notification with correct structure', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: 'Mercury Enters Sagittarius',
        type: 'ingress',
        priority: 4,
        planet: 'Mercury',
        sign: 'Sagittarius',
      };

      mockSql
        .mockResolvedValueOnce({
          rows: [
            {
              endpoint: 'endpoint1',
              p256dh: 'key1',
              auth: 'auth1',
              user_id: null,
              preferences: { planetaryTransits: true },
            },
          ],
        })
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      mockWebpush.sendNotification.mockResolvedValueOnce(undefined);

      await sendUnifiedNotification(event);

      expect(mockWebpush.sendNotification).toHaveBeenCalledTimes(1);
      const [, notificationJson] = mockWebpush.sendNotification.mock.calls[0];
      const notification = JSON.parse(notificationJson);

      expect(notification.title).toContain('Mercury');
      expect(notification.title).toContain('Sagittarius');
      expect(notification.body).toBeTruthy();
      expect(notification.actions).toEqual([
        {
          action: 'view',
          title: 'View',
          icon: '/icons/icon-72x72.png',
        },
      ]);
      expect(notification.tag).toBe('lunary-ingress');
    });
  });

  describe('error handling', () => {
    it('handles invalid subscription endpoints', async () => {
      const { sendUnifiedNotification } = await import(
        '@/lib/notifications/unified-service'
      );

      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };

      let callCount = 0;
      mockSql.mockImplementation((...args: any[]) => {
        callCount++;
        const queryParts = args.filter((arg) => typeof arg === 'string');
        const queryStr = queryParts.join(' ');

        if (
          callCount === 1 &&
          queryStr.includes('SELECT') &&
          queryStr.includes('push_subscriptions')
        ) {
          return Promise.resolve({
            rows: [
              {
                endpoint: 'invalid-endpoint',
                p256dh: 'key1',
                auth: 'auth1',
                user_id: null,
                preferences: { moonPhases: true },
              },
            ],
          });
        }
        if (queryStr.includes('UPDATE')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      mockWebpush.sendNotification.mockRejectedValueOnce(new Error('410 Gone'));

      const result = await sendUnifiedNotification(event);

      expect(result.recipientCount).toBe(1);
      expect(result.successful).toBe(0);
      expect(result.failed).toBeGreaterThanOrEqual(0);
      expect(mockSql).toHaveBeenCalled();
    });
  });
});
