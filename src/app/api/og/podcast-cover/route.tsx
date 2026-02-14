import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';

let astronomicon: ArrayBuffer | null = null;
let robotoMono: ArrayBuffer | null = null;
let logoData: Buffer | null = null;

function loadAssets() {
  if (!astronomicon) {
    try {
      const fontPath = join(
        process.cwd(),
        'public',
        'fonts',
        'Astronomicon.ttf',
      );
      const buffer = readFileSync(fontPath);
      astronomicon = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    } catch (error) {
      console.error('Failed to load Astronomicon font:', error);
    }
  }
  if (!robotoMono) {
    try {
      const fontPath = join(
        process.cwd(),
        'public',
        'fonts',
        'RobotoMono-Regular.ttf',
      );
      const buffer = readFileSync(fontPath);
      robotoMono = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    } catch (error) {
      console.error('Failed to load Roboto Mono font:', error);
    }
  }
  if (!logoData) {
    try {
      const logoPath = join(process.cwd(), 'public', 'logo-alpha.png');
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

    if (astronomicon) {
      fonts.push({
        name: 'Astronomicon',
        data: astronomicon,
        style: 'normal',
        weight: 400,
      });
    }
    if (robotoMono) {
      fonts.push({
        name: 'Roboto Mono',
        data: robotoMono,
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
          background:
            'radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0d0618 40%, #050208 70%, #000000 100%)',
          fontFamily: 'Roboto Mono',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle star dots */}
        {[...Array(40)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              borderRadius: '50%',
              backgroundColor: `rgba(216, 180, 254, ${0.15 + (i % 5) * 0.08})`,
              top: `${(i * 97 + 13) % 100}%`,
              left: `${(i * 73 + 29) % 100}%`,
              display: 'flex',
            }}
          />
        ))}

        {/* Outer glow ring */}
        <div
          style={{
            position: 'absolute',
            width: '2200px',
            height: '2200px',
            borderRadius: '50%',
            border: '1px solid rgba(132, 88, 216, 0.12)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Inner glow ring */}
        <div
          style={{
            position: 'absolute',
            width: '1600px',
            height: '1600px',
            borderRadius: '50%',
            border: '1px solid rgba(132, 88, 216, 0.08)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
          }}
        />

        {/* Content stack */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '60px',
            zIndex: 1,
          }}
        >
          {/* Logo */}
          {logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
            <img src={logoSrc} width={360} height={360} />
          )}

          {/* Show title */}
          <div
            style={{
              fontSize: '260px',
              fontFamily: astronomicon ? 'Astronomicon' : 'serif',
              color: '#fafafa',
              letterSpacing: '0.06em',
              textAlign: 'center',
              lineHeight: 1,
              display: 'flex',
              textShadow: '0 0 80px rgba(132, 88, 216, 0.4)',
            }}
          >
            The Grimoire
          </div>

          {/* Divider line */}
          <div
            style={{
              width: '600px',
              height: '2px',
              background:
                'linear-gradient(90deg, transparent, rgba(132, 88, 216, 0.6), transparent)',
              display: 'flex',
            }}
          />

          {/* Tagline */}
          <div
            style={{
              fontSize: '72px',
              color: 'rgba(216, 180, 254, 0.7)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              display: 'flex',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <span style={{ display: 'flex' }}>Astrology</span>
            <span
              style={{
                display: 'flex',
                color: 'rgba(132, 88, 216, 0.5)',
                fontSize: '48px',
              }}
            >
              +
            </span>
            <span style={{ display: 'flex' }}>Tarot</span>
            <span
              style={{
                display: 'flex',
                color: 'rgba(132, 88, 216, 0.5)',
                fontSize: '48px',
              }}
            >
              +
            </span>
            <span style={{ display: 'flex' }}>Crystals</span>
          </div>

          {/* Brand */}
          <div
            style={{
              fontSize: '52px',
              color: 'rgba(216, 180, 254, 0.4)',
              letterSpacing: '0.15em',
              display: 'flex',
              marginTop: '20px',
            }}
          >
            by Lunary
          </div>
        </div>
      </div>,
      {
        width: 3000,
        height: 3000,
        fonts,
      },
    );

    const headers = new Headers(response.headers);
    headers.set(
      'Cache-Control',
      'public, s-maxage=604800, stale-while-revalidate=86400, max-age=604800',
    );
    headers.set('CDN-Cache-Control', 'public, s-maxage=604800');
    headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=604800');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Podcast cover image generation failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate image' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
