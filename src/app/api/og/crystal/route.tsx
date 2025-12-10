import { NextRequest } from 'next/server';
import { getGeneralCrystalRecommendation } from '../../../../../utils/crystals/generalCrystals';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import { getCrystalByName } from '../../../../constants/grimoire/crystals';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
  createOGResponse,
  formatOGDate,
} from '../../../../../utils/og/base';

export const runtime = 'nodejs';
export const revalidate = 86400;

function getCrystalTheme(crystalName: string): string {
  const crystal = getCrystalByName(crystalName);
  const colorHex = crystal?.ogColor || '#9333EA';
  return `linear-gradient(135deg, ${colorHex}40, #0a0a0a)`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  let crystalRec;
  try {
    crystalRec = getGeneralCrystalRecommendation(targetDate);
  } catch (error) {
    console.error('Error getting crystal recommendation:', error);
    crystalRec = {
      name: 'Clear Quartz',
      reason: 'A universal crystal for clarity and amplification',
      properties: ['clarity', 'amplification', 'healing'],
      guidance: 'Work with Clear Quartz to amplify your intentions.',
    };
  }

  const formattedDate = formatOGDate(targetDate);
  const background = getCrystalTheme(crystalRec.name);
  const propertiesText = crystalRec.properties.slice(0, 3).join(' • ');

  const robotoFont = await loadGoogleFont(request);

  return createOGResponse(
    <OGWrapper theme={{ background }}>
      <OGHeader title={propertiesText} fontSize={24} />

      <OGContentCenter>
        <OGTitle text={crystalRec.name} />
        <OGSubtitle text='Crystal of the Day' fontSize={32} opacity={0.8} />
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
