import {
  calculateMoonPhaseTime,
  calculateIngressTime,
  shouldSendNotificationNow,
  getNextNotificationTime,
  EventTiming,
} from '@/lib/notifications/event-timing';

describe('Event Timing', () => {
  describe('calculateMoonPhaseTime', () => {
    it('returns time for New Moon', () => {
      const date = new Date('2024-01-15');
      const result = calculateMoonPhaseTime('New Moon', date);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(15);
    });

    it('returns time for Full Moon', () => {
      const date = new Date('2024-01-30');
      const result = calculateMoonPhaseTime('Full Moon', date);
      expect(result).toBeInstanceOf(Date);
    });

    it('returns null for non-significant phases', () => {
      const date = new Date('2024-01-20');
      const result = calculateMoonPhaseTime('Waxing Gibbous', date);
      expect(result).toBeNull();
    });
  });

  describe('calculateIngressTime', () => {
    it('returns time for ingress event', () => {
      const date = new Date('2024-01-15');
      const result = calculateIngressTime('Mercury', 'Sagittarius', date);
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('returns approximate midday time', () => {
      const date = new Date('2024-01-15');
      const result = calculateIngressTime('Venus', 'Libra', date);
      expect(result?.getHours()).toBe(12);
    });
  });

  describe('shouldSendNotificationNow', () => {
    it('returns true when within buffer time', () => {
      const now = new Date();
      const eventTiming: EventTiming = {
        eventType: 'moon_phase',
        eventName: 'New Moon',
        exactTime: new Date(now.getTime() + 2 * 60 * 1000),
        notificationTime: new Date(now.getTime() + 2 * 60 * 1000),
      };
      const result = shouldSendNotificationNow(eventTiming, 5);
      expect(result).toBe(true);
    });

    it('returns false when outside buffer time', () => {
      const now = new Date();
      const eventTiming: EventTiming = {
        eventType: 'moon_phase',
        eventName: 'New Moon',
        exactTime: new Date(now.getTime() + 10 * 60 * 1000),
        notificationTime: new Date(now.getTime() + 10 * 60 * 1000),
      };
      const result = shouldSendNotificationNow(eventTiming, 5);
      expect(result).toBe(false);
    });

    it('handles past events correctly', () => {
      const now = new Date();
      const eventTiming: EventTiming = {
        eventType: 'moon_phase',
        eventName: 'New Moon',
        exactTime: new Date(now.getTime() - 2 * 60 * 1000),
        notificationTime: new Date(now.getTime() - 2 * 60 * 1000),
      };
      const result = shouldSendNotificationNow(eventTiming, 5);
      expect(result).toBe(true);
    });
  });

  describe('getNextNotificationTime', () => {
    it('subtracts buffer minutes from notification time', () => {
      const notificationTime = new Date('2024-01-15T14:00:00Z');
      const eventTiming: EventTiming = {
        eventType: 'moon_phase',
        eventName: 'New Moon',
        exactTime: notificationTime,
        notificationTime,
      };
      const result = getNextNotificationTime(eventTiming, 5);
      expect(result.getMinutes()).toBe(55);
    });

    it('handles different buffer times', () => {
      const notificationTime = new Date('2024-01-15T14:00:00Z');
      const eventTiming: EventTiming = {
        eventType: 'ingress',
        eventName: 'Mercury Enters Sagittarius',
        exactTime: notificationTime,
        notificationTime,
      };
      const result = getNextNotificationTime(eventTiming, 10);
      expect(result.getMinutes()).toBe(50);
    });
  });
});
