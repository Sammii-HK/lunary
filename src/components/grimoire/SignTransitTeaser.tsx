import { Observer } from 'astronomy-engine';
import { getAstrologicalChart } from '../../../utils/astrology/astrology';
import { planetUnicode, zodiacUnicode } from '../../../utils/zodiac/zodiac';
import { TransitBirthdayInput } from './TransitBirthdayInput';

const SIGN_GLYPHS: Record<string, string> = {
  Aries: zodiacUnicode.aries,
  Taurus: zodiacUnicode.taurus,
  Gemini: zodiacUnicode.gemini,
  Cancer: zodiacUnicode.cancer,
  Leo: zodiacUnicode.leo,
  Virgo: zodiacUnicode.virgo,
  Libra: zodiacUnicode.libra,
  Scorpio: zodiacUnicode.scorpio,
  Sagittarius: zodiacUnicode.sagittarius,
  Capricorn: zodiacUnicode.capricorn,
  Aquarius: zodiacUnicode.aquarius,
  Pisces: zodiacUnicode.pisces,
};

const ZODIAC_ORDER = [
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
] as const;

type AspectType = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

const ASPECT_OFFSETS: { name: AspectType; offset: number; label: string }[] = [
  { name: 'conjunction', offset: 0, label: 'in' },
  { name: 'sextile', offset: 2, label: 'sextile' },
  { name: 'square', offset: 3, label: 'square' },
  { name: 'trine', offset: 4, label: 'trine' },
  { name: 'opposition', offset: 6, label: 'opposition' },
  // reverse direction
  { name: 'sextile', offset: 10, label: 'sextile' },
  { name: 'square', offset: 9, label: 'square' },
  { name: 'trine', offset: 8, label: 'trine' },
];

const ASPECT_COLOURS: Record<AspectType, string> = {
  conjunction: 'text-lunary-accent-300',
  trine: 'text-emerald-400',
  sextile: 'text-sky-400',
  square: 'text-amber-400',
  opposition: 'text-red-400',
};

const ASPECT_EMOJI: Record<AspectType, string> = {
  conjunction: '☌',
  trine: '△',
  sextile: '⚹',
  square: '□',
  opposition: '☍',
};

const ASPECT_MEANING: Record<AspectType, string> = {
  conjunction: 'intensifying',
  trine: 'supporting',
  sextile: 'opening doors for',
  square: 'challenging',
  opposition: 'creating tension with',
};

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: planetUnicode.sun,
  Moon: planetUnicode.moon,
  Mercury: planetUnicode.mercury,
  Venus: planetUnicode.venus,
  Mars: planetUnicode.mars,
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
};

const PLANET_THEMES: Record<string, string> = {
  Sun: 'identity and purpose',
  Moon: 'emotions and instincts',
  Mercury: 'communication and thinking',
  Venus: 'love and values',
  Mars: 'drive and action',
  Jupiter: 'growth and opportunity',
  Saturn: 'discipline and structure',
  Uranus: 'change and innovation',
  Neptune: 'dreams and intuition',
  Pluto: 'transformation and power',
};

// Skip fast-moving bodies for sign-level aspects (they change too quickly)
const TRANSIT_BODIES = new Set([
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
]);

interface SignTransit {
  planet: string;
  planetSymbol: string;
  transitSign: string;
  aspect: AspectType;
  aspectSymbol: string;
  meaning: string;
  themes: string;
  retrograde: boolean;
  degree: string;
}

function getSignAspects(
  targetSign: string,
  currentSky: ReturnType<typeof getAstrologicalChart>,
): SignTransit[] {
  const targetIdx = ZODIAC_ORDER.indexOf(
    targetSign as (typeof ZODIAC_ORDER)[number],
  );
  if (targetIdx === -1) return [];

  const transits: SignTransit[] = [];

  for (const body of currentSky) {
    const bodyName = String(body.body);
    if (!TRANSIT_BODIES.has(bodyName)) continue;

    const bodySignIdx = ZODIAC_ORDER.indexOf(
      body.sign as (typeof ZODIAC_ORDER)[number],
    );
    if (bodySignIdx === -1) continue;

    for (const asp of ASPECT_OFFSETS) {
      const expectedIdx = (targetIdx + asp.offset) % 12;
      if (bodySignIdx === expectedIdx) {
        transits.push({
          planet: bodyName,
          planetSymbol: PLANET_SYMBOLS[bodyName] || bodyName[0],
          transitSign: body.sign,
          aspect: asp.name,
          aspectSymbol: ASPECT_EMOJI[asp.name],
          meaning: ASPECT_MEANING[asp.name],
          themes: PLANET_THEMES[bodyName] || 'cosmic influence',
          retrograde: body.retrograde,
          degree: body.formattedDegree ? `${body.formattedDegree.degree}°` : '',
        });
        break;
      }
    }
  }

  // Sort: squares/oppositions first (more interesting), then trines/sextiles
  const aspectWeight: Record<AspectType, number> = {
    square: 5,
    opposition: 4,
    conjunction: 3,
    trine: 2,
    sextile: 1,
  };
  transits.sort(
    (a, b) => (aspectWeight[b.aspect] || 0) - (aspectWeight[a.aspect] || 0),
  );

  // Pick 1 of each aspect type first for variety, then fill to 3 with duplicates
  const seen = new Set<AspectType>();
  const diverse: SignTransit[] = [];
  const rest: SignTransit[] = [];
  for (const t of transits) {
    if (!seen.has(t.aspect)) {
      seen.add(t.aspect);
      diverse.push(t);
    } else {
      rest.push(t);
    }
  }

  return [...diverse, ...rest];
}

interface SignTransitTeaserProps {
  sign: string;
  signDisplay: string;
}

export function SignTransitTeaser({
  sign,
  signDisplay,
}: SignTransitTeaserProps) {
  const observer = new Observer(51.4769, 0.0005, 0);
  const currentSky = getAstrologicalChart(new Date(), observer);
  const transits = getSignAspects(sign, currentSky);

  if (transits.length === 0) return null;

  // Show up to 3 most interesting transits
  const topTransits = transits.slice(0, 3);

  return (
    <div className='my-6 rounded-xl border border-lunary-primary-700/30 bg-lunary-primary-950/40 overflow-hidden'>
      <div className='px-5 py-3 border-b border-lunary-primary-700/20'>
        <p className='text-xs font-medium text-lunary-accent-400 uppercase tracking-wide'>
          Transits affecting {signDisplay} right now
        </p>
      </div>

      <div className='px-5 py-3 space-y-2'>
        {topTransits.map((t) => (
          <div
            key={`${t.planet}-${t.aspect}`}
            className='flex items-start gap-3 py-1.5'
          >
            <span className='text-lg leading-none mt-0.5 opacity-80 font-astro'>
              {t.planetSymbol}
            </span>
            <div className='min-w-0'>
              <p className='text-sm text-zinc-200'>
                <span className='font-medium'>
                  <span className='font-astro'>{t.planetSymbol}</span>{' '}
                  {t.planet}
                </span>
                {t.retrograde && (
                  <span className='text-xs text-amber-400 ml-1'>℞</span>
                )}
                {' in '}
                <span className='text-lunary-primary-300 font-astro'>
                  {SIGN_GLYPHS[t.transitSign] || ''}
                </span>{' '}
                {t.transitSign} {t.degree}{' '}
                <span className={ASPECT_COLOURS[t.aspect]}>
                  {t.aspectSymbol} {t.aspect}
                </span>{' '}
                <span className='text-lunary-primary-300 font-astro'>
                  {SIGN_GLYPHS[signDisplay] || ''}
                </span>{' '}
                {signDisplay}
              </p>
              <p className='text-xs text-zinc-500'>
                {t.meaning} your {t.themes}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className='px-5 py-4 border-t border-lunary-primary-700/20 bg-lunary-primary-900/20'>
        <TransitBirthdayInput />
      </div>
    </div>
  );
}
