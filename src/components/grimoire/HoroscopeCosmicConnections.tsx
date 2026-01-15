import CosmicConnections from './CosmicConnections';
import {
  getHoroscopeCosmicSections,
  type HoroscopeCosmicOptions,
} from '@/lib/horoscopeCosmicConnections';

export interface HoroscopeCosmicConnectionsProps extends HoroscopeCosmicOptions {
  title?: string;
  maxSections?: number;
}

export function HoroscopeCosmicConnections({
  variant,
  sign,
  monthSlug,
  year,
  currentYear,
  title,
  maxSections,
}: HoroscopeCosmicConnectionsProps) {
  const sections = getHoroscopeCosmicSections({
    variant,
    sign,
    monthSlug,
    year,
    currentYear,
  });

  if (sections.length === 0) {
    return null;
  }

  const entityType = sign ? 'sign' : 'hub-horoscopes';
  const entityKey = sign ?? 'horoscopes';

  return (
    <CosmicConnections
      entityType={entityType}
      entityKey={entityKey}
      sections={sections}
      title={title ?? 'Continue exploring horoscopes'}
      maxSections={maxSections ?? sections.length}
    />
  );
}
