import Link from 'next/link';
import { ArrowRight, Sparkles, Star, Moon, Sun } from 'lucide-react';
import { PLANETARY_CORRESPONDENCES } from '@/constants/entity-relationships';
import {
  MAJOR_ARCANA_CORRESPONDENCES,
  ELEMENTS,
  MODALITIES,
  HOUSES,
} from '@/constants/seo/cosmic-ontology';

// Helper to convert string to kebab-case
function toSlug(str: string): string {
  return str.toLowerCase().replace(/['']/g, '').replace(/\s+/g, '-');
}

// Convert house number to slug
const HOUSE_NUMBER_TO_SLUG: Record<number, string> = {
  1: 'first',
  2: 'second',
  3: 'third',
  4: 'fourth',
  5: 'fifth',
  6: 'sixth',
  7: 'seventh',
  8: 'eighth',
  9: 'ninth',
  10: 'tenth',
  11: 'eleventh',
  12: 'twelfth',
};

interface ConnectionItem {
  name: string;
  url: string;
  type:
    | 'zodiac'
    | 'planet'
    | 'tarot'
    | 'crystal'
    | 'element'
    | 'house'
    | 'other';
  description?: string;
}

interface CosmicConnectionsProps {
  entityType: 'planet' | 'zodiac' | 'tarot' | 'crystal';
  entityKey: string;
  title?: string;
  maxItems?: number;
}

const TYPE_ICONS: Record<ConnectionItem['type'], React.ReactNode> = {
  zodiac: <Star className='h-4 w-4' />,
  planet: <Sun className='h-4 w-4' />,
  tarot: <Sparkles className='h-4 w-4' />,
  crystal: <Moon className='h-4 w-4' />,
  element: <Sparkles className='h-4 w-4' />,
  house: <Star className='h-4 w-4' />,
  other: <ArrowRight className='h-4 w-4' />,
};

const TYPE_COLORS: Record<ConnectionItem['type'], string> = {
  zodiac:
    'bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700',
  planet:
    'bg-lunary-accent-900 text-lunary-accent-300 border-lunary-accent-700',
  tarot: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
  crystal:
    'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
  element:
    'bg-lunary-success-900 text-lunary-success-300 border-lunary-success-700',
  house:
    'bg-lunary-highlight-900 text-lunary-highlight-300 border-lunary-highlight-700',
  other: 'bg-zinc-800 text-zinc-300 border-zinc-700',
};

function getConnectionsForPlanet(planetKey: string): ConnectionItem[] {
  const planet = PLANETARY_CORRESPONDENCES[planetKey.toLowerCase()];
  if (!planet) return [];

  const connections: ConnectionItem[] = [];

  planet.rulesZodiac.forEach((sign) => {
    connections.push({
      name: sign,
      url: `/grimoire/zodiac/${sign.toLowerCase()}`,
      type: 'zodiac',
      description: `Ruled by ${planetKey}`,
    });
  });

  connections.push({
    name: planet.tarotCard,
    url: planet.tarotUrl,
    type: 'tarot',
    description: 'Associated Tarot card',
  });

  planet.crystals.slice(0, 2).forEach((crystal) => {
    connections.push({
      name: crystal,
      url: `/grimoire/crystals/${toSlug(crystal)}`,
      type: 'crystal',
      description: 'Associated crystal',
    });
  });

  const elementDef = Object.values(ELEMENTS).find(
    (e) => e.name === planet.element,
  );
  if (elementDef) {
    connections.push({
      name: `${planet.element} Element`,
      url: `/grimoire/correspondences/elements/${planet.element.toLowerCase()}`,
      type: 'element',
      description: `${planet.element} energy`,
    });
  }

  return connections;
}

function getConnectionsForZodiac(signKey: string): ConnectionItem[] {
  const connections: ConnectionItem[] = [];
  const signLower = signKey.toLowerCase();

  for (const [planetKey, planet] of Object.entries(PLANETARY_CORRESPONDENCES)) {
    if (planet.rulesZodiac.map((s) => s.toLowerCase()).includes(signLower)) {
      connections.push({
        name: planetKey.charAt(0).toUpperCase() + planetKey.slice(1),
        url: `/grimoire/planets/${planetKey}`,
        type: 'planet',
        description: 'Ruling planet',
      });
    }
  }

  const tarotCorr = MAJOR_ARCANA_CORRESPONDENCES.find(
    (c) => c.sign?.toLowerCase() === signLower,
  );
  if (tarotCorr) {
    connections.push({
      name: tarotCorr.card,
      url: tarotCorr.cardUrl,
      type: 'tarot',
      description: 'Associated Tarot card',
    });
  }

  const element = Object.values(ELEMENTS).find((e) =>
    e.signs.map((s) => s.toLowerCase()).includes(signLower),
  );
  if (element) {
    connections.push({
      name: `${element.name} Element`,
      url: `/grimoire/correspondences/elements/${element.name.toLowerCase()}`,
      type: 'element',
      description: element.description.slice(0, 50) + '...',
    });

    element.crystals.slice(0, 2).forEach((crystal) => {
      connections.push({
        name: crystal,
        url: `/grimoire/crystals/${toSlug(crystal)}`,
        type: 'crystal',
        description: `${element.name} element crystal`,
      });
    });
  }

  const modality = Object.values(MODALITIES).find((m) =>
    m.signs.map((s) => s.toLowerCase()).includes(signLower),
  );
  if (modality) {
    modality.signs
      .filter((s) => s.toLowerCase() !== signLower)
      .slice(0, 2)
      .forEach((sign) => {
        connections.push({
          name: sign,
          url: `/grimoire/zodiac/${sign.toLowerCase()}`,
          type: 'zodiac',
          description: `${modality.name} sign`,
        });
      });
  }

  const house = Object.values(HOUSES).find(
    (h) => h.naturalSign.toLowerCase() === signLower,
  );
  if (house && HOUSE_NUMBER_TO_SLUG[house.number]) {
    connections.push({
      name: house.name,
      url: `/grimoire/houses/overview/${HOUSE_NUMBER_TO_SLUG[house.number]}`,
      type: 'house',
      description: house.lifeDomain,
    });
  }

  return connections;
}

function getConnectionsForTarot(cardKey: string): ConnectionItem[] {
  const connections: ConnectionItem[] = [];
  const cardLower = cardKey.toLowerCase().replace(/-/g, ' ');

  const tarotCorr = MAJOR_ARCANA_CORRESPONDENCES.find(
    (c) => c.card.toLowerCase() === cardLower,
  );

  if (tarotCorr) {
    if (tarotCorr.planet) {
      connections.push({
        name: tarotCorr.planet,
        url: `/grimoire/planets/${tarotCorr.planet.toLowerCase()}`,
        type: 'planet',
        description: 'Associated planet',
      });
    }

    if (tarotCorr.sign) {
      connections.push({
        name: tarotCorr.sign,
        url: `/grimoire/zodiac/${tarotCorr.sign.toLowerCase()}`,
        type: 'zodiac',
        description: 'Associated zodiac sign',
      });
    }

    if (tarotCorr.element) {
      connections.push({
        name: `${tarotCorr.element} Element`,
        url: `/grimoire/correspondences/elements/${tarotCorr.element.toLowerCase()}`,
        type: 'element',
        description: `${tarotCorr.element} energy`,
      });
    }
  }

  return connections;
}

function getConnectionsForCrystal(crystalKey: string): ConnectionItem[] {
  const connections: ConnectionItem[] = [];
  const crystalLower = crystalKey.toLowerCase().replace(/-/g, ' ');

  for (const [planetKey, planet] of Object.entries(PLANETARY_CORRESPONDENCES)) {
    if (planet.crystals.map((c) => c.toLowerCase()).includes(crystalLower)) {
      connections.push({
        name: planetKey.charAt(0).toUpperCase() + planetKey.slice(1),
        url: `/grimoire/planets/${planetKey}`,
        type: 'planet',
        description: 'Associated planet',
      });

      planet.rulesZodiac.forEach((sign) => {
        connections.push({
          name: sign,
          url: `/grimoire/zodiac/${sign.toLowerCase()}`,
          type: 'zodiac',
          description: `Works with ${sign}`,
        });
      });
    }
  }

  for (const element of Object.values(ELEMENTS)) {
    if (element.crystals.map((c) => c.toLowerCase()).includes(crystalLower)) {
      connections.push({
        name: `${element.name} Element`,
        url: `/grimoire/correspondences/elements/${element.name.toLowerCase()}`,
        type: 'element',
        description: element.description.slice(0, 50) + '...',
      });
    }
  }

  return connections;
}

export function CosmicConnections({
  entityType,
  entityKey,
  title = 'Cosmic Connections',
  maxItems = 8,
}: CosmicConnectionsProps) {
  let connections: ConnectionItem[] = [];

  switch (entityType) {
    case 'planet':
      connections = getConnectionsForPlanet(entityKey);
      break;
    case 'zodiac':
      connections = getConnectionsForZodiac(entityKey);
      break;
    case 'tarot':
      connections = getConnectionsForTarot(entityKey);
      break;
    case 'crystal':
      connections = getConnectionsForCrystal(entityKey);
      break;
  }

  connections = connections.slice(0, maxItems);

  if (connections.length === 0) return null;

  return (
    <section className='mt-8'>
      <h2 className='text-2xl font-medium text-zinc-100 mb-4 flex items-center gap-2'>
        <Sparkles className='h-5 w-5 text-lunary-primary-400' />
        {title}
      </h2>
      <p className='text-zinc-400 text-sm mb-4'>
        Explore the cosmic web of correspondences and relationships
      </p>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        {connections.map((connection, index) => (
          <Link
            key={`${connection.url}-${index}`}
            href={connection.url}
            className={`
              flex items-center gap-3 p-4 rounded-xl border
              transition-all duration-200
              hover:scale-[1.02] hover:shadow-lg
              ${TYPE_COLORS[connection.type]}
            `}
          >
            <span className='flex-shrink-0'>{TYPE_ICONS[connection.type]}</span>
            <div className='flex-1 min-w-0'>
              <span className='font-medium text-white block truncate'>
                {connection.name}
              </span>
              {connection.description && (
                <span className='text-xs opacity-70 block truncate'>
                  {connection.description}
                </span>
              )}
            </div>
            <ArrowRight className='h-4 w-4 opacity-50 flex-shrink-0' />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CosmicConnections;
