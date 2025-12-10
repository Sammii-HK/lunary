import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spreadName = searchParams.get('spread') || 'Tarot Spread';
  const card1 = searchParams.get('card1') || '';
  const card2 = searchParams.get('card2') || '';
  const card3 = searchParams.get('card3') || '';
  const interpretation = searchParams.get('interpretation') || '';

  return new ImageResponse(
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
          border: '2px solid rgba(168, 85, 247, 0.3)',
          borderRadius: '24px',
          padding: '60px',
          background: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#a855f7',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          {spreadName}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '30px',
            marginBottom: '40px',
          }}
        >
          {card1 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '25px',
                background: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                minWidth: '180px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🃏</div>
              <div
                style={{
                  fontSize: '22px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {card1}
              </div>
            </div>
          )}

          {card2 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '25px',
                background: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                minWidth: '180px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🃏</div>
              <div
                style={{
                  fontSize: '22px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {card2}
              </div>
            </div>
          )}

          {card3 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '25px',
                background: 'rgba(168, 85, 247, 0.2)',
                borderRadius: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                minWidth: '180px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🃏</div>
              <div
                style={{
                  fontSize: '22px',
                  color: '#ffffff',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
              >
                {card3}
              </div>
            </div>
          )}
        </div>

        {interpretation && (
          <div
            style={{
              fontSize: '24px',
              color: '#d4d4d8',
              textAlign: 'center',
              maxWidth: '900px',
              marginTop: '20px',
              lineHeight: '1.4',
            }}
          >
            {interpretation.substring(0, 150)}...
          </div>
        )}

        <div
          style={{
            fontSize: '20px',
            color: '#71717a',
            marginTop: '40px',
            textAlign: 'center',
          }}
        >
          lunary.app
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
