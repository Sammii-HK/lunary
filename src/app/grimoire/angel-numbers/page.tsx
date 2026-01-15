import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { angelNumbers } from '@/constants/grimoire/numerology-data';

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
    images: ['/api/og/grimoire/numerology'],
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
      'Angel numbers are repeating number sequences (like 111, 222, 333) believed to carry divine guidance from angels, spirit guides, or the universe. When you repeatedly notice certain numbers on clocks, receipts, license plates, or elsewhere, many believe this is a form of spiritual communication.',
  },
  {
    question: 'Why do I keep seeing repeating numbers?',
    answer:
      "Seeing repeating numbers often indicates you're in alignment with spiritual energy and your guides are trying to communicate. Pay attention to what you were thinking or feeling when you noticed the number — this context often reveals the message's meaning for you.",
  },
  {
    question: 'What does 111 mean spiritually?',
    answer:
      '111 is a powerful manifestation number signaling new beginnings and that your thoughts are manifesting quickly. It encourages you to focus on what you want (not what you fear) as your intentions are being amplified by the universe.',
  },
  {
    question: 'What does seeing 444 mean?',
    answer:
      '444 is a sign of protection and encouragement from your angels. It indicates you are on the right path and surrounded by divine support. This number often appears during challenging times as reassurance that you are not alone.',
  },
  {
    question: 'How should I respond when I see an angel number?',
    answer:
      'When you see an angel number, pause and notice what you were thinking. Thank your guides for the message. Reflect on how the meaning applies to your current situation. Many people also journal about their angel number sightings to track patterns.',
  },
];

const tableOfContents = [
  { label: 'Triple Number Sequences', href: '#triple-number-sequences' },
  { label: 'Other Angel Numbers', href: '#other-numbers' },
  { label: 'Where to Look', href: '#where-to-look' },
  { label: 'Interpret Messages', href: '#interpretation' },
  { label: 'Integration Rituals', href: '#integration' },
  { label: 'Quick Reference', href: '#quick-reference' },
  { label: 'Close the Loop', href: '#closing' },
];

export default function AngelNumbersIndexPage() {
  const numbers = Object.keys(angelNumbers).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  const tripleNumbers = numbers.filter(
    (n) => n.length === 3 && n[0] === n[1] && n[1] === n[2],
  );
  const otherNumbers = numbers.filter(
    (n) => !(n.length === 3 && n[0] === n[1] && n[1] === n[2]),
  );

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
        intro='Repeating number patterns show up on clocks, receipts, license plates, dreams, and digital dashboards precisely when you need a nudge from your guides. This index explains what each number means and how to integrate the message into practical magic.'
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What are Angel Numbers?',
          answer:
            'Angel numbers are sequences of repeating numbers (like 111, 222, 333) that many believe carry divine messages from angels, spirit guides, or the universe. When you repeatedly notice these number patterns on clocks, license plates, receipts, or elsewhere, it may be a sign that spiritual forces are trying to communicate guidance, reassurance, or warnings.',
        }}
        tldr='Angel numbers are repeating number sequences carrying spiritual messages. Common ones include 111 (manifestation), 222 (balance), 333 (guidance), 444 (protection), and 555 (change). Notice when and where you see them for context.'
        meaning={`Angel numbers have been recognized across cultures and spiritual traditions as a form of divine communication. The practice of interpreting these numbers draws from numerology, where each digit carries specific vibrational meaning.

**How Angel Numbers Work:**

The universe communicates through synchronicity — meaningful coincidences that catch our attention. When you repeatedly see a number sequence, it's believed to be:

1. **A sign you're aligned** with spiritual energy
2. **Guidance** for your current situation
3. **Confirmation** you're on the right path
4. **A warning** to pay attention

**The Most Common Angel Numbers:**

- **111** - New beginnings, manifestation, thoughts becoming reality
- **222** - Balance, harmony, partnerships, trust the process
- **333** - Ascended masters present, creative expression, growth
- **444** - Protection, stability, angels are with you
- **555** - Major change coming, transformation, freedom
- **666** - Refocus on balance, don't be too materialistic
- **777** - Spiritual awakening, luck, divine alignment
- **888** - Abundance, prosperity, karma returning
- **999** - Completion, ending cycles, humanitarian purpose

**How to Work with Angel Numbers:**

When you see an angel number, pause and take note of:
- What you were thinking about
- How you were feeling
- What's happening in your life
- The context (time, place, situation)

This information helps you understand the specific message for you.`}
        howToWorkWith={[
          'Stay aware and notice when numbers appear repeatedly',
          'Note what you were thinking or feeling when you saw the number',
          'Look up the general meaning of the angel number',
          'Apply the meaning to your specific life situation',
          'Thank your guides and trust the message',
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
        cosmicConnections={
          <CosmicConnections
            entityType='hub-numerology'
            entityKey='angel-numbers'
            title='Numerology Connections'
            sections={[
              {
                title: 'Numerology Resources',
                links: [
                  { label: 'Numerology Guide', href: '/grimoire/numerology' },
                  { label: 'Life Path Numbers', href: '/grimoire/life-path' },
                  { label: 'Double Hours', href: '/grimoire/double-hours' },
                ],
              },
              {
                title: 'Daily Practice',
                links: [
                  { label: 'Mirror Hours', href: '/grimoire/mirror-hours' },
                  { label: 'Manifestation', href: '/grimoire/manifestation' },
                  { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
                ],
              },
            ]}
          />
        }
      >
        <section id='triple-number-sequences' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Triple Number Sequences
          </h2>
          <p className='text-zinc-400 mb-6'>
            Triple numbers (111, 222, 333, etc.) are the most commonly
            recognized angel numbers. Each carries powerful spiritual
            significance.
          </p>
          <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4'>
            {tripleNumbers.map((num) => {
              const data = angelNumbers[num as keyof typeof angelNumbers];
              return (
                <Link
                  key={num}
                  href={`/grimoire/angel-numbers/${num}`}
                  className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all text-center'
                >
                  <span className='text-2xl font-light text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors'>
                    {num}
                  </span>
                  {data?.meaning && (
                    <p className='text-xs text-zinc-400 mt-2 line-clamp-1'>
                      {data.meaning.split(' & ')[0]}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {otherNumbers.length > 0 && (
          <section id='other-numbers' className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
              Other Angel Numbers
            </h2>
            <p className='text-zinc-400 mb-6'>
              Beyond triple numbers, other repeating sequences also carry
              spiritual messages.
            </p>
            <div className='grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3'>
              {otherNumbers.map((num) => (
                <Link
                  key={num}
                  href={`/grimoire/angel-numbers/${num}`}
                  className='group rounded-lg border border-zinc-800 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-accent-600 transition-all text-center'
                >
                  <span className='text-xl font-light text-zinc-100 group-hover:text-lunary-accent-300 transition-colors'>
                    {num}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section
          id='where-to-look'
          className='mb-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Where to Look for Angel Numbers
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <ul className='space-y-2 text-zinc-400'>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Digital clocks and watches
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                License plates on vehicles
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Receipts and transaction totals
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Phone numbers and addresses
              </li>
            </ul>
            <ul className='space-y-2 text-zinc-400'>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Page numbers in books
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Social media metrics
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Flight or seat numbers
              </li>
              <li className='flex items-center gap-2'>
                <span className='text-lunary-primary-400'>•</span>
                Dreams and visions
              </li>
            </ul>
          </div>
        </section>

        <section
          id='interpretation'
          className='mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-2xl font-medium text-zinc-100'>
            How to Interpret Messages
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            The meaning of an angel number is half collective wisdom, half
            personal context. Follow this three-step workflow whenever a pattern
            jumps out:
          </p>
          <ol className='list-decimal list-inside space-y-2 text-zinc-300'>
            <li>
              <strong className='text-zinc-100'>Capture the scene.</strong> Note
              where you were, the time, the conversation or thought in your
              head, and how you felt in your body.
            </li>
            <li>
              <strong className='text-zinc-100'>
                Look up the base meaning.
              </strong>{' '}
              Use the quick reference below or the individual number pages to
              refresh the collective symbolism.
            </li>
            <li>
              <strong className='text-zinc-100'>Blend with intuition.</strong>{' '}
              Ask how the number’s qualities map onto your current chapter.
              Treat it like dialogue with your guides and consider journaling
              the insights.
            </li>
          </ol>
          <p className='text-zinc-300 leading-relaxed'>
            Over time you’ll build a personalized reference library of what each
            sequence feels like, strengthening the conversation between you and
            your angels.
          </p>
        </section>

        <section
          id='integration'
          className='mb-12 bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 space-y-4'
        >
          <h2 className='text-xl font-medium text-zinc-100'>
            Integration Rituals & Daily Practice
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Seeing angel numbers is only half the story—the other half is
            weaving the insight into your morning rituals, spellwork, or
            planning sessions. Try this mini sequence the next time a number
            keeps repeating:
          </p>
          <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
            <li>Pause, breathe, and thank your guides for reaching out.</li>
            <li>
              Jot down the number, date, and situation in your journal or Book
              of Shadows.
            </li>
            <li>
              Pull a single tarot card or rune to add another layer to the
              message.
            </li>
            <li>
              Decide on one grounded action that mirrors the number’s frequency
              (e.g., call a mentor, meditate, set a boundary, launch a project).
            </li>
          </ol>
          <p className='text-zinc-300 leading-relaxed'>
            You can also align angel numbers with moon phases—write them next to
            your lunar intentions so you know which goals are being emphasized
            by your guides. Over time, you’ll build a personal reference
            timeline that shows exactly how the numbers participated in your
            evolution.
          </p>
        </section>

        <section
          id='quick-reference'
          className='mb-12 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-accent-900/20 border border-lunary-primary-800 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Common Angel Number Meanings
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
            <div>
              <span className='font-medium text-lunary-primary-300'>111</span>
              <span className='text-zinc-400'>
                {' '}
                — Manifestation, new starts
              </span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>222</span>
              <span className='text-zinc-400'> — Balance, trust, patience</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>333</span>
              <span className='text-zinc-400'>
                {' '}
                — Divine guidance, creativity
              </span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>444</span>
              <span className='text-zinc-400'> — Protection, foundation</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>555</span>
              <span className='text-zinc-400'> — Major change, freedom</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>666</span>
              <span className='text-zinc-400'> — Balance, refocus</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>777</span>
              <span className='text-zinc-400'>
                {' '}
                — Luck, spiritual awakening
              </span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>888</span>
              <span className='text-zinc-400'> — Abundance, prosperity</span>
            </div>
            <div>
              <span className='font-medium text-lunary-primary-300'>999</span>
              <span className='text-zinc-400'> — Completion, endings</span>
            </div>
          </div>
        </section>
        <section id='closing' className='space-y-3'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Close the Loop with Your Guides
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Angel numbers are invitations to collaborate with the unseen. Every
            time you acknowledge them, you strengthen that channel. Wrap each
            sighting by writing a short note to your guides, sharing what action
            you plan to take, and thanking them for the nudge.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Keep this reference handy, add your own discoveries, and check back
            whenever the universe taps you on the shoulder with another
            repeating number. The more intentional you are, the louder the
            guidance becomes.
          </p>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
