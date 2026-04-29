import type { LucideIcon } from 'lucide-react';
import { Star, Sword, Trophy, Wand } from 'lucide-react';

type TarotSuitIconProps = {
  cardName?: string;
  suit?: string | null;
  arcana?: string | null;
  className?: string;
};

const normalize = (value?: string | null) => value?.toLowerCase().trim() ?? '';

export const TAROT_SUIT_ACCENTS: Record<string, string> = {
  cups: 'from-sky-400/25 to-lunary-primary/15',
  wands: 'from-amber-300/25 to-lunary-rose-500/15',
  swords: 'from-zinc-200/25 to-lunary-accent/15',
  pentacles: 'from-emerald-300/25 to-lunary-secondary/15',
  major: 'from-lunary-primary/30 to-lunary-accent/15',
};

export function resolveTarotSuit(cardName?: string, suit?: string | null) {
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
    normalize(arcana) === 'major' ? 'major' : resolveTarotSuit(cardName, suit);

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

export function getTarotSuitAccent({
  cardName,
  suit,
  arcana,
}: Pick<TarotSuitIconProps, 'cardName' | 'suit' | 'arcana'>): string {
  const resolvedSuit =
    normalize(arcana) === 'major' ? 'major' : resolveTarotSuit(cardName, suit);
  return TAROT_SUIT_ACCENTS[resolvedSuit] ?? TAROT_SUIT_ACCENTS.major;
}
