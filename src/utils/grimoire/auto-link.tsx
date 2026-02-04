// Auto-linking utility for Grimoire SEO pages
// Automatically links key terms to their respective Grimoire pages

import Link from 'next/link';
import { ReactNode } from 'react';

// Mapping of terms to their Grimoire page URLs
const termMappings: Record<string, string> = {
  // Zodiac signs
  aries: '/grimoire/zodiac/aries',
  taurus: '/grimoire/zodiac/taurus',
  gemini: '/grimoire/zodiac/gemini',
  cancer: '/grimoire/zodiac/cancer',
  leo: '/grimoire/zodiac/leo',
  virgo: '/grimoire/zodiac/virgo',
  libra: '/grimoire/zodiac/libra',
  scorpio: '/grimoire/zodiac/scorpio',
  sagittarius: '/grimoire/zodiac/sagittarius',
  capricorn: '/grimoire/zodiac/capricorn',
  aquarius: '/grimoire/zodiac/aquarius',
  pisces: '/grimoire/zodiac/pisces',

  // Planets
  sun: '/grimoire/astronomy/planets/sun',
  moon: '/grimoire/astronomy/planets/moon',
  mercury: '/grimoire/astronomy/planets/mercury',
  venus: '/grimoire/astronomy/planets/venus',
  mars: '/grimoire/astronomy/planets/mars',
  jupiter: '/grimoire/astronomy/planets/jupiter',
  saturn: '/grimoire/astronomy/planets/saturn',
  uranus: '/grimoire/astronomy/planets/uranus',
  neptune: '/grimoire/astronomy/planets/neptune',
  pluto: '/grimoire/astronomy/planets/pluto',

  // Houses
  'first house': '/grimoire/houses/1st-house',
  'second house': '/grimoire/houses/2nd-house',
  'third house': '/grimoire/houses/3rd-house',
  'fourth house': '/grimoire/houses/4th-house',
  'fifth house': '/grimoire/houses/5th-house',
  'sixth house': '/grimoire/houses/6th-house',
  'seventh house': '/grimoire/houses/7th-house',
  'eighth house': '/grimoire/houses/8th-house',
  'ninth house': '/grimoire/houses/9th-house',
  'tenth house': '/grimoire/houses/10th-house',
  'eleventh house': '/grimoire/houses/11th-house',
  'twelfth house': '/grimoire/houses/12th-house',

  // Moon phases
  'new moon': '/grimoire/moon-phases/new-moon',
  'waxing crescent': '/grimoire/moon-phases/waxing-crescent',
  'first quarter': '/grimoire/moon-phases/first-quarter',
  'waxing gibbous': '/grimoire/moon-phases/waxing-gibbous',
  'full moon': '/grimoire/moon-phases/full-moon',
  'waning gibbous': '/grimoire/moon-phases/waning-gibbous',
  'last quarter': '/grimoire/moon-phases/last-quarter',
  'waning crescent': '/grimoire/moon-phases/waning-crescent',

  // Moon in sign
  'moon in aries': '/grimoire/moon-in/aries',
  'moon in taurus': '/grimoire/moon-in/taurus',
  'moon in gemini': '/grimoire/moon-in/gemini',
  'moon in cancer': '/grimoire/moon-in/cancer',
  'moon in leo': '/grimoire/moon-in/leo',
  'moon in virgo': '/grimoire/moon-in/virgo',
  'moon in libra': '/grimoire/moon-in/libra',
  'moon in scorpio': '/grimoire/moon-in/scorpio',
  'moon in sagittarius': '/grimoire/moon-in/sagittarius',
  'moon in capricorn': '/grimoire/moon-in/capricorn',
  'moon in aquarius': '/grimoire/moon-in/aquarius',
  'moon in pisces': '/grimoire/moon-in/pisces',

  // Retrogrades
  'mercury retrograde': '/grimoire/astronomy/retrogrades/mercury',
  'venus retrograde': '/grimoire/astronomy/retrogrades/venus',
  'mars retrograde': '/grimoire/astronomy/retrogrades/mars',
  retrograde: '/grimoire/astronomy/retrogrades',

  // Eclipses
  'solar eclipse': '/grimoire/eclipses/solar',
  'lunar eclipse': '/grimoire/eclipses/lunar',
  eclipse: '/grimoire/eclipses',

  // Aspects
  conjunction: '/grimoire/aspects/types/conjunction',
  opposition: '/grimoire/aspects/types/opposition',
  trine: '/grimoire/aspects/types/trine',
  square: '/grimoire/aspects/types/square',
  sextile: '/grimoire/aspects/types/sextile',
};

// Function to auto-link terms in text
export function autoLinkTerms(text: string): ReactNode[] {
  const words = text.split(/(\s+)/);
  const result: ReactNode[] = [];
  let i = 0;

  while (i < words.length) {
    let matched = false;

    // Check for multi-word phrases first (longest first)
    for (const [phrase, href] of Object.entries(termMappings).sort(
      (a, b) => b[0].length - a[0].length,
    )) {
      const phraseWords = phrase.split(/\s+/);
      if (i + phraseWords.length <= words.length) {
        const candidate = words
          .slice(i, i + phraseWords.length)
          .join('')
          .toLowerCase();
        if (candidate === phrase.toLowerCase()) {
          result.push(
            <Link
              key={`link-${i}`}
              href={href}
              className='text-lunary-primary-400 hover:text-lunary-primary-300 underline'
            >
              {words.slice(i, i + phraseWords.length).join('')}
            </Link>,
          );
          i += phraseWords.length;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      // Check single words
      const word = words[i].toLowerCase().replace(/[^\w]/g, '');
      if (termMappings[word]) {
        result.push(
          <Link
            key={`link-${i}`}
            href={termMappings[word]}
            className='text-lunary-primary-400 hover:text-lunary-primary-300 underline'
          >
            {words[i]}
          </Link>,
        );
      } else {
        result.push(<span key={`text-${i}`}>{words[i]}</span>);
      }
      i++;
    }
  }

  return result;
}

// Component version for easier use in JSX
export function AutoLinkedText({ children }: { children: string }) {
  return <>{autoLinkTerms(children)}</>;
}

// Export mappings for use in other components
export { termMappings };
