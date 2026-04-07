import { NavParamLink } from '../NavParamLink';
import { Heading } from '@/components/ui/Heading';

const GRIMOIRE_LINKS = [
  { href: '/grimoire/horoscopes', label: 'Horoscopes' },
  { href: '/grimoire/events', label: 'Astrological Events' },
  { href: '/grimoire/moon', label: 'Lunar Events' },
  { href: '/grimoire/transits', label: 'Transits' },
  { href: '/grimoire/birth-chart', label: 'Birth Chart' },
  { href: '/grimoire/zodiac', label: 'Zodiac Signs' },
  { href: '/grimoire/astronomy/planets', label: 'Planets' },
  { href: '/grimoire/tarot', label: 'Tarot' },
  { href: '/grimoire/crystals', label: 'Crystals' },
  { href: '/grimoire/guides/moon-phases-guide', label: 'Moon Phases' },
  { href: '/grimoire/houses', label: 'Astrological Houses' },
  { href: '/grimoire/spells', label: 'Spells' },
];

export function ExploreGrimoire() {
  return (
    <section className='mt-12 pt-8 border-t border-stroke-subtle'>
      <Heading as='h2' variant='h2'>
        Explore the Grimoire
      </Heading>
      <p className='text-sm text-content-muted mb-4'>
        Continue your cosmic journey through Lunary&apos;s library of
        astrological wisdom.
      </p>
      <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
        {GRIMOIRE_LINKS.map((link) => (
          <NavParamLink
            key={link.href}
            href={link.href}
            className='px-3 py-2 text-sm bg-surface-elevated/50 border border-stroke-subtle/50 rounded-lg text-content-secondary hover:bg-surface-card/50 hover:border-lunary-primary-600 transition-colors text-center'
          >
            {link.label}
          </NavParamLink>
        ))}
      </div>
    </section>
  );
}
