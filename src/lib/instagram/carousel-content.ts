import { getGrimoireSnippetBySlug } from '@/lib/social/grimoire-content';
import { getCrystalById } from '@/constants/grimoire/crystals';
import type { ThemeCategory } from '@/lib/social/types';
import type { IGCarouselSlide, IGCarouselContent } from './types';
import { seededPick } from './ig-utils';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// --- Hook text for cover slides (Fix 3) ---

const ZODIAC_HOOKS: Record<string, string[]> = {
  aries: [
    "The sign that's always 10 steps ahead",
    'Born to lead, not to follow',
    'First in everything \u2014 including chaos',
  ],
  taurus: [
    'Stubborn? Or just knows exactly what they want?',
    'The sign that turns comfort into an art form',
    'Slow to trust, impossible to forget',
  ],
  gemini: [
    "Two-faced? You don't know the half of it",
    'The sign that lives three lives at once',
    'Never boring. Always evolving.',
  ],
  cancer: [
    'The emotional genius nobody gives credit to',
    'Feels everything at 10x volume',
    'The sign that remembers every detail',
  ],
  leo: [
    "Main character energy isn't a choice \u2014 it's destiny",
    'The sign that lights up every room',
    "Born to shine. Can't help it.",
  ],
  virgo: [
    'The most misunderstood sign in the zodiac',
    'Quietly fixing everything around them',
    'Higher standards than everyone else',
  ],
  libra: [
    'Pretty face, ruthless mind',
    'The sign that makes everyone feel special',
    'Charming and calculating in equal measure',
  ],
  scorpio: [
    'The truth about Scorpio nobody talks about',
    'Already knows your secrets before you told them',
    'Intense? They prefer \"deeply invested\"',
  ],
  sagittarius: [
    "Can't be tamed. Shouldn't be.",
    'The sign that chose freedom over everything',
    'Born to explore. Allergic to routine.',
  ],
  capricorn: [
    'Cold? No. Playing chess while you play checkers.',
    "Building empires while you're sleeping",
    'The most underrated sign in the zodiac',
  ],
  aquarius: [
    'The alien of the zodiac \u2014 and proud of it',
    'Thinking 10 years ahead of everyone',
    'Different by design. Revolutionary by nature.',
  ],
  pisces: [
    "Too sensitive? Or seeing things you can't?",
    'The sign that lives between worlds',
    'Dreams so vivid they become reality',
  ],
};

const TAROT_HOOK_TEMPLATES = [
  "[Card] appeared in your reading. Here's what it really means.",
  "Pulled [Card]? Don't panic \u2014 read this first.",
  'What [Card] is trying to tell you right now',
  '[Card]: the card nobody wants to see (but everyone needs)',
];

const CRYSTAL_HOOK_TEMPLATES = [
  'Why every empath needs [Crystal]',
  'The crystal that changes everything',
  '[Crystal]: the stone your collection is missing',
  'Stop scrolling \u2014 you need [Crystal] in your life',
];

function getHookText(category: ThemeCategory, title: string): string {
  const signKey = title.toLowerCase();

  if (category === 'zodiac' && ZODIAC_HOOKS[signKey]) {
    return seededPick(ZODIAC_HOOKS[signKey], `hook-${signKey}-${Date.now()}`);
  }

  if (category === 'tarot') {
    const template = seededPick(TAROT_HOOK_TEMPLATES, `hook-tarot-${title}`);
    return template.replace('[Card]', title);
  }

  if (category === 'crystals') {
    const template = seededPick(
      CRYSTAL_HOOK_TEMPLATES,
      `hook-crystal-${title}`,
    );
    return template.replace('[Crystal]', title);
  }

  return '';
}

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

  // Enrich with full database data (not just grimoire snippets)
  let enrichedSnippet = snippet;

  if (category === 'crystals') {
    const crystalId = slug.replace('crystals/', '');
    const fullCrystalData = getCrystalById(crystalId);

    if (fullCrystalData) {
      enrichedSnippet = {
        ...snippet,
        fullContent: {
          ...snippet.fullContent,
          // Merge in full crystal data from database
          chakras: fullCrystalData.chakras,
          primaryChakra: fullCrystalData.primaryChakra,
          zodiacSigns: fullCrystalData.zodiacSigns,
          planets: fullCrystalData.planets,
          elements: fullCrystalData.elements,
          workingWith: fullCrystalData.workingWith,
          careInstructions: fullCrystalData.careInstructions,
          combinations: fullCrystalData.combinations,
          intentions: fullCrystalData.intentions,
          colors: fullCrystalData.colors,
          description: fullCrystalData.description,
          metaphysicalProperties: fullCrystalData.metaphysicalProperties,
        },
      };
    }
  } else if (category === 'spells') {
    // Load full spell data from JSON
    const spellsData = await import('@/data/spells.json');
    const spellId = slug.replace('spells/', '');
    const fullSpellData = (spellsData.default as any[]).find(
      (s) =>
        s.id === spellId ||
        s.slug === spellId ||
        s.name?.toLowerCase().replace(/\s+/g, '-') === spellId,
    );

    if (fullSpellData) {
      enrichedSnippet = {
        ...snippet,
        fullContent: {
          ...snippet.fullContent,
          description: fullSpellData.description || fullSpellData.purpose,
          ingredients: fullSpellData.ingredients,
          herbs: fullSpellData.herbs,
          crystals: fullSpellData.crystals,
          colors: fullSpellData.colors,
          moonPhases: fullSpellData.moonPhases,
          timing: fullSpellData.timing,
          instructions: fullSpellData.instructions || fullSpellData.steps,
          intention: fullSpellData.intention,
        },
      };
    }
  }

  const slides = buildSlides(enrichedSnippet, category);

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

  // Cover slide (always first) — hook text goes in content field
  const hookText = getHookText(category, snippet.title);
  slides.push(
    makeSlide(
      0,
      0,
      snippet.title,
      hookText || snippet.summary,
      category,
      'cover',
    ),
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
      // Slide 1: Metaphysical Properties
      if (fc.metaphysicalProperties) {
        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            fc.metaphysicalProperties,
            category,
            'body',
            'Metaphysical Properties',
          ),
        );
      }

      // Slide 2: Chakra & Energy
      if (fc.chakras?.length || fc.primaryChakra) {
        const chakraText = fc.primaryChakra
          ? `Primary: ${fc.primaryChakra}${fc.chakras?.length > 1 ? `\n\nAlso works with: ${fc.chakras.filter((c: string) => c !== fc.primaryChakra).join(', ')}` : ''}`
          : fc.chakras?.join(', ');

        if (chakraText) {
          slides.push(
            makeSlide(
              slides.length,
              0,
              snippet.title,
              chakraText,
              category,
              'body',
              'Chakra Connections',
            ),
          );
        }
      }

      // Slide 3: Zodiac & Planetary
      if (fc.zodiacSigns?.length || fc.planets?.length) {
        const cosmicAssoc = [
          fc.zodiacSigns?.length &&
            `Zodiac: ${fc.zodiacSigns.slice(0, 3).join(', ')}`,
          fc.planets?.length && `Planets: ${fc.planets.join(', ')}`,
          fc.elements?.length && `Element: ${fc.elements.join(', ')}`,
        ]
          .filter(Boolean)
          .join('\n\n');

        slides.push(
          makeSlide(
            slides.length,
            0,
            snippet.title,
            cosmicAssoc,
            category,
            'body',
            'Cosmic Alignments',
          ),
        );
      }

      // Slide 4: How to Work With It
      if (fc.workingWith) {
        const practices = [
          fc.workingWith.meditation &&
            `Meditation: ${fc.workingWith.meditation}`,
          fc.workingWith.healing && `Healing: ${fc.workingWith.healing}`,
          fc.workingWith.manifestation &&
            `Manifestation: ${fc.workingWith.manifestation}`,
        ]
          .filter(Boolean)
          .slice(0, 2) // Take top 2 to avoid overcrowding
          .join('\n\n');

        if (practices) {
          slides.push(
            makeSlide(
              slides.length,
              0,
              snippet.title,
              practices,
              category,
              'body',
              'How to Use',
            ),
          );
        }
      }

      // Slide 5: Cleansing & Charging
      if (
        fc.careInstructions?.cleansing?.length ||
        fc.careInstructions?.charging?.length
      ) {
        const careText = [
          fc.careInstructions.cleansing?.length &&
            `Cleanse: ${fc.careInstructions.cleansing.slice(0, 2).join(', ')}`,
          fc.careInstructions.charging?.length &&
            `Charge: ${fc.careInstructions.charging.slice(0, 2).join(', ')}`,
        ]
          .filter(Boolean)
          .join('\n\n');

        if (careText) {
          slides.push(
            makeSlide(
              slides.length,
              0,
              snippet.title,
              careText,
              category,
              'body',
              'Crystal Care',
            ),
          );
        }
      }

      // Slide 6: Crystal Combinations (if available)
      if (
        fc.combinations?.enhances?.length ||
        fc.combinations?.complements?.length
      ) {
        const combos = [
          fc.combinations.enhances?.length &&
            `Pairs well with: ${fc.combinations.enhances.slice(0, 3).join(', ')}`,
          fc.combinations.complements?.length &&
            `Complements: ${fc.combinations.complements.slice(0, 2).join(', ')}`,
        ]
          .filter(Boolean)
          .join('\n\n');

        if (combos) {
          slides.push(
            makeSlide(
              slides.length,
              0,
              snippet.title,
              combos,
              category,
              'body',
              'Crystal Pairings',
            ),
          );
        }
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
    spells: 'Cast your first spell today',
    crystals: 'Explore the crystal grimoire',
    tarot: 'Pull your daily tarot card',
    runes: 'Read the Elder Futhark runes',
    zodiac: 'Get your free birth chart reading',
    numerology: 'Calculate your life path number',
    chakras: 'Heal and balance your chakras',
    sabbat: 'Celebrate the Wheel of the Year',
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

// Astronomicon characters used as ghost backdrops per category
// Q=Sun, R=Moon, T=Venus, U=Mars, V=Jupiter, W=Saturn, Y=Neptune, Z=Pluto
const CATEGORY_SYMBOL: Partial<Record<ThemeCategory, string>> = {
  tarot: 'R', // Moon — mystery, intuition
  crystals: 'T', // Venus — beauty, earth energy
  numerology: 'V', // Jupiter — expansion, spiritual growth
  runes: 'W', // Saturn — ancient wisdom, discipline
  spells: 'R', // Moon — magic, cycles
  chakras: 'Q', // Sun — energy, radiance
  sabbat: 'R', // Moon — seasonal cycles
  lunar: 'R', // Moon
  planetary: 'Q', // Sun
  zodiac: 'Q', // Sun (zodiac carousels use sign glyph via symbol param)
};

function makeSlide(
  slideIndex: number,
  totalSlides: number,
  title: string,
  content: string,
  category: ThemeCategory,
  variant: IGCarouselSlide['variant'],
  subtitle?: string,
  symbol?: string,
): IGCarouselSlide {
  // For body slides, fall back to category symbol if none provided
  const resolvedSymbol =
    symbol ?? (variant === 'body' ? CATEGORY_SYMBOL[category] : undefined);
  return {
    slideIndex,
    totalSlides,
    title,
    content,
    subtitle,
    category,
    variant,
    symbol: resolvedSymbol,
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
  const cacheBust = Date.now().toString(); // Timestamp for cache busting
  return carousel.slides.map((slide) => {
    const params = new URLSearchParams({
      title: slide.title,
      slideIndex: String(slide.slideIndex),
      totalSlides: String(slide.totalSlides),
      content: slide.content,
      category: slide.category,
      variant: slide.variant,
      v: '4', // Version for design changes
      t: cacheBust, // Timestamp to force fresh generation
    });
    if (slide.subtitle) params.set('subtitle', slide.subtitle);
    if (slide.symbol) params.set('symbol', slide.symbol);
    return `${base}/api/og/instagram/carousel?${params.toString()}`;
  });
}
