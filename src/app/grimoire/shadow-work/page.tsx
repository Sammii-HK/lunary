export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

export const metadata: Metadata = {
  title: "Shadow Work: A Witch's Guide to Healing & Integration - Lunary",
  description:
    'Complete guide to shadow work for witches and spiritual practitioners. Learn what the shadow is, safe practices for self-exploration, journaling prompts, and integration rituals.',
  keywords: [
    'shadow work',
    'shadow self',
    'inner work',
    'healing',
    'self-discovery',
    'shadow integration',
    'jung shadow',
  ],
  openGraph: {
    title: "Shadow Work: A Witch's Guide to Healing - Lunary",
    description:
      'Complete guide to shadow work for witches and spiritual practitioners.',
    type: 'article',
    url: 'https://lunary.app/grimoire/shadow-work',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/shadow-work',
  },
};

const faqs = [
  {
    question: 'Is shadow work dangerous?',
    answer:
      "It can surface difficult emotions, but it's safe when done slowly with self-compassion. Trauma survivors should pair shadow work with a therapist or trusted guide.",
  },
  {
    question: 'How long does shadow work take?',
    answer:
      'Shadow work is ongoing. Some aspects integrate quickly; others evolve over years. The practice is about steady self-awareness, not a finish line.',
  },
  {
    question: 'Can astrology help with shadow work?',
    answer:
      'Absolutely. Pluto, the 8th & 12th houses, and the South Node point to shadow themes deserving attention.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Shadow Work Tools',
    links: [
      { label: 'Archetypes', href: '/grimoire/archetypes' },
      { label: 'Tarot', href: '/grimoire/tarot' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Protection', href: '/grimoire/protection' },
      { label: 'Birth Chart', href: '/birth-chart' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    ],
  },
];

const tableOfContents = [
  { label: 'What Is the Shadow?', href: '#what-is-shadow' },
  { label: 'Safety & Self-Regulation', href: '#safety' },
  { label: 'Recognizing Your Shadow', href: '#recognizing' },
  { label: 'Journaling Prompts', href: '#journaling' },
  { label: 'Shadow Work Rituals', href: '#rituals' },
  { label: 'Integration & Practice', href: '#integration' },
  { label: 'FAQ', href: '#faq' },
];

const whatIs = {
  question: 'What is shadow work?',
  answer:
    'Shadow work brings rejected traits, emotions, and patterns into awareness so you can heal them and reclaim the energy they held.',
};

const intro =
  'The shadow is a storehouse of disowned emotions, desires, and parts of ourselves we hide. Shadow work invites curiosity, compassion, and structured practices to integrate that energy rather than fight it.';

const howToWorkWith = [
  'Go slowly and honor your regulation capacity—deep dives don’t need to happen every day.',
  'Journal without censorship, naming what shows up in dreams, reactions, and triggers.',
  'Ritualize shadow work with candles, mirrors, and sacred space to contain the energy safely.',
  'Integrate by dialoguing with shadow parts, affirming them, and taking actions that honor the whole you.',
];

const relatedItems = [
  {
    name: 'Archetypes Guide',
    href: '/grimoire/archetypes',
    type: 'Inner themes',
  },
  { name: 'Protection', href: '/grimoire/protection', type: 'Boundaries' },
  {
    name: 'Modern Witchcraft',
    href: '/grimoire/modern-witchcraft',
    type: 'Practice',
  },
  { name: 'Book of Shadows', href: '/book-of-shadows', type: 'Journal' },
];

export default function ShadowWorkPage() {
  return (
    <SEOContentTemplate
      title={metadata.title as string}
      h1='Shadow Work'
      description={metadata.description as string}
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      tableOfContents={tableOfContents}
      whatIs={whatIs}
      intro={intro}
      tldr='Shadow work brings hidden patterns into awareness so you can heal and integrate them with compassion.'
      meaning={`Shadow work is not about fixing yourself. It is about meeting the parts you avoided and giving them space. When you integrate those parts, you reclaim energy and clarity.

Start small. Pick one trigger, explore it gently, and choose one supportive action. Consistency builds safety.

Think of it as a long-term relationship with yourself. The goal is trust, not perfection.

Small, honest steps matter more than dramatic breakthroughs.`}
      howToWorkWith={howToWorkWith}
      rituals={[
        'Light a candle and name one pattern you want to understand.',
        'Write a short letter to your shadow and respond with compassion.',
        'Ground after each session with breath or a short walk.',
      ]}
      journalPrompts={[
        'What emotion do I resist most and why?',
        'Where do I feel triggered and what is underneath it?',
        'What would self-compassion look like today?',
      ]}
      tables={[
        {
          title: 'Shadow Work Rhythm',
          headers: ['Phase', 'Focus'],
          rows: [
            ['Notice', 'Identify triggers and patterns'],
            ['Explore', 'Journal and reflect safely'],
            ['Integrate', 'Choose one small action'],
          ],
        },
      ]}
      internalLinks={[
        { text: 'Archetypes', href: '/grimoire/archetypes' },
        { text: 'Tarot', href: '/grimoire/tarot' },
        { text: 'Meditation', href: '/grimoire/meditation' },
        { text: 'Grimoire Home', href: '/grimoire' },
      ]}
      faqs={faqs}
      relatedItems={relatedItems}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='shadow-work'
          title='Shadow Work Connections'
          sections={cosmicConnectionsSections}
        />
      }
    >
      <div className='mb-6 rounded-xl border border-lunary-error-700 bg-lunary-error-900/20 p-6'>
        <h2 className='text-lg font-medium text-lunary-error-300 mb-2'>
          Safety First
        </h2>
        <p className='text-zinc-300 text-sm'>
          Shadow work can feel intense. If you have trauma, work with a
          therapist alongside your practice. Proceed slowly, practice
          self-compassion, and pause when needed.
        </p>
      </div>

      <section id='what-is-shadow' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is the Shadow?
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Carl Jung coined "shadow" to describe the parts of ourselves we reject
          or hide—traits, emotions, desires, or memories deemed unacceptable.
        </p>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          The shadow also contains power, passion, and talents we silenced out
          of fear.
        </p>
        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Emotions we were taught to suppress</li>
          <li>• Desires we labeled as shameful</li>
          <li>• Talents we were told to hide</li>
          <li>• Painful memories we pushed away</li>
        </ul>
        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Why Shadow Work Matters for Witches
          </h3>
          <p className='text-zinc-300 text-sm'>
            Unintegrated shadow drains energy. Shadow work clears distortions so
            spells and rituals reflect your whole self.
          </p>
        </div>
      </section>

      <section id='safety' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Safety & Self-Regulation
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Before diving deep, anchor yourself with coping tools and
          compassionate pacing.
        </p>
        <div className='space-y-4'>
          {[
            {
              title: 'Go Slowly',
              desc: 'Work on one aspect at a time. If you feel overwhelmed, pause and ground.',
            },
            {
              title: 'Have Support',
              desc: 'A friend, therapist, or spiritual community helps process what arises.',
            },
            {
              title: 'Self-Compassion',
              desc: 'The shadow protected you. Approach it with gratitude, not judgment.',
            },
            {
              title: 'Know Your Limits',
              desc: 'If you have trauma, partner with a therapist—shadow work complements therapy, not replaces it.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'
            >
              <h3 className='font-medium text-zinc-100 mb-2'>{item.title}</h3>
              <p className='text-zinc-400 text-sm'>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id='recognizing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Recognizing Your Shadow
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Patterns, reactions, and discomfort reveal the shadow.
        </p>
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Shadow Signals
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Strong reactions—anger or envy revealing mirrored traits</li>
            <li>• Recurring relationship dynamics or failures</li>
            <li>• “I would never…” statements</li>
            <li>• Disturbing dreams or symbols</li>
            <li>• Physical tension without clear cause</li>
          </ul>
        </div>
      </section>

      <section id='journaling' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Shadow Work Journaling Prompts
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Journaling lets you safely track shadow material without censor.
        </p>
        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Prompts to Explore
          </h3>
          <ul className='space-y-3 text-zinc-300 text-sm'>
            <li>• What trait do I judge harshly in others?</li>
            <li>• Which emotions were labeled “bad” in childhood?</li>
            <li>• What part of myself am I hiding?</li>
            <li>• When do I feel most ashamed?</li>
            <li>• What patterns repeat in my relationships?</li>
            <li>• What do I fear others will discover?</li>
            <li>• What gifts did I learn to suppress?</li>
            <li>• If judgment vanished, how would I show up differently?</li>
          </ul>
        </div>
        <div className='mt-4'>
          <Link
            href='/book-of-shadows'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Journal in your Book of Shadows →
          </Link>
        </div>
      </section>

      <section id='rituals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Shadow Work Rituals
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ritual gives structure and safety—especially the Dark Moon and mirror
          meditations.
        </p>
        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Dark Moon Ritual
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              The Dark Moon offers quiet reflection for shadow work.
            </p>
            <ol className='space-y-2 text-zinc-400 text-sm'>
              <li>1. Create sacred space and ground</li>
              <li>2. Light a dark candle</li>
              <li>3. Journal on a prompt</li>
              <li>4. Speak aloud your discoveries</li>
              <li>5. Thank the shadow part</li>
              <li>6. Close with grounding</li>
            </ol>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Mirror Meditation
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Gaze softly into your eyes to meet shadow reflections.
            </p>
            <ol className='space-y-2 text-zinc-400 text-sm'>
              <li>1. Dim lights, light candles beside your mirror</li>
              <li>2. Gaze gently into your eyes</li>
              <li>3. Notice feelings and images</li>
              <li>4. Speak kindly to yourself</li>
              <li>5. Journal afterward</li>
            </ol>
          </div>
        </div>
      </section>

      <section id='integration' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Integration & Ongoing Practice
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-6'>
          Integration accepts the shadow and honors its energy through dialogue,
          self-parenting, and action.
        </p>
        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Integration Practices
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>• Dialogue with shadow parts in writing</li>
            <li>• Self-parent wounded aspects</li>
            <li>• Express emotion through art, movement, or sound</li>
            <li>• Affirm “I accept this part of myself”</li>
            <li>• Choose actions honoring your whole self</li>
          </ul>
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
    </SEOContentTemplate>
  );
}
