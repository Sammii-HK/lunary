import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import {
  storeEmbedding,
  getEmbeddingCount,
  type GrimoireEntry,
} from '../src/lib/embeddings';
import { zodiacSigns } from '../utils/zodiac/zodiac';
import { allTarotCards } from '../utils/tarot/cards';
import { allCrystals } from '../src/constants/grimoire/crystals';
import { PLANET_SIGN_CONTENT } from '../src/constants/seo/planet-sign-content';
import { COMPATIBILITY_CONTENT } from '../src/constants/seo/compatibility-content';
import { CHINESE_ZODIAC_DATA } from '../src/constants/seo/chinese-zodiac';
import { ZODIAC_CUSPS } from '../src/constants/seo/cusps';
import { HOUSE_DATA } from '../src/constants/seo/houses';
import { ASPECT_DATA } from '../src/constants/seo/aspects';
import { DECAN_DATA } from '../src/constants/seo/decans';
import { ASTROLOGY_GLOSSARY } from '../src/constants/grimoire/glossary';
import { retrogradeInfo } from '../utils/retrogrades/retrogradeInfo';
import { planets as planetData } from '../utils/planets/planets';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function generateAllEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');

  const entries: GrimoireEntry[] = [];

  // Zodiac signs
  console.log('📌 Collecting zodiac signs...');
  Object.entries(zodiacSigns).forEach(([key, sign]) => {
    entries.push({
      id: `zodiac-${key}`,
      slug: `zodiac/${key}`,
      title: sign.name,
      category: 'zodiac',
      content: `${sign.name} is a ${sign.element} sign ruled by ${sign.rulingPlanet}. Element: ${sign.element}. Modality: ${sign.modality}. Symbol: ${sign.symbol}. ${sign.description || ''}`,
      metadata: {
        element: sign.element,
        modality: sign.modality,
        ruler: sign.rulingPlanet,
      },
    });
  });

  // Planets
  console.log('📌 Collecting planets...');
  Object.entries(planetData).forEach(([key, planet]) => {
    entries.push({
      id: `planet-${key}`,
      slug: `astronomy/planets/${key}`,
      title: planet.name,
      category: 'planet',
      content: `${planet.name} in astrology represents ${planet.meaning || 'various aspects of life'}. Symbol: ${planet.symbol}.`,
      metadata: { symbol: planet.symbol },
    });
  });

  // Tarot cards
  console.log('📌 Collecting tarot cards...');
  allTarotCards.forEach((card) => {
    entries.push({
      id: `tarot-${card.slug}`,
      slug: `tarot/${card.slug}`,
      title: card.name,
      category: 'tarot',
      content: `${card.name}. Keywords: ${card.keywords?.join(', ') || 'wisdom, insight'}. ${card.meaning || ''}`,
      metadata: { arcana: card.arcana, number: card.number },
    });
  });

  // Crystals
  console.log('📌 Collecting crystals...');
  allCrystals.forEach((crystal) => {
    entries.push({
      id: `crystal-${crystal.id}`,
      slug: `crystals/${crystal.id}`,
      title: crystal.name,
      category: 'crystal',
      content: `${crystal.name} is a crystal with properties: ${crystal.properties?.join(', ') || 'healing, energy'}. Color: ${crystal.color || 'various'}. Chakra: ${crystal.chakra || 'multiple'}.`,
      metadata: { color: crystal.color, chakra: crystal.chakra },
    });
  });

  // Planet placements
  console.log('📌 Collecting planet placements...');
  Object.entries(PLANET_SIGN_CONTENT).forEach(([key, content]) => {
    entries.push({
      id: `placement-${key}`,
      slug: `placements/${key}`,
      title: content.title,
      category: 'placement',
      content: `${content.title}. ${content.description}`,
      metadata: { planet: content.planet, sign: content.sign },
    });
  });

  // Compatibility
  console.log('📌 Collecting compatibility matches...');
  Object.entries(COMPATIBILITY_CONTENT).forEach(([key, content]) => {
    entries.push({
      id: `compatibility-${key}`,
      slug: `compatibility/${key}`,
      title: content.title,
      category: 'compatibility',
      content: `${content.title}. ${content.description}. Overall: ${content.overallCompatibility || 'moderate'}`,
      metadata: { sign1: content.sign1, sign2: content.sign2 },
    });
  });

  // Chinese zodiac
  console.log('📌 Collecting Chinese zodiac...');
  Object.entries(CHINESE_ZODIAC_DATA).forEach(([key, animal]) => {
    entries.push({
      id: `chinese-${key}`,
      slug: `chinese-zodiac/${key}`,
      title: animal.name,
      category: 'chinese-zodiac',
      content: `${animal.name} (${animal.chineseCharacter}) is a Chinese zodiac animal. Element: ${animal.element}. Yin/Yang: ${animal.yinYang}. Traits: ${animal.traits?.join(', ') || 'various'}. Years: ${animal.years?.slice(0, 5).join(', ')}.`,
      metadata: { element: animal.element, yinYang: animal.yinYang },
    });
  });

  // Zodiac cusps
  console.log('📌 Collecting zodiac cusps...');
  Object.entries(ZODIAC_CUSPS).forEach(([key, cusp]) => {
    entries.push({
      id: `cusp-${key}`,
      slug: `cusps/${key}`,
      title: cusp.name,
      category: 'cusp',
      content: `${cusp.name} cusp (${cusp.dateRange}). Signs: ${cusp.signs.join(' and ')}. Traits: ${cusp.traits?.join(', ') || 'blend of both signs'}.`,
      metadata: { signs: cusp.signs, dateRange: cusp.dateRange },
    });
  });

  // Houses
  console.log('📌 Collecting house meanings...');
  Object.entries(HOUSE_DATA).forEach(([key, house]) => {
    entries.push({
      id: `house-${key}`,
      slug: `houses/${key}`,
      title: house.name,
      category: 'house',
      content: `${house.name}. Themes: ${house.themes?.join(', ') || 'life area'}. ${house.description || ''}`,
      metadata: { number: house.number },
    });
  });

  // Aspects
  console.log('📌 Collecting aspect meanings...');
  Object.entries(ASPECT_DATA).forEach(([key, aspect]) => {
    entries.push({
      id: `aspect-${key}`,
      slug: `aspects/${key}`,
      title: aspect.name,
      category: 'aspect',
      content: `${aspect.name} aspect (${aspect.degrees}°). ${aspect.description || 'Planetary relationship'}. Energy: ${aspect.energy || 'varies'}.`,
      metadata: { degrees: aspect.degrees, energy: aspect.energy },
    });
  });

  // Decans
  console.log('📌 Collecting decan meanings...');
  Object.entries(DECAN_DATA).forEach(([sign, decans]) => {
    decans.forEach((decan, index) => {
      const key = `${sign}-decan-${index + 1}`;
      entries.push({
        id: `decan-${key}`,
        slug: `decans/${sign}/${index + 1}`,
        title: `${sign} Decan ${index + 1}`,
        category: 'decan',
        content: `${sign} Decan ${index + 1}. Ruler: ${decan.ruler || 'varies'}. Dates: ${decan.dates || 'varies'}. Traits: ${decan.traits?.join(', ') || 'unique blend'}.`,
        metadata: { sign, decanNumber: index + 1, ruler: decan.ruler },
      });
    });
  });

  // Glossary terms
  console.log('📌 Collecting glossary terms...');
  ASTROLOGY_GLOSSARY.forEach((term) => {
    entries.push({
      id: `glossary-${term.slug}`,
      slug: `glossary/${term.slug}`,
      title: term.term,
      category: 'glossary',
      content: `${term.term}: ${term.definition}`,
      metadata: { category: term.category },
    });
  });

  // Retrogrades
  console.log('📌 Collecting retrograde info...');
  Object.entries(retrogradeInfo).forEach(([planet, info]) => {
    entries.push({
      id: `retrograde-${planet}`,
      slug: `retrogrades/${planet}`,
      title: `${info.name} Retrograde`,
      category: 'retrograde',
      content: `${info.name} Retrograde. Frequency: ${info.frequency}. Duration: ${info.duration}. ${info.description}. Effects: ${info.effects?.join(', ') || 'various'}. What to do: ${info.whatToDo?.join(', ') || 'reflect and review'}.`,
      metadata: { frequency: info.frequency, duration: info.duration },
    });
  });

  console.log(`\n📊 Total entries to process: ${entries.length}`);

  // Process in batches to avoid rate limits
  const BATCH_SIZE = 10;
  const DELAY_MS = 1000;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    console.log(
      `\n⏳ Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(entries.length / BATCH_SIZE)}...`,
    );

    for (const entry of batch) {
      try {
        await storeEmbedding(entry);
        console.log(`  ✅ ${entry.category}: ${entry.title}`);
      } catch (error) {
        console.error(`  ❌ Failed: ${entry.title}`, error);
      }
    }

    if (i + BATCH_SIZE < entries.length) {
      console.log(`  💤 Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
    }
  }

  const finalCount = await getEmbeddingCount();
  console.log(`\n🎉 Embedding generation complete!`);
  console.log(`📊 Total embeddings in database: ${finalCount}`);
}

generateAllEmbeddings()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Failed:', error);
    process.exit(1);
  });
