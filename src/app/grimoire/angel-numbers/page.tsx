import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { getAllAngelNumbers } from '@/lib/angel-numbers/getAngelNumber';

// 30-day ISR revalidation
export const revalidate = 2592000;
export const metadata: Metadata = {
  title: 'Angel Numbers Guide: Meanings of 111, 222, 333 & More | Lunary',
  description:
    'Complete guide to angel numbers and their spiritual meanings. Discover what 111, 222, 333, 444, 555, 666, 777, 888, 999 and other repeating numbers mean.',
  keywords: [
    'angel numbers',
    '111 meaning',
    '222 meaning',
    '333 meaning',
    '444 meaning',
    '555 meaning',
    'repeating numbers',
    'angel number guide',
    'spiritual numbers',
  ],
  openGraph: {
    title: 'Angel Numbers Guide: Complete Meanings | Lunary',
    description:
      'Discover the spiritual meaning of angel numbers like 111, 222, 333 and more.',
    url: 'https://lunary.app/grimoire/angel-numbers',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/numerology',
        width: 1200,
        height: 630,
        alt: 'Angel Numbers Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angel Numbers Guide: Complete Meanings | Lunary',
    description:
      'Discover the spiritual meaning of angel numbers and repeating number sequences.',
    images: ['/api/og/cosmic'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/angel-numbers',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const faqs = [
  {
    question: 'What are angel numbers?',
    answer:
      'Angel numbers are repeating number sequences (like 111, 222, 333) that many people treat as spiritual nudges. The deeper meanings live on each number page.',
  },
  {
    question: 'Why do I keep seeing repeating numbers?',
    answer:
      'Repetition is the signal. Note when it appears, how you feel, and then open the specific number page for the full meaning.',
  },
  {
    question: 'How should I respond when I see an angel number?',
    answer:
      'Pause, notice the moment, and follow the number to its page for the full interpretation.',
  },
];

const numberTeasers: Record<string, string> = {
  '000': 'A reset, a clean slate, and open potential.',
  '111': 'A spark of clarity and a fresh start.',
  '222': 'Reassurance, patience, and trust in unfolding timing.',
  '333': 'Support around you and a creative lift.',
  '444': 'Grounding energy and steady protection.',
  '555': 'A shift in motion and freedom to move.',
  '666': 'A gentle course correction back to center.',
  '777': 'Inner knowing, spiritual alignment, and luck.',
  '888': 'Momentum, reward, and abundance in flow.',
  '999': 'Closure, release, and the next chapter.',
  '1010': 'Alignment, momentum, stepping into the next chapter.',
  '1212': 'Trust your timing and move with faith.',
  '1111': 'Awakening, alignment, and the next clear step.',
  '2222': 'Steady balance and trust in the long view.',
  '3333': 'Creative momentum and support around you.',
  '4444': 'Grounded protection and solid foundations.',
  '5555': 'A bold shift and freedom to move.',
  '7777': 'Inner wisdom, study, and spiritual depth.',
  '8888': 'Abundance, leadership, and results landing.',
  '9999': 'Completion, release, and the next chapter.',
  '1313': 'Growth through change and rebuilding stronger.',
  '1414': 'Focus, structure, and steady priorities.',
  '1515': 'Decisive change and aligned choices.',
  '1717': 'Self-trust, recognition, and forward motion.',
  '1818': 'Leadership, progress, and material momentum.',
  '1919': 'Closing a cycle and opening a new one.',
  '2020': 'Clear perspective and balanced direction.',
  '1234': 'Steps in the right direction, progressive growth.',
};

export default function AngelNumbersIndexPage() {
  const allNumbers = getAllAngelNumbers();
  const numbers = allNumbers
    .map((n) => n.number)
    .sort((a, b) => parseInt(a) - parseInt(b));

  // Triple repeating (111, 222, 333, etc.)
  const tripleNumbers = allNumbers
    .filter(
      (n) =>
        n.number.length === 3 &&
        n.number[0] === n.number[1] &&
        n.number[1] === n.number[2],
    )
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // Quadruple repeating (1111, 2222, 3333, etc.)
  const quadrupleNumbers = allNumbers
    .filter(
      (n) =>
        n.number.length === 4 &&
        n.number[0] === n.number[1] &&
        n.number[1] === n.number[2] &&
        n.number[2] === n.number[3],
    )
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // Sequential patterns (123, 234, 345, 456, 567, 678, 789, 1234)
  const sequentialPatterns = [
    '123',
    '234',
    '345',
    '456',
    '567',
    '678',
    '789',
    '1234',
  ];
  const sequentialNumbers = allNumbers
    .filter((n) => sequentialPatterns.includes(n.number))
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // X0X0 patterns (1010, 2020, 3030, etc.)
  const x0x0Numbers = allNumbers
    .filter(
      (n) =>
        n.number.length === 4 &&
        n.number[1] === '0' &&
        n.number[3] === '0' &&
        n.number[0] === n.number[2],
    )
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // Mirror/alternating patterns (1212, 1313, 1414, 1515, 1717, 1818, 1919, 2121, 2323, etc.)
  const mirrorNumbers = allNumbers
    .filter(
      (n) =>
        n.number.length === 4 &&
        n.number[0] === n.number[2] &&
        n.number[1] === n.number[3] &&
        n.number[0] !== n.number[1] &&
        n.number[1] !== '0', // Exclude X0X0 patterns
    )
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  // Other patterns (1122, 1221, etc.)
  const categorized = new Set([
    ...tripleNumbers.map((n) => n.number),
    ...quadrupleNumbers.map((n) => n.number),
    ...sequentialNumbers.map((n) => n.number),
    ...x0x0Numbers.map((n) => n.number),
    ...mirrorNumbers.map((n) => n.number),
  ]);
  const otherNumbers = allNumbers
    .filter((n) => !categorized.has(n.number))
    .sort((a, b) => parseInt(a.number) - parseInt(b.number));

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Angel Numbers | Lunary'
        h1='Angel Numbers: Divine Messages in Repeating Numbers'
        description='Angel numbers are repeating number sequences believed to carry divine guidance. When you repeatedly see certain numbers, the universe may be sending you a message.'
        keywords={[
          'angel numbers',
          '111 meaning',
          '222 meaning',
          '333 meaning',
          'repeating numbers',
        ]}
        canonicalUrl='https://lunary.app/grimoire/angel-numbers'
        whatIs={{
          question: 'What are Angel Numbers?',
          answer:
            'Angel numbers are repeating number sequences (like 111, 222, 333) that many people read as spiritual nudges. The hub is a map - click a number to read its full meaning.',
        }}
        tldr='Angel numbers are repeating sequences. Click a number below to get the full meaning, including love, work, and spiritual themes.'
        meaning={`Angel numbers are repeating sequences that stand out in daily life. The meaning lives on each number page, where you can explore the deeper themes for that specific sequence.`}
        howToWorkWith={[
          'Notice the number when it repeats',
          'Check the timing and your emotional state',
          'Open the number page for the full meaning',
        ]}
        relatedItems={[
          {
            name: 'Life Path Numbers',
            href: '/grimoire/life-path',
            type: 'Numerology',
          },
          {
            name: 'Mirror Hours',
            href: '/grimoire/mirror-hours',
            type: 'Numerology',
          },
          {
            name: 'Double Hours',
            href: '/grimoire/double-hours',
            type: 'Numerology',
          },
          {
            name: 'Soul Urge Numbers',
            href: '/grimoire/numerology/soul-urge',
            type: 'Numerology',
          },
          {
            name: 'Numerology Overview',
            href: '/grimoire/numerology',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          { text: 'Numerology Overview', href: '/grimoire/numerology' },
          { text: 'Life Path Calculator', href: '/grimoire/life-path' },
          { text: 'Daily Horoscope', href: '/horoscope' },
          { text: 'Tarot Reading', href: '/tarot' },
        ]}
        ctaText='Want personalized spiritual insights for your journey?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Triple Number Sequences
          </h2>
          <p className='text-zinc-400 mb-6'>
            Triple numbers (111, 222, 333, etc.) are the most commonly
            recognized angel numbers. Click a number to see its full meaning.
          </p>
          <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
            {tripleNumbers.map((data) => (
              <Link
                key={data.number}
                href={`/grimoire/angel-numbers/${data.number}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
              >
                <span className='text-2xl font-light text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                  {data.number}
                </span>
                <p className='text-xs text-zinc-400 mt-2 line-clamp-2'>
                  {numberTeasers[data.number] || data.coreMeaning}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {quadrupleNumbers.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Quadruple Number Sequences
            </h2>
            <p className='text-zinc-400 mb-6'>
              Quadruple numbers (1111, 2222, etc.) amplify the energy of their
              single digit to master levels.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
              {quadrupleNumbers.map((data) => (
                <Link
                  key={data.number}
                  href={`/grimoire/angel-numbers/${data.number}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-secondary-600 transition-all text-center'
                >
                  <span className='text-2xl font-light text-lunary-secondary-400 group-hover:text-lunary-secondary-300 transition-colors'>
                    {data.number}
                  </span>
                  <p className='text-xs text-zinc-400 mt-2 line-clamp-2'>
                    {numberTeasers[data.number] || data.coreMeaning}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {sequentialNumbers.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Sequential Patterns
            </h2>
            <p className='text-zinc-400 mb-6'>
              Sequential numbers (123, 234, 345, etc.) represent step-by-step
              progress and natural growth patterns.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
              {sequentialNumbers.map((data) => (
                <Link
                  key={data.number}
                  href={`/grimoire/angel-numbers/${data.number}`}
                  className='group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-success-600 transition-all text-center'
                >
                  <span className='text-xl font-light text-lunary-success-400 group-hover:text-lunary-success-300 transition-colors'>
                    {data.number}
                  </span>
                  <p className='text-[11px] text-zinc-400 mt-2 line-clamp-2'>
                    {numberTeasers[data.number] || data.coreMeaning}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {x0x0Numbers.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Divine Amplification Patterns
            </h2>
            <p className='text-zinc-400 mb-6'>
              X0X0 patterns (1010, 2020, 3030, etc.) combine number energy with
              zeros that amplify divine connection and infinite potential.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
              {x0x0Numbers.map((data) => (
                <Link
                  key={data.number}
                  href={`/grimoire/angel-numbers/${data.number}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-accent-600 transition-all text-center'
                >
                  <span className='text-2xl font-light text-lunary-accent-400 group-hover:text-lunary-accent-300 transition-colors'>
                    {data.number}
                  </span>
                  <p className='text-xs text-zinc-400 mt-2 line-clamp-2'>
                    {numberTeasers[data.number] || data.coreMeaning}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {mirrorNumbers.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Mirror & Alternating Patterns
            </h2>
            <p className='text-zinc-400 mb-6'>
              Mirror patterns (1212, 1313, 1414, etc.) combine the energies of
              two numbers in a balanced, repeating rhythm.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
              {mirrorNumbers.map((data) => (
                <Link
                  key={data.number}
                  href={`/grimoire/angel-numbers/${data.number}`}
                  className='group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-rose-600 transition-all text-center'
                >
                  <span className='text-xl font-light text-lunary-rose-400 group-hover:text-lunary-rose-300 transition-colors'>
                    {data.number}
                  </span>
                  <p className='text-[11px] text-zinc-400 mt-2 line-clamp-2'>
                    {numberTeasers[data.number] || data.coreMeaning}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {otherNumbers.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Other Special Patterns
            </h2>
            <p className='text-zinc-400 mb-6'>
              Unique number patterns with special spiritual significance.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
              {otherNumbers.map((data) => (
                <Link
                  key={data.number}
                  href={`/grimoire/angel-numbers/${data.number}`}
                  className='group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-zinc-600 transition-all text-center'
                >
                  <span className='text-xl font-light text-zinc-100 group-hover:text-zinc-300 transition-colors'>
                    {data.number}
                  </span>
                  <p className='text-[11px] text-zinc-400 mt-2 line-clamp-2'>
                    {numberTeasers[data.number] || data.coreMeaning}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className='mb-8 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Why you're seeing this number
          </h2>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li className='flex items-center gap-2'>
              <span className='text-lunary-primary-400'>•</span>
              Repetition - the number keeps showing up to get your attention.
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-lunary-primary-400'>•</span>
              Timing - it appears near a decision or change.
            </li>
            <li className='flex items-center gap-2'>
              <span className='text-lunary-primary-400'>•</span>
              Emotional state - it mirrors what you are processing.
            </li>
          </ul>
        </section>

        <section className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Where to look for angel numbers
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <ul className='space-y-2 text-zinc-400'>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Digital clocks and watches
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                License plates and receipts
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Phone numbers and addresses
              </li>
            </ul>
            <ul className='space-y-2 text-zinc-400'>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Page numbers and social metrics
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Ticket, seat, or order numbers
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Dreams and inner nudges
              </li>
            </ul>
          </div>
        </section>

        <section className='mb-8'>
          <p className='text-sm text-zinc-400'>
            Looking for a deeper meaning? Each angel number has its own page
            exploring love, work, and spiritual themes:{' '}
            {numbers.map((num, index) => (
              <span key={num}>
                <Link
                  href={`/grimoire/angel-numbers/${num}`}
                  className='text-lunary-primary-300 hover:text-lunary-primary-200'
                >
                  {num}
                </Link>
                {index < numbers.length - 1 ? ', ' : '.'}
              </span>
            ))}
          </p>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
