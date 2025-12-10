import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const moonSign = searchParams.get('moon') || 'Moon';
  const transit = searchParams.get('transit') || '';
  const prompt = searchParams.get('prompt') || '';

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
          'linear-gradient(135deg, #312e81 0%, #1e293b 50%, #0f172a 100%)',
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
            fontSize: '64px',
            fontWeight: 'bold',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          🌙
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
          Daily Cosmic Pulse
        </div>
        {moonSign && (
          <div
            style={{
              fontSize: '32px',
              color: '#a855f7',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            Moon in {moonSign}
          </div>
        )}
        {transit && (
          <div
            style={{
              fontSize: '28px',
              color: '#d4d4d8',
              marginBottom: '20px',
              textAlign: 'center',
              maxWidth: '900px',
            }}
          >
            {transit}
          </div>
        )}
        {prompt && (
          <div
            style={{
              fontSize: '24px',
              color: '#cbd5e1',
              textAlign: 'center',
              maxWidth: '900px',
              marginTop: '20px',
              lineHeight: '1.4',
              fontStyle: 'italic',
            }}
          >
            "{prompt.substring(0, 100)}..."
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
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
