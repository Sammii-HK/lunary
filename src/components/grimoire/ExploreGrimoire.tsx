'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const GRIMOIRE_LINKS = [
  { href: '/birth-chart', label: 'Birth Chart' },
  { href: '/grimoire/zodiac', label: 'Zodiac Signs' },
  { href: '/grimoire/astronomy/planets', label: 'Planets' },
  { href: '/grimoire/tarot', label: 'Tarot' },
  { href: '/grimoire/crystals', label: 'Crystals' },
  { href: '/grimoire/moon/phases', label: 'Moon Phases' },
  { href: '/grimoire/houses/overview/first', label: 'Houses' },
  { href: '/grimoire/spells', label: 'Spells' },
  { href: '/horoscope', label: 'Horoscopes' },
];

export function ExploreGrimoire() {
  const searchParams = useSearchParams();
  const nav = searchParams?.get('nav');
  const from = searchParams?.get('from');

  const withNavParams = (href: string) => {
    if (!nav && !from) return href;
    if (/^https?:\/\//i.test(href)) return href;

    const baseUrl = new URL(href, 'https://lunary.app');
    if (nav && !baseUrl.searchParams.get('nav')) {
      baseUrl.searchParams.set('nav', nav);
    }
    if (from && !baseUrl.searchParams.get('from')) {
      baseUrl.searchParams.set('from', from);
    }
    const query = baseUrl.searchParams.toString();
    return `${baseUrl.pathname}${query ? `?${query}` : ''}${baseUrl.hash}`;
  };

  return (
    <section className='mt-12 pt-8 border-t border-zinc-800'>
      <h2 className='text-xl font-medium text-zinc-100 mb-4'>
        Explore the Grimoire
      </h2>
      <p className='text-sm text-zinc-400 mb-4'>
        Continue your cosmic journey through Lunary&apos;s library of
        astrological wisdom.
      </p>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {GRIMOIRE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={withNavParams(link.href)}
            className='px-3 py-2 text-sm bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-zinc-300 hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-colors text-center'
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
