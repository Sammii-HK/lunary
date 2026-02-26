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
  ShareFooter,
  SHARE_BORDERS,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface NumerologyShareRecord {
  shareId: string;
  name?: string;
  birthDate?: string;
  lifePath: number;
  soulUrge: number;
  expression: number;
  lifePathMeaning: string;
  soulUrgeMeaning: string;
  expressionMeaning: string;
  createdAt: string;
}

const NUMBER_COLORS = {
  lifePath: OG_COLORS.primaryViolet,
  expression: OG_COLORS.cometTrail,
  soulUrge: OG_COLORS.galaxyHaze,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    // Check for URL parameters for real-time data (Priority 0 Data Flow Fix)
    const urlName = searchParams.get('name');
    const urlBirthDate = searchParams.get('birthDate');
    const urlLifePath = searchParams.get('lifePath');
    const urlSoulUrge = searchParams.get('soulUrge');
    const urlExpression = searchParams.get('expression');
    const urlLifePathMeaning = searchParams.get('lifePathMeaning');
    const urlSoulUrgeMeaning = searchParams.get('soulUrgeMeaning');
    const urlExpressionMeaning = searchParams.get('expressionMeaning');

    let data: NumerologyShareRecord;

    // If URL params provided, use them directly instead of KV lookup
    if (urlLifePath || urlSoulUrge || urlExpression) {
      data = {
        shareId: 'url-params',
        name: urlName || undefined,
        createdAt: new Date().toISOString(),
        birthDate: urlBirthDate || undefined,
        lifePath: urlLifePath ? parseInt(urlLifePath) : 7,
        soulUrge: urlSoulUrge ? parseInt(urlSoulUrge) : 3,
        expression: urlExpression ? parseInt(urlExpression) : 5,
        lifePathMeaning: urlLifePathMeaning
          ? decodeURIComponent(urlLifePathMeaning)
          : 'The Seeker - wisdom and introspection',
        soulUrgeMeaning: urlSoulUrgeMeaning
          ? decodeURIComponent(urlSoulUrgeMeaning)
          : 'The Creative - self-expression and joy',
        expressionMeaning: urlExpressionMeaning
          ? decodeURIComponent(urlExpressionMeaning)
          : 'The Explorer - freedom and change',
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      // Fetch share data from KV or use demo data
      const raw = await kvGet(`numerology:${shareId}`);

      if (!raw || shareId === 'demo') {
        // Provide demo/fallback data
        data = {
          shareId: 'demo',
          createdAt: new Date().toISOString(),
          name: 'Demo User',
          birthDate: '1990-07-15',
          lifePath: 7,
          soulUrge: 3,
          expression: 5,
          lifePathMeaning: 'The Seeker - wisdom and introspection',
          soulUrgeMeaning: 'The Creative - self-expression and joy',
          expressionMeaning: 'The Explorer - freedom and change',
        };
      } else {
        data = JSON.parse(raw) as NumerologyShareRecord;
      }
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 80 : 60;
    const titleSize = isLandscape ? 48 : isStory ? 84 : 72;
    const subtitleSize = isLandscape ? 18 : isStory ? 28 : 24;
    const numberSize = isLandscape ? 80 : isStory ? 200 : 120;
    const labelSize = isLandscape ? 14 : isStory ? 24 : 20;
    const meaningSize = isLandscape ? 16 : isStory ? 24 : 22;

    // Generate unique starfield based on shareId
    const stars = generateStarfield(data.shareId, getStarCount(format));

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

    // Card-based number component matching app aesthetic
    const renderNumberCard = (
      number: number,
      label: string,
      meaning: string,
      color: string,
      isLifePath: boolean = false,
    ) => {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: isLandscape ? '20px 24px' : '28px 32px',
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            border: SHARE_BORDERS.card,
            borderRadius: isLandscape ? 16 : 20,
            flex: 1,
            gap: isLandscape ? 8 : 12,
            ...(isLifePath ? { borderLeft: '4px solid #8458D8' } : {}),
          }}
        >
          <div
            style={{
              fontSize: numberSize,
              fontWeight: 300,
              color: color,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {number}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: OG_COLORS.textTertiary,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              display: 'flex',
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: meaningSize,
              color: OG_COLORS.textSecondary,
              lineHeight: 1.4,
              display: 'flex',
            }}
          >
            {meaning}
          </div>
        </div>
      );
    };

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - Three cards in a row
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: '48px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {starfieldJsx}

        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 24,
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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s Numbers` : 'Your Numbers'}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 6,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            Numerology Profile
          </div>
        </div>

        {/* Three cards in row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 20,
            flex: 1,
            alignItems: 'stretch',
          }}
        >
          {renderNumberCard(
            data.lifePath,
            'Life Path',
            data.lifePathMeaning,
            NUMBER_COLORS.lifePath,
            true,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            NUMBER_COLORS.expression,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            NUMBER_COLORS.soulUrge,
          )}
        </div>

        {/* Footer */}
        <ShareFooter format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Cards stacked vertically with breathing room
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
          border: SHARE_IMAGE_BORDER,
        }}
      >
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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s Numbers` : 'Your Numbers'}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 12,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            Numerology Profile
          </div>
        </div>

        {/* Numbers stacked */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            flex: 1,
          }}
        >
          {renderNumberCard(
            data.lifePath,
            'Life Path',
            data.lifePathMeaning,
            NUMBER_COLORS.lifePath,
            true,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            NUMBER_COLORS.expression,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            NUMBER_COLORS.soulUrge,
          )}
        </div>

        {/* Footer */}
        <ShareFooter format={format} />
      </div>
    ) : (
      // Square Layout - Cards stacked vertically
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: '60px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {starfieldJsx}

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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {firstName ? `${firstName}'s Numbers` : 'Your Numbers'}
          </div>
          <div
            style={{
              fontSize: subtitleSize,
              color: OG_COLORS.textTertiary,
              marginTop: 10,
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            Numerology Profile
          </div>
        </div>

        {/* Numbers Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
          }}
        >
          {renderNumberCard(
            data.lifePath,
            'Life Path',
            data.lifePathMeaning,
            NUMBER_COLORS.lifePath,
            true,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            NUMBER_COLORS.expression,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            NUMBER_COLORS.soulUrge,
          )}
        </div>

        {/* Footer */}
        <ShareFooter format={format} />
      </div>
    );

    const fonts = await loadShareFonts(request);
    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
    });
  } catch (error) {
    console.error('[NumerologyOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
