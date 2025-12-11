import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { createFAQPageSchema, renderJsonLd } from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Astrology for Beginners: Complete Introduction Guide | Lunary',
  description:
    'Learn astrology from scratch. Understand zodiac signs, planets, houses, aspects, and birth charts. Free beginner-friendly guide with clear explanations.',
  keywords: [
    'astrology for beginners',
    'learn astrology',
    'astrology basics',
    'how to read birth chart',
    'zodiac signs explained',
  ],
  openGraph: {
    title: 'Astrology for Beginners | Lunary',
    description: 'Your complete introduction to astrology fundamentals.',
    url: 'https://lunary.app/grimoire/beginners',
  },
  alternates: { canonical: 'https://lunary.app/grimoire/beginners' },
};

const faqs = [
  {
    question: 'Is astrology real?',
    answer:
      'Astrology is a symbolic system used for self-reflection and understanding patterns in life. While not a predictive science, millions find it a valuable tool for self-awareness and navigating life transitions.',
  },
  {
    question: 'What sign am I?',
    answer:
      'Your "sign" typically refers to your Sun sign—determined by your birth date. However, you have a Moon sign, Rising sign, and placements in all 12 signs. Your full picture requires a birth chart.',
  },
  {
    question: 'How accurate is astrology?',
    answer:
      'Astrology works best as a reflective tool rather than fortune-telling. The astronomical data (planet positions) is extremely accurate. Interpretation varies by tradition and practitioner.',
  },
];

const sections = [
  {
    title: 'The 12 Zodiac Signs',
    description:
      'The zodiac is divided into 12 signs, each with distinct personality traits, strengths, and challenges.',
    link: '/grimoire/zodiac',
    items: [
      {
        emoji: '♈',
        name: 'Aries',
        dates: 'Mar 21 - Apr 19',
        trait: 'Bold, pioneering',
      },
      {
        emoji: '♉',
        name: 'Taurus',
        dates: 'Apr 20 - May 20',
        trait: 'Grounded, sensual',
      },
      {
        emoji: '♊',
        name: 'Gemini',
        dates: 'May 21 - Jun 20',
        trait: 'Curious, adaptable',
      },
      {
        emoji: '♋',
        name: 'Cancer',
        dates: 'Jun 21 - Jul 22',
        trait: 'Nurturing, intuitive',
      },
      {
        emoji: '♌',
        name: 'Leo',
        dates: 'Jul 23 - Aug 22',
        trait: 'Creative, confident',
      },
      {
        emoji: '♍',
        name: 'Virgo',
        dates: 'Aug 23 - Sep 22',
        trait: 'Analytical, helpful',
      },
      {
        emoji: '♎',
        name: 'Libra',
        dates: 'Sep 23 - Oct 22',
        trait: 'Harmonious, diplomatic',
      },
      {
        emoji: '♏',
        name: 'Scorpio',
        dates: 'Oct 23 - Nov 21',
        trait: 'Intense, transformative',
      },
      {
        emoji: '♐',
        name: 'Sagittarius',
        dates: 'Nov 22 - Dec 21',
        trait: 'Adventurous, philosophical',
      },
      {
        emoji: '♑',
        name: 'Capricorn',
        dates: 'Dec 22 - Jan 19',
        trait: 'Ambitious, disciplined',
      },
      {
        emoji: '♒',
        name: 'Aquarius',
        dates: 'Jan 20 - Feb 18',
        trait: 'Innovative, humanitarian',
      },
      {
        emoji: '♓',
        name: 'Pisces',
        dates: 'Feb 19 - Mar 20',
        trait: 'Empathic, dreamy',
      },
    ],
  },
];

const concepts = [
  {
    title: 'The Planets',
    description:
      'Each planet represents a different type of energy and life area.',
    link: '/grimoire/astronomy/planets',
    examples: [
      'Sun = Identity and ego',
      'Moon = Emotions and instincts',
      'Mercury = Communication and thinking',
      'Venus = Love and values',
      'Mars = Action and desire',
    ],
  },
  {
    title: 'The Houses',
    description:
      'The 12 houses represent different areas of life where planetary energy manifests.',
    link: '/grimoire/houses',
    examples: [
      '1st House = Self and appearance',
      '4th House = Home and family',
      '7th House = Relationships',
      '10th House = Career and reputation',
    ],
  },
  {
    title: 'The Aspects',
    description:
      'Aspects are angular relationships between planets that create harmony or tension.',
    link: '/grimoire/aspects',
    examples: [
      'Conjunction (0°) = Fusion of energies',
      'Trine (120°) = Easy flow',
      'Square (90°) = Creative tension',
      'Opposition (180°) = Balance needed',
    ],
  },
  {
    title: 'Elements & Modalities',
    description:
      'Signs are grouped by element (Fire, Earth, Air, Water) and modality (Cardinal, Fixed, Mutable).',
    link: '/grimoire/zodiac',
    examples: [
      'Fire signs = Passionate, energetic',
      'Earth signs = Practical, grounded',
      'Air signs = Intellectual, social',
      'Water signs = Emotional, intuitive',
    ],
  },
];

export default function BeginnersGuidePage() {
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
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Beginners Guide' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            Astrology for Beginners
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            Welcome to astrology. This guide will teach you the fundamentals:
            signs, planets, houses, and how they work together in your birth
            chart.
          </p>
        </header>

        <nav className='mb-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-lg font-medium mb-4'>Table of Contents</h2>
          <ul className='space-y-2 text-zinc-400'>
            <li>
              <a href='#zodiac' className='hover:text-lunary-primary-300'>
                1. The 12 Zodiac Signs
              </a>
            </li>
            <li>
              <a href='#planets' className='hover:text-lunary-primary-300'>
                2. The Planets
              </a>
            </li>
            <li>
              <a href='#houses' className='hover:text-lunary-primary-300'>
                3. The Houses
              </a>
            </li>
            <li>
              <a href='#aspects' className='hover:text-lunary-primary-300'>
                4. The Aspects
              </a>
            </li>
            <li>
              <a href='#elements' className='hover:text-lunary-primary-300'>
                5. Elements & Modalities
              </a>
            </li>
            <li>
              <a href='#faq' className='hover:text-lunary-primary-300'>
                6. FAQ
              </a>
            </li>
          </ul>
        </nav>

        <section id='zodiac' className='mb-12 scroll-mt-24'>
          <h2 className='text-2xl font-light mb-4'>1. The 12 Zodiac Signs</h2>
          <p className='text-zinc-400 mb-6'>
            The zodiac is a belt of sky divided into 12 equal signs. Each sign
            has unique characteristics that color how planetary energy
            expresses.
          </p>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
            {sections[0].items.map((sign) => (
              <Link
                key={sign.name}
                href={`/grimoire/zodiac/${sign.name.toLowerCase()}`}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
              >
                <div className='text-xl mb-1'>{sign.emoji}</div>
                <div className='font-medium text-zinc-200'>{sign.name}</div>
                <div className='text-xs text-zinc-500'>{sign.dates}</div>
                <div className='text-xs text-zinc-400 mt-1'>{sign.trait}</div>
              </Link>
            ))}
          </div>
          <div className='mt-4'>
            <Link
              href='/grimoire/zodiac'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Learn more about zodiac signs →
            </Link>
          </div>
        </section>

        {concepts.map((concept, index) => (
          <section
            key={concept.title}
            id={concept.title.toLowerCase().replace(/\s+/g, '')}
            className='mb-12 scroll-mt-24'
          >
            <h2 className='text-2xl font-light mb-4'>
              {index + 2}. {concept.title}
            </h2>
            <p className='text-zinc-400 mb-4'>{concept.description}</p>
            <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 mb-4'>
              <ul className='space-y-2'>
                {concept.examples.map((example, i) => (
                  <li key={i} className='text-zinc-300 text-sm'>
                    {example}
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={concept.link}
              className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
            >
              Explore {concept.title.toLowerCase()} →
            </Link>
          </section>
        ))}

        <section id='faq' className='mb-12 scroll-mt-24'>
          <h2 className='text-2xl font-light mb-6'>
            6. Frequently Asked Questions
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

        <section className='p-8 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20 text-center'>
          <h2 className='text-2xl font-light text-zinc-100 mb-4'>
            Ready to Explore Your Chart?
          </h2>
          <p className='text-zinc-300 mb-6 max-w-xl mx-auto'>
            Now that you understand the basics, generate your personal birth
            chart to see how these elements combine uniquely for you.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Calculate Your Birth Chart
            <ArrowRight className='w-5 h-5' />
          </Link>
        </section>
      </div>
    </div>
  );
}
