import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sign = searchParams.get('sign') || 'Your Sign';
  const date = searchParams.get('date') || '';
  const insight = searchParams.get('insight') || '';

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
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)',
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
            border: '2px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '24px',
            padding: '60px',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div
            style={{
              fontSize: '56px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '30px',
              textAlign: 'center',
            }}
          >
            {sign} Horoscope
          </div>
          {date && (
            <div
              style={{
                fontSize: '28px',
                color: '#a855f7',
                marginBottom: '30px',
                textAlign: 'center',
              }}
            >
              {date}
            </div>
          )}
          {insight && (
            <div
              style={{
                fontSize: '26px',
                color: '#d4d4d8',
                textAlign: 'center',
                maxWidth: '900px',
                marginTop: '20px',
                lineHeight: '1.5',
              }}
            >
              {insight.substring(0, 200)}...
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
