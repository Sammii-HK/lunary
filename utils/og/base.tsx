import { ImageResponse } from 'next/og';
import { ReactNode } from 'react';
import { generateStarfield, type Star } from '@/lib/share/og-utils';
import { hexToRgba } from './gradients';

export type OGTheme = {
  background: string;
  textColor?: string;
  accentColor?: string;
};

export const defaultThemes = {
  cosmic: {
    background:
      'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #312e81 70%, #1e1b2e 100%)',
    textColor: 'white',
    accentColor: '#a78bfa',
  },
  lunar: {
    background:
      'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #0a0a0a 100%)',
    textColor: 'white',
    accentColor: '#60a5fa',
  },
  tarot: (colorHex: string) => ({
    background: `linear-gradient(135deg, ${colorHex}, #0a0a0a)`,
    textColor: 'white',
    accentColor: colorHex,
  }),
  grimoire: {
    background:
      'linear-gradient(135deg, #1a1515 0%, #1a1a1a 50%, #0a0a0a 100%)',
    textColor: 'white',
    accentColor: '#c084fc',
  },
} as const;

export function getLunarBackgroundVariant(dayOfMonth: number): string {
  const variation = dayOfMonth % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 50%, #0a0a0a 100%)',
    'linear-gradient(135deg, #1a1515 0%, #1a1a1a 50%, #0a0a0a 100%)',
    'linear-gradient(135deg, #1a1a1a 0%, #151515 50%, #0a0a0a 100%)',
    'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 50%, #0a0a0a 100%)',
    'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 50%, #0a0a0a 100%)',
  ];
  return themes[variation];
}

export interface OGWrapperProps {
  children: ReactNode;
  theme?: OGTheme;
  padding?: string;
}

export function OGWrapper({
  children,
  theme,
  padding = '60px 40px',
}: OGWrapperProps) {
  const resolvedTheme = theme || defaultThemes.cosmic;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: resolvedTheme.background,
        fontFamily: 'Roboto Mono',
        color: resolvedTheme.textColor || 'white',
        padding,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

export interface OGHeaderProps {
  title?: string;
  subtitle?: string;
  fontSize?: number;
  paddingTop?: string;
}

export function OGHeader({
  title = 'Lunary',
  subtitle,
  fontSize = 32,
  paddingTop = '100px',
}: OGHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '40px',
        paddingTop,
      }}
    >
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: '400',
          color: 'white',
          textAlign: 'center',
          letterSpacing: '0.1em',
          fontFamily: 'Roboto Mono',
          display: 'flex',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: '24px',
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.1em',
            opacity: 0.7,
            marginTop: '16px',
            display: 'flex',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}

export interface OGFooterProps {
  date?: string;
  showBranding?: boolean;
}

export function OGFooter({ date, showBranding = true }: OGFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {date && (
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Roboto Mono',
            marginBottom: '20px',
          }}
        >
          {date}
        </div>
      )}
      {showBranding && (
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            letterSpacing: '1px',
            marginBottom: '40px',
          }}
        >
          lunary.app
        </div>
      )}
    </div>
  );
}

export interface OGContentCenterProps {
  children: ReactNode;
}

export function OGContentCenter({ children }: OGContentCenterProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
      }}
    >
      {children}
    </div>
  );
}

export interface OGTitleProps {
  text: string;
  fontSize?: number;
  marginBottom?: string;
}

export function OGTitle({
  text,
  fontSize = 64,
  marginBottom = '40px',
}: OGTitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${fontSize}px`,
        fontWeight: '400',
        color: 'white',
        textAlign: 'center',
        letterSpacing: '0.1em',
        marginBottom,
      }}
    >
      {text}
    </div>
  );
}

export interface OGSubtitleProps {
  text: string;
  fontSize?: number;
  opacity?: number;
}

export function OGSubtitle({
  text,
  fontSize = 24,
  opacity = 0.7,
}: OGSubtitleProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${fontSize}px`,
        color: 'white',
        textAlign: 'center',
        opacity,
        letterSpacing: '0.1em',
      }}
    >
      {text}
    </div>
  );
}

export type OGImageSize = 'square' | 'landscape' | 'portrait' | 'story';

const imageSizes: Record<OGImageSize, { width: number; height: number }> = {
  square: { width: 1200, height: 1200 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 630, height: 1200 },
  story: { width: 1080, height: 1920 },
};

export interface CreateOGResponseOptions {
  size?: OGImageSize;
  fonts?: Array<{
    name: string;
    data: ArrayBuffer;
    style?: 'normal' | 'italic';
    weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  }>;
  cacheControl?: string;
}

export function createOGResponse(
  element: JSX.Element,
  options: CreateOGResponseOptions = {},
): ImageResponse {
  const { size = 'square', fonts = [] } = options;
  const dimensions = imageSizes[size];

  return new ImageResponse(element, {
    ...dimensions,
    fonts,
  });
}

export function createCachedOGResponse(
  imageResponse: Response,
  maxAge: number = 3600,
): Response {
  const headers = new Headers(imageResponse.headers);
  headers.set(
    'Cache-Control',
    `public, s-maxage=${maxAge}, stale-while-revalidate=${Math.floor(maxAge / 2)}, max-age=${maxAge}`,
  );
  headers.set('CDN-Cache-Control', `public, s-maxage=${maxAge}`);
  headers.set('Vercel-CDN-Cache-Control', `public, s-maxage=${maxAge}`);

  return new Response(imageResponse.body, {
    status: imageResponse.status,
    statusText: imageResponse.statusText,
    headers,
  });
}

export function formatOGDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// THEMATIC COMPONENTS
// ============================================================================

export interface OGSymbolProps {
  symbol: string;
  size?: number;
  color?: string;
  glowColor?: string;
}

/**
 * Large centered symbol with optional glow effect
 */
export function OGSymbol({
  symbol,
  size = 120,
  color = 'white',
  glowColor,
}: OGSymbolProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${size}px`,
        color,
        textAlign: 'center',
        lineHeight: 1,
        textShadow: glowColor
          ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}`
          : 'none',
      }}
    >
      {symbol}
    </div>
  );
}

export interface OGCategoryLabelProps {
  label: string;
  color?: string;
  size?: number;
}

/**
 * Subtle category label at top of image
 */
export function OGCategoryLabel({
  label,
  color = 'rgba(255, 255, 255, 0.5)',
  size = 22,
}: OGCategoryLabelProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${size}px`,
        fontWeight: '400',
        color,
        textAlign: 'center',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
  );
}

export interface OGAttributeLineProps {
  text: string;
  color?: string;
  size?: number;
}

/**
 * Subtle attribute line below title (e.g., "Cardinal Fire • Mars")
 */
export function OGAttributeLine({
  text,
  color = 'rgba(255, 255, 255, 0.6)',
  size = 24,
}: OGAttributeLineProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: `${size}px`,
        fontWeight: '300',
        color,
        textAlign: 'center',
        letterSpacing: '0.1em',
        marginTop: '20px',
      }}
    >
      {text}
    </div>
  );
}

export interface OGMinimalFooterProps {
  opacity?: number;
}

/**
 * Minimal, subtle footer with just lunary.app watermark
 */
export function OGMinimalFooter({ opacity = 0.4 }: OGMinimalFooterProps) {
  return (
    <div
      style={{
        display: 'flex',
        fontSize: '18px',
        fontWeight: '300',
        color: `rgba(255, 255, 255, ${opacity})`,
        letterSpacing: '0.1em',
        marginBottom: '30px',
      }}
    >
      lunary.app
    </div>
  );
}

export interface ThematicOGTheme {
  gradient: string;
  accentColor: string;
  textColor: string;
  subtleTextColor: string;
}

/**
 * Create an OG theme from thematic parameters
 */
export function createThematicTheme(theme: ThematicOGTheme): OGTheme {
  return {
    background: theme.gradient,
    textColor: theme.textColor,
    accentColor: theme.accentColor,
  };
}

// Responsive sizing for different formats
export function getThematicSizes(format: OGImageSize) {
  switch (format) {
    case 'story':
      return {
        symbolSize: 140,
        titleSize: 64,
        subtitleSize: 32,
        attributeSize: 26,
        labelSize: 24,
        padding: '80px 60px',
      };
    case 'square':
      return {
        symbolSize: 120,
        titleSize: 64,
        subtitleSize: 28,
        attributeSize: 24,
        labelSize: 22,
        padding: '60px 50px',
      };
    case 'portrait':
      return {
        symbolSize: 100,
        titleSize: 56,
        subtitleSize: 24,
        attributeSize: 20,
        labelSize: 20,
        padding: '50px 40px',
      };
    case 'landscape':
    default:
      return {
        symbolSize: 80,
        titleSize: 52,
        subtitleSize: 24,
        attributeSize: 20,
        labelSize: 18,
        padding: '40px 60px',
      };
  }
}

// ============================================================================
// ATMOSPHERIC COMPONENTS
// ============================================================================

export interface OGStarfieldProps {
  seed: string;
  count?: number;
  accentColor?: string;
}

/**
 * Starfield background layer using generateStarfield from og-utils.
 * ~20% of stars are tinted with the accent color.
 */
export function OGStarfield({
  seed,
  count = 60,
  accentColor,
}: OGStarfieldProps) {
  const stars: Star[] = generateStarfield(seed, count);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {stars.map((star, i) => {
        const isTinted = accentColor && i % 5 === 0; // ~20% tinted
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: '50%',
              backgroundColor: isTinted
                ? hexToRgba(accentColor, star.opacity * 0.9)
                : `rgba(255, 255, 255, ${star.opacity * 0.7})`,
            }}
          />
        );
      })}
    </div>
  );
}

export interface OGGlowOrbsProps {
  accentColor: string;
}

/**
 * Two large radial-gradient ellipses in accent color at low opacity for depth.
 */
export function OGGlowOrbs({ accentColor }: OGGlowOrbsProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
      }}
    >
      {/* Primary orb - centered behind content */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '70%',
          height: '60%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${hexToRgba(accentColor, 0.25)} 0%, transparent 70%)`,
        }}
      />
      {/* Secondary orb - lower corner for depth */}
      <div
        style={{
          position: 'absolute',
          bottom: '5%',
          right: '5%',
          width: '50%',
          height: '45%',
          borderRadius: '50%',
          background: `radial-gradient(ellipse at center, ${hexToRgba(accentColor, 0.18)} 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

export interface OGSymbolBackdropProps {
  accentColor: string;
  size?: number;
}

/**
 * Radial-gradient circle behind the symbol for visual weight.
 */
export function OGSymbolBackdrop({
  accentColor,
  size = 250,
}: OGSymbolBackdropProps) {
  return (
    <div
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${hexToRgba(accentColor, 0.35)} 0%, ${hexToRgba(accentColor, 0.12)} 50%, transparent 70%)`,
        display: 'flex',
      }}
    />
  );
}
