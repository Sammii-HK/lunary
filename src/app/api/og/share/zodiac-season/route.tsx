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
  SHARE_BASE_URL,
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

// Astronomicon font symbol mapping for zodiac signs
const ZODIAC_SYMBOLS: Record<string, string> = {
  aries: 'A',
  taurus: 'B',
  gemini: 'C',
  cancer: 'D',
  leo: 'E',
  virgo: 'F',
  libra: 'G',
  scorpio: 'H',
  sagittarius: 'I',
  capricorn: 'J',
  aquarius: 'K',
  pisces: 'L',
};

interface ZodiacSeasonShareRecord {
  shareId: string;
  name?: string;
  sign: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  startDate: string;
  endDate: string;
  themes: string[];
  symbol: string;
  createdAt: string;
}

// Element-based gradient backgrounds
const ELEMENT_GRADIENTS: Record<
  string,
  { from: string; via: string; to: string }
> = {
  Fire: {
    from: '#DC2626',
    via: '#EA580C',
    to: '#EAB308',
  },
  Earth: {
    from: '#166534',
    via: '#059669',
    to: '#14B8A6',
  },
  Air: {
    from: '#2563EB',
    via: '#6366F1',
    to: '#8B5CF6',
  },
  Water: {
    from: '#0891B2',
    via: '#0D9488',
    to: '#1E40AF',
  },
};

// Element colors for text
const ELEMENT_COLORS: Record<string, string> = {
  Fire: '#FCA5A5',
  Earth: '#6EE7B7',
  Air: '#A5B4FC',
  Water: '#7DD3FC',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Load fonts
    const robotoMonoData = await loadRobotoMono(request);
    const astronomiconData = await loadAstronomiconFont(request);

    // Get the Astronomicon symbol for the zodiac sign
    const getZodiacGlyph = (sign: string): string => {
      const normalizedSign = sign.toLowerCase();
      return ZODIAC_SYMBOLS[normalizedSign] || 'K'; // Default to Aquarius
    };

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlSign = searchParams.get('sign');
    const urlElement = searchParams.get('element');
    const urlModality = searchParams.get('modality');
    const urlStartDate = searchParams.get('startDate');
    const urlEndDate = searchParams.get('endDate');
    const urlThemes = searchParams.get('themes');

    let data: ZodiacSeasonShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlSign) {
      data = {
        shareId: 'url-params',
        name: urlName || undefined,
        createdAt: new Date().toISOString(),
        sign: urlSign,
        element: (urlElement as 'Fire' | 'Earth' | 'Air' | 'Water') || 'Air',
        modality: (urlModality as 'Cardinal' | 'Fixed' | 'Mutable') || 'Fixed',
        startDate: urlStartDate || '2026-01-20',
        endDate: urlEndDate || '2026-02-18',
        themes: urlThemes
          ? decodeURIComponent(urlThemes).split(',')
          : ['Innovation', 'Community', 'Progress'],
        symbol: '♒',
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`zodiac-season:${shareId}`);

      if (!raw || shareId === 'demo') {
        // Provide demo/fallback data - Aquarius season
        data = {
          shareId: 'demo',
          createdAt: new Date().toISOString(),
          sign: 'Aquarius',
          element: 'Air',
          modality: 'Fixed',
          startDate: '2026-01-20',
          endDate: '2026-02-18',
          themes: ['Innovation', 'Community', 'Progress'],
          symbol: '♒',
        };
      } else {
        data = JSON.parse(raw) as ZodiacSeasonShareRecord;
      }
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = SHARE_BASE_URL;

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 44 : isStory ? 84 : 72;
    const symbolSize = isLandscape ? 140 : isStory ? 280 : 200;
    const signSize = isLandscape ? 52 : isStory ? 96 : 72;
    const badgeSize = isLandscape ? 20 : isStory ? 32 : 28;
    const themeSize = isLandscape ? 18 : isStory ? 32 : 30;
    const dateSize = isLandscape ? 20 : isStory ? 32 : 28;

    const gradient = ELEMENT_GRADIENTS[data.element];
    const elementColor = ELEMENT_COLORS[data.element];

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

    // Format dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    const dateRangeText = `${startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

    // Create gradient background
    const gradientBg = `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.via} 50%, ${gradient.to} 100%)`;

    // Starfield JSX
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

    // Gradient overlay JSX
    const gradientOverlay = (
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: gradientBg,
          opacity: 0.2,
          display: 'flex',
        }}
      />
    );

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - Symbol left, text content right
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
        {gradientOverlay}
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {firstName ? `${firstName} Welcomes` : 'Welcome to'}
          </div>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 40,
            flex: 1,
            alignItems: 'center',
          }}
        >
          {/* Left: Symbol */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40%',
            }}
          >
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: symbolSize,
                color: elementColor,
                marginBottom: 16,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {getZodiacGlyph(data.sign)}
            </div>
            <div
              style={{
                fontSize: signSize,
                fontWeight: 400,
                color: elementColor,
                letterSpacing: '0.05em',
                display: 'flex',
              }}
            >
              {data.sign} Season
            </div>
          </div>

          {/* Right: Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              flex: 1,
            }}
          >
            {/* Element & Modality Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: `rgba(${parseInt(elementColor.slice(1, 3), 16)}, ${parseInt(elementColor.slice(3, 5), 16)}, ${parseInt(elementColor.slice(5, 7), 16)}, 0.15)`,
                border: `1px solid ${elementColor}`,
                borderRadius: 9999,
                alignSelf: 'flex-start',
              }}
            >
              <div
                style={{
                  fontSize: badgeSize,
                  color: elementColor,
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                }}
              >
                {data.modality} {data.element}
              </div>
            </div>

            {/* Date Range */}
            <div
              style={{
                fontSize: dateSize,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {dateRangeText}
            </div>

            {/* Themes */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {data.themes.map((theme, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: themeSize,
                    color: OG_COLORS.textSecondary,
                    letterSpacing: '0.05em',
                    display: 'flex',
                  }}
                >
                  • {theme}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Giant symbol, fill vertical space
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: '120px 60px 200px 60px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {gradientOverlay}
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            {firstName ? `${firstName} Welcomes` : 'Welcome to'}
          </div>
        </div>

        {/* Giant Symbol */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Astronomicon',
              fontSize: symbolSize,
              color: elementColor,
              marginBottom: 24,
              lineHeight: 1,
              display: 'flex',
            }}
          >
            {getZodiacGlyph(data.sign)}
          </div>

          <div
            style={{
              fontSize: signSize,
              fontWeight: 400,
              color: elementColor,
              letterSpacing: '0.05em',
              marginBottom: 24,
              display: 'flex',
            }}
          >
            {data.sign} Season
          </div>

          {/* Element & Modality Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 28px',
              background: `rgba(${parseInt(elementColor.slice(1, 3), 16)}, ${parseInt(elementColor.slice(3, 5), 16)}, ${parseInt(elementColor.slice(5, 7), 16)}, 0.15)`,
              border: `2px solid ${elementColor}`,
              borderRadius: 9999,
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: badgeSize,
                color: elementColor,
                fontWeight: 300,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                display: 'flex',
              }}
            >
              {data.modality} {data.element}
            </div>
          </div>

          {/* Date Range */}
          <div
            style={{
              fontSize: dateSize,
              color: OG_COLORS.textTertiary,
              marginBottom: 36,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            {dateRangeText}
          </div>

          {/* Themes as styled list */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              alignItems: 'center',
              background: SHARE_CARDS.primary,
              border: SHARE_BORDERS.card,
              borderRadius: 20,
              padding: '28px 48px',
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 8,
                display: 'flex',
              }}
            >
              Season Themes
            </div>
            {data.themes.map((theme, index) => (
              <div
                key={index}
                style={{
                  fontSize: themeSize,
                  color: OG_COLORS.textPrimary,
                  letterSpacing: '0.05em',
                  display: 'flex',
                }}
              >
                {theme}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>
    ) : (
      // Square Layout
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
        {gradientOverlay}
        {starfieldJsx}

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 36,
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 400,
                color: OG_COLORS.textPrimary,
                letterSpacing: '0.05em',
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {firstName ? `${firstName} Welcomes` : 'Welcome to'}
            </div>
          </div>

          {/* Zodiac Symbol */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'Astronomicon',
                fontSize: symbolSize,
                color: elementColor,
                marginBottom: 20,
                lineHeight: 1,
                display: 'flex',
              }}
            >
              {getZodiacGlyph(data.sign)}
            </div>

            <div
              style={{
                fontSize: signSize,
                fontWeight: 400,
                color: elementColor,
                letterSpacing: '0.05em',
                marginBottom: 20,
                display: 'flex',
              }}
            >
              {data.sign} Season
            </div>

            {/* Element & Modality Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 24px',
                background: `rgba(${parseInt(elementColor.slice(1, 3), 16)}, ${parseInt(elementColor.slice(3, 5), 16)}, ${parseInt(elementColor.slice(5, 7), 16)}, 0.15)`,
                border: `1px solid ${elementColor}`,
                borderRadius: 9999,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  fontSize: badgeSize,
                  color: elementColor,
                  fontWeight: 300,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  display: 'flex',
                }}
              >
                {data.modality} {data.element}
              </div>
            </div>

            {/* Date Range */}
            <div
              style={{
                fontSize: dateSize,
                color: OG_COLORS.textTertiary,
                marginBottom: 28,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {dateRangeText}
            </div>

            {/* Themes */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                alignItems: 'center',
              }}
            >
              {data.themes.map((theme, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: themeSize,
                    color: OG_COLORS.textSecondary,
                    letterSpacing: '0.05em',
                    display: 'flex',
                  }}
                >
                  {theme}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <ShareFooter baseUrl={baseUrl} format={format} />
        </div>
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
          weight: 400,
        },
      ],
    });
  } catch (error) {
    console.error('[ZodiacSeasonOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
