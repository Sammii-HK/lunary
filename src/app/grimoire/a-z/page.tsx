export const revalidate = 86400;

import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { CosmicConnections } from '@/components/grimoire/CosmicConnections';
import { CosmicConnectionSection } from '@/lib/cosmicConnectionsConfig';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Lunary Grimoire A–Z: Complete Topic Index | Lunary',
  description:
    'Alphabetical index of astrology, tarot, witchcraft, moon work, spells, and more. Find every topic by letter.',
  openGraph: {
    title: 'Lunary Grimoire A–Z Index | Lunary',
    description:
      'Complete alphabetical guide to astrology, tarot, witchcraft, and spiritual topics.',
    url: 'https://lunary.app/grimoire/a-z',
  },
  alternates: { canonical: 'https://lunary.app/grimoire/a-z' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const topics = [
  {
    letter: 'A',
    items: [
      { name: 'Aquarius', url: '/grimoire/zodiac/aquarius' },
      { name: 'Aries', url: '/grimoire/zodiac/aries' },
      { name: 'Ascendant', url: '/grimoire/houses/overview/1' },
      { name: 'Aspects', url: '/grimoire/aspects' },
    ],
  },
  {
    letter: 'B',
    items: [
      { name: 'Birth Chart', url: '/birth-chart' },
      {
        name: 'Birth Chart Guide',
        url: '/grimoire/guides/birth-chart-complete-guide',
      },
    ],
  },
  {
    letter: 'C',
    items: [
      { name: 'Cancer', url: '/grimoire/zodiac/cancer' },
      { name: 'Capricorn', url: '/grimoire/zodiac/capricorn' },
      { name: 'Chakras', url: '/grimoire/chakras' },
      { name: 'Conjunction', url: '/grimoire/aspects/types/conjunction' },
      { name: 'Crystals', url: '/grimoire/crystals' },
    ],
  },
  {
    letter: 'D',
    items: [
      { name: 'Decans', url: '/grimoire/decans' },
      { name: 'Descendant', url: '/grimoire/houses/overview/7' },
    ],
  },
  {
    letter: 'E',
    items: [
      { name: 'Eclipses', url: '/grimoire/eclipses' },
      { name: 'Elements', url: '/grimoire/correspondences/elements' },
    ],
  },
  {
    letter: 'F',
    items: [{ name: 'Full Moons', url: '/grimoire/moon/full-moons' }],
  },
  {
    letter: 'G',
    items: [
      { name: 'Gemini', url: '/grimoire/zodiac/gemini' },
      { name: 'Glossary', url: '/grimoire/glossary' },
    ],
  },
  {
    letter: 'H',
    items: [
      { name: 'Houses', url: '/grimoire/houses' },
      { name: 'Horoscopes', url: '/horoscope' },
    ],
  },
  {
    letter: 'I',
    items: [{ name: 'IC (Imum Coeli)', url: '/grimoire/houses/overview/4' }],
  },
  {
    letter: 'J',
    items: [{ name: 'Jupiter', url: '/grimoire/astronomy/planets/jupiter' }],
  },
  {
    letter: 'L',
    items: [
      { name: 'Leo', url: '/grimoire/zodiac/leo' },
      { name: 'Libra', url: '/grimoire/zodiac/libra' },
      { name: 'Lunar Nodes', url: '/grimoire/lunar-nodes' },
    ],
  },
  {
    letter: 'M',
    items: [
      { name: 'Mars', url: '/grimoire/astronomy/planets/mars' },
      { name: 'Mercury', url: '/grimoire/astronomy/planets/mercury' },
      { name: 'Midheaven', url: '/grimoire/houses/overview/10' },
      { name: 'Moon', url: '/grimoire/moon' },
      { name: 'Moon Phases', url: '/grimoire/moon/phases' },
    ],
  },
  {
    letter: 'N',
    items: [
      { name: 'Neptune', url: '/grimoire/astronomy/planets/neptune' },
      { name: 'North Node', url: '/grimoire/lunar-nodes' },
      { name: 'Numerology', url: '/grimoire/numerology' },
    ],
  },
  {
    letter: 'O',
    items: [{ name: 'Opposition', url: '/grimoire/aspects/types/opposition' }],
  },
  {
    letter: 'P',
    items: [
      { name: 'Pisces', url: '/grimoire/zodiac/pisces' },
      { name: 'Placements', url: '/grimoire/placements' },
      { name: 'Planets', url: '/grimoire/astronomy/planets' },
      { name: 'Pluto', url: '/grimoire/astronomy/planets/pluto' },
    ],
  },
  {
    letter: 'R',
    items: [
      { name: 'Retrogrades', url: '/grimoire/astronomy/retrogrades' },
      { name: 'Rising Sign', url: '/grimoire/houses/overview/1' },
      { name: 'Runes', url: '/grimoire/runes' },
    ],
  },
  {
    letter: 'S',
    items: [
      { name: 'Sagittarius', url: '/grimoire/zodiac/sagittarius' },
      { name: 'Saturn', url: '/grimoire/astronomy/planets/saturn' },
      { name: 'Saturn Return', url: '/grimoire/transits' },
      { name: 'Scorpio', url: '/grimoire/zodiac/scorpio' },
      { name: 'Sextile', url: '/grimoire/aspects/types/sextile' },
      { name: 'Spells', url: '/grimoire/spells' },
      { name: 'Square', url: '/grimoire/aspects/types/square' },
      { name: 'Sun', url: '/grimoire/astronomy/planets/sun' },
    ],
  },
  {
    letter: 'T',
    items: [
      { name: 'Tarot', url: '/grimoire/tarot' },
      { name: 'Taurus', url: '/grimoire/zodiac/taurus' },
      { name: 'Transits', url: '/grimoire/transits' },
      { name: 'Trine', url: '/grimoire/aspects/types/trine' },
    ],
  },
  {
    letter: 'U',
    items: [{ name: 'Uranus', url: '/grimoire/astronomy/planets/uranus' }],
  },
  {
    letter: 'V',
    items: [
      { name: 'Venus', url: '/grimoire/astronomy/planets/venus' },
      { name: 'Virgo', url: '/grimoire/zodiac/virgo' },
    ],
  },
  {
    letter: 'W',
    items: [{ name: 'Wheel of the Year', url: '/grimoire/wheel-of-the-year' }],
  },
  { letter: 'Z', items: [{ name: 'Zodiac Signs', url: '/grimoire/zodiac' }] },
];

const cosmicConnectionsSections: CosmicConnectionSection[] = [
  {
    title: 'Quick Navigation',
    links: [
      { label: 'Grimoire Home', href: '/grimoire' },
      { label: 'Grimoire Search', href: '/grimoire/search' },
      { label: 'Explore the Grimoire', href: '/grimoire/page' },
    ],
  },
];

const toc = [
  { label: 'How to use this index', href: '#how-to-use' },
  { label: 'Alphabetical topics', href: '#alphabet' },
  { label: 'Research tips', href: '#tips' },
  { label: 'Add your own entries', href: '#personal' },
];

export default function AZIndexPage() {
  const allItems = topics.flatMap((t) => t.items);

  const itemListSchema = createItemListSchema({
    name: 'Lunary Grimoire A–Z Index',
    description:
      'Alphabetical reference to astrology, tarot, and witchcraft topics.',
    url: 'https://lunary.app/grimoire/a-z',
    items: allItems.map((item) => ({
      name: item.name,
      url: `https://lunary.app${item.url}`,
    })),
  });

  return (
    <>
      {renderJsonLd(itemListSchema)}
      <SEOContentTemplate
        title='Lunary Grimoire A–Z: Complete Topic Index'
        h1='Grimoire A–Z Index'
        description='Browse astrology, tarot, witchcraft, and lunar topics alphabetically for quick navigation.'
        keywords={['grimoire a-z', 'astrology index', 'tarot index']}
        canonicalUrl='https://lunary.app/grimoire/a-z'
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'A–Z', href: '/grimoire/a-z' },
        ]}
        intro='Use this alphabetical list to jump straight to the topic you need—no memorizing section names or digging through menus. Every entry in the grimoire appears sorted by letter for fast navigation.'
        meaning='Clarity arrives when you can find what you need instantly. This index maps the entire lunar library alphabetically so you always know where to go.'
        tableOfContents={toc}
        whatIs={{
          question: 'How should I use this index?',
          answer:
            'Select the letter that matches your topic, then follow the link to read the full entry. Bookmark the index for quick reference whenever you remember a keyword.',
        }}
        howToWorkWith={[
          'Combine this index with search if you want the quickest result',
          'Note new entries you create so you can add them later',
          'Use the alphabet to explore areas you haven’t studied yet',
        ]}
        faqs={[
          {
            question: 'What topics are covered?',
            answer:
              'Every major astrology, witchcraft, tarot, lunar, and manifestation topic listed in the Lunary Grimoire appears here, arranged by letter for speedy navigation. We also include references to tools (like the Birth Chart calculator) and seasonal resources so you always land on the right entry.',
          },
          {
            question: 'Can I submit or track a new topic?',
            answer:
              'Yes. Whenever you publish or bookmark a new article, give it a clear title, note the associated letter, and jot a short description so it slots into this index and your personal Book of Shadows without friction.',
          },
          {
            question: 'How do I keep the index updated?',
            answer:
              'Set aside a short “library maintenance” ritual at the start of each month. Review recent notes, add any standout spells or correspondences to their respective letters, and record cross references so future-you can trace the lineage of your research.',
          },
        ]}
        relatedItems={[
          {
            name: 'Grimoire Search',
            href: '/grimoire/search',
            type: 'Keyword lookup',
          },
          {
            name: 'Quick Explore',
            href: '/grimoire/page',
            type: 'Featured sections',
          },
        ]}
        internalLinks={[
          { text: 'Grimoire Home', href: '/grimoire' },
          { text: 'Search', href: '/grimoire/search' },
          { text: 'Book of Shadows', href: '/book-of-shadows' },
        ]}
        ctaText='Explore every section of the Grimoire'
        ctaHref='/grimoire'
        cosmicConnections={
          <CosmicConnections
            entityType='hub-a-z'
            entityKey='a-z'
            title='Quick Alphabet Links'
            sections={cosmicConnectionsSections}
          />
        }
      >
        <section id='how-to-use' className='mb-10 space-y-4'>
          <h2 className='text-3xl font-light text-zinc-100'>
            How to Use This Index
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Scroll to the letter you need, then click the topic. Bookmark
            letters you visit often and combine this index with the search bar
            for ultimate speed.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            Each letter block mirrors the structure of the Grimoire sidebar.
            When a section contains nested guides, note them in your personal
            notes so you remember which letter hides the essay you want to
            revisit. Treat the index like a map, and annotate it with the same
            care you would give a spell journal.
          </p>
        </section>

        <section id='alphabet' className='space-y-10 mb-10'>
          {topics.map((topic) => (
            <article key={topic.letter} className='space-y-3'>
              <div className='text-2xl font-semibold text-zinc-200'>
                {topic.letter}
              </div>
              <div className='grid grid-cols-2 md:grid-cols-3 gap-2 text-sm'>
                {topic.items.map((item) => (
                  <Link
                    key={item.name}
                    href={item.url}
                    className='block rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-300 hover:border-lunary-primary-500 hover:text-white transition'
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section id='tips' className='space-y-4 mb-10'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Research Tips & Shortcuts
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Every new article you add to your Book of Shadows becomes easier to
            find when you note the letter, keywords, and cross references. Use
            this checklist whenever you dive into study mode.
          </p>
          <ul className='space-y-2 text-zinc-300'>
            <li>
              <strong className='text-zinc-100'>Cross-link topics:</strong> if
              you learn about Aquarius in a lunar guide, add “Aquarius – see
              Moon Rituals” to keep the index relational.
            </li>
            <li>
              <strong className='text-zinc-100'>
                Highlight correspondences:
              </strong>{' '}
              note gemstones, herbs, and tarot cards alongside each entry so you
              can jump between practices without leaving the A–Z.
            </li>
            <li>
              <strong className='text-zinc-100'>
                Archive seasonal updates:
              </strong>{' '}
              when a new sabbat set or forecast drops, add the year next to the
              listing so you can trace past versions.
            </li>
            <li>
              <strong className='text-zinc-100'>Bookmark letters:</strong> most
              browsers let you create foldered bookmarks; save one per letter
              and drag frequent topics to the top.
            </li>
          </ul>
          <p className='text-zinc-300 leading-relaxed'>
            Treat this page as a living table of contents. The more detail you
            tag in your own notes, the faster you&apos;ll navigate the entire
            grimoire ecosystem in moments.
          </p>
        </section>

        <section id='personal' className='space-y-3'>
          <h2 className='text-3xl font-light text-zinc-100'>
            Add Your Own Entries
          </h2>
          <p className='text-zinc-300 leading-relaxed'>
            Keep your Book of Shadows updated and note new topics you create.
            Matching titles with alphabetical organization makes them easier for
            others (and you) to find later.
          </p>
          <p className='text-zinc-300 leading-relaxed'>
            When in doubt, attach three tags to every new entry: element,
            modality, and magical purpose. Those tags become bonus keywords that
            make the A–Z index an even richer discovery tool.
          </p>
        </section>
      </SEOContentTemplate>
    </>
  );
}
