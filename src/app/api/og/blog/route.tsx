import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
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

  return createOGResponse(
    <OGWrapper theme={{ background }}>
      <OGHeader
        title='Lunary'
        subtitle='Blog'
        fontSize={28}
        paddingTop='70px'
      />

      <OGContentCenter>
        <OGTitle text={`Weekly Astrology Forecasts • ${year}`} fontSize={58} />
        <OGSubtitle
          text='Transits • Moon Phases • Retrogrades • Cosmic Guidance'
          fontSize={28}
          opacity={0.8}
        />
      </OGContentCenter>

      <OGFooter />
    </OGWrapper>,
    {
      size: 'landscape',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
