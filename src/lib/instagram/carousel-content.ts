import { getGrimoireSnippetBySlug } from '@/lib/social/grimoire-content';
import type { ThemeCategory } from '@/lib/social/types';
import type { IGCarouselSlide, IGCarouselContent } from './types';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

/**
 * Build an array of carousel slides from a grimoire snippet.
 * Returns null if slug not found.
 */
export async function buildCarouselFromSlug(
  slug: string,
): Promise<IGCarouselContent | null> {
  const snippet = getGrimoireSnippetBySlug(slug);
  if (!snippet) return null;

  const category = mapCategory(snippet.category);
  const slides = buildSlides(snippet, category);

  return {
    title: snippet.title,
    category,
    slug,
    slides,
  };
}

/**
 * Map raw grimoire category strings to ThemeCategory.
 */
function mapCategory(raw: string): ThemeCategory {
  const map: Record<string, ThemeCategory> = {
    zodiac: 'zodiac',
    'zodiac-signs': 'zodiac',
    tarot: 'tarot',
    'tarot-cards': 'tarot',
    crystals: 'crystals',
    crystal: 'crystals',
    runes: 'runes',
    rune: 'runes',
    numerology: 'numerology',
    'angel-numbers': 'numerology',
    'life-path': 'numerology',
    'expression-numbers': 'numerology',
    'soul-urge': 'numerology',
    chakras: 'chakras',
    chakra: 'chakras',
    sabbat: 'sabbat',
    sabbats: 'sabbat',
    spells: 'spells',
    spell: 'spells',
    planetary: 'planetary',
    lunar: 'lunar',
  };
  return map[raw.toLowerCase()] || 'tarot';
}

/**
 * Build slides from a GrimoireSnippet based on its category.
 * Each category has a tailored slide structure.
 */
function buildSlides(
  snippet: ReturnType<typeof buildSlideData>,
  category: ThemeCategory,
): IGCarouselSlide[] {
  const fc = snippet.fullContent || {};
  const slides: IGCarouselSlide[] = [];

  // Cover slide (always first)
  slides.push(
    makeSlide(0, 0, snippet.title, snippet.summary, category, 'cover'),
  );

  // Category-specific body slides
  switch (category) {
    case 'spells':
      if (fc.description) {
        slides.push(
          makeSlide(
            1,
            0,
            snippet.title,
            fc.description,
            category,
            'body',
            'What This Spell Does',
          ),
        );
      }
      if (fc.herbs?.length || fc.colors?.length) {
        const ingredients = [...(fc.herbs || []), ...(fc.colors || [])].join(
          ', ',
        );
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            ingredients,
            category,
            'body',
            'Ingredients',
          ),
        );
      }
      if (snippet.keyPoints.length > 0) {
        const steps = snippet.keyPoints
          .map((p, i) => `${i + 1}. ${p}`)
          .join('\n');
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            steps,
            category,
            'body',
            'How to Cast',
          ),
        );
      }
      break;

    case 'crystals':
      if (fc.metaphysicalProperties) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.metaphysicalProperties,
            category,
            'body',
            'Properties',
          ),
        );
      }
      if (fc.element || fc.planet) {
        const assoc = [
          fc.element && `Element: ${fc.element}`,
          fc.planet && `Planet: ${fc.planet}`,
        ]
          .filter(Boolean)
          .join('\n');
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            assoc,
            category,
            'body',
            'Associations',
          ),
        );
      }
      if (fc.healingPractices?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.healingPractices.join('\n'),
            category,
            'body',
            'How to Use',
          ),
        );
      }
      break;

    case 'tarot':
      if (fc.keywords?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.keywords.join(', '),
            category,
            'body',
            'Keywords',
          ),
        );
      }
      if (fc.uprightMeaning) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.uprightMeaning,
            category,
            'body',
            'Upright',
          ),
        );
      }
      if (fc.reversedMeaning) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.reversedMeaning,
            category,
            'body',
            'Reversed',
          ),
        );
      }
      if (fc.loveTrait || fc.careerTrait) {
        const areas = [
          fc.loveTrait && `Love: ${fc.loveTrait}`,
          fc.careerTrait && `Career: ${fc.careerTrait}`,
        ]
          .filter(Boolean)
          .join('\n\n');
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            areas,
            category,
            'body',
            'Love & Career',
          ),
        );
      }
      break;

    case 'runes':
      if (fc.symbolism) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.symbolism,
            category,
            'body',
            'Symbol & Meaning',
          ),
        );
      }
      if (fc.uprightMeaning) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.uprightMeaning,
            category,
            'body',
            'Upright',
          ),
        );
      }
      if (fc.reversedMeaning) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.reversedMeaning,
            category,
            'body',
            'Reversed',
          ),
        );
      }
      if (fc.magicalUses?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.magicalUses.join('\n'),
            category,
            'body',
            'Magical Uses',
          ),
        );
      }
      break;

    case 'zodiac':
      if (fc.element || fc.planet || fc.modality) {
        const info = [
          fc.element && `Element: ${fc.element}`,
          fc.planet && `Ruler: ${fc.planet}`,
          fc.modality && `Modality: ${fc.modality}`,
        ]
          .filter(Boolean)
          .join('\n');
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            info,
            category,
            'body',
            'Element & Ruler',
          ),
        );
      }
      if (fc.strengths?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.strengths.join(', '),
            category,
            'body',
            'Strengths',
          ),
        );
      }
      if (fc.description) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.description,
            category,
            'body',
            'Personality',
          ),
        );
      }
      if (fc.loveTrait || fc.careerTrait) {
        const areas = [
          fc.loveTrait && `Love: ${fc.loveTrait}`,
          fc.careerTrait && `Career: ${fc.careerTrait}`,
        ]
          .filter(Boolean)
          .join('\n\n');
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            areas,
            category,
            'body',
            'Love & Career',
          ),
        );
      }
      break;

    case 'numerology':
      if (fc.keywords?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.keywords.join(', '),
            category,
            'body',
            'Keywords',
          ),
        );
      }
      if (fc.spiritualMeaning) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.spiritualMeaning,
            category,
            'body',
            'Spiritual Meaning',
          ),
        );
      }
      if (fc.loveTrait) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.loveTrait,
            category,
            'body',
            'Love',
          ),
        );
      }
      if (fc.careerTrait) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.careerTrait,
            category,
            'body',
            'Career',
          ),
        );
      }
      break;

    case 'chakras':
      if (fc.description) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.description,
            category,
            'body',
            'Meaning',
          ),
        );
      }
      if (fc.healingPractices?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.healingPractices.join('\n'),
            category,
            'body',
            'Healing',
          ),
        );
      }
      if (fc.affirmation) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.affirmation,
            category,
            'body',
            'Affirmation',
          ),
        );
      }
      break;

    case 'sabbat':
      if (fc.description || fc.message) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.description || fc.message || '',
            category,
            'body',
            'Meaning',
          ),
        );
      }
      if (fc.traditions?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.traditions.join('\n'),
            category,
            'body',
            'Traditions',
          ),
        );
      }
      if (fc.rituals?.length) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.rituals.join('\n'),
            category,
            'body',
            'Rituals',
          ),
        );
      }
      break;

    default:
      // Fallback: use key points
      if (snippet.keyPoints.length > 0) {
        for (const [i, point] of snippet.keyPoints.slice(0, 3).entries()) {
          slides.push(
            makeSlide(slides.length, 0, snippet.title, point, category, 'body'),
          );
        }
      }
      break;
  }

  // CTA slide (always last)
  const ctaMessages: Record<string, string> = {
    spells: 'Explore 200+ spells in the Grimoire',
    crystals: 'Discover 100+ crystals and their properties',
    tarot: 'Get your personalized tarot reading',
    runes: 'Explore the Elder Futhark rune system',
    zodiac: 'Explore your full cosmic profile',
    numerology: 'Calculate your personal numbers',
    chakras: 'Explore all 7 chakras and healing guides',
    sabbat: 'Follow the Wheel of the Year',
  };

  slides.push(
    makeSlide(
      slides.length,
      0,
      snippet.title,
      ctaMessages[category] || 'Explore the full Grimoire',
      category,
      'cta',
    ),
  );

  // Fix totalSlides on all slides
  const total = slides.length;
  return slides.map((s) => ({ ...s, totalSlides: total }));
}

type SnippetLike = Awaited<ReturnType<typeof getGrimoireSnippetBySlug>>;
function buildSlideData(snippet: NonNullable<SnippetLike>) {
  return snippet;
}

function makeSlide(
  slideIndex: number,
  totalSlides: number,
  title: string,
  content: string,
  category: ThemeCategory,
  variant: IGCarouselSlide['variant'],
  subtitle?: string,
): IGCarouselSlide {
  return {
    slideIndex,
    totalSlides,
    title,
    content,
    subtitle,
    category,
    variant,
  };
}

/**
 * Get image URLs for all slides in a carousel.
 */
export function getCarouselImageUrls(
  carousel: IGCarouselContent,
  baseUrl?: string,
): string[] {
  const base = baseUrl || SHARE_BASE_URL;
  return carousel.slides.map((slide) => {
    const params = new URLSearchParams({
      title: slide.title,
      slideIndex: String(slide.slideIndex),
      totalSlides: String(slide.totalSlides),
      content: slide.content,
      category: slide.category,
      variant: slide.variant,
    });
    if (slide.subtitle) params.set('subtitle', slide.subtitle);
    if (slide.symbol) params.set('symbol', slide.symbol);
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });
}
