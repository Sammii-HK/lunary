export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { ZODIAC_SIGNS } from '../../../../../utils/zodiac/zodiac';
import {
  createArticleWithSpeakableSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Birth Chart: The Complete Guide (2025 Edition) - Lunary',
  description:
    'The definitive guide to birth charts and natal astrology. Learn how to read your birth chart, understand planetary placements, houses, aspects, and interpret your cosmic blueprint. Free birth chart calculator included.',
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
    'free birth chart',
    'natal chart reading',
    'astrology birth chart',
  ],
  openGraph: {
    title: 'Birth Chart: The Complete Guide (2025 Edition) - Lunary',
    description:
      'The definitive guide to birth charts and natal astrology. Learn how to read and interpret your cosmic blueprint.',
    type: 'article',
    url: 'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/guides/birth-chart-complete-guide',
  },
};

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
    question: 'How do I calculate my birth chart for free?',
    answer:
      "You can calculate your birth chart for free using Lunary's birth chart calculator. Simply enter your birth date, exact birth time, and birth location. The calculator will generate your complete natal chart with interpretations of your planetary placements.",
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
    headline: 'Birth Chart: The Complete Guide (2025 Edition)',
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

      {/* Breadcrumbs */}
      <nav className='text-sm text-zinc-500 mb-8'>
        <Link href='/grimoire' className='hover:text-purple-400'>
          Grimoire
        </Link>
        <span className='mx-2'>→</span>
        <Link href='/grimoire/birth-chart' className='hover:text-purple-400'>
          Birth Chart
        </Link>
        <span className='mx-2'>→</span>
        <span className='text-zinc-300'>Complete Guide</span>
      </nav>

      {/* Hero Section */}
      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Birth Chart: The Complete Guide
          <span className='block text-2xl text-purple-400 mt-2'>
            2025 Edition
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed mb-6'>
          Your birth chart is a cosmic snapshot of the sky at the exact moment
          you were born. This comprehensive guide will teach you everything you
          need to know about reading and interpreting your natal chart—from the
          basics to advanced techniques.
        </p>
        <div className='flex flex-wrap gap-4'>
          <Link
            href='/birth-chart'
            className='px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Calculate Your Birth Chart Free
          </Link>
          <Link
            href='#what-is-birth-chart'
            className='px-6 py-3 border border-zinc-700 hover:border-purple-500 text-zinc-300 rounded-lg font-medium transition-colors'
          >
            Start Reading
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
            <a href='#what-is-birth-chart' className='hover:text-purple-400'>
              1. What is a Birth Chart?
            </a>
          </li>
          <li>
            <a href='#calculating-chart' className='hover:text-purple-400'>
              2. How to Calculate Your Birth Chart
            </a>
          </li>
          <li>
            <a href='#big-three' className='hover:text-purple-400'>
              3. The Big Three: Sun, Moon, and Rising
            </a>
          </li>
          <li>
            <a href='#planets' className='hover:text-purple-400'>
              4. Understanding the Planets
            </a>
          </li>
          <li>
            <a href='#zodiac-signs' className='hover:text-purple-400'>
              5. The 12 Zodiac Signs
            </a>
          </li>
          <li>
            <a href='#houses' className='hover:text-purple-400'>
              6. The 12 Houses of the Zodiac
            </a>
          </li>
          <li>
            <a href='#aspects' className='hover:text-purple-400'>
              7. Understanding Aspects
            </a>
          </li>
          <li>
            <a href='#reading-chart' className='hover:text-purple-400'>
              8. How to Read Your Birth Chart Step by Step
            </a>
          </li>
          <li>
            <a href='#advanced' className='hover:text-purple-400'>
              9. Advanced Birth Chart Techniques
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-purple-400'>
              10. Frequently Asked Questions
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

        <div className='bg-purple-900/20 border border-purple-500/30 rounded-lg p-6 mb-6'>
          <h3 className='text-lg font-medium text-purple-300 mb-3'>
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

        <Link
          href='/birth-chart'
          className='inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
        >
          Calculate Your Free Birth Chart Now →
        </Link>
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
            <h3 className='text-xl font-medium text-purple-400 mb-3'>
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
              className='p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-purple-500 transition-colors text-center'
            >
              <span className='text-zinc-100'>{sign}</span>
            </Link>
          ))}
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Click any sign to learn more about its meaning and traits.
        </p>
      </section>

      {/* FAQ Section */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          10. Frequently Asked Questions
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
      <section className='bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-8 text-center'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Ready to Explore Your Birth Chart?
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Get your personalized birth chart with detailed interpretations of
          every placement. Understand your cosmic blueprint and unlock insights
          about your personality, relationships, and life path.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href='/birth-chart'
            className='px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors'
          >
            Calculate Free Birth Chart
          </Link>
          <Link
            href='/pricing'
            className='px-8 py-3 border border-purple-500 text-purple-300 hover:bg-purple-500/10 rounded-lg font-medium transition-colors'
          >
            Get Full Interpretation
          </Link>
        </div>
      </section>
    </div>
  );
}
