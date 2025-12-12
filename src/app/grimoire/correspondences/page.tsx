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
  title: 'Magical Correspondences: Elements, Colours, Days & More - Lunary',
  description:
    'Complete guide to magical correspondences. Learn how elements, colors, days, numbers, herbs, and crystals connect to intentions in spellwork and ritual.',
  keywords: [
    'magical correspondences',
    'elemental correspondences',
    'color correspondences',
    'planetary correspondences',
    'herb correspondences',
    'witchcraft correspondences',
  ],
  openGraph: {
    title: 'Magical Correspondences Guide - Lunary',
    description:
      'Complete guide to magical correspondences: elements, colors, days, and more.',
    type: 'article',
    url: 'https://lunary.app/grimoire/correspondences',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences',
  },
};

const faqs = [
  {
    question: 'What are magical correspondences?',
    answer:
      'Correspondences are symbolic associations between physical objects, times, elements, and specific intentions or energies. They help you align your spellwork with appropriate energies—for example, using green candles and Thursday (Jupiter day) for prosperity magic.',
  },
  {
    question: 'Do I have to use traditional correspondences?',
    answer:
      'No. While traditional correspondences carry centuries of collective energy, personal correspondences based on your own experiences are equally valid. If purple feels like a healing color to you, use it for healing—even if tradition says blue.',
  },
  {
    question: 'How do I remember all the correspondences?',
    answer:
      'Start with the basics: the four elements, days of the week, and common colors. Keep a correspondence reference in your Book of Shadows. Over time, the connections become intuitive through practice.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Correspondence Tables',
    links: [
      { label: 'Elements', href: '/grimoire/correspondences/elements' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Colors', href: '/grimoire/candle-magic/colors' },
    ],
  },
  {
    title: 'Apply Correspondences',
    links: [
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Candle Magic', href: '/grimoire/candle-magic' },
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
      { label: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
    ],
  },
];

export default function CorrespondencesPage() {
  const articleSchema = createArticleSchema({
    headline: 'Magical Correspondences: Elements, Colours, Days & More',
    description:
      'Complete guide to magical correspondences: elements, colors, days, and more.',
    url: 'https://lunary.app/grimoire/correspondences',
    keywords: ['correspondences', 'magical correspondences', 'elements'],
    section: 'Witchcraft',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Correspondences', url: '/grimoire/correspondences' },
        ]),
      )}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Correspondences' },
        ]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Magical Correspondences
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Elements, Colours, Days & More
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Correspondences are the symbolic connections that link physical
          objects, times, and forces to specific magical intentions.
          Understanding correspondences helps you craft more powerful, aligned
          spellwork.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-are' className='hover:text-lunary-primary-400'>
              1. What Are Correspondences?
            </a>
          </li>
          <li>
            <a href='#how-to-use' className='hover:text-lunary-primary-400'>
              2. How to Use Correspondence Tables Wisely
            </a>
          </li>
          <li>
            <a href='#elements' className='hover:text-lunary-primary-400'>
              3. The Four/Five Elements
            </a>
          </li>
          <li>
            <a href='#colors-days' className='hover:text-lunary-primary-400'>
              4. Colours, Days, Numbers
            </a>
          </li>
          <li>
            <a href='#herbs-crystals' className='hover:text-lunary-primary-400'>
              5. Herbs & Crystals
            </a>
          </li>
          <li>
            <a href='#personal' className='hover:text-lunary-primary-400'>
              6. Building Your Own Correspondence List
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
      <section id='what-are' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Are Correspondences?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Correspondences are the symbolic relationships between different
          aspects of the natural and magical world. They work through the
          principle of sympathetic magic: &quot;like attracts like.&quot; When
          you use a green candle for a money spell, you are connecting the
          color&apos;s association with growth and prosperity to your intention.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          These connections are not arbitrary. They developed over centuries of
          observation, tradition, and practical experience. Different cultures
          may have slightly different correspondences, but many overlap—because
          practitioners noticed the same patterns.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Types of Correspondences
          </h3>
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Elements</strong> — Fire, Water,
              Air, Earth, Spirit
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Colors</strong> — Visual energy
              and symbolism
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Days</strong> — Planetary
              influences
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Numbers</strong> — Numerological
              meanings
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Herbs</strong> — Plant energies
              and properties
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Crystals</strong> — Mineral
              vibrations
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Moon Phases</strong> — Lunar
              timing
            </div>
            <div className='text-zinc-400'>
              <strong className='text-zinc-200'>Planets</strong> — Celestial
              influences
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id='how-to-use' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. How to Use Correspondence Tables Wisely
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Correspondences are tools, not rules. They enhance your practice when
          used thoughtfully, but rigid adherence can limit your magic.
        </p>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Principles for Using Correspondences
          </h3>
          <ul className='space-y-3 text-zinc-300 text-sm'>
            <li>
              <strong>Start with intention, then add correspondences.</strong>{' '}
              Your intention is primary. Correspondences amplify but don&apos;t
              replace clear focus.
            </li>
            <li>
              <strong>Layer correspondences for power.</strong> A love spell
              using pink candle + Friday + rose quartz + roses creates multiple
              aligned connections.
            </li>
            <li>
              <strong>Personal beats traditional.</strong> If a correspondence
              doesn&apos;t resonate with you, it won&apos;t work as well. Trust
              your intuition.
            </li>
            <li>
              <strong>Don&apos;t let missing correspondences stop you.</strong>{' '}
              If you don&apos;t have the &quot;right&quot; color candle, work
              with what you have. Intent matters most.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 3: Elements */}
      <section id='elements' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. The Four/Five Elements
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The classical elements form the foundation of most correspondence
          systems. Each element governs specific qualities and types of magic.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Link
            href='/grimoire/correspondences/elements/fire'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-orange-600 transition-colors'
          >
            <h3 className='font-medium text-orange-400 mb-2'>🔥 Fire</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Passion, transformation, courage, will, purification
            </p>
            <p className='text-zinc-500 text-xs'>
              Direction: South | Season: Summer | Tools: Candle, athame
            </p>
          </Link>
          <Link
            href='/grimoire/correspondences/elements/water'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-blue-600 transition-colors'
          >
            <h3 className='font-medium text-blue-400 mb-2'>💧 Water</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Emotion, intuition, healing, purification, the unconscious
            </p>
            <p className='text-zinc-500 text-xs'>
              Direction: West | Season: Autumn | Tools: Chalice, cauldron
            </p>
          </Link>
          <Link
            href='/grimoire/correspondences/elements/air'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-yellow-600 transition-colors'
          >
            <h3 className='font-medium text-yellow-400 mb-2'>💨 Air</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Intellect, communication, travel, new beginnings
            </p>
            <p className='text-zinc-500 text-xs'>
              Direction: East | Season: Spring | Tools: Wand, incense
            </p>
          </Link>
          <Link
            href='/grimoire/correspondences/elements/earth'
            className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:border-green-600 transition-colors'
          >
            <h3 className='font-medium text-green-400 mb-2'>🌍 Earth</h3>
            <p className='text-zinc-400 text-sm mb-2'>
              Stability, prosperity, fertility, grounding, manifestation
            </p>
            <p className='text-zinc-500 text-xs'>
              Direction: North | Season: Winter | Tools: Pentacle, salt
            </p>
          </Link>
        </div>

        <div className='mt-4 p-4 rounded-xl border border-violet-800 bg-violet-900/10'>
          <h4 className='font-medium text-violet-300 mb-2'>
            ✨ Spirit (Akasha)
          </h4>
          <p className='text-zinc-400 text-sm'>
            The fifth element that unites all others. Represents the divine,
            consciousness, and the void from which all emerges.
          </p>
        </div>
      </section>

      {/* Section 4: Colors & Days */}
      <section id='colors-days' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Colours, Days, Numbers
        </h2>

        <h3 className='text-xl font-medium text-zinc-100 mb-4'>
          Days of the Week
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-6'>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Sunday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Sun: Success, vitality, leadership
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Monday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Moon: Intuition, dreams, emotions
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Tuesday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Mars: Courage, protection, action
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Wednesday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Mercury: Communication, travel, learning
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Thursday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Jupiter: Abundance, luck, expansion
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <span className='font-medium text-zinc-100'>Friday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Venus: Love, beauty, relationships
            </span>
          </div>
          <div className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 md:col-span-2'>
            <span className='font-medium text-zinc-100'>Saturday</span>
            <span className='text-zinc-400 text-sm'>
              {' '}
              — Saturn: Banishing, protection, discipline, endings
            </span>
          </div>
        </div>

        <div className='mt-4'>
          <Link
            href='/grimoire/candle-magic/colors'
            className='text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            See full color correspondence chart →
          </Link>
        </div>
      </section>

      {/* Section 5: Herbs & Crystals */}
      <section id='herbs-crystals' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Herbs & Crystals
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Herbs and crystals carry their own energies that can be incorporated
          into spellwork, sachets, baths, and altar arrangements.
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>
              Common Herb Correspondences
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>
                <strong>Rosemary:</strong> Protection, memory, clarity
              </li>
              <li>
                <strong>Lavender:</strong> Peace, sleep, purification
              </li>
              <li>
                <strong>Basil:</strong> Prosperity, love, protection
              </li>
              <li>
                <strong>Sage:</strong> Cleansing, wisdom, longevity
              </li>
              <li>
                <strong>Chamomile:</strong> Sleep, calm, luck
              </li>
              <li>
                <strong>Cinnamon:</strong> Prosperity, passion, success
              </li>
            </ul>
            <Link
              href='/grimoire/correspondences/herbs'
              className='text-lunary-primary-400 text-sm hover:underline mt-3 inline-block'
            >
              Full herb guide →
            </Link>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>
              Common Crystal Correspondences
            </h3>
            <ul className='text-zinc-400 text-sm space-y-1'>
              <li>
                <strong>Clear Quartz:</strong> Amplification, clarity
              </li>
              <li>
                <strong>Amethyst:</strong> Intuition, protection, peace
              </li>
              <li>
                <strong>Rose Quartz:</strong> Love, heart healing
              </li>
              <li>
                <strong>Black Tourmaline:</strong> Protection, grounding
              </li>
              <li>
                <strong>Citrine:</strong> Prosperity, joy, confidence
              </li>
              <li>
                <strong>Moonstone:</strong> Intuition, lunar magic
              </li>
            </ul>
            <Link
              href='/grimoire/crystals'
              className='text-lunary-primary-400 text-sm hover:underline mt-3 inline-block'
            >
              Full crystal guide →
            </Link>
          </div>
        </div>
      </section>

      {/* Section 6: Personal Correspondences */}
      <section id='personal' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Building Your Own Correspondence List
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          While traditional correspondences are powerful, developing personal
          associations deepens your practice. Pay attention to what resonates
          with you.
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Developing Personal Correspondences
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>
              • Notice what colors, scents, and objects make you feel specific
              emotions
            </li>
            <li>
              • Track which herbs and crystals work best for you in practice
            </li>
            <li>• Document recurring symbols in your dreams and divination</li>
            <li>
              • Note which traditional correspondences feel wrong and explore
              alternatives
            </li>
            <li>
              • Keep a dedicated section in your Book of Shadows for personal
              associations
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

      {/* CTA */}
      <section className='bg-gradient-to-r from-lunary-primary-900/30 to-green-900/30 border border-lunary-primary-700 rounded-xl p-8 text-center mb-12'>
        <h2 className='text-2xl font-light text-zinc-100 mb-4'>
          Explore Correspondence Tables
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Dive into detailed correspondence charts for elements, herbs,
          crystals, colors, and more.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Link
            href='/grimoire/correspondences/elements'
            className='px-6 py-3 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg font-medium transition-colors'
          >
            Elements
          </Link>
          <Link
            href='/grimoire/crystals'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Crystals
          </Link>
          <Link
            href='/grimoire/correspondences/herbs'
            className='px-6 py-3 border border-lunary-primary text-lunary-primary-300 hover:bg-lunary-primary-900/10 rounded-lg font-medium transition-colors'
          >
            Herbs
          </Link>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='correspondences'
        title='Correspondences Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
