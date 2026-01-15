export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
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
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
];

const tableOfContents = [
  { label: 'Why Grounding Matters', href: '#why-grounding' },
  { label: 'Meditation Types', href: '#meditation-types' },
  { label: 'Breathwork', href: '#breathwork' },
  { label: 'Grounding Methods', href: '#grounding-methods' },
  { label: 'Daily Mindfulness', href: '#daily-life' },
  { label: 'FAQ', href: '#faq' },
];

const sections = (
  <>
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
        Think of grounding as plugging into the earth&apos;s power grid—you have
        a stable source to draw from and a place to release excess.
      </p>
    </section>

    <section id='meditation-types' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        2. Basic Meditation Types
      </h2>
      <p className='text-zinc-300 leading-relaxed mb-6'>
        Different meditation styles serve different purposes. Experiment to find
        what works for you.
      </p>
      <div className='space-y-4'>
        {[
          {
            title: 'Breath Awareness',
            text: 'Simply notice your breath. When thoughts arise, return attention to breathing. The most accessible starting point.',
          },
          {
            title: 'Body Scan',
            text: 'Move attention through your body, noticing sensations without trying to change them. Great for grounding and releasing tension.',
          },
          {
            title: 'Visualization',
            text: 'Imagine a scene, symbol, or energy in your mind. Used for manifestation, journeying, and energy work.',
          },
          {
            title: 'Mantra / Chanting',
            text: 'Repeat a word, phrase, or sound to focus the mind and shift consciousness.',
          },
          {
            title: 'Walking Meditation',
            text: 'Slow, mindful walking with attention on each step. Ideal for those who struggle to sit still.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>{card.title}</h3>
            <p className='text-zinc-400 text-sm'>{card.text}</p>
          </div>
        ))}
      </div>
    </section>

    <section id='breathwork' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        3. Breathwork Techniques
      </h2>
      <p className='text-zinc-300 leading-relaxed mb-6'>
        Breath is the bridge between body and mind. Conscious breathing
        techniques can calm, energize, or shift your state rapidly.
      </p>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          {
            title: '4-7-8 Breathing',
            type: 'Calming',
            detail: 'Inhale 4 → Hold 7 → Exhale 8 for anxiety or before sleep.',
          },
          {
            title: 'Box Breathing',
            type: 'Balancing',
            detail: 'Inhale 4 → Hold 4 → Exhale 4 → Hold 4 for focus and calm.',
          },
          {
            title: 'Energizing Breath',
            type: 'Activation',
            detail: 'Quick, sharp breaths before ritual to raise energy.',
          },
          {
            title: 'Deep Belly Breathing',
            type: 'Grounding',
            detail:
              'Slow inhales into the belly to activate the parasympathetic system.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>{card.title}</h3>
            <p className='text-zinc-400 text-sm mb-1'>{card.type}</p>
            <p className='text-zinc-500 text-xs'>{card.detail}</p>
          </div>
        ))}
      </div>
    </section>

    <section id='grounding-methods' className='mb-16'>
      <h2 className='text-3xl font-light text-zinc-100 mb-6'>
        4. Grounding Methods Before & After Ritual
      </h2>
      <p className='text-zinc-300 leading-relaxed mb-6'>
        Ground before ritual to create a stable foundation. Ground after ritual
        to discharge excess energy and return to ordinary awareness.
      </p>
      <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
        <h3 className='text-lg font-medium text-zinc-100 mb-3'>
          Tree Roots Visualization
        </h3>
        <ol className='space-y-2 text-zinc-400 text-sm'>
          <li>1. Sit or stand comfortably with feet flat on the floor</li>
          <li>2. Take three deep breaths to center</li>
          <li>3. Visualize roots growing from the soles of your feet</li>
          <li>4. See them extend through soil into deep earth</li>
          <li>5. Feel stable, connected, anchored</li>
          <li>6. Draw earth energy up through the roots if desired</li>
        </ol>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {[
          {
            title: 'Physical Grounding',
            text: 'Touch the earth, eat, or splash cold water to pull attention back to the body.',
          },
          {
            title: 'Stone Holding',
            text: 'Hold a grounding stone (tourmaline, hematite) and visualize excess energy draining into it.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>{card.title}</h3>
            <p className='text-zinc-400 text-sm'>{card.text}</p>
          </div>
        ))}
      </div>
    </section>

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
            • <strong>Morning:</strong> Three conscious breaths before rising
          </li>
          <li>
            • <strong>Eating:</strong> One meal per week eaten slowly and
            without screens
          </li>
          <li>
            • <strong>Walking:</strong> Feel your feet on the ground as you walk
          </li>
          <li>
            • <strong>Waiting:</strong> Use waiting time for breath awareness
            instead of scrolling
          </li>
          <li>
            • <strong>Evening:</strong> Brief gratitude or reflection before
            sleep
          </li>
        </ul>
      </div>
      <p className='text-zinc-400 text-sm mt-4'>
        Small, consistent moments of presence add up. You don&apos;t need an
        hour—you just need regular awareness.
      </p>
    </section>

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

    <section className='bg-gradient-to-r from-lunary-primary-900/30 to-blue-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
      <h2 className='text-2xl font-light text-zinc-100 mb-4'>
        Begin Your Practice
      </h2>
      <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
        Start with just 5 minutes today. Record your experience in your Book of
        Shadows and build from there.
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
  </>
);

export default function MeditationPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Meditation & Grounding'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={
        (metadata.alternates?.canonical as string) ??
        'https://lunary.app/grimoire/meditation'
      }
      tableOfContents={tableOfContents}
      whatIs={{
        question: 'Why meditate alongside magical practice?',
        answer:
          'Meditation calms the mind, sharpens focus, and increases energetic sensitivity so spellwork and ritual align with your intention.',
      }}
      intro='Meditation and grounding are the foundation of any magical practice. This guide walks through methods, breathwork, grounding rituals, and mindful living to keep your energy balanced.'
      heroContent={
        <p className='text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto'>
          Meditation develops the focus, awareness, and presence that power
          effective magical work. Grounding keeps you stable before and after
          ritual, so you can move energy with control.
        </p>
      }
      faqs={faqs}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='meditation'
          title='Meditation Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      {sections}
    </SEOContentTemplate>
  );
}
