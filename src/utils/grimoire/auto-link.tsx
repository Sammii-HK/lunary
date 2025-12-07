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
  sun: '/grimoire/planets/sun',
  moon: '/grimoire/planets/moon',
  mercury: '/grimoire/planets/mercury',
  venus: '/grimoire/planets/venus',
  mars: '/grimoire/planets/mars',
  jupiter: '/grimoire/planets/jupiter',
  saturn: '/grimoire/planets/saturn',
  uranus: '/grimoire/planets/uranus',
  neptune: '/grimoire/planets/neptune',
  pluto: '/grimoire/planets/pluto',

  // Houses
  'first house': '/grimoire/houses/overview/first',
  'second house': '/grimoire/houses/overview/second',
  'third house': '/grimoire/houses/overview/third',
  'fourth house': '/grimoire/houses/overview/fourth',
  'fifth house': '/grimoire/houses/overview/fifth',
  'sixth house': '/grimoire/houses/overview/sixth',
  'seventh house': '/grimoire/houses/overview/seventh',
  'eighth house': '/grimoire/houses/overview/eighth',
  'ninth house': '/grimoire/houses/overview/ninth',
  'tenth house': '/grimoire/houses/overview/tenth',
  'eleventh house': '/grimoire/houses/overview/eleventh',
  'twelfth house': '/grimoire/houses/overview/twelfth',

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
  'mercury retrograde': '/grimoire/retrogrades/mercury',
  'venus retrograde': '/grimoire/retrogrades/venus',
  'mars retrograde': '/grimoire/retrogrades/mars',
  retrograde: '/grimoire/retrogrades',

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
              className='text-purple-400 hover:text-purple-300 underline'
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
            className='text-purple-400 hover:text-purple-300 underline'
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
