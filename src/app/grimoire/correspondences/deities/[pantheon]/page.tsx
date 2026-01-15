import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import { stringToKebabCase } from '../../../../../../utils/string';
import Link from 'next/link';

const pantheonKeys = Object.keys(correspondencesData.deities);

export async function generateStaticParams() {
  return pantheonKeys.map((pantheon) => ({
    pantheon: stringToKebabCase(pantheon),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pantheon: string }>;
}): Promise<Metadata> {
  const { pantheon } = await params;
  const pantheonKey = pantheonKeys.find(
    (p) => stringToKebabCase(p) === pantheon.toLowerCase(),
  );

  if (!pantheonKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const pantheonData =
    correspondencesData.deities[
      pantheonKey as keyof typeof correspondencesData.deities
    ];
  const deityCount = Object.keys(pantheonData).length;
  const title = `${pantheonKey} Deities: Complete Guide - Lunary`;
  const description = `Discover all ${pantheonKey.toLowerCase()} deities and their magical correspondences. Learn about ${deityCount} ${pantheonKey.toLowerCase()} gods and goddesses, their domains, and how to work with them respectfully.`;

  return {
    title,
    description,
    keywords: [
      `${pantheonKey.toLowerCase()} deities`,
      `${pantheonKey.toLowerCase()} gods`,
      `${pantheonKey.toLowerCase()} pantheon`,
      `${pantheonKey.toLowerCase()} mythology`,
      `${pantheonKey.toLowerCase()} correspondences`,
    ],
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/correspondences/deities/${pantheon}`,
    },
  };
}

export default async function PantheonPage({
  params,
}: {
  params: Promise<{ pantheon: string }>;
}) {
  const { pantheon } = await params;
  const pantheonKey = pantheonKeys.find(
    (p) => stringToKebabCase(p) === pantheon.toLowerCase(),
  );

  if (!pantheonKey) {
    notFound();
  }

  const pantheonData =
    correspondencesData.deities[
      pantheonKey as keyof typeof correspondencesData.deities
    ];
  const deities = Object.entries(pantheonData);

  const meaning = `The ${pantheonKey} pantheon contains powerful deities associated with various domains of life and magic. Understanding ${pantheonKey.toLowerCase()} deities helps you work with divine energy respectfully and effectively.

Each ${pantheonKey.toLowerCase()} deity has specific domains and correspondences. When working with ${pantheonKey.toLowerCase()} deities, it's important to research their mythology, understand their domains, and honor them respectfully according to ${pantheonKey.toLowerCase()} traditions.

Working with deities brings divine support and ancient wisdom to your practice. Whether you're calling upon specific ${pantheonKey.toLowerCase()} gods or goddesses for guidance, seeking their assistance in spellwork, or building relationships through regular practice, ${pantheonKey.toLowerCase()} deities offer powerful connections to divine energy.

Approach each deity with care, clarity, and consent. Research traditional offerings, prayer styles, and cultural context before you begin. If a tradition is closed or requires initiation, respect those boundaries and focus on open, accessible practices instead.

Building a relationship takes time. Start small with a simple devotional act or written prayer, then observe how the relationship evolves. The key is consistency and sincere intention rather than elaborate tools.

If you are unsure where to begin, focus on one theme in your life—protection, creativity, healing, or wisdom—and explore which ${pantheonKey.toLowerCase()} deity aligns with that theme. This keeps your practice focused and helps you build a clear devotional thread over time.`;

  return (
    <SEOContentTemplate
      title={`${pantheonKey} Deities: Complete Guide - Lunary`}
      h1={`${pantheonKey} Deities`}
      description={`Discover all ${pantheonKey.toLowerCase()} deities and their magical correspondences. Learn about ${pantheonKey.toLowerCase()} gods and goddesses, their domains, and how to work with them.`}
      keywords={[
        `${pantheonKey.toLowerCase()} deities`,
        `${pantheonKey.toLowerCase()} gods`,
        `${pantheonKey.toLowerCase()} pantheon`,
        `${pantheonKey.toLowerCase()} mythology`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/correspondences/deities/${pantheon}`}
      intro={`The ${pantheonKey} pantheon contains powerful deities associated with various domains of life and magic. Understanding ${pantheonKey.toLowerCase()} deities helps you work with divine energy respectfully and effectively.`}
      tldr={`${pantheonKey} deities represent distinct domains like love, wisdom, protection, and transformation. Research their mythology, offer respectful devotion, and build relationships slowly. Let the deity's traditional symbols and stories guide your ritual approach.`}
      meaning={meaning}
      howToWorkWith={[
        `Research ${pantheonKey.toLowerCase()} mythology and traditions`,
        `Understand each deity's domain and correspondences`,
        `Honor deities respectfully according to tradition`,
        `Create dedicated altars for specific deities`,
        `Offer appropriate items based on deity domains`,
        `Call upon deities for guidance and support`,
        `Build relationships through regular practice`,
        `Respect cultural traditions and practices`,
      ]}
      tables={[
        {
          title: 'Respectful Approach Checklist',
          headers: ['Step', 'Why It Matters'],
          rows: [
            ['Research', 'Learn myths, symbols, and cultural context.'],
            ['Intention', 'Clarify why you are reaching out.'],
            ['Offering', 'Choose items aligned with the deity.'],
            ['Practice', 'Create a consistent devotional rhythm.'],
            ['Reflection', 'Notice patterns, signs, and outcomes.'],
          ],
        },
        {
          title: 'Simple Devotional Ideas',
          headers: ['Type', 'Example'],
          rows: [
            ['Offering', 'Fresh water, candle, or seasonal flowers'],
            ['Prayer', 'A short daily gratitude or request for guidance'],
            ['Study', 'Read a myth or historical source weekly'],
            ['Creative Act', 'Write, draw, or craft as devotion'],
          ],
        },
      ]}
      rituals={[
        'Light a candle and read a short myth connected to the deity.',
        'Create a small devotional space with one symbolic item.',
        'Offer water, incense, or food aligned with tradition.',
        'Write a personal prayer asking for guidance in one area.',
      ]}
      journalPrompts={[
        `Which ${pantheonKey.toLowerCase()} deity calls to me right now, and why?`,
        'What domain in my life needs divine support or protection?',
        'How can I honor this deity without appropriation?',
        'What signs or synchronicities have I noticed after offerings?',
      ]}
      faqs={[
        {
          question: `How do I work with ${pantheonKey.toLowerCase()} deities?`,
          answer: `Work with ${pantheonKey.toLowerCase()} deities by researching their mythology, understanding their domains, creating dedicated altars, offering appropriate items, and calling upon them respectfully in ritual. Always research and respect the traditions associated with ${pantheonKey.toLowerCase()} deities.`,
        },
        {
          question: 'How do I know if a deity is reaching out?',
          answer:
            'Look for consistent patterns: repeated symbols, dreams, or themes connected to that deity. Confirmation often comes through study—if a symbol keeps appearing, research which deities are linked to it.',
        },
        {
          question: `Do I need to worship ${pantheonKey.toLowerCase()} deities?`,
          answer: `No. You can work with ${pantheonKey.toLowerCase()} deities respectfully without full worship. Some practitioners honor deities, others work with them as archetypes or energies. Choose what aligns with your practice and beliefs.`,
        },
        {
          question: `Can I work with multiple ${pantheonKey.toLowerCase()} deities?`,
          answer: `Yes! Many practitioners work with multiple deities from the same or different pantheons. The key is respecting each deity's traditions and building genuine relationships through regular practice.`,
        },
      ]}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        {
          label: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          label: `${pantheonKey} Deities`,
          href: `/grimoire/correspondences/deities/${pantheon}`,
        },
      ]}
      internalLinks={[
        {
          text: 'Magical Correspondences',
          href: '/grimoire/correspondences',
        },
        {
          text: 'Spellcraft Fundamentals',
          href: '/grimoire/spells/fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/spells' },
        { text: 'Wheel of the Year', href: '/grimoire/wheel-of-the-year' },
      ]}
    >
      <div className='mt-8 space-y-6'>
        <h2 className='text-2xl font-medium text-zinc-100'>
          {pantheonKey} Deities
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {deities.map(([deityName, deityData]) => {
            const deitySlug = stringToKebabCase(deityName);
            return (
              <Link
                key={deityName}
                href={`/grimoire/correspondences/deities/${pantheon}/${deitySlug}`}
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-lunary-primary-400 transition-colors'>
                  {deityName}
                </h3>
                <p className='text-sm text-zinc-300'>
                  Domain: {deityData.domain.join(', ')}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </SEOContentTemplate>
  );
}
