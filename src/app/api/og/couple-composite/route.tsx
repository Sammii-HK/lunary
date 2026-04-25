import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const SAFE = /^[\p{L}\p{N}\p{P}\p{Zs}]+$/u;

function safe(value: string | null, fallback: string, max = 50) {
  const cleaned = (value || fallback).trim().slice(0, max);
  return cleaned && SAFE.test(cleaned) ? cleaned : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const partner = safe(searchParams.get('partner'), 'Your partner');
  const sun = safe(searchParams.get('sun'), 'Sun');
  const moon = safe(searchParams.get('moon'), 'Moon');
  const element = safe(searchParams.get('element'), 'Air');

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 76,
        color: '#fff',
        background:
          'radial-gradient(circle at 22% 20%, rgba(244,114,182,.32), transparent 28%), radial-gradient(circle at 80% 76%, rgba(167,139,250,.38), transparent 34%), linear-gradient(135deg, #070512 0%, #1f1638 55%, #05040a 100%)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 30,
          color: '#ddd6fe',
          letterSpacing: 3,
          textTransform: 'uppercase',
        }}
      >
        <span>Lunary</span>
        <span>Composite chart</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ fontSize: 82, lineHeight: 1, fontWeight: 800 }}>
          You + {partner}
        </div>
        <div style={{ fontSize: 44, color: '#e9d5ff' }}>
          Composite Sun in {sun} · Moon in {moon}
        </div>
        <div
          style={{
            display: 'flex',
            width: 'fit-content',
            border: '2px solid rgba(255,255,255,.25)',
            borderRadius: 999,
            padding: '16px 26px',
            fontSize: 34,
            color: '#c4b5fd',
          }}
        >
          Dominant element: {element}
        </div>
      </div>
      <div style={{ fontSize: 30, color: '#c4b5fd' }}>
        The relationship as its own sky
      </div>
    </div>,
    { width: 1080, height: 1080 },
  );
}
