import {
  generateUniqueNotificationText,
  addContextualInfo,
  NotificationEvent,
} from '@/lib/notifications/content-generator';

describe('Content Generator', () => {
  describe('generateUniqueNotificationText', () => {
    it('generates text for New Moon event', () => {
      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };
      const text = generateUniqueNotificationText(event);
      expect(text).toContain('New Moon');
      expect(text.length).toBeGreaterThan(0);
    });

    it('generates text for Full Moon event', () => {
      const event: NotificationEvent = {
        name: 'Full Moon',
        type: 'moon',
        priority: 10,
      };
      const text = generateUniqueNotificationText(event);
      expect(text).toContain('Full Moon');
      expect(text.length).toBeGreaterThan(0);
    });

    it('generates text for ingress event', () => {
      const event: NotificationEvent = {
        name: 'Mercury Enters Sagittarius',
        type: 'ingress',
        priority: 4,
        planet: 'Mercury',
        sign: 'Sagittarius',
      };
      const text = generateUniqueNotificationText(event);
      expect(text).toContain('Mercury');
      expect(text).toContain('Sagittarius');
    });

    it('generates text for aspect event', () => {
      const event: NotificationEvent = {
        name: 'Saturn-Neptune Conjunction',
        type: 'aspect',
        priority: 7,
        planetA: { name: 'Saturn' },
        planetB: { name: 'Neptune' },
        aspect: 'conjunction',
      };
      const text = generateUniqueNotificationText(event);
      expect(text).toContain('Saturn');
      expect(text).toContain('Neptune');
    });

    it('avoids duplicates when previousTexts provided', () => {
      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };
      const previousTexts = new Set([
        'New Moon arrives - a powerful moment for setting intentions',
      ]);
      const text = generateUniqueNotificationText(event, previousTexts);
      expect(text).not.toBe(
        'New Moon arrives - a powerful moment for setting intentions',
      );
      expect(text.length).toBeGreaterThan(0);
    });

    it('returns default text for unknown event types', () => {
      const event: NotificationEvent = {
        name: 'Unknown Event',
        type: 'unknown',
        priority: 5,
      };
      const text = generateUniqueNotificationText(event);
      expect(text).toBe('Unknown Event');
    });
  });

  describe('addContextualInfo', () => {
    it('adds moon sign info when available', () => {
      const baseText = 'A powerful reset point';
      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };
      const cosmicData = {
        astronomicalData: {
          planets: {
            moon: {
              sign: 'Taurus',
            },
          },
        },
      };
      const result = addContextualInfo(baseText, event, cosmicData);
      expect(result).toContain('Moon in Taurus');
    });

    it('returns original text when no contextual info available', () => {
      const baseText = 'Planetary energy shift';
      const event: NotificationEvent = {
        name: 'Ingress',
        type: 'ingress',
        priority: 4,
      };
      const result = addContextualInfo(baseText, event);
      expect(result).toBe(baseText);
    });

    it('handles missing cosmicData gracefully', () => {
      const baseText = 'A powerful reset point';
      const event: NotificationEvent = {
        name: 'New Moon',
        type: 'moon',
        priority: 10,
      };
      const result = addContextualInfo(baseText, event);
      expect(result).toBe(baseText);
    });
  });
});
