export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleWithSpeakableSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Moon Phases: The Complete Guide to Lunar Cycles & Rituals - Lunary',
  description:
    'Master the moon phases with our comprehensive guide. Learn the meaning of each lunar phase, moon rituals, manifestation timing, and how to align your life with the lunar cycle. Includes full moon names and dates.',
  keywords: [
    'moon phases',
    'lunar cycle',
    'full moon meaning',
    'new moon ritual',
    'moon phases meaning',
    'lunar phases',
    'full moon names',
    'moon calendar',
    'moon ritual',
    'waxing moon',
    'waning moon',
    'moon manifestation',
    'lunar astrology',
    'moon signs',
  ],
  openGraph: {
    title: 'Moon Phases: The Complete Guide to Lunar Cycles & Rituals - Lunary',
    description:
      'Master the moon phases with our comprehensive guide. Learn lunar meanings, rituals, and manifestation timing.',
    type: 'article',
    url: 'https://lunary.app/grimoire/guides/moon-phases-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides/moon-phases-guide',
  },
};

const MOON_PHASES = [
  {
    name: 'New Moon',
    emoji: '🌑',
    illumination: '0%',
    duration: '~3 days',
    energy: 'Beginning, planting seeds, setting intentions',
    activities: [
      'Set intentions',
      'Start new projects',
      'Journaling',
      'Quiet reflection',
      'Meditation',
    ],
    avoid: [
      'Launching major projects',
      'Big decisions',
      'High-energy activities',
    ],
  },
  {
    name: 'Waxing Crescent',
    emoji: '🌒',
    illumination: '1-49%',
    duration: '~3.5 days',
    energy: 'Hope, intention, commitment',
    activities: [
      'Take first steps',
      'Make plans',
      'Gather resources',
      'Build momentum',
    ],
    avoid: ['Giving up', 'Second-guessing intentions', 'Major changes'],
  },
  {
    name: 'First Quarter',
    emoji: '🌓',
    illumination: '50%',
    duration: '~3 days',
    energy: 'Action, decision, challenge',
    activities: [
      'Take decisive action',
      'Overcome obstacles',
      'Make decisions',
      'Push through challenges',
    ],
    avoid: ['Avoiding confrontation', 'Procrastination', 'Staying stagnant'],
  },
  {
    name: 'Waxing Gibbous',
    emoji: '🌔',
    illumination: '51-99%',
    duration: '~3.5 days',
    energy: 'Refinement, adjustment, patience',
    activities: [
      'Refine your work',
      'Make adjustments',
      'Edit and perfect',
      'Stay patient',
    ],
    avoid: ['Starting new things', 'Major pivots', 'Impatience'],
  },
  {
    name: 'Full Moon',
    emoji: '🌕',
    illumination: '100%',
    duration: '~3 days',
    energy: 'Illumination, completion, revelation',
    activities: [
      'Celebrate achievements',
      'Release what no longer serves',
      'Charge crystals',
      'Full moon rituals',
    ],
    avoid: [
      'Major life decisions',
      'Impulsive actions',
      'Emotional confrontations',
    ],
  },
  {
    name: 'Waning Gibbous',
    emoji: '🌖',
    illumination: '99-51%',
    duration: '~3.5 days',
    energy: 'Gratitude, sharing, teaching',
    activities: [
      'Practice gratitude',
      'Share knowledge',
      'Reflect on lessons',
      'Give back',
    ],
    avoid: [
      'Starting new projects',
      'Holding on too tightly',
      'Resistance to change',
    ],
  },
  {
    name: 'Last Quarter',
    emoji: '🌗',
    illumination: '50%',
    duration: '~3 days',
    energy: 'Release, forgiveness, letting go',
    activities: [
      'Let go of grudges',
      'Forgive',
      'Clear clutter',
      'End unhealthy patterns',
    ],
    avoid: ['Clinging to the past', 'Avoiding closure', 'Denial'],
  },
  {
    name: 'Waning Crescent',
    emoji: '🌘',
    illumination: '49-1%',
    duration: '~3.5 days',
    energy: 'Rest, surrender, healing',
    activities: [
      'Rest and recuperate',
      'Dream work',
      'Meditation',
      'Prepare for new cycle',
    ],
    avoid: [
      'Pushing too hard',
      'Starting new ventures',
      'Ignoring need for rest',
    ],
  },
];

const FULL_MOON_NAMES = [
  {
    month: 'January',
    name: 'Wolf Moon',
    meaning: 'Named for wolves howling in the cold winter nights',
  },
  {
    month: 'February',
    name: 'Snow Moon',
    meaning: 'Named for the heavy snowfall of mid-winter',
  },
  {
    month: 'March',
    name: 'Worm Moon',
    meaning: 'Named for earthworms emerging as the ground thaws',
  },
  {
    month: 'April',
    name: 'Pink Moon',
    meaning: 'Named for the pink phlox flowers that bloom in spring',
  },
  {
    month: 'May',
    name: 'Flower Moon',
    meaning: 'Named for the abundance of flowers in late spring',
  },
  {
    month: 'June',
    name: 'Strawberry Moon',
    meaning: 'Named for the strawberry harvest season',
  },
  {
    month: 'July',
    name: 'Buck Moon',
    meaning: 'Named for male deer growing new antlers',
  },
  {
    month: 'August',
    name: 'Sturgeon Moon',
    meaning: 'Named for the abundance of sturgeon fish',
  },
  {
    month: 'September',
    name: 'Harvest Moon',
    meaning: 'The full moon closest to the autumn equinox',
  },
  {
    month: 'October',
    name: "Hunter's Moon",
    meaning: 'Named for the hunting season before winter',
  },
  {
    month: 'November',
    name: 'Beaver Moon',
    meaning: 'Named for beavers preparing for winter',
  },
  {
    month: 'December',
    name: 'Cold Moon',
    meaning: 'Named for the arrival of cold winter weather',
  },
];

const faqs = [
  {
    question: 'How long does a complete lunar cycle take?',
    answer:
      'A complete lunar cycle (from New Moon to New Moon) takes approximately 29.5 days, known as a synodic month. This is why the moon phases shift by about a day each month relative to the calendar.',
  },
  {
    question: 'What is the best moon phase for manifesting?',
    answer:
      'The New Moon is ideal for setting intentions and planting seeds for what you want to manifest. The Waxing phases support building and growing those intentions. The Full Moon is powerful for manifestation rituals and seeing results. Many practitioners set intentions at the New Moon and release what blocks them at the Full Moon.',
  },
  {
    question: 'Why do people do rituals on the full moon?',
    answer:
      "The Full Moon is the peak of lunar energy—emotions, intuition, and manifestation power are all heightened. It's an ideal time for: releasing what no longer serves you, charging crystals and tools, gratitude practices, celebrating achievements, and gaining clarity on situations. The extra illumination symbolizes bringing things to light.",
  },
  {
    question: 'What is a void-of-course moon?',
    answer:
      'A void-of-course moon occurs when the Moon makes its last major aspect to another planet before entering a new zodiac sign. During this period (which can last minutes to hours), the Moon is "between" signs. Many astrologers advise against starting new projects or making important decisions during this time, though it\'s good for routine activities and rest.',
  },
  {
    question: 'What does it mean when there are two full moons in one month?',
    answer:
      'When two full moons occur in the same calendar month, the second one is called a "Blue Moon." This happens roughly every 2.5 years. Blue Moons are considered especially powerful for manifestation and are associated with rare opportunities and unexpected events.',
  },
  {
    question: 'How does the moon affect emotions?',
    answer:
      'Many people report feeling more emotional around the Full Moon—this is sometimes called "lunacy" (from "luna," meaning moon). The Moon governs our emotional nature in astrology, and as it waxes and wanes, our emotions often follow. The New Moon can bring introspection, while the Full Moon can amplify feelings and bring things to the surface.',
  },
  {
    question: 'What is a supermoon?',
    answer:
      "A supermoon occurs when a Full Moon (or New Moon) coincides with the Moon's closest approach to Earth (perigee). The Moon appears up to 14% larger and 30% brighter than normal. Supermoons are believed to have intensified energy, amplifying emotions and the effects of lunar rituals.",
  },
  {
    question: 'Should I do different rituals for different moon phases?',
    answer:
      'Yes! Each phase has its own energy: New Moon for intentions and new beginnings, Waxing phases for growth and action, Full Moon for manifestation and release, Waning phases for letting go and rest. Aligning your practices with the lunar cycle can enhance their effectiveness.',
  },
];

export default function MoonPhasesGuidePage() {
  const articleSchema = createArticleWithSpeakableSchema({
    headline: 'Moon Phases: The Complete Guide to Lunar Cycles & Rituals',
    description:
      'Master the moon phases with our comprehensive guide. Learn lunar meanings, rituals, and manifestation timing.',
    url: 'https://lunary.app/grimoire/guides/moon-phases-guide',
    keywords: [
      'moon phases',
      'lunar cycle',
      'full moon',
      'new moon',
      'moon ritual',
    ],
    section: 'Moon Guides',
    speakableSections: [
      'h1',
      'h2',
      'header p',
      '#understanding-moon p',
      '#new-moon-ritual p',
    ],
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-500 mb-8'>
        <Link href='/grimoire' className='hover:text-purple-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <Link href='/grimoire/moon' className='hover:text-purple-400'>
          Moon
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Complete Guide</span>
      </nav>

      {/* Hero Section */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Moon Phases: The Complete Guide
          <span className='block text-2xl text-purple-400 mt-2'>
            Master the Lunar Cycle
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
          The Moon has guided humanity for millennia—governing tides, seasons,
          and our inner emotional landscape. This comprehensive guide will teach
          you the meaning of each lunar phase, how to work with moon energy, and
          rituals for every part of the cycle.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Link
            href='/moon'
            className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Today&apos;s Moon Phase
          </Link>
          <Link
            href='#eight-phases'
            className='px-6 py-3 border border-zinc-700 hover:border-purple-500 text-zinc-300 rounded-lg font-medium transition-colors'
          >
            Explore the Phases
          </Link>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#understanding-moon' className='hover:text-purple-400'>
              1. Understanding the Lunar Cycle
            </a>
          </li>
          <li>
            <a href='#eight-phases' className='hover:text-purple-400'>
              2. The 8 Moon Phases Explained
            </a>
          </li>
          <li>
            <a href='#full-moon-names' className='hover:text-purple-400'>
              3. Full Moon Names by Month
            </a>
          </li>
          <li>
            <a href='#new-moon-ritual' className='hover:text-purple-400'>
              4. New Moon Ritual Guide
            </a>
          </li>
          <li>
            <a href='#full-moon-ritual' className='hover:text-purple-400'>
              5. Full Moon Ritual Guide
            </a>
          </li>
          <li>
            <a href='#manifestation' className='hover:text-purple-400'>
              6. Manifestation & the Moon
            </a>
          </li>
          <li>
            <a href='#moon-signs' className='hover:text-purple-400'>
              7. Moon Signs & Emotional Nature
            </a>
          </li>
          <li>
            <a href='#special-moons' className='hover:text-purple-400'>
              8. Special Moons: Supermoons, Eclipses & Blue Moons
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-purple-400'>
              9. Frequently Asked Questions
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: Understanding the Lunar Cycle */}
      <section id='understanding-moon' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Understanding the Lunar Cycle
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The lunar cycle is the Moon&apos;s journey from invisible (New Moon)
          to fully illuminated (Full Moon) and back again. This 29.5-day cycle
          has been tracked by humans since ancient times and forms the basis of
          many calendars and spiritual practices.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          As the Moon orbits Earth, the Sun illuminates different portions of
          its surface from our perspective. When the Moon is between Earth and
          the Sun, we see the dark New Moon. When Earth is between the Sun and
          Moon, we see the fully lit Full Moon.
        </p>

        <div className='bg-purple-900/20 border border-purple-500/30 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-purple-300 mb-3'>
            The Two Halves of the Lunar Cycle
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>
                Waxing (Growing) 🌒🌓🌔🌕
              </h4>
              <p className='text-zinc-400 text-sm'>
                New Moon → Full Moon. The light increases. Energy for: building,
                growing, attracting, creating, starting new things.
              </p>
            </div>
            <div>
              <h4 className='text-zinc-100 font-medium mb-2'>
                Waning (Releasing) 🌕🌖🌗🌘
              </h4>
              <p className='text-zinc-400 text-sm'>
                Full Moon → New Moon. The light decreases. Energy for:
                releasing, completing, letting go, banishing, rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The 8 Moon Phases */}
      <section id='eight-phases' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. The 8 Moon Phases Explained
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each phase of the Moon carries unique energy. Understanding these
          phases helps you align your activities and intentions with natural
          rhythms.
        </p>

        <div className='space-y-4'>
          {MOON_PHASES.map((phase) => (
            <div
              key={phase.name}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <div className='flex items-center gap-3 mb-3'>
                <span className='text-3xl'>{phase.emoji}</span>
                <div>
                  <h3 className='text-xl font-medium text-zinc-100'>
                    {phase.name}
                  </h3>
                  <p className='text-sm text-zinc-500'>
                    {phase.illumination} illuminated • ~{phase.duration}
                  </p>
                </div>
              </div>

              <p className='text-purple-300 mb-4'>{phase.energy}</p>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <h4 className='text-sm font-medium text-green-400 mb-2'>
                    ✓ Best Activities
                  </h4>
                  <ul className='text-sm text-zinc-400 space-y-1'>
                    {phase.activities.map((activity) => (
                      <li key={activity}>• {activity}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className='text-sm font-medium text-red-400 mb-2'>
                    ✗ Avoid
                  </h4>
                  <ul className='text-sm text-zinc-400 space-y-1'>
                    {phase.avoid.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Full Moon Names */}
      <section id='full-moon-names' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Full Moon Names by Month
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each month&apos;s Full Moon has traditional names, many originating
          from Native American, Colonial American, or European traditions. These
          names reflect the natural world and seasonal activities.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {FULL_MOON_NAMES.map((moon) => (
            <Link
              key={moon.month}
              href={`/grimoire/moon/full-moon-names#${moon.month.toLowerCase()}`}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-purple-500 transition-colors'
            >
              <h4 className='text-zinc-100 font-medium'>{moon.name}</h4>
              <p className='text-sm text-purple-400'>{moon.month}</p>
              <p className='text-xs text-zinc-500 mt-1'>{moon.meaning}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Section 4: New Moon Ritual */}
      <section id='new-moon-ritual' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. New Moon Ritual Guide
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The New Moon is the perfect time to set intentions for the coming
          lunar cycle. This is when the slate is clean and new energy is ready
          to be directed.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Simple New Moon Ritual
          </h3>
          <ol className='space-y-4'>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
                1
              </span>
              <div>
                <h4 className='text-zinc-100 font-medium'>
                  Create Sacred Space
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Light a candle, cleanse your space with sage or incense, and
                  sit in a quiet, comfortable place.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
                2
              </span>
              <div>
                <h4 className='text-zinc-100 font-medium'>Ground Yourself</h4>
                <p className='text-zinc-400 text-sm'>
                  Take several deep breaths. Close your eyes and feel your
                  connection to the earth beneath you.
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
                3
              </span>
              <div>
                <h4 className='text-zinc-100 font-medium'>Reflect</h4>
                <p className='text-zinc-400 text-sm'>
                  Consider what you want to call into your life. What seeds do
                  you want to plant this cycle?
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
                4
              </span>
              <div>
                <h4 className='text-zinc-100 font-medium'>Write Intentions</h4>
                <p className='text-zinc-400 text-sm'>
                  Write 3-10 intentions in present tense, as if they&apos;re
                  already happening: &quot;I am...&quot; &quot;I have...&quot;
                  &quot;I attract...&quot;
                </p>
              </div>
            </li>
            <li className='flex gap-4'>
              <span className='flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium'>
                5
              </span>
              <div>
                <h4 className='text-zinc-100 font-medium'>
                  Seal with Gratitude
                </h4>
                <p className='text-zinc-400 text-sm'>
                  Express thanks for what&apos;s coming. Keep your intentions
                  somewhere safe to revisit at the Full Moon.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Section 5: Full Moon Ritual */}
      <section id='full-moon-ritual' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Full Moon Ritual Guide
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The Full Moon is a time of culmination and release. It&apos;s ideal
          for letting go of what no longer serves you and celebrating how far
          you&apos;ve come.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🌕 Release Ritual
            </h4>
            <p className='text-zinc-400 text-sm'>
              Write down what you want to release (fears, limiting beliefs,
              toxic patterns). Safely burn the paper or tear it up and dispose
              of it.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              💎 Crystal Charging
            </h4>
            <p className='text-zinc-400 text-sm'>
              Place your crystals outside or on a windowsill to absorb the Full
              Moon&apos;s energy overnight. Set an intention for each crystal.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🌊 Moon Water
            </h4>
            <p className='text-zinc-400 text-sm'>
              Place a jar of water under the Full Moon to charge it. Use for
              rituals, plants, baths, or drinking (if using clean water).
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              🙏 Gratitude Practice
            </h4>
            <p className='text-zinc-400 text-sm'>
              Review your New Moon intentions. Express gratitude for progress
              and lessons learned. Celebrate your wins, big and small.
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Special Moons */}
      <section id='special-moons' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. Special Moons: Supermoons, Eclipses & Blue Moons
        </h2>

        <div className='space-y-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              🌕 Supermoon
            </h3>
            <p className='text-zinc-300 mb-2'>
              A Supermoon occurs when the Full Moon coincides with the
              Moon&apos;s closest approach to Earth (perigee). The Moon appears
              up to 14% larger and 30% brighter.
            </p>
            <p className='text-zinc-500 text-sm'>
              Energy is amplified—emotions run higher, manifestation is more
              powerful, and rituals have extra potency.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              🌑 Solar Eclipse (New Moon)
            </h3>
            <p className='text-zinc-300 mb-2'>
              A Solar Eclipse occurs when the Moon passes between Earth and the
              Sun, temporarily blocking sunlight. These are powerful New Moons
              that can mark major new beginnings.
            </p>
            <p className='text-zinc-500 text-sm'>
              Eclipse energy lasts 6 months and can trigger significant life
              changes. Many practitioners avoid rituals during eclipses and
              instead observe and receive.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              🌕 Lunar Eclipse (Full Moon)
            </h3>
            <p className='text-zinc-300 mb-2'>
              A Lunar Eclipse occurs when Earth passes between the Sun and Moon,
              casting a shadow on the Moon. These are intense Full Moons that
              often bring revelations and endings.
            </p>
            <p className='text-zinc-500 text-sm'>
              Lunar Eclipses illuminate what&apos;s been hidden. They&apos;re
              powerful for releasing and completing cycles.
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-zinc-100 mb-3'>
              🔵 Blue Moon
            </h3>
            <p className='text-zinc-300 mb-2'>
              A Blue Moon is the second Full Moon in a calendar month, occurring
              roughly every 2.5 years. Despite the name, the Moon doesn&apos;t
              actually appear blue.
            </p>
            <p className='text-zinc-500 text-sm'>
              Blue Moons are considered especially magical and powerful for
              manifestation. &quot;Once in a blue moon&quot; refers to their
              rarity.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          9. Frequently Asked Questions
        </h2>

        <div className='space-y-4'>
          {faqs.map((faq, index) => (
            <div
              key={index}
              className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'
            >
              <h3 className='text-lg font-medium text-zinc-100 mb-3'>
                {faq.question}
              </h3>
              <p className='text-zinc-300 leading-relaxed'>{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className='bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Work with the Moon?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Track the lunar cycle, get personalized moon insights, and receive
          notifications for important lunar events with Lunary.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/moon'
            className='px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Today&apos;s Moon Phase
          </Link>
          <Link
            href='/grimoire/moon'
            className='px-8 py-3 border border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-lg font-medium transition-colors'
          >
            Explore Moon Content
          </Link>
        </div>
      </section>
    </div>
  );
}
