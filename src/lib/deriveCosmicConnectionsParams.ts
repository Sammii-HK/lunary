import { EntityType } from '@/lib/cosmicConnectionsConfig';

export type DerivedCosmicConnectionsParams = {
  entityType: EntityType;
  entityKey: string;
};

const HUB_ROUTE_MAP: Record<string, DerivedCosmicConnectionsParams> = {
  guides: { entityType: 'hub-guides', entityKey: 'guides' },
  seasons: { entityType: 'hub-seasons', entityKey: 'seasons' },
  'wheel-of-the-year': {
    entityType: 'hub-wheel',
    entityKey: 'wheel-of-the-year',
  },
  numerology: { entityType: 'hub-numerology', entityKey: 'numerology' },
  'modern-witchcraft': {
    entityType: 'hub-witchcraft',
    entityKey: 'modern-witchcraft',
  },
  meditation: { entityType: 'hub-meditation', entityKey: 'meditation' },
  'candle-magic': { entityType: 'hub-candle-magic', entityKey: 'candle-magic' },
  divination: { entityType: 'hub-divination', entityKey: 'divination' },
  correspondences: {
    entityType: 'hub-correspondences',
    entityKey: 'correspondences',
  },
  crystals: { entityType: 'hub-crystals', entityKey: 'crystals' },
  chakras: { entityType: 'hub-chakras', entityKey: 'chakras' },
  practices: { entityType: 'hub-practices', entityKey: 'practices' },
  'birth-chart': { entityType: 'hub-birth-chart', entityKey: 'birth-chart' },
  aspects: { entityType: 'hub-aspects', entityKey: 'aspects' },
  zodiac: { entityType: 'hub-zodiac', entityKey: 'zodiac' },
  astronomy: { entityType: 'hub-astronomy', entityKey: 'astronomy' },
  tarot: { entityType: 'hub-tarot', entityKey: 'tarot' },
  runes: { entityType: 'hub-runes', entityKey: 'runes' },
  spells: { entityType: 'hub-spells', entityKey: 'spells' },
  birthday: { entityType: 'hub-zodiac', entityKey: 'zodiac' },
  decans: { entityType: 'hub-zodiac', entityKey: 'zodiac' },
  cusps: { entityType: 'hub-zodiac', entityKey: 'zodiac' },
  horoscopes: { entityType: 'hub-zodiac', entityKey: 'zodiac' },
  events: { entityType: 'hub-astronomy', entityKey: 'astronomy' },
  eclipses: { entityType: 'hub-astronomy', entityKey: 'astronomy' },
  'lunar-nodes': { entityType: 'hub-birth-chart', entityKey: 'birth-chart' },
  'life-path': { entityType: 'hub-numerology', entityKey: 'numerology' },
  'double-hours': { entityType: 'hub-numerology', entityKey: 'numerology' },
  'mirror-hours': { entityType: 'hub-numerology', entityKey: 'numerology' },
};

/**
 * Derive entityType/entityKey for CosmicConnections based on canonical URL.
 * This is a pure helper so it can be used both in the runtime template and the audit script.
 */
export function deriveCosmicConnectionsParams(
  canonicalUrl: string,
): DerivedCosmicConnectionsParams | null {
  try {
    const { pathname } = new URL(canonicalUrl);
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] !== 'grimoire') return null;
    const category = segments[1];
    const detail = segments[2];
    const subDetail = segments[3];

    if (!category) return null;

    switch (category) {
      case 'zodiac':
        return detail
          ? { entityType: 'sign', entityKey: detail }
          : HUB_ROUTE_MAP.zodiac;
      case 'astronomy':
        if (detail === 'planets' && subDetail) {
          return { entityType: 'planet', entityKey: subDetail };
        }
        if (detail === 'retrogrades' && subDetail) {
          return { entityType: 'planet', entityKey: subDetail };
        }
        if (!detail) return HUB_ROUTE_MAP.astronomy;
        return null;
      case 'houses':
        if (detail === 'overview' && subDetail) {
          return { entityType: 'house', entityKey: subDetail };
        }
        if (detail && detail !== 'overview') {
          return { entityType: 'planet', entityKey: detail };
        }
        return HUB_ROUTE_MAP['birth-chart'];
      case 'events':
        // Event calendars (eclipses/retrogrades, yearly hubs) tie back into sky timing.
        return HUB_ROUTE_MAP.events;
      case 'eclipses':
        return HUB_ROUTE_MAP.eclipses;
      case 'birthday':
        return HUB_ROUTE_MAP.birthday;
      case 'decans':
        return HUB_ROUTE_MAP.decans;
      case 'cusps':
        return HUB_ROUTE_MAP.cusps;
      case 'horoscopes':
        return HUB_ROUTE_MAP.horoscopes;
      case 'life-path':
        return HUB_ROUTE_MAP['life-path'];
      case 'lunar-nodes':
        return HUB_ROUTE_MAP['lunar-nodes'];
      case 'double-hours':
        return HUB_ROUTE_MAP['double-hours'];
      case 'mirror-hours':
        return HUB_ROUTE_MAP['mirror-hours'];
      case 'placements':
        if (detail) {
          return { entityType: 'placement', entityKey: detail };
        }
        return { entityType: 'hub-placements', entityKey: 'placements' };
      case 'tarot':
        if (detail && detail !== 'suits' && detail !== 'spreads') {
          return { entityType: 'tarot', entityKey: detail };
        }
        return HUB_ROUTE_MAP.tarot;
      case 'crystals':
        if (detail) {
          return { entityType: 'crystal', entityKey: detail };
        }
        return HUB_ROUTE_MAP.crystals;
      case 'moon':
        return { entityType: 'hub-moon', entityKey: 'moon' };
      case 'transits':
        return { entityType: 'hub-transits', entityKey: 'transits' };
      case 'glossary':
        return { entityType: 'hub-glossary', entityKey: 'glossary' };
      case 'book-of-shadows':
        return {
          entityType: 'hub-book-of-shadows',
          entityKey: 'book-of-shadows',
        };
      case 'spells':
        return { entityType: 'hub-spells', entityKey: 'spells' };
      case 'aspects':
        return { entityType: 'hub-aspects', entityKey: detail || 'aspects' };
    }

    if (HUB_ROUTE_MAP[category]) return HUB_ROUTE_MAP[category];

    // Fallback: still render a useful navigation block even for newer/odd routes
    // so every grimoire page gets internal link structure.
    return { entityType: 'hub-a-z', entityKey: 'a-z' };
  } catch {
    return null;
  }
}
