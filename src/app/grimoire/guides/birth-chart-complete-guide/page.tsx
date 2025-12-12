export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_SIGNS } from '../../../../../utils/zodiac/zodiac';
import {
  createArticleWithSpeakableSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';

const currentYear = new Date().getFullYear();

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Birth Chart: The Complete Guide (${currentYear} Edition) - Lunary`,
    description:
      'The definitive guide to birth charts and natal astrology. Learn how to read your birth chart, understand planetary placements, houses, aspects, and interpret your cosmic blueprint.',
    keywords: [
      'birth chart',
      'natal chart',
      'birth chart guide',
      'how to read birth chart',
      'birth chart calculator',
      'natal astrology',
      'birth chart interpretation',
      'astrological chart',
      'birth chart meaning',
      'natal chart reading',
      'astrology birth chart',
    ],
    openGraph: {
      title: `Birth Chart: The Complete Guide (${currentYear} Edition) - Lunary`,
      description:
        'The definitive guide to birth charts and natal astrology. Learn how to read and interpret your cosmic blueprint.',
      type: 'article',
      url: 'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
    },
    alternates: {
      canonical:
        'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
    },
  };
}

const faqs = [
  {
    question: 'What is a birth chart?',
    answer:
      'A birth chart (also called a natal chart) is a map of where all the planets were at the exact moment you were born. It shows the positions of the Sun, Moon, and planets in the zodiac signs and houses, creating a unique cosmic fingerprint that reveals your personality, strengths, challenges, and life path.',
  },
  {
    question: 'Do I need my exact birth time for an accurate birth chart?',
    answer:
      'Yes, your exact birth time is crucial for an accurate birth chart. It determines your Rising sign (Ascendant) and house placements, which are essential for interpretation. Without an accurate birth time, your Rising sign and houses will be incorrect. Check your birth certificate or ask family members for this information.',
  },
  {
    question: 'What are the most important parts of a birth chart?',
    answer:
      'The "Big Three" are considered most important: your Sun sign (core identity), Moon sign (emotional nature), and Rising sign (outer personality). Beyond these, your chart ruler, dominant element, and major aspects between planets also play crucial roles in shaping your personality.',
  },
  {
    question: 'How do I calculate my birth chart?',
    answer:
      "You can calculate your birth chart using Lunary's birth chart calculator. Simply enter your birth date, exact birth time, and birth location. Subscribers get access to a complete natal chart with detailed interpretations of all planetary placements, aspects, and houses.",
  },
  {
    question: 'What is the difference between Sun sign and Rising sign?',
    answer:
      'Your Sun sign represents your core identity, ego, and life purpose—who you are at your deepest level. Your Rising sign (Ascendant) represents your outer personality, how others perceive you, and how you approach new situations. Both are essential parts of your astrological profile.',
  },
  {
    question: 'Can my birth chart change over time?',
    answer:
      "No, your natal birth chart never changes—it's fixed at your moment of birth. However, transiting planets continuously move and form aspects to your natal chart, creating different influences throughout your life. These transits are what astrologers use for timing and predictions.",
  },
  {
    question: 'What do houses mean in astrology?',
    answer:
      'The 12 houses in astrology represent different areas of life. The 1st house rules self and identity, the 2nd rules money and values, the 3rd rules communication, and so on. Planets in each house influence how you experience that life area.',
  },
  {
    question: 'What are aspects in a birth chart?',
    answer:
      'Aspects are geometric angles between planets that show how different parts of your personality interact. Conjunctions (0°) blend energies, trines (120°) create harmony, squares (90°) create tension and growth, and oppositions (180°) create balance through integration.',
  },
];

export default function BirthChartCompleteGuidePage() {
  const articleSchema = createArticleWithSpeakableSchema({
    headline: `Birth Chart: The Complete Guide (${currentYear} Edition)`,
    description:
      'The definitive guide to birth charts and natal astrology. Learn how to read and interpret your cosmic blueprint.',
    url: 'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
    keywords: [
      'birth chart',
      'natal chart',
      'astrology guide',
      'birth chart interpretation',
    ],
    section: 'Astrology Guides',
    speakableSections: [
      'h1',
      'h2',
      'header p',
      '#what-is-birth-chart p',
      '#big-three p',
    ],
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Guides', url: '/grimoire/guides' },
          {
            name: 'Birth Chart Guide',
            url: '/grimoire/guides/birth-chart-complete-guide',
          },
        ]),
      )}

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-400 mb-8'>
        <Link href='/grimoire' className='hover:text-lunary-primary-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <Link
          href='/grimoire/birth-chart'
          className='hover:text-lunary-primary-400'
        >
          Birth Chart
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Complete Guide</span>
      </nav>

      {/* Hero Section */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Birth Chart: The Complete Guide
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            {currentYear} Edition
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
          Your birth chart is a cosmic snapshot of the sky at the exact moment
          you were born. This comprehensive guide will teach you everything you
          need to know about reading and interpreting your natal chart—from the
          basics to advanced techniques.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/birth-chart'>Get Your Birth Chart</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='#what-is-birth-chart'>Start Reading</Link>
          </Button>
        </div>
      </header>

      {/* Table of Contents */}
      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#what-is-birth-chart'
              className='hover:text-lunary-primary-400'
            >
              1. What is a Birth Chart?
            </a>
          </li>
          <li>
            <a
              href='#calculating-chart'
              className='hover:text-lunary-primary-400'
            >
              2. How to Calculate Your Birth Chart
            </a>
          </li>
          <li>
            <a href='#big-three' className='hover:text-lunary-primary-400'>
              3. The Big Three: Sun, Moon, and Rising
            </a>
          </li>
          <li>
            <a href='#planets' className='hover:text-lunary-primary-400'>
              4. Understanding the Planets
            </a>
          </li>
          <li>
            <a href='#zodiac-signs' className='hover:text-lunary-primary-400'>
              5. The 12 Zodiac Signs
            </a>
          </li>
          <li>
            <a href='#houses' className='hover:text-lunary-primary-400'>
              6. The 12 Houses of the Zodiac
            </a>
          </li>
          <li>
            <a href='#aspects' className='hover:text-lunary-primary-400'>
              7. Understanding Aspects
            </a>
          </li>
          <li>
            <a href='#reading-chart' className='hover:text-lunary-primary-400'>
              8. How to Read Your Birth Chart Step by Step
            </a>
          </li>
          <li>
            <a href='#advanced' className='hover:text-lunary-primary-400'>
              9. Advanced Birth Chart Techniques
            </a>
          </li>
          <li>
            <a
              href='#how-lunary-uses-chart'
              className='hover:text-lunary-primary-400'
            >
              10. How Lunary Uses Your Chart
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              11. Frequently Asked Questions
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1: What is a Birth Chart */}
      <section id='what-is-birth-chart' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What is a Birth Chart?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A birth chart, also known as a natal chart, is essentially a map of
          the sky at the precise moment you were born. It captures the exact
          positions of the Sun, Moon, and all the planets in our solar system,
          as seen from your specific birth location on Earth.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Think of your birth chart as your cosmic DNA—a unique fingerprint that
          no one else in the world shares (unless they were born at the exact
          same time, in the exact same place). This celestial snapshot provides
          insights into your personality, strengths, challenges, relationships,
          career path, and life purpose.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Key Components of a Birth Chart
          </h3>
          <ul className='space-y-2 text-zinc-300'>
            <li>
              <strong>Planets:</strong> The Sun, Moon, Mercury, Venus, Mars,
              Jupiter, Saturn, Uranus, Neptune, and Pluto
            </li>
            <li>
              <strong>Zodiac Signs:</strong> The 12 signs that planets occupy
            </li>
            <li>
              <strong>Houses:</strong> 12 sections representing different life
              areas
            </li>
            <li>
              <strong>Aspects:</strong> Geometric angles between planets
            </li>
            <li>
              <strong>Angles:</strong> Ascendant, Descendant, Midheaven, IC
            </li>
          </ul>
        </div>

        <p className='text-zinc-300 leading-relaxed'>
          Unlike your Sun sign horoscope, which only considers one placement,
          your birth chart provides a complete picture of your astrological
          makeup. Two people with the same Sun sign can have vastly different
          birth charts—and vastly different personalities—based on their Moon
          sign, Rising sign, and other placements.
        </p>
      </section>

      {/* Section 2: How to Calculate */}
      <section id='calculating-chart' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. How to Calculate Your Birth Chart
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          To generate an accurate birth chart, you need three pieces of
          information:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              1. Birth Date
            </h4>
            <p className='text-sm text-zinc-400'>
              The day, month, and year you were born.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              2. Birth Time
            </h4>
            <p className='text-sm text-zinc-400'>
              The exact time you were born (check your birth certificate).
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              3. Birth Location
            </h4>
            <p className='text-sm text-zinc-400'>
              The city or town where you were born.
            </p>
          </div>
        </div>

        <div className='bg-lunary-accent-900/20 border border-lunary-accent-700 rounded-lg p-6 mb-6'>
          <h4 className='text-lg font-medium text-lunary-accent-300 mb-2'>
            Why Birth Time Matters
          </h4>
          <p className='text-zinc-300'>
            Your birth time is crucial because the Rising sign (Ascendant)
            changes approximately every 2 hours. An incorrect birth time can
            give you the wrong Rising sign and incorrect house placements. If
            you don&apos;t know your exact birth time, check your birth
            certificate, hospital records, or ask family members.
          </p>
        </div>

        <Button asChild variant='lunary-solid' size='lg'>
          <Link href='/birth-chart'>Get Your Personalized Birth Chart →</Link>
        </Button>
      </section>

      {/* Section 3: Big Three */}
      <section id='big-three' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. The Big Three: Sun, Moon, and Rising
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The &quot;Big Three&quot; are the most important placements in your
          birth chart. Together, they form the foundation of your personality
          and how you experience the world.
        </p>

        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-lunary-accent mb-3'>
              ☉ Sun Sign: Your Core Identity
            </h3>
            <p className='text-zinc-300 mb-4'>
              Your Sun sign represents your ego, identity, and life purpose.
              It&apos;s the sign most people know—when someone asks
              &quot;what&apos;s your sign?&quot; they&apos;re asking about your
              Sun sign. The Sun shows who you are at your core, your vitality,
              and the themes you&apos;re meant to explore in this lifetime.
            </p>
            <p className='text-zinc-400 text-sm'>
              <strong>Questions the Sun answers:</strong> Who am I? What is my
              purpose? What drives me?
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-lunary-secondary mb-3'>
              ☽ Moon Sign: Your Emotional Nature
            </h3>
            <p className='text-zinc-300 mb-4'>
              Your Moon sign reveals your emotional inner world, instinctive
              reactions, and what you need to feel secure. It represents your
              subconscious, memories, and how you nurture yourself and others.
              The Moon shows your private self—the person only those closest to
              you truly know.
            </p>
            <p className='text-zinc-400 text-sm'>
              <strong>Questions the Moon answers:</strong> How do I feel? What
              do I need? How do I process emotions?
            </p>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
            <h3 className='text-xl font-medium text-lunary-primary-400 mb-3'>
              AC Rising Sign: Your Outer Personality
            </h3>
            <p className='text-zinc-300 mb-4'>
              Your Rising sign (Ascendant) is the mask you wear in the
              world—your first impression, appearance, and how you approach new
              situations. It&apos;s the sign that was rising on the eastern
              horizon at your moment of birth. The Rising sign also determines
              your chart ruler and the sign on each house cusp.
            </p>
            <p className='text-zinc-400 text-sm'>
              <strong>Questions the Rising answers:</strong> How do others see
              me? How do I approach life? What&apos;s my style?
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: The Planets */}
      <section id='planets' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. The Planets in Your Chart
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each planet represents a different aspect of your personality and life
          experience. Understanding what each planet signifies helps you
          interpret your complete birth chart.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-accent-300'>☉ Sun</h4>
            <p className='text-sm text-zinc-400'>
              Core identity, ego, life purpose
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-accent-300'>☽ Moon</h4>
            <p className='text-sm text-zinc-400'>
              Emotions, instincts, inner self
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>☿ Mercury</h4>
            <p className='text-sm text-zinc-400'>
              Communication, thinking, learning
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>♀ Venus</h4>
            <p className='text-sm text-zinc-400'>Love, beauty, values, money</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>♂ Mars</h4>
            <p className='text-sm text-zinc-400'>
              Action, desire, drive, assertion
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>♃ Jupiter</h4>
            <p className='text-sm text-zinc-400'>Growth, luck, expansion</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>♄ Saturn</h4>
            <p className='text-sm text-zinc-400'>
              Structure, discipline, lessons
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100'>♅♆♇ Outer Planets</h4>
            <p className='text-sm text-zinc-400'>
              Generational & transformative forces
            </p>
          </div>
        </div>
      </section>

      {/* Zodiac Signs Quick Reference */}
      <section id='zodiac-signs' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. The 12 Zodiac Signs
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Each zodiac sign has unique qualities, elements, and modalities that
          influence how planets express themselves in your chart.
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          {ZODIAC_SIGNS.map((sign) => (
            <Link
              key={sign}
              href={`/grimoire/zodiac/${sign.toLowerCase()}`}
              className='p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary transition-colors text-center'
            >
              <span className='text-zinc-100'>{sign}</span>
            </Link>
          ))}
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Click any sign to learn more about its meaning and traits.
        </p>
      </section>

      {/* Section 6: The 12 Houses */}
      <section id='houses' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. The 12 Houses
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Houses represent different areas of life where planetary energy
          manifests. Each house governs specific themes and life domains.
        </p>

        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>1st</span>
            <p className='text-xs text-zinc-400'>Self, appearance</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>2nd</span>
            <p className='text-xs text-zinc-400'>Money, values</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>3rd</span>
            <p className='text-xs text-zinc-400'>Communication</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>4th</span>
            <p className='text-xs text-zinc-400'>Home, family</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>5th</span>
            <p className='text-xs text-zinc-400'>Creativity, romance</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>6th</span>
            <p className='text-xs text-zinc-400'>Health, routine</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>7th</span>
            <p className='text-xs text-zinc-400'>Partnerships</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>8th</span>
            <p className='text-xs text-zinc-400'>Transformation</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>9th</span>
            <p className='text-xs text-zinc-400'>Philosophy, travel</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>10th</span>
            <p className='text-xs text-zinc-400'>Career, reputation</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>11th</span>
            <p className='text-xs text-zinc-400'>Friends, hopes</p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-3'>
            <span className='text-lunary-primary-400 font-medium'>12th</span>
            <p className='text-xs text-zinc-400'>Subconscious, karma</p>
          </div>
        </div>
      </section>

      {/* Section 7: Aspects */}
      <section id='aspects' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Planetary Aspects
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Aspects are the angles formed between planets, revealing how different
          parts of your chart interact—either harmoniously or with tension.
        </p>

        <div className='space-y-3'>
          <div className='bg-lunary-success-900/20 border border-lunary-success-700 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-success-300 mb-1'>
              ☌ Conjunction (0°) - Fusion
            </h4>
            <p className='text-sm text-zinc-400'>
              Planets combine their energies powerfully
            </p>
          </div>
          <div className='bg-lunary-success-900/20 border border-lunary-success-700 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-success-300 mb-1'>
              △ Trine (120°) - Harmony
            </h4>
            <p className='text-sm text-zinc-400'>
              Natural flow and ease between planets
            </p>
          </div>
          <div className='bg-lunary-success-900/20 border border-lunary-success-700 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-success-300 mb-1'>
              ⚹ Sextile (60°) - Opportunity
            </h4>
            <p className='text-sm text-zinc-400'>
              Supportive connection requiring action
            </p>
          </div>
          <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-error-300 mb-1'>
              □ Square (90°) - Tension
            </h4>
            <p className='text-sm text-zinc-400'>
              Friction that drives growth and change
            </p>
          </div>
          <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-lg p-4'>
            <h4 className='font-medium text-lunary-error-300 mb-1'>
              ☍ Opposition (180°) - Polarity
            </h4>
            <p className='text-sm text-zinc-400'>
              Balance needed between opposing forces
            </p>
          </div>
        </div>
      </section>

      {/* Section 8: Reading Your Chart */}
      <section id='reading-chart' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. Reading Your Chart
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Follow these steps to begin interpreting your birth chart
          systematically.
        </p>

        <ol className='space-y-4'>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <span className='text-lunary-primary-400 font-medium'>1.</span>
            <span className='text-zinc-300 ml-2'>
              Start with your Big Three (Sun, Moon, Rising)
            </span>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <span className='text-lunary-primary-400 font-medium'>2.</span>
            <span className='text-zinc-300 ml-2'>
              Look at which houses have the most planets (stelliums)
            </span>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <span className='text-lunary-primary-400 font-medium'>3.</span>
            <span className='text-zinc-300 ml-2'>
              Examine your chart ruler (planet that rules your Rising sign)
            </span>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <span className='text-lunary-primary-400 font-medium'>4.</span>
            <span className='text-zinc-300 ml-2'>
              Check major aspects, especially to your Sun, Moon, and Rising
            </span>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <span className='text-lunary-primary-400 font-medium'>5.</span>
            <span className='text-zinc-300 ml-2'>
              Look at the overall element and modality balance
            </span>
          </li>
        </ol>
      </section>

      {/* Section 9: Advanced Topics */}
      <section id='advanced' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          9. Advanced Chart Features
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Once you understand the basics, explore these deeper layers of your
          chart.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/lunar-nodes'
            className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 hover:border-lunary-primary transition-colors'
          >
            <h4 className='font-medium text-zinc-100 mb-2'>Lunar Nodes</h4>
            <p className='text-sm text-zinc-400'>
              North and South Nodes reveal your soul&apos;s purpose and past
              life patterns
            </p>
          </Link>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-2'>Chiron</h4>
            <p className='text-sm text-zinc-400'>
              The &quot;wounded healer&quot; asteroid shows your deepest wound
              and healing gifts
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-2'>Midheaven (MC)</h4>
            <p className='text-sm text-zinc-400'>
              Your public image, career path, and legacy in the world
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h4 className='font-medium text-zinc-100 mb-2'>Chart Patterns</h4>
            <p className='text-sm text-zinc-400'>
              Bundle, Bowl, Bucket, Seesaw, and other planetary configurations
            </p>
          </div>
        </div>
      </section>

      {/* Section 10: How Lunary Uses Your Chart */}
      <section id='how-lunary-uses-chart' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          10. How Lunary Uses Your Chart
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Lunary calculates your birth chart using precise astronomical data
          from the Astronomy Engine library. Your chart powers personalized
          insights throughout the app.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Daily Horoscope
            </h4>
            <p className='text-zinc-400 text-sm'>
              Your horoscope considers not just your Sun sign, but your Moon,
              Rising, and current transits to your natal chart.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Transit Alerts
            </h4>
            <p className='text-zinc-400 text-sm'>
              Receive notifications when significant planetary transits activate
              important points in your birth chart.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Archetype Patterns
            </h4>
            <p className='text-zinc-400 text-sm'>
              Your chart placements inform which{' '}
              <Link
                href='/grimoire/archetypes'
                className='text-lunary-primary-400 hover:underline'
              >
                Lunary archetypes
              </Link>{' '}
              resonate most with your cosmic blueprint.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <h4 className='text-lg font-medium text-zinc-100 mb-2'>
              Life Path Integration
            </h4>
            <p className='text-zinc-400 text-sm'>
              Your chart combines with{' '}
              <Link
                href='/grimoire/life-path'
                className='text-lunary-primary-400 hover:underline'
              >
                numerology life path
              </Link>{' '}
              for deeper personality insights.
            </p>
          </div>
        </div>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-6'>
          <h4 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Where to Go Next
          </h4>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            <Link
              href='/grimoire/houses/overview'
              className='text-sm text-zinc-300 hover:text-lunary-primary-400'
            >
              → Houses Overview
            </Link>
            <Link
              href='/grimoire/aspects/types'
              className='text-sm text-zinc-300 hover:text-lunary-primary-400'
            >
              → Aspect Types
            </Link>
            <Link
              href='/grimoire/placements'
              className='text-sm text-zinc-300 hover:text-lunary-primary-400'
            >
              → All Placements
            </Link>
            <Link
              href='/grimoire/archetypes'
              className='text-sm text-zinc-300 hover:text-lunary-primary-400'
            >
              → Archetypes
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          11. Frequently Asked Questions
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
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-lunary-rose-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Explore Your Birth Chart?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Get your personalized birth chart with detailed interpretations of
          every placement. Lunary subscribers unlock full access to their cosmic
          blueprint—including personality insights, relationship patterns, and
          life path guidance.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/birth-chart'
            className='px-8 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Get Your Birth Chart
          </Link>
          <Link
            href='/pricing'
            className='px-8 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            View Subscription Plans
          </Link>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-placements'
        entityKey='birth-chart-guide'
        title='Birth Chart Connections'
      />

      <ExploreGrimoire />
    </div>
  );
}
