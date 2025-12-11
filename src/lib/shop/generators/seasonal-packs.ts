import { wheelOfTheYearSabbats, Sabbat } from '@/constants/sabbats';
import { ShopProduct, SHOP_GRADIENTS, PRICE_TIERS } from '../types';

function getSabbatGradient(sabbatName: string): string {
  // Each sabbat gets a unique, thematically appropriate soft gradient
  const gradientMap: Record<string, string> = {
    Samhain: SHOP_GRADIENTS.nebulaToSupernova, // Ancestral, deep
    Yule: SHOP_GRADIENTS.cometToHaze, // Deep winter, cool tones
    Imbolc: SHOP_GRADIENTS.lightHazeToRose, // Gentle awakening, soft pink
    Ostara: SHOP_GRADIENTS.cometHazeRose, // Spring blooming, balanced
    Beltane: SHOP_GRADIENTS.roseToSupernova, // Passionate fire and flower
    Litha: SHOP_GRADIENTS.supernovaFade, // Solar peak, brightness
    Lammas: SHOP_GRADIENTS.lightRoseToSupernova, // First harvest, warm tones
    Mabon: SHOP_GRADIENTS.hazeNebulaCometBlend, // Balance point, autumn
  };
  return gradientMap[sabbatName] || SHOP_GRADIENTS.cometSupernovaRose;
}

function generateSabbatDescription(sabbat: Sabbat): string {
  const descriptionTemplates: Record<string, string> = {
    Samhain: `As the veil thins and shadows deepen, ${sabbat.name} calls you inward. This pack guides you through ancestor honouring, divination practices, and releasing rituals for the witch's new year. Walk between worlds with intention.`,
    Yule: `On the longest night, we kindle hope. This ${sabbat.name} pack celebrates the return of the light with rituals for reflection, intention-setting, and honouring the darkness that precedes all dawns. Welcome the reborn sun.`,
    Imbolc: `Spring stirs beneath the snow. ${sabbat.name} awakens Brigid's flame within you through purification rituals, creative inspiration practices, and spells for new beginnings. The light grows stronger.`,
    Ostara: `Balance returns as day equals night. This ${sabbat.name} pack celebrates fertility, growth, and renewal with rituals for planting seeds—both literal and metaphorical. Spring has arrived.`,
    Beltane: `Fire and flower, passion and pleasure. ${sabbat.name} invites you to celebrate the sacred union of all things through rituals of fertility, creativity, and joyful magic. Dance around the maypole of life.`,
    Litha: `The sun reaches its zenith. This ${sabbat.name} pack harnesses the peak of solar power for manifestation, abundance rituals, and celebrating the fullness of summer. Shine at your brightest.`,
    Lammas: `First harvest, first gratitude. ${sabbat.name} brings rituals for thanksgiving, bread magic, and honouring what you have cultivated. Celebrate your abundance before autumn comes.`,
    Mabon: `Second harvest, sacred balance. ${sabbat.name} returns you to equilibrium with rituals for gratitude, completion, and preparing for the darker half of the year. Give thanks and let go.`,
  };

  return (
    descriptionTemplates[sabbat.name] ||
    `Celebrate ${sabbat.name} with rituals, correspondences, and practices aligned with this sacred point on the Wheel of the Year.`
  );
}

function generateSabbatTagline(sabbat: Sabbat): string {
  const taglines: Record<string, string> = {
    Samhain: 'Honour the ancestors, embrace the dark.',
    Yule: 'Welcome the returning light.',
    Imbolc: 'Kindle the first flames of spring.',
    Ostara: 'Plant seeds as day and night balance.',
    Beltane: 'Dance with fire and flower.',
    Litha: "Bask in the sun's peak power.",
    Lammas: 'Gather the first harvest gifts.',
    Mabon: 'Give thanks as darkness grows.',
  };
  return (
    taglines[sabbat.name] || `Celebrate ${sabbat.name} with sacred ritual.`
  );
}

function generateSabbatWhatInside(sabbat: Sabbat): string[] {
  return [
    `${sabbat.name} history and spiritual significance`,
    `${sabbat.rituals.length} traditional rituals adapted for modern practice`,
    `Altar setup guide with ${sabbat.symbols.join(', ')}`,
    `Deity connections: ${sabbat.deities.slice(0, 3).join(', ')}`,
    `Crystal and herb correspondences`,
    `Recipes and feast ideas for ${sabbat.foods.slice(0, 3).join(', ')}`,
    `Meditation and reflection prompts`,
  ];
}

function generateSabbatPerfectFor(sabbat: Sabbat): string[] {
  return [
    `Celebrating ${sabbat.name} alone or with your circle`,
    `Deepening your connection to the Wheel of the Year`,
    `${sabbat.keywords.slice(0, 2).join(' and ')} work`,
  ];
}

function generateSabbatPacks(): ShopProduct[] {
  return wheelOfTheYearSabbats.map((sabbat) => ({
    id: `${sabbat.name.toLowerCase()}-pack`,
    slug: `${sabbat.name.toLowerCase()}-seasonal-pack`,
    title: `${sabbat.name} Pack`,
    tagline: generateSabbatTagline(sabbat),
    description: generateSabbatDescription(sabbat),
    category: 'seasonal' as const,
    whatInside: generateSabbatWhatInside(sabbat),
    perfectFor: generateSabbatPerfectFor(sabbat),
    related: wheelOfTheYearSabbats
      .filter((s) => s.name !== sabbat.name)
      .slice(0, 3)
      .map((s) => `${s.name.toLowerCase()}-seasonal-pack`),
    price: PRICE_TIERS.seasonal,
    gradient: getSabbatGradient(sabbat.name),
  }));
}

function generateLunarNewYearPack(): ShopProduct {
  return {
    id: 'lunar-new-year-abundance',
    slug: 'lunar-new-year-abundance-pack',
    title: 'Lunar New Year Abundance Pack',
    tagline: 'Welcome prosperity with the new moon.',
    description:
      'The Lunar New Year marks a powerful portal for manifestation and fresh starts. This pack combines Eastern wisdom with Western magical practice, offering abundance rituals, prosperity spells, and intention-setting ceremonies timed to the new year moon.',
    category: 'seasonal' as const,
    whatInside: [
      'Lunar New Year history and spiritual significance',
      'Abundance altar setup guide',
      'Prosperity spell for the new moon',
      'Wealth corner blessing ritual',
      'Intention-setting ceremony',
      'Year ahead divination spread',
      'Lucky colour and food correspondences',
    ],
    perfectFor: [
      'Setting powerful yearly intentions',
      'Abundance and prosperity magic',
      'Honouring lunar cycles in your practice',
    ],
    related: [
      'yule-seasonal-pack',
      'imbolc-seasonal-pack',
      'new-moon-manifestation-pack',
    ],
    price: PRICE_TIERS.seasonal,
    gradient: SHOP_GRADIENTS.roseFade, // Rich, abundant energy for prosperity
  };
}

export function generateSeasonalPacks(): ShopProduct[] {
  const sabbatPacks = generateSabbatPacks();
  const lunarNewYear = generateLunarNewYearPack();
  return [...sabbatPacks, lunarNewYear];
}

export function getSeasonalPackBySlug(slug: string): ShopProduct | undefined {
  return generateSeasonalPacks().find((pack) => pack.slug === slug);
}

export function getCurrentSeasonalPack(): ShopProduct | undefined {
  const now = new Date();
  const month = now.getMonth();
  const day = now.getDate();

  const sabbatDates: Record<string, { month: number; day: number }> = {
    Yule: { month: 11, day: 21 },
    Imbolc: { month: 1, day: 1 },
    Ostara: { month: 2, day: 21 },
    Beltane: { month: 4, day: 1 },
    Litha: { month: 5, day: 21 },
    Lammas: { month: 7, day: 1 },
    Mabon: { month: 8, day: 21 },
    Samhain: { month: 9, day: 31 },
  };

  const upcomingSabbat = Object.entries(sabbatDates).find(([_, date]) => {
    const sabbatDate = new Date(now.getFullYear(), date.month, date.day);
    const diffDays = Math.ceil(
      (sabbatDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diffDays >= 0 && diffDays <= 30;
  });

  if (upcomingSabbat) {
    return getSeasonalPackBySlug(
      `${upcomingSabbat[0].toLowerCase()}-seasonal-pack`,
    );
  }

  return undefined;
}
