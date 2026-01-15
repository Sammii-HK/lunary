import { Metadata } from 'next';
import Link from 'next/link';
import {
  ZODIAC_SIGNS,
  SIGN_DISPLAY_NAMES,
  SIGN_SYMBOLS,
  SIGN_ELEMENTS,
} from '@/constants/seo/monthly-horoscope';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { renderJsonLd } from '@/lib/schema';

const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs | Lunary`,
    description: `Free monthly horoscopes for all 12 zodiac signs. Get your Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, and Pisces predictions for ${currentYear} and ${nextYear}.`,
    keywords: [
      'monthly horoscope',
      'free horoscope',
      `${currentYear} horoscope`,
      `${nextYear} horoscope`,
      'zodiac predictions',
      'astrology forecast',
      'aries horoscope',
      'taurus horoscope',
      'gemini horoscope',
      'cancer horoscope',
      'leo horoscope',
      'virgo horoscope',
      'libra horoscope',
      'scorpio horoscope',
      'sagittarius horoscope',
      'capricorn horoscope',
      'aquarius horoscope',
      'pisces horoscope',
    ],
    openGraph: {
      title: `Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs`,
      description: `Free monthly horoscopes for all 12 zodiac signs. Get your predictions for ${currentYear} and ${nextYear}.`,
      url: 'https://lunary.app/grimoire/horoscopes',
    },
    alternates: {
      canonical: 'https://lunary.app/grimoire/horoscopes',
    },
  };
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Monthly Horoscopes',
  description: 'Monthly horoscope predictions for all 12 zodiac signs',
  numberOfItems: 12,
  itemListElement: ZODIAC_SIGNS.map((sign, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: `${SIGN_DISPLAY_NAMES[sign]} Horoscope`,
    url: `https://lunary.app/grimoire/horoscopes/${sign}`,
  })),
};

const currentDate = new Date();
const currentMonth = currentDate
  .toLocaleString('en-US', { month: 'long' })
  .toLowerCase();

export default function GrimoireHoroscopesPage() {
  const heroContent = (
    <p className='text-lg text-zinc-400 max-w-3xl leading-relaxed'>
      Discover what the stars reveal each month for all 12 zodiac signs. Choose
      your sign below for love, career, health, and soul guidance.
    </p>
  );

  const sections = (
    <>
      <div id='monthly-grid' className='mb-12'>
        <h2 className='text-2xl font-light mb-6'>
          {currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)}{' '}
          {currentYear} Horoscopes
        </h2>
        <div className='grid md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {ZODIAC_SIGNS.map((sign) => (
            <Link
              key={sign}
              href={`/horoscope/${sign}/${currentYear}/${currentMonth}`}
              className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-all group'
            >
              <div className='text-4xl mb-3'>{SIGN_SYMBOLS[sign]}</div>
              <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-accent-300 transition-colors'>
                {SIGN_DISPLAY_NAMES[sign]}
              </h3>
              <p className='text-sm text-zinc-400'>
                {SIGN_ELEMENTS[sign]} Sign
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div
        id='personalized-cta'
        className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-950'
      >
        <h2 className='text-xl font-medium text-lunary-accent-300 mb-2'>
          Personalized Daily Insights
        </h2>
        <p className='text-zinc-300 mb-4'>
          Get horoscopes tailored to your complete birth chart, not just your
          Sun sign. Discover how the Moon, Rising, and planetary placements
          affect your daily life.
        </p>
        <Link
          href='/horoscope'
          className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900 hover:bg-lunary-primary-800 border border-lunary-primary-700 text-lunary-accent-300 font-medium transition-colors'
        >
          Get Your Personalized Horoscope
        </Link>
      </div>
    </>
  );

  const tableOfContents = [
    { label: 'Monthly Grid', href: '#monthly-grid' },
    { label: 'Personalized Forecast', href: '#personalized-cta' },
  ];

  return (
    <>
      {renderJsonLd(structuredData)}
      <SEOContentTemplate
        title={`Monthly Horoscopes ${currentYear} & ${nextYear}: All Zodiac Signs | Lunary`}
        h1='Monthly Horoscopes'
        description={`Free monthly horoscopes for all 12 zodiac signs. Get Aries through Pisces predictions for ${currentYear} and ${nextYear}.`}
        keywords={[
          'monthly horoscope',
          'free horoscope',
          `${currentYear} horoscope`,
          `${nextYear} horoscope`,
          'zodiac predictions',
          'astrology forecast',
        ]}
        canonicalUrl='https://lunary.app/grimoire/horoscopes'
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What are the monthly horoscopes?',
          answer:
            'Monthly horoscopes describe the celestial patterns for each zodiac sign, outlining opportunities, challenges, and growth themes.',
        }}
        intro='Browse every zodiac sign with Moon, Sun, and planetary highlights tailored to the current month. Use these monthly horoscopes as a guide to timing, intention-setting, and self-reflection.'
        tldr='Monthly horoscopes map the energetic themes of each sign for the month ahead. Choose your sign, check the focus areas, and align your actions with the cosmic weather.'
        meaning={`Monthly horoscopes offer a snapshot of how planetary transits influence each zodiac sign during a specific month. They are designed to highlight themes—love, career, health, and personal growth—so you can work with the energy rather than against it.

Think of a horoscope as a weather report: it does not dictate what you must do, but it helps you prepare. Use it to plan launches, reflect on relationships, or build routines that support your current season.

If you want a deeper read, combine your Sun sign with your Moon and Rising sign. The overlap often reveals which areas of life are most activated each month.

Horoscopes are most useful when you track them over time. Noticing repeated themes across months helps you move from passive reading to active, intentional choices.

For a simple approach, read the monthly horoscope, choose one focus area, and set a small, practical goal. When you treat the forecast as a prompt for action, the guidance becomes clearer and more grounded.`}
        howToWorkWith={[
          'Choose your sign and read the month’s focus areas.',
          'Note key themes and set 1–2 intentions aligned with them.',
          'Check lucky days or power colors as timing cues.',
          'Use the horoscope as a reflection prompt, not a fixed outcome.',
          'Revisit mid‑month to see how the themes are unfolding.',
        ]}
        rituals={[
          'Set a monthly intention on the new moon with a short journal entry.',
          'Light a candle in your sign’s element color for clarity.',
          'Create a simple altar for the month’s focus theme.',
          'End the month with a gratitude list and release ritual.',
        ]}
        journalPrompts={[
          'What theme stands out most for me this month?',
          'Where can I lean into growth instead of resistance?',
          'What action will make the biggest difference right now?',
          'How does this month’s energy show up in relationships?',
        ]}
        tables={[
          {
            title: 'Using Monthly Horoscopes',
            headers: ['Step', 'How to Apply'],
            rows: [
              ['Scan', 'Read your sign and note the main theme.'],
              ['Plan', 'Pick 1–2 actions aligned with the theme.'],
              ['Track', 'Journal weekly to observe changes.'],
              ['Adjust', 'Revisit mid‑month and refine your focus.'],
            ],
          },
        ]}
        faqs={[
          {
            question: 'Are monthly horoscopes accurate?',
            answer:
              'They are a broad energetic guide based on your Sun sign. For deeper accuracy, use your full birth chart.',
          },
          {
            question: 'How should I use a monthly horoscope?',
            answer:
              'Use it as a reflection tool. Identify themes, set intentions, and revisit them as the month unfolds.',
          },
          {
            question: 'Do I need my birth time?',
            answer:
              'Not for a Sun‑sign horoscope, but your birth time improves accuracy for personalized forecasts.',
          },
          {
            question: 'Should I read my Moon or Rising sign too?',
            answer:
              'Yes. Many people find the Rising sign reflects external events, while the Moon sign reflects emotions and inner life.',
          },
          {
            question: 'Is this the same as daily horoscopes?',
            answer:
              'Monthly horoscopes focus on broader themes and timing. Daily horoscopes are more immediate and short‑term.',
          },
        ]}
        internalLinks={[
          { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
          { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
          { text: 'Horoscope Hub', href: '/horoscope' },
        ]}
        heroContent={heroContent}
      >
        {sections}
      </SEOContentTemplate>
    </>
  );
}
