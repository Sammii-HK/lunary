import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { SOCIAL_TAGS, getPrimaryHandle } from '@/constants/socialHandles';

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
  const card = sanitize(searchParams.get('card'), 48) ?? 'Your Tarot Card';
  const timeframe = sanitize(searchParams.get('timeframe'), 24) ?? 'Daily';
  const name = sanitize(searchParams.get('name'), 24);
  const keywords = parseKeywords(searchParams.get('keywords'));
  const text = sanitize(searchParams.get('text'), 160);
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
  const primaryHandle = getPrimaryHandle(platform);
  const handleBadges = SOCIAL_TAGS.slice(0, 4);
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
  const topHighlights = [
    limitedSuitBlocks[0]?.reading && {
      label: `${limitedSuitBlocks[0].suit} focus`,
      text: limitedSuitBlocks[0].reading,
    },
    limitedNumberBlocks[0]?.reading && {
      label: `${limitedNumberBlocks[0].number}s`,
      text: limitedNumberBlocks[0].reading,
    },
    limitedCardBlocks[0]?.reading && {
      label: limitedCardBlocks[0].name,
      text: limitedCardBlocks[0].reading,
    },
  ]
    .filter((entry): entry is { label: string; text: string } => Boolean(entry))
    .slice(0, 3);
  const robotoMono = await loadRobotoMono(request);

  const footerHandles = (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        fontSize: 20,
        fontFamily: 'Roboto Mono',
        justifyContent: 'flex-end',
        opacity: 0.9,
      }}
    >
      {handleBadges.map((handle) => (
        <div
          key={handle.platform}
          style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
        >
          <span style={{ fontSize: 18, opacity: 0.7 }}>
            {handle.label.replace(' / Twitter', '')}:
          </span>
          <span style={{ color: theme.accent }}>{handle.handle}</span>
        </div>
      ))}
    </div>
  );

  if (isPattern) {
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
            gap: '32px',
          }}
        >
          <div
            style={{
              fontFamily: 'Roboto Mono',
              fontSize: 26,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.75,
            }}
          >
            Pattern Intelligence · Shared from Lunary
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
              flexGrow: 1,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'Roboto Mono',
                  fontSize: 44,
                  fontWeight: 300,
                  opacity: 0.9,
                }}
              >
                {headline}
              </div>
              <div
                style={{
                  fontFamily: 'Roboto Mono',
                  fontSize: 70,
                  fontWeight: 500,
                  letterSpacing: 6,
                  marginTop: 12,
                }}
              >
                {card}
              </div>
            </div>

            {topHighlights.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    topHighlights.length > 1
                      ? 'repeat(2, minmax(0,1fr))'
                      : '1fr',
                  gap: '16px',
                }}
              >
                {topHighlights.map((highlight, index) => (
                  <div
                    key={`${highlight.label}-${index}`}
                    style={{
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.25)',
                      padding: '16px 20px',
                      backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                      }}
                    >
                      {highlight.label}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontFamily: 'Roboto Mono',
                        fontSize: 22,
                        lineHeight: 1.4,
                      }}
                    >
                      {highlight.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {keywords.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                {keywords.map((keyword) => (
                  <span
                    key={keyword}
                    style={{
                      fontFamily: 'Roboto Mono',
                      fontSize: 24,
                      padding: '8px 18px',
                      borderRadius: '999px',
                      border: `1px solid ${theme.accent}`,
                      color: theme.accent,
                      letterSpacing: 2,
                    }}
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}

            {(limitedSuitBlocks.length > 0 ||
              limitedNumberBlocks.length > 0) && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {limitedSuitBlocks.length > 0 && (
                  <div
                    style={{
                      borderRadius: 18,
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '18px 22px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                        marginBottom: 12,
                      }}
                    >
                      Suit Patterns
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          limitedSuitBlocks.length > 2
                            ? 'repeat(2, minmax(0,1fr))'
                            : '1fr',
                        gap: '12px',
                      }}
                    >
                      {limitedSuitBlocks.map((pattern) => (
                        <div
                          key={pattern.suit}
                          style={{
                            borderRadius: 14,
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '14px',
                            backgroundColor: 'rgba(0,0,0,0.25)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'Roboto Mono',
                              fontSize: 20,
                              fontWeight: 500,
                            }}
                          >
                            {pattern.suit}
                            {typeof totalCards === 'number' ? (
                              <span style={{ fontSize: 16, opacity: 0.7 }}>
                                {' '}
                                ({pattern.count}/{totalCards} days)
                              </span>
                            ) : (
                              <span style={{ fontSize: 16, opacity: 0.7 }}>
                                {' '}
                                · {pattern.count} pulls
                              </span>
                            )}
                          </div>
                          {pattern.reading && (
                            <div
                              style={{
                                marginTop: 8,
                                fontFamily: 'Roboto Mono',
                                fontSize: 18,
                                lineHeight: 1.4,
                                opacity: 0.85,
                              }}
                            >
                              {pattern.reading}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {limitedNumberBlocks.length > 0 && (
                  <div
                    style={{
                      borderRadius: 18,
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '18px 22px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                        marginBottom: 12,
                      }}
                    >
                      Number Patterns
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          limitedNumberBlocks.length > 2
                            ? 'repeat(2, minmax(0,1fr))'
                            : '1fr',
                        gap: '12px',
                      }}
                    >
                      {limitedNumberBlocks.map((pattern) => (
                        <div
                          key={pattern.number}
                          style={{
                            borderRadius: 14,
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '14px',
                            backgroundColor: 'rgba(0,0,0,0.25)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'Roboto Mono',
                              fontSize: 20,
                              fontWeight: 500,
                            }}
                          >
                            {pattern.number}s ({pattern.count}{' '}
                            {pattern.count === 1 ? 'time' : 'times'})
                          </div>
                          {pattern.reading && (
                            <div
                              style={{
                                marginTop: 8,
                                fontFamily: 'Roboto Mono',
                                fontSize: 18,
                                lineHeight: 1.4,
                                opacity: 0.85,
                              }}
                            >
                              {pattern.reading}
                            </div>
                          )}
                          {pattern.cards?.length ? (
                            <div
                              style={{
                                marginTop: 8,
                                fontFamily: 'Roboto Mono',
                                fontSize: 16,
                                opacity: 0.7,
                              }}
                            >
                              Cards: {pattern.cards.join(', ')}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {limitedCardBlocks.length > 0 && (
                  <div
                    style={{
                      borderRadius: 18,
                      border: '1px solid rgba(255,255,255,0.15)',
                      padding: '18px 22px',
                      backgroundColor: 'rgba(0,0,0,0.2)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                        marginBottom: 12,
                      }}
                    >
                      Card Patterns
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          limitedCardBlocks.length > 2
                            ? 'repeat(2, minmax(0,1fr))'
                            : '1fr',
                        gap: '12px',
                      }}
                    >
                      {limitedCardBlocks.map((pattern) => (
                        <div
                          key={pattern.name}
                          style={{
                            borderRadius: 14,
                            border: '1px solid rgba(255,255,255,0.1)',
                            padding: '14px',
                            backgroundColor: 'rgba(0,0,0,0.25)',
                          }}
                        >
                          <div
                            style={{
                              fontFamily: 'Roboto Mono',
                              fontSize: 20,
                              fontWeight: 500,
                            }}
                          >
                            {pattern.name} ({pattern.count}{' '}
                            {pattern.count === 1 ? 'time' : 'times'})
                          </div>
                          {pattern.reading && (
                            <div
                              style={{
                                marginTop: 8,
                                fontFamily: 'Roboto Mono',
                                fontSize: 18,
                                lineHeight: 1.4,
                                opacity: 0.85,
                              }}
                            >
                              {pattern.reading}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {insights.length > 0 && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    insights.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                  gap: '16px',
                }}
              >
                {insights.map((insight, index) => (
                  <div
                    key={`${insight}-${index}`}
                    style={{
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.2)',
                      padding: '18px 22px',
                      fontFamily: 'Roboto Mono',
                      fontSize: 22,
                      lineHeight: 1.5,
                      backgroundColor: 'rgba(0,0,0,0.25)',
                    }}
                  >
                    {insight}
                  </div>
                ))}
              </div>
            )}

            {(moonPhase || moonTip || transitImpact) && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '18px',
                }}
              >
                {(moonPhase || moonTip) && (
                  <div
                    style={{
                      borderRadius: 18,
                      padding: '20px 24px',
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      border: `1px solid ${theme.accent}33`,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                      }}
                    >
                      Moon Now
                    </div>
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 32,
                        fontWeight: 500,
                        marginTop: 8,
                        color: theme.accent,
                      }}
                    >
                      {moonPhase || 'Lunar vibes'}
                    </div>
                    {moonTip && (
                      <div
                        style={{
                          marginTop: 8,
                          fontFamily: 'Roboto Mono',
                          fontSize: 20,
                          lineHeight: 1.5,
                          opacity: 0.9,
                        }}
                      >
                        {moonTip}
                      </div>
                    )}
                  </div>
                )}
                {transitImpact && (
                  <div
                    style={{
                      borderRadius: 18,
                      padding: '20px 24px',
                      backgroundColor: 'rgba(0,0,0,0.35)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'Roboto Mono',
                        fontSize: 18,
                        letterSpacing: 3,
                        textTransform: 'uppercase',
                        opacity: 0.7,
                      }}
                    >
                      Transit Impact
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        fontFamily: 'Roboto Mono',
                        fontSize: 20,
                        lineHeight: 1.5,
                        opacity: 0.9,
                      }}
                    >
                      {transitImpact}
                    </div>
                  </div>
                )}
              </div>
            )}

            {actionPrompt && (
              <div
                style={{
                  borderRadius: 18,
                  padding: '18px 22px',
                  border: `1px solid ${theme.accent}33`,
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  fontFamily: 'Roboto Mono',
                  fontSize: 24,
                  letterSpacing: 1,
                }}
              >
                {actionPrompt}
              </div>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <div
              style={{
                fontFamily: 'Roboto Mono',
                fontSize: 22,
                opacity: 0.85,
              }}
            >
              {date || 'Updated moments ago'}
              <div
                style={{
                  fontSize: 18,
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                Tag {primaryHandle} when you post
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {footerHandles}
              <div
                style={{
                  marginTop: 10,
                  fontFamily: 'Roboto Mono',
                  fontSize: 20,
                  opacity: 0.8,
                }}
              >
                lunary.app/tarot
              </div>
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
          gap: '24px',
        }}
      >
        <div
          style={{
            fontFamily: 'Roboto Mono',
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0.8,
          }}
        >
          Shared from Lunary
        </div>

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

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: 'Roboto Mono',
            fontSize: 24,
            opacity: 0.85,
            gap: '18px',
          }}
        >
          <div>
            {date || 'Generated just now'}
            <div
              style={{
                fontSize: 18,
                opacity: 0.7,
                marginTop: 6,
              }}
            >
              Tag {primaryHandle} when you share
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: theme.accent,
                }}
              />
              <span>lunary.app/tarot</span>
            </div>
            <div style={{ marginTop: 12 }}>{footerHandles}</div>
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
