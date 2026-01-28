import { Metadata } from 'next';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { GrimoireBreadcrumbs } from '@/components/grimoire/GrimoireBreadcrumbs';
import SynastryGenerator from '@/components/grimoire/SynastryGenerator';

// 30-day ISR revalidation
export const revalidate = 2592000;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Synastry Chart Generator | Lunary',
    description:
      'Compare two birth charts to discover relationship compatibility, strengths, and growth areas.',
    keywords: [
      'synastry calculator',
      'synastry chart generator',
      'relationship astrology',
      'birth chart compatibility',
      'love astrology',
    ],
    openGraph: {
      title: 'Synastry Chart Generator | Lunary',
      description:
        'Compare two birth charts to discover relationship compatibility, strengths, and growth areas.',
      url: 'https://lunary.app/grimoire/synastry/generate',
    },
    alternates: {
      canonical: 'https://lunary.app/grimoire/synastry/generate',
    },
  };
}

const breadcrumbItems = [
  { name: 'Grimoire', url: '/grimoire' },
  { name: 'Synastry', url: '/grimoire/synastry' },
  { name: 'Generate', url: '/grimoire/synastry/generate' },
];

export default function SynastryGeneratorPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <GrimoireBreadcrumbs items={breadcrumbItems} />

        <header className='mb-8 text-center'>
          <Heart className='w-12 h-12 text-lunary-rose mx-auto mb-4' />
          <h1 className='text-3xl md:text-4xl font-light text-zinc-100 mb-2'>
            Synastry Chart Generator
          </h1>
          <p className='text-zinc-400'>
            Compare two birth charts to discover relationship compatibility
          </p>
        </header>

        <SynastryGenerator />

        <div className='mt-12 text-center'>
          <Link
            href='/grimoire/synastry'
            className='text-sm text-lunary-primary-400 hover:text-lunary-primary-300'
          >
            Learn more about synastry and relationship astrology →
          </Link>
        </div>

        <ExploreGrimoire />
      </div>
    </div>
  );
}
