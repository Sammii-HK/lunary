import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface RetrogradeBadgeShareRecord {
  shareId: string;
  name?: string;
  planet: string;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'diamond';
  survivalDays: number;
  isCompleted: boolean;
  retrogradeStart?: string;
  retrogradeEnd?: string;
  sign?: string;
  createdAt: string;
}

const BADGE_COLORS: Record<
  string,
  { border: string; text: string; bg: string }
> = {
  bronze: {
    border: '#CD7F32',
    text: '#D4A574',
    bg: 'rgba(205, 127, 50, 0.1)',
  },
  silver: {
    border: '#C0C0C0',
    text: '#D3D3D3',
    bg: 'rgba(192, 192, 192, 0.1)',
  },
  gold: {
    border: '#FFD700',
    text: '#FFC700',
    bg: 'rgba(255, 215, 0, 0.1)',
  },
  diamond: {
    border: '#B9F2FF',
    text: '#E0F7FF',
    bg: 'rgba(185, 242, 255, 0.1)',
  },
};

const BADGE_LABELS: Record<string, string> = {
  bronze: 'Bronze Survivor',
  silver: 'Halfway Hero',
  gold: 'Completed Unscathed',
  diamond: 'Unscathed Champion',
};

const BADGE_EMOJIS: Record<string, string> = {
  bronze: '🥉',
  silver: '🥈',
  gold: '🥇',
  diamond: '💎',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV or use demo data
    const raw = await kvGet(`retrograde-badge:${shareId}`);

    let data: RetrogradeBadgeShareRecord;

    if (!raw || shareId === 'demo') {
      // Provide demo/fallback data - Mercury retrograde in progress
      data = {
        shareId: 'demo',
        createdAt: new Date().toISOString(),
        planet: 'Mercury',
        badgeLevel: 'silver',
        survivalDays: 10,
        isCompleted: false,
        retrogradeStart: '2026-01-15',
        retrogradeEnd: '2026-02-04',
        sign: 'Aquarius',
      };
    } else {
      data = JSON.parse(raw) as RetrogradeBadgeShareRecord;
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 36 : isStory ? 52 : 48;
    const subtitleSize = isLandscape ? 20 : isStory ? 28 : 24;
    const daySize = isLandscape ? 80 : isStory ? 120 : 96;
    const labelSize = isLandscape ? 18 : isStory ? 24 : 22;
    const humorSize = isLandscape ? 14 : isStory ? 20 : 18;
    const badgeSize = isLandscape ? 200 : isStory ? 280 : 240;

    const badgeColors = BADGE_COLORS[data.badgeLevel];
    const badgeLabel = BADGE_LABELS[data.badgeLevel];
    const badgeEmoji = BADGE_EMOJIS[data.badgeLevel];

    // Format dates
    const startDate = data.retrogradeStart
      ? new Date(data.retrogradeStart)
      : null;
    const endDate = data.retrogradeEnd ? new Date(data.retrogradeEnd) : null;
    const dateRangeText =
      startDate && endDate
        ? `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : 'Mercury Retrograde';

    const mainText = data.isCompleted
      ? `${firstName ? `${firstName} Survived` : 'I Survived'} Mercury Retrograde`
      : `Day ${data.survivalDays} of Mercury Retrograde`;

    const humorLine = data.isCompleted
      ? 'I survived Mercury Retrograde and all I got was this badge'
      : 'Still standing, still surviving';

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isLandscape ? 20 : isStory ? 32 : 28,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            {mainText}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 8,
              letterSpacing: '0.1em',
              textAlign: 'center',
            }}
          >
            {dateRangeText}
          </div>
        </div>

        {/* Badge Circle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            marginBottom: isLandscape ? 20 : 32,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: badgeSize,
              height: badgeSize,
              borderRadius: '50%',
              border: `4px solid ${badgeColors.border}`,
              background: badgeColors.bg,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              marginBottom: isLandscape ? 16 : 24,
            }}
          >
            <div
              style={{
                fontSize: daySize,
                fontWeight: 400,
                color: badgeColors.text,
                marginBottom: 8,
              }}
            >
              {badgeEmoji}
            </div>
            <div
              style={{
                fontSize: isLandscape ? 48 : isStory ? 72 : 64,
                fontWeight: 400,
                color: badgeColors.text,
              }}
            >
              ☿
            </div>
          </div>

          {/* Badge Label */}
          <div
            style={{
              fontSize: labelSize,
              fontWeight: 400,
              color: badgeColors.text,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 12,
              textAlign: 'center',
            }}
          >
            {badgeLabel}
          </div>

          {/* Humor Line */}
          <div
            style={{
              fontSize: humorSize,
              color: OG_COLORS.textSecondary,
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: isLandscape ? '80%' : '90%',
              lineHeight: 1.4,
            }}
          >
            {humorLine}
          </div>
        </div>

        {/* Footer Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: isLandscape ? 16 : 24,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={22}
            height={22}
            style={{ opacity: 0.45 }}
            alt=''
          />
          <span
            style={{
              fontFamily: 'Roboto Mono',
              fontWeight: 300,
              fontSize: 16,
              opacity: 0.4,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
            }}
          >
            Survive retrograde at lunary.app
          </span>
        </div>
      </div>,
      {
        width,
        height,
      },
    );
  } catch (error) {
    console.error('[RetrogradeBadgeOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
