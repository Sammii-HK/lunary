'use client';

import Link from 'next/link';
import {
  bodiesSymbols,
  astroPointSymbols,
  zodiacSymbol,
  aspectSymbols,
} from '@/constants/symbols';

// ── Astronomicon glyph maps ───────────────────────────────────────────────────
const PLANET_ASTRO: Record<string, string> = {
  Sun: bodiesSymbols.sun,
  Moon: bodiesSymbols.moon,
  Mercury: bodiesSymbols.mercury,
  Venus: bodiesSymbols.venus,
  Mars: bodiesSymbols.mars,
  Jupiter: bodiesSymbols.jupiter,
  Saturn: bodiesSymbols.saturn,
  Uranus: bodiesSymbols.uranus,
  Neptune: bodiesSymbols.neptune,
  Pluto: bodiesSymbols.pluto,
  Ascendant: astroPointSymbols.ascendant,
  Midheaven: astroPointSymbols.midheaven,
  Descendant: astroPointSymbols.descendant,
  'Imum Coeli': astroPointSymbols.imumcoeli,
};

const SIGN_ASTRO: Record<string, string> = {
  Aries: zodiacSymbol.aries,
  Taurus: zodiacSymbol.taurus,
  Gemini: zodiacSymbol.gemini,
  Cancer: zodiacSymbol.cancer,
  Leo: zodiacSymbol.leo,
  Virgo: zodiacSymbol.virgo,
  Libra: zodiacSymbol.libra,
  Scorpio: zodiacSymbol.scorpio,
  Sagittarius: zodiacSymbol.sagittarius,
  Capricorn: zodiacSymbol.capricorn,
  Aquarius: zodiacSymbol.aquarius,
  Pisces: zodiacSymbol.pisces,
};

// ── Shared copy dictionaries ──────────────────────────────────────────────────
export const ASPECT_VERBS: Record<string, string> = {
  conjunction: 'conjoins',
  opposition: 'opposes',
  trine: 'trines',
  square: 'squares',
  sextile: 'sextiles',
};

export const ASPECT_DESCRIPTIONS: Record<string, string> = {
  conjunction: 'Merging energies',
  opposition: 'Balancing tension',
  trine: 'Flowing harmony',
  square: 'Dynamic challenge',
  sextile: 'Gentle opportunity',
};

export const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'brings identity, vitality, purpose, and the urge to shine',
  Moon: 'brings emotion, instinct, memory, comfort needs, and the inner world',
  Mercury: 'brings thought, communication, curiosity, and the need to process',
  Venus: 'brings beauty, pleasure, values, attraction, and the art of relating',
  Mars: 'brings drive, desire, assertion, courage, and the push to act',
  Jupiter:
    'brings expansion, optimism, belief, growth, and the search for meaning',
  Saturn:
    'brings structure, discipline, limitation, responsibility, and earned reward',
  Uranus:
    'brings disruption, innovation, liberation, sudden change, and the urge to break free',
  Neptune:
    'brings dreams, longing, imagination, spirituality, and porous boundaries',
  Pluto: 'brings depth, transformation, power, endings, and rebirth',
};

export const SIGN_MEANINGS: Record<string, string> = {
  Aries: 'direct, initiating, hot, urgent, and instinctive',
  Taurus: 'steady, sensory, grounded, patient, and possessive',
  Gemini: 'curious, quick, dual, communicative, and restless',
  Cancer: 'protective, emotional, intuitive, nurturing, and retreating',
  Leo: 'expressive, warm, bold, generous, and hungry for recognition',
  Virgo: 'precise, analytical, modest, service-oriented, and detail-focused',
  Libra: 'balanced, aesthetic, relational, diplomatic, and fair-minded',
  Scorpio: 'intense, probing, secretive, transformative, and magnetic',
  Sagittarius:
    'expansive, philosophical, adventurous, blunt, and freedom-seeking',
  Capricorn: 'ambitious, strategic, disciplined, cautious, and status-aware',
  Aquarius:
    'innovative, detached, humanitarian, eccentric, and forward-looking',
  Pisces: 'fluid, compassionate, mystical, boundary-dissolving, and oceanic',
};

export const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, appearance, and how life is met',
  2: 'self-worth, money, and material security',
  3: 'communication, learning, and local connections',
  4: 'home, family, roots, and emotional foundations',
  5: 'creativity, romance, pleasure, and self-expression',
  6: 'health, daily routines, and service',
  7: 'partnerships, relationships, and committed others',
  8: 'transformation, shared resources, and intimacy',
  9: 'philosophy, expansion, and higher learning',
  10: 'career, reputation, and public direction',
  11: 'community, friendships, and collective goals',
  12: 'rest, closure, and the subconscious',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  if (n % 10 === 1) return 'st';
  if (n % 10 === 2) return 'nd';
  if (n % 10 === 3) return 'rd';
  return 'th';
}

export function ordinal(n: number) {
  return `${n}${getOrdinalSuffix(n)}`;
}

export function houseHref(h: number) {
  return `/grimoire/houses/${ordinal(h)}-house`;
}

/** Build the primary aspect sentence. Used by both in-app and share mappers. */
export function buildAspectSentence(
  transitPlanet: string,
  transitSign: string,
  natalPlanet: string,
  natalSign: string,
  aspectType: string,
  transitHouse: number | null | undefined,
  natalHouse: number | null | undefined,
): string {
  const verb = ASPECT_VERBS[aspectType] ?? 'aspects';
  let sentence = `${transitPlanet} in ${transitSign} ${verb} natal ${natalPlanet} in ${natalSign}`;

  const houseParts: string[] = [];
  if (transitHouse) {
    houseParts.push(
      `your ${ordinal(transitHouse)} house of ${HOUSE_THEMES[transitHouse] ?? ''}`,
    );
  }
  if (natalHouse && natalHouse !== transitHouse) {
    houseParts.push(
      `your natal ${ordinal(natalHouse)} house of ${HOUSE_THEMES[natalHouse] ?? ''}`,
    );
  }

  if (houseParts.length === 2) {
    sentence += `, activating ${houseParts[0]} while pressing on ${houseParts[1]}`;
  } else if (houseParts.length === 1) {
    sentence += `, activating ${houseParts[0]}`;
  }

  return sentence + '.';
}

/** Build the secondary context copy. */
export function buildContextCopy(
  transitPlanet: string,
  transitSign: string,
): string {
  const parts: string[] = [];
  const planetMeaning = PLANET_MEANINGS[transitPlanet];
  const signMeaning = SIGN_MEANINGS[transitSign];
  if (planetMeaning) parts.push(`${transitPlanet} ${planetMeaning}.`);
  if (signMeaning)
    parts.push(`In ${transitSign}, that energy is ${signMeaning}.`);
  if (parts.length === 0) return '';
  return `The moving sky layer: ${parts.join(' ')}`;
}

/** Get the Astronomicon aspect symbol for an aspect type. */
export function getAspectGlyph(aspectType: string): string {
  return aspectSymbols[aspectType.toLowerCase()] ?? aspectType.charAt(0);
}

// ── Styling ───────────────────────────────────────────────────────────────────
const ASPECT_STYLES: Record<
  string,
  { border: string; bg: string; symbol: string; label: string }
> = {
  conjunction: {
    border: 'border-lunary-primary-400/40',
    bg: 'bg-layer-deep/40',
    symbol: 'text-content-brand',
    label: 'text-content-secondary',
  },
  opposition: {
    border: 'border-lunary-error-300/30',
    bg: 'bg-layer-deep/30',
    symbol: 'text-lunary-error-300',
    label: 'text-lunary-error-200',
  },
  trine: {
    border: 'border-lunary-success-400/40',
    bg: 'bg-layer-deep/40',
    symbol: 'text-lunary-success-300',
    label: 'text-lunary-success-200',
  },
  square: {
    border: 'border-lunary-rose-400/40',
    bg: 'bg-layer-deep/40',
    symbol: 'text-lunary-rose-300',
    label: 'text-lunary-rose-200',
  },
  sextile: {
    border: 'border-lunary-secondary-400/40',
    bg: 'bg-layer-deep/40',
    symbol: 'text-content-brand-secondary',
    label: 'text-content-brand-secondary',
  },
};

const DEFAULT_STYLE = {
  border: 'border-stroke-default',
  bg: 'bg-surface-card/50',
  symbol: 'text-content-muted',
  label: 'text-content-secondary',
};

function getAspectStyles(aspectType: string) {
  return ASPECT_STYLES[aspectType.toLowerCase()] ?? DEFAULT_STYLE;
}

function getOrbColor(orb: number): string {
  if (orb <= 1) return 'text-lunary-success-400';
  if (orb <= 3) return 'text-content-brand-accent';
  return 'text-content-muted';
}

// ── AspectCardData ─────────────────────────────────────────────────────────────
export interface AspectCardData {
  /** Lowercase aspect type: "conjunction" | "opposition" | "trine" | "square" | "sextile" */
  aspectType: string;
  /** Glyph character: "☌" | "☍" | "△" | "□" | "⚹" */
  aspectGlyph: string;
  orb: number;
  transitPlanet: string;
  transitSign: string;
  /** Optional formatted degree string e.g. "15°32'" */
  transitDegree?: string;
  natalPlanet: string;
  natalSign: string;
  natalDegree?: string;
  transitHouse?: number | null;
  natalHouse?: number | null;
  /** Primary rich sentence shown prominently */
  sentence: string;
  /** Secondary planet/sign/moving-sky context shown in muted text */
  contextCopy?: string;
  /** Present for in-app live transits; absent on share/static views */
  duration?: {
    displayText: string;
    isApplying: boolean;
  };
  /** e.g. "peaks today", "peaks 28 May", "peaked 25 May" */
  exactDateLabel?: string;
}

// ── AspectCard component ──────────────────────────────────────────────────────
export function AspectCard({ aspect }: { aspect: AspectCardData }) {
  const styles = getAspectStyles(aspect.aspectType);
  const transitGlyph = PLANET_ASTRO[aspect.transitPlanet];
  const transitSignGlyph = SIGN_ASTRO[aspect.transitSign];
  const natalGlyph = PLANET_ASTRO[aspect.natalPlanet];
  const natalSignGlyph = SIGN_ASTRO[aspect.natalSign];
  const transitSignMeaning = SIGN_MEANINGS[aspect.transitSign];
  const natalSignMeaning = SIGN_MEANINGS[aspect.natalSign];

  return (
    <div className={`rounded-lg border ${styles.border} ${styles.bg} p-3`}>
      {/* Row 1: aspect type + orb */}
      <div className='flex items-center justify-between mb-0.5'>
        <div className='flex items-center gap-1.5'>
          <span className={`text-base leading-none ${styles.symbol}`}>
            {aspect.aspectGlyph}
          </span>
          <span className={`text-sm font-medium capitalize ${styles.label}`}>
            {aspect.aspectType}
          </span>
        </div>
        <span className={`text-xs ${getOrbColor(aspect.orb)}`}>
          {aspect.orb.toFixed(1)}°
        </span>
      </div>

      {/* Row 2: description */}
      <p className='text-xs text-content-muted mb-1.5'>
        {ASPECT_DESCRIPTIONS[aspect.aspectType.toLowerCase()] ?? ''}
      </p>

      {/* Row 3: planet + sign chain with Astronomicon glyphs */}
      <div className='flex items-center gap-1.5 text-xs mb-2 flex-wrap'>
        {transitGlyph && (
          <span className={`font-astro text-sm leading-none ${styles.symbol}`}>
            {transitGlyph}
          </span>
        )}
        <span className='text-content-secondary font-medium'>
          {aspect.transitPlanet}
        </span>
        {transitSignGlyph && (
          <span className='font-astro text-xs text-content-muted'>
            {transitSignGlyph}
          </span>
        )}
        <span className='text-content-muted text-[10px]'>
          {aspect.transitSign}
          {aspect.transitDegree ? ` ${aspect.transitDegree}` : ''}
        </span>

        <span className={`text-sm leading-none ${styles.symbol}`}>
          {aspect.aspectGlyph}
        </span>

        {natalGlyph && (
          <span className={`font-astro text-sm leading-none ${styles.symbol}`}>
            {natalGlyph}
          </span>
        )}
        <span className='text-content-secondary font-medium'>
          {aspect.natalPlanet}
        </span>
        {natalSignGlyph && (
          <span className='font-astro text-xs text-content-muted'>
            {natalSignGlyph}
          </span>
        )}
        <span className='text-content-muted text-[10px]'>
          {aspect.natalSign}
          {aspect.natalDegree ? ` ${aspect.natalDegree}` : ''}
        </span>
      </div>

      {/* Row 4: badges */}
      <div className='flex flex-wrap items-center gap-1.5 mb-2'>
        {aspect.duration && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              aspect.duration.isApplying
                ? 'bg-layer-deep/60 text-content-brand border-lunary-primary-700/50'
                : 'bg-surface-elevated/60 text-content-muted border-stroke-default/50'
            }`}
          >
            {aspect.duration.isApplying ? 'Applying' : 'Separating'}
          </span>
        )}
        {aspect.exactDateLabel && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${
              aspect.exactDateLabel.startsWith('peaks')
                ? 'bg-layer-deep/60 text-content-brand border-lunary-primary-700/50'
                : 'bg-surface-elevated/60 text-content-muted border-stroke-default/50'
            }`}
          >
            {aspect.exactDateLabel}
          </span>
        )}
        {!aspect.exactDateLabel && aspect.duration && (
          <span className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-surface-elevated border-stroke-subtle text-content-muted'>
            {aspect.duration.displayText}
          </span>
        )}
        {aspect.transitHouse != null && (
          <Link
            href={houseHref(aspect.transitHouse)}
            className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-layer-deep/60 text-content-brand border-lunary-primary-700/50 hover:border-lunary-primary-500 transition'
          >
            {ordinal(aspect.transitHouse)} house
          </Link>
        )}
        {aspect.natalHouse != null &&
          aspect.natalHouse !== aspect.transitHouse && (
            <Link
              href={houseHref(aspect.natalHouse)}
              className='inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border bg-surface-elevated border-stroke-subtle text-content-muted hover:text-content-secondary transition'
            >
              natal {ordinal(aspect.natalHouse)} house
            </Link>
          )}
      </div>

      {/* Row 5: rich sentence */}
      <p className='text-xs text-content-secondary leading-relaxed mb-2'>
        {aspect.sentence}
      </p>

      {/* Row 6: context copy (planet meaning + moving sky reminder) */}
      {aspect.contextCopy && (
        <p className='text-[11px] text-content-muted leading-relaxed mb-2'>
          {aspect.contextCopy}
        </p>
      )}

      {/* Row 7: sign context chips */}
      {(transitSignMeaning || natalSignMeaning) && (
        <div className='pt-2 border-t border-stroke-default/40 flex flex-wrap gap-1.5'>
          {transitSignMeaning && (
            <span className='inline-flex items-center gap-1 rounded-full border border-stroke-subtle px-2 py-0.5 text-[10px] text-content-muted'>
              {transitSignGlyph && (
                <span className='font-astro'>{transitSignGlyph}</span>
              )}
              {aspect.transitSign} —{' '}
              {transitSignMeaning.split(',').slice(0, 2).join(',')}
            </span>
          )}
          {natalSignMeaning && aspect.natalSign !== aspect.transitSign && (
            <span className='inline-flex items-center gap-1 rounded-full border border-stroke-subtle px-2 py-0.5 text-[10px] text-content-muted'>
              {natalSignGlyph && (
                <span className='font-astro'>{natalSignGlyph}</span>
              )}
              {aspect.natalSign} —{' '}
              {natalSignMeaning.split(',').slice(0, 2).join(',')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── ActiveHousesGrid ──────────────────────────────────────────────────────────
interface HouseEntry {
  transitHouse?: number | null;
  natalHouse?: number | null;
}

export function ActiveHousesGrid({ aspects }: { aspects: HouseEntry[] }) {
  const active = new Map<number, { isNatal: boolean }>();

  for (const a of aspects) {
    if (a.transitHouse) {
      if (!active.has(a.transitHouse)) {
        active.set(a.transitHouse, { isNatal: false });
      }
    }
    if (a.natalHouse && a.natalHouse !== a.transitHouse) {
      if (!active.has(a.natalHouse)) {
        active.set(a.natalHouse, { isNatal: true });
      }
    }
  }

  if (active.size === 0) return null;

  return (
    <div className='mb-3'>
      <p className='text-xs text-content-muted mb-2'>Houses being activated</p>
      <div className='grid grid-cols-6 gap-1.5'>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => {
          const entry = active.get(h);
          const theme = HOUSE_THEMES[h];
          return (
            <Link
              key={h}
              href={houseHref(h)}
              className={`flex flex-col items-center gap-0.5 rounded-lg border p-1.5 text-center transition ${
                entry
                  ? entry.isNatal
                    ? 'border-stroke-subtle bg-surface-elevated/60 text-content-secondary hover:border-lunary-primary-700/50'
                    : 'border-lunary-primary-700/50 bg-lunary-primary/10 text-content-brand hover:border-lunary-primary-500'
                  : 'border-stroke-subtle bg-surface-base text-content-muted opacity-25 pointer-events-none'
              }`}
            >
              <span className='text-xs font-semibold'>{h}</span>
              {entry && theme && (
                <span className='text-[8px] leading-tight text-content-muted line-clamp-1'>
                  {theme.split(',')[0]}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
