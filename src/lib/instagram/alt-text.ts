import type { ThemeCategory } from '@/lib/social/types';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function generateCarouselAltText(
  title: string,
  category: ThemeCategory,
  slideSubtitle?: string,
): string {
  const categoryMap: Record<string, string> = {
    zodiac: `${title} zodiac sign personality traits carousel showing ${slideSubtitle?.toLowerCase() || 'key information'} from Lunary astrology app`,
    tarot: `${title} tarot card meaning carousel showing ${slideSubtitle?.toLowerCase() || 'interpretations'} from Lunary astrology app`,
    crystals: `${title} crystal healing guide carousel showing ${slideSubtitle?.toLowerCase() || 'properties'} from Lunary astrology app`,
    numerology: `${title} numerology carousel showing ${slideSubtitle?.toLowerCase() || 'meanings'} from Lunary astrology app`,
    spells: `${title} spell guide carousel showing ${slideSubtitle?.toLowerCase() || 'instructions'} from Lunary astrology app`,
    runes: `${title} rune meaning carousel showing ${slideSubtitle?.toLowerCase() || 'interpretations'} from Lunary astrology app`,
    chakras: `${title} chakra guide carousel showing ${slideSubtitle?.toLowerCase() || 'healing practices'} from Lunary astrology app`,
    sabbat: `${title} sabbat guide carousel showing ${slideSubtitle?.toLowerCase() || 'traditions'} from Lunary astrology app`,
  };
  return (
    categoryMap[category] ||
    `${title} ${category} carousel from Lunary astrology app`
  );
}

export function generateMemeAltText(sign: string, template: string): string {
  return `${capitalize(sign)} zodiac meme (${template} format) from Lunary astrology app`;
}

export function generateCompatibilityAltText(
  sign1: string,
  sign2: string,
  score: number,
): string {
  return `${capitalize(sign1)} and ${capitalize(sign2)} zodiac compatibility card showing ${score}% score from Lunary astrology app`;
}

export function generateRankingAltText(trait: string): string {
  return `Zodiac signs ranked by ${trait} showing all 12 signs from Lunary astrology app`;
}

export function generateAngelNumberAltText(number: string): string {
  return `Angel number ${number} meaning and spiritual significance from Lunary astrology app`;
}

export function generateStoryAltText(variant: string, title: string): string {
  const variantMap: Record<string, string> = {
    daily_moon: `${title} moon phase daily story from Lunary astrology app`,
    tarot_pull: `${title} daily tarot pull story from Lunary astrology app`,
    poll: `This or that poll story about ${title} from Lunary astrology app`,
  };
  return variantMap[variant] || `${title} story from Lunary astrology app`;
}

export function generateQuoteAltText(quote: string): string {
  const shortQuote = quote.length > 60 ? quote.slice(0, 57) + '...' : quote;
  return `Astrology quote card: "${shortQuote}" from Lunary astrology app`;
}

export function generateDidYouKnowAltText(
  category: string,
  fact: string,
): string {
  const shortFact = fact.length > 60 ? fact.slice(0, 57) + '...' : fact;
  return `Did you know fact about ${category}: "${shortFact}" from Lunary astrology app`;
}
