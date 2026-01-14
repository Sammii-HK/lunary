import { NavParamLink } from '../NavParamLink';

const GRIMOIRE_LINKS = [
  { href: '/birth-chart', label: 'Birth Chart' },
  { href: '/grimoire/zodiac', label: 'Zodiac Signs' },
  { href: '/grimoire/astronomy/planets', label: 'Planets' },
  { href: '/grimoire/tarot', label: 'Tarot' },
  { href: '/grimoire/crystals', label: 'Crystals' },
  { href: '/grimoire/moon/phases', label: 'Moon Phases' },
  { href: '/grimoire/houses/overview/first', label: 'Houses' },
  { href: '/grimoire/spells', label: 'Spells' },
  { href: '/grimoire/horoscopes', label: 'Horoscopes' },
];

export function ExploreGrimoire() {
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
          <NavParamLink
            key={link.href}
            href={link.href}
            className='px-3 py-2 text-sm bg-zinc-900/50 border border-zinc-800/50 rounded-lg text-zinc-300 hover:bg-zinc-800/50 hover:border-lunary-primary-600 transition-colors text-center'
          >
            {link.label}
          </NavParamLink>
        ))}
      </div>
    </section>
  );
}
