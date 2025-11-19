import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getGeneralCrystalRecommendation } from '../../../../../utils/crystals/generalCrystals';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const sizeParam = searchParams.get('size');

  // Normalize date to noon UTC for consistent seeding
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  // Get seeded crystal recommendation for the date
  const crystalRec = getGeneralCrystalRecommendation(targetDate);
  const crystal = crystalRec.name;
  const reason = crystalRec.reason;

  // Support landscape size (similar to cosmic route)
  const isLandscape = sizeParam === 'landscape';
  const imageWidth = isLandscape ? 1920 : 1200;
  const imageHeight = isLandscape ? 1080 : 630;

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(135deg, #1e1b2e 0%, #2d1b3d 50%, #1e293b 100%)',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            border: '2px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '24px',
            padding: '60px',
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            💎
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            {crystal}
          </div>
          {reason && (
            <div
              style={{
                fontSize: '28px',
                color: '#d4d4d8',
                marginBottom: '20px',
                textAlign: 'center',
                maxWidth: '900px',
                lineHeight: '1.4',
              }}
            >
              {reason.substring(0, 150)}...
            </div>
          )}
          <div
            style={{
              fontSize: '20px',
              color: '#71717a',
              marginTop: '50px',
              textAlign: 'center',
            }}
          >
            lunary.app
          </div>
        </div>
      </div>
    ),
    {
      width: imageWidth,
      height: imageHeight,
    },
  );
}
