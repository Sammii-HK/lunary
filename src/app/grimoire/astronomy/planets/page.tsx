import { Metadata } from 'next';
import Link from 'next/link';
import {
  PLANETS,
  PLANET_DISPLAY,
  PLANET_SYMBOLS,
} from '@/constants/seo/aspects';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Planets in Astrology: Sun, Moon, Mercury & Outer Planets | Lunary',
  description:
    'Explore all planets in astrology and their meanings. Learn how the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto influence your birth chart.',
  keywords: [
    'planets astrology',
    'astrological planets',
    'planet meanings',
    'birth chart planets',
    'planetary influences',
    'astrology guide',
  ],
  openGraph: {
    title: 'Planets in Astrology | Lunary',
    description:
      'Explore all planets in astrology and their meanings in your birth chart.',
    url: 'https://lunary.app/grimoire/astronomy/planets',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy/planets',
  },
};

const planetInfo: Record<
  string,
  { description: string; rules: string; category: string }
> = {
  sun: {
    description: 'Your core identity, ego, and life purpose',
    rules: 'Leo',
    category: 'Personal',
  },
  moon: {
    description: 'Emotions, instincts, and subconscious patterns',
    rules: 'Cancer',
    category: 'Personal',
  },
  mercury: {
    description: 'Communication, thinking, and learning',
    rules: 'Gemini & Virgo',
    category: 'Personal',
  },
  venus: {
    description: 'Love, beauty, values, and pleasure',
    rules: 'Taurus & Libra',
    category: 'Personal',
  },
  mars: {
    description: 'Action, desire, energy, and assertion',
    rules: 'Aries',
    category: 'Personal',
  },
  jupiter: {
    description: 'Growth, expansion, luck, and wisdom',
    rules: 'Sagittarius',
    category: 'Social',
  },
  saturn: {
    description: 'Structure, discipline, responsibility, and lessons',
    rules: 'Capricorn',
    category: 'Social',
  },
  uranus: {
    description: 'Innovation, rebellion, sudden change',
    rules: 'Aquarius',
    category: 'Transpersonal',
  },
  neptune: {
    description: 'Dreams, intuition, spirituality, and illusion',
    rules: 'Pisces',
    category: 'Transpersonal',
  },
  pluto: {
    description: 'Transformation, power, death and rebirth',
    rules: 'Scorpio',
    category: 'Transpersonal',
  },
};

const tableOfContents = [
  { label: 'Personal Planets', href: '#personal-planets' },
  { label: 'Social Planets', href: '#social-planets' },
  { label: 'Transpersonal Planets', href: '#transpersonal-planets' },
  { label: 'Planetary Correspondences', href: '#correspondences' },
  { label: 'How to Read Planetary Placements', href: '#interpretation' },
  { label: 'Timing & Retrogrades', href: '#timing' },
  { label: 'Case Study: Interpreting a Chart', href: '#case-study' },
  { label: 'Journal Prompts', href: '#journal-prompts' },
];

export default function PlanetsIndexPage() {
  const personalPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Personal',
  );
  const socialPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Social',
  );
  const transpersonalPlanets = PLANETS.filter(
    (p) => planetInfo[p]?.category === 'Transpersonal',
  );

  const planetsListSchema = createItemListSchema({
    name: 'Planets in Astrology',
    description:
      'Complete guide to all planets in astrology, their meanings, and influences in the birth chart.',
    url: 'https://lunary.app/grimoire/astronomy/planets',
    items: PLANETS.map((planet) => ({
      name: PLANET_DISPLAY[planet],
      url: `https://lunary.app/grimoire/astronomy/planets/${planet}`,
      description: planetInfo[planet]?.description || '',
    })),
  });

  const renderPlanetCard = (planet: (typeof PLANETS)[number]) => (
    <Link
      key={planet}
      href={`/grimoire/astronomy/planets/${planet}`}
      className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
    >
      <div className='flex items-center gap-3 mb-3'>
        <span className='text-3xl'>{PLANET_SYMBOLS[planet]}</span>
        <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
          {PLANET_DISPLAY[planet]}
        </h3>
      </div>
      <p className='text-sm text-zinc-400 mb-2'>
        {planetInfo[planet]?.description}
      </p>
      <p className='text-xs text-zinc-400'>
        Rules: {planetInfo[planet]?.rules}
      </p>
    </Link>
  );

  return (
    <>
      {renderJsonLd(planetsListSchema)}
      <SEOContentTemplate
        title='Planets in Astrology: Sun, Moon, Mercury & Outer Planets'
        h1='Planets in Astrology'
        description='Each planet represents a different aspect of your psyche and life experience. Together, they form the cosmic blueprint of your birth chart.'
        keywords={[
          'planets astrology',
          'astrological planets',
          'planet meanings',
          'birth chart planets',
          'planetary influences',
        ]}
        canonicalUrl='https://lunary.app/grimoire/astronomy/planets'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Astronomy', href: '/grimoire/astronomy' },
          { label: 'Planets', href: '/grimoire/astronomy/planets' },
        ]}
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What do planets represent in astrology?',
          answer:
            "In astrology, planets represent different aspects of your personality, drives, and life experiences. Personal planets (Sun, Moon, Mercury, Venus, Mars) shape your core traits and daily life. Social planets (Jupiter, Saturn) influence growth and structure. Transpersonal planets (Uranus, Neptune, Pluto) represent generational and transformative forces. Each planet's sign and house placement reveals how and where its energy expresses in your life.",
        }}
        tldr='10 planets shape your chart: Personal planets (Sun = identity, Moon = emotions, Mercury = mind, Venus = love, Mars = action) move fast and shape personality. Social planets (Jupiter = expansion, Saturn = structure) influence society role. Outer planets (Uranus, Neptune, Pluto) = generational transformation.'
        intro='In astrology, planets are divided into three categories: Personal planets (Sun through Mars) move quickly and shape your personality. Social planets (Jupiter and Saturn) influence your role in society. Transpersonal planets (Uranus, Neptune, Pluto) represent generational and transformative forces.'
        meaning='Planets are the verbs of your birth chart. They describe what you do—think, feel, desire, build—while signs describe how you do it and houses reveal where the action takes place. When you learn each planet’s job description you can decode natal placements, understand current transits, and craft rituals that align with the sky.'
        howToWorkWith={[
          'List every planet by sign and house to see which elements dominate your chart.',
          'Pay attention to planets conjunct angles (ASC, MC); they speak the loudest in daily life.',
          'Track retrogrades so you know when to review rather than push forward.',
          'Use planetary correspondences (colors, herbs, metals) to craft spellwork or talismans.',
          'Pair planets with tarot archetypes to receive intuitive guidance when a transit hits.',
        ]}
        journalPrompts={[
          'Which planet feels most “like me,” and how does its sign/house combo show up?',
          'Where do I feel resistance? Check the planet that rules that topic and explore its lessons.',
          'How does my current transit story echo a previous cycle from the same planet?',
        ]}
        tables={[
          {
            title: 'Planetary Rulerships',
            headers: ['Planet', 'Rules', 'Energy'],
            rows: [
              ['Sun', 'Leo', 'Identity, vitality, purpose'],
              ['Moon', 'Cancer', 'Emotions, intuition, nurturing'],
              ['Mercury', 'Gemini, Virgo', 'Communication, thinking'],
              ['Venus', 'Taurus, Libra', 'Love, beauty, values'],
              ['Mars', 'Aries', 'Action, desire, courage'],
              ['Jupiter', 'Sagittarius', 'Expansion, luck, wisdom'],
              ['Saturn', 'Capricorn', 'Structure, discipline, karma'],
              ['Uranus', 'Aquarius', 'Innovation, rebellion'],
              ['Neptune', 'Pisces', 'Dreams, intuition, illusion'],
              ['Pluto', 'Scorpio', 'Transformation, power'],
            ],
          },
        ]}
        faqs={[
          {
            question: 'Which planets are most important in my birth chart?',
            answer:
              'The Sun, Moon, and Rising sign (the "Big Three") are most important for understanding your core personality. After that, planets in your 1st house or conjunct angles (ASC, MC) have strong influence. Personal planets (Mercury, Venus, Mars) shape daily experience.',
          },
          {
            question: 'What does it mean when a planet rules a sign?',
            answer:
              'Each zodiac sign has a planetary ruler that expresses naturally in that sign. For example, Mars rules Aries, so Mars energy (action, assertion) is at home in Aries. When a planet is in its ruling sign, its expression is strengthened.',
          },
          {
            question: 'Do outer planets affect me personally?',
            answer:
              'Outer planets (Uranus, Neptune, Pluto) move slowly and affect entire generations. However, they become personal when aspecting your natal planets or transiting sensitive chart points, triggering major life transformations.',
          },
          {
            question: 'What are personal vs outer planets?',
            answer:
              'Personal planets (Sun, Moon, Mercury, Venus, Mars) move quickly and shape your personality and daily life. Social planets (Jupiter, Saturn) affect your role in society. Outer/transpersonal planets (Uranus, Neptune, Pluto) move slowly and represent generational forces.',
          },
          {
            question: 'What happens during planetary retrogrades?',
            answer:
              'When a planet appears to move backward (retrograde), its energy turns inward. Mercury retrograde affects communication and technology. Venus retrograde revisits relationships and values. Mars retrograde slows action and motivation. Use retrogrades for review and reflection.',
          },
        ]}
        relatedItems={[
          { name: 'Zodiac Signs', href: '/grimoire/zodiac', type: 'topic' },
          { name: 'Houses', href: '/grimoire/houses', type: 'topic' },
          { name: 'Aspects', href: '/grimoire/aspects', type: 'topic' },
          {
            name: 'Retrogrades',
            href: '/grimoire/astronomy/retrogrades',
            type: 'topic',
          },
        ]}
        internalLinks={[
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Astrological Houses', href: '/grimoire/houses' },
          { text: 'Birth Chart Calculator', href: '/birth-chart' },
          { text: 'Retrogrades', href: '/grimoire/astronomy/retrogrades' },
        ]}
        cosmicConnectionsParams={{
          entityType: 'hub-astronomy',
          entityKey: 'planets',
        }}
        ctaText='Open the birth chart to meet your planets'
        ctaHref='/birth-chart'
      >
        <div className='space-y-12'>
          <section id='personal-planets'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Personal Planets
            </h2>
            <p className='text-zinc-400 mb-6'>
              These fast-moving planets shape your core personality, daily
              experiences, and how you interact with the world. They describe
              what you crave when you first wake up (Moon), how you speak up in
              meetings (Mercury), and how you pursue pleasure or conflict (Venus
              and Mars). If you only have five minutes to understand someone’s
              chart, read their personal planets first—they explain chemistry
              between friends, lovers, and coworkers faster than any other
              placement.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {personalPlanets.map(renderPlanetCard)}
            </div>
          </section>

          <section id='social-planets'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Social Planets
            </h2>
            <p className='text-zinc-400 mb-6'>
              Jupiter and Saturn influence how you grow within society and the
              lessons you learn over longer periods. Jupiter shows where you
              feel lucky or generous, while Saturn outlines the homework you
              must master before leveling up. Watching these planets helps you
              plan career milestones, travel, education, and the timing of major
              commitments.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {socialPlanets.map(renderPlanetCard)}
            </div>
          </section>

          <section id='transpersonal-planets'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Transpersonal Planets
            </h2>
            <p className='text-zinc-400 mb-6'>
              These slow-moving outer planets represent generational influences
              and deep transformative experiences. They move so slowly that
              entire generations share the same placement, but when they connect
              with your personal planets you feel seismic shifts—sudden
              awakenings with Uranus, spiritual longing with Neptune, or rebirth
              with Pluto.
            </p>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
              {transpersonalPlanets.map(renderPlanetCard)}
            </div>
          </section>

          <section
            id='correspondences'
            className='bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Planetary Correspondences Cheat Sheet
            </h2>
            <p className='text-zinc-300'>
              Pair planets with sensory tools to bring their energy into spells,
              altar work, or daily routines. Start with the associations below
              and customize them with items that hold personal meaning.
            </p>
            <div className='grid md:grid-cols-2 gap-4 text-sm text-zinc-300'>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Sun</p>
                <p>
                  Color: Gold • Herbs: Cinnamon, Sunflower • Metals: Gold,
                  Bronze
                </p>
                <p>
                  Use for vitality spells, visibility rituals, leadership magic.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Moon</p>
                <p>Color: Silver • Herbs: Jasmine, Mugwort • Metals: Silver</p>
                <p>Use for intuition work, dream magick, emotional healing.</p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Mercury</p>
                <p>
                  Color: Yellow • Herbs: Lavender, Peppermint • Metals: Mercury,
                  Tin
                </p>
                <p>
                  Use for communication spells, study boosts, smooth travel.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Venus</p>
                <p>Color: Pink/Green • Herbs: Rose, Damiana • Metals: Copper</p>
                <p>
                  Use for attraction rituals, self-worth work, art projects.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Mars</p>
                <p>Color: Red • Herbs: Ginger, Chili • Metals: Iron</p>
                <p>
                  Use for protection, courage, and athletic performance magic.
                </p>
              </div>
              <div className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-1'>
                <p className='font-semibold text-zinc-100'>Jupiter</p>
                <p>Color: Royal Blue • Herbs: Sage, Nutmeg • Metals: Tin</p>
                <p>
                  Use for expansion, abundance jars, or mentorship intentions.
                </p>
              </div>
            </div>
            <p className='text-zinc-400 text-sm'>
              Continue the list in your Book of Shadows with personal
              experiences—your correspondences will become more potent the more
              you experiment.
            </p>
          </section>

          <section
            id='interpretation'
            className='bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              How to Read Planetary Placements
            </h2>
            <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
              <li>
                <strong>Identify the planet.</strong> What instinct or drive
                does it represent? (e.g., Venus = love and magnetism.)
              </li>
              <li>
                <strong>Add the sign.</strong> This is the style or tone—Aries
                charges ahead, Pisces dissolves boundaries.
              </li>
              <li>
                <strong>Locate the house.</strong> That&#39;s the arena of life
                being activated (7th house = relationships, 10th = career).
              </li>
              <li>
                <strong>Layer aspects.</strong> Check how the planet talks to
                others for nuance, support, or tension.
              </li>
              <li>
                <strong>Translate into action.</strong> Turn the symbolism into
                a daily decision, boundary, or ritual that mirrors the energy.
              </li>
            </ol>
          </section>

          <section
            id='timing'
            className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Timing & Retrogrades
            </h2>
            <p className='text-zinc-300'>
              Each planet has a unique orbit that dictates how often it revisits
              the same degree in your chart. Understanding those cycles helps
              you plan launches, rest windows, and intention resets.
            </p>
            <ul className='space-y-2 text-zinc-300'>
              <li>
                <strong>Mercury:</strong> Retrogrades three to four times per
                year. Re-read, revise, and back up data.
              </li>
              <li>
                <strong>Venus & Mars:</strong> Retrograde every 18–26 months.
                Review relationships (Venus) or motivation (Mars).
              </li>
              <li>
                <strong>Jupiter & Saturn:</strong> Offer yearly retrogrades that
                invite course correction on growth and commitments.
              </li>
              <li>
                <strong>Outer planets:</strong> Spend months retrograde—use them
                for deep healing, shadow work, or innovation.
              </li>
            </ul>
            <p className='text-zinc-400 text-sm'>
              Track these dates in your planner so you can intentionally slow
              down or accelerate based on the planetary weather.
            </p>
          </section>

          <section
            id='case-study'
            className='bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Case Study: Interpreting a Chart
            </h2>
            <p className='text-zinc-300'>
              Imagine a chart with Sun in Taurus (10th house), Moon in Aquarius
              (7th house), and Mars in Cancer (12th house). The personal planets
              already tell a story: the Sun seeks steady public success, the
              Moon craves freedom and intellectual partners, and Mars prefers
              subtle, behind-the-scenes action.
            </p>
            <p className='text-zinc-300'>
              Now add the social planets: Jupiter in Gemini (11th) expands the
              person’s network, while Saturn in Scorpio (4th) insists on deep
              emotional work at home. Finally, layer the outer planets—Uranus in
              Capricorn squares the Sun, pushing entrepreneurial reinvention,
              and Pluto conjunct Mars signifies powerful healing work. Walking
              through this sequence (personal → social → outer) keeps your
              interpretations grounded and actionable.
            </p>
          </section>

          <section
            id='journal-prompts'
            className='bg-zinc-900/35 border border-zinc-800 rounded-xl p-6 space-y-3'
          >
            <h2 className='text-2xl font-medium text-zinc-100'>
              Journal Prompts
            </h2>
            <p className='text-zinc-300'>
              Use these prompts to integrate what you learn about each planetary
              story.
            </p>
            <ul className='list-disc list-inside text-zinc-300 space-y-1'>
              <li>Which planet feels over-worked or under-nourished lately?</li>
              <li>
                How does my Mars placement describe the way I pursue goals?
              </li>
              <li>
                When was the last time a Saturn lesson matured me, and what
                boundary did it require?
              </li>
            </ul>
          </section>

          <div className='flex flex-wrap gap-3 pt-4'>
            <Link
              href='/birth-chart'
              className='px-4 py-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50 transition-colors'
            >
              Calculate Your Chart
            </Link>
          </div>
        </div>
      </SEOContentTemplate>
    </>
  );
}
