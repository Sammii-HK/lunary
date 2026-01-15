import { Metadata } from 'next';
import Link from 'next/link';
import { Wand2 } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

const historicalWitches = [
  {
    slug: 'gerald-gardner',
    name: 'Gerald Gardner',
    era: '1884-1964',
    description: 'Founder of Wicca and modern witchcraft',
  },
  {
    slug: 'doreen-valiente',
    name: 'Doreen Valiente',
    era: '1922-1999',
    description: 'Mother of modern witchcraft, wrote the Charge of the Goddess',
  },
  {
    slug: 'scott-cunningham',
    name: 'Scott Cunningham',
    era: '1956-1993',
    description: 'Influential author on Wicca and natural magic',
  },
  {
    slug: 'raymond-buckland',
    name: 'Raymond Buckland',
    era: '1934-2017',
    description: 'Brought Wicca to America, founded Seax-Wica',
  },
  {
    slug: 'starhawk',
    name: 'Starhawk',
    era: '1951-present',
    description: 'Author of The Spiral Dance, eco-feminist witch',
  },
  {
    slug: 'aleister-crowley',
    name: 'Aleister Crowley',
    era: '1875-1947',
    description: 'Influential occultist, founder of Thelema',
  },
];

export const metadata: Metadata = {
  title: 'Famous Witches & Occultists: Historical Figures | Lunary',
  description:
    'Learn about influential witches, occultists, and magical practitioners who shaped modern witchcraft. From Gerald Gardner to Doreen Valiente.',
  keywords: [
    'famous witches',
    'wicca founders',
    'gerald gardner',
    'doreen valiente',
    'witchcraft history',
    'occultists',
  ],
  openGraph: {
    title: 'Famous Witches & Occultists | Lunary',
    description:
      'Learn about influential figures who shaped modern witchcraft.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/famous-witches',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/famous-witches',
  },
};

export default function WitchesIndexPage() {
  const tableOfContents = [
    { label: 'Shaping Modern Witchcraft', href: '#shaping-modern-witchcraft' },
    { label: 'Shared Themes', href: '#shared-themes' },
    { label: 'How to Study Their Work', href: '#how-to-study' },
    { label: 'Historical Figures', href: '#historical-figures' },
    { label: 'Related Resources', href: '#related-resources' },
  ];

  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Wand2 className='w-16 h-16 text-violet-400' />
      </div>
      <p className='text-lg text-zinc-400 max-w-3xl mx-auto'>
        Explore the lives and contributions of influential witches and
        occultists who shaped modern witchcraft, Wicca, and contemporary magical
        traditions.
      </p>
    </div>
  );

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <SEOContentTemplate
        title={metadata.title as string}
        h1='Famous Witches & Occultists'
        description={metadata.description as string}
        keywords={metadata.keywords as string[]}
        canonicalUrl={
          (metadata.alternates?.canonical as string) ??
          'https://lunary.app/grimoire/modern-witchcraft/famous-witches'
        }
        intro='Modern witchcraft is shaped by teachers, writers, and practitioners who preserved ritual knowledge and adapted it for contemporary life.'
        tldr='These figures shaped modern witchcraft through teachings, books, and communities. Their work is a foundation for many current practices.'
        meaning={`Studying historical figures helps you understand where modern traditions come from and how they evolved. Some focused on Wicca, others on ceremonial magic, and others on folk practice.

Use their stories as inspiration, not as rigid rules. Modern practice grows when you honor lineage while adapting to your own values.`}
        howToWorkWith={[
          'Read one primary source before reading commentary.',
          'Compare two teachers with different approaches.',
          'Notice what aligns with your values and what does not.',
          'Keep a short study journal as you explore their work.',
        ]}
        rituals={[
          'Pick one teacher to study and read a short excerpt.',
          'Write a paragraph on what you want to learn from their approach.',
          'Light a candle and reflect on the lineage of your practice.',
        ]}
        journalPrompts={[
          'Which figure resonates most with me and why?',
          'What part of their practice feels relevant today?',
          'How do I want to shape my own path?',
        ]}
        tables={[
          {
            title: 'Legacy Overview',
            headers: ['Focus', 'Examples'],
            rows: [
              ['Wicca', 'Gardner, Valiente'],
              ['Occult Study', 'Crowley, Buckland'],
              ['Eco-Spiritual', 'Starhawk'],
            ],
          },
          {
            title: 'Study Prompts',
            headers: ['Question', 'Why it helps'],
            rows: [
              ['What did they preserve?', 'Clarifies lineage'],
              ['What did they innovate?', 'Shows evolution'],
              ['What feels outdated?', 'Keeps practice grounded'],
            ],
          },
        ]}
        internalLinks={[
          { text: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { text: 'Book of Shadows', href: '/grimoire/book-of-shadows' },
          {
            text: 'Witchcraft Ethics',
            href: '/grimoire/modern-witchcraft/ethics',
          },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        tableOfContents={tableOfContents}
        heroContent={heroContent}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
          { label: 'Famous Witches' },
        ]}
      >
        <section
          id='shaping-modern-witchcraft'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Shaping Modern Witchcraft
          </h2>
          <p className='text-zinc-400'>
            Modern witchcraft and Wicca as we know them were shaped by key
            figures in the 20th century. Their writings, teachings, and
            practices created the foundation for contemporary magical
            traditions. Understanding their contributions helps us appreciate
            the roots of our practice.
          </p>
        </section>

        <section
          id='shared-themes'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Shared Themes Across Their Work
          </h2>
          <p className='text-zinc-400 mb-4'>
            Despite different paths, many of these figures emphasized ritual
            structure, symbolism, and ethical practice. Most encouraged
            practitioners to cultivate discipline and personal responsibility,
            rather than looking for shortcuts.
          </p>
          <p className='text-zinc-400'>
            Another common thread is community. From covens to study circles,
            these teachers understood that practice deepens when shared with
            others.
          </p>
        </section>

        <section
          id='how-to-study'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            How to Study Their Work
          </h2>
          <p className='text-zinc-400 mb-4'>
            Start with one book or lecture, then take notes on the rituals,
            values, and practices that stand out. Compare at least two voices so
            you can see where they overlap and where they diverge.
          </p>
          <p className='text-zinc-400'>
            Focus on principles you can test in your own practice. If a ritual
            does not resonate, document why and move on without guilt.
          </p>
        </section>

        <section
          id='why-their-work-matters'
          className='bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-3'>
            Why Their Work Matters
          </h2>
          <p className='text-zinc-400 mb-4'>
            Many modern practices are shaped by published rituals, oral
            teachings, and community traditions created by these figures. Their
            contributions kept traditions alive and accessible.
          </p>
          <p className='text-zinc-400'>
            You can honor the legacy by studying their methods and adapting what
            fits your values, while letting go of what does not.
          </p>
        </section>

        <section id='historical-figures' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Historical Figures
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {historicalWitches.map((witch) => (
              <Link
                key={witch.slug}
                href={`/grimoire/modern-witchcraft/famous-witches/${witch.slug}`}
                className='group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/50 hover:border-violet-700/50 transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <h3 className='font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                    {witch.name}
                  </h3>
                  <span className='text-xs text-zinc-400'>{witch.era}</span>
                </div>
                <p className='text-sm text-zinc-400'>{witch.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <section
          id='related-resources'
          className='border-t border-zinc-800 pt-8'
        >
          <h3 className='text-lg font-medium text-zinc-100 mb-4'>
            Related Resources
          </h3>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/modern-witchcraft'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Modern Witchcraft
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/witch-types'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Types of Witches
            </Link>
            <Link
              href='/grimoire/book-of-shadows'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Book of Shadows
            </Link>
            <Link
              href='/grimoire/modern-witchcraft/ethics'
              className='px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors'
            >
              Witchcraft Ethics
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
