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
});
