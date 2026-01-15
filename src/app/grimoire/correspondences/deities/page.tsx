import { Metadata } from 'next';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../utils/string';

export const metadata: Metadata = {
  title: 'Deity Correspondences: Gods & Goddesses Guide | Lunary',
  description:
    'Complete guide to deity correspondences. Explore Greek, Norse, Egyptian, and Celtic gods and goddesses with their domains, symbols, and offerings.',
  keywords: [
    'deity correspondences',
    'pagan gods',
    'goddesses',
    'greek gods',
    'norse gods',
    'egyptian gods',
    'celtic deities',
    'pantheons',
  ],
  openGraph: {
    title: 'Deity Correspondences Guide | Lunary',
    description: 'Complete guide to gods and goddesses from various pantheons.',
    url: 'https://lunary.app/grimoire/correspondences/deities',
    siteName: 'Lunary',
    images: [
      {
        url: '/api/og/grimoire/correspondences',
        width: 1200,
        height: 630,
        alt: 'Deity Correspondences Guide',
      },
    ],
    locale: 'en_US',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deity Correspondences Guide | Lunary',
    description: 'Complete guide to working with gods and goddesses.',
    images: ['/api/og/grimoire/correspondences'],
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/correspondences/deities',
  },
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

const faqs = [
  {
    question: 'How do I choose which deities to work with?',
    answer:
      'Many practitioners feel called by specific deities through dreams, synchronicities, or strong attraction. Others choose based on their practice focus (love magic = Aphrodite/Venus, protection = Thor/Athena). Your ancestry may also guide you. Most importantly, approach with respect and see if the deity responds.',
  },
  {
    question: 'Can I work with deities from different pantheons?',
    answer:
      'Yes, many modern practitioners work eclectically with deities from various cultures. Be respectful of each tradition, research thoroughly, and approach each deity on their own terms. Some deities work well together; others may not.',
  },
  {
    question: 'How do I know if a deity is responding to me?',
    answer:
      'Signs include repeated encounters with their symbols, dreams featuring them, successful magic in their domain, a sense of presence during invocation, and synchronicities related to their mythology. Trust your intuition but verify through continued practice.',
  },
  {
    question: 'What offerings should I give to deities?',
    answer:
      'Research traditional offerings for your specific deity. Common offerings include: food and drink they favored in myth, incense, candles in their colors, flowers, artwork, devotional acts, and donations to causes they would support. Quality and sincerity matter more than quantity.',
  },
  {
    question: 'Is deity work necessary for magic?',
    answer:
      "No, deity work is not required for magical practice. Many practitioners work with impersonal energy, spirits, ancestors, or the elements without invoking deities. If deity work doesn't resonate with you, there are many other valid paths.",
  },
];

const pantheonInfo: Record<string, string> = {
  Greek: 'The Olympian gods of ancient Greece',
  Norse: 'The Aesir and Vanir of Scandinavian mythology',
  Egyptian: 'The ancient gods of the Nile',
};

const tableOfContents = [
  { label: 'What Are Deity Correspondences?', href: '#what-is' },
  { label: 'Meaning', href: '#meaning' },
  { label: 'Pantheons', href: '#pantheons' },
  { label: 'Deities by Domain', href: '#domains' },
  { label: 'How to Work With This Energy', href: '#how-to-work' },
  { label: 'FAQ', href: '#faq' },
];

export default function DeitiesIndexPage() {
  const pantheons = Object.entries(correspondencesData.deities);

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title='Deities | Lunary'
        h1='Deity Correspondences: Gods & Goddesses'
        description='Connect with gods and goddesses from various traditions. Learn their domains, associations, and how to work with their energy.'
        keywords={[
          'deity correspondences',
          'pagan gods',
          'goddesses',
          'pantheons',
        ]}
        canonicalUrl='https://lunary.app/grimoire/correspondences/deities'
        tableOfContents={tableOfContents}
        whatIs={{
          question: 'What are Deity Correspondences?',
          answer:
            'Deity correspondences are the domains, symbols, offerings, and associations connected to specific gods and goddesses. Understanding these correspondences helps practitioners build relationships with deities, create appropriate altars and offerings, and align their magical work with divine energies.',
        }}
        tldr='Work with deities whose domains match your intentions. Research their mythology, preferred offerings, and symbols. Approach with respect. Greek, Norse, Egyptian, and Celtic pantheons are most common in Western practice.'
        meaning={`Deity work is a central part of many magical traditions. Gods and goddesses represent archetypal energies and cosmic forces that we can align with for guidance, protection, and magical assistance.

**Approaching Deity Work:**

**Research First**: Learn the mythology, history, and traditional worship practices
**Start Small**: Begin with offerings and meditation before complex ritual
**Be Respectful**: These are powerful beings, not servants to command
**Listen**: Pay attention to signs, dreams, and intuitions
**Build Relationship**: Deity work deepens over time through consistent practice

**Major Pantheons:**

**Greek/Roman**: Well-documented, accessible mythology. Gods have distinct personalities and domains.

**Norse**: Powerful warrior deities and complex cosmology. Strong emphasis on honor and fate.

**Egyptian**: Ancient and mysterious. Strong associations with death, magic, and transformation.

**Celtic**: Nature-based with strong fairy connections. Less documented but deeply rooted in the land.

**Working with Deities Magically:**

1. **Invocation**: Calling upon deity energy during ritual
2. **Devotion**: Building ongoing relationship through daily practice
3. **Offerings**: Giving appropriate gifts to honor and thank
4. **Altar work**: Creating sacred space dedicated to specific deities
5. **Petitioning**: Asking for assistance with specific matters

**Respect Cultural Context:**

While eclectic practice is valid, be aware that some traditions are closed or require initiation. Research respectfully and avoid appropriation.`}
        howToWorkWith={[
          'Research deities thoroughly before beginning work',
          'Start with meditation and offerings before complex ritual',
          'Create an altar space dedicated to your deity',
          'Learn their preferred offerings, colors, and symbols',
          'Build relationship through consistent devotional practice',
        ]}
        relatedItems={[
          {
            name: 'Wheel of the Year',
            href: '/grimoire/wheel-of-the-year',
            type: 'Guide',
          },
          {
            name: 'Sabbats',
            href: '/grimoire/wheel-of-the-year',
            type: 'Guide',
          },
          {
            name: 'Moon Phases',
            href: '/grimoire/moon/phases',
            type: 'Guide',
          },
          {
            name: 'All Correspondences',
            href: '/grimoire/correspondences',
            type: 'Guide',
          },
        ]}
        internalLinks={[
          {
            text: 'Correspondences Overview',
            href: '/grimoire/correspondences',
          },
          { text: 'Sabbats', href: '/grimoire/wheel-of-the-year' },
          { text: 'Moon Phases', href: '/grimoire/moon/phases' },
          { text: 'Candle Magic', href: '/grimoire/candle-magic' },
        ]}
        ctaText='Want personalized deity recommendations based on your chart?'
        ctaHref='/pricing'
        faqs={faqs}
      >
        <section id='pantheons' className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>Pantheons</h2>
          <p className='text-zinc-400 mb-6'>
            Explore gods and goddesses organized by their cultural tradition.
          </p>
          <div className='space-y-6'>
            {pantheons.map(([pantheon, deities]) => (
              <div
                key={pantheon}
                className='rounded-xl border border-zinc-800 bg-zinc-900/30 p-5'
              >
                <Link
                  href={`/grimoire/correspondences/deities/${stringToKebabCase(pantheon)}`}
                  className='group'
                >
                  <h3 className='text-xl font-medium text-zinc-100 group-hover:text-amber-300 transition-colors mb-2'>
                    {pantheon} Pantheon
                  </h3>
                  <p className='text-sm text-zinc-400 mb-4'>
                    {pantheonInfo[pantheon]}
                  </p>
                </Link>
                <div className='flex flex-wrap gap-2'>
                  {Object.keys(deities)
                    .slice(0, 8)
                    .map((deity) => (
                      <Link
                        key={deity}
                        href={`/grimoire/correspondences/deities/${stringToKebabCase(pantheon)}/${stringToKebabCase(deity)}`}
                        className='px-3 py-1 text-sm bg-zinc-800 text-zinc-400 rounded hover:bg-zinc-700 hover:text-zinc-200 transition-colors'
                      >
                        {deity}
                      </Link>
                    ))}
                  {Object.keys(deities).length > 8 && (
                    <Link
                      href={`/grimoire/correspondences/deities/${stringToKebabCase(pantheon)}`}
                      className='px-3 py-1 text-sm text-amber-400 hover:text-amber-300'
                    >
                      +{Object.keys(deities).length - 8} more
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id='domains'
          className='mb-12 bg-amber-950/20 border border-amber-900/50 rounded-xl p-6'
        >
          <h2 className='text-xl font-medium text-zinc-100 mb-4'>
            Quick Reference: Deities by Domain
          </h2>
          <div className='grid md:grid-cols-2 gap-4 text-sm'>
            <div>
              <p className='text-amber-400 font-medium'>Love & Beauty:</p>
              <p className='text-zinc-400'>Aphrodite, Venus, Freya, Hathor</p>
            </div>
            <div>
              <p className='text-amber-400 font-medium'>War & Protection:</p>
              <p className='text-zinc-400'>Ares, Mars, Thor, Sekhmet</p>
            </div>
            <div>
              <p className='text-amber-400 font-medium'>Magic & Wisdom:</p>
              <p className='text-zinc-400'>Hecate, Odin, Thoth, Brigid</p>
            </div>
            <div>
              <p className='text-amber-400 font-medium'>Death & Rebirth:</p>
              <p className='text-zinc-400'>Hades, Hel, Osiris, The Morrigan</p>
            </div>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
