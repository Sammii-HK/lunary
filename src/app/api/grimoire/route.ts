import { NextRequest, NextResponse } from 'next/server';
import {
  crystalDatabase,
  getCrystalById,
  getCrystalsByCategory,
  getCrystalsByIntention,
  searchCrystals,
} from '../../../constants/grimoire/crystals';
import {
  spellDatabase,
  getSpellById,
  getSpellsByCategory,
  searchSpells,
} from '../../../constants/grimoire/spells';
import { runesList } from '../../../constants/runes';
import { wiccanWeek } from '../../../constants/weekDays';
import { wheelOfTheYearSabbats } from '../../../constants/sabbats';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=604800, stale-while-revalidate=86400',
};

function jsonWithCache(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: CACHE_HEADERS });
}

// Main Grimoire API - Single source of truth for all magical data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // crystals, spells, runes, etc.
    const action = searchParams.get('action'); // get, search, filter
    const id = searchParams.get('id');
    const category = searchParams.get('category');
    const query = searchParams.get('query');
    const intention = searchParams.get('intention');
    const moonPhase = searchParams.get('moonPhase');
    const zodiacSign = searchParams.get('zodiacSign');

    // If no type specified, return API overview
    if (!type) {
      return jsonWithCache({
        message:
          'Lunary Grimoire API - Your comprehensive magical knowledge base',
        version: '1.0.0',
        endpoints: {
          crystals: {
            description:
              'Complete crystal database with metaphysical properties',
            actions: ['get', 'search', 'filter'],
            filters: [
              'category',
              'intention',
              'moonPhase',
              'zodiacSign',
              'chakra',
              'element',
            ],
          },
          spells: {
            description: 'Comprehensive spell and ritual database',
            actions: ['get', 'search', 'filter'],
            filters: [
              'category',
              'difficulty',
              'moonPhase',
              'tradition',
              'type',
            ],
          },
          runes: {
            description: 'Elder Futhark rune meanings and properties',
            actions: ['get', 'search'],
          },
          correspondences: {
            description: 'Magical correspondences and associations',
            includes: ['planets', 'elements', 'colors', 'herbs', 'numbers'],
          },
          calendar: {
            description: 'Magical timing and astronomical data',
            includes: [
              'moonPhases',
              'sabbats',
              'planetaryDays',
              'planetaryHours',
            ],
          },
        },
        usage: {
          examples: [
            '/api/grimoire?type=crystals&action=search&query=protection',
            '/api/grimoire?type=crystals&action=filter&category=Love & Heart Healing',
            '/api/grimoire?type=spells&action=get&id=daily-protection-shield',
            '/api/grimoire?type=crystals&action=filter&intention=abundance&moonPhase=New Moon',
          ],
        },
      });
    }

    // Handle Crystals
    if (type === 'crystals') {
      if (action === 'get' && id) {
        const crystal = getCrystalById(id);
        if (!crystal) {
          return NextResponse.json(
            { error: 'Crystal not found' },
            { status: 404 },
          );
        }
        return jsonWithCache({ crystal });
      }

      if (action === 'search' && query) {
        const results = searchCrystals(query);
        return jsonWithCache({
          query,
          count: results.length,
          crystals: results,
        });
      }

      if (action === 'filter') {
        let results = crystalDatabase;

        if (category) {
          results = getCrystalsByCategory(category);
        }
        if (intention) {
          results = results.filter((crystal) =>
            crystal.intentions.some((intent) =>
              intent.toLowerCase().includes(intention.toLowerCase()),
            ),
          );
        }
        if (moonPhase) {
          results = results.filter(
            (crystal) =>
              crystal.moonPhases.includes(moonPhase) ||
              crystal.moonPhases.includes('All Moon Phases'),
          );
        }
        if (zodiacSign) {
          results = results.filter(
            (crystal) =>
              crystal.zodiacSigns.includes(zodiacSign) ||
              crystal.zodiacSigns.includes('All Signs'),
          );
        }

        return jsonWithCache({
          filters: { category, intention, moonPhase, zodiacSign },
          count: results.length,
          crystals: results,
        });
      }

      // Default: return all crystals
      return jsonWithCache({
        count: crystalDatabase.length,
        crystals: crystalDatabase,
      });
    }

    // Handle Spells
    if (type === 'spells') {
      if (action === 'get' && id) {
        const spell = getSpellById(id);
        if (!spell) {
          return NextResponse.json(
            { error: 'Spell not found' },
            { status: 404 },
          );
        }
        return jsonWithCache({ spell });
      }

      if (action === 'search' && query) {
        const results = searchSpells(query);
        return jsonWithCache({
          query,
          count: results.length,
          spells: results,
        });
      }

      if (action === 'filter') {
        let results = spellDatabase;

        if (category) {
          results = getSpellsByCategory(category);
        }

        return jsonWithCache({
          filters: { category },
          count: results.length,
          spells: results,
        });
      }

      // Default: return all spells
      return jsonWithCache({
        count: spellDatabase.length,
        spells: spellDatabase,
      });
    }

    // Handle Runes
    if (type === 'runes') {
      if (action === 'get' && id) {
        const rune = runesList[id as keyof typeof runesList];
        if (!rune) {
          return NextResponse.json(
            { error: 'Rune not found' },
            { status: 404 },
          );
        }
        return jsonWithCache({ rune });
      }

      if (action === 'search' && query) {
        const results = Object.entries(runesList).filter(
          ([key, rune]) =>
            rune.name.toLowerCase().includes(query.toLowerCase()) ||
            rune.meaning.toLowerCase().includes(query.toLowerCase()) ||
            rune.magicalProperties.toLowerCase().includes(query.toLowerCase()),
        );

        return jsonWithCache({
          query,
          count: results.length,
          runes: Object.fromEntries(results),
        });
      }

      // Default: return all runes
      return jsonWithCache({
        count: Object.keys(runesList).length,
        runes: runesList,
      });
    }

    // Handle Correspondences
    if (type === 'correspondences') {
      const correspondences = {
        planets: {
          Sun: {
            day: 'Sunday',
            colors: ['Gold', 'Yellow', 'Orange'],
            crystals: ['Citrine', 'Sunstone', 'Amber'],
          },
          Moon: {
            day: 'Monday',
            colors: ['Silver', 'White', 'Blue'],
            crystals: ['Moonstone', 'Selenite', 'Pearl'],
          },
          Mars: {
            day: 'Tuesday',
            colors: ['Red', 'Orange'],
            crystals: ['Carnelian', 'Red Jasper', 'Garnet'],
          },
          Mercury: {
            day: 'Wednesday',
            colors: ['Yellow', 'Orange'],
            crystals: ['Citrine', 'Agate', 'Clear Quartz'],
          },
          Jupiter: {
            day: 'Thursday',
            colors: ['Blue', 'Purple'],
            crystals: ['Lapis Lazuli', 'Sodalite', 'Amethyst'],
          },
          Venus: {
            day: 'Friday',
            colors: ['Green', 'Pink'],
            crystals: ['Rose Quartz', 'Emerald', 'Green Aventurine'],
          },
          Saturn: {
            day: 'Saturday',
            colors: ['Black', 'Dark Blue'],
            crystals: ['Black Tourmaline', 'Hematite', 'Obsidian'],
          },
        },
        elements: {
          Fire: {
            colors: ['Red', 'Orange', 'Gold'],
            crystals: ['Carnelian', 'Red Jasper', 'Citrine'],
            herbs: ['Cinnamon', 'Ginger', 'Basil'],
          },
          Water: {
            colors: ['Blue', 'Silver', 'Sea Green'],
            crystals: ['Moonstone', 'Aquamarine', 'Rose Quartz'],
            herbs: ['Jasmine', 'Rose', 'Chamomile'],
          },
          Air: {
            colors: ['Yellow', 'White', 'Pale Blue'],
            crystals: ['Clear Quartz', 'Fluorite', 'Lapis Lazuli'],
            herbs: ['Lavender', 'Mint', 'Frankincense'],
          },
          Earth: {
            colors: ['Green', 'Brown', 'Black'],
            crystals: ['Hematite', 'Green Aventurine', 'Black Tourmaline'],
            herbs: ['Sage', 'Cedar', 'Patchouli'],
          },
        },
        moonPhases: {
          'New Moon': {
            intentions: ['new beginnings', 'setting intentions', 'planning'],
            crystals: ['Moonstone', 'Clear Quartz', 'Selenite'],
          },
          'Waxing Moon': {
            intentions: ['growth', 'building', 'attracting'],
            crystals: ['Citrine', 'Green Aventurine', 'Carnelian'],
          },
          'Full Moon': {
            intentions: ['manifestation', 'completion', 'power'],
            crystals: ['Moonstone', 'Labradorite', 'Selenite'],
          },
          'Waning Moon': {
            intentions: ['release', 'banishing', 'cleansing'],
            crystals: ['Black Tourmaline', 'Obsidian', 'Smoky Quartz'],
          },
        },
      };

      return jsonWithCache({ correspondences });
    }

    // Handle Calendar
    if (type === 'calendar') {
      return jsonWithCache({
        planetaryDays: wiccanWeek,
        sabbats: wheelOfTheYearSabbats,
        currentInfo: {
          date: new Date().toISOString(),
          dayOfWeek: wiccanWeek[new Date().getDay()],
        },
      });
    }

    return NextResponse.json(
      {
        error:
          'Invalid type. Available types: crystals, spells, runes, correspondences, calendar',
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('Grimoire API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// POST endpoint for adding new grimoire content (admin only)
export async function POST(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    // This would typically require authentication/authorization
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Content creation endpoint - requires admin authentication',
      type,
      status: 'pending_implementation',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 },
    );
  }
}
