import { MetadataRoute } from 'next';
import { grimoire } from '@/constants/grimoire';
import { zodiacSigns, planetaryBodies } from '../../utils/zodiac/zodiac';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import { tarotCards } from '../../utils/tarot/tarot-cards';
import {
  astrologicalHouses,
  astrologicalAspects,
  retrogradeInfo,
  eclipseInfo,
} from '@/constants/grimoire/seo-data';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import { runesList } from '@/constants/runes';
import { chakras } from '@/constants/chakras';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import { stringToKebabCase } from '../../utils/string';
import dayjs from 'dayjs';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use canonical domain (non-www)
  const baseUrl = 'https://lunary.app';
  const now = new Date();

  // Static routes - ordered by priority
  const routes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/welcome`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comparison/best-personalized-astrology-apps`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grimoire`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comparison`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/horoscope`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tarot`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/birth-chart`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/book-of-shadows`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Generate all blog week posts (from start of 2025 to current week)
  const blogRoutes: MetadataRoute.Sitemap = [];
  const startOf2025 = dayjs('2025-01-06'); // First Monday of 2025
  const today = dayjs();
  const currentWeekStart = today.startOf('week').add(1, 'day'); // Get Monday of current week

  let weekDate = startOf2025;
  let weekNumber = 1;
  const year = 2025;

  while (
    weekDate.isBefore(currentWeekStart) ||
    weekDate.isSame(currentWeekStart, 'day')
  ) {
    const weekSlug = `week-${weekNumber}-${year}`;
    blogRoutes.push({
      url: `${baseUrl}/blog/week/${weekSlug}`,
      lastModified: weekDate.toDate(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });

    weekDate = weekDate.add(7, 'day');
    weekNumber++;
  }

  // Add all grimoire sections
  const grimoireItems = Object.keys(grimoire);
  const grimoireRoutes = grimoireItems.map((item) => ({
    url: `${baseUrl}/grimoire/${item
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, '')}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add all zodiac sign pages
  const zodiacRoutes = Object.keys(zodiacSigns).map((sign) => ({
    url: `${baseUrl}/grimoire/zodiac/${stringToKebabCase(sign)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all planet pages
  const planetRoutes = Object.keys(planetaryBodies).map((planet) => ({
    url: `${baseUrl}/grimoire/planets/${stringToKebabCase(planet)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all house pages
  const houseRoutes = Object.keys(astrologicalHouses).map((house) => ({
    url: `${baseUrl}/grimoire/houses/${stringToKebabCase(house)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all moon phase pages
  const moonPhaseRoutes = Object.keys(monthlyMoonPhases).map((phase) => ({
    url: `${baseUrl}/grimoire/moon-phases/${stringToKebabCase(phase)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all moon in sign pages
  const moonInSignRoutes = Object.keys(zodiacSigns).map((sign) => ({
    url: `${baseUrl}/grimoire/moon-in/${stringToKebabCase(sign)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all tarot card pages
  const tarotRoutes: MetadataRoute.Sitemap = [];

  // Major Arcana
  Object.values(tarotCards.majorArcana).forEach((card) => {
    tarotRoutes.push({
      url: `${baseUrl}/grimoire/tarot/${stringToKebabCase(card.name)}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    });
  });

  // Minor Arcana
  Object.values(tarotCards.minorArcana).forEach((suit) => {
    Object.values(suit).forEach((card) => {
      tarotRoutes.push({
        url: `${baseUrl}/grimoire/tarot/${stringToKebabCase(card.name)}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      });
    });
  });

  // Add all angel number pages
  const angelNumberRoutes = Object.keys(angelNumbers).map((number) => ({
    url: `${baseUrl}/grimoire/angel-numbers/${number}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all life path number pages
  const lifePathRoutes = Object.keys(lifePathNumbers).map((number) => ({
    url: `${baseUrl}/grimoire/life-path/${number}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all rune pages
  const runeRoutes = Object.keys(runesList).map((rune) => ({
    url: `${baseUrl}/grimoire/runes/${stringToKebabCase(rune)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all chakra pages
  const chakraRoutes = Object.keys(chakras).map((chakra) => ({
    url: `${baseUrl}/grimoire/chakras/${stringToKebabCase(chakra)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all aspect pages
  const aspectRoutes = Object.keys(astrologicalAspects).map((aspect) => ({
    url: `${baseUrl}/grimoire/aspects/${stringToKebabCase(aspect)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all retrograde pages
  const retrogradeRoutes = Object.keys(retrogradeInfo).map((planet) => ({
    url: `${baseUrl}/grimoire/retrogrades/${planet}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all eclipse pages
  const eclipseRoutes = Object.keys(eclipseInfo).map((type) => ({
    url: `${baseUrl}/grimoire/eclipses/${type}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all full moon name pages
  const fullMoonRoutes = Object.keys(annualFullMoons).map((month) => ({
    url: `${baseUrl}/grimoire/full-moons/${stringToKebabCase(month)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add lunar node pages
  const lunarNodeRoutes = [
    {
      url: `${baseUrl}/grimoire/lunar-nodes/north-node`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grimoire/lunar-nodes/south-node`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Add all crystal pages
  const crystalRoutes = crystalDatabase.map((crystal) => ({
    url: `${baseUrl}/grimoire/crystals/${stringToKebabCase(crystal.name)}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...routes,
    ...blogRoutes,
    ...grimoireRoutes,
    ...zodiacRoutes,
    ...planetRoutes,
    ...houseRoutes,
    ...moonPhaseRoutes,
    ...moonInSignRoutes,
    ...tarotRoutes,
    ...angelNumberRoutes,
    ...lifePathRoutes,
    ...runeRoutes,
    ...chakraRoutes,
    ...aspectRoutes,
    ...retrogradeRoutes,
    ...eclipseRoutes,
    ...fullMoonRoutes,
    ...lunarNodeRoutes,
    ...crystalRoutes,
  ];
}
