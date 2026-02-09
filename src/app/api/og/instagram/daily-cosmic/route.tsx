import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getMoonPhaseIcon,
  OG_COLORS,
  generateStarfield,
} from '@/lib/share/og-utils';
import { loadIGFonts, IGBrandTag, truncateIG } from '@/lib/instagram/ig-utils';
import { IG_SIZES, IG_TEXT, IG_SPACING } from '@/lib/instagram/design-system';
import type { CosmicCardVariant } from '@/lib/instagram/types';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Simplified moon phase data for when astronomical APIs aren't available
const MOON_PHASES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
] as const;

// Variant-specific gradient backgrounds
const VARIANT_GRADIENTS: Record<CosmicCardVariant, string> = {
  moon_phase: 'linear-gradient(135deg, #0f1428 0%, #0a0d14 50%, #0a0a0a 100%)',
  transit_alert:
    'linear-gradient(135deg, #280f1a 0%, #140a0d 50%, #0a0a0a 100%)',
  daily_energy:
    'linear-gradient(135deg, #1a1028 0%, #0d0a14 50%, #0a0a0a 100%)',
};

const VARIANT_ACCENTS: Record<CosmicCardVariant, string> = {
  moon_phase: '#818CF8',
  transit_alert: '#F472B6',
  daily_energy: '#A78BFA',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateStr =
      searchParams.get('date') || new Date().toISOString().split('T')[0];
    const headline =
      searchParams.get('headline') || 'The cosmos aligns in your favour today';
    const moonPhase = searchParams.get('moonPhase') || 'Waxing Crescent';
    const variant = (searchParams.get('variant') ||
      'daily_energy') as CosmicCardVariant;

    // Debug logging
    console.log('[Daily Cosmic OG] Moon Phase Debug:', {
      receivedPhase: moonPhase,
      phaseLength: moonPhase.length,
      iconUrl: getMoonPhaseIcon(moonPhase),
    });

    const date = new Date(dateStr);
    const dateText = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    const gradient = VARIANT_GRADIENTS[variant];
    const accent = VARIANT_ACCENTS[variant];
    const moonIconUrl = getMoonPhaseIcon(moonPhase); // SVG icon URL
    const { width, height } = IG_SIZES.square;

    const fonts = await loadIGFonts(request);

    // Generate starfield
    const stars = generateStarfield(`cosmic-${dateStr}`, 50);

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: gradient,
          padding: `${IG_SPACING.padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {/* Starfield - more visible with glow */}
        {stars.map((star, i) => (
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
              opacity: star.opacity * 0.85, // Increased from 0.4 to 0.85
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})`, // Glow effect
            }}
          />
        ))}

        {/* Date label */}
        <div
          style={{
            fontSize: IG_TEXT.dark.label,
            color: OG_COLORS.textTertiary,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 40,
            display: 'flex',
          }}
        >
          {dateText}
        </div>

        {/* Moon phase icon - your brand SVG */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={moonIconUrl}
          width={180}
          height={180}
          style={{
            marginBottom: 40,
            opacity: 0.9,
            filter: 'drop-shadow(0 0 20px rgba(123, 123, 232, 0.3))',
          }}
          alt={moonPhase}
        />

        {/* Moon phase name */}
        <div
          style={{
            fontSize: IG_TEXT.dark.subtitle,
            color: accent,
            letterSpacing: '0.08em',
            marginBottom: 36,
            display: 'flex',
          }}
        >
          {moonPhase}
        </div>

        {/* Headline - ONE key insight */}
        <div
          style={{
            fontSize: IG_TEXT.dark.title - 8,
            color: OG_COLORS.textPrimary,
            textAlign: 'center',
            lineHeight: 1.3,
            maxWidth: '85%',
            display: 'flex',
            fontWeight: 600,
          }}
        >
          {truncateIG(headline, 80)}
        </div>

        <IGBrandTag baseUrl={SHARE_BASE_URL} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (error) {
    console.error('[IG Daily Cosmic] Error:', error);
    return new Response('Failed to generate daily cosmic image', {
      status: 500,
    });
  }
}
