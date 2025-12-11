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
  title: 'Meditation & Grounding: The Foundation of Magical Practice - Lunary',
  description:
    'Complete guide to meditation and grounding for magical practice. Learn basic meditation types, breathwork techniques, grounding methods, and how to integrate mindfulness into daily life.',
  keywords: [
    'meditation',
    'grounding',
    'mindfulness',
    'spiritual meditation',
    'grounding exercises',
    'breathwork',
  ],
  openGraph: {
    title: 'Meditation & Grounding - Lunary',
    description:
      'Complete guide to meditation and grounding for magical practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/meditation',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/meditation',
  },
};

const faqs = [
  {
    question: 'How long should I meditate?',
    answer:
      'Start with 5 minutes daily. Consistency matters more than duration. A short daily practice builds the habit; you can extend later. Even 3 mindful breaths count.',
  },
  {
    question: 'What if I cannot stop thinking during meditation?',
    answer:
      'Thinking is normal and expected. Meditation is not about stopping thoughts but noticing them and returning to your focus. Every time you notice and return, you are practicing. That IS the meditation.',
  },
  {
    question: 'How does meditation help magical practice?',
    answer:
      'Meditation develops the focus, awareness, and energetic sensitivity needed for effective spellwork. It calms the mind for clear intention-setting and helps you sense subtle energies. Many practitioners meditate before any ritual.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Related Practices',
    links: [
      { label: 'Chakras', href: '/grimoire/chakras' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Spellcraft', href: '/grimoire/spells/fundamentals' },
      { label: 'Divination', href: '/grimoire/divination' },
    ],
  },
  {
    title: 'Apply Your Practice',
    links: [
      { label: 'Book of Shadows', href: '/book-of-shadows' },
      { label: 'Archetypes', href: '/grimoire/archetypes' },
      { label: 'Shadow Work', href: '/grimoire/archetypes#shadow-dancer' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
];

export default function MeditationPage() {
  const articleSchema = createArticleSchema({
    headline: 'Meditation & Grounding: The Foundation of Magical Practice',
    description:
      'Complete guide to meditation and grounding for magical practice.',
    url: 'https://lunary.app/grimoire/meditation',
    keywords: ['meditation', 'grounding', 'mindfulness'],
    section: 'Meditation',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Meditation & Grounding' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Meditation & Grounding
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            The Foundation of Magical Practice
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Meditation develops the focus, awareness, and presence that power
          effective magical work. Grounding connects you to the earth,
          stabilizing your energy before and after ritual. Together, they form
          the foundation of any serious practice.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#why-grounding' className='hover:text-lunary-primary-400'>
              1. Why Grounding Matters
            </a>
          </li>
          <li>
            <a
              href='#meditation-types'
              className='hover:text-lunary-primary-400'
            >
              2. Basic Meditation Types
            </a>
          </li>
          <li>
            <a href='#breathwork' className='hover:text-lunary-primary-400'>
              3. Breathwork Techniques
            </a>
          </li>
          <li>
            <a
              href='#grounding-methods'
              className='hover:text-lunary-primary-400'
            >
              4. Grounding Methods Before & After Ritual
            </a>
          </li>
          <li>
            <a href='#daily-life' className='hover:text-lunary-primary-400'>
              5. Integrating Mindfulness into Daily Life
            </a>
          </li>
          <li>
            <a href='#faq' className='hover:text-lunary-primary-400'>
              6. FAQ
            </a>
          </li>
        </ol>
      </nav>

      {/* Section 1 */}
      <section id='why-grounding' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Why Grounding Matters
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Grounding is the practice of connecting your energy to the earth.
          Without it, magical work can leave you feeling spacey, anxious, or
          unmoored. With it, you have a stable foundation from which to work.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Benefits of Grounding
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Creates stability before raising or directing energy</li>
            <li>• Helps discharge excess energy after ritual</li>
            <li>• Reduces anxiety and mental scatter</li>
            <li>• Connects you to the present moment</li>
            <li>• Supports clearer thinking and intention-setting</li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Think of grounding as plugging into the earth&apos;s power grid—you
          have a stable source to draw from and a place to release excess.
        </p>
      </section>

      {/* Section 2: Meditation Types */}
      <section id='meditation-types' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Basic Meditation Types
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Different meditation styles serve different purposes. Experiment to
          find what works for you.
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Breath Awareness</h3>
            <p className='text-zinc-400 text-sm'>
              Simply notice your breath. When thoughts arise, return attention
              to breathing. The most accessible starting point.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Body Scan</h3>
            <p className='text-zinc-400 text-sm'>
              Move attention systematically through your body, noticing
              sensations without trying to change them. Good for grounding and
              releasing tension.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Visualization</h3>
            <p className='text-zinc-400 text-sm'>
              Imagine a scene, symbol, or energy in your mind&apos;s eye. Used
              in magical practice for manifestation, journeying, and energy
              work.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Mantra / Chanting
            </h3>
            <p className='text-zinc-400 text-sm'>
              Repeat a word, phrase, or sound. The repetition focuses the mind
              and can shift consciousness. Can be spoken or silent.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Walking Meditation
            </h3>
            <p className='text-zinc-400 text-sm'>
              Slow, mindful walking with attention on each step. Good for those
              who find sitting meditation difficult.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Breathwork */}
      <section id='breathwork' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Breathwork Techniques
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Breath is the bridge between body and mind. Conscious breathing
          techniques can calm, energize, or shift your state rapidly.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>4-7-8 Breathing</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Calming technique for anxiety or before sleep.
            </p>
            <p className='text-zinc-500 text-xs'>
              Inhale 4 counts → Hold 7 counts → Exhale 8 counts
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Box Breathing</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Balancing technique for focus and calm.
            </p>
            <p className='text-zinc-500 text-xs'>
              Inhale 4 counts → Hold 4 → Exhale 4 → Hold 4
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Energizing Breath
            </h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Quick, sharp breaths to raise energy before ritual.
            </p>
            <p className='text-zinc-500 text-xs'>
              Short, rhythmic inhales through nose, forceful exhales
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Deep Belly Breathing
            </h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Slow, deep breaths into the lower belly.
            </p>
            <p className='text-zinc-500 text-xs'>
              Activates parasympathetic nervous system (rest and digest)
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Grounding Methods */}
      <section id='grounding-methods' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Grounding Methods Before & After Ritual
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ground before ritual to create a stable foundation. Ground after
          ritual to discharge excess energy and return to normal awareness.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Tree Roots Visualization
          </h3>
          <ol className='space-y-2 text-zinc-400 text-sm'>
            <li>1. Sit or stand comfortably, feet flat on the floor</li>
            <li>2. Take three deep breaths to center</li>
            <li>3. Visualize roots growing from the soles of your feet</li>
            <li>
              4. See them extend down through the floor, through soil, into deep
              earth
            </li>
            <li>5. Feel stable, connected, anchored</li>
            <li>6. Draw earth energy up through the roots if desired</li>
          </ol>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Physical Grounding
            </h3>
            <p className='text-zinc-400 text-sm'>
              Touch the floor or earth. Eat something. Splash cold water on your
              face. Move your body. These pull attention back to the physical.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Stone Holding</h3>
            <p className='text-zinc-400 text-sm'>
              Hold a grounding stone (black tourmaline, hematite, obsidian) and
              visualize excess energy draining into it.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Daily Life */}
      <section id='daily-life' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Integrating Mindfulness into Daily Life
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Meditation is not just for the cushion. Mindfulness can be woven into
          everyday activities, turning ordinary moments into practice.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Everyday Mindfulness Opportunities
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • <strong>Morning:</strong> Three conscious breaths before getting
              out of bed
            </li>
            <li>
              • <strong>Eating:</strong> One meal per week eaten slowly, without
              screens
            </li>
            <li>
              • <strong>Walking:</strong> Feel your feet on the ground as you
              walk
            </li>
            <li>
              • <strong>Waiting:</strong> Use waiting time for breath awareness
              instead of phone scrolling
            </li>
            <li>
              • <strong>Evening:</strong> Brief gratitude or reflection practice
              before sleep
            </li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Small moments of presence throughout the day add up. You don&apos;t
          need an hour—you need consistency.
        </p>
      </section>

      {/* FAQ */}
      <section id='faq' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Frequently Asked Questions
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
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-blue-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Begin Your Practice
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Start with just 5 minutes today. Record your experience in your Book
          of Shadows and build from there.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/book-of-shadows'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Open Book of Shadows
          </Link>
          <Link
            href='/grimoire/chakras'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Explore Chakras
          </Link>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='meditation'
        title='Meditation Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
