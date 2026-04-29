import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import {
  getFormatDimensions,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  ShareFooter,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
  truncateText,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

/**
 * Year in Stars OG image.
 *
 * Renders a sharable card summarising a user's year. Heavy data fetching is
 * intentionally avoided here so the route stays edge-fast: the caller (the
 * `/year-in-stars` reel) is responsible for passing the highlight stats it
 * wants etched onto the image via query params. Without those, the image
 * still renders as a clean generic year wrap.
 *
 * Query params:
 *   year       — REQUIRED, 4-digit year
 *   userId     — optional, used only for cache keying / starfield seeding
 *   format     — square | story | landscape | pinterest (default: square)
 *   name       — display name to greet on the card
 *   entries    — total journal entries
 *   words      — total words written
 *   streak     — longest journaling streak (days)
 *   phase      — top moon phase
 *   transit    — top transit label
 *   bestWeek   — best-week label
 */

export const runtime = 'edge';
export const revalidate = 86_400; // 1 day

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Roboto Mono font fetch failed with status ${res.status}`,
        );
      }
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const ALLOWED_FORMATS: ReadonlySet<ShareFormat> = new Set<ShareFormat>([
  'square',
  'story',
  'landscape',
  'pinterest',
]);

const ALLOWED_PHASES = new Set([
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
]);

function sanitize(value: string | null, limit = 80): string | undefined {
  if (!value) return undefined;
  // Strip control chars to prevent log/header injection downstream.
  const cleaned = value.replace(/[\r\n\x00-\x1F\x7F]/g, '').trim();
  if (!cleaned) return undefined;
  return cleaned.length > limit ? `${cleaned.slice(0, limit - 1)}…` : cleaned;
}

function sanitizeNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(Math.floor(n), 9_999_999);
}

function safePhase(value: string | null): string | undefined {
  if (!value) return undefined;
  return ALLOWED_PHASES.has(value) ? value : undefined;
}

function parseYear(raw: string | null): number | null {
  if (!raw || !/^\d{4}$/.test(raw)) return null;
  const y = Number(raw);
  if (y < 2000 || y > 2100) return null;
  return y;
}

function formatNumber(n: number | undefined): string {
  if (n === undefined) return '—';
  return n.toLocaleString('en-US');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const year = parseYear(searchParams.get('year'));
    if (!year) {
      return new Response('Invalid or missing year', { status: 400 });
    }

    const formatParam = searchParams.get('format') as ShareFormat | null;
    const format: ShareFormat =
      formatParam && ALLOWED_FORMATS.has(formatParam) ? formatParam : 'square';
    const { width, height } = getFormatDimensions(format);

    const userId = sanitize(searchParams.get('userId'), 64);
    const name = sanitize(searchParams.get('name'), 32);
    const entries = sanitizeNumber(searchParams.get('entries'));
    const words = sanitizeNumber(searchParams.get('words'));
    const streak = sanitizeNumber(searchParams.get('streak'));
    const phase = safePhase(searchParams.get('phase'));
    const transit = sanitize(searchParams.get('transit'), 60);
    const bestWeek = sanitize(searchParams.get('bestWeek'), 32);

    const robotoMono = await loadRobotoMono(request);

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 100 : 64;
    const titleSize = isLandscape ? 56 : isStory ? 110 : 84;
    const yearSize = isLandscape ? 110 : isStory ? 220 : 170;
    const subtitleSize = isLandscape ? 16 : isStory ? 28 : 22;
    const statValueSize = isLandscape ? 36 : isStory ? 64 : 48;
    const statLabelSize = isLandscape ? 12 : isStory ? 20 : 14;

    // Seed starfield off the userId+year so the same user gets a consistent
    // background year-over-year while different users still feel unique.
    const starSeed = `${userId ?? 'anon'}-${year}`;
    const stars = generateStarfield(starSeed, getStarCount(format));

    const starfieldJsx = stars.map((star, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: '50%',
          background: '#fff',
          opacity: star.opacity * 0.85,
        }}
      />
    ));

    const stats: Array<{ value: string; label: string }> = [];
    if (entries !== undefined) {
      stats.push({ value: formatNumber(entries), label: 'Entries' });
    }
    if (words !== undefined) {
      stats.push({ value: formatNumber(words), label: 'Words' });
    }
    if (streak !== undefined) {
      stats.push({ value: formatNumber(streak), label: 'Day streak' });
    }
    if (phase) {
      stats.push({ value: phase, label: 'Top moon phase' });
    }

    const titleLine = name ? `${name}'s year in stars` : 'Year in stars';

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0A0A',
          color: '#fff',
          padding,
          fontFamily: 'Roboto Mono',
          position: 'relative',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Brand-themed gradient base */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(10, 10, 18, 0.95) 0%, rgba(67, 56, 120, 0.85) 50%, rgba(238, 120, 158, 0.55) 100%)',
            display: 'flex',
          }}
        />

        {/* Decorative radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(199, 125, 255, 0.18) 0%, transparent 65%)',
            display: 'flex',
          }}
        />

        {/* Starfield */}
        {starfieldJsx}

        {/* Foreground content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            flex: 1,
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              marginTop: isStory ? 40 : 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: subtitleSize,
                letterSpacing: 6,
                textTransform: 'uppercase',
                opacity: 0.65,
              }}
            >
              Lunary · Year in Stars
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: yearSize,
                fontWeight: 300,
                lineHeight: 1,
                letterSpacing: -2,
                textShadow: SHARE_TITLE_GLOW,
              }}
            >
              {year}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 400,
                opacity: 0.95,
              }}
            >
              {titleLine}
            </div>
          </div>

          {/* Stats grid */}
          {stats.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: isLandscape ? 16 : 24,
                justifyContent: 'center',
                width: '100%',
                marginTop: isStory ? 80 : 32,
              }}
            >
              {stats.map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: isLandscape ? 140 : 200,
                    padding: isLandscape ? '12px 20px' : '20px 28px',
                    borderRadius: 20,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: statValueSize,
                      fontWeight: 500,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      marginTop: 6,
                      fontSize: statLabelSize,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      opacity: 0.65,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top transit / best week ribbon */}
          {(transit || bestWeek) && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                alignItems: 'center',
                marginTop: 24,
                marginBottom: isStory ? 40 : 16,
                padding: '14px 20px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: 'rgba(0,0,0,0.25)',
                maxWidth: '90%',
              }}
            >
              {transit && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      fontSize: statLabelSize,
                      letterSpacing: 4,
                      textTransform: 'uppercase',
                      opacity: 0.6,
                    }}
                  >
                    Top transit
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      fontSize: isStory ? 32 : 22,
                      marginTop: 4,
                    }}
                  >
                    {truncateText(transit, 60)}
                  </span>
                </div>
              )}
              {bestWeek && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      fontSize: statLabelSize,
                      letterSpacing: 4,
                      textTransform: 'uppercase',
                      opacity: 0.6,
                    }}
                  >
                    Best week
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      fontSize: isStory ? 28 : 20,
                      marginTop: 4,
                    }}
                  >
                    {bestWeek}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: isStory ? 24 : 16,
            left: padding,
            fontSize: isStory ? 14 : 12,
            opacity: 0.3,
            letterSpacing: 1,
            display: 'flex',
          }}
        >
          lunary.app/year-in-stars/{year}
        </div>

        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [{ name: 'Roboto Mono', data: robotoMono, style: 'normal' }],
    });
  } catch (error) {
    console.error('[YearInStarsOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
