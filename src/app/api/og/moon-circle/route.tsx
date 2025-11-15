import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'New Moon';
  const sign = searchParams.get('sign') || 'Aries';
  const date = searchParams.get('date') || '';
  const ritual = searchParams.get('ritual') || '';

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
            'linear-gradient(135deg, #1e1b2e 0%, #2d1b3d 50%, #0f172a 100%)',
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
            {type === 'New Moon' ? '🌑' : '🌕'}
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {type} Circle
          </div>
          <div
            style={{
              fontSize: '36px',
              color: '#a855f7',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            Moon in {sign}
          </div>
          {date && (
            <div
              style={{
                fontSize: '28px',
                color: '#d4d4d8',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              {date}
            </div>
          )}
          {ritual && (
            <div
              style={{
                fontSize: '24px',
                color: '#cbd5e1',
                textAlign: 'center',
                maxWidth: '900px',
                marginTop: '20px',
                lineHeight: '1.4',
              }}
            >
              {ritual.substring(0, 120)}...
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
      width: 1200,
      height: 630,
    },
  );
}
