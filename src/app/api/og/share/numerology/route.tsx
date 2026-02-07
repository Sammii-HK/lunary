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
  SHARE_BASE_URL,
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
    const baseUrl = SHARE_BASE_URL;

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 48 : isStory ? 60 : 60;
    const titleSize = isLandscape ? 48 : isStory ? 84 : 72;
    const numberSize = isLandscape ? 80 : isStory ? 160 : 140;
    const labelSize = isLandscape ? 22 : isStory ? 38 : 34;
    const meaningSize = isLandscape ? 20 : isStory ? 34 : 28;

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

    // Number card component
    const renderNumberCard = (
      number: number,
      label: string,
      meaning: string,
      color: string,
      compact: boolean = false,
    ) => {
      const cardPadding = compact
        ? '16px 20px'
        : isStory
          ? '32px 36px'
          : '28px 32px';
      const numSize = compact ? 56 : numberSize;
      const lblSize = compact ? 16 : labelSize;
      const mngSize = compact ? 14 : meaningSize;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: compact ? 'row' : 'column',
            padding: cardPadding,
            background: OG_COLORS.cardBg,
            border: `1px solid ${OG_COLORS.border}`,
            borderRadius: compact ? 14 : 20,
            alignItems: compact ? 'center' : 'flex-start',
            gap: compact ? 20 : 12,
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              width: compact ? 80 : 'auto',
              height: compact ? 80 : 'auto',
              borderRadius: '50%',
              background: `rgba(${color === OG_COLORS.primaryViolet ? '132, 88, 216' : color === OG_COLORS.cosmicRose ? '238, 120, 158' : '199, 125, 255'}, 0.15)`,
              alignItems: 'center',
              justifyContent: 'center',
              padding: compact ? 0 : '16px 32px',
            }}
          >
            <div
              style={{
                fontSize: numSize,
                fontWeight: 400,
                color: color,
                display: 'flex',
              }}
            >
              {number}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: lblSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontWeight: 300,
                display: 'flex',
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: mngSize,
                color: OG_COLORS.textPrimary,
                marginTop: 6,
                lineHeight: 1.4,
                display: 'flex',
              }}
            >
              {meaning}
            </div>
          </div>
        </div>
      );
    };

    // Layout based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout - Three numbers in horizontal row
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
            }}
          >
            {firstName ? `${firstName}'s Numerology` : 'My Numerology'}
          </div>
          {data.birthDate && (
            <div
              style={{
                fontSize: 18,
                color: OG_COLORS.textTertiary,
                marginTop: 8,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {new Date(data.birthDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* Three numbers in row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 16,
            flex: 1,
          }}
        >
          {renderNumberCard(
            data.lifePath,
            'Life Path',
            data.lifePathMeaning,
            OG_COLORS.primaryViolet,
            true,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            OG_COLORS.cosmicRose,
            true,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            OG_COLORS.galaxyHaze,
            true,
          )}
        </div>

        {/* Footer */}
        <ShareFooter baseUrl={baseUrl} format={format} />
      </div>
    ) : isStory ? (
      // Story Layout - Numbers stacked vertically with full meaning
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
            {firstName ? `${firstName}'s Numerology` : 'My Numerology'}
          </div>
          {data.birthDate && (
            <div
              style={{
                fontSize: 28,
                color: OG_COLORS.textTertiary,
                marginTop: 12,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {new Date(data.birthDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
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
            OG_COLORS.primaryViolet,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            OG_COLORS.cosmicRose,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            OG_COLORS.galaxyHaze,
          )}
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
            }}
          >
            {firstName ? `${firstName}'s Numerology` : 'My Numerology'}
          </div>
          {data.birthDate && (
            <div
              style={{
                fontSize: 24,
                color: OG_COLORS.textTertiary,
                marginTop: 10,
                letterSpacing: '0.1em',
                display: 'flex',
              }}
            >
              {new Date(data.birthDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* Numbers Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            flex: 1,
          }}
        >
          {renderNumberCard(
            data.lifePath,
            'Life Path',
            data.lifePathMeaning,
            OG_COLORS.primaryViolet,
          )}
          {renderNumberCard(
            data.soulUrge,
            'Soul Urge',
            data.soulUrgeMeaning,
            OG_COLORS.cosmicRose,
          )}
          {renderNumberCard(
            data.expression,
            'Expression',
            data.expressionMeaning,
            OG_COLORS.galaxyHaze,
          )}
        </div>

        {/* Footer */}
        <ShareFooter baseUrl={baseUrl} format={format} />
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
