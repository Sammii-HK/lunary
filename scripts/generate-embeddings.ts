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
import { tarotCards } from '../utils/tarot/tarot-cards';
import { crystalDatabase } from '../src/constants/grimoire/crystals';
import { CHINESE_ZODIAC_DATA } from '../src/constants/seo/chinese-zodiac';
import { ZODIAC_CUSPS } from '../src/constants/seo/cusps';
import { HOUSE_DATA } from '../src/constants/seo/houses';
import { ASPECT_DATA } from '../src/constants/seo/aspects';
import { ASTROLOGY_GLOSSARY } from '../src/constants/grimoire/glossary';
import { retrogradeInfo } from '../src/constants/grimoire/seo-data';
import { planets as planetData } from '../utils/planets';
import {
  planetDescriptions,
  signDescriptions,
} from '../src/constants/seo/planet-sign-content';
import { getDecanData, ZODIAC_SIGNS } from '../src/constants/seo/decans';

// Helper to flatten nested tarot card structure
function flattenTarotCards() {
  const cards: {
    slug: string;
    name: string;
    keywords: string[];
    information: string;
  }[] = [];

  // Major Arcana
  Object.entries(tarotCards.majorArcana).forEach(([key, card]) => {
    cards.push({
      slug: key,
      name: card.name,
      keywords: card.keywords || [],
      information: card.information || '',
    });
  });

  // Minor Arcana suits
  const suits = ['wands', 'cups', 'swords', 'pentacles'] as const;
  suits.forEach((suit) => {
    const suitCards = tarotCards[suit];
    if (suitCards) {
      Object.entries(suitCards).forEach(([key, card]) => {
        cards.push({
          slug: `${suit}-${key}`,
          name: card.name,
          keywords: card.keywords || [],
          information: card.information || '',
        });
      });
    }
  });

  return cards;
}

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
      slug: `astronomy/planets/${key.toLowerCase()}`,
      title: key,
      category: 'planet',
      content: `${key} in astrology. ${planet.information || ''} Keywords: ${planet.keywords?.join(', ') || 'cosmic influence'}. Symbol: ${planet.symbol}.`,
      metadata: { symbol: planet.symbol, element: planet.element },
    });
  });

  // Tarot cards
  console.log('📌 Collecting tarot cards...');
  const allTarotCards = flattenTarotCards();
  allTarotCards.forEach((card) => {
    entries.push({
      id: `tarot-${card.slug}`,
      slug: `tarot/${card.slug}`,
      title: card.name,
      category: 'tarot',
      content: `${card.name}. Keywords: ${card.keywords?.join(', ') || 'wisdom, insight'}. ${card.information || ''}`,
      metadata: {},
    });
  });

  // Crystals
  console.log('📌 Collecting crystals...');
  crystalDatabase.forEach((crystal) => {
    entries.push({
      id: `crystal-${crystal.id}`,
      slug: `crystals/${crystal.id}`,
      title: crystal.name,
      category: 'crystal',
      content: `${crystal.name} is a crystal with properties: ${crystal.properties?.join(', ') || 'healing, energy'}. Colors: ${crystal.colors?.join(', ') || 'various'}. Chakras: ${crystal.chakras?.join(', ') || 'multiple'}. ${crystal.description || ''}`,
      metadata: { colors: crystal.colors, chakras: crystal.chakras },
    });
  });

  // Planet placements (generated from planetDescriptions × signDescriptions)
  console.log('📌 Collecting planet placements...');
  Object.entries(planetDescriptions).forEach(([planetKey, planet]) => {
    Object.entries(signDescriptions).forEach(([signKey, sign]) => {
      const key = `${planetKey}-in-${signKey}`;
      entries.push({
        id: `placement-${key}`,
        slug: `placements/${key}`,
        title: `${planet.name} in ${sign.name}`,
        category: 'placement',
        content: `${planet.name} in ${sign.name}. ${planet.name} governs ${planet.governs || 'various life areas'}. ${sign.name} is a ${sign.element} sign. When ${planet.name} is placed in ${sign.name}, it blends ${planet.name}'s energy with ${sign.name}'s qualities.`,
        metadata: { planet: planet.name, sign: sign.name },
      });
    });
  });

  // Compatibility (generated dynamically)
  console.log('📌 Collecting compatibility matches...');
  const signKeys = Object.keys(signDescriptions);
  signKeys.forEach((sign1Key) => {
    signKeys.forEach((sign2Key) => {
      const s1 = signDescriptions[sign1Key];
      const s2 = signDescriptions[sign2Key];
      const key = `${sign1Key}-${sign2Key}`;
      entries.push({
        id: `compatibility-${key}`,
        slug: `compatibility/${key}`,
        title: `${s1.name} and ${s2.name} Compatibility`,
        category: 'compatibility',
        content: `${s1.name} and ${s2.name} compatibility. ${s1.name} is a ${s1.element} ${s1.modality} sign ruled by ${s1.ruler}. ${s2.name} is a ${s2.element} ${s2.modality} sign ruled by ${s2.ruler}. This pairing combines ${s1.element} with ${s2.element} energy.`,
        metadata: { sign1: s1.name, sign2: s2.name },
      });
    });
  });

  // Chinese zodiac
  console.log('📌 Collecting Chinese zodiac...');
  Object.entries(CHINESE_ZODIAC_DATA).forEach(([key, animal]) => {
    entries.push({
      id: `chinese-${key}`,
      slug: `chinese-zodiac/${key}`,
      title: `Year of the ${animal.displayName}`,
      category: 'chinese-zodiac',
      content: `${animal.displayName} ${animal.emoji} is a Chinese zodiac animal. Element: ${animal.element}. Yin/Yang: ${animal.yinYang}. Traits: ${animal.traits?.join(', ') || 'various'}. Years: ${animal.years?.slice(0, 5).join(', ')}.`,
      metadata: { element: animal.element, yinYang: animal.yinYang },
    });
  });

  // Zodiac cusps
  console.log('📌 Collecting zodiac cusps...');
  ZODIAC_CUSPS.forEach((cusp) => {
    entries.push({
      id: `cusp-${cusp.id}`,
      slug: `cusps/${cusp.id}`,
      title: `${cusp.sign1}-${cusp.sign2} Cusp: ${cusp.name}`,
      category: 'cusp',
      content: `${cusp.name} (${cusp.dates}). Born on the cusp between ${cusp.sign1} and ${cusp.sign2}. This cusp blends the qualities of both signs.`,
      metadata: { sign1: cusp.sign1, sign2: cusp.sign2, dates: cusp.dates },
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
  ZODIAC_SIGNS.forEach((sign) => {
    [1, 2, 3].forEach((decanNum) => {
      const decan = getDecanData(sign, decanNum as 1 | 2 | 3);
      const key = `${sign}-decan-${decanNum}`;
      entries.push({
        id: `decan-${key}`,
        slug: `decans/${sign}/${decanNum}`,
        title: `${decan.signDisplay} ${decanNum === 1 ? 'First' : decanNum === 2 ? 'Second' : 'Third'} Decan`,
        category: 'decan',
        content: `${decan.signDisplay} Decan ${decanNum}. Sub-ruler: ${decan.ruler}. Dates: ${decan.dates}. This decan adds unique qualities to ${decan.signDisplay} natives.`,
        metadata: { sign, decanNumber: decanNum, ruler: decan.ruler },
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
