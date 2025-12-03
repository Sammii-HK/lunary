import {
  personalizeNotificationTitle,
  personalizeNotificationBody,
  shouldPersonalize,
  UserProfile,
} from '@/lib/notifications/personalization';

describe('Notification Personalization', () => {
  describe('personalizeNotificationTitle', () => {
    it('returns original title when no userName provided', () => {
      const title = 'New Moon';
      const result = personalizeNotificationTitle(title);
      expect(result).toBe(title);
    });

    it('returns original title when userName is empty', () => {
      const title = 'Full Moon';
      const result = personalizeNotificationTitle(title, '');
      expect(result).toBe(title);
    });

    it('returns original title when userName is provided', () => {
      const title = 'Mercury Enters Sagittarius';
      const result = personalizeNotificationTitle(title, 'John Doe');
      expect(result).toBe(title);
    });
  });

  describe('personalizeNotificationBody', () => {
    it('returns original body when no userProfile provided', () => {
      const body = 'A powerful reset point for manifestation';
      const result = personalizeNotificationBody(body, 'moon');
      expect(result).toBe(body);
    });

    it('personalizes moon notifications with firstName', () => {
      const body = 'A powerful reset point for manifestation';
      const userProfile: UserProfile = {
        userId: '123',
        name: 'Jane Smith',
        birthday: '1990-01-01',
        subscription: { status: 'active', planType: 'monthly', isPaid: true },
      };
      const result = personalizeNotificationBody(body, 'moon', userProfile);
      expect(result).toBe('Jane, a powerful reset point for manifestation');
    });

    it('handles single name correctly', () => {
      const body = 'Peak illumination brings clarity';
      const userProfile: UserProfile = {
        userId: '123',
        name: 'Madonna',
        birthday: '1990-01-01',
        subscription: { status: 'active', planType: 'monthly', isPaid: true },
      };
      const result = personalizeNotificationBody(body, 'moon', userProfile);
      expect(result).toBe('Madonna, peak illumination brings clarity');
    });

    it('returns original body for non-moon events', () => {
      const body = 'Planetary energy shift';
      const userProfile: UserProfile = {
        userId: '123',
        name: 'John Doe',
      };
      const result = personalizeNotificationBody(body, 'ingress', userProfile);
      expect(result).toBe(body);
    });
  });

  describe('shouldPersonalize', () => {
    it('returns false when no userProfile', () => {
      expect(shouldPersonalize()).toBe(false);
    });

    it('returns true for moon events with birthday and paid subscription', () => {
      const userProfile: UserProfile = {
        userId: '123',
        name: 'John',
        birthday: '1990-01-01',
        subscription: { status: 'active', planType: 'monthly', isPaid: true },
      };
      expect(shouldPersonalize(userProfile, 'moon')).toBe(true);
    });

    it('returns false for moon events without birthday', () => {
      const userProfile: UserProfile = {
        userId: '123',
        name: 'John',
      };
      expect(shouldPersonalize(userProfile, 'moon')).toBe(false);
    });

    it('returns false for non-moon events', () => {
      const userProfile: UserProfile = {
        userId: '123',
        name: 'John',
        birthday: '1990-01-01',
      };
      expect(shouldPersonalize(userProfile, 'ingress')).toBe(false);
    });
  });
});
