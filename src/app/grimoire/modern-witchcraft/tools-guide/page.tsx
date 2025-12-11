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
  title: 'Tools of the Craft: Complete Witchcraft Tools Guide - Lunary',
  description:
    'Guide to witchcraft tools: athame, wand, chalice, pentacle, cauldron, candles, crystals, herbs, and digital tools. Learn what each tool represents and how to use them.',
  keywords: [
    'witchcraft tools',
    'athame',
    'wand',
    'chalice',
    'pentacle',
    'cauldron',
    'witchcraft supplies',
    'ritual tools',
  ],
  openGraph: {
    title: 'Tools of the Craft - Lunary',
    description:
      'Complete guide to witchcraft tools and how to use them in your practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
  },
};

const faqs = [
  {
    question: 'Do I need all these tools to practice witchcraft?',
    answer:
      'No. You can start with just your intention, a journal, and perhaps a candle. Many powerful practitioners work with minimal tools. Add items gradually as they call to you and as your budget allows.',
  },
  {
    question: 'Can I make my own tools?',
    answer:
      'Absolutely. Handmade tools carry your personal energy and can be more powerful than purchased ones. Carve a wand from a fallen branch, shape a pentacle from clay, or repurpose household items.',
  },
  {
    question: 'Do tools need to be expensive?',
    answer:
      'Not at all. A kitchen knife can serve as an athame, a wine glass as a chalice, a stick as a wand. Your intention and connection to the tool matter far more than its price.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Using Your Tools',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
    ],
  },
  {
    title: 'Tool-Related Resources',
    links: [
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function WitchcraftToolsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Tools of the Craft: Complete Witchcraft Tools Guide',
    description:
      'Complete guide to witchcraft tools and how to use them in your practice.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/tools-guide',
    keywords: ['witchcraft tools', 'ritual tools', 'magical tools'],
    section: 'Witchcraft',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Tools Guide' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Tools of the Craft
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Working With Magical Tools
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Tools are extensions of your will and intention. They help focus
          energy, create sacred space, and add symbolic weight to your
          practice—but they are never required. Your intention is always the
          most powerful tool.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a
              href='#intuitive-vs-dogmatic'
              className='hover:text-lunary-primary-400'
            >
              1. Working With Tools Intuitively vs. Dogmatically
            </a>
          </li>
          <li>
            <a href='#altars' className='hover:text-lunary-primary-400'>
              2. Altars & Sacred Space
            </a>
          </li>
          <li>
            <a href='#fire-tools' className='hover:text-lunary-primary-400'>
              3. Candles & Fire Tools
            </a>
          </li>
          <li>
            <a href='#herbs' className='hover:text-lunary-primary-400'>
              4. Herbs & Kitchen Witchery
            </a>
          </li>
          <li>
            <a href='#crystals' className='hover:text-lunary-primary-400'>
              5. Crystals & Mineral Allies
            </a>
          </li>
          <li>
            <a href='#journals' className='hover:text-lunary-primary-400'>
              6. Journals & Book of Shadows
            </a>
          </li>
          <li>
            <a href='#digital' className='hover:text-lunary-primary-400'>
              7. Digital Tools (Lunary)
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
      <section id='intuitive-vs-dogmatic' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. Working With Tools Intuitively vs. Dogmatically
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          There are two approaches to magical tools: following tradition exactly
          as taught, or developing your own intuitive relationships with tools.
          Most practitioners find a balance between both.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Traditional Approach
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Follow established correspondences and uses. Athame for air, wand
              for fire (or vice versa in some traditions). Specific tools for
              specific purposes.
            </p>
            <p className='text-zinc-500 text-xs'>
              Benefit: Taps into centuries of collective practice and energy.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Intuitive Approach
            </h3>
            <p className='text-zinc-400 text-sm mb-3'>
              Use what feels right to you. If a stone calls to you for a
              specific purpose, use it—even if tradition says otherwise.
            </p>
            <p className='text-zinc-500 text-xs'>
              Benefit: Develops deep personal connection and authentic practice.
            </p>
          </div>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Neither approach is wrong. Learn the traditions, then let your
          practice evolve naturally.
        </p>
      </section>

      {/* Section 2: Altars */}
      <section id='altars' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Altars & Sacred Space
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          An altar is a dedicated space for magical and spiritual practice. It
          can be elaborate or simple—a shelf, a windowsill, or a corner of your
          desk.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Common Altar Elements
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>
                Representation of elements:
              </strong>{' '}
              Candle (fire), water bowl, feather or incense (air), salt or
              crystal (earth)
            </li>
            <li>
              <strong className='text-zinc-200'>Personal items:</strong> Photos,
              mementos, symbols that hold meaning for you
            </li>
            <li>
              <strong className='text-zinc-200'>Working tools:</strong> Candles,
              crystals, herbs, tarot deck
            </li>
            <li>
              <strong className='text-zinc-200'>
                Deity or spirit representation:
              </strong>{' '}
              If you work with specific beings (optional)
            </li>
            <li>
              <strong className='text-zinc-200'>Seasonal items:</strong> Change
              with the Wheel of the Year
            </li>
          </ul>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Cleanse your altar regularly. Arrange items intuitively—there is no
          single &quot;correct&quot; layout.
        </p>
      </section>

      {/* Section 3: Fire Tools */}
      <section id='fire-tools' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. Candles & Fire Tools
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Fire is transformation. Candles are the most common fire tool—easy to
          use, readily available, and endlessly versatile.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/candle-magic'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-orange-600 transition-colors'
          >
            <h3 className='font-medium text-zinc-100 mb-2'>Candles</h3>
            <p className='text-zinc-400 text-sm'>
              Color correspondences, carving, anointing, and spell candles. Full
              guide available.
            </p>
          </Link>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Cauldron</h3>
            <p className='text-zinc-400 text-sm'>
              Fire-safe container for burning papers, mixing potions, or holding
              ritual fire. Represents transformation.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Incense</h3>
            <p className='text-zinc-400 text-sm'>
              Combines fire and air. Use for cleansing space, setting mood, and
              adding scent correspondences.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Matches / Lighter
            </h3>
            <p className='text-zinc-400 text-sm'>
              Some prefer matches for the ritual of striking fire. Choose what
              feels right.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Herbs */}
      <section id='herbs' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Herbs & Kitchen Witchery
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Herbs are accessible, affordable, and powerful. Many are already in
          your kitchen. Kitchen witchery weaves magic into everyday cooking and
          home activities.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Common Kitchen Herbs
          </h3>
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Rosemary:</strong> Protection,
              memory
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Basil:</strong> Prosperity, love
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Cinnamon:</strong> Success,
              passion
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Salt:</strong> Purification,
              protection
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Bay leaves:</strong> Wishes,
              divination
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Lavender:</strong> Peace, sleep
            </div>
          </div>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/correspondences/herbs'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Full herb correspondence guide →
          </Link>
        </div>
      </section>

      {/* Section 5: Crystals */}
      <section id='crystals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Crystals & Mineral Allies
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Crystals are used to amplify, store, and direct energy. Different
          crystals carry different properties and can support various
          intentions.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Starter Crystals
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              <strong className='text-zinc-200'>Clear Quartz:</strong> Master
              healer, amplifies all intentions
            </li>
            <li>
              <strong className='text-zinc-200'>Amethyst:</strong> Intuition,
              protection, peace
            </li>
            <li>
              <strong className='text-zinc-200'>Rose Quartz:</strong> Love,
              heart healing, self-compassion
            </li>
            <li>
              <strong className='text-zinc-200'>Black Tourmaline:</strong>{' '}
              Protection, grounding, absorbs negativity
            </li>
          </ul>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/crystals'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Full crystal guide →
          </Link>
        </div>
      </section>

      {/* Section 6: Journals */}
      <section id='journals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Journals & Book of Shadows
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A Book of Shadows is a personal record of your magical practice:
          spells, rituals, dreams, observations, and insights. It is perhaps the
          most important tool you can have.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            What to Record
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Spells you cast and their results</li>
            <li>• Tarot readings and interpretations</li>
            <li>• Moon phase observations</li>
            <li>• Dreams and symbols</li>
            <li>• Correspondences that work for you</li>
            <li>• Reflections and insights</li>
          </ul>
        </div>

        <div className='mt-4'>
          <Link
            href='/book-of-shadows'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Start your digital Book of Shadows →
          </Link>
        </div>
      </section>

      {/* Section 7: Digital */}
      <section id='digital' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          7. Digital Tools (Lunary)
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Digital tools can enhance and support your practice without replacing
          traditional methods. Lunary offers several features that function as
          modern magical tools:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Birth Chart Calculator
            </h3>
            <p className='text-zinc-400 text-sm'>
              Astronomical precision for your natal chart—no manual calculations
              required.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Moon Phase Tracker
            </h3>
            <p className='text-zinc-400 text-sm'>
              Real-time moon data so you always know the current phase and sign.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Digital Tarot</h3>
            <p className='text-zinc-400 text-sm'>
              Draw cards for reflection when physical cards aren&apos;t
              available.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Book of Shadows</h3>
            <p className='text-zinc-400 text-sm'>
              Digital journal that&apos;s always with you—searchable, backed up,
              and private.
            </p>
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

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='tools-guide'
        title='Tools Guide Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
