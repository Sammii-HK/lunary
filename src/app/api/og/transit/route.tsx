import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const planet = searchParams.get('planet') || 'Planet';
  const event = searchParams.get('event') || 'Transit';
  const date = searchParams.get('date') || '';
  const meaning = searchParams.get('meaning') || '';

  const planetEmojis: Record<string, string> = {
    Sun: '☀️',
    Moon: '🌙',
    Mercury: '☿️',
    Venus: '♀️',
    Mars: '♂️',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
  };

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
            'linear-gradient(135deg, #1e293b 0%, #312e81 50%, #1e1b2e 100%)',
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
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {planetEmojis[planet] || '⭐'}
          </div>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#ffffff',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {planet} {event}
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
          {meaning && (
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
              {meaning.substring(0, 150)}...
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
