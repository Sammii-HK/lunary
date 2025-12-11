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
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Modern Witchcraft: Paths, Practice & Community - Lunary',
  description:
    'Comprehensive guide to modern witchcraft at Lunary. Explore different witch paths, core practices, building a sustainable practice, and finding community.',
  keywords: [
    'modern witchcraft',
    'witchcraft guide',
    'types of witches',
    'witchcraft practice',
    'how to become a witch',
    'witchcraft for beginners',
  ],
  openGraph: {
    title: 'Modern Witchcraft: Paths, Practice & Community - Lunary',
    description:
      'Comprehensive guide to modern witchcraft: paths, practices, and community.',
    type: 'article',
    url: 'https://lunary.app/grimoire/modern-witchcraft',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft',
  },
};

const faqs = [
  {
    question: 'Do I need to join a coven to be a witch?',
    answer:
      'No. Many practitioners are solitary witches who practice alone. Covens offer community and mentorship, but they are not required. Some practitioners join covens later, others remain solitary their entire practice. Choose what fits your life and needs.',
  },
  {
    question: 'Is witchcraft a religion?',
    answer:
      'Witchcraft can be a religion (as in Wicca), a spiritual practice, or simply a set of techniques and skills. Some witches are deeply religious, others are spiritual but not religious, and some are atheist or secular. Witchcraft is flexible and can be adapted to your beliefs.',
  },
  {
    question: 'What tools do I need to start practicing?',
    answer:
      'You can start with minimal tools: a journal (Book of Shadows), candles, and your focused intention. Traditional tools like athame, wand, chalice, and cauldron can be added over time but are not required. Many effective spells use only household items.',
  },
  {
    question: 'How do I know which path is right for me?',
    answer:
      'Start by noticing what naturally draws you. Do you love plants? Explore green witchcraft. Drawn to the ocean? Sea witchcraft. Love cooking? Kitchen witchcraft. You can also be an eclectic witch who combines multiple paths. There is no wrong answer.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Explore Witch Paths',
    links: [
      {
        label: 'Types of Witches',
        href: '/grimoire/modern-witchcraft/witch-types',
      },
      { label: 'Tools Guide', href: '/grimoire/modern-witchcraft/tools-guide' },
      {
        label: 'Witchcraft Ethics',
        href: '/grimoire/modern-witchcraft/ethics',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
  {
    title: 'Practices',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
    ],
  },
  {
    title: 'Inner Work & Protection',
    links: [
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
      { label: 'Protection Magic', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Meditation & Grounding', href: '/grimoire/meditation' },
    ],
  },
];

export default function ModernWitchcraftPage() {
  const articleSchema = createArticleSchema({
    headline: 'Modern Witchcraft: Paths, Practice & Community',
    description:
      'Comprehensive guide to modern witchcraft: paths, practices, and community.',
    url: 'https://lunary.app/grimoire/modern-witchcraft',
    keywords: ['modern witchcraft', 'witchcraft', 'witch paths'],
    section: 'Witchcraft',
  });

  const faqSchema = createFAQPageSchema(faqs);
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Grimoire', url: '/grimoire' },
    { name: 'Modern Witchcraft', url: '/grimoire/modern-witchcraft' },
  ]);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(breadcrumbSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Modern Witchcraft
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Paths, Practice & Community
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Modern witchcraft is a diverse spiritual practice that honors nature,
          works with energy, and empowers practitioners to create positive
          change. This guide covers what modern witchcraft means at Lunary, the
          many paths you can explore, and how to build a sustainable practice.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#what-is-witchcraft'
              className='hover:text-lunary-primary-400'
            >
              1. What Modern Witchcraft Means at Lunary
            </a>
          </li>
          <li>
            <a href='#paths' className='hover:text-lunary-primary-400'>
              2. Common Witch Paths
            </a>
          </li>
          <li>
            <a href='#core-practices' className='hover:text-lunary-primary-400'>
              3. Core Practices
            </a>
          </li>
          <li>
            <a href='#sustainable' className='hover:text-lunary-primary-400'>
              4. Building a Sustainable Practice
            </a>
          </li>
          <li>
            <a href='#community' className='hover:text-lunary-primary-400'>
              5. Community, Solitary Practice & Safety
            </a>
          </li>
          <li>
            <a href='#where-next' className='hover:text-lunary-primary-400'>
              6. Where to Go Next
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
      <section id='what-is-witchcraft' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Modern Witchcraft Means at Lunary
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          At Lunary, modern witchcraft is a practice—not a religion, not a fixed
          tradition, not a set of rigid rules. It is a way of engaging with the
          world that honors natural cycles, works with symbolic and energetic
          tools, and places responsibility for your path in your own hands.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          We define witchcraft broadly: the intentional use of focus, ritual,
          correspondences, and timing to create change. This includes spellwork,
          divination (like tarot), working with moon phases, herb and crystal
          magic, and journaling for self-discovery.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Principles at Lunary
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>
                Personal responsibility:
              </strong>{' '}
              You are the authority over your own practice
            </li>
            <li>
              <strong className='text-zinc-200'>Harm reduction:</strong> We do
              not support manipulation, curses, or controlling others
            </li>
            <li>
              <strong className='text-zinc-200'>Inclusivity:</strong> All paths
              are welcome; no single tradition is the &quot;right&quot; one
            </li>
            <li>
              <strong className='text-zinc-200'>Grounded practice:</strong>{' '}
              Magic supports action—it does not replace practical effort
            </li>
            <li>
              <strong className='text-zinc-200'>Continuous learning:</strong>{' '}
              Stay curious, humble, and open to growth
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Paths */}
      <section id='paths' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Common Witch Paths
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          There are many ways to practice witchcraft. These &quot;paths&quot;
          describe where practitioners focus their energy and which elements
          resonate with them most deeply. Most witches blend multiple paths.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌿 Green Witch</h3>
            <p className='text-zinc-400 text-sm'>
              Works with plants, herbs, gardens, and nature magic. Connected to
              the earth element.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🍳 Kitchen Witch</h3>
            <p className='text-zinc-400 text-sm'>
              Practices magic through cooking, baking, and domestic activities.
              The home is sacred space.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌙 Hedge Witch</h3>
            <p className='text-zinc-400 text-sm'>
              Works between worlds, often practicing spirit communication,
              journeying, and liminal magic.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>✨ Cosmic Witch</h3>
            <p className='text-zinc-400 text-sm'>
              Works with astrology, planetary magic, and celestial timing.
              Aligned with cosmic cycles.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>🌊 Sea Witch</h3>
            <p className='text-zinc-400 text-sm'>
              Connected to ocean magic, water element, moon tides, and coastal
              practices.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              🔮 Eclectic Witch
            </h3>
            <p className='text-zinc-400 text-sm'>
              Draws from multiple traditions and paths, creating a personalized
              practice.
            </p>
          </div>
        </div>

        <Link
          href='/grimoire/modern-witchcraft/witch-types'
          className='text-lunary-primary-400 hover:text-lunary-primary-300'
        >
          Explore all witch types →
        </Link>
      </section>

      {/* Section 3: Core Practices */}
      <section id='core-practices' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Core Practices
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Regardless of your specific path, these core practices form the
          foundation of most witchcraft traditions:
        </p>

        <div className='space-y-4'>
          <Link
            href='/grimoire/spells/fundamentals'
            className='block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Spellwork</h3>
            <p className='text-zinc-400 text-sm'>
              Focused rituals combining intention, symbolism, and action to
              create change.
            </p>
          </Link>
          <Link
            href='/grimoire/meditation'
            className='block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>
              Meditation & Grounding
            </h3>
            <p className='text-zinc-400 text-sm'>
              Centering yourself, connecting to earth energy, and clearing your
              mind before magical work.
            </p>
          </Link>
          <Link
            href='/grimoire/divination'
            className='block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Divination</h3>
            <p className='text-zinc-400 text-sm'>
              Tarot, pendulum, runes, scrying—tools for reflection and gaining
              perspective.
            </p>
          </Link>
          <Link
            href='/grimoire/correspondences'
            className='block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Correspondences</h3>
            <p className='text-zinc-400 text-sm'>
              Understanding the symbolic associations of colors, herbs,
              crystals, planets, and days.
            </p>
          </Link>
          <Link
            href='/grimoire/wheel-of-the-year'
            className='block p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>
              Seasonal Celebration
            </h3>
            <p className='text-zinc-400 text-sm'>
              Honoring the Wheel of the Year—sabbats and esbats that mark the
              turning seasons.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 4: Sustainable Practice */}
      <section id='sustainable' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Building a Sustainable Practice
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A sustainable practice is one you can maintain over years—not intense
          bursts followed by burnout. Here are principles for building something
          lasting:
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <ul className='space-y-4 text-zinc-300'>
            <li>
              <strong className='text-lunary-primary-300'>
                Start small and simple.
              </strong>{' '}
              A daily 5-minute practice is more powerful than an elaborate
              weekly ritual you skip half the time.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Build habits, not just skills.
              </strong>{' '}
              Consistency matters more than complexity. Light a candle, draw a
              card, journal a sentence—small rituals compound.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Match your practice to your life.
              </strong>{' '}
              Busy parent? Kitchen witchcraft fits. Night owl? Moon magic calls.
              Adapt to your reality.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Track and reflect.
              </strong>{' '}
              Keep a Book of Shadows. Note what works, what doesn&apos;t, and
              how you change over time.
            </li>
            <li>
              <strong className='text-lunary-primary-300'>
                Rest is part of the cycle.
              </strong>{' '}
              Fallow periods are natural. A witch who rests during the dark moon
              is practicing, not failing.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 5: Community */}
      <section id='community' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Community, Solitary Practice & Safety
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          You can practice entirely alone, with a small group, or within a
          formal coven or tradition. Each has advantages:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Solitary Practice
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Complete freedom to design your path</li>
              <li>• Practice on your own schedule</li>
              <li>• No politics or group dynamics</li>
              <li>• Can feel isolating at times</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Group Practice</h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>• Community and support</li>
              <li>• Learning from experienced practitioners</li>
              <li>• Shared rituals and celebrations</li>
              <li>• Requires finding safe, ethical groups</li>
            </ul>
          </div>
        </div>

        <div className='bg-lunary-error-900/20 border border-lunary-error-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-error-300 mb-3'>
            Safety in Community
          </h3>
          <p className='text-zinc-300 text-sm mb-3'>
            Unfortunately, not all groups are safe. Watch for red flags:
          </p>
          <ul className='text-zinc-400 text-sm space-y-1'>
            <li>• Leaders who demand unquestioning obedience</li>
            <li>• Pressure to share personal/financial information</li>
            <li>
              • Sexual coercion framed as &quot;spiritual initiation&quot;
            </li>
            <li>• Isolation from friends and family</li>
            <li>
              • Claims of exclusive truth or &quot;the only real path&quot;
            </li>
          </ul>
          <p className='text-zinc-400 text-sm mt-3'>
            Trust your instincts. A good teacher welcomes questions.
          </p>
        </div>
      </section>

      {/* Section 6: Where Next */}
      <section id='where-next' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Where to Go Next
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Ready to dive deeper? Here are recommended next steps based on your
          interests:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/spells/fundamentals'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-1'>Learn Spellcraft</h3>
            <p className='text-zinc-400 text-sm'>
              Foundational principles of casting spells
            </p>
          </Link>
          <Link
            href='/grimoire/modern-witchcraft/witch-types'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-1'>Find Your Path</h3>
            <p className='text-zinc-400 text-sm'>
              Explore different types of witches
            </p>
          </Link>
          <Link
            href='/book-of-shadows'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-1'>
              Start Your Journal
            </h3>
            <p className='text-zinc-400 text-sm'>Begin your Book of Shadows</p>
          </Link>
          <Link
            href='/grimoire/modern-witchcraft/ethics'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-1'>Study Ethics</h3>
            <p className='text-zinc-400 text-sm'>
              Understand ethical practice principles
            </p>
          </Link>
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
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-violet-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Begin Your Practice
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Every experienced witch was once a complete beginner. Start where you
          are, use what you have, and let your practice grow naturally.
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/grimoire/beginners'>Beginners Guide</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/book-of-shadows'>Start Your Journal</Link>
          </Button>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='modern-witchcraft'
        title='Modern Witchcraft Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
