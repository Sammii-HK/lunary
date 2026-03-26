import { Metadata } from 'next';
import Link from 'next/link';
import {
  createFAQPageSchema,
  renderJsonLd,
  createBreadcrumbSchema,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Astronomy vs Astrology: What Is the Difference? | Lunary',
  description:
    'Understand the key differences between astronomy and astrology. One is a science, the other a symbolic system. Learn how they relate and diverge.',
  keywords: [
    'astronomy vs astrology',
    'difference between astronomy and astrology',
    'is astrology a science',
    'astronomy definition',
    'astrology meaning',
  ],
  openGraph: {
    title: 'Astronomy vs Astrology: What Is the Difference?',
    description: 'Understand how astronomy and astrology differ and relate.',
    url: 'https://lunary.app/grimoire/astronomy-vs-astrology',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/astronomy-vs-astrology',
  },
};

const faqs = [
  {
    question: 'Is astrology a science?',
    answer:
      'Astrology is not a science in the modern sense—it does not use the scientific method to make testable predictions. However, it uses accurate astronomical data and has a rich philosophical and psychological tradition as a symbolic interpretive system.',
  },
  {
    question: 'Did astronomers used to practice astrology?',
    answer:
      'Yes. Until the 17th century, astronomy and astrology were largely unified. Many famous astronomers including Kepler and Galileo practiced astrology. The disciplines separated during the Scientific Revolution.',
  },
  {
    question: 'Does NASA use astrology?',
    answer:
      'No. NASA is a scientific organization focused on astronomy and space exploration. However, NASA does provide ephemeris data that astrologers use to calculate precise planetary positions.',
  },
  {
    question: 'Can astrology and astronomy coexist?',
    answer:
      'Many people appreciate both. You can value astronomy as a science explaining the physical universe while also finding astrology meaningful as a reflective and symbolic practice. Lunary uses astronomical precision to power astrological insights.',
  },
];

const comparisons = [
  {
    aspect: 'Definition',
    astronomy:
      'The scientific study of celestial objects, space, and the physical universe.',
    astrology:
      'A symbolic system interpreting the positions of celestial bodies as meaningful for human life.',
  },
  {
    aspect: 'Method',
    astronomy:
      'Scientific method: observation, hypothesis, testing, peer review.',
    astrology:
      'Symbolic interpretation based on ancient traditions and psychological frameworks.',
  },
  {
    aspect: 'Claims',
    astronomy:
      'Describes physical reality: distances, compositions, movements, cosmic evolution.',
    astrology:
      'Suggests correlations between celestial patterns and human experience.',
  },
  {
    aspect: 'Verification',
    astronomy: 'Predictions tested through observation and measurement.',
    astrology:
      'Personal relevance assessed through reflection and pattern recognition.',
  },
  {
    aspect: 'Purpose',
    astronomy: 'Understand the physical universe and our place in it.',
    astrology:
      'Provide frameworks for self-reflection, timing, and life navigation.',
  },
  {
    aspect: 'Practitioners',
    astronomy: 'Scientists, researchers, academics.',
    astrology: 'Astrologers, counselors, spiritual practitioners, enthusiasts.',
  },
];

export default function AstronomyVsAstrologyPage() {
  const faqSchema = createFAQPageSchema(
    faqs.map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })),
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          {
            name: 'Astronomy Vs Astrology',
            url: '/grimoire/astronomy-vs-astrology',
          },
        ]),
      )}
      <div className='max-w-5xl mx-auto px-4 py-12'>
        <Breadcrumbs
          items={[
            { label: 'Grimoire', href: '/grimoire' },
            { label: 'Astronomy vs Astrology' },
          ]}
        />

        <header className='mb-12'>
          <h1 className='text-4xl md:text-5xl font-light mb-4'>
            Astronomy vs Astrology
          </h1>
          <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl'>
            These two disciplines share ancient roots and look at the same sky,
            but approach it in fundamentally different ways. Here is how they
            differ—and where they connect.
          </p>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>Key Differences</h2>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  <th className='text-left py-3 px-4 text-zinc-400 font-medium'>
                    Aspect
                  </th>
                  <th className='text-left py-3 px-4 text-zinc-400 font-medium'>
                    Astronomy
                  </th>
                  <th className='text-left py-3 px-4 text-zinc-400 font-medium'>
                    Astrology
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, index) => (
                  <tr
                    key={index}
                    className='border-b border-zinc-800/50 hover:bg-zinc-900/30'
                  >
                    <td className='py-4 px-4 font-medium text-lunary-primary-300'>
                      {row.aspect}
                    </td>
                    <td className='py-4 px-4 text-zinc-300 text-sm'>
                      {row.astronomy}
                    </td>
                    <td className='py-4 px-4 text-zinc-300 text-sm'>
                      {row.astrology}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='mb-12 p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
          <h2 className='text-2xl font-light mb-4'>Historical Connection</h2>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            For most of human history, astronomy and astrology were unified.
            Ancient Babylonians, Greeks, and Arabs studied the stars both to
            understand physical reality and to find meaning in celestial
            patterns.
          </p>
          <p className='text-zinc-300 leading-relaxed mb-4'>
            The separation began during the Scientific Revolution (16th-17th
            centuries) as the scientific method became the standard for
            validating knowledge claims. Astronomy evolved into a pure science,
            while astrology continued as a symbolic practice.
          </p>
          <p className='text-zinc-400 leading-relaxed'>
            Notable figures who practiced both include Ptolemy, Johannes Kepler,
            and Tycho Brahe. Today, they are distinct disciplines—but both still
            look at the same magnificent sky.
          </p>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-6'>
            How Lunary Uses Astronomical Accuracy
          </h2>
          <p className='text-zinc-300 leading-relaxed mb-6'>
            Lunary sits at the intersection of scientific precision and symbolic
            meaning. We believe that accurate data makes for better reflection.
          </p>
          <div className='grid md:grid-cols-2 gap-6 mb-6'>
            <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
                Astronomical Precision
              </h3>
              <p className='text-zinc-400 text-sm mb-3'>
                We use the Astronomy Engine library to calculate planetary
                positions to arcsecond precision—the same accuracy as scientific
                applications. Our data matches NASA ephemeris.
              </p>
              <ul className='text-zinc-500 text-xs space-y-1'>
                <li>• Real-time planetary positions</li>
                <li>• Accurate moon phase calculations</li>
                <li>• Precise eclipse and retrograde timing</li>
                <li>• Location-specific house calculations</li>
              </ul>
            </div>
            <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
                Symbolic Interpretation
              </h3>
              <p className='text-zinc-400 text-sm mb-3'>
                We apply this precise astronomical data through the lens of
                Western astrological tradition, offering interpretations for
                self-reflection and personal insight.
              </p>
              <ul className='text-zinc-500 text-xs space-y-1'>
                <li>• Zodiac sign meanings and traits</li>
                <li>• Planetary symbolism and archetypes</li>
                <li>• House-based life area interpretations</li>
                <li>• Transit-based timing guidance</li>
              </ul>
            </div>
          </div>
          <div className='p-5 rounded-xl border border-lunary-primary-700/50 bg-lunary-primary-900/10'>
            <p className='text-zinc-300 text-sm'>
              <strong className='text-lunary-primary-300'>Our position:</strong>{' '}
              We do not claim astrology is science. We offer it as a framework
              for self-reflection, using the most accurate astronomical data
              available. You are always free to take what resonates and leave
              what doesn&apos;t.
            </p>
          </div>
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
          <h2 className='text-2xl font-light mb-4'>Continue Exploring</h2>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200 font-medium'>The Planets</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Astronomical data + astrological meaning
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200 font-medium'>Zodiac Signs</span>
              <p className='text-xs text-zinc-500 mt-1'>
                The 12 signs of the zodiac
              </p>
            </Link>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200 font-medium'>
                Birth Chart Guide
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Learn to read your chart
              </p>
            </Link>
            <Link
              href='/grimoire/glossary'
              className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-200 font-medium'>
                Astrology Glossary
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Terms and definitions
              </p>
            </Link>
          </div>
        </section>

        <section className='p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Experience Both Perspectives
          </h2>
          <p className='text-zinc-300 mb-4'>
            See your birth chart calculated with astronomical precision,
            interpreted through astrological tradition.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/30 hover:bg-lunary-primary-900/50 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            Calculate Your Birth Chart
          </Link>
        </section>
      </div>
    </div>
  );
}
