import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pattern = searchParams.get('pattern') || 'Your Tarot Pattern';
  const cards = searchParams.get('cards') || '';
  const themes = searchParams.get('themes') || '';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1b2e 0%, #2d1b3d 100%)',
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
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#a855f7',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          🔮
        </div>
        <div
          style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#ffffff',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          {pattern}
        </div>
        {cards && (
          <div
            style={{
              fontSize: '32px',
              color: '#d4d4d8',
              marginBottom: '20px',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {cards}
          </div>
        )}
        {themes && (
          <div
            style={{
              fontSize: '28px',
              color: '#a855f7',
              textAlign: 'center',
              maxWidth: '900px',
              marginTop: '20px',
            }}
          >
            {themes}
          </div>
        )}
        <div
          style={{
            fontSize: '24px',
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
