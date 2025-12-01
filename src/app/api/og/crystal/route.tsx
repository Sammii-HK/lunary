import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getGeneralCrystalRecommendation } from '../../../../../utils/crystals/generalCrystals';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import { getCrystalByName } from '../../../../constants/grimoire/crystals';

export const runtime = 'nodejs';
export const revalidate = 86400;

function getCrystalTheme(crystalName: string) {
  const crystal = getCrystalByName(crystalName);
  const colorHex = crystal?.ogColor || '#9333EA';
  return `linear-gradient(135deg, ${colorHex}40, #0a0a1a)`;
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

  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  const theme = getCrystalTheme(crystalRec.name);
  const robotoFont = await loadGoogleFont(request);

  const propertiesText = crystalRec.properties.slice(0, 3).join(' • ');

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: theme,
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '40px',
            paddingTop: '100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: '24px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              opacity: 0.7,
            }}
          >
            {propertiesText}
          </div>
        </div>

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
          <div
            style={{
              display: 'flex',
              fontSize: '64px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '40px',
            }}
          >
            {crystalRec.name}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '32px',
              color: 'white',
              textAlign: 'center',
              fontWeight: '300',
              opacity: 0.8,
            }}
          >
            Crystal of the Day
          </div>
        </div>

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
          {formattedDate}
        </div>

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
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: robotoFont
        ? [
            {
              name: 'Roboto Mono',
              data: robotoFont,
              style: 'normal',
            },
          ]
        : [],
    },
  );
}
