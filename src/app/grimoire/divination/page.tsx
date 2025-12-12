export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Divination: Tarot, Pendulum, Scrying & More - Lunary',
  description:
    'Complete guide to divination methods: tarot, oracle cards, runes, pendulum, scrying, dream interpretation, and omen reading. Learn safe questions and healthy boundaries.',
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
    description: 'Complete guide to divination methods and practices.',
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
      'Tarot is excellent for beginners due to its rich symbolism and abundant learning resources. Pendulum divination is also accessible—simple yes/no answers with minimal tools. Start with whatever calls to you.',
  },
  {
    question: 'Does divination predict the future?',
    answer:
      'Divination reveals possibilities and patterns, not fixed futures. It shows likely outcomes based on current energies and trajectories. You always have free will to change course.',
  },
  {
    question: 'How do I know if my divination is accurate?',
    answer:
      'Keep a divination journal and track outcomes over time. Notice patterns in your accuracy. Accuracy improves with practice, clear questioning, and learning to distinguish genuine insight from wishful thinking.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Divination Methods',
    links: [
      { label: 'Tarot Cards', href: '/grimoire/tarot' },
      { label: 'Runes', href: '/grimoire/runes' },
      { label: 'Numerology', href: '/grimoire/numerology' },
      { label: 'Astrology', href: '/grimoire/beginners' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Archetypes', href: '/grimoire/archetypes' },
    ],
  },
];

export default function DivinationPage() {
  const articleSchema = createArticleSchema({
    headline: 'Divination: Tarot, Pendulum, Scrying & More',
    description: 'Complete guide to divination methods and practices.',
    url: 'https://lunary.app/grimoire/divination',
    keywords: ['divination', 'tarot', 'pendulum', 'scrying'],
    section: 'Divination',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Divination', url: '/grimoire/divination' },
        ]),
      )}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Divination' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Divination
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Tools for Reflection & Insight
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Divination is the practice of gaining insight through symbolic tools
          and intuitive interpretation. It is not fortune-telling with fixed
          outcomes, but reflection that illuminates patterns, possibilities, and
          questions worth asking.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is' className='hover:text-lunary-primary-400'>
              1. What Divination Is (Reflection, Not Fortune-Locking)
            </a>
          </li>
          <li>
            <a href='#tarot' className='hover:text-lunary-primary-400'>
              2. Tarot & Oracle Cards
            </a>
          </li>
          <li>
            <a href='#runes' className='hover:text-lunary-primary-400'>
              3. Runes & Casting Systems
            </a>
          </li>
          <li>
            <a href='#pendulum' className='hover:text-lunary-primary-400'>
              4. Pendulums
            </a>
          </li>
          <li>
            <a href='#scrying' className='hover:text-lunary-primary-400'>
              5. Scrying Methods
            </a>
          </li>
          <li>
            <a href='#dreams' className='hover:text-lunary-primary-400'>
              6. Dreams & Omen Reading
            </a>
          </li>
          <li>
            <a href='#boundaries' className='hover:text-lunary-primary-400'>
              7. Safe Questions and Healthy Boundaries
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              8. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='what-is' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Divination Is (Reflection, Not Fortune-Locking)
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Divination is best understood as a mirror, not a crystal ball. It
          reflects your current situation, subconscious patterns, and possible
          trajectories—but it does not lock you into any particular future. You
          always have agency.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            A Healthy Approach to Divination
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>
              • Use divination for reflection and self-understanding, not
              anxiety reduction
            </li>
            <li>
              • Ask open questions (&quot;What do I need to know?&quot;) rather
              than yes/no when exploring complex situations
            </li>
            <li>
              • Accept that some readings will be unclear—not everything is
              meant to be known
            </li>
            <li>
              • Avoid obsessive reading on the same question (it muddies the
              signal)
            </li>
            <li>• Let readings inform your thinking, not replace it</li>
          </ul>
        </div>
      </section>

      {/* Section 2: Tarot */}
      <section id='tarot' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Tarot & Oracle Cards
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Tarot is a 78-card system with rich symbolic imagery. The Major Arcana
          (22 cards) represent major life themes; the Minor Arcana (56 cards)
          address daily situations across four suits.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Tarot</h3>
            <p className='text-zinc-400 text-sm'>
              Structured system with standardized meanings. 78 cards: 22 Major
              Arcana + 56 Minor Arcana (4 suits of 14).
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Oracle Cards</h3>
            <p className='text-zinc-400 text-sm'>
              Varies by deck. No standardized structure. Often more intuitive
              and less structured than tarot.
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-3'>
          <Link
            href='/grimoire/tarot'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            All 78 Tarot cards →
          </Link>
          <Link
            href='/grimoire/guides/tarot-complete-guide'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Tarot Complete Guide →
          </Link>
        </div>
      </section>

      {/* Section 3: Runes */}
      <section id='runes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Runes & Casting Systems
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Runes are ancient Germanic symbols used for divination and magic. The
          Elder Futhark (24 runes) is the most common system. Runes are cast or
          drawn and interpreted through their traditional meanings.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Rune Reading
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Draw a single rune for daily guidance</li>
            <li>• Cast three runes: past, present, future</li>
            <li>• Learn each rune&apos;s meaning gradually</li>
            <li>• Consider upright vs. reversed interpretations (optional)</li>
          </ul>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/runes'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Explore Runes →
          </Link>
        </div>
      </section>

      {/* Section 4: Pendulum */}
      <section id='pendulum' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>4. Pendulums</h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Pendulum divination uses a weighted object on a chain or string.
          Through subtle micro-movements, the pendulum responds to questions—
          typically with yes/no/maybe answers.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Getting Started
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Hold the pendulum steady, elbow supported</li>
            <li>2. Ask it to show you &quot;yes&quot; (observe direction)</li>
            <li>
              3. Ask it to show you &quot;no&quot; (observe different direction)
            </li>
            <li>4. Some include &quot;maybe&quot; or &quot;ask later&quot;</li>
            <li>
              5. Ask clear, specific questions; start with verifiable ones
            </li>
          </ol>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Pendulums work best for simple yes/no questions. For complex
          situations, use tarot or other symbol-rich methods.
        </p>
      </section>

      {/* Section 5: Scrying */}
      <section id='scrying' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Scrying Methods
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Scrying involves gazing into a reflective or translucent surface to
          receive visions or impressions. It requires a meditative state and
          openness to symbolic imagery.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Crystal Ball / Glass
            </h3>
            <p className='text-zinc-400 text-sm'>
              Classic scrying tool. Gaze softly until images or impressions
              arise.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Water (Hydromancy)
            </h3>
            <p className='text-zinc-400 text-sm'>
              A dark bowl filled with water. Gaze at the surface in dim light.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Mirror (Catoptromancy)
            </h3>
            <p className='text-zinc-400 text-sm'>
              A black mirror or regular mirror in dim candlelight.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Flame (Pyromancy)
            </h3>
            <p className='text-zinc-400 text-sm'>
              Watch a candle flame or fire for images and movement patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Dreams */}
      <section id='dreams' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Dreams & Omen Reading
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Dreams communicate through symbols and metaphor. Keeping a dream
          journal helps you recognize recurring patterns and personal symbolism.
          Omens are meaningful signs noticed in waking life.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Dream Journaling Tips
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • Keep a journal by your bed and write immediately upon waking
            </li>
            <li>• Record everything—even fragments</li>
            <li>• Note emotions felt in the dream</li>
            <li>• Look for recurring symbols over time</li>
            <li>
              • Your personal associations matter more than dream dictionaries
            </li>
          </ul>
        </div>
      </section>

      {/* Section 7: Boundaries */}
      <section id='boundaries' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Safe Questions and Healthy Boundaries
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Not all questions are productive. Some lead to obsessive checking or
          unhealthy dependence on divination.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-lunary-success/30 bg-lunary-success/5'>
            <h3 className='font-medium text-lunary-success mb-2'>
              Healthy Questions
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• &quot;What do I need to know about...?&quot;</li>
              <li>• &quot;What is blocking me from...?&quot;</li>
              <li>• &quot;What action would serve my highest good?&quot;</li>
              <li>• &quot;What energy surrounds this situation?&quot;</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-lunary-error/30 bg-lunary-error/5'>
            <h3 className='font-medium text-lunary-error mb-2'>
              Questions to Avoid
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Asking the same question repeatedly</li>
              <li>
                • &quot;Does [specific person] love me?&quot; (ask about your
                energy instead)
              </li>
              <li>• Questions about other people&apos;s private matters</li>
              <li>• Questions seeking permission to avoid responsibility</li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-violet-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Begin Your Divination Practice
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Draw a card, cast a rune, or simply reflect on a question. Start where
          you are and let your practice develop.
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

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='divination'
        title='Divination Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
