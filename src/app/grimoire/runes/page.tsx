export const revalidate = 86400;

import { Metadata } from 'next';
import {
  createArticleSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  renderJsonLd,
} from '@/lib/schema';
import { Breadcrumbs } from '@/components/grimoire/Breadcrumbs';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import Runes from '../components/Runes';

export const metadata: Metadata = {
  title: 'Runes: Elder Futhark Meanings & Divination Guide - Lunary',
  description:
    'Complete guide to the Elder Futhark runes. Learn the meaning of all 24 runes, how to read and cast runes, make your own set, and use runes for divination and magic.',
  keywords: [
    'runes',
    'elder futhark',
    'rune meanings',
    'rune reading',
    'runic divination',
    'how to read runes',
    'rune magic',
    'norse runes',
  ],
  openGraph: {
    title: 'Runes: Elder Futhark Meanings & Divination Guide - Lunary',
    description:
      'Complete guide to the Elder Futhark runes for divination and magical practice.',
    type: 'article',
    url: 'https://lunary.app/grimoire/runes',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/runes',
  },
};

const faqs = [
  {
    question: 'How do I read runes?',
    answer:
      'Common methods include drawing a single rune for daily guidance, a three-rune spread (past/present/future), or casting all runes and reading those that land face-up. Focus on your question, draw or cast, and interpret based on traditional meanings combined with your intuition.',
  },
  {
    question: 'Do I need to make my own runes?',
    answer:
      'No, but many practitioners prefer handmade runes because the creation process imbues them with your energy. You can carve them from wood, paint them on stones, or craft them from clay. Purchased sets work fine—just cleanse and consecrate them before use.',
  },
  {
    question: 'What is the blank rune?',
    answer:
      'The "blank rune" (sometimes called Wyrd) is a modern addition not found in historical Elder Futhark. Some readers include it to represent fate, the unknown, or "no answer available." Many traditional practitioners do not use it. Include it if it resonates with your practice.',
  },
  {
    question: 'Can runes be used for magic, not just divination?',
    answer:
      'Yes. Runes have been used for magical purposes historically—carved into objects for protection, success, or other intentions. Bindrunes (combined rune symbols) are commonly used in magical work. However, research the runes thoroughly before using them magically.',
  },
  {
    question: 'Do reversed runes have different meanings?',
    answer:
      'Some readers interpret reversed (upside-down) runes as blocked or inverted energy. Others do not use reversals at all, since historically runes were carved into objects where orientation varied. Choose the approach that feels right for your practice.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Divination Methods',
    links: [
      { label: 'Divination Overview', href: '/grimoire/divination' },
      { label: 'Tarot Cards', href: '/grimoire/tarot' },
      { label: 'Pendulum', href: '/grimoire/divination/pendulum' },
      { label: 'Scrying', href: '/grimoire/divination/scrying' },
    ],
  },
  {
    title: 'Related Practices',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Protection Magic', href: '/grimoire/protection' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

export default function RunesPage() {
  const articleSchema = createArticleSchema({
    headline: 'Runes: Elder Futhark Meanings & Divination Guide',
    description:
      'Complete guide to the Elder Futhark runes for divination and magical practice.',
    url: 'https://lunary.app/grimoire/runes',
    keywords: ['runes', 'elder futhark', 'rune divination'],
    section: 'Divination',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='min-h-screen p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Runes', url: '/grimoire/runes' },
        ]),
      )}

      <Breadcrumbs
        items={[{ label: 'Grimoire', href: '/grimoire' }, { label: 'Runes' }]}
      />

      <header className='mb-12'>
        <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-6'>
          Runes
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Elder Futhark Guide
          </span>
        </h1>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          Runes are ancient symbols used for writing, divination, and magic. The
          Elder Futhark—the oldest runic alphabet—contains 24 runes, each
          carrying deep symbolic meaning and archetypal power. This guide covers
          rune meanings, reading methods, and practical applications.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-are-runes' className='hover:text-lunary-primary-400'>
              1. What Are Runes?
            </a>
          </li>
          <li>
            <a href='#elder-futhark' className='hover:text-lunary-primary-400'>
              2. The Elder Futhark
            </a>
          </li>
          <li>
            <a href='#how-to-read' className='hover:text-lunary-primary-400'>
              3. How to Read Runes
            </a>
          </li>
          <li>
            <a href='#spreads' className='hover:text-lunary-primary-400'>
              4. Rune Spreads
            </a>
          </li>
          <li>
            <a href='#making-runes' className='hover:text-lunary-primary-400'>
              5. Making Your Own Runes
            </a>
          </li>
          <li>
            <a href='#all-runes' className='hover:text-lunary-primary-400'>
              6. All 24 Runes
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
      <section id='what-are-runes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Are Runes?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Runes are letters from ancient Germanic alphabets, used by Norse,
          Anglo-Saxon, and other Northern European peoples from around the 2nd
          century CE. The word &quot;rune&quot; itself means &quot;secret&quot;
          or &quot;mystery&quot; in Old Germanic languages.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Beyond writing, runes were used for:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• Divination—casting or drawing runes to receive guidance</li>
          <li>• Magic—carving runes into objects for protection or power</li>
          <li>• Inscriptions—marking graves, weapons, and sacred objects</li>
          <li>• Communication with the divine—invoking cosmic forces</li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <p className='text-zinc-400 text-sm'>
            Each rune represents both a phonetic sound and a concept or force.
            When you work with runes, you&apos;re connecting with archetypal
            energies that have been recognized for nearly two millennia.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id='elder-futhark' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. The Elder Futhark
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          The Elder Futhark is the oldest runic alphabet, containing 24 runes.
          It&apos;s named after its first six letters: F-U-Th-A-R-K (Fehu, Uruz,
          Thurisaz, Ansuz, Raidho, Kenaz).
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            The Three Aettir (Families)
          </h3>
          <div className='space-y-4 text-zinc-400 text-sm'>
            <div>
              <strong className='text-zinc-200'>
                Freya&apos;s Aett (1-8):
              </strong>{' '}
              Fehu through Wunjo. Deals with material wealth, primal forces, and
              worldly experiences.
            </div>
            <div>
              <strong className='text-zinc-200'>
                Heimdall&apos;s Aett (9-16):
              </strong>{' '}
              Hagalaz through Sowilo. Deals with challenges, transformation, and
              the forces that test us.
            </div>
            <div>
              <strong className='text-zinc-200'>
                Tyr&apos;s Aett (17-24):
              </strong>{' '}
              Tiwaz through Othala. Deals with the self, society, spiritual
              matters, and legacy.
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id='how-to-read' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. How to Read Runes
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Rune reading involves drawing or casting runes and interpreting their
          meanings in context of your question. Here&apos;s a basic process:
        </p>

        <ol className='space-y-4'>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              1. Center yourself
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Take a few deep breaths. Clear your mind of distractions. Hold
              your question clearly in your awareness.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              2. Draw or cast
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Draw runes from a bag while thinking of your question, or cast all
              runes onto a cloth and read those that land face-up or in
              significant positions.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              3. Interpret
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Consider each rune&apos;s traditional meaning, its position in
              your spread (if using one), and your intuitive response. Let the
              meanings combine into a coherent message.
            </p>
          </li>
          <li className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <span className='text-lunary-primary-400 font-medium'>
              4. Record
            </span>
            <p className='text-zinc-400 text-sm mt-2'>
              Write the reading in your Book of Shadows. Note the date,
              question, runes drawn, and your interpretation. Check back later
              for accuracy.
            </p>
          </li>
        </ol>
      </section>

      {/* Section 4 */}
      <section id='spreads' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. Rune Spreads
        </h2>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Single Rune</h3>
            <p className='text-zinc-400 text-sm'>
              Draw one rune for quick daily guidance or a focused answer. Simple
              but powerful. Good for beginners.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Three-Rune Spread
            </h3>
            <p className='text-zinc-400 text-sm'>
              Past / Present / Future. Or: Situation / Challenge / Outcome. The
              most versatile spread for most questions.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Five-Rune Cross</h3>
            <p className='text-zinc-400 text-sm'>
              Center (current situation), left (past), right (future), top
              (advice), bottom (outcome). More detailed exploration.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Casting</h3>
            <p className='text-zinc-400 text-sm'>
              Toss all runes onto a cloth. Read face-up runes; those near the
              center are most relevant to the present, those at edges relate to
              the future or external factors.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id='making-runes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Making Your Own Runes
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Handmade runes carry your personal energy and often feel more
          connected. Common materials include:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Wood</h3>
            <p className='text-zinc-400 text-sm'>
              Traditional material. Cut cross-sections from a branch (ask
              permission from the tree). Burn or carve the symbols.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Stones</h3>
            <p className='text-zinc-400 text-sm'>
              Collect 24 similarly-sized smooth stones. Paint the rune symbols
              with enamel or permanent paint.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Clay</h3>
            <p className='text-zinc-400 text-sm'>
              Shape and carve air-dry or kiln clay. You can press the symbols in
              before drying or paint them after.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Cards or Paper</h3>
            <p className='text-zinc-400 text-sm'>
              Draw runes on cards for a portable set. Less traditional but
              perfectly functional.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6 - Runes Component */}
      <section id='all-runes' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. All 24 Runes
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Click any rune to explore its full meaning, correspondences, and
          magical applications.
        </p>

        <Runes />
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
        entityKey='runes'
        title='Rune Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
