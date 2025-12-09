'use client';

import { useMemo } from 'react';
import { Telescope } from 'lucide-react';
import { useAstronomyContext } from '@/context/AstronomyContext';
import { bodiesSymbols, zodiacSymbol } from '../../../utils/zodiac/zodiac';
import {
  ExpandableCard,
  ExpandableCardHeader,
} from '@/components/ui/expandable-card';

const getPlanetMeaning = (planet: string, sign: string): string => {
  const planetMeanings: Record<string, Record<string, string>> = {
    Sun: {
      Aries: 'Bold self-expression, pioneering energy',
      Taurus: 'Steady determination, sensual appreciation',
      Gemini: 'Curious communication, adaptable thinking',
      Cancer: 'Emotional depth, nurturing focus',
      Leo: 'Creative confidence, generous spirit',
      Virgo: 'Practical service, analytical mind',
      Libra: 'Harmonious relationships, aesthetic appreciation',
      Scorpio: 'Transformative intensity, deep insight',
      Sagittarius: 'Adventurous optimism, philosophical growth',
      Capricorn: 'Ambitious discipline, long-term goals',
      Aquarius: 'Innovative thinking, humanitarian ideals',
      Pisces: 'Intuitive compassion, spiritual connection',
    },
    Moon: {
      Aries: 'Quick emotional responses, need for independence',
      Taurus: 'Emotional stability, comfort-seeking',
      Gemini: 'Emotionally curious, need for variety',
      Cancer: 'Deep sensitivity, nurturing instincts',
      Leo: 'Dramatic feelings, need for appreciation',
      Virgo: 'Analytical emotions, service-oriented',
      Libra: 'Balanced feelings, relationship focus',
      Scorpio: 'Intense emotions, transformative depth',
      Sagittarius: 'Optimistic feelings, need for freedom',
      Capricorn: 'Reserved emotions, practical approach',
      Aquarius: 'Detached perspective, unique responses',
      Pisces: 'Empathic sensitivity, intuitive flow',
    },
    Mercury: {
      Aries: 'Direct communication, quick thinking',
      Taurus: 'Deliberate thinking, practical ideas',
      Gemini: 'Versatile communication, curious mind',
      Cancer: 'Intuitive thinking, emotional intelligence',
      Leo: 'Confident expression, creative ideas',
      Virgo: 'Precise analysis, detailed thinking',
      Libra: 'Diplomatic communication, balanced views',
      Scorpio: 'Deep investigation, penetrating insight',
      Sagittarius: 'Big-picture thinking, philosophical ideas',
      Capricorn: 'Structured thinking, goal-oriented plans',
      Aquarius: 'Innovative ideas, unconventional thinking',
      Pisces: 'Imaginative thinking, intuitive communication',
    },
    Venus: {
      Aries: 'Passionate attraction, bold in love',
      Taurus: 'Sensual pleasure, stable affection',
      Gemini: 'Playful flirtation, intellectual connection',
      Cancer: 'Nurturing love, emotional bonding',
      Leo: 'Generous romance, dramatic affection',
      Virgo: 'Practical love, thoughtful care',
      Libra: 'Harmonious partnership, refined taste',
      Scorpio: 'Intense bonding, deep commitment',
      Sagittarius: 'Adventurous love, philosophical connection',
      Capricorn: 'Committed partnership, traditional values',
      Aquarius: 'Friendship-based love, unique attraction',
      Pisces: 'Spiritual love, compassionate connection',
    },
    Mars: {
      Aries: 'Direct action, competitive drive',
      Taurus: 'Steady persistence, determined effort',
      Gemini: 'Mental energy, versatile action',
      Cancer: 'Protective action, emotional motivation',
      Leo: 'Confident leadership, creative drive',
      Virgo: 'Precise execution, practical effort',
      Libra: 'Diplomatic action, collaborative effort',
      Scorpio: 'Intense focus, strategic power',
      Sagittarius: 'Adventurous pursuit, expansive action',
      Capricorn: 'Disciplined drive, strategic planning',
      Aquarius: 'Unconventional action, group cooperation',
      Pisces: 'Intuitive action, compassionate effort',
    },
    Jupiter: {
      Aries: 'Bold expansion, pioneering growth',
      Taurus: 'Abundance through patience, material growth',
      Gemini: 'Intellectual expansion, diverse opportunities',
      Cancer: 'Emotional growth, family blessings',
      Leo: 'Creative fortune, generous success',
      Virgo: 'Growth through service, practical wisdom',
      Libra: 'Relationship blessings, harmonious growth',
      Scorpio: 'Transformative growth, deep wisdom',
      Sagittarius: 'Expansive optimism, philosophical fortune',
      Capricorn: 'Disciplined success, structured growth',
      Aquarius: 'Innovative expansion, humanitarian vision',
      Pisces: 'Spiritual abundance, compassionate wisdom',
    },
    Saturn: {
      Aries: 'Disciplined initiative, structured courage',
      Taurus: 'Patient building, lasting foundations',
      Gemini: 'Focused communication, mental discipline',
      Cancer: 'Emotional boundaries, family responsibility',
      Leo: 'Creative discipline, humble leadership',
      Virgo: 'Meticulous work, health discipline',
      Libra: 'Relationship karma, balanced commitment',
      Scorpio: 'Deep responsibility, transformative limits',
      Sagittarius: 'Philosophical tests, disciplined freedom',
      Capricorn: 'Mastery through effort, ambitious goals',
      Aquarius: 'Structured innovation, social responsibility',
      Pisces: 'Spiritual discipline, compassionate boundaries',
    },
    Uranus: {
      default: 'Innovation, awakening, and sudden change',
    },
    Neptune: {
      default: 'Dreams, intuition, and spiritual connection',
    },
    Pluto: {
      default: 'Deep transformation, power, and renewal',
    },
  };

  const planetData = planetMeanings[planet];
  if (!planetData) return 'Cosmic influence';
  return planetData[sign] || planetData.default || 'Cosmic influence';
};

const getRetrogradeGuidance = (planet: string, sign: string): string => {
  const guidance: Record<string, string> = {
    Mercury: `Communication slows down in ${sign}. Double-check messages, revisit old ideas, and avoid signing contracts if possible. Great for editing and reconnecting with old friends.`,
    Venus: `Love and finances get a second look in ${sign}. Reconnect with what you truly value. Ex-partners may resurface. Avoid major purchases or style changes.`,
    Mars: `Energy turns inward in ${sign}. Frustrations may simmer. Channel action into completing old projects rather than starting new ones. Avoid conflict.`,
    Jupiter: `Growth slows for inner expansion in ${sign}. Reassess your beliefs and long-term goals. Luck comes from revisiting past opportunities.`,
    Saturn: `Karma returns in ${sign}. Past responsibilities demand attention. Restructure commitments and learn from delays. Patience is essential.`,
    Uranus: `Unexpected changes reverse course in ${sign}. Innovation requires reflection. Freedom issues need internal resolution first.`,
    Neptune: `Illusions clarify in ${sign}. Dreams reveal deeper truths. Creative projects benefit from revision. Trust your intuition more than external input.`,
    Pluto: `Deep transformation intensifies in ${sign}. Power dynamics shift internally. Shadow work becomes essential. Release what no longer serves you.`,
  };
  return (
    guidance[planet] ||
    `${planet} retrograde invites reflection and review of its themes.`
  );
};

const getPlanetSymbol = (planet: string): string => {
  const key = planet.toLowerCase() as keyof typeof bodiesSymbols;
  return bodiesSymbols[key] || planet.charAt(0);
};

const getZodiacSymbol = (sign: string): string => {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || sign.charAt(0);
};

export const SkyNowCard = () => {
  const { currentAstrologicalChart } = useAstronomyContext();

  const planets = useMemo(() => {
    if (!currentAstrologicalChart || currentAstrologicalChart.length === 0) {
      return [];
    }
    return currentAstrologicalChart;
  }, [currentAstrologicalChart]);

  const retrogradeCount = useMemo(() => {
    return planets.filter((p) => p.retrograde).length;
  }, [planets]);

  if (planets.length === 0) {
    return (
      <div className='py-3 px-4 bg-lunary-bg border border-zinc-800/50 rounded-md animate-pulse'>
        <div className='h-5 w-32 bg-zinc-800 rounded' />
      </div>
    );
  }

  const preview = (
    <div className='w-full'>
      <ExpandableCardHeader
        icon={<Telescope className='w-4 h-4 text-lunary-secondary-300' />}
        title='Sky Now'
        badge={
          retrogradeCount > 0 ? `${retrogradeCount} Retrograde` : undefined
        }
        badgeVariant={retrogradeCount > 0 ? 'danger' : 'default'}
      />
      <div className='mt-2 space-y-1 w-full'>
        <div className='grid grid-cols-10 w-full text-center'>
          {planets.map((planet) => (
            <span
              key={planet.body}
              className={`font-astro text-base ${planet.retrograde ? 'text-lunary-error-300' : 'text-zinc-300'}`}
              title={planet.body}
            >
              {getPlanetSymbol(planet.body)}
            </span>
          ))}
        </div>
        <div className='grid grid-cols-10 w-full text-center'>
          {planets.map((planet) => (
            <span
              key={planet.body}
              className={`text-xs font-astro ${planet.retrograde ? 'text-lunary-error-300' : 'text-zinc-500'}`}
            >
              {getZodiacSymbol(planet.sign)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const expanded = (
    <div className='pt-3 space-y-4'>
      <div className='space-y-2'>
        {planets.map((planet) => (
          <div
            key={planet.body}
            className={`py-2 border-b border-zinc-800/30 last:border-0 ${planet.retrograde ? 'text-lunary-error-200' : ''}`}
          >
            <div className='flex items-baseline gap-2'>
              <span
                className={`font-astro text-lg ${planet.retrograde ? 'text-lunary-error-300' : 'text-lunary-secondary-300'}`}
              >
                {getPlanetSymbol(planet.body)}
              </span>
              <span className='text-sm font-medium text-zinc-200'>
                {planet.body}
              </span>
              <span className='font-astro text-zinc-400'>
                {getZodiacSymbol(planet.sign)}
              </span>
              <span className='text-sm text-zinc-400'>
                {planet.sign} {planet.formattedDegree?.degree || 0}°
                {planet.formattedDegree?.minute !== undefined &&
                  `${planet.formattedDegree.minute}'`}
              </span>
              {planet.retrograde && (
                <span className='text-xs text-lunary-error-300 font-medium'>
                  ℞
                </span>
              )}
            </div>
            <p className='text-xs text-zinc-500 mt-1 ml-7'>
              {getPlanetMeaning(planet.body, planet.sign)}
            </p>
            {planet.retrograde && (
              <p className='text-xs text-lunary-error-300/80 mt-1 ml-7 leading-relaxed'>
                {getRetrogradeGuidance(planet.body, planet.sign)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ExpandableCard preview={preview} expanded={expanded} autoExpandOnDesktop />
  );
};
