import type { IGCarouselSlide } from './types';
import type { ThemeCategory } from '@/lib/social/types';
import { seededRandom } from './ig-utils';
import angelNumbersData from '@/data/angel-numbers.json';

// Pull directly from the grimoire angel numbers JSON (50 numbers with rich data)
const GRIMOIRE_NUMBERS = angelNumbersData.numbers as Record<
  string,
  {
    number: string;
    coreMeaning: string;
    quickMeaning: string;
    message: string;
    meaning: string;
    spiritualMeaning: string;
    whenItAppears: string[];
    whatToDo: string[];
    love: { single: string; relationship: string; thinkingOfSomeone: string };
    loveMeaning: string;
    careerMeaning: string;
    correspondences: {
      planet: string;
      element: string;
      chakra: string;
      crystal: string;
      tarotCard: string;
    };
    journalPrompts: string[];
  }
>;

/** All available angel number keys from grimoire data */
export const AVAILABLE_ANGEL_NUMBERS = Object.keys(GRIMOIRE_NUMBERS);

// --- Generate Carousel Slides ---

export function generateAngelNumberCarousel(number: string): IGCarouselSlide[] {
  const data = GRIMOIRE_NUMBERS[number];
  if (!data) {
    throw new Error(`No data found for angel number: ${number}`);
  }

  const category: ThemeCategory = 'numerology';
  const totalSlides = 6;

  // Slide 1: Cover
  const coverSlide: IGCarouselSlide = {
    slideIndex: 0,
    totalSlides,
    title: `You keep seeing ${number}.`,
    content: data.coreMeaning,
    subtitle: number,
    category,
    variant: 'cover',
  };

  // Slide 2: Spiritual meaning
  const meaningSlide: IGCarouselSlide = {
    slideIndex: 1,
    totalSlides,
    title: 'What it means',
    content: data.quickMeaning,
    category,
    variant: 'body',
  };

  // Slide 3: What to do
  const actionsSlide: IGCarouselSlide = {
    slideIndex: 2,
    totalSlides,
    title: 'What to do',
    content: data.whatToDo
      .slice(0, 4)
      .map((action) => `• ${action}`)
      .join('\n\n'),
    category,
    variant: 'body',
  };

  // Slide 4: Love & Career
  const loveCareerSlide: IGCarouselSlide = {
    slideIndex: 3,
    totalSlides,
    title: `${number} in Love & Career`,
    content: `${data.loveMeaning}\n\n${data.careerMeaning}`,
    category,
    variant: 'body',
  };

  // Slide 5: Correspondences
  const corr = data.correspondences;
  const correspondenceLines = [
    corr.planet && `Planet: ${corr.planet}`,
    corr.element && `Element: ${corr.element}`,
    corr.chakra && `Chakra: ${corr.chakra}`,
    corr.crystal && `Crystal: ${corr.crystal}`,
    corr.tarotCard && `Tarot: ${corr.tarotCard}`,
  ].filter(Boolean);
  const correspondenceSlide: IGCarouselSlide = {
    slideIndex: 4,
    totalSlides,
    title: 'Cosmic connections',
    content: correspondenceLines.join('\n'),
    category,
    variant: 'body',
  };

  // Slide 6: CTA
  const ctaSlide: IGCarouselSlide = {
    slideIndex: 5,
    totalSlides,
    title: 'Track your angel numbers',
    content: 'Free on Lunary',
    subtitle: 'lunary.app',
    category,
    variant: 'cta',
  };

  return [
    coverSlide,
    meaningSlide,
    actionsSlide,
    loveCareerSlide,
    correspondenceSlide,
    ctaSlide,
  ];
}

// --- Generate Batch (deterministic selection) ---

export function generateAngelNumberBatch(
  dateStr: string,
  count: number = 1,
): Array<{ number: string; slides: IGCarouselSlide[] }> {
  const availableNumbers = [...AVAILABLE_ANGEL_NUMBERS];
  const rng = seededRandom(`angel-${dateStr}`);

  const selectedNumbers: string[] = [];
  for (let i = 0; i < count && availableNumbers.length > 0; i++) {
    const index = Math.floor(rng() * availableNumbers.length);
    selectedNumbers.push(availableNumbers[index]);
    availableNumbers.splice(index, 1);
  }

  return selectedNumbers.map((number) => ({
    number,
    slides: generateAngelNumberCarousel(number),
  }));
}
