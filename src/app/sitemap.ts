import { MetadataRoute } from 'next';
import { grimoire } from '@/constants/grimoire';
import { spells } from '@/constants/spells';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import { runesList } from '@/constants/runes';
import { chakras } from '@/constants/chakras';
import { tarotCards } from '../../utils/tarot/tarot-cards';
import { tarotSpreads } from '@/constants/tarot';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { zodiacSigns, planetaryBodies } from '../../utils/zodiac/zodiac';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import dayjs from 'dayjs';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lunary.app';
  const now = new Date();

  // Static routes
  const routes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 1,
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
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grimoire`,
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
    {
      url: `${baseUrl}/comparison`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comparison/best-personalized-astrology-apps`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/press-kit`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/building-lunary`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/moon-circles`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/launch`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/product-hunt`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/cosmic-report-generator`,
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

  // Add all spell pages
  const spellRoutes = spells.map((spell) => ({
    url: `${baseUrl}/grimoire/spells/${spell.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all crystal pages
  const crystalRoutes = crystalDatabase.map((crystal) => ({
    url: `${baseUrl}/grimoire/crystals/${crystal.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all rune pages
  const runeRoutes = Object.keys(runesList).map((runeId) => ({
    url: `${baseUrl}/grimoire/runes/${runeId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all chakra pages
  const chakraRoutes = Object.keys(chakras).map((chakraId) => ({
    url: `${baseUrl}/grimoire/chakras/${chakraId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all tarot card pages (major arcana)
  const majorArcanaRoutes = Object.keys(tarotCards.majorArcana).map(
    (cardId) => ({
      url: `${baseUrl}/grimoire/tarot/${cardId}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all tarot card pages (minor arcana)
  const minorArcanaRoutes = Object.entries(tarotCards.minorArcana).flatMap(
    ([suitKey, suitCards]) =>
      Object.keys(suitCards as Record<string, unknown>).map((cardId) => ({
        url: `${baseUrl}/grimoire/tarot/${suitKey}/${cardId}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  );

  // Add all moon phase pages
  const moonPhaseRoutes = Object.keys(monthlyMoonPhases).map((phaseId) => ({
    url: `${baseUrl}/grimoire/moon/phases/${phaseId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all full moon pages
  const fullMoonRoutes = Object.keys(annualFullMoons).map((month) => ({
    url: `${baseUrl}/grimoire/moon/full-moons/${month.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all zodiac sign pages
  const zodiacRoutes = Object.keys(zodiacSigns).map((signId) => ({
    url: `${baseUrl}/grimoire/astronomy/zodiac/${signId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all planet pages
  const planetRoutes = Object.keys(planetaryBodies).map((planetId) => ({
    url: `${baseUrl}/grimoire/astronomy/planets/${planetId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all sabbat pages
  const sabbatRoutes = wheelOfTheYearSabbats.map((sabbat) => ({
    url: `${baseUrl}/grimoire/wheel-of-the-year/${sabbat.name.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all tarot spread pages
  const tarotSpreadRoutes = Object.keys(tarotSpreads).map((spreadId) => ({
    url: `${baseUrl}/grimoire/tarot/spreads/${spreadId}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add scrying method pages
  const scryingRoutes = [
    'crystal-ball',
    'black-mirror',
    'water-scrying',
    'fire-scrying',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/divination/scrying/${method}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence element pages
  const elementRoutes = Object.keys(correspondencesData.elements).map(
    (element) => ({
      url: `${baseUrl}/grimoire/correspondences/elements/${element.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all correspondence color pages
  const colorRoutes = Object.keys(correspondencesData.colors).map((color) => ({
    url: `${baseUrl}/grimoire/correspondences/colors/${color.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence day pages
  const dayRoutes = Object.keys(correspondencesData.days).map((day) => ({
    url: `${baseUrl}/grimoire/correspondences/days/${day.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence deity pages
  const deityRoutes = Object.entries(correspondencesData.deities).flatMap(
    ([pantheon, gods]) =>
      Object.keys(gods).map((deityName) => ({
        url: `${baseUrl}/grimoire/correspondences/deities/${pantheon.toLowerCase()}/${deityName.toLowerCase()}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  );

  // Add all correspondence flower pages
  const flowerRoutes = Object.keys(correspondencesData.flowers).map(
    (flower) => ({
      url: `${baseUrl}/grimoire/correspondences/flowers/${flower.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all correspondence number pages
  const numberRoutes = Object.keys(correspondencesData.numbers).map((num) => ({
    url: `${baseUrl}/grimoire/correspondences/numbers/${num}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence wood pages
  const woodRoutes = Object.keys(correspondencesData.wood).map((wood) => ({
    url: `${baseUrl}/grimoire/correspondences/wood/${wood.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence herb pages
  const herbRoutes = Object.keys(correspondencesData.herbs).map((herb) => ({
    url: `${baseUrl}/grimoire/correspondences/herbs/${herb.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence animal pages
  const animalRoutes = Object.keys(correspondencesData.animals).map(
    (animal) => ({
      url: `${baseUrl}/grimoire/correspondences/animals/${animal.toLowerCase()}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add numerology core number pages (1-9)
  const numerologyCoreRoutes = Array.from({ length: 9 }, (_, i) => i + 1).map(
    (num) => ({
      url: `${baseUrl}/grimoire/numerology/core-numbers/${num}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add numerology master number pages (11, 22, 33)
  const numerologyMasterRoutes = [11, 22, 33].map((num) => ({
    url: `${baseUrl}/grimoire/numerology/master-numbers/${num}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add numerology planetary day pages
  const numerologyDayRoutes = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ].map((day) => ({
    url: `${baseUrl}/grimoire/numerology/planetary-days/${day}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add candle magic color pages
  const candleColorRoutes = [
    'red',
    'pink',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'indigo',
    'white',
    'black',
    'brown',
    'silver',
  ].map((color) => ({
    url: `${baseUrl}/grimoire/candle-magic/colors/${color}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add birth chart house pages (1st-12th)
  const birthChartHouseRoutes = Array.from({ length: 12 }, (_, i) => i + 1).map(
    (houseNum) => ({
      url: `${baseUrl}/grimoire/birth-chart/houses/${houseNum}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add modern witchcraft witch type pages
  const witchTypeRoutes = [
    'green-witch',
    'kitchen-witch',
    'hedge-witch',
    'sea-witch',
    'cosmic-witch',
    'eclectic-witch',
  ].map((type) => ({
    url: `${baseUrl}/grimoire/modern-witchcraft/witch-types/${type}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add modern witchcraft tool pages
  const witchToolRoutes = [
    'athame',
    'wand',
    'cauldron',
    'chalice',
    'pentacle',
  ].map((tool) => ({
    url: `${baseUrl}/grimoire/modern-witchcraft/tools/${tool}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation technique pages
  const meditationTechniqueRoutes = [
    'guided-meditation',
    'mindfulness-meditation',
    'visualization-meditation',
    'walking-meditation',
    'mantra-meditation',
  ].map((technique) => ({
    url: `${baseUrl}/grimoire/meditation/techniques/${technique}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation breathwork pages
  const breathworkRoutes = [
    'deep-belly-breathing',
    'box-breathing',
    'pranayama',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/meditation/breathwork/${method}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation grounding pages
  const groundingRoutes = [
    'tree-root-visualization',
    'physical-grounding',
    'crystal-grounding',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/meditation/grounding/${method}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add divination pendulum page
  const pendulumRoute = {
    url: `${baseUrl}/grimoire/divination/pendulum`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  // Add divination dream interpretation page
  const dreamInterpretationRoute = {
    url: `${baseUrl}/grimoire/divination/dream-interpretation`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  // Add divination omen reading page
  const omenReadingRoute = {
    url: `${baseUrl}/grimoire/divination/omen-reading`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  return [
    ...routes,
    ...blogRoutes,
    ...grimoireRoutes,
    ...spellRoutes,
    ...crystalRoutes,
    ...runeRoutes,
    ...chakraRoutes,
    ...majorArcanaRoutes,
    ...minorArcanaRoutes,
    ...moonPhaseRoutes,
    ...fullMoonRoutes,
    ...zodiacRoutes,
    ...planetRoutes,
    ...sabbatRoutes,
    ...tarotSpreadRoutes,
    ...scryingRoutes,
    ...elementRoutes,
    ...colorRoutes,
    ...dayRoutes,
    ...deityRoutes,
    ...flowerRoutes,
    ...numberRoutes,
    ...woodRoutes,
    ...herbRoutes,
    ...animalRoutes,
    ...numerologyCoreRoutes,
    ...numerologyMasterRoutes,
    ...numerologyDayRoutes,
    ...candleColorRoutes,
    ...birthChartHouseRoutes,
    ...witchTypeRoutes,
    ...witchToolRoutes,
    ...meditationTechniqueRoutes,
    ...breathworkRoutes,
    ...groundingRoutes,
    pendulumRoute,
    dreamInterpretationRoute,
    omenReadingRoute,
  ];
}
