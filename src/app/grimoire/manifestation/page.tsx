export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: 'Manifestation: Intention Setting & Conscious Creation - Lunary',
  description:
    'Complete guide to manifestation and intention setting. Learn the science and spirit of conscious creation, optimal timing with moon phases, and practical techniques for manifesting your goals.',
  keywords: [
    'manifestation',
    'intention setting',
    'law of attraction',
    'conscious creation',
    'manifesting',
    'manifestation techniques',
  ],
  openGraph: {
    title: 'Manifestation: Intention Setting & Conscious Creation - Lunary',
    description: 'Complete guide to manifestation and intention setting.',
    type: 'article',
    url: 'https://lunary.app/grimoire/manifestation',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/manifestation',
  },
};

const faqs = [
  {
    question: 'Does manifestation actually work?',
    answer:
      'Manifestation works through a combination of psychological focus (reticular activation), aligned action, and—from a magical perspective—energetic alignment. Setting clear intentions focuses your attention on opportunities you might otherwise miss and motivates action toward your goals.',
  },
  {
    question: 'What is the best moon phase for manifestation?',
    answer:
      "The New Moon is ideal for setting new intentions. The Waxing Moon supports building and attracting. The Full Moon amplifies and manifests what you've been building. Match your work to the phase for best results.",
  },
  {
    question: "Why hasn't my manifestation worked?",
    answer:
      'Common reasons: unclear or conflicting intentions, subconscious blocks, lack of aligned action, unrealistic timing, or attachment to a specific outcome. Manifestation is co-creation with the universe—not ordering from a catalog.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Manifestation Tools',
    links: [
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
    ],
  },
  {
    title: 'Related Resources',
    links: [
      {
        label: 'Moon Phases Guide',
        href: '/grimoire/guides/moon-phases-guide',
      },
      { label: 'Jar Spells', href: '/grimoire/jar-spells' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Meditation', href: '/grimoire/meditation' },
    ],
  },
];

export default function ManifestationPage() {
  const articleSchema = createArticleSchema({
    headline: 'Manifestation: Intention Setting & Conscious Creation',
    description: 'Complete guide to manifestation and intention setting.',
    url: 'https://lunary.app/grimoire/manifestation',
    keywords: ['manifestation', 'intention setting', 'conscious creation'],
    section: 'Manifestation',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Manifestation' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Manifestation
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Intention Setting & Conscious Creation
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Manifestation is the practice of aligning thought, emotion, and action
          to create desired outcomes. It bridges the spiritual and
          practical—combining focused intention with real-world effort.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is' className='hover:text-lunary-primary-400'>
              1. What Intention Actually Means
            </a>
          </li>
          <li>
            <a href='#subconscious' className='hover:text-lunary-primary-400'>
              2. The Subconscious Role
            </a>
          </li>
          <li>
            <a
              href='#ritual-framework'
              className='hover:text-lunary-primary-400'
            >
              3. Ritual + Psychological Framework
            </a>
          </li>
          <li>
            <a href='#timing' className='hover:text-lunary-primary-400'>
              4. Best Times to Set Intentions
            </a>
          </li>
          <li>
            <a href='#techniques' className='hover:text-lunary-primary-400'>
              5. Practical Manifestation Techniques
            </a>
          </li>
          <li>
            <a href='#common-blocks' className='hover:text-lunary-primary-400'>
              6. Common Blocks & How to Clear Them
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              7. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='what-is' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Intention Actually Means
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Intention is not simply wishing. It is the clear, focused decision to
          create a specific outcome, combined with the commitment to align your
          actions with that outcome.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A powerful intention has three components:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Clarity</h3>
            <p className='text-zinc-400 text-sm'>
              Specific, detailed vision of what you want. Vague intentions get
              vague results.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Feeling</h3>
            <p className='text-zinc-400 text-sm'>
              Emotional charge—feeling as if it&apos;s already real. Emotion
              fuels manifestation.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Release</h3>
            <p className='text-zinc-400 text-sm'>
              Letting go of attachment to outcome. Trust the process and take
              aligned action.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Subconscious */}
      <section id='subconscious' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. The Subconscious Role
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Your subconscious mind runs most of your life—beliefs, habits,
          perceptions. If your subconscious beliefs contradict your conscious
          intentions, the subconscious usually wins.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Subconscious Blocks to Watch For
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Believing you don&apos;t deserve what you want</li>
            <li>• Fear of success or change</li>
            <li>• Conflicting desires (wanting two incompatible things)</li>
            <li>• Core beliefs about money, love, or self-worth</li>
            <li>• Past experiences creating limiting patterns</li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Shadow work and journaling can help uncover and clear these blocks.
        </p>
      </section>

      {/* Section 3: Framework */}
      <section id='ritual-framework' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Ritual + Psychological Framework
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Manifestation works on both psychological and energetic levels. The
          ritual component serves to:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Focus your conscious and subconscious mind</li>
          <li>• Create a container for intention-setting</li>
          <li>
            • Engage multiple senses (sight, smell, touch) for deeper imprint
          </li>
          <li>• Signal to your psyche that this is important</li>
          <li>
            • From an energetic view: align your vibration with your desire
          </li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Manifestation Ritual
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Create sacred space and ground yourself</li>
            <li>
              2. Write your intention clearly (present tense: &quot;I
              am...&quot;)
            </li>
            <li>3. Visualize the outcome as already real; feel the emotions</li>
            <li>4. Light a candle (color matched to intention)</li>
            <li>5. Speak your intention aloud with conviction</li>
            <li>6. Release attachment—trust it&apos;s done</li>
            <li>7. Take one aligned action within 24 hours</li>
          </ol>
        </div>
      </section>

      {/* Section 4: Timing */}
      <section id='timing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Best Times to Set Intentions
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Timing amplifies your work. Align with natural cycles for greater
          effect.
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌑 New Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Ideal for setting new intentions, starting projects, planting
              seeds for the month ahead.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌒 Waxing Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Time to build, attract, and take action. Your intentions gain
              momentum.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌕 Full Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Peak energy for manifestation and completion. Review what
              you&apos;ve built; celebrate and release.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              📅 Personal Timing
            </h3>
            <p className='text-zinc-400 text-sm'>
              Your birthday, solar return, and significant anniversaries carry
              personal power.
            </p>
          </div>
        </div>

        <div className='mt-4'>
          <Link
            href='/moon'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Check current moon phase →
          </Link>
        </div>
      </section>

      {/* Section 5: Techniques */}
      <section id='techniques' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Practical Manifestation Techniques
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Scripting</h3>
            <p className='text-zinc-400 text-sm'>
              Write about your desired future in present tense as if it&apos;s
              already happening. Include sensory details and emotions.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Visualization</h3>
            <p className='text-zinc-400 text-sm'>
              Close your eyes and vividly imagine your desired outcome. See,
              hear, and feel it. Practice daily.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Affirmations</h3>
            <p className='text-zinc-400 text-sm'>
              Short, positive statements in present tense. Repeat daily to
              reprogram subconscious beliefs.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Candle Spells</h3>
            <p className='text-zinc-400 text-sm'>
              Use color-coded candles to represent your intention. Carve,
              anoint, and burn with focused attention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Jar Spells</h3>
            <p className='text-zinc-400 text-sm'>
              Layer ingredients that correspond to your intention in a jar. Seal
              and charge.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Action Steps</h3>
            <p className='text-zinc-400 text-sm'>
              Manifestation requires action. Take at least one step toward your
              goal each day, no matter how small.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6: Blocks */}
      <section id='common-blocks' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Common Blocks & How to Clear Them
        </h2>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Doubt</h3>
            <p className='text-zinc-400 text-sm'>
              Doubt cancels intention. If you don&apos;t believe it&apos;s
              possible, your subconscious won&apos;t work toward it. Build
              belief through small wins and evidence-gathering.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Attachment</h3>
            <p className='text-zinc-400 text-sm'>
              Desperate clinging creates resistance. Set the intention, take
              action, then release. Trust the timing.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Conflicting Desires
            </h3>
            <p className='text-zinc-400 text-sm'>
              Wanting freedom AND security, for example, can create stalemate.
              Get clear on what you truly want.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Not Taking Action
            </h3>
            <p className='text-zinc-400 text-sm'>
              Manifestation is co-creation. The universe meets you halfway—but
              you have to move.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Frequently Asked Questions
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
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-green-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Start Manifesting with the Moon
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Check today&apos;s moon phase and align your manifestation practice
          with lunar energy.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/moon'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Today&apos;s Moon Phase
          </Link>
          <Link
            href='/grimoire/moon/rituals'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Moon Rituals
          </Link>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='manifestation'
        title='Manifestation Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
