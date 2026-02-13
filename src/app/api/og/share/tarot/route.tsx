import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getPrimaryHandle } from '@/constants/socialHandles';
import { ShareFooter } from '@/lib/share/og-share-utils';

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
        throw new Error(
          `Roboto Mono font fetch failed with status ${res.status}`,
        );
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

const parseNumber = (value: string | null) => {
  if (!value) return undefined;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return undefined;
  return parsed;
};

const parseDelimitedList = (
  value: string | null,
  limit = 3,
  charLimit = 160,
) => {
  if (!value) return [];
  return value
    .split('|')
    .map((item) => sanitize(item, charLimit))
    .filter((entry): entry is string => Boolean(entry))
    .slice(0, limit);
};

const parseJsonParam = <T,>(value: string | null) => {
  if (!value) return undefined;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse JSON param', error);
    return undefined;
  }
};

type SuitPatternBlock = {
  suit: string;
  count: number;
  reading?: string;
};

type NumberPatternBlock = {
  number: string;
  count: number;
  reading?: string;
  cards?: string[];
};

type CardPatternBlock = {
  name: string;
  count: number;
  reading?: string;
};

type SpreadShareCard = {
  positionLabel: string;
  positionPrompt: string;
  cardName: string;
  keywords?: string[];
  insight?: string;
};

const gradients = [
  {
    background: 'linear-gradient(135deg, #11001c, #4e1a7a)',
    accent: '#f3c5ff',
  },
  {
    background: 'linear-gradient(135deg, #091128, #2e4a7f)',
    accent: '#b2d2ff',
  },
  {
    background: 'linear-gradient(135deg, #1a1a1a, #533736)',
    accent: '#ffcea2',
  },
  {
    background: 'linear-gradient(135deg, #101820, #1e485e)',
    accent: '#9ee6ff',
  },
  {
    background: 'linear-gradient(135deg, #1a1423, #3f3058)',
    accent: '#f8d6ff',
  },
];

const pickGradient = (seed: string) => {
  const hash = seed
    .split('')
    .reduce(
      (acc, char) => (acc * 31 + char.charCodeAt(0)) % gradients.length,
      0,
    );
  return gradients[Math.abs(hash) % gradients.length];
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const card = sanitize(searchParams.get('card'), 40) ?? 'Your Tarot Card';
  const timeframe = sanitize(searchParams.get('timeframe'), 24) ?? 'Daily';
  const name = sanitize(searchParams.get('name'), 24);
  const keywords = parseKeywords(searchParams.get('keywords'));
  const text = sanitize(searchParams.get('text'), 140);
  const date = sanitize(searchParams.get('date'), 32);
  const variant = sanitize(searchParams.get('variant'), 16)?.toLowerCase();
  const isPattern = variant === 'pattern';
  const totalCards = parseNumber(searchParams.get('total'));
  const suitInsight = sanitize(searchParams.get('suitInsight'), 200);
  const elementFocus = sanitize(searchParams.get('element'), 20);
  const extraInsights = parseDelimitedList(searchParams.get('insights'));
  const moonPhase = sanitize(searchParams.get('moonPhase'), 32);
  const moonTip = sanitize(searchParams.get('moonTip'), 180);
  const transitImpact = sanitize(searchParams.get('transit'), 200);
  const actionPrompt = sanitize(searchParams.get('action'), 160);
  const platform = sanitize(searchParams.get('platform'), 20)?.toLowerCase();
  const suitBlocks =
    parseJsonParam<SuitPatternBlock[]>(searchParams.get('suits')) ?? [];
  const numberBlocks =
    parseJsonParam<NumberPatternBlock[]>(searchParams.get('numbers')) ?? [];
  const cardBlocks =
    parseJsonParam<CardPatternBlock[]>(searchParams.get('cards')) ?? [];
  const spreadName = sanitize(searchParams.get('spreadName'), 48);
  const spreadSummary = sanitize(searchParams.get('spreadSummary'), 200);
  const spreadSnippet = sanitize(searchParams.get('spreadSnippet'), 200);
  const spreadCards =
    parseJsonParam<SpreadShareCard[]>(searchParams.get('spreadCards')) ?? [];

  const baseLabel = (() => {
    if (isPattern) {
      if (timeframe.toLowerCase().includes('pattern')) return timeframe;
      return `${timeframe} Tarot Patterns`;
    }
    return timeframe;
  })();

  const rawHeadline = isPattern
    ? name
      ? `${name}'s ${baseLabel}`
      : baseLabel
    : name
      ? `${name}'s ${baseLabel} Tarot`
      : `${baseLabel} Tarot Spotlight`;
  const headline =
    rawHeadline.length > 60 ? `${rawHeadline.slice(0, 59)}…` : rawHeadline;
  const theme = pickGradient(`${card}-${timeframe}-${name ?? 'general'}`);
  const primaryHandle = getPrimaryHandle(platform);
  const insights = Array.from(
    new Set(
      [suitInsight, ...extraInsights].filter((entry): entry is string =>
        Boolean(entry),
      ),
    ),
  ).slice(0, 4);
  const limitedSuitBlocks = suitBlocks.slice(0, 4);
  const limitedNumberBlocks = numberBlocks.slice(0, 4);
  const limitedCardBlocks = cardBlocks.slice(0, 4);
  const topHighlights = Array.from(
    new Set(
      [
        limitedSuitBlocks[0]?.reading,
        limitedNumberBlocks[0]?.reading,
        limitedCardBlocks[0]?.reading,
        ...insights,
      ].filter((entry): entry is string => Boolean(entry)),
    ),
  ).slice(0, 4);
  const robotoMono = await loadRobotoMono(request);

  const spreadCardsToShow = spreadCards.slice(0, 12);
  const cleanedSnippet =
    spreadSnippet?.replace(/^[^:]+:\s*/, '').trim() || undefined;

  if (variant === 'spread' && spreadCardsToShow.length > 0) {
    const isTwoColumns = spreadCardsToShow.length > 6;
    const isCompact = spreadCardsToShow.length > 6;
    const columns = isTwoColumns ? 2 : 1;
    const cardRows = Math.ceil(spreadCardsToShow.length / columns);
    const CARD_ROW_HEIGHT = 240;
    const HEADER_HEIGHT = 280;
    const FOOTER_HEIGHT = 200;
    const cardGap = 20;
    const computedHeight =
      HEADER_HEIGHT +
      FOOTER_HEIGHT +
      cardRows * CARD_ROW_HEIGHT +
      Math.max(0, cardRows - 1) * cardGap;
    const imageHeight = Math.min(3200, Math.max(1600, computedHeight));

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: theme.background,
          color: '#ffffff',
          padding: '48px 64px 64px',
          gap: '26px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontFamily: 'Roboto Mono',
              fontSize: 56,
              fontWeight: 600,
              letterSpacing: 2,
              lineHeight: 1.1,
            }}
          >
            {spreadName || 'Tarot Spread'}
          </div>
          {spreadSummary && (
            <div
              style={{
                fontFamily: 'Roboto Mono',
                fontSize: 26,
                opacity: 0.9,
                lineHeight: 1.4,
              }}
            >
              {spreadSummary}
            </div>
          )}
          {cleanedSnippet && (
            <div
              style={{
                fontFamily: 'Roboto Mono',
                fontSize: 22,
                lineHeight: 1.5,
                opacity: 0.82,
                maxWidth: '72%',
              }}
            >
              {cleanedSnippet}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'stretch',
            gap: `${cardGap}px`,
            justifyContent: 'space-between',
          }}
        >
          {spreadCardsToShow.map((card) => (
            <div
              key={`${card.positionLabel}-${card.cardName}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '22px 26px',
                backgroundColor: 'rgba(0,0,0,0.45)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                flex: columns === 2 ? '1 1 48%' : '1 1 100%',
                maxWidth: columns === 2 ? '48%' : '100%',
                minHeight: 220,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Roboto Mono',
                  fontSize: 13,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  opacity: 0.65,
                }}
              >
                {card.positionLabel}
              </div>
              {!isCompact && card.positionPrompt && (
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Roboto Mono',
                    fontSize: 16,
                    opacity: 0.8,
                  }}
                >
                  {card.positionPrompt}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'Roboto Mono',
                  fontSize: 32,
                  fontWeight: 600,
                }}
              >
                {card.cardName}
              </div>
              {!isCompact && card.insight && (
                <div
                  style={{
                    display: 'flex',
                    fontFamily: 'Roboto Mono',
                    fontSize: 18,
                    lineHeight: 1.4,
                    opacity: 0.9,
                  }}
                >
                  “{card.insight}”
                </div>
              )}
              {card.keywords?.length && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}
                >
                  {card.keywords.slice(0, 4).map((keyword) => (
                    <span
                      key={`${card.cardName}-${keyword}`}
                      style={{
                        display: 'flex',
                        fontFamily: 'Roboto Mono',
                        fontSize: 14,
                        padding: '3px 10px',
                        borderRadius: 10,
                        border: '1px solid rgba(255,255,255,0.3)',
                        opacity: 0.85,
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <ShareFooter format='landscape' />
      </div>,
      {
        width: 1200,
        height: imageHeight,
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

  return new ImageResponse(
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
        gap: '24px',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '28px',
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: 'Roboto Mono',
            fontSize: 48,
            fontWeight: 300,
            opacity: 0.9,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Roboto Mono',
            fontSize: 80,
            fontWeight: 500,
            letterSpacing: 4,
          }}
        >
          {card}
        </div>

        {keywords.length > 0 && (
          <div
            style={{
              display: 'flex',
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
          <div
            style={{
              display: 'flex',
              fontFamily: 'Roboto Mono',
              fontSize: 26,
              lineHeight: 1.6,
              maxWidth: '70%',
              opacity: 0.92,
            }}
          >
            {text}
          </div>
        )}
      </div>

      <ShareFooter format='landscape' />
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
