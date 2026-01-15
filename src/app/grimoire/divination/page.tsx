export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Divination: Tarot, Pendulum, Scrying & More - Lunary',
  description:
    'Complete guide to divination methods: tarot, oracle cards, runes, pendulums, scrying, dream interpretation, and omen reading. Learn safe questioning and healthy boundaries.',
  keywords: [
    'divination',
    'tarot',
    'pendulum',
    'scrying',
    'runes',
    'dream interpretation',
    'divination methods',
  ],
  openGraph: {
    title: 'Divination: Tarot, Pendulum, Scrying & More - Lunary',
    description:
      'Complete guide to divination methods and responsible practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/divination',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/divination',
  },
};

const faqs = [
  {
    question: 'Which divination method is best for beginners?',
    answer:
      'Tarot and pendulum divination are beginner friendly. Tarot offers rich symbolism while pendulums give simple yes/no answers, making both accessible as you build intuition.',
  },
  {
    question: 'Does divination predict the future?',
    answer:
      'Divination reflects current energies and offers possibilities rather than fixed predictions. It highlights patterns and opportunities so you can make empowered choices.',
  },
  {
    question: 'How do I know if my divination is accurate?',
    answer:
      'Track readings in a journal and compare your interpretations with outcomes over time. Accuracy improves with consistent practice, clear questions, and emotional regulation.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Divination Methods',
    links: [
      { label: 'Tarot Cards', href: '/grimoire/tarot' },
      { label: 'Runes', href: '/grimoire/runes' },
      { label: 'Numerology', href: '/grimoire/numerology' },
      { label: 'Astrology & Birth Charts', href: '/grimoire/beginners' },
    ],
  },
  {
    title: 'Supportive Practices',
    links: [
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Archetypes', href: '/grimoire/archetypes' },
    ],
  },
];

const tableOfContents = [
  { label: 'What Divination Is', href: '#what-is' },
  { label: 'Tarot & Oracle Cards', href: '#tarot' },
  { label: 'Runes & Casting Systems', href: '#runes' },
  { label: 'Pendulums', href: '#pendulum' },
  { label: 'Scrying Methods', href: '#scrying' },
  { label: 'Dreams & Omen Reading', href: '#dreams' },
  { label: 'Safe Questions & Boundaries', href: '#boundaries' },
  { label: 'FAQs', href: '#faq' },
];

const whatIs = {
  question: 'What is divination at Lunary?',
  answer:
    'Divination is the art of reflecting on symbolic tools to reveal patterns, possibilities, and guidance. It illuminates your context so you can act with clarity, not anxiety.',
};

const intro =
  'Divination is a mirror, not a crystal ball. It offers insights into current energies and potential paths without locking you into predetermined outcomes.\n\n' +
  'Use it as a reflection tool that complements your intuition and invites mindful questions.';

const howToWorkWith = [
  'Frame questions that focus on your growth (e.g., “What can I learn?” or “What action serves my highest good?”).',
  'Balance symbolic readings with grounded judgment—let them inform, not replace, your choices.',
  'Avoid obsession by spacing out readings and trusting the guidance you receive.',
];

const relatedItems = [
  {
    name: 'Tarot Guide',
    href: '/grimoire/tarot',
    type: 'Symbol systems',
  },
  {
    name: 'Runes Overview',
    href: '/grimoire/runes',
    type: 'Casting systems',
  },
  {
    name: 'Moon Rituals',
    href: '/grimoire/moon/rituals',
    type: 'Timing & energy',
  },
];

export default function DivinationPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Divination'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      tableOfContents={tableOfContents}
      whatIs={whatIs}
      intro={intro}
      howToWorkWith={howToWorkWith}
      faqs={faqs}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='divination'
          title='Divination Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <section id='what-is' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Divination Is (Reflection, Not Fortune-Locking)
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Divination is best understood as a mirror: it reflects your current
          situation, subconscious patterns, and possible trajectories without
          locking you into any particular future.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            A Healthy Approach
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Focus on reflection over prediction</li>
            <li>• Ask open questions that reveal learning opportunities</li>
            <li>• Accept ambiguity rather than forcing neat answers</li>
            <li>• Let readings guide action instead of replacing it</li>
            <li>• Space out sessions to avoid obsession</li>
          </ul>
        </div>
      </section>

      <section id='tarot' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Tarot & Oracle Cards
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Tarot is a 78-card system blending Major and Minor Arcana. Oracle
          decks vary in structure and rely more heavily on intuition.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Tarot</h3>
            <p className='text-zinc-400 text-sm'>
              Structured meanings with 22 Major Arcana and 56 Minor Arcana
              across four suits.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Oracle</h3>
            <p className='text-zinc-400 text-sm'>
              Intuitive decks without a fixed structure, perfect for open-ended
              reflections.
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/tarot'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Full Tarot guide →
          </Link>
          <Link
            href='/grimoire/guides/tarot-complete-guide'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Tarot Complete Guide →
          </Link>
        </div>
      </section>

      <section id='runes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Runes & Casting Systems
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Runes are carved symbols rooted in the Elder Futhark. Drawings or
          casts interpret symbolic meanings to answer questions.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-4'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Rune Reading
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Draw a single rune for daily guidance</li>
            <li>• Cast three runes for past, present, future</li>
            <li>• Learn meanings slowly and honor intuition</li>
            <li>• Optional: note upright vs. reversed orientation</li>
          </ul>
        </div>

        <Link
          href='/grimoire/runes'
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          Explore Runes →
        </Link>
      </section>

      <section id='pendulum' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>4. Pendulums</h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Pendulums respond to subtle muscle movements, delivering yes/no/maybe
          feedback for clear questions.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Getting Started
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Support your elbow and relax your hand.</li>
            <li>2. Ask it to show &quot;yes&quot; and note the direction.</li>
            <li>3. Ask &quot;no&quot; to see the opposing swing.</li>
            <li>4. Some include &quot;maybe&quot; or &quot;ask later.&quot;</li>
            <li>5. Ask clear, verifiable questions to build trust.</li>
          </ol>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Pendulums shine for simple confirmations; for complex situations,
          complement them with tarot or oracle spreads.
        </p>
      </section>

      <section id='scrying' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Scrying Methods
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Scrying requires a calm, receptive state while gazing into a
          reflective or translucent surface to receive impressions.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Crystal Ball / Glass
            </h3>
            <p className='text-zinc-400 text-sm'>
              Classic scrying tool. Soften your gaze and wait for images to
              rise.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Water</h3>
            <p className='text-zinc-400 text-sm'>
              Dark bowl or still pool used to catch reflections and symbols.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Mirror</h3>
            <p className='text-zinc-400 text-sm'>
              Black mirror (catoptromancy) or regular mirror in dim light.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Flame</h3>
            <p className='text-zinc-400 text-sm'>
              Candles or fire offer shifting light for symbolic readings.
            </p>
          </div>
        </div>
      </section>

      <section id='dreams' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Dreams & Omen Reading
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Dreams and omens speak in symbols. Keeping a journal helps you track
          recurring imagery and personal meanings.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Dream Journaling Tips
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • Keep a notebook by your bed and write immediately upon waking
            </li>
            <li>• Record emotions and sensations, even tiny fragments</li>
            <li>• Note repeating symbols and how they feel to you</li>
            <li>
              • Your personal interpretations matter more than generic
              dictionaries
            </li>
          </ul>
        </div>
      </section>

      <section id='boundaries' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Safe Questions and Healthy Boundaries
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Some questions invite dependence or obsession. Healthy divination
          empowers you without stripping agency.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-lunary-success/30 bg-lunary-success/5'>
            <h3 className='font-medium text-lunary-success mb-2'>
              Healthy Questions
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• “What do I need to know to move forward?”</li>
              <li>• “What energy is showing up around this situation?”</li>
              <li>• “What action would serve my highest good?”</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-lunary-error/30 bg-lunary-error/5'>
            <h3 className='font-medium text-lunary-error mb-2'>
              Questions to Avoid
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Repeating the same question until you “like” the answer</li>
              <li>
                • “Does [specific person] love me?” (ask about your energy
                instead)
              </li>
              <li>
                • Probing others’ private matters or control-focused inquiries
              </li>
              <li>• Questions seeking permission to avoid responsibility</li>
            </ul>
          </div>
        </div>
      </section>

      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          8. Frequently Asked Questions
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

      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-violet-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Begin Your Divination Practice
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Draw a card, cast a rune, or frame a mindful question. Divination
          invites reflection and aligned action.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/tarot'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Draw a Tarot Card
          </Link>
          <Link
            href='/grimoire/tarot'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Browse Tarot Cards
          </Link>
        </div>
      </section>
    </SEOContentTemplate>
  );
}
