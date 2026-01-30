/**
 * Tests for pattern snapshot generators
 * Verifies archetype, life themes, and tarot season snapshot generation
 */

import { generateArchetypeSnapshot } from '../src/lib/patterns/snapshot/generator';
import { hasPatternChanged } from '../src/lib/patterns/snapshot/types';

// Mock dependencies
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('../src/lib/encryption', () => ({
  encryptJSON: jest.fn((data) => `encrypted_${JSON.stringify(data)}`),
  decryptJSON: jest.fn((data) => JSON.parse(data.replace('encrypted_', ''))),
}));

jest.mock('../src/lib/archetypes/detector', () => ({
  detectArchetypes: jest.fn(),
  hasEnoughDataForArchetypes: jest.fn(),
}));

jest.mock('../src/lib/patterns/utils/data-fetching', () => ({
  fetchJournalEntries: jest.fn(),
  fetchDreamTags: jest.fn(),
  fetchFrequentTarotCards: jest.fn(),
}));

import {
  detectArchetypes,
  hasEnoughDataForArchetypes,
} from '../src/lib/archetypes/detector';
import {
  fetchJournalEntries,
  fetchDreamTags,
  fetchFrequentTarotCards,
} from '../src/lib/patterns/utils/data-fetching';

describe('Pattern Snapshot Generation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateArchetypeSnapshot', () => {
    const mockUserId = 'test-user-123';

    it('generates archetype snapshot with valid data', async () => {
      // Mock data fetching
      (fetchJournalEntries as jest.Mock).mockResolvedValue([
        {
          content: 'I feel creative today',
          moodTags: ['creative', 'inspired'],
        },
        { content: 'Deep introspection', moodTags: ['reflective'] },
      ]);

      (fetchDreamTags as jest.Mock).mockResolvedValue([
        'water',
        'moon',
        'transformation',
      ]);

      (fetchFrequentTarotCards as jest.Mock).mockResolvedValue({
        tarotMajors: ['The Moon', 'The High Priestess'],
        tarotSuits: [
          { suit: 'Cups', count: 10 },
          { suit: 'Wands', count: 5 },
        ],
      });

      (hasEnoughDataForArchetypes as jest.Mock).mockReturnValue(true);

      (detectArchetypes as jest.Mock).mockReturnValue([
        { name: 'The Visionary', score: 42 },
        { name: 'The Empath', score: 35 },
        { name: 'The Seeker', score: 28 },
      ]);

      const snapshot = await generateArchetypeSnapshot(mockUserId);

      expect(snapshot).not.toBeNull();
      expect(snapshot?.type).toBe('archetype');
      expect(snapshot?.dominantArchetype).toBe('The Visionary');
      expect(snapshot?.archetypes).toHaveLength(3);
      expect(snapshot?.archetypes[0].name).toBe('The Visionary');
      expect(snapshot?.archetypes[0].strength).toBe(42);
      expect(snapshot?.timestamp).toBeDefined();
    });

    it('returns null with insufficient data', async () => {
      (fetchJournalEntries as jest.Mock).mockResolvedValue([]);
      (fetchDreamTags as jest.Mock).mockResolvedValue([]);
      (fetchFrequentTarotCards as jest.Mock).mockResolvedValue({
        tarotMajors: [],
        tarotSuits: [],
      });

      (hasEnoughDataForArchetypes as jest.Mock).mockReturnValue(false);

      const snapshot = await generateArchetypeSnapshot(mockUserId);

      expect(snapshot).toBeNull();
    });

    it('returns null when no archetypes detected', async () => {
      (fetchJournalEntries as jest.Mock).mockResolvedValue([
        { content: 'test', moodTags: ['test'] },
      ]);
      (fetchDreamTags as jest.Mock).mockResolvedValue(['test']);
      (fetchFrequentTarotCards as jest.Mock).mockResolvedValue({
        tarotMajors: ['The Fool'],
        tarotSuits: [{ suit: 'Cups', count: 1 }],
      });

      (hasEnoughDataForArchetypes as jest.Mock).mockReturnValue(true);
      (detectArchetypes as jest.Mock).mockReturnValue([]);

      const snapshot = await generateArchetypeSnapshot(mockUserId);

      expect(snapshot).toBeNull();
    });

    it('includes basedOn data from tarot and journal', async () => {
      (fetchJournalEntries as jest.Mock).mockResolvedValue([
        { content: 'test', moodTags: ['creative', 'inspired'] },
      ]);
      (fetchDreamTags as jest.Mock).mockResolvedValue(['moon']);
      (fetchFrequentTarotCards as jest.Mock).mockResolvedValue({
        tarotMajors: ['The Moon', 'The Star', 'The High Priestess'],
        tarotSuits: [{ suit: 'Cups', count: 5 }],
      });

      (hasEnoughDataForArchetypes as jest.Mock).mockReturnValue(true);
      (detectArchetypes as jest.Mock).mockReturnValue([
        { name: 'The Visionary', score: 40 },
      ]);

      const snapshot = await generateArchetypeSnapshot(mockUserId);

      expect(snapshot?.archetypes[0].basedOn).toBeDefined();
      expect(snapshot?.archetypes[0].basedOn.length).toBeGreaterThan(0);
      expect(snapshot?.archetypes[0].basedOn).toContain('The Moon');
    });

    it('handles errors gracefully', async () => {
      (fetchJournalEntries as jest.Mock).mockRejectedValue(
        new Error('Database error'),
      );

      const snapshot = await generateArchetypeSnapshot(mockUserId);

      expect(snapshot).toBeNull();
    });
  });

  describe('hasPatternChanged', () => {
    it('detects archetype changes > 20%', () => {
      const previous = {
        type: 'archetype' as const,
        timestamp: '2025-01-01T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [
          { name: 'The Visionary', strength: 40, basedOn: [] },
          { name: 'The Empath', strength: 30, basedOn: [] },
        ],
      };

      const current = {
        type: 'archetype' as const,
        timestamp: '2025-01-15T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [
          { name: 'The Visionary', strength: 61, basedOn: [] }, // +52.5% change (21 points)
          { name: 'The Empath', strength: 30, basedOn: [] },
        ],
      };

      expect(hasPatternChanged(previous, current)).toBe(true);
    });

    it('ignores archetype changes < 20%', () => {
      const previous = {
        type: 'archetype' as const,
        timestamp: '2025-01-01T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [{ name: 'The Visionary', strength: 40, basedOn: [] }],
      };

      const current = {
        type: 'archetype' as const,
        timestamp: '2025-01-15T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [
          { name: 'The Visionary', strength: 45, basedOn: [] }, // +5 points (< 20)
        ],
      };

      expect(hasPatternChanged(previous, current)).toBe(false);
    });

    it('detects dominant archetype changes', () => {
      const previous = {
        type: 'archetype' as const,
        timestamp: '2025-01-01T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [{ name: 'The Visionary', strength: 40, basedOn: [] }],
      };

      const current = {
        type: 'archetype' as const,
        timestamp: '2025-01-15T00:00:00Z',
        dominantArchetype: 'The Empath',
        archetypes: [{ name: 'The Empath', strength: 45, basedOn: [] }],
      };

      expect(hasPatternChanged(previous, current)).toBe(true);
    });

    it('treats null previous as changed', () => {
      const current = {
        type: 'archetype' as const,
        timestamp: '2025-01-15T00:00:00Z',
        dominantArchetype: 'The Visionary',
        archetypes: [{ name: 'The Visionary', strength: 40, basedOn: [] }],
      };

      expect(hasPatternChanged(null, current)).toBe(true);
    });
  });
});
