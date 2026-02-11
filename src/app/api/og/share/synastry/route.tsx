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

interface BigThree {
  sun?: string;
  moon?: string;
  rising?: string;
}

interface TopAspect {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  isHarmonious: boolean;
}

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
  person1BigThree?: BigThree;
  person2BigThree?: BigThree;
  topAspects?: TopAspect[];
  elementBalance?: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  archetype?: string;
  createdAt: string;
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: '#F59E0B',
  earth: '#10B981',
  air: '#6366F1',
  water: '#3B82F6',
};

const ASPECT_GLYPHS: Record<string, string> = {
  conjunction: '☌',
  sextile: '⚹',
  square: '□',
  trine: '△',
  opposition: '☍',
};

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
          archetype: 'Wind & Flame',
          person1BigThree: { sun: 'Aries', moon: 'Cancer', rising: 'Leo' },
          person2BigThree: {
            sun: 'Libra',
            moon: 'Pisces',
            rising: 'Sagittarius',
          },
          topAspects: [
            {
              person1Planet: 'Venus',
              person2Planet: 'Mars',
              aspectType: 'trine',
              isHarmonious: true,
            },
            {
              person1Planet: 'Sun',
              person2Planet: 'Moon',
              aspectType: 'conjunction',
              isHarmonious: true,
            },
            {
              person1Planet: 'Mars',
              person2Planet: 'Saturn',
              aspectType: 'square',
              isHarmonious: false,
            },
          ],
          elementBalance: { fire: 5, earth: 3, air: 4, water: 4 },
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
    const archetypeSize = isLandscape ? 24 : isStory ? 40 : 36;
    const nameSize = isLandscape ? 28 : isStory ? 44 : 40;
    const scoreSize = isLandscape ? 80 : isStory ? 140 : 120;
    const labelSize = isLandscape ? 14 : isStory ? 22 : 18;
    const bigThreeSize = isLandscape ? 13 : isStory ? 20 : 16;
    const aspectSize = isLandscape ? 14 : isStory ? 22 : 18;

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

    const getScoreColor = (score: number) => {
      if (score >= 80) return OG_COLORS.cometTrail;
      if (score >= 60) return '#8458D8';
      if (score >= 40) return OG_COLORS.galaxyHaze;
      return OG_COLORS.cosmicRose;
    };

    const scoreColor = getScoreColor(data.compatibilityScore);

    // Determine gradient from dominant element
    const dominantElement = data.elementBalance
      ? Object.entries(data.elementBalance).sort((a, b) => b[1] - a[1])[0]?.[0]
      : null;
    const gradientAccent =
      dominantElement && ELEMENT_COLORS[dominantElement]
        ? ELEMENT_COLORS[dominantElement]
        : OG_COLORS.primaryViolet;

    const person1Name = truncateText(data.userName || 'You', 20);
    const person2Name = truncateText(data.friendName, 20);

    const renderBigThree = (bigThree?: BigThree, size: number = 13) => {
      if (!bigThree) return null;
      const items = [
        bigThree.sun && `☉ ${bigThree.sun}`,
        bigThree.moon && `☽ ${bigThree.moon}`,
        bigThree.rising && `↑ ${bigThree.rising}`,
      ].filter(Boolean);

      return (
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {items.map((item, i) => (
            <span
              key={i}
              style={{
                display: 'flex',
                fontSize: size,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.02em',
              }}
            >
              {item}
            </span>
          ))}
        </div>
      );
    };

    const renderElementBar = () => {
      if (!data.elementBalance) return null;
      const total =
        data.elementBalance.fire +
        data.elementBalance.earth +
        data.elementBalance.air +
        data.elementBalance.water;
      if (total === 0) return null;

      const barHeight = isLandscape ? 8 : 12;

      return (
        <div
          style={{
            display: 'flex',
            width: '80%',
            height: barHeight,
            borderRadius: barHeight / 2,
            overflow: 'hidden',
          }}
        >
          {(['fire', 'earth', 'air', 'water'] as const).map((el) => (
            <div
              key={el}
              style={{
                display: 'flex',
                width: `${(data.elementBalance![el] / total) * 100}%`,
                height: '100%',
                background: ELEMENT_COLORS[el],
              }}
            />
          ))}
        </div>
      );
    };

    const renderTopAspects = () => {
      const aspects = (data.topAspects ?? []).slice(0, 3);
      if (aspects.length === 0 && !data.harmoniousAspects) return null;

      // If we have detailed aspects, show them
      if (aspects.length > 0) {
        return (
          <div
            style={{
              display: 'flex',
              gap: isLandscape ? 16 : 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {aspects.map((asp, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: aspectSize,
                  color: asp.isHarmonious
                    ? OG_COLORS.cometTrail
                    : OG_COLORS.galaxyHaze,
                }}
              >
                <span style={{ display: 'flex' }}>{asp.person1Planet}</span>
                <span style={{ display: 'flex', opacity: 0.7 }}>
                  {ASPECT_GLYPHS[asp.aspectType] || '·'}
                </span>
                <span style={{ display: 'flex' }}>{asp.person2Planet}</span>
              </div>
            ))}
          </div>
        );
      }

      // Fallback to counts
      return (
        <div
          style={{
            display: 'flex',
            gap: isLandscape ? 32 : 48,
          }}
        >
          {data.harmoniousAspects != null && (
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
          {data.challengingAspects != null && (
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
      );
    };

    const fonts = await loadShareFonts(request, { includeAstronomicon: true });

    const storyLayout = (
      /* Story: stacked vertically - Person A top, score center, Person B bottom */
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
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: `radial-gradient(ellipse at 30% 20%, ${gradientAccent}15 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${OG_COLORS.cosmicRose}10 0%, transparent 50%)`,
          }}
        />
        {starfieldJsx}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: 32,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Archetype headline */}
          {data.archetype && (
            <div
              style={{
                display: 'flex',
                fontSize: archetypeSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                textAlign: 'center',
              }}
            >
              {data.archetype}
            </div>
          )}

          {/* Person 1 */}
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
                fontSize: nameSize,
                fontWeight: 600,
                color: OG_COLORS.textPrimary,
              }}
            >
              {person1Name}
            </div>
            {renderBigThree(data.person1BigThree, bigThreeSize)}
          </div>

          {/* Score circle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 280,
              height: 280,
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

          {/* Person 2 */}
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
                fontSize: nameSize,
                fontWeight: 600,
                color: OG_COLORS.textPrimary,
              }}
            >
              {person2Name}
            </div>
            {renderBigThree(data.person2BigThree, bigThreeSize)}
          </div>

          {/* Top aspects */}
          {renderTopAspects()}

          {/* Element balance bar */}
          {renderElementBar()}
        </div>

        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>
    );

    const squareLandscapeLayout = (
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
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-20%',
            width: '140%',
            height: '140%',
            background: `radial-gradient(ellipse at 30% 20%, ${gradientAccent}15 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${OG_COLORS.cosmicRose}10 0%, transparent 50%)`,
          }}
        />
        {starfieldJsx}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: isLandscape ? 20 : 28,
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Archetype headline */}
          {data.archetype && (
            <div
              style={{
                display: 'flex',
                fontSize: archetypeSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
              }}
            >
              {data.archetype}
            </div>
          )}

          {/* Two columns: Person 1 | Score | Person 2 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: isLandscape ? 24 : 40,
              width: '100%',
            }}
          >
            {/* Person 1 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: nameSize,
                  fontWeight: 600,
                  color: OG_COLORS.textPrimary,
                }}
              >
                {person1Name}
              </div>
              {renderBigThree(data.person1BigThree, bigThreeSize)}
            </div>

            {/* Score circle (overlapping center) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: isLandscape ? 160 : 200,
                height: isLandscape ? 160 : 200,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${scoreColor}20 0%, ${scoreColor}05 100%)`,
                border: `3px solid ${scoreColor}50`,
                flexShrink: 0,
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

            {/* Person 2 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: nameSize,
                  fontWeight: 600,
                  color: OG_COLORS.textPrimary,
                }}
              >
                {person2Name}
              </div>
              {renderBigThree(data.person2BigThree, bigThreeSize)}
            </div>
          </div>

          {/* Top aspects row */}
          {renderTopAspects()}

          {/* Element balance bar */}
          {renderElementBar()}

          {/* Summary */}
          <div
            style={{
              display: 'flex',
              fontSize: isLandscape ? 16 : 20,
              color: OG_COLORS.textSecondary,
              textAlign: 'center',
              maxWidth: '85%',
              lineHeight: 1.4,
            }}
          >
            {truncateText(data.summary, isLandscape ? 120 : 200)}
          </div>
        </div>

        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>
    );

    const layoutJsx = isStory ? storyLayout : squareLandscapeLayout;

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
    });
  } catch (error) {
    console.error('[OG Synastry] Error generating image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
