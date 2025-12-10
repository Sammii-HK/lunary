import { ImageResponse } from 'next/og';
import { ReactNode } from 'react';

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
      'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 50%, #0a0a0f 100%)',
    textColor: 'white',
    accentColor: '#60a5fa',
  },
  tarot: (colorHex: string) => ({
    background: `linear-gradient(135deg, ${colorHex}, #0a0a1a)`,
    textColor: 'white',
    accentColor: colorHex,
  }),
  grimoire: {
    background:
      'linear-gradient(135deg, #1a0f1f 0%, #1a1a2e 50%, #0a0a0f 100%)',
    textColor: 'white',
    accentColor: '#c084fc',
  },
} as const;

export function getLunarBackgroundVariant(dayOfMonth: number): string {
  const variation = dayOfMonth % 5;
  const themes = [
    'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a0f1f 0%, #1a1a2e 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #150d1a 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 50%, #0a0a0f 100%)',
    'linear-gradient(135deg, #1a1a2e 0%, #0a0a12 50%, #0a0a0f 100%)',
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

export type OGImageSize = 'square' | 'landscape' | 'portrait';

const imageSizes: Record<OGImageSize, { width: number; height: number }> = {
  square: { width: 1200, height: 1200 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 630, height: 1200 },
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
