import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createFAQPageSchema, renderJsonLd } from '@/lib/schema';

// Helper for ordinal suffix
const getOrdinalSuffix = (n: number) =>
  n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';

export const metadata: Metadata = {
  title: 'Birth Chart Example - How to Read Your Natal Chart | Lunary',
  description:
    'Learn how to read a birth chart with this interactive example. Understand planets, signs, houses, and aspects in a real natal chart. Free birth chart guide.',
  keywords: [
    'birth chart example',
    'how to read birth chart',
    'natal chart example',
    'birth chart interpretation',
    'astrology chart guide',
  ],
  openGraph: {
    title: 'Birth Chart Example - How to Read Your Natal Chart',
    description: 'Learn to interpret a birth chart with this visual guide.',
    url: 'https://lunary.app/birth-chart/example',
  },
  alternates: { canonical: 'https://lunary.app/birth-chart/example' },
};

const faqs = [
  {
    question: 'What is a birth chart?',
    answer:
      'A birth chart (or natal chart) is a map of where all the planets were at the exact moment you were born, viewed from your birth location. It forms the foundation of personal astrology.',
  },
  {
    question: 'Why do I need my exact birth time?',
    answer:
      'Your birth time determines your Ascendant (rising sign) and house placements. Without it, these crucial elements cannot be calculated accurately. The Ascendant changes approximately every 2 hours.',
  },
  {
    question: 'What do the houses represent?',
    answer:
      'The 12 houses represent different life areas: self-image, finances, communication, home, creativity, health, relationships, transformation, philosophy, career, community, and spirituality.',
  },
];

const chartElements = [
  {
    title: 'The Sun',
    symbol: '☉',
    meaning:
      'Your core identity, ego, and life purpose. The sign your Sun is in is your "star sign."',
    example:
      'Sun in Leo: Confident, creative, desires recognition and self-expression.',
    link: '/grimoire/astronomy/planets/sun',
  },
  {
    title: 'The Moon',
    symbol: '☽',
    meaning:
      'Your emotional nature, instincts, and what you need to feel secure.',
    example:
      'Moon in Cancer: Deeply nurturing, emotionally intuitive, needs home and family.',
    link: '/grimoire/astronomy/planets/moon',
  },
  {
    title: 'The Ascendant',
    symbol: 'ASC',
    meaning:
      'Your outward personality, first impressions, and physical appearance.',
    example:
      'Scorpio Rising: Intense presence, magnetic, perceived as mysterious.',
    link: '/grimoire/houses/1st-house',
  },
  {
    title: 'Mercury',
    symbol: '☿',
    meaning: 'How you think, communicate, and process information.',
    example:
      'Mercury in Virgo: Analytical, detail-oriented, precise communication.',
    link: '/grimoire/astronomy/planets/mercury',
  },
  {
    title: 'Venus',
    symbol: '♀',
    meaning: 'How you love, what you value, and your aesthetic preferences.',
    example:
      'Venus in Libra: Harmonious in love, values beauty and partnership.',
    link: '/grimoire/astronomy/planets/venus',
  },
  {
    title: 'Mars',
    symbol: '♂',
    meaning: 'How you take action, assert yourself, and express anger.',
    example:
      'Mars in Aries: Direct, competitive, initiates action immediately.',
    link: '/grimoire/astronomy/planets/mars',
  },
];

const houses = [
  {
    number: 1,
    name: 'Self',
    description: 'Identity, appearance, first impressions',
  },
  {
    number: 2,
    name: 'Resources',
    description: 'Money, possessions, self-worth',
  },
  {
    number: 3,
    name: 'Communication',
    description: 'Siblings, learning, local travel',
  },
  { number: 4, name: 'Home', description: 'Family, roots, private life' },
  {
    number: 5,
    name: 'Creativity',
    description: 'Romance, children, self-expression',
  },
  {
    number: 6,
    name: 'Health',
    description: 'Daily routines, service, wellness',
  },
  {
    number: 7,
    name: 'Partnerships',
    description: 'Marriage, business partners, open enemies',
  },
  {
    number: 8,
    name: 'Transformation',
    description: 'Shared resources, intimacy, death/rebirth',
  },
  {
    number: 9,
    name: 'Philosophy',
    description: 'Higher education, travel, beliefs',
  },
  {
    number: 10,
    name: 'Career',
    description: 'Public image, reputation, life direction',
  },
  {
    number: 11,
    name: 'Community',
    description: 'Friends, groups, hopes and wishes',
  },
  {
    number: 12,
    name: 'Spirituality',
    description: 'Subconscious, hidden matters, karma',
  },
];

export default function BirthChartExamplePage() {
  const faqSchema = createFAQPageSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/' className='hover:text-zinc-300'>
            Home
          </Link>
          <span>/</span>
          <Link href='/birth-chart' className='hover:text-zinc-300'>
            Birth Chart
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>Example</span>
        </nav>

        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            How to Read a Birth Chart
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            Learn to interpret your natal chart with this visual guide.
            Understand what each planet, sign, and house means in your cosmic
            blueprint.
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>The Planets: What</h2>
          <p className='text-zinc-400 mb-6'>
            Planets represent different types of energy and drives. Each planet
            governs specific aspects of your personality and life.
          </p>
          <div className='grid md:grid-cols-2 gap-4'>
            {chartElements.map((element) => (
              <Link
                key={element.title}
                href={element.link}
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors group'
              >
                <div className='flex items-center gap-3 mb-3'>
                  <span className='text-2xl'>{element.symbol}</span>
                  <h3 className='text-lg font-medium group-hover:text-lunary-primary-300 transition-colors'>
                    {element.title}
                  </h3>
                </div>
                <p className='text-zinc-400 text-sm mb-2'>{element.meaning}</p>
                <p className='text-zinc-500 text-xs italic'>
                  {element.example}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>The Houses: Where</h2>
          <p className='text-zinc-400 mb-6'>
            Houses represent different areas of life. When a planet is in a
            house, that planetary energy manifests in that life area.
          </p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {houses.map((house) => (
              <Link
                key={house.number}
                href={`/grimoire/houses/${house.number}${getOrdinalSuffix(house.number)}-house`}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
              >
                <div className='text-2xl font-light text-lunary-primary-400 mb-1'>
                  {house.number}
                </div>
                <div className='text-sm font-medium text-zinc-200'>
                  {house.name}
                </div>
                <div className='text-xs text-zinc-500'>{house.description}</div>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>The Signs: How</h2>
          <p className='text-zinc-400 mb-6'>
            The zodiac sign a planet is in modifies how that planet's energy
            expresses. Think of the planet as the actor and the sign as the
            costume and style.
          </p>
          <Link
            href='/grimoire/zodiac'
            className='inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 text-zinc-300 transition-colors'
          >
            Explore All 12 Zodiac Signs
            <ArrowRight className='w-4 h-4' />
          </Link>
        </section>

        <section className='mb-12'>
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

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-4'>Learn More</h2>
          <div className='grid md:grid-cols-3 gap-4'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200'>Complete Birth Chart Guide</span>
            </Link>
            <Link
              href='/grimoire/placements'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200'>Planet in Sign Meanings</span>
            </Link>
            <Link
              href='/grimoire/glossary'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200'>Astrology Glossary</span>
            </Link>
          </div>
        </section>

        <section className='p-8 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20 text-center'>
          <h2 className='text-2xl font-light text-zinc-100 mb-4'>
            Generate Your Own Chart
          </h2>
          <p className='text-zinc-300 mb-6 max-w-xl mx-auto'>
            Enter your birth date, time, and location to create your personal
            birth chart and see exactly where each planet was when you were
            born.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Calculate Your Birth Chart Free
            <ArrowRight className='w-5 h-5' />
          </Link>
        </section>
      </div>
    </div>
  );
}
