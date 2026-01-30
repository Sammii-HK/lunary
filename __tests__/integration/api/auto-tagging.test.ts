import { NextRequest } from 'next/server';
import { POST } from '@/app/api/collections/route';
import { sql } from '@vercel/postgres';

// Mock dependencies
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('@/lib/journal/mood-detector', () => ({
  detectMoods: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

describe.skip('Auto-Tagging Integration', () => {
  const mockAuth = require('@/lib/auth').auth;
  const mockDetectMoods = require('@/lib/journal/mood-detector').detectMoods;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Journal creation with auto-tagging', () => {
    it('should auto-tag moods for free users using keyword detection', async () => {
      // Mock authenticated user (free plan)
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'free@example.com',
        },
        session: { id: 'session-123' },
      });

      // Mock user profile query (free plan)
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-123',
            plan_type: 'free',
            username: 'freeuser',
          },
        ],
      });

      // Mock mood detection (keyword method)
      mockDetectMoods.mockResolvedValue({
        moods: ['joyful', 'grateful'],
        method: 'keyword',
        confidence: 0.8,
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-123',
            user_id: 'user-123',
            category: 'journal',
            content: {
              text: 'I feel joyful and grateful today!',
              moodTags: ['joyful', 'grateful'],
              autoTagged: true,
              tagMethod: 'keyword',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'I feel joyful and grateful today!',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(mockDetectMoods).toHaveBeenCalledWith(
        'I feel joyful and grateful today!',
        false, // keyword detection for free users
      );

      expect(data.content.moodTags).toContain('joyful');
      expect(data.content.moodTags).toContain('grateful');
      expect(data.content.autoTagged).toBe(true);
      expect(data.content.tagMethod).toBe('keyword');
    });

    it('should use AI fallback for Pro users when keyword fails', async () => {
      // Mock authenticated user (Pro plan)
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-pro',
          email: 'pro@example.com',
        },
        session: { id: 'session-pro' },
      });

      // Mock user profile query (Pro AI plan)
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-pro',
            plan_type: 'lunary_plus_ai',
            username: 'prouser',
          },
        ],
      });

      // Mock keyword detection - no moods found
      mockDetectMoods.mockResolvedValueOnce({
        moods: [],
        method: 'keyword',
        confidence: 0,
      });

      // Mock AI detection fallback
      mockDetectMoods.mockResolvedValueOnce({
        moods: ['contemplative', 'melancholic'],
        method: 'ai',
        confidence: 0.85,
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-456',
            user_id: 'user-pro',
            category: 'journal',
            content: {
              text: 'Today I pondered the ephemeral nature of existence...',
              moodTags: ['contemplative', 'melancholic'],
              autoTagged: true,
              tagMethod: 'ai',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'Today I pondered the ephemeral nature of existence...',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // First call: keyword detection
      expect(mockDetectMoods).toHaveBeenNthCalledWith(
        1,
        'Today I pondered the ephemeral nature of existence...',
        false,
      );

      // Second call: AI fallback
      expect(mockDetectMoods).toHaveBeenNthCalledWith(
        2,
        'Today I pondered the ephemeral nature of existence...',
        true,
      );

      expect(data.content.moodTags).toContain('contemplative');
      expect(data.content.moodTags).toContain('melancholic');
      expect(data.content.autoTagged).toBe(true);
      expect(data.content.tagMethod).toBe('ai');
    });

    it('should not use AI for free users even when keyword fails', async () => {
      // Mock authenticated user (free plan)
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-free',
          email: 'free@example.com',
        },
        session: { id: 'session-free' },
      });

      // Mock user profile query (free plan)
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-free',
            plan_type: 'free',
            username: 'freeuser',
          },
        ],
      });

      // Mock keyword detection - no moods found
      mockDetectMoods.mockResolvedValue({
        moods: [],
        method: 'keyword',
        confidence: 0,
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-789',
            user_id: 'user-free',
            category: 'journal',
            content: {
              text: 'Complex emotional text without obvious keywords...',
              // No moodTags added
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'Complex emotional text without obvious keywords...',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should only call keyword detection once
      expect(mockDetectMoods).toHaveBeenCalledTimes(1);
      expect(mockDetectMoods).toHaveBeenCalledWith(
        'Complex emotional text without obvious keywords...',
        false,
      );

      // No mood tags added
      expect(data.content.moodTags).toBeUndefined();
    });

    it('should handle annual Pro AI plan', async () => {
      // Mock authenticated user (annual Pro AI plan)
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-annual',
          email: 'annual@example.com',
        },
        session: { id: 'session-annual' },
      });

      // Mock user profile query (annual Pro AI plan)
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-annual',
            plan_type: 'lunary_plus_ai_annual',
            username: 'annualuser',
          },
        ],
      });

      // Mock keyword detection - no moods
      mockDetectMoods.mockResolvedValueOnce({
        moods: [],
        method: 'keyword',
        confidence: 0,
      });

      // Mock AI detection
      mockDetectMoods.mockResolvedValueOnce({
        moods: ['hopeful', 'energized'],
        method: 'ai',
        confidence: 0.9,
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-annual',
            user_id: 'user-annual',
            category: 'journal',
            content: {
              text: 'Complex text...',
              moodTags: ['hopeful', 'energized'],
              autoTagged: true,
              tagMethod: 'ai',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'Complex text...',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should use AI fallback for annual plan
      expect(mockDetectMoods).toHaveBeenCalledTimes(2);
      expect(data.content.tagMethod).toBe('ai');
    });

    it('should not auto-tag non-journal entries', async () => {
      // Mock authenticated user
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        session: { id: 'session-123' },
      });

      // Mock user profile query
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-123',
            plan_type: 'lunary_plus_ai',
            username: 'user123',
          },
        ],
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-other',
            user_id: 'user-123',
            category: 'tarot',
            content: {
              card: 'The Fool',
              notes: 'Interesting reading',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'tarot',
          content: {
            card: 'The Fool',
            notes: 'Interesting reading',
          },
        }),
      });

      const response = await POST(request);

      // Should not call mood detection for non-journal entries
      expect(mockDetectMoods).not.toHaveBeenCalled();
    });

    it('should not auto-tag journal entries without text', async () => {
      // Mock authenticated user
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        session: { id: 'session-123' },
      });

      // Mock user profile query
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-123',
            plan_type: 'lunary_plus_ai',
            username: 'user123',
          },
        ],
      });

      // Mock collection insert
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-no-text',
            user_id: 'user-123',
            category: 'journal',
            content: {
              // No text field
              image: 'image-url.jpg',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            image: 'image-url.jpg',
          },
        }),
      });

      const response = await POST(request);

      // Should not call mood detection without text
      expect(mockDetectMoods).not.toHaveBeenCalled();
    });
  });

  describe('Cost optimization', () => {
    it('should minimize AI usage by trying keywords first', async () => {
      // Mock Pro user
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-pro',
          email: 'pro@example.com',
        },
        session: { id: 'session-pro' },
      });

      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-pro',
            plan_type: 'lunary_plus_ai',
            username: 'prouser',
          },
        ],
      });

      // Keyword detection finds moods (success)
      mockDetectMoods.mockResolvedValue({
        moods: ['joyful', 'grateful'],
        method: 'keyword',
        confidence: 0.8,
      });

      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-cost',
            user_id: 'user-pro',
            category: 'journal',
            content: {
              text: 'I feel joyful and grateful!',
              moodTags: ['joyful', 'grateful'],
              autoTagged: true,
              tagMethod: 'keyword',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'I feel joyful and grateful!',
          },
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Should only call keyword detection once (no AI fallback needed)
      expect(mockDetectMoods).toHaveBeenCalledTimes(1);
      expect(data.content.tagMethod).toBe('keyword');
      // Cost: $0 (no AI API calls)
    });
  });

  describe('Error handling', () => {
    it('should handle mood detection errors gracefully', async () => {
      mockAuth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'user@example.com',
        },
        session: { id: 'session-123' },
      });

      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'user-123',
            plan_type: 'free',
            username: 'user123',
          },
        ],
      });

      // Mock detection error
      mockDetectMoods.mockRejectedValue(new Error('Detection failed'));

      // Should still create entry without mood tags
      (sql as jest.Mock).mockResolvedValueOnce({
        rows: [
          {
            id: 'collection-error',
            user_id: 'user-123',
            category: 'journal',
            content: {
              text: 'Entry text',
            },
            created_at: new Date(),
          },
        ],
      });

      const request = new NextRequest('http://localhost:3000/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          category: 'journal',
          content: {
            text: 'Entry text',
          },
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      // Entry created without mood tags
    });
  });
});
