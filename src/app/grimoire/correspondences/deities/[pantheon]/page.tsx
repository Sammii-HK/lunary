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

Working with deities brings divine support and ancient wisdom to your practice. Whether you're calling upon specific ${pantheonKey.toLowerCase()} gods or goddesses for guidance, seeking their assistance in spellwork, or building relationships through regular practice, ${pantheonKey.toLowerCase()} deities offer powerful connections to divine energy.`;

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
      faqs={[
        {
          question: `How do I work with ${pantheonKey.toLowerCase()} deities?`,
          answer: `Work with ${pantheonKey.toLowerCase()} deities by researching their mythology, understanding their domains, creating dedicated altars, offering appropriate items, and calling upon them respectfully in ritual. Always research and respect the traditions associated with ${pantheonKey.toLowerCase()} deities.`,
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
          href: '/grimoire/spellcraft-fundamentals',
        },
        { text: 'Spells & Rituals', href: '/grimoire/practices' },
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
                className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-purple-500/50 transition-all group'
              >
                <h3 className='text-lg font-medium text-zinc-100 mb-2 group-hover:text-purple-400 transition-colors'>
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
