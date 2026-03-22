import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { getProductBySlug } from '@/lib/shop/generators';
import { CATEGORY_LABELS, ShopCategory } from '@/lib/shop/types';

export const runtime = 'nodejs';

let robotoRegular: ArrayBuffer | null = null;
let robotoBold: ArrayBuffer | null = null;

function loadFonts() {
  if (!robotoRegular) {
    try {
      const buf = readFileSync(
        join(process.cwd(), 'public', 'fonts', 'RobotoMono-Regular.ttf'),
      );
      robotoRegular = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
    } catch {
      // fonts unavailable — fall back to system-ui
    }
  }
  if (!robotoBold) {
    try {
      const buf = readFileSync(
        join(process.cwd(), 'public', 'fonts', 'RobotoMono-Bold.ttf'),
      );
      robotoBold = buf.buffer.slice(
        buf.byteOffset,
        buf.byteOffset + buf.byteLength,
      );
    } catch {
      // fonts unavailable
    }
  }
}

/** Map each ShopCategory to a pair of brand hex colours for the accent strip. */
const CATEGORY_COLOURS: Record<ShopCategory, [string, string]> = {
  spell: ['#8458D8', '#C77DFF'],
  crystal: ['#C77DFF', '#EE789E'],
  tarot: ['#D070E8', '#C77DFF'],
  seasonal: ['#7B7BE8', '#D070E8'],
  astrology: ['#7B7BE8', '#C77DFF'],
  birthchart: ['#8458D8', '#D070E8'],
  bundle: ['#8458D8', '#7B7BE8'],
  retrograde: ['#7B7BE8', '#D070E8'],
  notion_template: ['#EE789E', '#C77DFF'],
};

function buildImage(
  title: string,
  tagline: string,
  categoryLabel: string,
  category: ShopCategory,
  fontFamily: string,
) {
  const [colA, colB] = CATEGORY_COLOURS[category];

  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0a0a0a',
        fontFamily,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow in top-left */}
      <div
        style={{
          position: 'absolute',
          top: '-180px',
          left: '-180px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colA}55 0%, transparent 70%)`,
          display: 'flex',
        }}
      />

      {/* Radial glow in bottom-right */}
      <div
        style={{
          position: 'absolute',
          bottom: '-180px',
          right: '-180px',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colB}44 0%, transparent 70%)`,
          display: 'flex',
        }}
      />

      {/* Accent bar across the top */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '4px',
          background: `linear-gradient(90deg, ${colA} 0%, ${colB} 100%)`,
          display: 'flex',
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          padding: '64px 80px 56px',
        }}
      >
        {/* Category badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: '14px',
              fontWeight: 400,
              color: colA,
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              padding: '6px 14px',
              border: `1px solid ${colA}66`,
              borderRadius: '6px',
              display: 'flex',
            }}
          >
            {categoryLabel}
          </div>
        </div>

        {/* Title + tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: '#fafafa',
              lineHeight: 1.1,
              maxWidth: '960px',
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: '#a1a1aa',
              lineHeight: 1.4,
              maxWidth: '860px',
              display: 'flex',
            }}
          >
            {tagline}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.08em',
              display: 'flex',
            }}
          >
            lunary.app/shop
          </div>

          <div
            style={{
              fontSize: '22px',
              fontWeight: 400,
              color: colA,
              letterSpacing: '0.12em',
              display: 'flex',
            }}
          >
            LUNARY
          </div>
        </div>
      </div>
    </div>
  );
}

function buildGenericImage(fontFamily: string) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
        fontFamily,
        color: 'white',
        gap: '24px',
      }}
    >
      <div
        style={{
          fontSize: '72px',
          fontWeight: 700,
          color: '#fafafa',
          display: 'flex',
        }}
      >
        Lunary Shop
      </div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 400,
          color: '#a1a1aa',
          display: 'flex',
        }}
      >
        Digital spiritual packs and guides
      </div>
      <div
        style={{
          fontSize: '20px',
          fontWeight: 400,
          color: '#8458D8',
          letterSpacing: '0.12em',
          display: 'flex',
        }}
      >
        lunary.app/shop
      </div>
    </div>
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;

  loadFonts();

  const fonts: {
    name: string;
    data: ArrayBuffer;
    style: 'normal';
    weight: 400 | 700;
  }[] = [];

  if (robotoRegular) {
    fonts.push({
      name: 'Roboto Mono',
      data: robotoRegular,
      style: 'normal',
      weight: 400,
    });
  }
  if (robotoBold) {
    fonts.push({
      name: 'Roboto Mono',
      data: robotoBold,
      style: 'normal',
      weight: 700,
    });
  }

  const fontFamily = fonts.length > 0 ? 'Roboto Mono' : 'system-ui';

  try {
    const product = getProductBySlug(slug);
    const categoryLabel = product
      ? CATEGORY_LABELS[product.category]
      : 'Digital Pack';

    const jsx = product
      ? buildImage(
          product.title,
          product.tagline,
          categoryLabel,
          product.category,
          fontFamily,
        )
      : buildGenericImage(fontFamily);

    const response = new ImageResponse(jsx, {
      width: 1200,
      height: 630,
      fonts,
    });

    const headers = new Headers(response.headers);
    // Products change rarely — cache for 7 days
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
    console.error(`Shop OG image generation failed for slug "${slug}":`, error);

    const fallback = new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          color: '#8458D8',
          fontSize: '64px',
          fontFamily: 'system-ui',
        }}
      >
        Lunary Shop
      </div>,
      { width: 1200, height: 630 },
    );

    return fallback;
  }
}
