import { NextRequest } from 'next/server';
import { loadGoogleFont } from '../../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
  createOGResponse,
  formatOGDate,
} from '../../../../../../utils/og/base';

export const runtime = 'nodejs';
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const robotoFont = await loadGoogleFont(request);
  const today = new Date();
  const formattedDate = formatOGDate(today);

  return createOGResponse(
    <OGWrapper
      theme={{ background: 'linear-gradient(135deg, #13141b, #0b0b0f)' }}
    >
      <OGHeader title="Today's Horoscopes" fontSize={28} />
      <OGContentCenter>
        <OGTitle text='Real-time zodiac astrology' marginBottom='20px' />
        <OGSubtitle text='Based on live planetary movement & lunar timing' />
      </OGContentCenter>
      <OGFooter date={formattedDate} />
    </OGWrapper>,
    {
      size: 'landscape',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
