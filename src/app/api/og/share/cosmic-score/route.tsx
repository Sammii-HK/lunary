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
  ShareFooter,
  SHARE_BORDERS,
  SHARE_CARDS,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;
let astronomiconFontPromise: Promise<ArrayBuffer> | null = null;

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

const loadAstronomiconFont = async (request: Request) => {
  if (!astronomiconFontPromise) {
    const fontUrl = new URL('/fonts/Astronomicon.ttf', request.url);
    astronomiconFontPromise = fetch(fontUrl, { cache: 'force-cache' }).then(
      (res) => {
        if (!res.ok)
          throw new Error(`Astronomicon font fetch failed: ${res.status}`);
        return res.arrayBuffer();
      },
    );
  }
  return astronomiconFontPromise;
};

interface CosmicScoreShareRecord {
  shareId: string;
  overall: number;
  headline: string;
  dominantEnergy: string;
  sunSign?: string;
  date: string;
  createdAt: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#5BB98B'; // lunary-success
  if (score >= 60) return '#D4A574'; // lunary-accent
  if (score >= 40) return '#8458D8'; // lunary-primary
  return '#EE789E'; // lunary-rose
}

function getScoreGlow(score: number): string {
  if (score >= 80) return 'rgba(91, 185, 139, 0.3)';
  if (score >= 60) return 'rgba(212, 165, 116, 0.3)';
  if (score >= 40) return 'rgba(132, 88, 216, 0.3)';
  return 'rgba(238, 120, 158, 0.3)';
}

function getEnergyLabel(energy: string): string {
  const labels: Record<string, string> = {
    communication: 'Communication',
    creativity: 'Creativity',
    love: 'Love',
    career: 'Career',
    rest: 'Rest & Reflection',
  };
  return labels[energy] || energy;
}

function getScoreGrade(score: number): string {
  if (score >= 80) return 'Powerful Day';
  if (score >= 60) return 'Favourable Energy';
  if (score >= 40) return 'Mixed Influences';
  return 'Challenging Period';
}

// Sun sign glyphs from Astronomicon font
const SUN_SIGN_GLYPHS: Record<string, string> = {
  Aries: 'A',
  Taurus: 'B',
  Gemini: 'C',
  Cancer: 'D',
  Leo: 'E',
  Virgo: 'F',
  Libra: 'G',
  Scorpio: 'H',
  Sagittarius: 'I',
  Capricorn: 'J',
  Aquarius: 'K',
  Pisces: 'L',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'story') as ShareFormat;

    const [robotoMonoData, astronomiconData] = await Promise.all([
      loadRobotoMono(request),
      loadAstronomiconFont(request),
    ]);

    let data: CosmicScoreShareRecord;

    if (shareId && shareId !== 'demo') {
      const raw = await kvGet(`cosmic-score:${shareId}`);
      if (raw) {
        data = JSON.parse(raw) as CosmicScoreShareRecord;
      } else {
        data = getDemoData();
      }
    } else {
      data = getDemoData();
    }

    const { width, height } = getFormatDimensions(format);

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 80 : 60;

    const stars = generateStarfield(data.shareId, getStarCount(format));

    const date = new Date(data.date);
    const dateText = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const scoreColor = getScoreColor(data.overall);
    const scoreGlow = getScoreGlow(data.overall);
    const sunSignGlyph = data.sunSign
      ? SUN_SIGN_GLYPHS[data.sunSign]
      : undefined;

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

    // Score sizes
    const scoreSize = isLandscape ? 100 : isStory ? 200 : 130;
    const headlineSize = isLandscape ? 22 : isStory ? 36 : 30;
    const dateSize = isLandscape ? 16 : isStory ? 24 : 20;
    const energySize = isLandscape ? 18 : isStory ? 28 : 24;
    const glyphSize = isLandscape ? 48 : isStory ? 72 : 60;

    // Score arc segments (8 segments for visual interest)
    const arcSegments = 8;
    const filledSegments = Math.round((data.overall / 100) * arcSegments);

    const layoutJsx = isLandscape ? (
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
        {starfieldJsx}

        {/* Main content row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 40,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Score circle */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: `4px solid ${scoreColor}`,
                boxShadow: `0 0 40px ${scoreGlow}`,
                position: 'relative',
              }}
            >
              <span
                style={{
                  fontSize: scoreSize,
                  fontWeight: 500,
                  color: scoreColor,
                  display: 'flex',
                }}
              >
                {data.overall}
              </span>
            </div>
            <div
              style={{
                fontSize: dateSize,
                color: OG_COLORS.textTertiary,
                letterSpacing: 2,
                display: 'flex',
              }}
            >
              {dateText}
            </div>
          </div>

          {/* Info column */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 36,
                fontWeight: 400,
                color: OG_COLORS.textPrimary,
                display: 'flex',
              }}
            >
              Cosmic Score
            </div>
            <div
              style={{
                fontSize: headlineSize,
                color: OG_COLORS.textSecondary,
                lineHeight: 1.5,
                display: 'flex',
              }}
            >
              {data.headline}
            </div>
            <div
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: energySize,
                  color: scoreColor,
                  padding: '6px 16px',
                  borderRadius: 999,
                  border: `1px solid ${scoreColor}`,
                  background: `${scoreColor}10`,
                  display: 'flex',
                }}
              >
                {getEnergyLabel(data.dominantEnergy)}
              </div>
              {sunSignGlyph && (
                <span
                  style={{
                    fontFamily: 'Astronomicon',
                    fontSize: glyphSize,
                    color: OG_COLORS.textSecondary,
                    display: 'flex',
                  }}
                >
                  {sunSignGlyph}
                </span>
              )}
            </div>
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    ) : (
      // Story & Square layout — top-to-bottom fill
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
          alignItems: 'center',
        }}
      >
        {/* Radial glow behind score circle */}
        <div
          style={{
            position: 'absolute',
            top: isStory ? '18%' : '16%',
            left: '50%',
            width: isStory ? 720 : 520,
            height: isStory ? 720 : 520,
            borderRadius: '50%',
            background: `radial-gradient(ellipse at center, ${scoreGlow} 0%, transparent 65%)`,
            transform: 'translateX(-50%)',
            display: 'flex',
          }}
        />

        {starfieldJsx}

        {/* Date */}
        <div
          style={{
            fontSize: dateSize,
            color: OG_COLORS.textTertiary,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: isStory ? 44 : 28,
            display: 'flex',
          }}
        >
          {dateText}
        </div>

        {/* Score circle with glow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: isStory ? 440 : 280,
            height: isStory ? 440 : 280,
            borderRadius: '50%',
            border: `5px solid ${scoreColor}`,
            boxShadow: `0 0 60px ${scoreGlow}, 0 0 120px ${scoreGlow}`,
            marginBottom: isStory ? 28 : 16,
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: scoreSize,
              fontWeight: 500,
              color: scoreColor,
              display: 'flex',
            }}
          >
            {data.overall}
          </span>
        </div>

        {/* Energy arc segments */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            marginBottom: isStory ? 28 : 16,
          }}
        >
          {Array.from({ length: arcSegments }).map((_, i) => (
            <div
              key={i}
              style={{
                width: isStory ? 32 : 22,
                height: isStory ? 8 : 6,
                borderRadius: 4,
                background:
                  i < filledSegments ? scoreColor : 'rgba(255,255,255,0.1)',
                display: 'flex',
              }}
            />
          ))}
        </div>

        {/* Title + grade */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: isStory ? 14 : 8,
            marginBottom: isStory ? 24 : 14,
          }}
        >
          <div
            style={{
              fontSize: isStory ? 64 : 44,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: 2,
              display: 'flex',
            }}
          >
            Cosmic Score
          </div>
          <div
            style={{
              fontSize: isStory ? 28 : 18,
              color: scoreColor,
              letterSpacing: '0.06em',
              display: 'flex',
              opacity: 0.9,
            }}
          >
            {getScoreGrade(data.overall)}
          </div>
        </div>

        {/* Dominant energy badge */}
        <div
          style={{
            fontSize: energySize,
            color: scoreColor,
            padding: isStory ? '12px 28px' : '8px 20px',
            borderRadius: 999,
            border: `1px solid ${scoreColor}`,
            background: `${scoreColor}10`,
            marginBottom: isStory ? 36 : 22,
            display: 'flex',
          }}
        >
          {getEnergyLabel(data.dominantEnergy)}
        </div>

        {/* Headline card — grows to fill remaining space */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: isStory ? '36px 44px' : '24px 28px',
            background: SHARE_CARDS.primary,
            border: SHARE_BORDERS.card,
            borderRadius: 20,
            width: '100%',
            flex: 1,
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Sun sign glyph — decorative watermark inside card */}
          {sunSignGlyph && (
            <span
              style={{
                fontFamily: 'Astronomicon',
                fontSize: isStory ? glyphSize + 48 : glyphSize + 16,
                color: scoreColor,
                opacity: 0.07,
                display: 'flex',
                position: 'absolute',
                right: isStory ? 36 : 20,
                bottom: isStory ? 24 : 12,
                lineHeight: 1,
              }}
            >
              {sunSignGlyph}
            </span>
          )}
          <div
            style={{
              fontSize: isStory ? 18 : 12,
              color: OG_COLORS.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: isStory ? 18 : 10,
              display: 'flex',
            }}
          >
            Today's Insight
          </div>
          <div
            style={{
              fontSize: isStory ? headlineSize + 4 : headlineSize,
              color: OG_COLORS.textPrimary,
              lineHeight: 1.65,
              display: 'flex',
            }}
          >
            {data.headline}
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [
        {
          name: 'Roboto Mono',
          data: robotoMonoData,
          style: 'normal',
          weight: 400,
        },
        {
          name: 'Astronomicon',
          data: astronomiconData,
          style: 'normal',
        },
      ],
    });
  } catch (error) {
    console.error('[CosmicScoreOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

function getDemoData(): CosmicScoreShareRecord {
  return {
    shareId: 'demo',
    overall: 78,
    headline: 'Strong creative energy supports bold action today',
    dominantEnergy: 'creativity',
    sunSign: 'Leo',
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
}
