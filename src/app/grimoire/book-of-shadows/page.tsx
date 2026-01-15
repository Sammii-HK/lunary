export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';

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
      'A Book of Shadows is your personal magical record—spells, rituals, readings, dreams, reflections, and correspondences that evolve with your practice.',
  },
  {
    question: 'Physical or digital?',
    answer:
      'Both can coexist. Physical journals feel ritualistic; digital ones are searchable and backed up. Choose the format that keeps you writing.',
  },
  {
    question: 'What should be in my first entry?',
    answer:
      'Log the date, current moon phase, your intention for sharing your practice, and how you feel today. Keep it honest and simple.',
  },
  {
    question: 'Does it need to look perfect?',
    answer:
      'No. The best Book of Shadows is the one you use. Messy, scribbled, sticky-note filled—it all counts as progress.',
  },
  {
    question: 'Should I keep it private?',
    answer:
      'Traditionally yes, but you decide. Share with trusted mentors if you wish, or keep it sacred. Safety and consent are yours to define.',
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
    title: 'Correspondences & References',
    links: [
      { label: 'Correspondences', href: '/grimoire/correspondences' },
      { label: 'Crystals', href: '/grimoire/crystals' },
      { label: 'Herbs', href: '/grimoire/correspondences/herbs' },
      { label: 'Moon Phases', href: '/grimoire/guides/moon-phases-guide' },
    ],
  },
  {
    title: 'Continue Learning',
    links: [
      { label: 'Beginner’s Guide', href: '/grimoire/beginners' },
      { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
      { label: 'Archetypes', href: '/grimoire/archetypes' },
      { label: 'Book of Shadows', href: '/book-of-shadows' },
    ],
  },
];

const toc = [
  { label: 'What Is a Book of Shadows?', href: '#what-is-bos' },
  { label: 'Why Keep One?', href: '#why-keep-one' },
  { label: 'What to Include', href: '#what-to-include' },
  { label: 'How to Organize', href: '#organization' },
  { label: 'Digital vs. Physical', href: '#digital-vs-physical' },
  { label: 'Getting Started', href: '#getting-started' },
  { label: 'FAQ', href: '#faq' },
];

export default function BookOfShadowsPage() {
  return (
    <SEOContentTemplate
      title='Book of Shadows: Create Your Personal Grimoire'
      h1='Book of Shadows'
      description='Learn how to create a living Book of Shadows—journal spells, rituals, correspondences, dreams, and reflections that anchor your practice.'
      keywords={metadata.keywords as string[]}
      canonicalUrl={metadata.alternates?.canonical as string}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Book of Shadows', href: '/grimoire/book-of-shadows' },
      ]}
      intro='This personal grimoire grows with you. Record spells, readings, dreams, rituals, correspondences, and the insights that emerge along the way.'
      meaning='A Book of Shadows combines spells, reference material, and journal entries so you can observe patterns, refine techniques, and witness your spiritual growth.'
      tableOfContents={toc}
      whatIs={{
        question: 'Why keep a Book of Shadows?',
        answer:
          'It makes magic tangible. Recording your work turns random attempts into a living reference and shows how your practice evolves over time.',
      }}
      howToWorkWith={[
        'Record intention, tools, timing, and outcome for each ritual',
        'Log divination spreads, your interpretations, and follow-up notes',
        'Keep a section for correspondences and symbols you invent',
        'Review past entries monthly to notice patterns and growth',
      ]}
      faqs={faqs}
      relatedItems={[
        {
          name: 'Beginners Guide',
          href: '/grimoire/beginners',
          type: 'Newbie path',
        },
        {
          name: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
          type: 'Ritual basics',
        },
        {
          name: 'Moon Phases Guide',
          href: '/grimoire/guides/moon-phases-guide',
          type: 'Lunar notes',
        },
      ]}
      internalLinks={[
        { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
        { text: 'Tarot Cards', href: '/grimoire/tarot' },
        { text: 'Correspondences', href: '/grimoire/correspondences' },
      ]}
      cosmicConnections={
        <CosmicConnections
          entityType='hub-book-of-shadows'
          entityKey='book-of-shadows'
          title='Book of Shadows Connections'
          sections={cosmicConnectionsSections}
        />
      }
      ctaText='Start your digital Book of Shadows'
      ctaHref='/book-of-shadows'
    >
      <section id='what-is-bos' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          1. What Is a Book of Shadows?
        </h2>
        <p className='text-zinc-300 leading-relaxed'>
          A Book of Shadows is a working grimoire—the place you log spells,
          rituals, dreams, and insights. It merges practical instructions with
          reflections on how your practice shifts over time.
        </p>
        <ul className='list-disc list-inside text-zinc-300 space-y-1'>
          <li>Spell book entries with intention, tools, and outcomes</li>
          <li>Reference pages for correspondences, symbols, and rituals</li>
          <li>
            Journal sections capturing dreams, synchronicities, and reflections
          </li>
          <li>Lab notes documenting what worked and what didn’t</li>
        </ul>
      </section>

      <section id='why-keep-one' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>2. Why Keep One?</h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {[
            {
              title: 'Track What Works',
              body: 'Logging spells reveals which ingredients, timing, and steps resonate with you.',
            },
            {
              title: 'Notice Patterns',
              body: 'Dreams, readings, and life events often repeat. Recording them uncovers hidden threads.',
            },
            {
              title: 'Build a Reference',
              body: 'Collect correspondences, sigils, and rituals tailored to your craft.',
            },
            {
              title: 'Witness Growth',
              body: 'Looking back at older entries highlights how far you’ve come.',
            },
          ].map((card) => (
            <article
              key={card.title}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {card.title}
              </h3>
              <p className='text-sm text-zinc-400'>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='what-to-include' className='space-y-6 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          3. What to Include
        </h2>
        {[
          {
            title: 'Spells & Rituals',
            bullets: [
              'Date, moon phase, and astrological context',
              'Ingredients, tools, and steps',
              'How you felt and what happened',
              'Follow-up notes once results emerge',
            ],
          },
          {
            title: 'Divination',
            bullets: [
              'Question asked and layout used',
              'Cards or runes drawn with interpretations',
              'Clues, guidance, and accuracy notes',
            ],
          },
          {
            title: 'Dreams & Symbols',
            bullets: [
              'Dream journals recorded immediately',
              'Recurring symbols and what they mean to you',
              'Synchronicities or omens to revisit',
            ],
          },
          {
            title: 'Correspondences',
            bullets: [
              'Herbs, crystals, colors, numbers, planetary days',
              'Personal symbols or sigils',
              'Links between ingredients and intentions',
            ],
          },
        ].map((block) => (
          <article
            key={block.title}
            className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
          >
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              {block.title}
            </h3>
            <ul className='list-disc list-inside text-sm text-zinc-300 space-y-1'>
              {block.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section id='organization' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          4. How to Organize
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          {[
            {
              title: 'Chronological',
              body: 'Date entries and add an index if the journal grows large.',
            },
            {
              title: 'By Category',
              body: 'Split sections for spells, dreams, correspondences, etc.',
            },
            {
              title: 'By Intention',
              body: 'Group rituals by themes such as protection, healing, or abundance.',
            },
            {
              title: 'Hybrid',
              body: 'Blend formats; digital journals with search make this easiest.',
            },
          ].map((card) => (
            <article
              key={card.title}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {card.title}
              </h3>
              <p className='text-sm text-zinc-400'>{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id='digital-vs-physical' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          5. Digital vs. Physical
        </h2>
        <div className='grid gap-4 md:grid-cols-2'>
          <article className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Physical
            </h3>
            <ul className='list-disc list-inside text-sm text-zinc-300'>
              <li>Ritual feel with tactile tools</li>
              <li>No tech needed</li>
              <li>Can include art, pressed botanicals, sigils</li>
            </ul>
          </article>
          <article className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'>
            <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
              Digital
            </h3>
            <ul className='list-disc list-inside text-sm text-zinc-300'>
              <li>Searchable and backed up</li>
              <li>Accessible on the go with photos and links</li>
              <li>Easy to reorganize and collaborate</li>
            </ul>
          </article>
        </div>
        <p className='text-zinc-400 text-sm'>
          Many practitioners use both formats—one for sacred rituals, one for
          quick reference.
        </p>
      </section>

      <section id='getting-started' className='space-y-4 mb-10'>
        <h2 className='text-3xl font-light text-zinc-100'>
          6. Getting Started
        </h2>
        <ol className='list-decimal list-inside text-zinc-300 space-y-2'>
          <li>Write today’s date and current moon phase.</li>
          <li>State your intention for keeping this BOS.</li>
          <li>Note what drew you to this path and how you feel.</li>
          <li>Describe something you are curious to explore.</li>
        </ol>
        <p className='text-zinc-400 text-sm'>
          Start imperfectly; the best BOS is the one you return to every day.
        </p>
        <Link
          href='/grimoire/beginners'
          className='inline-flex items-center gap-2 text-lunary-primary-300 hover:text-lunary-primary-400'
        >
          <Sparkles size={16} /> Follow a beginner’s path next
        </Link>
      </section>

      <section id='faq' className='space-y-4'>
        <h2 className='text-3xl font-light text-zinc-100'>7. FAQ</h2>
        <div className='space-y-4'>
          {faqs.map((faq) => (
            <article
              key={faq.question}
              className='rounded-xl border border-zinc-800 bg-zinc-900/50 p-5'
            >
              <h3 className='text-lg font-semibold text-zinc-100 mb-2'>
                {faq.question}
              </h3>
              <p className='text-zinc-400 text-sm'>{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
