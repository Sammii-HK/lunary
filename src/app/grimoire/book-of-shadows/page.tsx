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
import { Heading } from '@/components/ui/Heading';

export const metadata: Metadata = {
  title: 'Book of Shadows: Create Your Personal Grimoire - Lunary',
  description:
    'Learn how to create and maintain your Book of Shadows. Discover what to include, how to organize it, digital vs. physical options, and why recording your practice matters for growth.',
  keywords: [
    'book of shadows',
    'grimoire',
    'witchcraft journal',
    'spell book',
    'how to create book of shadows',
    'digital grimoire',
    'witchcraft journaling',
    'magical journal',
  ],
  openGraph: {
    title: 'Book of Shadows: Create Your Personal Grimoire - Lunary',
    description:
      'Learn how to create and maintain your Book of Shadows for tracking spells, rituals, and spiritual growth.',
    type: 'article',
    url: 'https://lunary.app/grimoire/book-of-shadows',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/book-of-shadows',
  },
};

const faqs = [
  {
    question: 'What is a Book of Shadows?',
    answer:
      "A Book of Shadows (BOS) is a personal record of your magical practice—spells, rituals, correspondences, dreams, reflections, and spiritual insights. The name comes from Wiccan tradition, but the concept exists across many practices. It's your magical diary and reference guide combined.",
  },
  {
    question: 'Should I use a physical journal or digital Book of Shadows?',
    answer:
      'Both have merits. Physical journals feel more ritualistic and tactile; digital versions are searchable, backed up, and always with you. Many practitioners use both—a digital BOS for quick reference and a physical one for special workings. Choose what fits your lifestyle and practice.',
  },
  {
    question: 'What should I write in my first entry?',
    answer:
      "Start simple: write the date, current moon phase, and a statement of intention for your practice. You might include what drew you to this path, what you hope to learn, or simply describe how you're feeling. There are no rules—your first entry can be as brief or detailed as you like.",
  },
  {
    question: 'Do I need to make it pretty?',
    answer:
      'No. Your BOS is a working document, not an art project. Some practitioners love decorating theirs with drawings and pressed flowers; others prefer plain text. What matters is that you use it. A messy, well-used BOS is more valuable than a beautiful, empty one.',
  },
  {
    question: 'Is my Book of Shadows private?',
    answer:
      'Traditionally, yes—a BOS is deeply personal and often kept private. However, you decide what to share and with whom. Some practitioners share excerpts with trusted friends or mentors. The important thing is that you feel safe writing honestly in it.',
  },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'What to Record',
    links: [
      { label: 'Moon Rituals', href: '/grimoire/moon/rituals' },
      {
        label: 'Spellcraft Fundamentals',
        href: '/grimoire/spells/fundamentals',
      },
      { label: 'Tarot Readings', href: '/grimoire/tarot' },
      { label: 'Shadow Work', href: '/grimoire/shadow-work' },
    ],
  },
  {
    title: 'Correspondences to Include',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
    ],
  },
  {
    title: 'Start Practicing',
    links: [
      { label: 'Your Digital Book of Shadows', href: '/book-of-shadows' },
      { label: 'Beginners Guide', href: '/grimoire/beginners' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      { label: 'Archetypes', href: '/grimoire/archetypes' },
    ],
  },
];

export default function BookOfShadowsPage() {
  const articleSchema = createArticleSchema({
    headline: 'Book of Shadows: Create Your Personal Grimoire',
    description:
      'Learn how to create and maintain your Book of Shadows for tracking spells, rituals, and spiritual growth.',
    url: 'https://lunary.app/grimoire/book-of-shadows',
    keywords: ['book of shadows', 'grimoire', 'magical journal'],
    section: 'Modern Witchcraft',
  });

  const faqSchema = createFAQPageSchema(faqs);

  return (
    <div className='p-4 md:p-8 max-w-4xl mx-auto'>
      {renderJsonLd(articleSchema)}
      {renderJsonLd(faqSchema)}
      {renderJsonLd(
        createBreadcrumbSchema([
          { name: 'Grimoire', url: '/grimoire' },
          { name: 'Book of Shadows', url: '/grimoire/book-of-shadows' },
        ]),
      )}

      <Breadcrumbs
        items={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Book of Shadows' },
        ]}
      />

      <header className='mb-12'>
        <Heading variant='h1' as='h1'>
          Book of Shadows
          <span className='block text-2xl text-lunary-primary-400 mt-2'>
            Your Personal Grimoire
          </span>
        </Heading>
        <p className='text-xl text-zinc-400 leading-relaxed'>
          A Book of Shadows is your personal record of magical practice—a place
          to document spells, rituals, dreams, reflections, and discoveries. It
          grows with you, becoming both a reference guide and a mirror of your
          spiritual journey.
        </p>
      </header>

      <nav className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-12'>
        <h2 className='text-lg font-medium text-zinc-100 mb-4'>
          Table of Contents
        </h2>
        <ol className='space-y-2 text-zinc-400'>
          <li>
            <a href='#what-is-bos' className='hover:text-lunary-primary-400'>
              1. What Is a Book of Shadows?
            </a>
          </li>
          <li>
            <a href='#why-keep-one' className='hover:text-lunary-primary-400'>
              2. Why Keep One?
            </a>
          </li>
          <li>
            <a
              href='#what-to-include'
              className='hover:text-lunary-primary-400'
            >
              3. What to Include
            </a>
          </li>
          <li>
            <a href='#organization' className='hover:text-lunary-primary-400'>
              4. How to Organize
            </a>
          </li>
          <li>
            <a
              href='#digital-vs-physical'
              className='hover:text-lunary-primary-400'
            >
              5. Digital vs. Physical
            </a>
          </li>
          <li>
            <a
              href='#getting-started'
              className='hover:text-lunary-primary-400'
            >
              6. Getting Started
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
      <section id='what-is-bos' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          1. What Is a Book of Shadows?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          A Book of Shadows (often abbreviated BOS) is a personal journal for
          your magical and spiritual practice. The term originated in Wicca, but
          the concept of keeping a magical diary exists across many traditions
          and practices.
        </p>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Think of it as a combination of:
        </p>

        <ul className='space-y-2 text-zinc-300 mb-6'>
          <li>• A spell book—recording what you&apos;ve cast and created</li>
          <li>• A reference guide—correspondences, symbols, and techniques</li>
          <li>• A journal—reflections, dreams, and insights</li>
          <li>• A lab notebook—what worked, what didn&apos;t, and why</li>
        </ul>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <p className='text-zinc-400 text-sm'>
            Your Book of Shadows is uniquely yours. There is no
            &quot;correct&quot; format—it reflects your practice, your voice,
            and your journey.
          </p>
        </div>
      </section>

      {/* Section 2 */}
      <section id='why-keep-one' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          2. Why Keep One?
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Recording your practice accelerates learning and deepens your
          connection to the work. Here&apos;s why it matters:
        </p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Track What Works</h3>
            <p className='text-zinc-400 text-sm'>
              When you record spells and rituals with outcomes, you learn what
              techniques are most effective for you personally.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Notice Patterns</h3>
            <p className='text-zinc-400 text-sm'>
              Over time, you&apos;ll see recurring themes—in your dreams, your
              readings, your life. Patterns reveal deeper truths.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Build Your Reference
            </h3>
            <p className='text-zinc-400 text-sm'>
              Collect correspondences, symbols, and techniques that resonate
              with you. Your BOS becomes your personal magical encyclopedia.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Witness Your Growth
            </h3>
            <p className='text-zinc-400 text-sm'>
              Looking back at old entries shows how far you&apos;ve come.
              It&apos;s evidence of your evolution as a practitioner.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3 */}
      <section id='what-to-include' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          3. What to Include
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          Include whatever is meaningful to your practice. Common entries
          include:
        </p>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Spells & Rituals
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Date, moon phase, and astrological context</li>
            <li>• The spell or ritual performed</li>
            <li>• Ingredients and tools used</li>
            <li>• How you felt during and after</li>
            <li>• Results (check back and update later)</li>
          </ul>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Divination Readings
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Tarot spreads with card positions and your interpretation</li>
            <li>• Questions asked and answers received</li>
            <li>• Rune castings, pendulum answers, or other divination</li>
            <li>• Follow-up notes on accuracy</li>
          </ul>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Dreams & Symbols
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Dream journals (write immediately upon waking)</li>
            <li>• Recurring symbols and their meanings for you</li>
            <li>• Synchronicities and omens noticed</li>
          </ul>
        </div>

        <div className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-zinc-100 mb-3'>
            Correspondences & Reference
          </h3>
          <ul className='space-y-2 text-zinc-400 text-sm'>
            <li>• Herbs, crystals, and their properties</li>
            <li>• Color and candle correspondences</li>
            <li>• Moon phase and planetary day associations</li>
            <li>• Personal symbols and sigils you&apos;ve created</li>
          </ul>
        </div>
      </section>

      {/* Section 4 */}
      <section id='organization' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          4. How to Organize
        </h2>

        <p className='text-zinc-300 leading-relaxed mb-6'>
          There&apos;s no single correct way. Choose what makes retrieval easy:
        </p>

        <div className='space-y-4'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>Chronological</h3>
            <p className='text-zinc-400 text-sm'>
              Simply write entries in date order. Easy to maintain; shows your
              journey over time. Add an index if it grows large.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Category</h3>
            <p className='text-zinc-400 text-sm'>
              Separate sections for spells, divination, correspondences, dreams,
              etc. Good for reference; requires a bit more planning.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>By Intention</h3>
            <p className='text-zinc-400 text-sm'>
              Group by purpose—protection, love, abundance, healing. Useful for
              quickly finding relevant material for specific needs.
            </p>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-2'>
              Hybrid / Flexible
            </h3>
            <p className='text-zinc-400 text-sm'>
              Use whatever system makes sense in the moment. Digital BOS tools
              with search functions make this approach practical.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5 */}
      <section id='digital-vs-physical' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          5. Digital vs. Physical
        </h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>Physical Journal</h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>✦ Tactile, ritualistic feel</li>
              <li>✦ No technology required</li>
              <li>✦ Can include pressed flowers, drawings</li>
              <li>✦ Limited by physical space</li>
              <li>✦ Can be lost or damaged</li>
            </ul>
          </div>
          <div className='p-5 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <h3 className='font-medium text-zinc-100 mb-3'>Digital BOS</h3>
            <ul className='space-y-2 text-zinc-400 text-sm'>
              <li>✦ Searchable and organized</li>
              <li>✦ Always backed up</li>
              <li>✦ Accessible from anywhere</li>
              <li>✦ Easy to add, edit, reorganize</li>
              <li>✦ Can include photos and links</li>
            </ul>
          </div>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Many practitioners use both: a physical journal for special rituals
          and a digital one for everyday reference and quick notes.
        </p>
      </section>

      {/* Section 6 */}
      <section id='getting-started' className='mb-16'>
        <h2 className='text-3xl font-light text-zinc-100 mb-6'>
          6. Getting Started
        </h2>

        <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-xl p-6'>
          <h3 className='text-lg font-medium text-lunary-primary-300 mb-3'>
            Your First Entry
          </h3>
          <ol className='space-y-2 text-zinc-300 text-sm'>
            <li>1. Write today&apos;s date and current moon phase</li>
            <li>
              2. State your intention: &quot;I am beginning this Book of Shadows
              to...&quot;
            </li>
            <li>3. Write briefly about what drew you to this path</li>
            <li>4. Note how you feel right now</li>
            <li>5. Close with something you&apos;re curious to learn</li>
          </ol>
        </div>

        <p className='text-zinc-400 text-sm mt-4'>
          Don&apos;t overthink it. The best Book of Shadows is one you actually
          use. Start imperfectly and let it evolve.
        </p>
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
          Start Your Digital Book of Shadows
        </h2>
        <p className='text-zinc-400 mb-6 max-w-xl mx-auto'>
          Lunary&apos;s Book of Shadows is always with you—searchable, backed
          up, and integrated with moon phases and astrological data.
        </p>
        <div className='flex flex-wrap gap-4 justify-center'>
          <Button asChild variant='lunary-solid' size='lg'>
            <Link href='/book-of-shadows'>Open Your Book of Shadows</Link>
          </Button>
          <Button asChild variant='outline' size='lg'>
            <Link href='/grimoire/beginners'>Beginner&apos;s Guide</Link>
          </Button>
        </div>
      </section>

      <CosmicConnections
        entityType='hub-glossary'
        entityKey='book-of-shadows'
        title='Book of Shadows Connections'
        sections={cosmicConnectionsSections}
      />
    </div>
  );
}
