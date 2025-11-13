import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 60;

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

const gradientsByElement: Record<string, { background: string; accent: string }> = {
  Fire: { background: 'linear-gradient(135deg, #2b0b0b, #a23030)', accent: '#ffd6a3' },
  Earth: { background: 'linear-gradient(135deg, #0f1f17, #2d6a4f)', accent: '#b7f4c3' },
  Air: { background: 'linear-gradient(135deg, #091d2c, #3a6ea5)', accent: '#c3e3ff' },
  Water: { background: 'linear-gradient(135deg, #0b1029, #3048a2)', accent: '#d4dfff' },
  default: { background: 'linear-gradient(135deg, #14151f, #433878)', accent: '#f3d4ff' },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = sanitize(searchParams.get('name'), 32);
  const sun = sanitize(searchParams.get('sun'), 16) ?? '—';
  const moon = sanitize(searchParams.get('moon'), 16) ?? '—';
  const rising = sanitize(searchParams.get('rising'), 16) ?? '—';
  const element = sanitize(searchParams.get('element'), 16);
  const modality = sanitize(searchParams.get('modality'), 16);
  const insight = sanitize(searchParams.get('insight'), 160);

  const theme =
    (element && gradientsByElement[element]) || gradientsByElement.default;
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
          background: theme.background,
          color: '#ffffff',
          padding: '60px 80px',
          fontFamily: 'Roboto Mono',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', opacity: 0.85 }}>
          Shared from Lunary
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', justifyContent: 'center', flexGrow: 1 }}>
          <div style={{ fontSize: 48, fontWeight: 300, opacity: 0.92 }}>
            {name ? `${name}'s Birth Chart` : 'Birth Chart Highlights'}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Sun', value: sun },
              { label: 'Moon', value: moon },
              { label: 'Rising', value: rising },
            ].map((placement) => (
              <div
                key={placement.label}
                style={{
                  flex: '1 1 30%',
                  minWidth: '200px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '24px',
                  padding: '24px',
                  background: 'rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    opacity: 0.75,
                    marginBottom: '12px',
                  }}
                >
                  {placement.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 400 }}>{placement.value}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Dominant Element', value: element ?? 'Balanced' },
              { label: 'Core Modality', value: modality ?? 'Dynamic' },
            ].map((detail) => (
              <div
                key={detail.label}
                style={{
                  flex: '1 1 45%',
                  minWidth: '240px',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: '20px',
                  padding: '20px',
                  background: 'rgba(0,0,0,0.2)',
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    opacity: 0.7,
                    marginBottom: '10px',
                  }}
                >
                  {detail.label}
                </div>
                <div style={{ fontSize: 28 }}>{detail.value}</div>
              </div>
            ))}
          </div>

          {insight && (
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '20px',
                padding: '24px',
                background: 'rgba(0,0,0,0.2)',
                fontSize: 24,
                lineHeight: 1.5,
                opacity: 0.92,
              }}
            >
              {insight}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 24,
            opacity: 0.85,
          }}
        >
          <div>{element ? `${element} element focus` : 'Cosmic balance'}</div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '999px',
                backgroundColor: theme.accent,
              }}
            />
            <span>lunary.app/birth-chart</span>
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
          data: await robotoMono,
          style: 'normal',
        },
      ],
    },
  );
}
