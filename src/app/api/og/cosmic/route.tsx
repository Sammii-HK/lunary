import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

let robotoFont: ArrayBuffer | null = null;
let logoData: Buffer | null = null;

function loadAssets() {
  if (!robotoFont) {
    try {
      const fontPath = join(
        process.cwd(),
        'public',
        'fonts',
        'RobotoMono-Regular.ttf',
      );
      const buffer = readFileSync(fontPath);
      robotoFont = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    } catch (error) {
      console.error('Failed to load Roboto Mono font:', error);
    }
  }
  if (!logoData) {
    try {
      const logoPath = join(process.cwd(), 'public', 'logo.png');
      logoData = readFileSync(logoPath);
    } catch (error) {
      console.error('Failed to load logo:', error);
    }
  }
}

export async function GET(): Promise<Response> {
  try {
    loadAssets();

    const fonts: {
      name: string;
      data: ArrayBuffer;
      style: 'normal';
      weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
    }[] = [];

    if (robotoFont) {
      fonts.push({
        name: 'Roboto Mono',
        data: robotoFont,
        style: 'normal',
        weight: 400,
      });
    }

    const logoSrc = logoData
      ? `data:image/png;base64,${logoData.toString('base64')}`
      : null;

    const response = new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          fontFamily: robotoFont ? 'Roboto Mono' : 'system-ui',
          color: 'white',
          padding: '120px 160px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '48px',
          }}
        >
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img
              src={logoSrc}
              width={200}
              height={200}
              style={{ marginTop: '-40px' }}
            />
          )}

          <div
            style={{
              fontSize: '40px',
              color: 'rgba(216, 180, 254, 0.8)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              display: 'flex',
            }}
          >
            Personal astrology grounded in real astronomy
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '48px',
            }}
          >
            <div
              style={{
                fontSize: '104px',
                fontWeight: '300',
                color: '#fafafa',
                textAlign: 'center',
                lineHeight: 1.1,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span style={{ display: 'flex', justifyContent: 'center' }}>
                Personalised astrology for clarity
              </span>
              <span style={{ display: 'flex', justifyContent: 'center' }}>
                and self understanding
              </span>
            </div>

            <div
              style={{
                fontSize: '52px',
                fontWeight: '400',
                color: '#a1a1aa',
                textAlign: 'center',
                lineHeight: 1.5,
                maxWidth: '1800px',
                display: 'flex',
              }}
            >
              Lunary brings together your birth chart, today's sky, tarot and
              lunar cycles to give you calm and personal daily guidance.
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '80px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: 'rgba(216, 180, 254, 0.8)',
            fontSize: '48px',
          }}
        >
          <span style={{ display: 'flex' }}>lunary.app</span>
        </div>
      </div>,
      {
        width: 2400,
        height: 1260,
        fonts,
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
  } catch (error) {
    console.error('Cosmic OG image generation failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to generate image',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
