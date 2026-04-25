'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  HeartHandshake,
  MessageCircle,
  Flame,
  Compass,
  Users,
} from 'lucide-react';
import {
  calculateSynastry,
  type SynastryAspect,
} from '../../../utils/astrology/synastry';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { SynastryAspectLine } from './SynastryChart';
import AudioNarrator from '@/components/audio/AudioNarrator';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';

const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

const ELEMENT_TINTS: Record<string, string> = {
  Fire: 'from-red-500/70 to-orange-500/70',
  Earth: 'from-emerald-600/70 to-green-500/70',
  Air: 'from-sky-400/70 to-blue-400/70',
  Water: 'from-blue-500/70 to-indigo-500/70',
};

type Props = {
  userChart: BirthChartData[];
  friendChart: BirthChartData[];
  /** Aspects from SynastryChart (preferred — keeps the visual + breakdown in sync). */
  aspects?: SynastryAspectLine[];
  userName?: string;
  friendName?: string;
};

type Category = {
  key: string;
  label: string;
  icon: typeof Flame;
  /** Pairs of (userPlanet, friendPlanet) that contribute to this category. */
  pairs: Array<[string, string]>;
  description: string;
  tone: string;
};

/**
 * Score a category 0-100 based on the inter-chart aspects that touch the
 * relevant planet pairs. Harmonious adds, challenging subtracts.
 */
function scoreCategory(
  category: Category,
  aspects: SynastryAspectLine[],
): number {
  let positive = 0;
  let negative = 0;
  let touched = 0;
  for (const a of aspects) {
    const matchA = category.pairs.some(
      ([u, f]) => u === a.userPlanet && f === a.friendPlanet,
    );
    const matchB = category.pairs.some(
      ([u, f]) => u === a.friendPlanet && f === a.userPlanet,
    );
    if (!matchA && !matchB) continue;
    touched += 1;
    // Tighter orbs count more.
    const tightness = Math.max(0.2, 1 - a.orb / 8);
    if (a.nature === 'harmonious') positive += tightness * 1.4;
    else if (a.nature === 'challenging') negative += tightness * 1.0;
    else positive += tightness * 0.6; // conjunctions are loaded but supportive on average
  }
  if (touched === 0) return 50;
  const raw = (positive - negative + touched) / (touched * 2);
  return Math.max(0, Math.min(100, Math.round(raw * 100)));
}

const CATEGORIES: Category[] = [
  {
    key: 'communication',
    label: 'Communication',
    icon: MessageCircle,
    pairs: [
      ['Mercury', 'Mercury'],
      ['Mercury', 'Sun'],
      ['Sun', 'Mercury'],
      ['Mercury', 'Moon'],
      ['Moon', 'Mercury'],
      ['Mercury', 'Jupiter'],
      ['Jupiter', 'Mercury'],
    ],
    description: 'How easily ideas and words flow.',
    tone: 'from-sky-400 to-blue-500',
  },
  {
    key: 'romance',
    label: 'Romance',
    icon: HeartHandshake,
    pairs: [
      ['Venus', 'Mars'],
      ['Mars', 'Venus'],
      ['Venus', 'Venus'],
      ['Sun', 'Venus'],
      ['Venus', 'Sun'],
      ['Moon', 'Venus'],
      ['Venus', 'Moon'],
    ],
    description: 'Chemistry, attraction, the spark.',
    tone: 'from-rose-400 to-pink-500',
  },
  {
    key: 'energy',
    label: 'Energy',
    icon: Flame,
    pairs: [
      ['Mars', 'Mars'],
      ['Mars', 'Sun'],
      ['Sun', 'Mars'],
      ['Mars', 'Jupiter'],
      ['Jupiter', 'Mars'],
      ['Sun', 'Sun'],
    ],
    description: 'Drive, momentum, how you move together.',
    tone: 'from-orange-400 to-red-500',
  },
  {
    key: 'spiritual',
    label: 'Spiritual',
    icon: Compass,
    pairs: [
      ['Jupiter', 'Saturn'],
      ['Saturn', 'Jupiter'],
      ['Jupiter', 'Jupiter'],
      ['Sun', 'Jupiter'],
      ['Jupiter', 'Sun'],
      ['Moon', 'Jupiter'],
      ['Jupiter', 'Moon'],
    ],
    description: 'Shared meaning, growth and purpose.',
    tone: 'from-violet-400 to-purple-500',
  },
  {
    key: 'friendship',
    label: 'Friendship',
    icon: Users,
    pairs: [
      ['Sun', 'Moon'],
      ['Moon', 'Sun'],
      ['Moon', 'Moon'],
      ['Sun', 'Saturn'],
      ['Saturn', 'Sun'],
      ['Moon', 'Saturn'],
      ['Saturn', 'Moon'],
    ],
    description: 'Trust, comfort, the quiet glue.',
    tone: 'from-emerald-400 to-teal-500',
  },
];

function reframe(aspect: string): string {
  switch (aspect.toLowerCase()) {
    case 'square':
      return 'Friction here is the muscle of growth — it shows you where to flex.';
    case 'opposition':
      return 'Opposites that sharpen each other — practice meeting in the middle.';
    case 'conjunction':
      return 'Powerful merge — keep checking that you both still have your own shape.';
    default:
      return 'A subtle edge that becomes a gift once you name it together.';
  }
}

function planetLabel(planet: string) {
  return planet;
}

export function CompatibilityBreakdown({
  userChart,
  friendChart,
  aspects: providedAspects,
  userName,
  friendName,
}: Props) {
  // Run synastry.ts to surface its overall score, summary, strengths, etc.
  const synastry = useMemo(
    () =>
      calculateSynastry(
        userChart,
        friendChart,
        userName || 'You',
        friendName || 'Them',
      ),
    [userChart, friendChart, userName, friendName],
  );

  // For the chart-side breakdown we use the same aspects the SynastryChart
  // computed (richer planet set) — falls back to synastry.ts aspects.
  const aspectsForCategories = useMemo<SynastryAspectLine[]>(() => {
    if (providedAspects && providedAspects.length > 0) return providedAspects;
    return synastry.aspects.map((a) => ({
      key: `${a.personA.planet}-${a.personB.planet}-${a.aspect}`,
      userPlanet: a.personA.planet,
      friendPlanet: a.personB.planet,
      userLon: 0,
      friendLon: 0,
      aspect: a.aspect,
      color:
        a.nature === 'harmonious'
          ? '#7BFFB8'
          : a.nature === 'challenging'
            ? '#f87171'
            : '#C77DFF',
      nature: a.nature,
      orb: a.orb,
    }));
  }, [providedAspects, synastry.aspects]);

  const categoryScores = useMemo(() => {
    return CATEGORIES.map((c) => ({
      ...c,
      score: scoreCategory(c, aspectsForCategories),
    }));
  }, [aspectsForCategories]);

  // Element accent: weight by friend's sun sign (it's their page).
  const friendSun = friendChart.find((p) => p.body === 'Sun');
  const accentEl = friendSun ? SIGN_ELEMENTS[friendSun.sign] : 'Air';
  const accentTint = ELEMENT_TINTS[accentEl] || ELEMENT_TINTS.Air;

  // Highlights: top 3 harmonious aspects (tightest orb wins ties).
  const highlights = useMemo<SynastryAspect[]>(() => {
    return synastry.aspects
      .filter((a) => a.nature === 'harmonious' || a.aspect === 'conjunction')
      .slice(0, 3);
  }, [synastry.aspects]);

  // Growth edges: top 3 challenging aspects.
  const growthEdges = useMemo<SynastryAspect[]>(() => {
    return synastry.aspects
      .filter((a) => a.nature === 'challenging')
      .slice(0, 3);
  }, [synastry.aspects]);

  const score = synastry.compatibilityScore;

  // Concatenate all narrative prose for the audio narrator at the top.
  const narratorText = useMemo(() => {
    const parts: string[] = [
      `Cosmic match: ${score} percent.`,
      synastry.summary,
    ];
    if (highlights.length > 0) {
      parts.push('Highlights:');
      for (const a of highlights) {
        parts.push(
          `${a.personA.planet} ${a.aspect} ${a.personB.planet}. ${a.description}`,
        );
      }
    }
    if (growthEdges.length > 0) {
      parts.push('Growth edges:');
      for (const a of growthEdges) {
        parts.push(
          `${a.personA.planet} ${a.aspect} ${a.personB.planet}. ${a.description}`,
        );
      }
    }
    if (synastry.strengths.length > 0) {
      parts.push('What you bring out in each other:');
      parts.push(...synastry.strengths);
    }
    return parts.join('\n\n');
  }, [score, synastry.summary, synastry.strengths, highlights, growthEdges]);

  return (
    <div className='space-y-5' data-testid='compatibility-breakdown'>
      {/* Overall score */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className='rounded-2xl border border-stroke-subtle bg-surface-elevated/80 p-5 md:p-6 backdrop-blur'
      >
        <div className='flex flex-col sm:flex-row sm:items-center sm:gap-6'>
          <div className='flex items-baseline gap-2'>
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                type: 'spring',
                stiffness: 220,
                damping: 22,
                delay: 0.15,
              }}
              className={`text-6xl md:text-7xl font-bold bg-gradient-to-r ${accentTint} bg-clip-text text-transparent`}
            >
              {score}
            </motion.span>
            <span className='text-2xl text-content-muted'>%</span>
            <span className='ml-3 text-xs uppercase tracking-wider text-content-muted'>
              Cosmic Match
            </span>
          </div>
          <AutoLinkText
            as='p'
            className='mt-3 sm:mt-0 text-sm text-content-secondary flex-1'
          >
            {synastry.summary}
          </AutoLinkText>
        </div>

        <div className='mt-4 flex justify-end'>
          <AudioNarrator
            text={narratorText}
            title='Compatibility breakdown'
            compactVariant='inline'
          />
        </div>

        {/* Bar */}
        <div className='mt-5 h-2 rounded-full bg-surface-overlay overflow-hidden'>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className={`h-full rounded-full bg-gradient-to-r ${accentTint}`}
          />
        </div>
      </motion.div>

      {/* Category bars */}
      <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
        <h3 className='text-xs font-semibold uppercase tracking-wider text-content-muted mb-4'>
          By Connection Type
        </h3>
        <div className='space-y-3'>
          {categoryScores.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className='space-y-1.5'
                data-testid={`compat-cat-${c.key}`}
              >
                <div className='flex items-center justify-between text-xs'>
                  <span className='inline-flex items-center gap-1.5 text-content-secondary'>
                    <Icon className='w-3.5 h-3.5 text-lunary-primary' />
                    <span className='font-medium'>{c.label}</span>
                    <span className='text-[10px] text-content-muted hidden sm:inline'>
                      {c.description}
                    </span>
                  </span>
                  <span className='font-semibold text-content-primary tabular-nums'>
                    {c.score}%
                  </span>
                </div>
                <div className='h-1.5 rounded-full bg-surface-overlay/80 overflow-hidden'>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.score}%` }}
                    transition={{
                      duration: 0.9,
                      delay: 0.1 + 0.05 * i,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`h-full rounded-full bg-gradient-to-r ${c.tone}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      {highlights.length > 0 && (
        <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <Sparkles className='w-4 h-4 text-lunary-primary' />
            <h3 className='text-xs font-semibold uppercase tracking-wider text-content-muted'>
              Highlights
            </h3>
          </div>
          <ul className='space-y-3'>
            {highlights.map((a, i) => (
              <motion.li
                key={`hl-${i}-${a.personA.planet}-${a.personB.planet}-${a.aspect}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className='flex gap-3 rounded-lg bg-layer-base/30 border border-stroke-subtle/60 p-3'
              >
                <span
                  className='font-astro text-lg'
                  style={{ color: '#7BFFB8' }}
                  aria-hidden
                >
                  {a.aspectSymbol}
                </span>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm text-content-primary'>
                    Your{' '}
                    <span className='font-semibold'>
                      {planetLabel(a.personA.planet)}
                    </span>{' '}
                    <span className='text-content-muted'>{a.aspect}</span>{' '}
                    {friendName ? `${friendName}'s` : 'their'}{' '}
                    <span className='font-semibold'>
                      {planetLabel(a.personB.planet)}
                    </span>
                    <span className='text-[10px] text-content-muted ml-2'>
                      {a.orb.toFixed(1)}°
                    </span>
                  </div>
                  <AutoLinkText
                    as='p'
                    className='text-xs text-content-secondary mt-0.5'
                  >
                    {a.description}
                  </AutoLinkText>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Growth edges */}
      {growthEdges.length > 0 && (
        <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/60 p-5'>
          <div className='flex items-center gap-2 mb-3'>
            <Flame className='w-4 h-4 text-amber-400' />
            <h3 className='text-xs font-semibold uppercase tracking-wider text-content-muted'>
              Growth Edges
            </h3>
          </div>
          <ul className='space-y-3'>
            {growthEdges.map((a, i) => (
              <motion.li
                key={`ge-${i}-${a.personA.planet}-${a.personB.planet}-${a.aspect}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className='flex gap-3 rounded-lg bg-layer-base/30 border border-stroke-subtle/60 p-3'
              >
                <span
                  className='font-astro text-lg'
                  style={{ color: '#f87171' }}
                  aria-hidden
                >
                  {a.aspectSymbol}
                </span>
                <div className='flex-1 min-w-0'>
                  <div className='text-sm text-content-primary'>
                    Your{' '}
                    <span className='font-semibold'>
                      {planetLabel(a.personA.planet)}
                    </span>{' '}
                    <span className='text-content-muted'>{a.aspect}</span>{' '}
                    {friendName ? `${friendName}'s` : 'their'}{' '}
                    <span className='font-semibold'>
                      {planetLabel(a.personB.planet)}
                    </span>
                    <span className='text-[10px] text-content-muted ml-2'>
                      {a.orb.toFixed(1)}°
                    </span>
                  </div>
                  <AutoLinkText
                    as='p'
                    className='text-xs text-content-secondary mt-0.5'
                  >
                    {a.description}
                  </AutoLinkText>
                  <AutoLinkText
                    as='p'
                    className='text-xs text-amber-300/90 mt-1 italic'
                  >
                    {reframe(a.aspect)}
                  </AutoLinkText>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Strengths from synastry.ts */}
      {synastry.strengths.length > 0 && (
        <div className='rounded-2xl border border-stroke-subtle bg-surface-elevated/40 p-5'>
          <h3 className='text-xs font-semibold uppercase tracking-wider text-content-muted mb-3'>
            What you bring out in each other
          </h3>
          <ul className='space-y-1.5 text-sm text-content-secondary'>
            {synastry.strengths.map((s, i) => (
              <li key={`s-${i}`} className='flex items-start gap-2'>
                <span className='mt-1 inline-block w-1.5 h-1.5 rounded-full bg-lunary-primary flex-shrink-0' />
                <AutoLinkText>{s}</AutoLinkText>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CompatibilityBreakdown;
