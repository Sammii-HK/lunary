/**
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';

jest.mock('@vercel/postgres', () => ({
  sql: jest.fn(),
}));

jest.mock('@/lib/ai/auth', () => ({
  requireUser: jest.fn(),
}));

jest.mock('@/lib/journal/dream-classifier', () => ({
  isDreamEntry: jest.fn(() => false),
}));

jest.mock('@/lib/analytics', () => ({
  conversionTracking: {
    dreamEntryCreated: jest.fn(),
    journalEntryCreated: jest.fn(),
  },
}));

jest.mock('@/lib/referrals/check-activation', () => ({
  checkInviteActivation: jest.fn(),
}));

jest.mock('@/lib/progress/server', () => ({
  incrementProgress: jest.fn(),
}));

import { POST } from '@/app/api/journal/route';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import { conversionTracking } from '@/lib/analytics';

const sqlMock = sql as unknown as jest.Mock;
const requireUserMock = requireUser as jest.Mock;

let jsonSpy: jest.SpyInstance;
let lastJsonCall: { data: any; init: any } | null = null;

function installJsonSpy() {
  lastJsonCall = null;
  jsonSpy = jest
    .spyOn(NextResponse, 'json')
    .mockImplementation((data: any, init?: any) => {
      lastJsonCall = { data, init };
      return { status: init?.status || 200 } as any;
    });
}

function makeRequest(body: Record<string, unknown>) {
  return new NextRequest('https://lunary.app/api/journal', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Journal API tarot source handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    installJsonSpy();
    requireUserMock.mockResolvedValue({ id: 'user-123' });
  });

  afterEach(() => {
    jsonSpy?.mockRestore();
  });

  it('returns an existing tarot journal entry when sourceMessageId already exists', async () => {
    const existingContent = {
      text: 'Existing tarot reflection',
      moodTags: ['clear'],
      cardReferences: ['The Star'],
      moonPhase: 'Waxing Crescent',
      transitHighlight: null,
      source: 'tarot',
      sourceMessageId: 'reading-abc',
    };

    sqlMock
      .mockResolvedValueOnce({
        rows: [{ status: 'active', plan_type: 'lunary_plus' }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 42,
            category: 'journal',
            content: existingContent,
            created_at: '2026-04-25T10:00:00.000Z',
          },
        ],
      });

    const response = await POST(
      makeRequest({
        content: 'New tarot reflection',
        source: 'tarot',
        sourceMessageId: ' reading-abc ',
      }),
    );

    expect(response.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(2);
    expect(lastJsonCall?.data).toEqual({
      success: true,
      deduped: true,
      entry: {
        id: 42,
        content: 'Existing tarot reflection',
        moodTags: ['clear'],
        cardReferences: ['The Star'],
        moonPhase: 'Waxing Crescent',
        transitHighlight: null,
        source: 'tarot',
        sourceMessageId: 'reading-abc',
        createdAt: '2026-04-25T10:00:00.000Z',
        category: 'journal',
      },
    });
    expect(conversionTracking.journalEntryCreated).not.toHaveBeenCalled();
  });

  it('stores trimmed tarot sourceMessageId in the inserted content payload', async () => {
    sqlMock
      .mockResolvedValueOnce({
        rows: [{ status: 'active', plan_type: 'lunary_plus' }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 43,
            category: 'journal',
            created_at: '2026-04-25T11:00:00.000Z',
          },
        ],
      });

    const response = await POST(
      makeRequest({
        content: ' Tarot reflection from a saved spread. ',
        moodTags: ['reflective'],
        cardReferences: ['The Moon'],
        moonPhase: 'Full Moon',
        transitHighlight: 'Moon trine Venus',
        source: 'tarot',
        sourceMessageId: ' spread-789 ',
      }),
    );

    expect(response.status).toBe(200);
    expect(sqlMock).toHaveBeenCalledTimes(3);

    const insertCall = sqlMock.mock.calls[2];
    const insertQueryText = insertCall[0].join('');
    expect(insertQueryText).toContain('INSERT INTO collections');

    const contentPayload = JSON.parse(insertCall[4]);
    expect(contentPayload).toEqual({
      text: 'Tarot reflection from a saved spread.',
      moodTags: ['reflective'],
      cardReferences: ['The Moon'],
      moonPhase: 'Full Moon',
      transitHighlight: 'Moon trine Venus',
      source: 'tarot',
      sourceMessageId: 'spread-789',
    });

    expect(lastJsonCall?.data.entry).toMatchObject({
      content: 'Tarot reflection from a saved spread.',
      source: 'tarot',
      sourceMessageId: 'spread-789',
      category: 'journal',
    });
    expect(conversionTracking.journalEntryCreated).toHaveBeenCalledWith(
      'user-123',
      expect.objectContaining({
        source: 'tarot',
        hasCardReferences: true,
        hasMoonPhase: true,
      }),
    );
  });
});
