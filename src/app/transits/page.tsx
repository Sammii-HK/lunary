import { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar,
  Moon,
  RotateCcw,
  Eclipse,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  createItemListSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title:
    'Astrological Transits Hub: Retrogrades, Eclipses, Moon Phases & Ingresses | Lunary',
  description:
    'Complete transit calendar hub for astrology. Track retrogrades, eclipses, moon phases, and planetary ingresses from 2025-2030. Free date tables and cosmic event tracking.',
  keywords: [
    'astrological transits',
    'mercury retrograde dates',
    'eclipse calendar',
    'moon phases',
    'planetary ingress',
    'retrograde schedule',
    '2025 astrology calendar',
    '2026 astrology calendar',
  ],
  openGraph: {
    title: 'Astrological Transits Hub | Lunary',
    description:
      'Track retrogrades, eclipses, moon phases, and planetary ingresses.',
    url: 'https://lunary.app/transits',
    type: 'website',
  },
  alternates: { canonical: 'https://lunary.app/transits' },
};

const transitCategories = [
  {
    title: 'Retrogrades',
    description:
      'Mercury, Venus, Mars, Jupiter, Saturn retrograde dates and meanings for 2025-2030.',
    href: '/grimoire/astronomy/retrogrades',
    icon: RotateCcw,
    color: 'lunary-primary',
  },
  {
    title: 'Eclipses',
    description:
      'Solar and lunar eclipse dates, visibility, and astrological significance.',
    href: '/grimoire/eclipses',
    icon: Eclipse,
    color: 'lunary-rose',
  },
  {
    title: 'Moon Calendar',
    description: 'Full moon, new moon, and all lunar phases by month and year.',
    href: '/moon-calendar',
    icon: Moon,
    color: 'lunary-secondary',
  },
  {
    title: 'Yearly Transits',
    description:
      'Major planetary transits, ingresses, and cosmic events by year.',
    href: '/grimoire/transits',
    icon: Calendar,
    color: 'lunary-accent',
  },
];

const years = [2025, 2026, 2027, 2028, 2029, 2030];

const faqs = [
  {
    question: 'What are astrological transits?',
    answer:
      'Transits are the ongoing movements of planets through the zodiac. As planets move, they form angles (aspects) to the positions in your birth chart, triggering events and opportunities.',
  },
  {
    question: 'How do retrogrades affect me?',
    answer:
      "When a planet appears to move backward (retrograde), its energy turns inward. It's a time to review, reflect, and revise matters related to that planet rather than start new things.",
  },
  {
    question: 'Why are eclipses significant in astrology?',
    answer:
      'Eclipses are powerful lunations near the lunar nodes. They mark fateful turning points, bringing major beginnings (solar eclipses) or culminations (lunar eclipses) in the houses they activate.',
  },
  {
    question: 'How can I track transits to my birth chart?',
    answer:
      'Calculate your birth chart on Lunary, then check your daily horoscope to see which transits are currently affecting your personal placements.',
  },
];

export default function TransitsHubPage() {
  const itemListSchema = createItemListSchema({
    name: 'Astrological Transit Categories',
    description:
      'Complete transit tracking including retrogrades, eclipses, moon phases, and planetary ingresses.',
    url: 'https://lunary.app/transits',
    items: transitCategories.map((cat) => ({
      name: cat.title,
      url: `https://lunary.app${cat.href}`,
      description: cat.description,
    })),
  });

  const faqSchema = createFAQPageSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(itemListSchema)}
      {renderJsonLd(faqSchema)}
      <div className='max-w-5xl mx-auto px-4 py-8 md:py-12'>
        <Breadcrumbs items={[{ label: 'Transits' }]} />

        <header className='mb-12'>
          <h1 className='text-2xl md:text-5xl font-light mb-4'>
            Astrological Transit Calendar
          </h1>
          <p className='text-base md:text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            Track every major cosmic event from 2025-2030. Retrogrades,
            eclipses, moon phases, planetary ingresses—all dates freely
            available to help you plan with cosmic awareness.
          </p>
        </header>

        <section className='grid md:grid-cols-2 gap-6 mb-16'>
          {transitCategories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.title}
                href={category.href}
                className='group p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 transition-all'
              >
                <div className='flex items-start gap-4'>
                  <div
                    className={`p-3 rounded-lg bg-${category.color}-900/20 text-${category.color}-400`}
                  >
                    <Icon className='w-6 h-6' />
                  </div>
                  <div className='flex-1'>
                    <h2 className='text-xl font-medium mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                      {category.title}
                    </h2>
                    <p className='text-zinc-400 text-sm'>
                      {category.description}
                    </p>
                  </div>
                  <ArrowRight className='w-5 h-5 text-zinc-600 group-hover:text-lunary-primary-400 transition-colors' />
                </div>
              </Link>
            );
          })}
        </section>

        <section className='mb-16'>
          <h2 className='text-2xl font-light mb-6'>Browse by Year</h2>
          <div className='grid grid-cols-3 md:grid-cols-6 gap-3'>
            {years.map((year) => (
              <Link
                key={year}
                href={`/grimoire/transits#year-${year}`}
                className='p-4 text-center rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all'
              >
                <span className='text-lg font-medium'>{year}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-16'>
          <h2 className='text-2xl font-light mb-6'>
            Frequently Asked Questions
          </h2>
          <div className='space-y-4'>
            {faqs.map((faq, index) => (
              <div
                key={index}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/30'
              >
                <h3 className='text-lg font-medium mb-2 text-zinc-100'>
                  {faq.question}
                </h3>
                <p className='text-zinc-400'>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className='p-8 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
          <div className='flex items-start gap-4'>
            <Star className='w-8 h-8 text-lunary-primary-400 flex-shrink-0' />
            <div>
              <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
                Personalised Transit Readings
              </h2>
              <p className='text-zinc-300 mb-4'>
                See how current transits affect your personal birth chart.
                Calculate your chart and get daily insights tailored to your
                cosmic blueprint.
              </p>
              <Link
                href='/birth-chart'
                className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
              >
                Calculate Your Birth Chart
                <ArrowRight className='w-4 h-4' />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
