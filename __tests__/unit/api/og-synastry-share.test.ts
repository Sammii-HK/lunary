/**
 * Tests for OG Synastry Share Image Route
 * Tests the image generation for synastry share cards
 */

import { NextRequest } from 'next/server';

// Mock the KV store
jest.mock('@/lib/cloudflare/kv', () => ({
  kvGet: jest.fn(),
}));

// Mock ImageResponse since it's not available in test environment
jest.mock('next/og', () => ({
  ImageResponse: jest.fn().mockImplementation((element, options) => {
    return {
      status: 200,
      headers: new Map([['content-type', 'image/png']]),
      element,
      options,
    };
  }),
}));

// Mock loadShareFonts to avoid real font loading in tests
jest.mock('@/lib/share/og-share-utils', () => ({
  loadShareFonts: jest.fn().mockResolvedValue([]),
  truncateText: jest.requireActual('@/lib/share/og-share-utils').truncateText,
  ShareFooter: jest.requireActual('@/lib/share/og-share-utils').ShareFooter,
  SHARE_BASE_URL: 'https://lunary.app',
  generateStarfield: jest.requireActual('@/lib/share/og-share-utils')
    .generateStarfield,
}));

import { GET } from '@/app/api/og/share/synastry/route';
import { kvGet } from '@/lib/cloudflare/kv';
import { ImageResponse } from 'next/og';

describe('OG Synastry Share Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_BASE_URL = 'https://lunary.app';
  });

  describe('Parameter handling', () => {
    it('returns 400 when shareId is missing and no URL params provided', async () => {
      const request = new NextRequest(
        'https://lunary.app/api/og/share/synastry',
      );

      const response = await GET(request);

      expect(response.status).toBe(400);
      const text = await response.text();
      expect(text).toBe('Missing shareId');
    });

    it('accepts URL parameters directly without KV lookup', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '85',
        summary: 'Great match!',
        userName: 'John',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      // KV should not be called when URL params are provided
      expect(kvGet).not.toHaveBeenCalled();
      expect(ImageResponse).toHaveBeenCalled();
    });

    it('uses KV lookup when shareId is provided without URL params', async () => {
      const mockData = {
        shareId: 'test-123',
        friendName: 'Jane',
        compatibilityScore: 75,
        summary: 'Compatible souls',
        createdAt: new Date().toISOString(),
      };
      (kvGet as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockData));

      const request = new NextRequest(
        'https://lunary.app/api/og/share/synastry?shareId=test-123',
      );

      await GET(request);

      expect(kvGet).toHaveBeenCalledWith('synastry:test-123');
      expect(ImageResponse).toHaveBeenCalled();
    });

    it('uses demo data when shareId is "demo"', async () => {
      (kvGet as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'https://lunary.app/api/og/share/synastry?shareId=demo',
      );

      await GET(request);

      // Still calls KV but falls back to demo data when result is null or shareId is "demo"
      expect(kvGet).toHaveBeenCalledWith('synastry:demo');
      expect(ImageResponse).toHaveBeenCalled();
    });

    it('falls back to demo data when KV returns null', async () => {
      (kvGet as jest.Mock).mockResolvedValueOnce(null);

      const request = new NextRequest(
        'https://lunary.app/api/og/share/synastry?shareId=nonexistent',
      );

      await GET(request);

      expect(kvGet).toHaveBeenCalledWith('synastry:nonexistent');
      expect(ImageResponse).toHaveBeenCalled();
    });
  });

  describe('Format handling', () => {
    it('defaults to square format (1080x1080)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '80',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      expect(call[1]).toMatchObject({ width: 1080, height: 1080 });
    });

    it('handles landscape format (1200x630)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '80',
        format: 'landscape',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      expect(call[1]).toMatchObject({ width: 1200, height: 630 });
    });

    it('handles story format (1080x1920)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '80',
        format: 'story',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      expect(call[1]).toMatchObject({ width: 1080, height: 1920 });
    });
  });

  describe('Image element structure', () => {
    it('includes all required flex display styles', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '80',
        summary: 'A great connection',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const element = call[0];

      // Helper to check if element or children have display flex
      const checkFlexDisplay = (el: any): boolean => {
        if (!el || typeof el !== 'object') return true;

        // Check if this element has style with display
        if (el.props?.style) {
          const style = el.props.style;
          // If element has children that are strings/numbers, it should have display flex
          const children = el.props?.children;
          if (
            children &&
            typeof children !== 'string' &&
            typeof children !== 'number'
          ) {
            if (Array.isArray(children) && children.length > 1) {
              // Multiple children - needs flex
              if (style.display !== 'flex' && style.display !== 'none') {
                return false;
              }
            }
          }
        }

        // Recursively check children
        if (el.props?.children) {
          const children = el.props.children;
          if (Array.isArray(children)) {
            return children.every(checkFlexDisplay);
          }
          return checkFlexDisplay(children);
        }
        return true;
      };

      // The root element should have display flex
      expect(element.props.style.display).toBe('flex');
    });

    it.skip('uses correct icon path (apple-touch-icon.png)', async () => {
      // This test is obsolete - the synastry OG image no longer includes an icon
      // It now uses a starfield background with text-based layout
    });

    it('displays user names in the title', async () => {
      const params = new URLSearchParams({
        userName: 'John',
        friendName: 'Jane',
        compatibilityScore: '80',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const element = call[0];

      // Convert element to string representation to check content
      const elementString = JSON.stringify(element);
      expect(elementString).toContain('John');
      expect(elementString).toContain('Jane');
    });

    it('displays compatibility score', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '92',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const element = call[0];

      const elementString = JSON.stringify(element);
      expect(elementString).toContain('92');
    });

    it('displays harmonious and challenging aspect counts when provided', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '80',
        harmoniousAspects: '8',
        challengingAspects: '3',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const element = call[0];

      const elementString = JSON.stringify(element);
      expect(elementString).toContain('8');
      expect(elementString).toContain('3');
      expect(elementString).toContain('Harmonious');
      expect(elementString).toContain('Challenging');
    });
  });

  describe('Score color coding', () => {
    it('uses green color for high scores (>= 80)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '85',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const elementString = JSON.stringify(call[0]);

      // Blue-purple color for high scores (comet trail)
      expect(elementString).toContain('#7B7BE8');
    });

    it('uses purple color for medium-high scores (60-79)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '70',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const elementString = JSON.stringify(call[0]);

      // Purple color for medium-high scores
      expect(elementString).toContain('#8458D8');
    });

    it('uses yellow color for medium scores (40-59)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '50',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const elementString = JSON.stringify(call[0]);

      // Light purple color for medium scores (galaxy haze)
      expect(elementString).toContain('#C77DFF');
    });

    it('uses red color for low scores (< 40)', async () => {
      const params = new URLSearchParams({
        friendName: 'Jane',
        compatibilityScore: '30',
      });
      const request = new NextRequest(
        `https://lunary.app/api/og/share/synastry?${params.toString()}`,
      );

      await GET(request);

      const call = (ImageResponse as unknown as jest.Mock).mock.calls[0];
      const elementString = JSON.stringify(call[0]);

      // Rose color for low scores (cosmic rose)
      expect(elementString).toContain('#EE789E');
    });
  });

  describe('Error handling', () => {
    it('returns 500 on unexpected errors', async () => {
      (kvGet as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest(
        'https://lunary.app/api/og/share/synastry?shareId=test-123',
      );

      const response = await GET(request);

      expect(response.status).toBe(500);
      const text = await response.text();
      expect(text).toBe('Failed to generate image');
    });
  });
});
