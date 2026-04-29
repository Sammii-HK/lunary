/**
 * GET /api/og/cosmic-identity?handle=...
 *
 * Renders the share card for the public `/me/{handle}` page as a 1200x630
 * Open Graph image. Edge runtime, deterministic output, allow-listed
 * handle so the URL never participates in SSRF.
 *
 * Layout:
 *   - Dark cosmic gradient background with vignette
 *   - Top: "@handle" + display name
 *   - Centre: three big sign glyphs side-by-side, each labelled
 *     SUN / MOON / RISING with element-coloured glyph
 *   - Bottom: Lunary wordmark + tagline ("your daily astrology companion")
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

import { getUserSigns } from '@/lib/community/get-user-signs';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const runtime = 'edge';

const HANDLE_REGEX = /^[a-z0-9-]{3,30}$/;

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

const ELEMENT_COLOR: Record<string, string> = {
  Fire: '#EE789E', // lunary-rose
  Earth: '#5BB98B', // lunary-success
  Air: '#D4A574', // lunary-accent
  Water: '#8458D8', // lunary-primary
};

function elementColor(sign: string | null): string {
  if (!sign || !SIGN_ELEMENTS[sign]) return '#8458D8';
  return ELEMENT_COLOR[SIGN_ELEMENTS[sign]];
}

function glyphFor(sign: string | null): string {
  if (!sign) return '\u2728';
  return SIGN_GLYPHS[sign] ?? '\u2728';
}

interface UserRow {
  id: string;
  name: string | null;
}

interface ProfileRow {
  birth_chart: unknown;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawHandle = (searchParams.get('handle') || '').toLowerCase();

  // Strict allow-list — refuse anything outside the handle alphabet so the
  // DB query is never built from arbitrary user input.
  const handle = HANDLE_REGEX.test(rawHandle) ? rawHandle : null;

  let displayName: string | null = null;
  let sunSign: string | null = null;
  let moonSign: string | null = null;
  let risingSign: string | null = null;

  if (handle) {
    try {
      const userRes = await sql<UserRow>`
        SELECT id, name FROM "user"
        WHERE public_handle = ${handle}
        LIMIT 1
      `;
      const user = userRes.rows[0];
      if (user) {
        displayName = user.name;
        const profileRes = await sql<ProfileRow>`
          SELECT birth_chart FROM user_profiles
          WHERE user_id = ${user.id}
          LIMIT 1
        `;
        const chart = profileRes.rows[0]?.birth_chart;
        const arr = Array.isArray(chart) ? (chart as BirthChartData[]) : [];
        const signs = getUserSigns(arr as Parameters<typeof getUserSigns>[0]);
        sunSign = signs.sunSign;
        moonSign = signs.moonSign;
        risingSign = signs.risingSign;
      }
    } catch {
      // fall through to the empty card
    }
  }

  const safeHandleDisplay = handle || 'lunary';
  const heading = displayName || `@${safeHandleDisplay}`;
  const subhead = displayName ? `@${safeHandleDisplay}` : 'Cosmic identity';

  const bigThree: Array<{ label: string; sign: string | null }> = [
    { label: 'SUN', sign: sunSign },
    { label: 'MOON', sign: moonSign },
    { label: 'RISING', sign: risingSign },
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(135deg, #1a0f2e 0%, #0a0a14 50%, #2a0f1f 100%)',
        padding: 64,
        position: 'relative',
        fontFamily: 'sans-serif',
        color: '#F7F3FF',
      }}
    >
      {/* Vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 30% 0%, rgba(132,88,216,0.35) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 80% 100%, rgba(238,120,158,0.25) 0%, rgba(0,0,0,0) 55%)',
        }}
      />

      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: '#9B8BC9',
          }}
        >
          Cosmic identity
        </span>
        <span
          style={{
            fontSize: 72,
            fontWeight: 300,
            marginTop: 8,
            color: '#F7F3FF',
            display: 'flex',
          }}
        >
          {heading}
        </span>
        <span
          style={{
            fontSize: 26,
            marginTop: 6,
            color: '#9B8BC9',
            display: 'flex',
          }}
        >
          {subhead}
        </span>
      </div>

      {/* Big Three row */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 36,
          marginTop: 56,
          zIndex: 1,
          justifyContent: 'space-between',
        }}
      >
        {bigThree.map((entry) => {
          const color = elementColor(entry.sign);
          return (
            <div
              key={entry.label}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 28,
                border: `2px solid ${color}55`,
                borderRadius: 28,
                background: 'rgba(15,10,30,0.55)',
                boxShadow: `0 0 40px ${color}33`,
              }}
            >
              <span
                style={{
                  fontSize: 160,
                  lineHeight: 1,
                  color,
                  display: 'flex',
                }}
              >
                {glyphFor(entry.sign)}
              </span>
              <span
                style={{
                  fontSize: 18,
                  letterSpacing: 4,
                  marginTop: 16,
                  color: '#9B8BC9',
                  display: 'flex',
                }}
              >
                {entry.label}
              </span>
              <span
                style={{
                  fontSize: 28,
                  marginTop: 4,
                  color: '#F7F3FF',
                  display: 'flex',
                }}
              >
                {entry.sign || '\u2014'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 'auto',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 28,
            fontWeight: 500,
            color: '#F7F3FF',
            display: 'flex',
          }}
        >
          Lunary
        </span>
        <span
          style={{
            fontSize: 20,
            color: '#9B8BC9',
            display: 'flex',
          }}
        >
          your daily astrology companion
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
