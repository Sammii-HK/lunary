/**
 * @jest-environment node
 *
 * VITAL OP #16 - Anonymous chart-AI "taste" endpoint (#283).
 *
 * Source: src/app/api/ai/chart-taste/route.ts. This is the logged-out funnel
 * surface for the chart-aware Astral Guide. It reuses the hosted model but with
 * hard guardrails for an anonymous visitor:
 *   - A recognised-body allow-list: only known chart placements reach the
 *     prompt; anything else is dropped, and an all-unknown payload is a 400.
 *   - IP rate limiting: a per-minute burst guard AND a per-IP-per-24h question
 *     cap, both enforced server-side (the client cap cannot be bypassed).
 *   - No DB / threads / memory / usage rows for anonymous visitors - grounding
 *     is ONLY the placements posted in the request.
 *
 * Every heavy dependency (the model, the rate limiter, the astral-guide prompt,
 * the tokenizer, PostHog) is mocked, so there is no network, no DB, and no
 * non-determinism. We assert behaviour through the mocks' call args.
 */

// --- Mocks for all external deps (declared before importing the route) -------

const mockGenerateText = jest.fn();
jest.mock('ai', () => ({
  generateText: (...args: unknown[]) => mockGenerateText(...args),
}));

jest.mock('@/lib/ai/content-generator', () => ({
  getDeepInfraModel: jest.fn(() => 'mock-model'),
}));

// astral-guide's taste exports do not exist on the base branch yet; mock them.
const mockFormatTastePlacements = jest.fn(
  (placements: Array<{ body: string; sign: string }>) =>
    `GROUNDING:${placements.map((p) => `${p.body}=${p.sign}`).join(',')}`,
);
jest.mock('@/lib/ai/astral-guide', () => ({
  ASTRAL_GUIDE_PUBLIC_TASTE_PROMPT: 'SYSTEM_PROMPT',
  formatTastePlacements: (...args: unknown[]) =>
    mockFormatTastePlacements(...(args as [never])),
}));

const mockCheckRateLimit = jest.fn();
jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

jest.mock('@/lib/ai/tokenizer', () => ({
  estimateTokenCount: jest.fn(() => 42),
}));

const mockCaptureAIGeneration = jest.fn();
const mockCaptureEvent = jest.fn();
jest.mock('@/lib/posthog-server', () => ({
  captureAIGeneration: (...args: unknown[]) => mockCaptureAIGeneration(...args),
  captureEvent: (...args: unknown[]) => mockCaptureEvent(...args),
}));

import { readFileSync } from 'fs';
import { join } from 'path';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/chart-taste/route';

/** Build a POST NextRequest with a JSON body and optional IP header. */
function makeRequest(body: unknown, ip = '203.0.113.7'): NextRequest {
  return new NextRequest('https://lunary.app/api/ai/chart-taste', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

const validPlacements = [
  { body: 'Sun', sign: 'Leo', degree: '15' },
  { body: 'Moon', sign: 'Cancer' },
  { body: 'Ascendant', sign: 'Virgo' },
];

beforeEach(() => {
  jest.clearAllMocks();
  // Default: rate limiter always allows, model returns a usable answer.
  mockCheckRateLimit.mockReturnValue({ allowed: true, retryAfterMs: 0 });
  mockGenerateText.mockResolvedValue({ text: 'A warm, grounded reading.' });
});

describe('VITAL #16 chart-taste - request validation & body allow-list', () => {
  it('400s on a non-JSON body', async () => {
    const req = new NextRequest('https://lunary.app/api/ai/chart-taste', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('400s when the schema is violated (missing message)', async () => {
    const res = await POST(makeRequest({ placements: validPlacements }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid request');
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('400s when placements is empty (schema min(1))', async () => {
    const res = await POST(makeRequest({ message: 'hi', placements: [] }));
    expect(res.status).toBe(400);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('drops unrecognised bodies and only grounds on allow-listed placements', async () => {
    const res = await POST(
      makeRequest({
        message: 'What about me?',
        placements: [
          { body: 'Sun', sign: 'Leo' },
          { body: 'IgnoreThis', sign: 'Nowhere' }, // not in the allow-list
          { body: 'DROP TABLE', sign: 'Evil' }, // injection-style smuggling
          { body: 'Moon', sign: 'Cancer' },
        ],
      }),
    );
    expect(res.status).toBe(200);
    // Only Sun + Moon should have reached the grounding formatter.
    expect(mockFormatTastePlacements).toHaveBeenCalledTimes(1);
    const grounded = mockFormatTastePlacements.mock.calls[0][0] as Array<{
      body: string;
    }>;
    expect(grounded.map((p) => p.body)).toEqual(['Sun', 'Moon']);

    // The provenance echoed back also contains only the allow-listed bodies.
    const json = await res.json();
    expect(json.provenance.map((p: { body: string }) => p.body)).toEqual([
      'Sun',
      'Moon',
    ]);
  });

  it('400s when every supplied placement is outside the allow-list', async () => {
    const res = await POST(
      makeRequest({
        message: 'hi',
        placements: [
          { body: 'Bogus', sign: 'Leo' },
          { body: 'AlsoBogus', sign: 'Cancer' },
        ],
      }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('No valid chart placements provided.');
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('accepts the full set of recognised chart bodies', async () => {
    const bodies = [
      'Sun',
      'Moon',
      'Ascendant',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Midheaven',
      'Uranus',
      'Neptune',
      'Pluto',
      'Chiron',
      'North Node',
      'South Node',
    ].slice(0, 20);
    const res = await POST(
      makeRequest({
        message: 'read me',
        placements: bodies.map((b) => ({ body: b, sign: 'Aries' })),
      }),
    );
    expect(res.status).toBe(200);
    const grounded = mockFormatTastePlacements.mock.calls[0][0] as Array<{
      body: string;
    }>;
    expect(grounded).toHaveLength(bodies.length);
  });
});

describe('VITAL #16 chart-taste - IP rate limiting', () => {
  it('checks the per-minute burst guard before the daily cap', async () => {
    await POST(makeRequest({ message: 'hi', placements: validPlacements }));
    // First call must be the burst window (60_000ms, limit 6), second the daily.
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('chart-taste:burst:'),
      6,
      60 * 1000,
    );
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('chart-taste:daily:'),
      3,
      24 * 60 * 60 * 1000,
    );
  });

  it('keys the rate limit on the first x-forwarded-for IP', async () => {
    await POST(
      makeRequest(
        { message: 'hi', placements: validPlacements },
        '198.51.100.9, 10.0.0.1',
      ),
    );
    expect(mockCheckRateLimit).toHaveBeenNthCalledWith(
      1,
      'chart-taste:burst:198.51.100.9',
      6,
      60 * 1000,
    );
  });

  it('429s on the burst guard and never calls the daily cap or the model', async () => {
    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      retryAfterMs: 5000,
    });
    const res = await POST(
      makeRequest({ message: 'hi', placements: validPlacements }),
    );
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('5');
    // Only the burst check ran; daily cap and model were skipped.
    expect(mockCheckRateLimit).toHaveBeenCalledTimes(1);
    expect(mockGenerateText).not.toHaveBeenCalled();
  });

  it('429s with capReached + limit when the daily cap is exhausted', async () => {
    mockCheckRateLimit
      .mockReturnValueOnce({ allowed: true, retryAfterMs: 0 }) // burst ok
      .mockReturnValueOnce({ allowed: false, retryAfterMs: 7200000 }); // daily hit
    const res = await POST(
      makeRequest({ message: 'hi', placements: validPlacements }),
    );
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.capReached).toBe(true);
    expect(json.limit).toBe(3);
    expect(res.headers.get('Retry-After')).toBe('7200'); // ms -> seconds
    expect(mockGenerateText).not.toHaveBeenCalled();
  });
});

describe('VITAL #16 chart-taste - anonymous: no DB / memory, telemetry only', () => {
  it('grounds ONLY on the request placements and a fixed anon distinct id', async () => {
    const res = await POST(
      makeRequest({
        message: 'tell me about my chart',
        placements: validPlacements,
        source: 'free_chart_hero',
      }),
    );
    expect(res.status).toBe(200);

    // The system prompt is the static taste prompt + the request-derived
    // grounding only - no external/user data is fetched.
    const call = mockGenerateText.mock.calls[0][0] as {
      system: string;
      maxOutputTokens: number;
    };
    expect(call.system).toContain('SYSTEM_PROMPT');
    expect(call.system).toContain('GROUNDING:Sun=Leo');
    expect(call.maxOutputTokens).toBe(320);

    // Telemetry uses an anonymous distinct id - never a user id - and no DB
    // write helper is even imported by the route.
    expect(mockCaptureAIGeneration).toHaveBeenCalledWith(
      expect.objectContaining({ distinctId: 'anon-public-chart-taste' }),
    );
    expect(mockCaptureEvent).toHaveBeenCalledWith(
      'anon-public-chart-taste',
      'public_chart_taste_answered',
      expect.objectContaining({ source: 'free_chart_hero' }),
    );
  });

  it('defaults the telemetry source to free_chart when none is supplied', async () => {
    await POST(makeRequest({ message: 'hi', placements: validPlacements }));
    expect(mockCaptureEvent).toHaveBeenCalledWith(
      'anon-public-chart-taste',
      'public_chart_taste_answered',
      expect.objectContaining({ source: 'free_chart' }),
    );
  });

  it('503s (no crash) when the model returns an empty answer', async () => {
    mockGenerateText.mockResolvedValueOnce({ text: '   ' });
    const res = await POST(
      makeRequest({ message: 'hi', placements: validPlacements }),
    );
    expect(res.status).toBe(503);
    // No "answered" event for a non-answer.
    expect(mockCaptureEvent).not.toHaveBeenCalled();
  });

  it('503s (no crash) when the model throws', async () => {
    mockGenerateText.mockRejectedValueOnce(new Error('upstream down'));
    const res = await POST(
      makeRequest({ message: 'hi', placements: validPlacements }),
    );
    expect(res.status).toBe(503);
    const json = await res.json();
    expect(json.error).toMatch(/unavailable/i);
  });

  it('does not import any database client at module scope', () => {
    // Guardrail: the anonymous route must stay DB-free. Read its source and
    // assert it pulls in none of the usual persistence entry points.
    const src = readFileSync(
      join(process.cwd(), 'src/app/api/ai/chart-taste/route.ts'),
      'utf8',
    );
    expect(src).not.toMatch(/from '@\/lib\/db/);
    expect(src).not.toMatch(/from '@\/lib\/prisma/);
    expect(src).not.toMatch(/PrismaClient/);
    expect(src).not.toMatch(/drizzle/i);
  });
});
