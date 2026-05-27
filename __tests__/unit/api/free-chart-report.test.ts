/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/free-chart-report/route';
import { checkRateLimit } from '@/lib/api/rate-limit';
import { generateBirthChartWithHouses } from 'utils/astrology/birthChart';

jest.mock('@/lib/api/rate-limit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, retryAfterMs: 0 })),
}));

jest.mock('utils/astrology/birthChart', () => ({
  generateBirthChartWithHouses: jest.fn(),
}));

const generateBirthChartWithHousesMock =
  generateBirthChartWithHouses as jest.MockedFunction<
    typeof generateBirthChartWithHouses
  >;
const checkRateLimitMock = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;

function makeRequest(body: unknown) {
  return new NextRequest('https://lunary.app/api/free-chart-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '203.0.113.24',
    },
    body: JSON.stringify(body),
  });
}

function mockChart() {
  return {
    planets: [
      {
        body: 'Sun',
        sign: 'Gemini',
        degree: 12,
        minute: 15,
        eclipticLongitude: 72.25,
        retrograde: false,
        house: 9,
      },
      {
        body: 'Moon',
        sign: 'Cancer',
        degree: 5,
        minute: 41,
        eclipticLongitude: 95.68,
        retrograde: false,
        house: 10,
      },
      {
        body: 'Ascendant',
        sign: 'Libra',
        degree: 1,
        minute: 7,
        eclipticLongitude: 181.12,
        retrograde: false,
        house: 1,
      },
      {
        body: 'Mercury',
        sign: 'Gemini',
        degree: 20,
        minute: 3,
        eclipticLongitude: 80.05,
        retrograde: false,
        house: 9,
      },
      {
        body: 'Venus',
        sign: 'Taurus',
        degree: 27,
        minute: 44,
        eclipticLongitude: 57.73,
        retrograde: false,
        house: 8,
      },
      {
        body: 'Mars',
        sign: 'Aries',
        degree: 4,
        minute: 9,
        eclipticLongitude: 4.15,
        retrograde: false,
        house: 7,
      },
      {
        body: 'Jupiter',
        sign: 'Leo',
        degree: 2,
        minute: 30,
        eclipticLongitude: 122.5,
        retrograde: false,
        house: 11,
      },
      {
        body: 'Saturn',
        sign: 'Pisces',
        degree: 29,
        minute: 2,
        eclipticLongitude: 359.03,
        retrograde: false,
        house: 6,
      },
      {
        body: 'Midheaven',
        sign: 'Cancer',
        degree: 12,
        minute: 0,
        eclipticLongitude: 102,
        retrograde: false,
        house: 10,
      },
    ],
    houses: [
      {
        house: 1,
        sign: 'Libra',
        degree: 0,
        minute: 0,
        eclipticLongitude: 180,
      },
      {
        house: 2,
        sign: 'Scorpio',
        degree: 0,
        minute: 0,
        eclipticLongitude: 210,
      },
      {
        house: 3,
        sign: 'Sagittarius',
        degree: 0,
        minute: 0,
        eclipticLongitude: 240,
      },
      {
        house: 4,
        sign: 'Capricorn',
        degree: 0,
        minute: 0,
        eclipticLongitude: 270,
      },
      {
        house: 5,
        sign: 'Aquarius',
        degree: 0,
        minute: 0,
        eclipticLongitude: 300,
      },
      {
        house: 6,
        sign: 'Pisces',
        degree: 0,
        minute: 0,
        eclipticLongitude: 330,
      },
      {
        house: 7,
        sign: 'Aries',
        degree: 0,
        minute: 0,
        eclipticLongitude: 0,
      },
      {
        house: 8,
        sign: 'Taurus',
        degree: 0,
        minute: 0,
        eclipticLongitude: 30,
      },
      {
        house: 9,
        sign: 'Gemini',
        degree: 0,
        minute: 0,
        eclipticLongitude: 60,
      },
      {
        house: 10,
        sign: 'Cancer',
        degree: 0,
        minute: 0,
        eclipticLongitude: 90,
      },
      {
        house: 11,
        sign: 'Leo',
        degree: 0,
        minute: 0,
        eclipticLongitude: 120,
      },
      {
        house: 12,
        sign: 'Virgo',
        degree: 0,
        minute: 0,
        eclipticLongitude: 150,
      },
    ],
  };
}

describe('POST /api/free-chart-report', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    checkRateLimitMock.mockReturnValue({ allowed: true, retryAfterMs: 0 });
    generateBirthChartWithHousesMock.mockResolvedValue(mockChart());
  });

  it('rejects invalid payloads before generating a chart', async () => {
    const response = await POST(makeRequest({ birthDate: 'nope' }));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid input');
    expect(generateBirthChartWithHousesMock).not.toHaveBeenCalled();
  });

  it('returns a chart-ready preview with chart ruler and signup handoff', async () => {
    const response = await POST(
      makeRequest({
        name: 'Sam',
        birthDate: '1992-06-12',
        birthTime: '09:30',
        birthLocation: 'London, UK',
        campaignKey: 'ig-comment-where',
        keyword: 'WHERE',
        source: 'instagram_reel',
        focusTitle: 'Sun conjunct Uranus in Gemini',
        focusSign: 'Gemini',
        focusPlanet: 'Sun',
        focusDate: '2026-05-23',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(generateBirthChartWithHousesMock).toHaveBeenCalledWith(
      '1992-06-12',
      '09:30',
      'London, UK',
      undefined,
    );
    expect(data).toEqual(
      expect.objectContaining({
        schemaVersion: '2026-05-23.4',
        greeting: 'Sam, start here.',
        campaignKey: 'ig-comment-where',
        accuracy: expect.objectContaining({
          level: 'chart-ready-preview',
          hasBirthTime: true,
        }),
        chartRuler: expect.objectContaining({
          planet: 'Venus',
          sign: 'Taurus',
          house: 8,
        }),
        leadCapture: expect.objectContaining({
          emailTag: 'lead:transit-house-check',
          source: 'instagram_reel',
        }),
        focus: expect.objectContaining({
          title: 'Sun conjunct Uranus in Gemini',
          sign: 'Gemini',
          planet: 'Sun',
          date: '2026-05-23',
          house: 9,
          houseTheme: 'belief, travel, study, publishing, and wider meaning',
        }),
      }),
    );
    expect(data.placements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          body: 'Ascendant',
          sign: 'Libra',
          house: 1,
        }),
      ]),
    );
    expect(data.signupUrl).toContain('/signup/chart?');
    expect(data.signupUrl).toContain('birthLocation=London%2C+UK');
    expect(data.signupUrl).toContain('keyword=WHERE');
  });

  it('returns a rising sign unlock when the RISING keyword is used', async () => {
    const response = await POST(
      makeRequest({
        birthDate: '1992-06-12',
        birthTime: '09:30',
        birthLocation: 'London, UK',
        keyword: 'RISING',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leadCapture).toEqual(
      expect.objectContaining({
        emailTag: 'lead:rising-sign',
        source: 'rising_sign_unlock',
      }),
    );
    expect(data.risingUnlock).toEqual(
      expect.objectContaining({
        label: 'rising sign unlock',
        title: 'Libra rising',
        sign: 'Libra',
        house: 1,
        chartRuler: 'Venus',
        chartRulerSign: 'Taurus',
        chartRulerHouse: 8,
      }),
    );
    expect(data.risingUnlock.note).toContain('front door of your chart');
    expect(data.signupUrl).toContain('keyword=RISING');
  });

  it('returns a personal transit card when the SAVE keyword has event context', async () => {
    const response = await POST(
      makeRequest({
        birthDate: '1992-06-12',
        birthTime: '09:30',
        birthLocation: 'London, UK',
        keyword: 'SAVE',
        focusTitle: 'Sun conjunct Uranus in Gemini',
        focusSign: 'Gemini',
        focusPlanet: 'Sun',
        focusDate: '2026-05-23',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leadCapture.emailTag).toBe('lead:personal-transit-card');
    expect(data.focus.house).toBe(9);
    expect(data.personalTransitCard).toEqual(
      expect.objectContaining({
        label: 'personal transit card',
        title: 'Sun conjunct Uranus in Gemini',
        sign: 'Gemini',
        planet: 'Sun',
        date: '2026-05-23',
        house: 9,
        houseTheme: 'belief, travel, study, publishing, and wider meaning',
      }),
    );
    expect(data.personalTransitCard.watchFor).toContain('belief');
    expect(data.personalTransitCard.tryThis).toContain('idea');
    expect(data.personalTransitCard.journalPrompt).toContain('belief');
  });

  it('returns an honest partial preview when birth time is missing', async () => {
    const response = await POST(
      makeRequest({
        birthDate: '1992-06-12',
        birthLocation: 'London, UK',
        focusTitle: 'Sun conjunct Uranus in Gemini',
        focusSign: 'Gemini',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accuracy.level).toBe('partial-date-preview');
    expect(data.accuracy.hasBirthTime).toBe(false);
    expect(
      data.placements.map((placement: { body: string }) => placement.body),
    ).not.toContain('Ascendant');
    expect(
      data.placements.map((placement: { body: string }) => placement.body),
    ).not.toContain('Midheaven');
    expect(data.focus).toEqual(
      expect.objectContaining({
        title: 'Sun conjunct Uranus in Gemini',
        sign: 'Gemini',
        house: null,
        houseTheme: null,
      }),
    );
    expect(data.focus.note).toContain('Add birth time');
    expect(data.signupUrl).not.toContain('birthTime=');
  });

  it('explains that rising sign needs birth time when time is missing', async () => {
    const response = await POST(
      makeRequest({
        birthDate: '1992-06-12',
        birthLocation: 'London, UK',
        keyword: 'RISING',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leadCapture.emailTag).toBe('lead:rising-sign');
    expect(data.risingUnlock).toEqual(
      expect.objectContaining({
        title: 'Add birth time to unlock your rising sign',
        sign: null,
        chartRuler: null,
      }),
    );
    expect(data.risingUnlock.note).toContain('changes through the day');
  });

  it('rate limits repeated requests from the same IP key', async () => {
    checkRateLimitMock.mockReturnValueOnce({
      allowed: false,
      retryAfterMs: 10 * 60 * 1000,
    });

    const response = await POST(
      makeRequest({
        birthDate: '1992-06-12',
        birthLocation: 'London, UK',
      }),
    );
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe('Too many requests. Please try again later.');
    expect(checkRateLimitMock).toHaveBeenCalledWith(
      'free-chart-report:203.0.113.24',
      8,
      10 * 60 * 1000,
    );
    expect(generateBirthChartWithHousesMock).not.toHaveBeenCalled();
  });
});
