import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import {
  loadGoogleFont,
  loadAstronomiconFont,
} from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGContentCenter,
  OGCategoryLabel,
  OGAttributeLine,
  OGMinimalFooter,
  createOGResponse,
  getThematicSizes,
  createThematicTheme,
  type OGImageSize,
} from '../../../../../utils/og/base';
import {
  getCategoryTheme,
  getSymbolForContent,
  getAttributeString,
  chakraColors,
  usesAstronomiconFont,
  usesImageForSymbol,
  getMoonPhaseImage,
} from '../../../../../utils/og/symbols';
import {
  getOgData,
  needsRunicFont,
  usesMoonImages,
} from '../../../../../utils/og/grimoire-og-data';
import { createSubtleGradient } from '../../../../../utils/og/gradients';
import { capitalizeThematicTitle } from '../../../../../utils/og/text';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours

type Format = 'square' | 'landscape' | 'portrait' | 'story';

// Load Noto Sans Runic font for Elder Futhark runes
async function loadRunicFont(): Promise<ArrayBuffer | null> {
  try {
    const fontPath = path.join(
      process.cwd(),
      'public',
      'fonts',
      'NotoSansRunic-Regular.ttf',
    );
    const fontData = await fs.readFile(fontPath);
    return fontData.buffer.slice(
      fontData.byteOffset,
      fontData.byteOffset + fontData.byteLength,
    ) as ArrayBuffer;
  } catch (error) {
    console.error('Failed to load Noto Sans Runic font:', error);
    return null;
  }
}

const FORMATS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

// Poetic category labels based on content
function getPoeticLabel(category: string, slug: string): string {
  const normalizedSlug = slug.toLowerCase().replace(/\s+/g, '-');

  switch (category) {
    case 'zodiac': {
      // Element-based labels
      const fireSign = ['aries', 'leo', 'sagittarius'].includes(normalizedSlug);
      const earthSign = ['taurus', 'virgo', 'capricorn'].includes(
        normalizedSlug,
      );
      const airSign = ['gemini', 'libra', 'aquarius'].includes(normalizedSlug);
      const waterSign = ['cancer', 'scorpio', 'pisces'].includes(
        normalizedSlug,
      );

      if (fireSign) return 'Fire Signs';
      if (earthSign) return 'Earth Signs';
      if (airSign) return 'Air Signs';
      if (waterSign) return 'Water Signs';
      return 'The Zodiac';
    }

    case 'tarot': {
      if (normalizedSlug.includes('wands')) return 'Suit of Wands';
      if (normalizedSlug.includes('cups')) return 'Suit of Cups';
      if (normalizedSlug.includes('swords')) return 'Suit of Swords';
      if (normalizedSlug.includes('pentacles')) return 'Suit of Pentacles';
      return 'Major Arcana';
    }

    case 'lunar':
      return 'Lunar Cycle';

    case 'crystals':
      return 'Crystal Wisdom';

    case 'chakras':
      return 'Energy Centers';

    case 'sabbat':
      return 'Wheel of the Year';

    case 'numerology':
      return 'Sacred Numbers';

    case 'runes':
      return 'Elder Futhark';

    case 'planetary':
      return 'Celestial Bodies';

    default:
      return 'Grimoire';
  }
}

export async function GET(request: NextRequest): Promise<Response> {
  try {
    const { searchParams } = new URL(request.url);

    // Required params
    const category = searchParams.get('category') || 'zodiac';
    const title = searchParams.get('title') || 'Educational Content';
    const formattedTitle = capitalizeThematicTitle(title);

    // Optional params
    const symbol = searchParams.get('symbol');
    const subtitle = searchParams.get('subtitle');
    const slug =
      searchParams.get('slug') || title.toLowerCase().replace(/\s+/g, '-');
    const formatParam = searchParams.get('format') || 'square';
    const format = (formatParam as Format) || 'square';

    // Cover image presets for video thumbnails
    // 'tiktok', 'youtube', or 'true' (defaults to tiktok)
    const coverType = searchParams.get('cover');
    const isCoverImage =
      coverType === 'true' || coverType === 'tiktok' || coverType === 'youtube';

    // Cover size presets - larger, bolder text for thumbnail legibility
    const coverSizePresets = {
      tiktok: {
        symbolSize: 210,
        titleSize: 52,
        subtitleSize: 48,
        attributeSize: 34,
        labelSize: 40,
      },
      youtube: {
        symbolSize: 62,
        titleSize: 31,
        subtitleSize: 78,
        attributeSize: 18,
        labelSize: 16,
      },
    };

    // Get base sizes, then override for cover images
    const baseSizes = getThematicSizes(format as OGImageSize);
    const coverPreset =
      coverType === 'youtube'
        ? coverSizePresets.youtube
        : coverSizePresets.tiktok;

    const sizes = isCoverImage ? { ...baseSizes, ...coverPreset } : baseSizes;

    // Try to get data from dynamic loader first
    const dynamicData = await getOgData(category, slug);

    // Determine which fonts we need
    const needsAstromicon = usesAstronomiconFont(category);
    const needsImage = usesImageForSymbol(category) || usesMoonImages(category);
    const needsRunic = needsRunicFont(category);

    // Load fonts
    let robotoFont: ArrayBuffer | null = null;
    let astronomiconFont: ArrayBuffer | null = null;
    let runicFont: ArrayBuffer | null = null;

    try {
      robotoFont = await loadGoogleFont(request);
    } catch (error) {
      console.error('Failed to load Roboto font:', error);
    }

    if (needsAstromicon) {
      try {
        astronomiconFont = await loadAstronomiconFont(request);
      } catch (error) {
        console.error('Failed to load Astronomicon font:', error);
      }
    }

    if (needsRunic) {
      runicFont = await loadRunicFont();
    }

    // Get theme - prefer dynamic data if available
    let themeData;
    if (dynamicData?.gradient) {
      themeData = {
        gradient: createSubtleGradient(dynamicData.gradient),
        accentColor: dynamicData.color || '#A78BFA',
        textColor: '#F1F5F9',
        subtleTextColor: 'rgba(148, 163, 184, 0.6)',
      };
    } else if (dynamicData?.color) {
      themeData = {
        gradient: createSubtleGradient(['#1e293b', '#0f172a']),
        accentColor: dynamicData.color,
        textColor: '#F1F5F9',
        subtleTextColor: 'rgba(148, 163, 184, 0.6)',
      };
    } else {
      themeData = getCategoryTheme(category, slug);
    }
    const theme = createThematicTheme(themeData);

    const titleMaxWidth =
      format === 'story' ? '78%' : format === 'portrait' ? '82%' : '88%';
    const titlePaddingX =
      format === 'story'
        ? '0 50px'
        : format === 'portrait'
          ? '0 40px'
          : '0 30px';

    // Get symbol if not provided (and not using images)
    // Use dynamic loader symbol, then fallback to existing symbol lookup
    // Skip symbol if it matches the title (e.g., numerology "111" symbol = "111" title)
    const titleNormalized = formattedTitle.trim().toLowerCase();

    // First check if URL symbol param matches title - if so, ignore it
    const symbolFromUrl =
      symbol?.trim().toLowerCase() === titleNormalized ? null : symbol;

    const rawSymbol =
      !needsImage &&
      (symbolFromUrl ||
        dynamicData?.symbol ||
        getSymbolForContent(category, slug));

    // Double-check: if symbol still matches title after all lookups, hide it
    const displaySymbol =
      rawSymbol && rawSymbol.toString().trim().toLowerCase() !== titleNormalized
        ? rawSymbol
        : null;

    // Get moon phase image if lunar category
    const moonImage = needsImage ? getMoonPhaseImage(slug) : null;

    // Get attribute string - prefer dynamic data
    // Skip if it matches the title (case-insensitive) to avoid duplicate headings
    const rawAttributeText =
      subtitle || dynamicData?.attributes || getAttributeString(category, slug);
    const attributeText =
      rawAttributeText &&
      rawAttributeText.trim().toLowerCase() !==
        formattedTitle.trim().toLowerCase()
        ? rawAttributeText
        : null;

    // Get glow color for chakras - use dynamic color or fallback
    const chakraColor =
      category === 'chakras'
        ? dynamicData?.color || chakraColors[slug]?.primary
        : null;
    const glowColor = chakraColor
      ? `${chakraColor}50`
      : category === 'chakras' && slug
        ? chakraColors[slug]?.glow
        : undefined;

    // Poetic category label - prefer dynamic data
    const categoryLabel =
      dynamicData?.categoryLabel || getPoeticLabel(category, slug);

    // Build base URL for images
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.APP_BASE_URL ||
          'http://localhost:3000';

    // Build fonts array
    const fonts: Array<{
      name: string;
      data: ArrayBuffer;
      style: 'normal' | 'italic';
      weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    }> = [];

    if (robotoFont) {
      fonts.push({
        name: 'Roboto Mono',
        data: robotoFont,
        style: 'normal' as const,
      });
    }

    if (astronomiconFont) {
      fonts.push({
        name: 'Astronomicon',
        data: astronomiconFont,
        style: 'normal' as const,
        weight: 400,
      });
    }

    if (runicFont) {
      fonts.push({
        name: 'Noto Sans Runic',
        data: runicFont,
        style: 'normal' as const,
        weight: 400,
      });
    }

    const contentOffsetY = isCoverImage ? -140 : format === 'story' ? -88 : 0;

    return createOGResponse(
      <OGWrapper theme={theme} padding={sizes.padding}>
        {/* Category label at top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: format === 'story' ? '40px' : '20px',
          }}
        >
          <OGCategoryLabel
            label={categoryLabel}
            color={themeData.subtleTextColor}
            size={sizes.labelSize}
          />
        </div>

        {/* Main content - shifted down slightly for better visual balance */}
        <OGContentCenter>
          <div
            style={{
              transform: `translateY(${contentOffsetY}px)`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* Moon phase image */}
            {moonImage && (
              <div style={{ display: 'flex', marginBottom: '50px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${baseUrl}${moonImage}`}
                  width={sizes.symbolSize}
                  height={sizes.symbolSize}
                  alt={formattedTitle}
                  style={{ opacity: 0.95 }}
                />
              </div>
            )}

            {/* Symbol (Astronomicon for zodiac/planetary, Noto Sans Runic for runes, Roboto for others) */}
            {displaySymbol && (
              <div
                style={{
                  display: 'flex',
                  marginBottom: '50px',
                  fontFamily: needsAstromicon
                    ? 'Astronomicon'
                    : needsRunic
                      ? 'Noto Sans Runic'
                      : 'Roboto Mono',
                  fontSize: `${sizes.symbolSize}px`,
                  color: themeData.textColor,
                  textShadow: glowColor
                    ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`
                    : 'none',
                  lineHeight: 1,
                }}
              >
                {displaySymbol}
              </div>
            )}

            {/* Title */}
            <div
              style={{
                display: 'flex',
                fontSize: `${sizes.titleSize}px`,
                fontWeight: '700',
                color: themeData.textColor,
                textAlign: 'center',
                letterSpacing: '0.05em',
                textTransform: 'none',
                fontFamily: 'Roboto Mono',
                textShadow: isCoverImage
                  ? '0 4px 30px rgba(0,0,0,0.7), 0 2px 10px rgba(0,0,0,0.5)'
                  : '0 2px 20px rgba(0,0,0,0.5)',
                maxWidth: titleMaxWidth,
                padding: titlePaddingX,
                lineHeight: '1.1',
                justifyContent: 'center',
              }}
            >
              {formattedTitle}
            </div>

            {/* Attribute line */}
            {attributeText && (
              <OGAttributeLine
                text={attributeText}
                color={themeData.subtleTextColor}
                size={sizes.attributeSize}
              />
            )}
          </div>
        </OGContentCenter>

        {/* Minimal footer */}
        <OGMinimalFooter opacity={0.35} />
      </OGWrapper>,
      {
        size: format as OGImageSize,
        fonts,
      },
    );
  } catch (error) {
    console.error('Error generating thematic image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
