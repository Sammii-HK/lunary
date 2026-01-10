import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';
import { NumerologyShareNumber } from '@/lib/og/horoscopeShare';

const WIDTH = 1200;
const HEIGHT = 630;

const loadRobotoMono = async (request: Request) => {
  const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
  const response = await fetch(fontUrl, { cache: 'force-cache' });
  if (!response.ok) {
    throw new Error('Failed to load font');
  }
  return response.arrayBuffer();
};

const sanitize = (value: string | null, limit = 180) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > limit ? `${trimmed.slice(0, limit - 1)}…` : trimmed;
};

const trimToSentence = (value: string, limit: number) => {
  if (value.length <= limit) return value;
  const truncated = value.slice(0, limit);
  const lastStop = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?'),
    truncated.lastIndexOf('-'),
  );
  if (lastStop > 40) {
    return truncated.slice(0, lastStop + 1);
  }
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 40) {
    return truncated.slice(0, lastSpace);
  }
  return truncated.trimEnd();
};

const cleanText = (value: string | null, limit: number) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > limit ? trimToSentence(trimmed, limit) : trimmed;
};

const parseNumbersParam = (value: string | null): NumerologyShareNumber[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => {
        if (
          entry &&
          typeof entry === 'object' &&
          typeof entry.label === 'string' &&
          (typeof entry.value === 'string' || typeof entry.value === 'number')
        ) {
          return {
            label: entry.label,
            value: entry.value,
            meaning:
              typeof entry.meaning === 'string' ? entry.meaning : undefined,
          } as NumerologyShareNumber;
        }
        return null;
      })
      .filter((entry): entry is NumerologyShareNumber => Boolean(entry));
  } catch (error) {
    console.error('Invalid numbers param', error);
    return [];
  }
};

const gradients = [
  {
    background: 'linear-gradient(135deg, #09070f, #2a0f3a)',
    accent: '#f8c8ff',
  },
  {
    background: 'linear-gradient(135deg, #05070e, #1c3c68)',
    accent: '#a9d4ff',
  },
  {
    background: 'linear-gradient(135deg, #0d1a1e, #263845)',
    accent: '#8ff5ff',
  },
  {
    background: 'linear-gradient(135deg, #0f090f, #341f5d)',
    accent: '#ffddc2',
  },
];

const pickGradient = (seed: string) => {
  const hash = seed
    .split('')
    .reduce((acc, char) => acc * 31 + char.charCodeAt(0), 0);
  return gradients[Math.abs(hash) % gradients.length];
};

const renderNumberCard = (
  number: NumerologyShareNumber,
  options?: { large?: boolean; showMeaning?: boolean; minHeight?: number },
) => (
  <div
    key={`${number.label}-${number.value}`}
    style={{
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.25)',
      padding: '22px 20px',
      backgroundColor: 'rgba(0,0,0,0.35)',
      minHeight: options?.minHeight ?? 150,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '8px',
    }}
  >
    <div
      style={{
        display: 'flex',
        textTransform: 'uppercase',
        letterSpacing: 3,
        fontSize: options?.large ? 12 : 10,
        opacity: 0.7,
      }}
    >
      {number.label}
    </div>
    <div
      style={{
        display: 'flex',
        fontSize: options?.large ? 120 : 56,
        fontWeight: 600,
      }}
    >
      {number.value}
    </div>
    {options?.showMeaning !== false && number.meaning && (
      <div
        style={{
          display: 'flex',
          fontSize: 16,
          opacity: 0.85,
          lineHeight: 1.4,
        }}
      >
        {number.meaning}
      </div>
    )}
  </div>
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const highlightTitle =
    sanitize(searchParams.get('highlightTitle'), 60) ?? 'Horoscope Snapshot';
  const highlight =
    cleanText(searchParams.get('highlight'), 360) ??
    'Your cosmic forecast with numerology energy.';
  const highlightSubtitle = cleanText(
    searchParams.get('highlightSubtitle'),
    360,
  );
  const dateLabel =
    sanitize(searchParams.get('date'), 32) ??
    new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  const name = sanitize(searchParams.get('name'), 40);
  const variant = sanitize(searchParams.get('variant'), 32);
  const numbers = parseNumbersParam(searchParams.get('numbers'));

  const theme = pickGradient(
    `${highlightTitle}-${name ?? 'guest'}-${variant ?? 'share'}`,
  );
  const robotoMono = await loadRobotoMono(request);
  const isHoroscope = variant?.toLowerCase() === 'horoscope';
  const numbersToShow = numbers.slice(0, isHoroscope ? 3 : 1);
  const logoUrl = new URL(
    '/icons/moon-phases/full-moon.svg',
    request.url,
  ).toString();
  const highlightPadding = isHoroscope ? '30px 34px' : '36px 44px';
  const highlightFontSize = isHoroscope ? 20 : 36;
  const highlightLineHeight = isHoroscope ? 1.7 : 1.3;
  const highlightMaxWidth = isHoroscope ? 580 : '100%';
  const horoscopeCardMinHeight = 160;
  const horoscopeCardGap = 18;
  const highlightMinHeight = isHoroscope
    ? horoscopeCardMinHeight * 2 + horoscopeCardGap
    : 220;
  const footerPath = 'horoscope';

  const displayHighlight = isHoroscope
    ? trimToSentence(highlight, 300)
    : highlight;
  const displayHighlightSubtitle = isHoroscope
    ? highlightSubtitle
      ? trimToSentence(highlightSubtitle, 280)
      : undefined
    : highlightSubtitle;

  const highlightBlock = (
    <div
      style={{
        borderRadius: 30,
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(0,0,0,0.35)',
        padding: highlightPadding,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        lineHeight: highlightLineHeight,
        fontSize: highlightFontSize,
        maxWidth: highlightMaxWidth,
        minHeight: highlightMinHeight,
      }}
    >
      <span>{displayHighlight}</span>
      {displayHighlightSubtitle && (
        <span
          style={{
            fontSize: 18,
            opacity: 0.9,
          }}
        >
          {displayHighlightSubtitle}
        </span>
      )}
    </div>
  );

  const primaryNumber = numbersToShow[0];
  const singleNumberCard = primaryNumber ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        borderRadius: 32,
        border: '1px solid rgba(255,255,255,0.28)',
        background: 'rgba(0,0,0,0.35)',
        padding: '42px 52px',
        minHeight: 320,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          textTransform: 'uppercase',
          letterSpacing: 6,
          fontSize: 24,
          opacity: 0.7,
        }}
      >
        {primaryNumber.label}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 160,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {primaryNumber.value}
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: 28,
          lineHeight: 1.35,
          opacity: 0.9,
          maxWidth: 800,
        }}
      >
        {highlight}
      </div>
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 28,
        border: '1px dashed rgba(255,255,255,0.4)',
        padding: '32px',
        textAlign: 'center',
        fontSize: 20,
        opacity: 0.8,
        minHeight: 260,
      }}
    >
      Add numerology numbers to highlight today’s energy
    </div>
  );

  const coreHeader = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div
        style={{
          display: 'flex',
          letterSpacing: 6,
          textTransform: 'uppercase',
          fontSize: 12,
          opacity: 0.7,
        }}
      >
        Horoscope · Numerology
      </div>
      <div
        style={{
          display: 'flex',
          fontSize: isHoroscope ? 46 : 40,
          fontWeight: isHoroscope ? 500 : 600,
          letterSpacing: 1,
          lineHeight: 1.1,
        }}
      >
        {highlightTitle}
      </div>
    </div>
  );

  const footerInfo = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        fontSize: 12,
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 0.75,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span>{dateLabel}</span>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          alignItems: 'flex-end',
        }}
      >
        <span style={{ fontSize: 14 }}>Shared from Lunary</span>
      </div>
    </div>
  );

  const mainContent = isHoroscope ? (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '26px',
        width: '100%',
      }}
    >
      {coreHeader}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '46px',
          width: '100%',
          alignItems: 'stretch',
        }}
      >
        <div
          style={{
            flex: 0.6,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {highlightBlock}
        </div>
        <div
          style={{
            flex: 0.4,
            display: 'flex',
            flexDirection: 'column',
            gap: `${horoscopeCardGap}px`,
            justifyContent: 'flex-start',
          }}
        >
          {numbersToShow.length > 0 ? (
            numbersToShow.map((number) =>
              renderNumberCard(number, {
                large: false,
                showMeaning: true,
                minHeight: horoscopeCardMinHeight,
              }),
            )
          ) : (
            <div
              style={{
                borderRadius: 18,
                border: '1px dashed rgba(255,255,255,0.3)',
                padding: '20px',
                fontSize: 14,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: highlightMinHeight + horoscopeCardGap,
              }}
            >
              Add numerology numbers to highlight the energetic focus
            </div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div
      style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: '30px',
        alignItems: 'stretch',
        justifyContent: 'center',
      }}
    >
      {coreHeader}
      {singleNumberCard}
      {footerInfo}
    </div>
  );

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: theme.background,
        color: '#ffffff',
        fontFamily: 'Roboto Mono',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          maxWidth: WIDTH,
          maxHeight: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {mainContent}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontFamily: 'Roboto Mono',
            fontSize: 24,
            opacity: 0.85,
            gap: '12px',
          }}
        >
          <img
            src={logoUrl}
            alt='Lunary full moon logo'
            width={40}
            height={40}
            style={{ display: 'flex' }}
          />
          <span
            style={{
              fontSize: 16,
              letterSpacing: 1.8,
              fontWeight: 600,
            }}
          >
            lunary.app/{footerPath}
          </span>
        </div>
      </div>
    </div>,
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
