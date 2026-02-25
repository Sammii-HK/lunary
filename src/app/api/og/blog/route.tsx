import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
  OGStarfield,
  OGGlowOrbs,
  createOGResponse,
} from '../../../../../utils/og/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  let robotoFont: ArrayBuffer | null = null;
  try {
    robotoFont = await loadGoogleFont(request);
  } catch (error) {
    console.error('Failed to load font:', error);
  }

  const year = new Date().getFullYear();
  const background =
    'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #312e81 70%, #1e1b2e 100%)';

  const accentColor = '#a78bfa';

  return createOGResponse(
    <OGWrapper theme={{ background }}>
      <OGStarfield seed='blog' count={60} accentColor={accentColor} />
      <OGGlowOrbs accentColor={accentColor} />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <OGHeader
          title='Lunary'
          subtitle='Blog'
          fontSize={28}
          paddingTop='70px'
        />

        <OGContentCenter>
          <OGTitle
            text={`Weekly Astrology Forecasts • ${year}`}
            fontSize={58}
          />
          <OGSubtitle
            text='Transits • Moon Phases • Retrogrades • Cosmic Guidance'
            fontSize={28}
            opacity={0.8}
          />
        </OGContentCenter>

        <OGFooter />
      </div>
    </OGWrapper>,
    {
      size: 'landscape',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
