import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { Wand2 } from 'lucide-react';
import { witchTypesOverview } from '@/constants/witch-types.json';
import { getCosmicConnections } from '@/lib/cosmicConnectionsConfig';
import CosmicConnections from '@/components/grimoire/CosmicConnections';

export const metadata: Metadata = {
  title: 'Types of Witches: Hedge, Kitchen, Green, Eclectic & More | Lunary',
  description:
    'Discover witch types and magical paths—from Green to Cosmic Witch. Find the traditions, tools, and practices that resonate with your spirit.',
  keywords: [
    'types of witches',
    'witch types',
    'green witch',
    'kitchen witch',
    'hedge witch',
    'what kind of witch am i',
  ],
  openGraph: {
    title: 'Types of Witches | Lunary',
    description: 'Explore different types of witches and magical paths.',
    url: 'https://lunary.app/grimoire/modern-witchcraft/witch-types',
    siteName: 'Lunary',
    locale: 'en_US',
    type: 'article',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/modern-witchcraft/witch-types',
  },
};

export default function WitchTypesIndexPage() {
  const heroContent = (
    <div className='text-center'>
      <div className='flex justify-center mb-4'>
        <Wand2 className='w-16 h-16 text-violet-400' />
      </div>
      <p className='text-zinc-400 text-lg max-w-2xl mx-auto'>
        Modern witchcraft contains countless paths. These categories highlight
        affinities and rituals so you can find a place to begin or grow without
        feeling boxed in.
      </p>
    </div>
  );

  const contextList = [
    'These categories are modern constructs—most historical witches simply practiced what worked for them.',
    'Labels are tools for exploration, not boxes to confine yourself to.',
    'Your practice will likely evolve over time, and that is perfectly normal.',
    'Some traditions have specific initiatory paths; these descriptions focus on self-defined practice.',
  ];

  const breadcrumbItems = [
    { label: 'Grimoire', href: '/grimoire' },
    { label: 'Modern Witchcraft', href: '/grimoire/modern-witchcraft' },
    { label: 'Witch Types' },
  ];

  return (
    <SEOContentTemplate
      title='Types of Witches: Hedge, Kitchen, Green, Eclectic & More | Lunary'
      h1='Types of Witches'
      description='Explore familiar witch types so you can notice what practices light you up. Whether you lean toward green, kitchen, hedge, or cosmic paths, these descriptions help you move forward with intention.'
      keywords={[
        'types of witches',
        'witch types',
        'green witch',
        'kitchen witch',
        'hedge witch',
        'what kind of witch am i',
      ]}
      canonicalUrl='https://lunary.app/grimoire/modern-witchcraft/witch-types'
      heroContent={heroContent}
      intro='When people ask "what type of witch am I?" they are learning how their interests and energy align with modern practices. These categories are not rigid labels—they are invitations to explore and sharpen newer or deeper affinities.'
      tldr='Witch types describe where you naturally feel called: hearth and home, plants, spirits, the sea, the stars, and more. Let curiosity guide you toward practices that feel nourishing.'
      whatIs={{
        question: 'What does it mean to explore a witch type?',
        answer:
          'It means noticing the people, rituals, and tools that feel most alive to you rather than sticking to a single tradition. Each category simply names an energetic focus so you can find relatable practice ideas.',
      }}
      breadcrumbs={breadcrumbItems}
      contextualCopy='Use these descriptions as a conversational springboard—ask, "What feels most like me?" and follow the instincts that emerge.'
      cosmicConnections={
        <CosmicConnections
          entityType='hub-glossary'
          entityKey='witch-types'
          title='Witch Types Connections'
          sections={getCosmicConnections('witchcraft', 'witch-types')}
        />
      }
      meaning={`When people ask "what type of witch am I?" they are usually looking for a way to understand their natural affinities and interests within the vast world of magical practice. These categories describe where a practitioner focuses their energy—not who they are as a person.

A "Green Witch" feels called to work with plants and herbs. A "Cosmic Witch" is drawn to astrology and planetary timing. A "Kitchen Witch" weaves magic into everyday domestic life. These are orientations, not limitations.`}
    >
      <section
        id='important-context'
        className='mb-10 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6'
      >
        <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
          Important Context
        </h2>
        <ul className='space-y-3 text-sm text-zinc-300'>
          {contextList.map((item) => (
            <li key={item} className='flex items-start gap-2'>
              <span className='text-lunary-accent mt-1'>•</span>
              <span className='min-w-0'>{item}</span>
            </li>
          ))}
        </ul>
      </section>
      <section id='witch-types' className='mb-12'>
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
          Explore Witch Types
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {witchTypesOverview.map((witch) => (
            <Link
              key={witch.slug}
              href={`/grimoire/modern-witchcraft/witch-types/${witch.slug}`}
              className='group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 hover:bg-zinc-900/60 hover:border-violet-500 transition-all'
            >
              <div className='flex items-center gap-4 mb-2'>
                <span className='text-3xl'>{witch.emoji}</span>
                <h3 className='text-lg font-medium text-zinc-100 group-hover:text-violet-300 transition-colors'>
                  {witch.name}
                </h3>
              </div>
              <p className='text-sm text-zinc-400'>{witch.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <section
        id='choose-your-path'
        className='mb-10 bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-2xl p-6'
      >
        <h2 className='text-xl font-medium text-lunary-primary-300 mb-3'>
          You Don&apos;t Have to Pick Just One Path
        </h2>
        <p className='text-zinc-300 leading-relaxed mb-4'>
          Many practitioners identify with multiple types, and most blend
          techniques from various paths. You might be a &quot;Cosmic Kitchen
          Witch&quot; who uses planetary timing while baking, or a &quot;Green
          Hedge Witch&quot; who works with herbs and spirit communication.
        </p>
        <p className='text-zinc-400 text-sm'>
          The most important thing is not the label—it&apos;s developing a
          practice that feels authentic to you. Let your curiosity guide you,
          respect the traditions you draw from, and remember that every
          experienced witch was once a beginner figuring things out.
        </p>
      </section>
    </SEOContentTemplate>
  );
}
