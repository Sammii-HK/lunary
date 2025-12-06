export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createItemListSchema,
  createDefinedTermSchema,
  renderJsonLd,
} from '@/lib/schema';

export const metadata: Metadata = {
  title:
    'Astrology Glossary: Complete Dictionary of Astrological Terms - Lunary',
  description:
    'Comprehensive astrology glossary with definitions for all astrological terms. Learn about aspects, houses, signs, planets, retrogrades, and more. Essential reference for astrology students.',
  keywords: [
    'astrology glossary',
    'astrological terms',
    'astrology dictionary',
    'birth chart terms',
    'astrology definitions',
    'zodiac terminology',
    'planetary aspects',
  ],
  openGraph: {
    title: 'Astrology Glossary: Complete Dictionary - Lunary',
    description:
      'Comprehensive astrology glossary with definitions for all astrological terms.',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/glossary',
  },
};

interface GlossaryTerm {
  term: string;
  slug: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'Ascendant',
    slug: 'ascendant',
    definition:
      'The zodiac sign rising on the eastern horizon at your exact time of birth. Also called the Rising Sign. It represents your outer personality, first impressions, and how others perceive you.',
    category: 'Chart Points',
    relatedTerms: ['Rising Sign', 'Descendant', 'Houses'],
  },
  {
    term: 'Aspect',
    slug: 'aspect',
    definition:
      'A geometric angle between two planets in a birth chart. Major aspects include conjunction (0°), sextile (60°), square (90°), trine (120°), and opposition (180°). Aspects show how different parts of your personality interact.',
    category: 'Aspects',
    relatedTerms: ['Conjunction', 'Square', 'Trine', 'Opposition'],
  },
  {
    term: 'Cardinal Signs',
    slug: 'cardinal-signs',
    definition:
      'The four signs that mark the beginning of each season: Aries (spring), Cancer (summer), Libra (fall), and Capricorn (winter). Cardinal signs are initiators and leaders.',
    category: 'Modalities',
    relatedTerms: ['Fixed Signs', 'Mutable Signs'],
  },
  {
    term: 'Conjunction',
    slug: 'conjunction',
    definition:
      'An aspect where two planets are at the same degree (0° apart). Conjunctions blend planetary energies together, intensifying their combined effect.',
    category: 'Aspects',
    relatedTerms: ['Aspect', 'Orb'],
  },
  {
    term: 'Cusp',
    slug: 'cusp',
    definition:
      'The boundary between two houses or signs. Being "on the cusp" means born near the transition point between two zodiac signs.',
    category: 'Chart Points',
  },
  {
    term: 'Detriment',
    slug: 'detriment',
    definition:
      'When a planet is in the sign opposite to the one it rules. A planet in detriment must work harder to express itself effectively.',
    category: 'Planetary Dignities',
    relatedTerms: ['Domicile', 'Exaltation', 'Fall'],
  },
  {
    term: 'Domicile',
    slug: 'domicile',
    definition:
      'The sign a planet rules. A planet in its domicile is comfortable and expresses naturally. For example, Mars rules Aries, so Mars in Aries is in domicile.',
    category: 'Planetary Dignities',
    relatedTerms: ['Detriment', 'Exaltation'],
  },
  {
    term: 'Descendant',
    slug: 'descendant',
    definition:
      'The point directly opposite the Ascendant, marking the cusp of the 7th house. It represents partnerships, relationships, and what we seek in others.',
    category: 'Chart Points',
    relatedTerms: ['Ascendant', '7th House'],
  },
  {
    term: 'Ephemeris',
    slug: 'ephemeris',
    definition:
      'A table showing planetary positions for each day. Astrologers use ephemerides (plural) to calculate charts and track planetary movements.',
    category: 'Tools',
  },
  {
    term: 'Exaltation',
    slug: 'exaltation',
    definition:
      'A sign where a planet is especially powerful and honored. For example, the Sun is exalted in Aries, Venus in Pisces, and Saturn in Libra.',
    category: 'Planetary Dignities',
    relatedTerms: ['Fall', 'Domicile', 'Detriment'],
  },
  {
    term: 'Fall',
    slug: 'fall',
    definition:
      "The sign opposite a planet's exaltation, where it struggles to express itself well. A planet in fall is weakened.",
    category: 'Planetary Dignities',
    relatedTerms: ['Exaltation', 'Detriment'],
  },
  {
    term: 'Fixed Signs',
    slug: 'fixed-signs',
    definition:
      'The four signs in the middle of each season: Taurus, Leo, Scorpio, and Aquarius. Fixed signs are determined, stable, and resistant to change.',
    category: 'Modalities',
    relatedTerms: ['Cardinal Signs', 'Mutable Signs'],
  },
  {
    term: 'Houses',
    slug: 'houses',
    definition:
      'The twelve divisions of a birth chart, each representing a different life area. The 1st house is self, 7th is relationships, 10th is career, etc.',
    category: 'Chart Fundamentals',
    relatedTerms: ['Ascendant', 'Cusp'],
  },
  {
    term: 'IC (Imum Coeli)',
    slug: 'ic',
    definition:
      'The "Bottom of the Sky," opposite the Midheaven. It marks the cusp of the 4th house and represents home, family, roots, and private life.',
    category: 'Chart Points',
    relatedTerms: ['Midheaven', '4th House'],
  },
  {
    term: 'Midheaven (MC)',
    slug: 'midheaven',
    definition:
      'The highest point in a birth chart, marking the cusp of the 10th house. It represents career, public image, reputation, and life direction.',
    category: 'Chart Points',
    relatedTerms: ['IC', '10th House', 'Ascendant'],
  },
  {
    term: 'Mutable Signs',
    slug: 'mutable-signs',
    definition:
      'The four signs at the end of each season: Gemini, Virgo, Sagittarius, and Pisces. Mutable signs are adaptable, flexible, and embrace change.',
    category: 'Modalities',
    relatedTerms: ['Cardinal Signs', 'Fixed Signs'],
  },
  {
    term: 'Natal Chart',
    slug: 'natal-chart',
    definition:
      'A map of the sky at the exact moment of birth, also called a birth chart. It shows planetary positions in signs and houses.',
    category: 'Chart Fundamentals',
    relatedTerms: ['Houses', 'Ascendant', 'Aspects'],
  },
  {
    term: 'Nodes (Lunar)',
    slug: 'nodes',
    definition:
      "The North and South Nodes are points where the Moon's orbit crosses the ecliptic. The North Node represents life direction and growth; South Node shows past patterns and comfort zones.",
    category: 'Chart Points',
  },
  {
    term: 'Opposition',
    slug: 'opposition',
    definition:
      'An aspect of 180° between two planets, representing tension and the need for balance. Oppositions create awareness through polarity.',
    category: 'Aspects',
    relatedTerms: ['Aspect', 'Square', 'Trine'],
  },
  {
    term: 'Orb',
    slug: 'orb',
    definition:
      'The range of degrees within which an aspect is considered active. A tight orb (1-3°) is stronger than a wide orb (8-10°).',
    category: 'Aspects',
  },
  {
    term: 'Retrograde',
    slug: 'retrograde',
    definition:
      "When a planet appears to move backward in the sky from Earth's perspective. Retrograde periods invite review, revision, and reflection of the planet's themes.",
    category: 'Planetary Motion',
    relatedTerms: ['Mercury Retrograde', 'Direct'],
  },
  {
    term: 'Rising Sign',
    slug: 'rising-sign',
    definition:
      'Another name for the Ascendant—the sign rising on the eastern horizon at birth. It shapes your outer personality and physical appearance.',
    category: 'Chart Points',
    relatedTerms: ['Ascendant'],
  },
  {
    term: 'Ruling Planet',
    slug: 'ruling-planet',
    definition:
      'The planet that has natural affinity with a sign. For example, Mars rules Aries, Venus rules Taurus and Libra. Your chart ruler is the planet ruling your Rising sign.',
    category: 'Planetary Dignities',
  },
  {
    term: 'Sextile',
    slug: 'sextile',
    definition:
      'A harmonious aspect of 60° between two planets. Sextiles represent opportunities and talents that require effort to activate.',
    category: 'Aspects',
    relatedTerms: ['Aspect', 'Trine'],
  },
  {
    term: 'Square',
    slug: 'square',
    definition:
      'A challenging aspect of 90° between planets. Squares create tension that motivates action and growth through overcoming obstacles.',
    category: 'Aspects',
    relatedTerms: ['Aspect', 'Opposition'],
  },
  {
    term: 'Stellium',
    slug: 'stellium',
    definition:
      'Three or more planets in the same sign or house. A stellium concentrates energy in one area of life, making it a major theme.',
    category: 'Chart Patterns',
  },
  {
    term: 'Transit',
    slug: 'transit',
    definition:
      'The current position of a planet as it moves through the zodiac. Transits to your natal chart trigger events and growth opportunities.',
    category: 'Planetary Motion',
    relatedTerms: ['Natal Chart', 'Progression'],
  },
  {
    term: 'Trine',
    slug: 'trine',
    definition:
      'A harmonious aspect of 120° between planets in the same element. Trines represent natural talents and easy flow of energy.',
    category: 'Aspects',
    relatedTerms: ['Aspect', 'Sextile'],
  },
];

const CATEGORIES = [...new Set(GLOSSARY_TERMS.map((t) => t.category))].sort();

export default function GlossaryPage() {
  const glossaryListSchema = createItemListSchema({
    name: 'Astrology Glossary Terms',
    description: 'Complete list of astrological terminology and definitions.',
    url: 'https://lunary.app/grimoire/glossary',
    items: GLOSSARY_TERMS.map((term) => ({
      name: term.term,
      url: `https://lunary.app/grimoire/glossary#${term.slug}`,
      description: term.definition,
    })),
  });

  const definedTermSchemas = GLOSSARY_TERMS.slice(0, 20).map((t) =>
    createDefinedTermSchema({
      term: t.term,
      definition: t.definition,
      url: `https://lunary.app/grimoire/glossary#${t.slug}`,
      relatedTerms: t.relatedTerms,
    }),
  );

  const groupedTerms = CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = GLOSSARY_TERMS.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<string, GlossaryTerm[]>,
  );

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(glossaryListSchema)}
      {definedTermSchemas.map((schema, index) => (
        <span key={index}>{renderJsonLd(schema)}</span>
      ))}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-500 mb-8'>
        <Link href='/grimoire' className='hover:text-purple-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Glossary</span>
      </nav>

      {/* Header */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
          Astrology Glossary
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Complete dictionary of astrological terms. Reference guide for
          understanding birth charts, planetary aspects, houses, and more.
        </p>
      </header>

      {/* Quick Navigation */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Browse by Category
        </h2>
        <div className='flex flex-wrap gap-2'>
          {CATEGORIES.map((category) => (
            <a
              key={category}
              href={`#${category.toLowerCase().replace(/\s+/g, '-')}`}
              className='px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors'
            >
              {category}
            </a>
          ))}
        </div>
      </nav>

      {/* Alphabetical Index */}
      <nav className='mb-8'>
        <div className='flex flex-wrap gap-2 justify-center'>
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => {
            const hasTerms = GLOSSARY_TERMS.some((t) =>
              t.term.toUpperCase().startsWith(letter),
            );
            return hasTerms ? (
              <a
                key={letter}
                href={`#letter-${letter}`}
                className='w-8 h-8 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 text-sm hover:bg-purple-900/30 hover:text-purple-300 transition-colors'
              >
                {letter}
              </a>
            ) : (
              <span
                key={letter}
                className='w-8 h-8 flex items-center justify-center text-zinc-600 text-sm'
              >
                {letter}
              </span>
            );
          })}
        </div>
      </nav>

      {/* Terms by Category */}
      {CATEGORIES.map((category) => (
        <section
          key={category}
          id={category.toLowerCase().replace(/\s+/g, '-')}
          className='mb-12'
        >
          <h2 className='text-2xl font-light text-zinc-100 mb-6 pb-2 border-b border-zinc-800'>
            {category}
          </h2>
          <div className='space-y-6'>
            {groupedTerms[category].map((term) => (
              <article
                key={term.slug}
                id={term.slug}
                className='bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-6'
              >
                <h3 className='text-xl font-medium text-zinc-100 mb-2'>
                  {term.term}
                </h3>
                <p className='text-zinc-300 leading-relaxed mb-3'>
                  {term.definition}
                </p>
                {term.relatedTerms && term.relatedTerms.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    <span className='text-zinc-500 text-sm'>See also:</span>
                    {term.relatedTerms.map((related) => {
                      const relatedTerm = GLOSSARY_TERMS.find(
                        (t) => t.term === related,
                      );
                      return relatedTerm ? (
                        <a
                          key={related}
                          href={`#${relatedTerm.slug}`}
                          className='text-sm text-purple-400 hover:text-purple-300 transition-colors'
                        >
                          {related}
                        </a>
                      ) : (
                        <span key={related} className='text-sm text-zinc-500'>
                          {related}
                        </span>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          See These Terms in Action
        </h2>
        <p className='text-zinc-400 mb-6'>
          Get your personalized birth chart and see how these astrological
          concepts apply to your unique cosmic blueprint.
        </p>
        <Link
          href='/birth-chart'
          className='inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
        >
          Calculate Your Birth Chart Free
        </Link>
      </section>
    </div>
  );
}
