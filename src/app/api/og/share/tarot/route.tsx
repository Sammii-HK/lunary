import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 60; // Cache for 1 minute – dynamic data but not ultra volatile

const WIDTH = 1200;
const HEIGHT = 630;

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(`Roboto Mono font fetch failed with status ${res.status}`);
      }
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const sanitize = (value: string | null, limit = 80) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > limit ? `${trimmed.slice(0, limit - 1)}…` : trimmed;
};

const parseKeywords = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((keyword) => keyword.trim())
        .filter(Boolean)
        .slice(0, 4)
    : [];

const gradients = [
  { background: 'linear-gradient(135deg, #11001c, #4e1a7a)', accent: '#f3c5ff' },
  { background: 'linear-gradient(135deg, #091128, #2e4a7f)', accent: '#b2d2ff' },
  { background: 'linear-gradient(135deg, #1a1a1a, #533736)', accent: '#ffcea2' },
  { background: 'linear-gradient(135deg, #101820, #1e485e)', accent: '#9ee6ff' },
  { background: 'linear-gradient(135deg, #1a1423, #3f3058)', accent: '#f8d6ff' },
];

const pickGradient = (seed: string) => {
  const hash = seed
    .split('')
    .reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % gradients.length, 0);
  return gradients[Math.abs(hash) % gradients.length];
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card = sanitize(searchParams.get('card'), 48) ?? 'Your Tarot Card';
  const timeframe = sanitize(searchParams.get('timeframe'), 24) ?? 'Daily';
  const name = sanitize(searchParams.get('name'), 24);
  const keywords = parseKeywords(searchParams.get('keywords'));
  const text = sanitize(searchParams.get('text'), 160);
  const date = sanitize(searchParams.get('date'), 32);
  const variant = sanitize(searchParams.get('variant'), 16)?.toLowerCase();
  const isPattern = variant === 'pattern';

  const baseLabel = (() => {
    if (isPattern) {
      if (timeframe.toLowerCase().includes('pattern')) return timeframe;
      return `${timeframe} Tarot Patterns`;
    }
    return timeframe;
  })();

  const headline = isPattern
    ? name
      ? `${name}'s ${baseLabel}`
      : baseLabel
    : name
      ? `${name}'s ${baseLabel} Tarot`
      : `${baseLabel} Tarot Spotlight`;
  const theme = pickGradient(`${card}-${timeframe}-${name ?? 'general'}`);

  const robotoMono = await loadRobotoMono(request);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          background: theme.background,
          color: '#ffffff',
          padding: '60px 80px',
        }}
      >
        <div style={{ fontFamily: 'Roboto Mono', fontSize: 28, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.8 }}>
          Shared from Lunary
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', flexGrow: 1, justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Roboto Mono', fontSize: 48, fontWeight: 300, opacity: 0.9 }}>{headline}</div>
          <div style={{ fontFamily: 'Roboto Mono', fontSize: 80, fontWeight: 500, letterSpacing: 4 }}>{card}</div>

          {keywords.length > 0 && (
            <div
              style={{
                fontFamily: 'Roboto Mono',
                fontSize: 28,
                opacity: 0.85,
                color: theme.accent,
                letterSpacing: 2,
              }}
            >
              {keywords.join(' • ')}
            </div>
          )}

          {text && (
            <div style={{ fontFamily: 'Roboto Mono', fontSize: 26, lineHeight: 1.6, maxWidth: '70%', opacity: 0.92 }}>
              {text}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Roboto Mono',
            fontSize: 24,
            opacity: 0.85,
          }}
        >
          <div>{date || 'Generated just now'}</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '999px', backgroundColor: theme.accent }} />
            <span>lunary.app/tarot</span>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: 'Roboto Mono',
          data: robotoMono,
          style: 'normal',
        },
      ],
    },
  );
}
