export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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
      'Manifestation works through psychological focus, aligned action, and energetic alignment. Clear intentions highlight opportunities you might otherwise miss and motivate meaningful action.',
  },
  {
    question: 'What is the best moon phase for manifestation?',
    answer:
      'The New Moon is ideal for planting seeds, the Waxing Moon supports building momentum, and the Full Moon amplifies results. Match your intention with the phase that fits your timing.',
  },
  {
    question: "Why hasn't my manifestation worked?",
    answer:
      'Manifestation is co-creation. Common blocks include vague intentions, subconscious disbelief, conflicting desires, lack of action, or attachment to a specific outcome. Reframe the vision, clear blockages, and keep taking aligned steps.',
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

const tableOfContents = [
  { label: 'What Intention Actually Means', href: '#what-is' },
  { label: 'The Subconscious Role', href: '#subconscious' },
  { label: 'Ritual + Psychological Framework', href: '#ritual-framework' },
  { label: 'Best Times to Set Intentions', href: '#timing' },
  { label: 'Practical Manifestation Techniques', href: '#techniques' },
  { label: 'Common Blocks & Clearing Them', href: '#common-blocks' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What does manifestation mean at Lunary?',
  answer:
    'Manifestation is the intentional alignment of thought, emotion, and action. It fuses spiritual focus with aligned movement in the world, turning a clear, imagined future into tangible progress.',
};

const intro =
  'Manifestation is the practice of aligning thought, emotion, and action to create desired outcomes.\n\n' +
  'It bridges the spiritual and practical—honoring magical timing while leaning into grounded steps that move you toward what matters.';

const howToWorkWith = [
  'Clarify your intention in vivid, present-tense language so your subconscious can understand it.',
  'Feel the emotion of the outcome, aligning the heart with the mind.',
  'Release attachment to how it unfolds—trust the process while staying open to guidance.',
  'Pair the intention with aligned action within 24 hours to invite the universe to meet you halfway.',
];

const relatedItems = [
  {
    name: 'Moon Rituals',
    href: '/grimoire/moon/rituals',
    type: 'Timing & energy',
  },
  {
    name: 'Candle Magic',
    href: '/grimoire/candle-magic',
    type: 'Color correspondences',
  },
  {
    name: 'Jar Spells',
    href: '/grimoire/jar-spells',
    type: 'Layered spellwork',
  },
  {
    name: 'Manifestation Spells',
    href: '/grimoire/spells/fundamentals',
    type: 'Spellcraft fundamentals',
  },
];

export default function ManifestationPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Manifestation'
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
          entityKey='manifestation'
          title='Manifestation Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
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
              Emotional charge—feeling as if it&apos;s already real fuels
              manifestation.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Release</h3>
            <p className='text-zinc-400 text-sm'>
              Letting go of attachment to outcome. Trust the process and keep
              aligned action flowing.
            </p>
          </div>
        </div>
      </section>

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
            <li>• Believing you don&apos;t deserve what you desire</li>
            <li>• Fear of success or the changes it brings</li>
            <li>• Conflicting desires that dilute focus</li>
            <li>• Core beliefs about money, love, or worth</li>
            <li>• Past patterns burning the same limits</li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Shadow work, journaling, and small wins help loosen these blocks so
          your subconscious can align with the conscious goal.
        </p>
      </section>

      <section id='ritual-framework' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Ritual + Psychological Framework
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Manifestation works on both psychological and energetic levels. The
          ritual component:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Focuses your conscious and subconscious mind</li>
          <li>• Creates a sacred container for your intention</li>
          <li>• Engages multiple senses for deeper imprint</li>
          <li>• Signals to your psyche that this is important</li>
          <li>• Aligns your vibration with the desire</li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Basic Manifestation Ritual
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Create sacred space and ground yourself</li>
            <li>2. Write your intention clearly in present tense</li>
            <li>3. Visualize the outcome as already real</li>
            <li>4. Light a candle aligned to your intention</li>
            <li>5. Speak your intention aloud with conviction</li>
            <li>6. Release attachment and trust the flow</li>
            <li>7. Take at least one aligned action within 24 hours</li>
          </ol>
        </div>
      </section>

      <section id='timing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Best Times to Set Intentions
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Timing amplifies your work. Align with natural cycles and personal
          milestones for greater impact.
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌑 New Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Ideal for starting fresh intentions and planting seeds for growth.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌒 Waxing Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Use this building phase to attract momentum and take aligned
              action.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌕 Full Moon</h3>
            <p className='text-zinc-400 text-sm'>
              Celebrate what you&apos;ve built and release what no longer serves
              the vision.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              📅 Personal Timing
            </h3>
            <p className='text-zinc-400 text-sm'>
              Your birthday, solar return, and anniversaries carry personal
              power—lean into them.
            </p>
          </div>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/moon'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Check the current moon phase →
          </Link>
        </div>
      </section>

      <section id='techniques' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Practical Manifestation Techniques
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Scripting</h3>
            <p className='text-zinc-400 text-sm'>
              Write about your desired future in present tense with vivid
              sensory details.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Visualization</h3>
            <p className='text-zinc-400 text-sm'>
              Close your eyes and imagine your intention as real. Practice daily
              to rewire your subconscious clues.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Affirmations</h3>
            <p className='text-zinc-400 text-sm'>
              Repeat short, positive statements in present tense to reprogram
              limiting beliefs.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Candle Spells</h3>
            <p className='text-zinc-400 text-sm'>
              Color-code candles to your intention, then carve, anoint, and burn
              with focused attention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Jar Spells</h3>
            <p className='text-zinc-400 text-sm'>
              Layer intention-aligned ingredients into a jar, seal it, and
              charge the spell with energy.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Action Steps</h3>
            <p className='text-zinc-400 text-sm'>
              Manifestation is co-creation. Take at least one aligned action
              every day, no matter how small.
            </p>
          </div>
        </div>
      </section>

      <section id='common-blocks' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Common Blocks & How to Clear Them
        </h2>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Doubt</h3>
            <p className='text-zinc-400 text-sm'>
              Doubt cancels intention. Build belief through small wins and
              evidence-gathering.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Attachment</h3>
            <p className='text-zinc-400 text-sm'>
              Desperate clinging creates resistance. Set it, act, and release.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Conflicting Desires
            </h3>
            <p className='text-zinc-400 text-sm'>
              Wanting incompatible outcomes creates stalemate. Get crystal clear
              on what you truly want.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Not Taking Action
            </h3>
            <p className='text-zinc-400 text-sm'>
              Manifestation needs aligned effort. Move toward your desire daily.
            </p>
          </div>
        </div>
      </section>

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
            href='/grimoire/moon'
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
    </SEOContentTemplate>
  );
}
