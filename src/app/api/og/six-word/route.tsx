import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const MAX_LINE = 120;
const SAFE_TEXT = /^[\p{L}\p{N}\p{P}\p{Zs}°'’“”"—–-]+$/u;

function safeParam(value: string | null, fallback: string, max = MAX_LINE) {
  const cleaned = (value || fallback).trim().slice(0, max);
  if (!cleaned || !SAFE_TEXT.test(cleaned)) return fallback;
  return cleaned;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const line = safeParam(
    searchParams.get('line'),
    'Trust the Moon touching your Sun.',
  );
  const date = safeParam(searchParams.get('date'), 'Today', 40);
  const handle = safeParam(searchParams.get('handle'), '', 40);
  const variant = searchParams.get('variant');
  const isLandscape = variant === 'landscape';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isLandscape ? 72 : 78,
        color: '#fff',
        background:
          'radial-gradient(circle at 18% 12%, rgba(199,125,255,.32), transparent 28%), radial-gradient(circle at 84% 78%, rgba(99,102,241,.28), transparent 30%), linear-gradient(135deg, #080612 0%, #17122c 48%, #05040a 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 28,
          letterSpacing: 3,
          textTransform: 'uppercase',
          color: '#c4b5fd',
        }}
      >
        <span>Lunary</span>
        <span>{date}</span>
      </div>
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          fontSize: isLandscape ? 74 : 88,
          lineHeight: 1.04,
          fontWeight: 700,
          letterSpacing: -1,
        }}
      >
        “{line}”
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 30,
          color: '#ddd6fe',
        }}
      >
        <span>Six-word horoscope</span>
        {handle ? (
          <span>@{handle.replace(/^@/, '')}</span>
        ) : (
          <span>lunary.app</span>
        )}
      </div>
    </div>,
    {
      width: isLandscape ? 1200 : 1080,
      height: isLandscape ? 630 : 1080,
    },
  );
}
