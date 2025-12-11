export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import {
  createArticleSchema,
  createFAQPageSchema,
  createItemListSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import Crystals from '../components/Crystals';
import { crystalDatabase } from '@/constants/grimoire/crystals';

export const metadata: Metadata = {
  title: 'Crystals A-Z: Meanings, Properties & Healing Guide - Lunary',
  description:
    'Complete guide to crystals and their meanings. Learn how to choose, cleanse, and work with crystals for healing, protection, and magical practice. 50+ crystals with properties and uses.',
  keywords: [
    'crystals',
    'crystal meanings',
    'crystal healing',
    'crystal guide',
    'gemstones',
    'crystal properties',
    'how to use crystals',
    'crystal magic',
  ],
  openGraph: {
    title: 'Crystals A-Z: Meanings, Properties & Healing Guide - Lunary',
    description:
      'Complete guide to crystals for healing, protection, and magical practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/crystals',
    images: [
      {
        url: '/api/og/grimoire/crystals',
        width: 1200,
        height: 630,
        alt: 'Crystals Guide - Lunary',
      },
    ],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/crystals',
  },
};

const faqs = [
  {
    question: 'How do I choose the right crystal?',
    answer:
      'Trust your intuition. If a crystal catches your eye or you feel drawn to it, that\'s often the one you need. You can also choose based on intention—research which crystals correspond to your goal. In person, hold several and notice which feels "right" in your hand.',
  },
  {
    question: 'How do I cleanse my crystals?',
    answer:
      'Common methods include: moonlight (leave under a Full Moon overnight), running water (not for soft or water-soluble crystals), salt (bury in salt for 24 hours), smoke (pass through sage or incense smoke), sound (use singing bowls or bells), or selenite (place on a selenite slab overnight).',
  },
  {
    question: 'How do I charge a crystal?',
    answer:
      'After cleansing, charge by placing in sunlight or moonlight, holding and visualizing your intention flowing into it, or placing on a crystal cluster. Full Moon light is especially powerful for charging. State your intention clearly as you charge.',
  },
  {
    question:
      'Can I use crystals for magic even if I do not believe they have power?',
    answer:
      'Crystals serve as focus points for intention. Whether you view them as having inherent energy or as psychological tools, they help concentrate your attention on your goal. Skeptical practitioners often find crystals useful as ritual objects and visual reminders of their intentions.',
  },
  {
    question: 'Are some crystals dangerous?',
    answer:
      'Some crystals contain toxic minerals and should not be placed in water or handled extensively without washing hands afterward. Examples include malachite (copper), cinnabar (mercury), and galena (lead). Research any crystal before using in elixirs or prolonged skin contact.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Crystal Uses',
    links: [
      { label: 'Protection Magic', href: '/grimoire/protection' },
      { label: 'Manifestation', href: '/grimoire/manifestation' },
      { label: 'Meditation', href: '/grimoire/meditation' },
      { label: 'Chakras', href: '/grimoire/chakras' },
    ],
  },
  {
    title: 'Related Correspondences',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Colors', href: '/grimoire/correspondences/colors' },
      { label: 'Elements', href: '/grimoire/correspondences/elements' },
    ],
  },
  {
    title: 'Learn More',
    links: [
      {
        label: 'Crystal Healing Guide',
        href: '/grimoire/guides/crystal-healing-guide',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function CrystalsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Crystals A-Z: Meanings, Properties & Healing Guide',
    description:
      'Complete guide to crystals for healing, protection, and magical practice.',
    url: 'https://lunary.app/grimoire/crystals',
    keywords: ['crystals', 'crystal healing', 'gemstones'],
    section: 'Correspondences',
  });

  const faqSchema = createFAQPageSchema(faqs);

  const crystalListSchema = createItemListSchema({
    name: 'Complete Crystal Guide',
    description:
      'Comprehensive guide to crystals, their meanings, properties, and how to work with them.',
    url: 'https://lunary.app/grimoire/crystals',
    items: crystalDatabase.slice(0, 50).map((crystal) => ({
      name: crystal.name,
      url: `https://lunary.app/grimoire/crystals/${crystal.id}`,
      description: crystal.description,
    })),
  });

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(crystalListSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Crystals', url: '/grimoire/crystals' },
        ]),
      )}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Crystals' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Crystals
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Meanings, Properties & Healing
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Crystals are powerful allies for healing, protection, and magical
          work. Each stone carries unique vibrational properties that can
          support your intentions, balance energy, and amplify your practice.
          This guide covers how to choose, cleanse, and work with crystals
          effectively.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#how-crystals-work'
              className='hover:text-lunary-primary-400'
            >
              1. How Crystals Work
            </a>
          </li>
          <li>
            <a href='#choosing' className='hover:text-lunary-primary-400'>
              2. Choosing Your Crystals
            </a>
          </li>
          <li>
            <a href='#cleansing' className='hover:text-lunary-primary-400'>
              3. Cleansing & Charging
            </a>
          </li>
          <li>
            <a href='#working-with' className='hover:text-lunary-primary-400'>
              4. Working with Crystals
            </a>
          </li>
          <li>
            <a href='#starter-kit' className='hover:text-lunary-primary-400'>
              5. Beginner&apos;s Starter Kit
            </a>
          </li>
          <li>
            <a href='#all-crystals' className='hover:text-lunary-primary-400'>
              6. All Crystals A-Z
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
      <section id='how-crystals-work' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. How Crystals Work
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals form deep within the Earth over millions of years, their
          molecular structures creating unique vibrational frequencies. From a
          metaphysical perspective, these frequencies interact with your own
          energy field, supporting specific intentions.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Practically, crystals serve as:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>
            • <strong>Focus tools:</strong> They anchor your attention on your
            intention
          </li>
          <li>
            • <strong>Symbolic reminders:</strong> Their presence recalls your
            goals
          </li>
          <li>
            • <strong>Ritual objects:</strong> They add weight and meaning to
            magical work
          </li>
          <li>
            • <strong>Energy amplifiers:</strong> They can intensify the energy
            you direct
          </li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <p className='text-zinc-400 text-sm'>
            Whether you see crystals as having inherent metaphysical properties
            or as psychological tools, they can be valuable allies in your
            practice. Their beauty and earth-born nature connect you to
            something larger than yourself.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id='choosing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Choosing Your Crystals
        </h2>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Intuition</h3>
            <p className='text-zinc-400 text-sm'>
              Which crystal catches your eye? Which do you feel drawn to touch?
              Trust that pull—your subconscious often knows what you need.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Intention</h3>
            <p className='text-zinc-400 text-sm'>
              Research which crystals correspond to your goal. Need protection?
              Consider black tourmaline. Seeking love? Try rose quartz.
              Manifesting? Look to citrine.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Chakra</h3>
            <p className='text-zinc-400 text-sm'>
              Match crystal colors to chakras: red/root, orange/sacral,
              yellow/solar plexus, green-pink/heart, blue/throat, indigo/third
              eye, violet-white/crown.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Feel</h3>
            <p className='text-zinc-400 text-sm'>
              If buying in person, hold several crystals. Notice which feels
              warm, tingly, or &quot;right&quot; in your hand. Your body can
              sense resonance.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id='cleansing' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Cleansing & Charging
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals absorb energy from their environment and previous handlers.
          Cleansing clears this accumulated energy; charging programs them with
          your intention.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Cleansing Methods
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>Moonlight:</strong> Leave under
              the Full Moon overnight (safe for all crystals)
            </li>
            <li>
              <strong className='text-zinc-200'>Running water:</strong> Hold
              under a stream for a minute (not for soft or water-soluble stones)
            </li>
            <li>
              <strong className='text-zinc-200'>Salt:</strong> Bury in sea salt
              for 24 hours (not for porous stones)
            </li>
            <li>
              <strong className='text-zinc-200'>Smoke:</strong> Pass through
              sage, palo santo, or incense smoke
            </li>
            <li>
              <strong className='text-zinc-200'>Sound:</strong> Use singing
              bowls, bells, or tuning forks
            </li>
            <li>
              <strong className='text-zinc-200'>Selenite:</strong> Place on a
              selenite slab overnight (selenite self-cleanses)
            </li>
          </ul>
        </div>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Charging Your Crystal
          </h3>
          <ol className='space-y-2 text-zinc-300 text-sm'>
            <li>1. Hold the cleansed crystal in your hands</li>
            <li>2. Close your eyes and take a few deep breaths</li>
            <li>3. Clearly state or visualize your intention</li>
            <li>4. Imagine that intention flowing into the crystal</li>
            <li>5. Say: &quot;I charge this crystal for [purpose]&quot;</li>
          </ol>
        </div>
      </section>

      {/* Section 4 */}
      <section id='working-with' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Working with Crystals
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Carry Them</h3>
            <p className='text-zinc-400 text-sm'>
              Keep a small tumbled stone in your pocket or bag. Touch it
              throughout the day to reconnect with your intention.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Wear Them</h3>
            <p className='text-zinc-400 text-sm'>
              Crystal jewelry keeps the stone in contact with your energy field
              all day. Pendants near the heart are especially powerful.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Meditate With Them
            </h3>
            <p className='text-zinc-400 text-sm'>
              Hold a crystal during meditation or place it on a relevant chakra.
              Focus on its energy and let impressions arise.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Place in Space</h3>
            <p className='text-zinc-400 text-sm'>
              Put protective crystals by doors, calming ones in the bedroom,
              focus stones on your desk. Let them anchor energy in your space.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Use in Rituals</h3>
            <p className='text-zinc-400 text-sm'>
              Include crystals on your altar, in candle spells, in jar spells,
              or as offerings. They amplify ritual energy.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Create Grids</h3>
            <p className='text-zinc-400 text-sm'>
              Arrange multiple crystals in sacred geometric patterns to create
              energy fields for specific purposes.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id='starter-kit' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Beginner&apos;s Starter Kit
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          If you&apos;re just starting, these versatile crystals cover most
          common needs:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/crystals/clear-quartz'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Clear Quartz</h3>
            <p className='text-zinc-400 text-sm'>
              The &quot;master healer.&quot; Amplifies intention, cleanses
              energy, substitutes for almost any crystal.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/amethyst'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Amethyst</h3>
            <p className='text-zinc-400 text-sm'>
              Intuition, protection, peace. Excellent for meditation and
              developing psychic abilities.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/rose-quartz'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Rose Quartz</h3>
            <p className='text-zinc-400 text-sm'>
              Love, self-compassion, heart healing. The go-to stone for
              emotional work.
            </p>
          </Link>
          <Link
            href='/grimoire/crystals/black-tourmaline'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Black Tourmaline</h3>
            <p className='text-zinc-400 text-sm'>
              Protection, grounding, absorbs negativity. Essential for empaths
              and sensitive people.
            </p>
          </Link>
        </div>
      </section>

      {/* Section 6 - Crystals Component */}
      <section id='all-crystals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. All Crystals A-Z
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Browse our complete crystal database. Click any crystal to see its
          full properties, correspondences, and uses.
        </p>

        <Crystals />
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
        entityKey='crystals'
        title='Crystal Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
