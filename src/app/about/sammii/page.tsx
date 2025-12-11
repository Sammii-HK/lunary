import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Sammii H-K - Founder of Lunary | About the Creator',
  description:
    'Meet Sammii H-K, the founder and solo developer behind Lunary. Designer, engineer, and creator of the AI-powered spiritual intelligence platform combining astrology, tarot, and modern technology.',
  openGraph: {
    title: 'Sammii H-K - Founder of Lunary',
    description:
      'Designer, engineer, and creator of the Lunary spiritual intelligence platform.',
    url: 'https://lunary.app/about/sammii',
    type: 'profile',
  },
  alternates: { canonical: 'https://lunary.app/about/sammii' },
};

const authoredContent = [
  { name: 'Astrology Glossary', url: '/grimoire/glossary' },
  {
    name: 'Birth Chart Complete Guide',
    url: '/grimoire/guides/birth-chart-complete-guide',
  },
  {
    name: 'Tarot Complete Guide',
    url: '/grimoire/guides/tarot-complete-guide',
  },
  { name: 'Moon Phases Guide', url: '/grimoire/guides/moon-phases-guide' },
  {
    name: 'Crystal Healing Guide',
    url: '/grimoire/guides/crystal-healing-guide',
  },
  { name: 'Zodiac Signs Library', url: '/grimoire/zodiac' },
  { name: 'Planetary Placements', url: '/grimoire/placements' },
  { name: 'Tarot Card Meanings', url: '/grimoire/tarot' },
  { name: 'Crystal Encyclopedia', url: '/grimoire/crystals' },
  { name: 'Astrological Houses', url: '/grimoire/houses' },
];

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/lunary.app',
    handle: '@lunary.app',
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@lunary.app',
    handle: '@lunary.app',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/2WCJncKrKj',
    handle: 'Community',
  },
];

export default function AuthorPage() {
  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sammii H-K',
    url: 'https://lunary.app/about/sammii',
    image: 'https://lunary.app/press-kit/founder-portrait.png',
    jobTitle: 'Founder & Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    description:
      'Designer, engineer, and solo founder of Lunary. Creator of the Lunary AI architecture, design system, brand, and complete product.',
    sameAs: socialLinks.map((s) => s.url),
  };

  const contentListSchema = createItemListSchema({
    name: 'Content by Sammii H-K',
    description: 'Articles, guides, and reference content authored by Sammii.',
    url: 'https://lunary.app/about/sammii',
    items: authoredContent.map((item) => ({
      name: item.name,
      url: `https://lunary.app${item.url}`,
      description: `${item.name} - authored by Sammii H-K`,
    })),
  });

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(authorSchema)}
      {renderJsonLd(contentListSchema)}

      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
          <Link href='/' className='hover:text-zinc-300'>
            Home
          </Link>
          <span>/</span>
          <Link href='/about' className='hover:text-zinc-300'>
            About
          </Link>
          <span>/</span>
          <span className='text-zinc-400'>Sammii</span>
        </nav>

        <div className='grid md:grid-cols-3 gap-8 mb-12'>
          <div className='md:col-span-1'>
            <div className='aspect-square relative rounded-2xl overflow-hidden bg-zinc-800'>
              <Image
                src='/press-kit/founder-portrait.png'
                alt='Sammii H-K - Founder of Lunary'
                fill
                className='object-cover'
                sizes='(max-width: 768px) 100vw, 33vw'
              />
            </div>
          </div>
          <div className='md:col-span-2'>
            <h1 className='text-4xl font-light mb-2'>Sammii H-K</h1>
            <p className='text-lg text-lunary-primary-400 mb-4'>
              Founder & Solo Developer
            </p>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Designer, engineer, and solo founder of Lunary. Creator of the
              entire Lunary ecosystem—from the AI architecture and design system
              to the brand identity and complete product implementation.
            </p>
            <p className='text-zinc-400 leading-relaxed'>
              With a background in high-performance SaaS platforms and creative
              technology, Sammii brings together ancient symbolic systems and
              modern AI to create meaningful digital experiences for spiritual
              exploration.
            </p>
          </div>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-4'>Background</h2>
          <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
            <ul className='space-y-3 text-zinc-300'>
              <li className='flex items-start gap-3'>
                <span className='w-1.5 h-1.5 rounded-full bg-lunary-primary-400 mt-2'></span>
                Senior engineer and designer with experience building scalable
                SaaS platforms
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-1.5 h-1.5 rounded-full bg-lunary-primary-400 mt-2'></span>
                Deep knowledge of symbolic systems: astrology, tarot,
                numerology, and ritual practice
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-1.5 h-1.5 rounded-full bg-lunary-primary-400 mt-2'></span>
                Technical expertise in AI/ML, full-stack development, and
                product design
              </li>
              <li className='flex items-start gap-3'>
                <span className='w-1.5 h-1.5 rounded-full bg-lunary-primary-400 mt-2'></span>
                Shipped Lunary from concept to production as a solo technical
                founder
              </li>
            </ul>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-4'>Topics & Expertise</h2>
          <div className='flex flex-wrap gap-2'>
            {[
              'AI & Spirituality',
              'Digital Ritual Design',
              'Symbolic Meaning Systems',
              'Emotional Self-Reflection',
              'Ethical AI for Introspection',
              'Astrology Technology',
              'Product Design',
              'Solo Entrepreneurship',
            ].map((topic) => (
              <span
                key={topic}
                className='px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 text-sm'
              >
                {topic}
              </span>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-4'>Content by Sammii</h2>
          <div className='grid md:grid-cols-2 gap-3'>
            {authoredContent.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
              >
                <span className='text-zinc-200'>{item.name}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-light mb-4'>Connect</h2>
          <div className='flex flex-wrap gap-4'>
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
              >
                <span className='text-zinc-300'>{link.name}</span>
                <span className='text-zinc-500 text-sm'>{link.handle}</span>
                <ExternalLink className='w-4 h-4 text-zinc-500' />
              </a>
            ))}
          </div>
        </section>

        <section className='p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            Press & Media Inquiries
          </h2>
          <p className='text-zinc-300 mb-4'>
            For interviews, speaking engagements, or press coverage, please
            reach out directly.
          </p>
          <a
            href='mailto:sammi@lunary.app'
            className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            sammi@lunary.app
          </a>
        </section>
      </div>
    </div>
  );
}
