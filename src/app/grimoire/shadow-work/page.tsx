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
      "Shadow work can bring up difficult emotions. It's not dangerous when done gradually, with self-compassion, and appropriate support. If you have trauma, working with a therapist alongside personal practice is wise. Start small and be gentle with yourself.",
  },
  {
    question: 'How long does shadow work take?',
    answer:
      'Shadow work is not a one-time event but an ongoing practice. Some aspects can be integrated quickly; others take years. There\'s no "completion"—it\'s about developing self-awareness and self-acceptance over time.',
  },
  {
    question: 'Can shadow work be done through astrology?',
    answer:
      'Yes. Your birth chart can reveal shadow aspects—particularly the 8th house, 12th house, Pluto aspects, and the South Node. These placements point to unconscious patterns worth exploring.',
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

export default function ShadowWorkPage() {
  const articleSchema = createArticleSchema({
    headline: "Shadow Work: A Witch's Guide to Healing & Integration",
    description:
      'Complete guide to shadow work for witches and spiritual practitioners.',
    url: 'https://lunary.app/grimoire/shadow-work',
    keywords: ['shadow work', 'shadow self', 'healing', 'integration'],
    section: 'Shadow Work',
  });

  const faqSchema = createFAQPageSchema(faqs);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Shadow Work', url: '/grimoire/shadow-work' },
  ]);

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(breadcrumbSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Shadow Work' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Shadow Work
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            The Witch&apos;s Guide to Healing
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          The shadow is not your enemy—it is the hidden part of yourself that
          holds immense power when integrated. Shadow work is the practice of
          bringing unconscious patterns into awareness, accepting them, and
          reclaiming the energy they hold.
        </p>
      </header>

      <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-lunary-error-300 mb-2'>
          Safety First
        </h2>
        <p className='text-zinc-300 text-sm'>
          Shadow work can surface difficult emotions. If you have trauma or
          mental health concerns, consider working with a therapist alongside
          personal practice. Go slowly, practice self-compassion, and stop if
          you feel overwhelmed. This work is not meant to harm—it&apos;s meant
          to heal.
        </p>
      </div>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is-shadow' className='hover:text-lunary-primary-400'>
              1. What Is the Shadow?
            </a>
          </li>
          <li>
            <a href='#safety' className='hover:text-lunary-primary-400'>
              2. Safety & Self-Regulation
            </a>
          </li>
          <li>
            <a href='#recognizing' className='hover:text-lunary-primary-400'>
              3. Recognizing Your Shadow
            </a>
          </li>
          <li>
            <a href='#journaling' className='hover:text-lunary-primary-400'>
              4. Shadow Work Journaling Prompts
            </a>
          </li>
          <li>
            <a href='#rituals' className='hover:text-lunary-primary-400'>
              5. Shadow Work Rituals
            </a>
          </li>
          <li>
            <a href='#integration' className='hover:text-lunary-primary-400'>
              6. Integration & Ongoing Practice
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
      <section id='what-is-shadow' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is the Shadow?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The term &quot;shadow&quot; comes from psychologist Carl Jung. It
          refers to the parts of ourselves we reject, deny, or hide—both from
          others and from our own conscious awareness. These are traits,
          desires, and memories we&apos;ve pushed down because they felt
          unacceptable.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The shadow is not inherently &quot;bad.&quot; It often contains:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Emotions we were taught to suppress (anger, grief, joy)</li>
          <li>• Desires that felt shameful or unsafe to express</li>
          <li>• Talents and power we were told to dim</li>
          <li>• Painful memories we chose to forget</li>
          <li>• Parts of ourselves that didn&apos;t fit our environment</li>
        </ul>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Why Shadow Work Matters for Witches
          </h3>
          <p className='text-zinc-300 text-sm'>
            Unintegrated shadow drains energy and creates blind spots in magical
            work. Spells cast from unexamined wounds often backfire or manifest
            in distorted ways. Shadow work clears these blocks and gives you
            access to your full power.
          </p>
        </div>
      </section>

      {/* Section 2: Safety */}
      <section id='safety' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Safety & Self-Regulation
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Shadow work requires a foundation of self-regulation. Before diving
          deep, ensure you have coping strategies in place.
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Go Slowly</h3>
            <p className='text-zinc-400 text-sm'>
              There&apos;s no rush. Work on one aspect at a time. If you feel
              overwhelmed, stop and ground yourself. The shadow isn&apos;t going
              anywhere—you can return later.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Have Support</h3>
            <p className='text-zinc-400 text-sm'>
              A trusted friend, therapist, or spiritual community can help you
              process what arises. You don&apos;t have to do this alone.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Practice Self-Compassion
            </h3>
            <p className='text-zinc-400 text-sm'>
              The shadow formed as a survival mechanism. It protected you.
              Approach it with gratitude and gentleness, not judgment.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Know Your Limits</h3>
            <p className='text-zinc-400 text-sm'>
              If you have trauma, work with a professional. Shadow work is not a
              substitute for therapy. It&apos;s a complement.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Recognizing */}
      <section id='recognizing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Recognizing Your Shadow
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The shadow reveals itself through patterns. Learn to recognize these
          signs:
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Shadow Signals
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>
                Strong emotional reactions:
              </strong>{' '}
              Disproportionate anger, envy, or disgust toward someone often
              indicates they&apos;re mirroring something in your shadow.
            </li>
            <li>
              <strong className='text-zinc-200'>Recurring patterns:</strong> The
              same relationship dynamics, the same failures, the same situations
              appearing repeatedly.
            </li>
            <li>
              <strong className='text-zinc-200'>What you deny:</strong> &quot;I
              would never...&quot; or &quot;I&apos;m not the kind of person
              who...&quot;
            </li>
            <li>
              <strong className='text-zinc-200'>Dreams:</strong> Symbols,
              characters, and scenarios that disturb or confuse you.
            </li>
            <li>
              <strong className='text-zinc-200'>Physical symptoms:</strong>{' '}
              Unexplained tension, chronic issues without clear cause.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 4: Journaling */}
      <section id='journaling' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Shadow Work Journaling Prompts
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Journaling is one of the safest and most effective shadow work tools.
          Write freely without censoring yourself.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Prompts to Explore
          </h3>
          <ul className='space-y-3 text-zinc-300 text-sm'>
            <li>
              • What trait do I judge most harshly in others? Do I possess it?
            </li>
            <li>
              • What emotions was I taught were &quot;bad&quot; as a child?
            </li>
            <li>• What part of myself do I hide from others?</li>
            <li>• When do I feel most ashamed? What triggers that shame?</li>
            <li>• What patterns keep repeating in my relationships?</li>
            <li>• What do I fear others will discover about me?</li>
            <li>• What gifts or talents did I learn to suppress?</li>
            <li>• If I had no fear of judgment, how would I be different?</li>
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

      {/* Section 5: Rituals */}
      <section id='rituals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Shadow Work Rituals
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ritual gives structure and container for shadow exploration.
        </p>

        <div className='space-y-6'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Dark Moon Ritual
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              The Dark Moon (day before New Moon) is ideal for shadow work.
            </p>
            <ol className='space-y-2 text-zinc-400 text-sm'>
              <li>1. Create sacred space and ground yourself</li>
              <li>2. Light a black or dark blue candle</li>
              <li>3. Journal on a shadow prompt</li>
              <li>4. Speak aloud what you&apos;ve discovered</li>
              <li>5. Acknowledge and thank this part of yourself</li>
              <li>6. Close by grounding and self-soothing</li>
            </ol>
          </div>

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>
              Mirror Meditation
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Gazing into your own eyes in dim light can surface shadow
              material.
            </p>
            <ol className='space-y-2 text-zinc-400 text-sm'>
              <li>
                1. Dim the lights; light candles on either side of a mirror
              </li>
              <li>2. Gaze softly into your own eyes (not staring)</li>
              <li>3. Notice what feelings, images, or memories arise</li>
              <li>4. Speak kindly to yourself</li>
              <li>5. Journal afterward</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Section 6: Integration */}
      <section id='integration' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Integration & Ongoing Practice
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Awareness alone is not enough. Integration means accepting and
          embracing what you&apos;ve discovered—making peace with these parts
          rather than fighting them.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Integration Practices
          </h3>
          <ul className='space-y-2 text-zinc-300 text-sm'>
            <li>
              • <strong>Dialogue:</strong> Write conversations with your shadow
              parts
            </li>
            <li>
              • <strong>Self-parenting:</strong> Give your wounded parts what
              they needed
            </li>
            <li>
              • <strong>Expression:</strong> Let repressed emotions move through
              art, movement, or sound
            </li>
            <li>
              • <strong>Affirmation:</strong> &quot;I accept this part of
              myself&quot;
            </li>
            <li>
              • <strong>Action:</strong> Make choices that honor your full self,
              not just the acceptable parts
            </li>
          </ul>
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

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='shadow-work'
        title='Shadow Work Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
