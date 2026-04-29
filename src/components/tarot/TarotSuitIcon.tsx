import type { LucideIcon } from 'lucide-react';
import { Star, Sword, Trophy, Wand } from 'lucide-react';

type TarotSuitIconProps = {
  cardName?: string;
  suit?: string | null;
  arcana?: string | null;
  className?: string;
};

const normalize = (value?: string | null) => value?.toLowerCase().trim() ?? '';

function resolveSuit(cardName?: string, suit?: string | null) {
  const normalizedSuit = normalize(suit);
  if (normalizedSuit) return normalizedSuit;

  const normalizedName = normalize(cardName);
  if (normalizedName.includes('sword')) return 'swords';
  if (normalizedName.includes('cup')) return 'cups';
  if (normalizedName.includes('pentacle')) return 'pentacles';
  if (normalizedName.includes('wand')) return 'wands';
  return 'major';
}

export function getTarotSuitIcon({
  cardName,
  suit,
  arcana,
}: Pick<TarotSuitIconProps, 'cardName' | 'suit' | 'arcana'>): LucideIcon {
  const resolvedSuit =
    normalize(arcana) === 'major' ? 'major' : resolveSuit(cardName, suit);

  switch (resolvedSuit) {
    case 'swords':
      return Sword;
    case 'cups':
      return Trophy;
    case 'wands':
      return Wand;
    case 'pentacles':
    case 'major':
    default:
      return Star;
  }
}

export function TarotSuitIcon({
  cardName,
  suit,
  arcana,
  className,
}: TarotSuitIconProps) {
  const Icon = getTarotSuitIcon({ cardName, suit, arcana });
  return <Icon className={className} aria-hidden='true' />;
}
