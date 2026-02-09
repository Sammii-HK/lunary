import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { ChartWheelOg } from '@/app/birth-chart/chart-wheel-og';
import { formatDegree } from '../../../../utils/astrology/astrology';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';
import { bodiesSymbols, zodiacSymbol } from '@/constants/symbols';
import { Button } from '@/components/ui/button';

const signDescriptions: Record<string, { trait: string }> = {
  Aries: { trait: 'bold & pioneering' },
  Taurus: { trait: 'grounded & sensual' },
  Gemini: { trait: 'curious & versatile' },
  Cancer: { trait: 'nurturing & intuitive' },
  Leo: { trait: 'radiant & confident' },
  Virgo: { trait: 'analytical & devoted' },
  Libra: { trait: 'harmonious & artistic' },
  Scorpio: { trait: 'intense & transformative' },
  Sagittarius: { trait: 'adventurous & philosophical' },
  Capricorn: { trait: 'ambitious & disciplined' },
  Aquarius: { trait: 'innovative & independent' },
  Pisces: { trait: 'dreamy & compassionate' },
};

const toZodiacGlyph = (sign?: string) => {
  if (!sign) return null;
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] ?? null;
};

const gradientsByElement: Record<
  string,
  { background: string; accent: string; soft: string }
> = {
  Fire: {
    background:
      'linear-gradient(135deg, #12060a 0%, #3b0f1b 40%, #a23030 100%)',
    accent: '#ffd6a3',
    soft: 'rgba(255, 214, 163, 0.18)',
  },
  Earth: {
    background:
      'linear-gradient(135deg, #07110d 0%, #0f1f17 40%, #2d6a4f 100%)',
    accent: '#b7f4c3',
    soft: 'rgba(183, 244, 195, 0.18)',
  },
  Air: {
    background:
      'linear-gradient(135deg, #06131f 0%, #091d2c 35%, #3a6ea5 100%)',
    accent: '#c3e3ff',
    soft: 'rgba(195, 227, 255, 0.18)',
  },
  Water: {
    background:
      'linear-gradient(135deg, #07081a 0%, #0b1029 40%, #3048a2 100%)',
    accent: '#d4dfff',
    soft: 'rgba(212, 223, 255, 0.18)',
  },
  default: {
    background:
      'linear-gradient(135deg, #0a0b12 0%, #14151f 40%, #433878 100%)',
    accent: '#f3d4ff',
    soft: 'rgba(243, 212, 255, 0.18)',
  },
};

const elementDescriptions: Record<string, { meaning: string; color: string }> =
  {
    Fire: {
      meaning: 'Passion, action, and enthusiasm drive you',
      color: 'text-orange-400',
    },
    Earth: {
      meaning: 'Stability, practicality, and reliability ground you',
      color: 'text-green-400',
    },
    Air: {
      meaning: 'Ideas, communication, and connection inspire you',
      color: 'text-sky-400',
    },
    Water: {
      meaning: 'Emotion, intuition, and empathy guide you',
      color: 'text-blue-400',
    },
  };

const modalityDescriptions: Record<string, string> = {
  Cardinal: 'You initiate, lead, and set things in motion',
  Fixed: 'You persist, stabilize, and see things through',
  Mutable: 'You adapt, transform, and embrace change',
};

export type ShareBirthChartDisplayData = {
  name?: string;
  formattedDate?: string | null;
  sun?: string;
  moon?: string;
  rising?: string;
  element?: string;
  modality?: string;
  insight?: string;
  keywords?: string[];
  birthChart?: BirthChartData[];
};

const BODY_ORDER = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Ascendant',
  'Midheaven',
  'North Node',
  'South Node',
  'Chiron',
  'Lilith',
] as const;

export function ShareBirthChartLayout({
  data,
}: {
  data: ShareBirthChartDisplayData;
}) {
  const {
    name,
    formattedDate,
    sun,
    moon,
    rising,
    element,
    modality,
    insight,
    keywords = [],
    birthChart = [],
  } = data;

  const theme =
    (element && gradientsByElement[element]) || gradientsByElement.default;

  const sortedPlacements = [...birthChart].sort((a, b) => {
    const idxA =
      BODY_ORDER.indexOf(a.body as (typeof BODY_ORDER)[number]) ?? -1;
    const idxB =
      BODY_ORDER.indexOf(b.body as (typeof BODY_ORDER)[number]) ?? -1;
    const normalizedIdxA = idxA === -1 ? BODY_ORDER.length : idxA;
    const normalizedIdxB = idxB === -1 ? BODY_ORDER.length : idxB;
    if (normalizedIdxA !== normalizedIdxB) {
      return normalizedIdxA - normalizedIdxB;
    }
    return a.body.localeCompare(b.body);
  });

  const hasChart = sortedPlacements.length > 0;

  const shareTitle = name
    ? `${name}'s Birth Chart Highlights`
    : 'Birth Chart Highlights';
  const shareSubtitle = formattedDate
    ? `Generated for ${formattedDate}`
    : 'Personalized cosmic profile';

  return (
    <div className='w-full text-white' style={{ background: theme.background }}>
      <div className='relative min-h-full'>
        <div
          className='absolute inset-0 pointer-events-none opacity-50'
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0 120px, transparent 180px), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.05) 0 90px, transparent 220px)',
          }}
        />
        <div className='mx-auto flex min-h-full max-w-4xl flex-col items-center px-4 py-16 text-center'>
          <div
            className='relative w-full rounded-3xl border border-white/10 p-8 shadow-2xl backdrop-blur'
            style={{ background: 'rgba(6,6,12,0.72)' }}
          >
            <div
              className='absolute inset-0 rounded-3xl'
              style={{
                background: theme.soft,
                filter: 'blur(120px)',
                opacity: 0.3,
              }}
            />
            <div className='relative z-10 flex flex-col gap-8'>
              <div className='space-y-2'>
                <p className='text-xs uppercase tracking-[0.35em] text-white/70'>
                  Shared from Lunary
                </p>
                <h1 className='text-3xl font-light text-white sm:text-4xl'>
                  {shareTitle}
                </h1>
                <p className='text-sm text-white/70'>{shareSubtitle}</p>
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='rounded-2xl border border-white/15 bg-black/50 p-5 text-left shadow-inner shadow-black/40'>
                  <p className='text-[0.6rem] uppercase tracking-[0.35em] text-white/70'>
                    Element
                  </p>
                  <p className='mt-2 text-lg font-semibold uppercase text-white'>
                    {element ?? 'Balanced'}
                  </p>
                  {element && elementDescriptions[element] && (
                    <p className='mt-1 text-xs text-white/60'>
                      {elementDescriptions[element].meaning}
                    </p>
                  )}
                </div>
                <div className='rounded-2xl border border-white/15 bg-black/50 p-5 text-left shadow-inner shadow-black/40'>
                  <p className='text-[0.6rem] uppercase tracking-[0.35em] text-white/70'>
                    Modality
                  </p>
                  <p className='mt-2 text-lg font-semibold uppercase text-white'>
                    {modality ?? 'Dynamic'}
                  </p>
                  {modality && modalityDescriptions[modality] && (
                    <p className='mt-1 text-xs text-white/60'>
                      {modalityDescriptions[modality]}
                    </p>
                  )}
                </div>
              </div>

              <div className='grid gap-4 sm:grid-cols-3'>
                {[
                  {
                    label: 'Sun Sign',
                    value: sun,
                    glyph: toZodiacGlyph(sun),
                    note: sun && signDescriptions[sun]?.trait,
                  },
                  {
                    label: 'Moon Sign',
                    value: moon,
                    glyph: toZodiacGlyph(moon),
                    note: moon && signDescriptions[moon]?.trait,
                  },
                  {
                    label: 'Rising Sign',
                    value: rising,
                    glyph: toZodiacGlyph(rising),
                    note: rising && signDescriptions[rising]?.trait,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className='rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-5 text-left'
                  >
                    <div className='flex items-center justify-between'>
                      <p className='text-[0.7rem] uppercase tracking-[0.35em] text-white/60'>
                        {item.label}
                      </p>
                      {item.glyph && (
                        <span
                          className='text-xl'
                          style={{ fontFamily: 'Astronomicon' }}
                        >
                          {item.glyph}
                        </span>
                      )}
                    </div>
                    <p className='mt-2 text-2xl font-light text-white'>
                      {item.value ?? '—'}
                    </p>
                    {item.note && (
                      <p className='mt-1 text-xs text-white/60'>{item.note}</p>
                    )}
                  </div>
                ))}
              </div>

              {keywords.length > 0 && (
                <div className='flex flex-wrap justify-center gap-2 text-[0.65rem] uppercase tracking-[0.35em] text-white/70'>
                  {keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className='rounded-full border border-white/20 px-3 py-1'
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}

              {insight && (
                <div className='rounded-2xl border border-white/10 bg-white/5 p-6 text-left'>
                  <p className='text-[0.6rem] uppercase tracking-[0.35em] text-white/60'>
                    Signature Insight
                  </p>
                  <p className='mt-2 text-sm leading-relaxed text-white/80'>
                    {insight}
                  </p>
                </div>
              )}

              {hasChart && (
                <div className='space-y-6 text-left'>
                  <div className='flex justify-center'>
                    <div className='relative rounded-[32px] border border-white/10 bg-gradient-to-br from-black/60 to-black/10 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.6)]'>
                      <ChartWheelOg birthChart={birthChart} size={360} />
                    </div>
                  </div>
                  <div className='text-[0.65rem] uppercase tracking-[0.35em] text-white/70'>
                    Full Chart Placements
                  </div>
                  <div className='grid gap-3 md:grid-cols-2'>
                    {sortedPlacements.map((placement) => {
                      const formatted = formatDegree(
                        placement.eclipticLongitude,
                      );
                      const symbolKey = placement.body
                        .toLowerCase()
                        .replace(/\s+/g, '') as keyof typeof bodiesSymbols;
                      const glyph =
                        bodiesSymbols[symbolKey] ?? placement.body.charAt(0);
                      const degreeLabel = `${formatted.degree}°${formatted.minute}'`;
                      const houseLabel = placement.house
                        ? ` · House ${placement.house}`
                        : '';
                      const retroLabel = placement.retrograde ? ' · ℞' : '';
                      const signGlyph = toZodiacGlyph(placement.sign);
                      return (
                        <div
                          key={`${placement.body}-${placement.sign}-${placement.house}`}
                          className='rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-4'
                        >
                          <div className='flex items-center gap-2'>
                            <span
                              className='text-lg'
                              style={{
                                fontFamily: 'Astronomicon',
                                fontSize: '20px',
                              }}
                            >
                              {glyph}
                            </span>
                            <span className='text-sm font-semibold text-white'>
                              {placement.body}
                            </span>
                          </div>
                          <p className='mt-1 text-xs text-white/70'>
                            {signGlyph ? (
                              <span
                                className='mr-1'
                                style={{ fontFamily: 'Astronomicon' }}
                              >
                                {signGlyph}
                              </span>
                            ) : null}
                            {placement.sign ?? '—'} · {degreeLabel}
                            {houseLabel}
                            {retroLabel}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className='mt-4 rounded-2xl border border-white/15 bg-gradient-to-br from-lunary-primary-950/50 to-lunary-secondary-950/40 p-6'>
                <div className='flex items-center justify-center gap-2 text-white'>
                  <Sparkles className='w-5 h-5 text-lunary-primary-400' />
                  <h3 className='text-lg font-medium'>
                    Discover Your Complete Cosmic Blueprint
                  </h3>
                </div>
                <p className='mt-3 text-sm text-white/70'>
                  Create your free birth chart on Lunary and explore the
                  planetary positions, aspects, patterns, and personalized
                  cosmic guidance all mapped to your unique moment.
                </p>
                <div className='mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-center'>
                  <Button asChild variant='lunary'>
                    <Link href='/auth?signup=true&redirect=/app/birth-chart'>
                      <Sparkles className='w-4 h-4' />
                      Get Your Free Birth Chart
                    </Link>
                  </Button>
                  <Button asChild variant='outline'>
                    <Link href='/'>Explore Lunary</Link>
                  </Button>
                </div>
                <p className='mt-3 text-xs text-white/50'>
                  Free account includes birth chart, daily insights, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
