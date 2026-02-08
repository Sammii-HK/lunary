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
  OGStarfield,
  OGGlowOrbs,
  OGSymbolBackdrop,
  createOGResponse,
  getThematicSizes,
  createThematicTheme,
  type OGImageSize,
} from '../../../../../utils/og/base';
import {
  getCategoryTheme,
  getSymbolForContent,
  getAttributeString,
  usesAstronomiconFont,
  usesImageForSymbol,
  getMoonPhaseImage,
} from '../../../../../utils/og/symbols';
import {
  getOgData,
  needsRunicFont,
  usesMoonImages,
} from '../../../../../utils/og/grimoire-og-data';
import {
  createSubtleGradient,
  createVibrantGradient,
  hexToRgba,
} from '../../../../../utils/og/gradients';
import { thematicPaletteConfig } from '@/constants/seo/thematic-palette-config';
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

    // Note: 'v' query param used for cache busting (not read, just changes URL)

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

    // Get theme - ALWAYS prefer vibrant 3-color palette over legacy 2-color gradients
    // Priority: palette config > dynamic single color > dynamic 2-color gradient > category fallback
    const paletteKey =
      category.toLowerCase() as keyof typeof thematicPaletteConfig.palettesByTopLevelCategory;
    const paletteEntry =
      thematicPaletteConfig.palettesByTopLevelCategory[paletteKey];

    let themeData;
    if (paletteEntry) {
      // Use vibrant 3-color palette (new system)
      themeData = {
        gradient: createVibrantGradient(paletteEntry.backgrounds),
        accentColor: dynamicData?.color || paletteEntry.highlight,
        textColor: '#F1F5F9',
        subtleTextColor: 'rgba(148, 163, 184, 0.6)',
      };
    } else if (dynamicData?.color) {
      // Single color with default gradient (used by crystals, chakras)
      themeData = {
        gradient: createSubtleGradient(['#1e293b', '#0f172a']),
        accentColor: dynamicData.color,
        textColor: '#F1F5F9',
        subtleTextColor: 'rgba(148, 163, 184, 0.6)',
      };
    } else if (dynamicData?.gradient) {
      // Legacy 2-color gradient fallback (old tarot suits, etc.)
      themeData = {
        gradient: createSubtleGradient(dynamicData.gradient),
        accentColor: dynamicData.color || '#A78BFA',
        textColor: '#F1F5F9',
        subtleTextColor: 'rgba(148, 163, 184, 0.6)',
      };
    } else {
      // getCategoryTheme fallback (for categories not in palette config)
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

    // Normalize for comparison - remove all non-alphanumeric chars and lowercase
    const normalizeForComparison = (str: string) =>
      str
        .toString()
        .replace(/[^a-z0-9]/gi, '')
        .toLowerCase();

    const titleNormalized = normalizeForComparison(formattedTitle);
    const slugNormalized = normalizeForComparison(slug);

    // First check if URL symbol param matches title - if so, ignore it
    // Use includes() to handle cases like title "111 Angel Number" with symbol "111"
    // Exception: Unicode symbols (runes, etc.) normalize to empty string - always allow them
    const symbolNormalized = symbol ? normalizeForComparison(symbol) : '';
    const isUrlSymbolUnicode = symbol && symbolNormalized === '';
    const symbolFromUrl =
      symbol &&
      (isUrlSymbolUnicode ||
        (symbolNormalized && !titleNormalized.includes(symbolNormalized)))
        ? symbol
        : null;

    const rawSymbol =
      !needsImage &&
      (symbolFromUrl ||
        dynamicData?.symbol ||
        getSymbolForContent(category, slug));

    // Double-check: if symbol still matches title or slug after all lookups, hide it
    // Use includes() to handle cases like title "111 Angel Number" with symbol "111"
    // Exception: Unicode symbols (runes, etc.) that normalize to empty string should always show
    const rawSymbolNorm = rawSymbol ? normalizeForComparison(rawSymbol) : '';
    const isUnicodeSymbol = rawSymbol && rawSymbolNorm === '';
    const displaySymbol =
      rawSymbol &&
      (isUnicodeSymbol ||
        (rawSymbolNorm &&
          !titleNormalized.includes(rawSymbolNorm) &&
          !slugNormalized.includes(rawSymbolNorm)))
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

    // Universal glow color - all categories get a glow from their accent color
    const accentColor = themeData.accentColor;
    const glowColor = hexToRgba(accentColor, 0.3);

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

    const ogResponse = createOGResponse(
      <OGWrapper theme={theme} padding={sizes.padding}>
        {/* Atmospheric layers */}
        <OGStarfield
          seed={`${category}-${slug}`}
          count={format === 'story' ? 80 : 60}
          accentColor={accentColor}
        />
        <OGGlowOrbs accentColor={accentColor} />

        {/* Category label at top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: format === 'story' ? '40px' : '20px',
            zIndex: 1,
          }}
        >
          <OGCategoryLabel
            label={categoryLabel}
            color={hexToRgba(accentColor, 0.7)}
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
              zIndex: 1,
            }}
          >
            {/* Moon phase image */}
            {moonImage && (
              <div
                style={{
                  display: 'flex',
                  marginBottom: '50px',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <OGSymbolBackdrop
                  accentColor={accentColor}
                  size={sizes.symbolSize * 2}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${baseUrl}${moonImage}`}
                  width={sizes.symbolSize}
                  height={sizes.symbolSize}
                  alt={formattedTitle}
                  style={{ opacity: 0.95, position: 'relative' }}
                />
              </div>
            )}

            {/* Symbol (Astronomicon for zodiac/planetary, Noto Sans Runic for runes, Roboto for others) */}
            {displaySymbol && (
              <div
                style={{
                  display: 'flex',
                  marginBottom: '50px',
                  position: 'relative',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <OGSymbolBackdrop
                  accentColor={accentColor}
                  size={sizes.symbolSize * 2.5}
                />
                <div
                  style={{
                    display: 'flex',
                    fontFamily: needsAstromicon
                      ? 'Astronomicon'
                      : needsRunic
                        ? 'Noto Sans Runic'
                        : 'Roboto Mono',
                    fontSize: `${sizes.symbolSize}px`,
                    color: accentColor,
                    textShadow: `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`,
                    lineHeight: 1,
                    position: 'relative',
                  }}
                >
                  {displaySymbol}
                </div>
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
        <OGMinimalFooter opacity={0.5} />
      </OGWrapper>,
      {
        size: format as OGImageSize,
        fonts,
      },
    );

    // Add cache headers that respect the v param for proper cache busting
    const headers = new Headers(ogResponse.headers);
    headers.set(
      'Cache-Control',
      'public, s-maxage=2592000, stale-while-revalidate=86400, immutable',
    );
    headers.set('CDN-Cache-Control', 'public, s-maxage=2592000, immutable');
    headers.set(
      'Vercel-CDN-Cache-Control',
      'public, s-maxage=2592000, immutable',
    );

    return new Response(ogResponse.body, {
      status: ogResponse.status,
      statusText: ogResponse.statusText,
      headers,
    });
  } catch (error) {
    console.error('Error generating thematic image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
