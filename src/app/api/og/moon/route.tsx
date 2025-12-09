import { NextRequest } from 'next/server';
import {
  getAccurateMoonPhase,
  loadGoogleFont,
} from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
  createOGResponse,
  getLunarBackgroundVariant,
  formatOGDate,
} from '../../../../../utils/og/base';

export const runtime = 'nodejs';
export const revalidate = 86400;

function getMoonPhaseSvgPath(phaseName: string): string {
  const lower = phaseName.toLowerCase();

  if (lower.includes('new')) return 'new-moon';
  if (lower.includes('waxing') && lower.includes('crescent'))
    return 'waxing-cresent-moon';
  if (lower.includes('first quarter')) return 'first-quarter';
  if (lower.includes('waxing') && lower.includes('gibbous'))
    return 'waxing-gibbous-moon';
  if (lower.includes('full')) return 'full-moon';
  if (lower.includes('waning') && lower.includes('gibbous'))
    return 'waning-gibbous-moon';
  if (lower.includes('last quarter') || lower.includes('third quarter'))
    return 'last-quarter';
  if (lower.includes('waning') && lower.includes('crescent'))
    return 'waning-cresent-moon';

  return 'full-moon';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  const baseUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://lunary.app'
      : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  const moonPhase = getAccurateMoonPhase(targetDate);
  const formattedDate = formatOGDate(targetDate);
  const background = getLunarBackgroundVariant(targetDate.getDate());

  const robotoFont = await loadGoogleFont(request);

  return createOGResponse(
    <OGWrapper theme={{ background }}>
      <OGHeader
        title={`${Math.round(moonPhase.illumination)}% ILLUMINATED`}
        fontSize={24}
      />

      <OGContentCenter>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${baseUrl}/icons/dotty/moon-phases/${getMoonPhaseSvgPath(moonPhase.name)}.png`}
          width={180}
          height={180}
          alt={moonPhase.name}
          style={{ marginBottom: '30px' }}
        />
        <OGTitle text={moonPhase.name} marginBottom='30px' />
        <OGSubtitle text={moonPhase.energy} />
      </OGContentCenter>

      <OGFooter date={formattedDate} />
    </OGWrapper>,
    {
      size: 'square',
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
