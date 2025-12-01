import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import {
  loadAstronomiconFont,
  loadGoogleFont,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs';

export async function GET(req: NextRequest): Promise<Response> {
  let astronomiconFont: ArrayBuffer | null = null;
  let robotoFont: ArrayBuffer | null = null;

  try {
    astronomiconFont = await loadAstronomiconFont(req);
  } catch (error) {
    console.error('Failed to load Astronomicon font:', error);
  }

  try {
    robotoFont = await loadGoogleFont(req);
  } catch (error) {
    console.error('Failed to load Roboto Mono font:', error);
  }

  const response = new ImageResponse(
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
            'linear-gradient(145deg, #09090b 0%, #18181b 40%, #1e1b4b 80%, #0f0a1a 100%)',
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {astronomiconFont && (
              <div
                style={{
                  fontSize: '72px',
                  color: 'rgba(192, 132, 252, 0.9)',
                  fontFamily: 'Astronomicon',
                  lineHeight: 1,
                }}
              >
                C
              </div>
            )}
            <div
              style={{
                fontSize: '56px',
                fontWeight: '300',
                letterSpacing: '0.08em',
                color: 'white',
              }}
            >
              Lunary
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              maxWidth: '900px',
            }}
          >
            <div
              style={{
                fontSize: '36px',
                fontWeight: '300',
                color: 'white',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              Personalised astrology for clarity
              <br />
              and self understanding
            </div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: '400',
                color: 'rgba(161, 161, 170, 0.9)',
                textAlign: 'center',
                lineHeight: 1.6,
                maxWidth: '700px',
              }}
            >
              Birth chart insights, tarot, lunar cycles and AI guidance —
              connected into one calm daily practice
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              marginTop: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(192, 132, 252, 0.8)',
                fontSize: '16px',
              }}
            >
              <span style={{ fontSize: '20px' }}>✦</span>
              <span>Real astronomy</span>
            </div>
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(113, 113, 122, 0.6)',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(192, 132, 252, 0.8)',
                fontSize: '16px',
              }}
            >
              <span style={{ fontSize: '20px' }}>✦</span>
              <span>Birth chart based</span>
            </div>
            <div
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'rgba(113, 113, 122, 0.6)',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(192, 132, 252, 0.8)',
                fontSize: '16px',
              }}
            >
              <span style={{ fontSize: '20px' }}>✦</span>
              <span>AI guided</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'rgba(113, 113, 122, 0.7)',
            fontSize: '16px',
          }}
        >
          lunary.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        ...(astronomiconFont
          ? [
              {
                name: 'Astronomicon',
                data: astronomiconFont,
                style: 'normal' as const,
                weight: 400 as const,
              },
            ]
          : []),
        ...(robotoFont
          ? [
              {
                name: 'Roboto Mono',
                data: robotoFont,
                style: 'normal' as const,
              },
            ]
          : []),
      ],
    },
  );

  const headers = new Headers(response.headers);
  headers.set(
    'Cache-Control',
    'public, s-maxage=86400, stale-while-revalidate=43200, max-age=86400',
  );
  headers.set('CDN-Cache-Control', 'public, s-maxage=86400');
  headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=86400');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
