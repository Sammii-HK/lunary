import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  loadShareFonts,
  truncateText,
  ShareFooter,
  SHARE_BASE_URL,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface SynastryShareRecord {
  shareId: string;
  userName?: string;
  friendName: string;
  compatibilityScore: number;
  summary: string;
  elementCompatibility?: string;
  modalityCompatibility?: string;
  harmoniousAspects?: number;
  challengingAspects?: number;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Check for URL parameters for real-time data
    const urlUserName = searchParams.get('userName');
    const urlFriendName = searchParams.get('friendName');
    const urlScore = searchParams.get('compatibilityScore');
    const urlSummary = searchParams.get('summary');
    const urlHarmonious = searchParams.get('harmoniousAspects');
    const urlChallenging = searchParams.get('challengingAspects');

    let data: SynastryShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlFriendName && urlScore) {
      data = {
        shareId: 'url-params',
        userName: urlUserName || undefined,
        friendName: decodeURIComponent(urlFriendName),
        compatibilityScore: parseInt(urlScore),
        summary: urlSummary
          ? decodeURIComponent(urlSummary)
          : 'A cosmic connection worth exploring',
        harmoniousAspects: urlHarmonious ? parseInt(urlHarmonious) : undefined,
        challengingAspects: urlChallenging
          ? parseInt(urlChallenging)
          : undefined,
        createdAt: new Date().toISOString(),
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      const raw = await kvGet(`synastry:${shareId}`);

      if (!raw || shareId === 'demo') {
        data = {
          shareId: 'demo',
          userName: 'You',
          friendName: 'Friend',
          compatibilityScore: 78,
          summary:
            'A harmonious blend of energies with room for growth together',
          harmoniousAspects: 8,
          challengingAspects: 3,
          createdAt: new Date().toISOString(),
        };
      } else {
        data = JSON.parse(raw) as SynastryShareRecord;
      }
    }

    const { width, height } = getFormatDimensions(format);
    const baseUrl = SHARE_BASE_URL;

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 36 : isStory ? 56 : 48;
    const scoreSize = isLandscape ? 96 : isStory ? 180 : 160;
    const labelSize = isLandscape ? 18 : isStory ? 28 : 24;
    const summarySize = isLandscape ? 18 : isStory ? 28 : 24;

    const stars = generateStarfield(data.shareId, getStarCount(format));

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
          opacity: star.opacity,
        }}
      />
    ));

    // Determine score color
    const getScoreColor = (score: number) => {
      if (score >= 80) return OG_COLORS.cometTrail;
      if (score >= 60) return '#8458D8'; // purple
      if (score >= 40) return OG_COLORS.galaxyHaze;
      return OG_COLORS.cosmicRose;
    };

    const scoreColor = getScoreColor(data.compatibilityScore);

    // Truncation limits
    const nameLimit = isLandscape ? 40 : 50;
    const summaryLimit = isLandscape ? 120 : 200;
    const combinedNames = truncateText(
      `${data.userName || 'You'} & ${data.friendName}`,
      nameLimit,
    );
    const truncatedSummary = truncateText(data.summary, summaryLimit);

    const fonts = await loadShareFonts(request);

    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: OG_COLORS.background,
          position: 'relative',
          overflow: 'hidden',
          padding,
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: `radial-gradient(ellipse at 30% 20%, ${OG_COLORS.primaryViolet}15 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${OG_COLORS.cosmicRose}10 0%, transparent 50%)`,
          }}
        />

        {/* Starfield */}
        {starfieldJsx}

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: isLandscape ? 24 : 32,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: labelSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Cosmic Compatibility
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 600,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
              }}
            >
              {combinedNames}
            </div>
          </div>

          {/* Score Circle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: isLandscape ? 180 : isStory ? 280 : 240,
              height: isLandscape ? 180 : isStory ? 280 : 240,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${scoreColor}20 0%, ${scoreColor}05 100%)`,
              border: `3px solid ${scoreColor}50`,
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: scoreSize,
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
              }}
            >
              {data.compatibilityScore}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: labelSize,
                color: OG_COLORS.textSecondary,
                marginTop: 4,
              }}
            >
              % Match
            </div>
          </div>

          {/* Summary */}
          <div
            style={{
              display: 'flex',
              fontSize: summarySize,
              color: OG_COLORS.textSecondary,
              textAlign: 'center',
              maxWidth: isLandscape ? '80%' : '90%',
              lineHeight: 1.4,
            }}
          >
            {truncatedSummary}
          </div>

          {/* Aspect counts */}
          {(data.harmoniousAspects || data.challengingAspects) && (
            <div
              style={{
                display: 'flex',
                gap: isLandscape ? 32 : 48,
                marginTop: 8,
              }}
            >
              {data.harmoniousAspects && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: isLandscape ? 32 : 48,
                      fontWeight: 600,
                      color: OG_COLORS.cometTrail,
                    }}
                  >
                    {data.harmoniousAspects}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: isLandscape ? 14 : 18,
                      color: OG_COLORS.textTertiary,
                    }}
                  >
                    Harmonious
                  </div>
                </div>
              )}
              {data.challengingAspects && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      fontSize: isLandscape ? 32 : 48,
                      fontWeight: 600,
                      color: OG_COLORS.galaxyHaze,
                    }}
                  >
                    {data.challengingAspects}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      fontSize: isLandscape ? 14 : 18,
                      color: OG_COLORS.textTertiary,
                    }}
                  >
                    Challenging
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>,
      {
        width,
        height,
        fonts,
      },
    );
  } catch (error) {
    console.error('[OG Synastry] Error generating image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
