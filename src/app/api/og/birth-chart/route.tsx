import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sun = searchParams.get('sun') || 'Sun';
  const moon = searchParams.get('moon') || 'Moon';
  const rising = searchParams.get('rising') || 'Rising';
  const name = searchParams.get('name') || 'Your Birth Chart';

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
              marginBottom: '40px',
              textAlign: 'center',
            }}
          >
            {name}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '40px',
              marginTop: '40px',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>☀️</div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                }}
              >
                Sun
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: '#fbbf24',
                  fontWeight: 'bold',
                }}
              >
                {sun}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px',
                background: 'rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🌙</div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                }}
              >
                Moon
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: '#60a5fa',
                  fontWeight: 'bold',
                }}
              >
                {moon}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '30px',
                background: 'rgba(236, 72, 153, 0.2)',
                borderRadius: '16px',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                minWidth: '200px',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>⬆️</div>
              <div
                style={{
                  fontSize: '20px',
                  color: '#cbd5e1',
                  marginBottom: '8px',
                }}
              >
                Rising
              </div>
              <div
                style={{
                  fontSize: '28px',
                  color: '#f472b6',
                  fontWeight: 'bold',
                }}
              >
                {rising}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '20px',
              color: '#94a3b8',
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
