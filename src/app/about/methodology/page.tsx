import { Metadata } from 'next';
import Link from 'next/link';
import { createFAQPageSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Methodology - How Lunary Calculates Charts & Transits',
  description:
    'Technical documentation on how Lunary calculates birth charts, planetary positions, and astrological transits. Astronomy Engine, coordinate systems, and accuracy standards.',
  openGraph: {
    title: 'Methodology - Lunary Technical Accuracy',
    description: 'How we calculate birth charts and planetary positions.',
    url: 'https://lunary.app/about/methodology',
  },
  alternates: { canonical: 'https://lunary.app/about/methodology' },
};

const faqs = [
  {
    question: 'How accurate are Lunary birth chart calculations?',
    answer:
      'Lunary uses the Astronomy Engine library, which calculates planetary positions to arcsecond precision. Our charts match professional ephemeris data and astronomical sources.',
  },
  {
    question: 'What house system does Lunary use?',
    answer:
      'Lunary uses the Placidus house system by default, the most widely used system in Western astrology. House cusps are calculated based on your exact birth time and location.',
  },
  {
    question: 'How are timezones handled?',
    answer:
      'Birth times are converted to UTC using historical timezone data. We account for daylight saving time changes throughout history to ensure accurate chart calculation.',
  },
];

const sections = [
  {
    title: 'Astronomy Engine',
    content: `Lunary uses the Astronomy Engine library for all celestial calculations. This open-source library provides:

• Planetary positions accurate to arcseconds
• Moon phase calculations precise to the minute
• Retrograde motion detection based on actual orbital mechanics
• Eclipse predictions matching NASA data
• Rise/set times accounting for atmospheric refraction

The same algorithms used by planetariums and professional astronomers power Lunary's calculations.`,
  },
  {
    title: 'Coordinate Systems',
    content: `All calculations use the following standards:

• Ecliptic Longitude: Measured in degrees from 0° Aries (tropical zodiac)
• Tropical Zodiac: Aligned with seasons, not fixed stars
• J2000.0 Epoch: Standard astronomical reference frame
• WGS84 Coordinates: For birth location input

We use the tropical zodiac (season-based) as standard in Western astrology, where 0° Aries begins at the spring equinox.`,
  },
  {
    title: 'Chart Calculation Method',
    content: `Birth charts are calculated using:

1. Convert birth time to UTC using historical timezone data
2. Calculate planetary positions for that exact moment
3. Determine the Ascendant based on birth location and sidereal time
4. Calculate house cusps using the Placidus system
5. Compute aspects between planets within standard orbs
6. Identify planetary dignity/debility states

Each calculation is performed in real-time, ensuring you always see accurate current sky positions.`,
  },
  {
    title: 'Transit Calculations',
    content: `Daily transits are calculated by:

• Computing current planetary positions in real-time
• Comparing transiting planets to natal chart positions
• Calculating aspects with appropriate orbs (tighter for personal planets)
• Tracking ingresses, stations, and sign changes
• Monitoring retrograde periods and shadow phases

Transit data updates continuously throughout the day.`,
  },
  {
    title: 'Accuracy Philosophy',
    content: `We believe accurate astronomy is the foundation of meaningful astrology. Our approach:

• Never approximate when precision is possible
• Use the same data sources as professional astronomers
• Validate calculations against established ephemeris
• Transparently document our methods
• Separate astronomical fact from astrological interpretation

The sky positions we show are real. How you interpret them is where the art of astrology begins.`,
  },
  {
    title: 'Why Lunary Is Different',
    content: `Many astrology apps use simplified calculations or pre-generated horoscopes. Lunary is different:

• Real-time calculations: Your chart is computed fresh, not cached
• Astronomy-grade precision: Same accuracy as scientific applications
• Transparent methods: We document exactly how we calculate
• Continuous updates: Sky data updates throughout the day
• Open standards: Using well-tested, open-source astronomy libraries

We combine technical precision with intuitive interpretation to create the most accurate and accessible astrology platform.`,
  },
];

export default function MethodologyPage() {
  const faqSchema = createFAQPageSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/' className='hover:text-zinc-300'>
            Home
          </Link>
          <span>/</span>
          <Link href='/about' className='hover:text-zinc-300'>
            About
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>Methodology</span>
        </nav>

        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            Technical Methodology
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed'>
            How Lunary achieves astronomy-grade accuracy in astrological
            calculations.
          </p>
        </header>

        <div className='space-y-8'>
          {sections.map((section, index) => (
            <section
              key={index}
              className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'
            >
              <h2 className='text-xl font-medium mb-4 text-lunary-primary-300'>
                {section.title}
              </h2>
              <div className='text-zinc-300 whitespace-pre-line leading-relaxed'>
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <section className='mt-12'>
          <h2 className='text-2xl font-light mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'
              >
                <h3 className='text-lg font-medium mb-2 text-zinc-100'>
                  {faq.question}
                </h3>
                <p className='text-zinc-400'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='mt-12 p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            See It In Action
          </h2>
          <p className='text-zinc-300 mb-4'>
            Generate your own birth chart and experience our precision-first
            approach to astrology.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Calculate Your Birth Chart
          </Link>
        </section>

        <div className='mt-8 flex gap-4'>
          <Link
            href='/about/editorial-guidelines'
            className='text-zinc-400 hover:text-zinc-300 text-sm'
          >
            ← Editorial Guidelines
          </Link>
          <Link
            href='/grimoire/glossary'
            className='text-zinc-400 hover:text-zinc-300 text-sm'
          >
            Astrology Glossary →
          </Link>
        </div>
      </div>
    </div>
  );
}
