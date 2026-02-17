import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

function getMoonCircleTheme(type: string) {
  const lower = type.toLowerCase();
  if (lower.includes('new')) {
    return {
      background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a, #0d0d0d)',
      iconPath: 'new-moon',
      subtitle: 'Set Your Intentions',
    };
  } else {
    return {
      background: 'linear-gradient(135deg, #0d0d0d, #1a1a1a, #1a0f1f)',
      iconPath: 'full-moon',
      subtitle: 'Release & Celebrate',
    };
  }
}

const ALLOWED_TYPES = new Set(['New Moon', 'Full Moon']);
const ALLOWED_SIGNS = new Set([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawType = searchParams.get('type') || 'New Moon';
  const rawSign = searchParams.get('sign') || 'Aries';
  const type = ALLOWED_TYPES.has(rawType) ? rawType : 'New Moon';
  const sign = ALLOWED_SIGNS.has(rawSign) ? rawSign : 'Aries';
  const date = searchParams.get('date') || '';

  const formattedDate = date
    ? new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  const theme = getMoonCircleTheme(type);

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme.background,
        color: 'white',
        padding: '60px 40px',
        justifyContent: 'space-between',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: '40px',
          paddingTop: '100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '24px',
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          Moon in {sign} • {theme.subtitle}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${baseUrl}/icons/moon-phases/${theme.iconPath}.png`}
          width={160}
          height={160}
          alt={type}
          style={{
            marginBottom: '30px',
          }}
        />
        <div
          style={{
            display: 'flex',
            fontSize: '64px',
            fontWeight: '400',
            color: 'white',
            textAlign: 'center',
            letterSpacing: '0.1em',
            marginBottom: '20px',
          }}
        >
          {type} Circle
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '32px',
            color: 'white',
            textAlign: 'center',
            fontWeight: '300',
            opacity: 0.8,
          }}
        >
          Gather & Connect
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '28px',
          fontWeight: '300',
          color: 'white',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        {formattedDate}
      </div>

      <div
        style={{
          display: 'flex',
          fontSize: '28px',
          fontWeight: '300',
          color: 'white',
          letterSpacing: '1px',
          marginBottom: '40px',
        }}
      >
        lunary.app
      </div>
    </div>,
    {
      width: 1200,
      height: 1200,
    },
  );
}
