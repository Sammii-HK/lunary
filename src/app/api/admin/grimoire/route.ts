import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';

// Grimoire data imports
import {
  crystalDatabase,
  getCrystalById,
  getCrystalsByCategory,
  getCrystalsByIntention,
  getCrystalsByMoonPhase,
  getCrystalsByZodiacSign,
  searchCrystals,
  crystalCategories,
} from '@/constants/grimoire/crystals';
import {
  spellDatabase,
  getSpellById,
  getSpellsByCategory,
  searchSpells,
  spellCategories,
} from '@/lib/spells/index';
import { runesList } from '@/constants/runes';
import { wiccanWeek } from '@/constants/weekDays';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { TAROT_SPREADS } from '@/constants/tarotSpreads';
import {
  angelNumbers,
  lifePathNumbers,
} from '@/constants/grimoire/numerology-data';
import {
  ASTROLOGY_GLOSSARY,
  searchGlossary,
  getTermBySlug,
  getTermsByCategory,
  glossaryCategories,
} from '@/constants/grimoire/glossary';
import {
  searchSimilar,
  getEmbeddingCount,
  getCategoryCounts,
} from '@/lib/embeddings';

// Extended data imports
import { HOUSE_DATA, HOUSES } from '@/constants/seo/houses';
import { chakras } from '@/constants/chakras';
import { ASPECTS, ASPECT_DATA } from '@/constants/seo/aspects';
import { tarotSuits } from '@/constants/tarot';
import {
  karmicDebtNumbers,
  expressionNumbers,
  soulUrgeNumbers,
} from '@/constants/grimoire/numerology-extended-data';
import {
  mirrorHours,
  doubleHours,
} from '@/constants/grimoire/clock-numbers-data';
import {
  PLANETARY_CORRESPONDENCES,
  ZODIAC_CORRESPONDENCES,
  TAROT_MAJOR_ARCANA_CORRESPONDENCES,
} from '@/constants/entity-relationships';

import { correspondencesData } from '@/constants/grimoire/correspondences';

export async function GET(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'browse';
  const action = searchParams.get('action');
  const id = searchParams.get('id');
  const query = searchParams.get('query');
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  try {
    switch (type) {
      // ── Browse: table of contents ──────────────────────────
      case 'browse': {
        return NextResponse.json({
          types: {
            crystals: {
              count: crystalDatabase.length,
              categories: crystalCategories,
            },
            spells: {
              count: spellDatabase.length,
              categories: Object.keys(spellCategories),
            },
            runes: { count: Object.keys(runesList).length },
            correspondences: {
              sections: Object.keys(correspondencesData),
            },
            calendar: {
              sabbats: wheelOfTheYearSabbats.length,
              weekDays: wiccanWeek.length,
            },
            'tarot-spreads': { count: TAROT_SPREADS.length },
            'tarot-suits': { count: Object.keys(tarotSuits).length },
            numerology: {
              angelNumbers: Object.keys(angelNumbers).length,
              lifePathNumbers: Object.keys(lifePathNumbers).length,
              karmicDebt: Object.keys(karmicDebtNumbers).length,
              expression: Object.keys(expressionNumbers).length,
              soulUrge: Object.keys(soulUrgeNumbers).length,
              mirrorHours: Object.keys(mirrorHours).length,
              doubleHours: Object.keys(doubleHours).length,
            },
            glossary: {
              count: ASTROLOGY_GLOSSARY.length,
              categories: glossaryCategories,
            },
            houses: { count: HOUSES.length },
            chakras: { count: Object.keys(chakras).length },
            aspects: { count: ASPECTS.length },
            'entity-relationships': {
              planets: Object.keys(PLANETARY_CORRESPONDENCES).length,
              zodiac: Object.keys(ZODIAC_CORRESPONDENCES).length,
              majorArcana: Object.keys(TAROT_MAJOR_ARCANA_CORRESPONDENCES)
                .length,
            },
          },
        });
      }

      // ── Crystals ───────────────────────────────────────────
      case 'crystals': {
        if (action === 'get' && id) {
          const crystal = getCrystalById(id);
          if (!crystal)
            return NextResponse.json(
              { error: 'Crystal not found' },
              { status: 404 },
            );
          return NextResponse.json(crystal);
        }
        if (action === 'search' && query) {
          return NextResponse.json(searchCrystals(query).slice(0, limit));
        }
        if (action === 'filter') {
          const intention = searchParams.get('intention');
          const moonPhase = searchParams.get('moonPhase');
          const zodiacSign = searchParams.get('zodiacSign');
          if (intention)
            return NextResponse.json(
              getCrystalsByIntention(intention).slice(0, limit),
            );
          if (moonPhase)
            return NextResponse.json(
              getCrystalsByMoonPhase(moonPhase).slice(0, limit),
            );
          if (zodiacSign)
            return NextResponse.json(
              getCrystalsByZodiacSign(zodiacSign).slice(0, limit),
            );
          if (category)
            return NextResponse.json(
              getCrystalsByCategory(category).slice(0, limit),
            );
          return NextResponse.json(
            { error: 'Provide intention, moonPhase, zodiacSign, or category' },
            { status: 400 },
          );
        }
        // Default: list all with summary
        return NextResponse.json(
          crystalDatabase.slice(0, limit).map((c) => ({
            id: c.id,
            name: c.name,
            categories: c.categories,
            intentions: c.intentions,
            rarity: c.rarity,
          })),
        );
      }

      // ── Spells ─────────────────────────────────────────────
      case 'spells': {
        if (action === 'get' && id) {
          const spell = getSpellById(id);
          if (!spell)
            return NextResponse.json(
              { error: 'Spell not found' },
              { status: 404 },
            );
          return NextResponse.json(spell);
        }
        if (action === 'search' && query) {
          return NextResponse.json(searchSpells(query).slice(0, limit));
        }
        if (action === 'filter' && category) {
          return NextResponse.json(
            getSpellsByCategory(category).slice(0, limit),
          );
        }
        return NextResponse.json(
          spellDatabase.slice(0, limit).map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            difficulty: s.difficulty,
            purpose: s.purpose,
          })),
        );
      }

      // ── Runes ──────────────────────────────────────────────
      case 'runes': {
        if (action === 'get' && id) {
          const rune = runesList[id];
          if (!rune)
            return NextResponse.json(
              { error: 'Rune not found' },
              { status: 404 },
            );
          return NextResponse.json(rune);
        }
        if (action === 'search' && query) {
          const q = query.toLowerCase();
          const results = Object.entries(runesList)
            .filter(
              ([key, r]) =>
                key.includes(q) ||
                r.name.toLowerCase().includes(q) ||
                r.meaning.toLowerCase().includes(q) ||
                r.keywords.some((k: string) => k.toLowerCase().includes(q)),
            )
            .map(([key, r]) => ({
              id: key,
              name: r.name,
              symbol: r.symbol,
              meaning: r.meaning,
              aett: r.aett,
            }))
            .slice(0, limit);
          return NextResponse.json(results);
        }
        return NextResponse.json(
          Object.entries(runesList).map(([key, r]) => ({
            id: key,
            name: r.name,
            symbol: r.symbol,
            meaning: r.meaning,
            aett: r.aett,
          })),
        );
      }

      // ── Correspondences ────────────────────────────────────
      case 'correspondences': {
        const section = searchParams.get('section');

        if (section && section in correspondencesData) {
          return NextResponse.json(
            correspondencesData[section as keyof typeof correspondencesData],
          );
        }

        // Return available sections with their keys
        const overview: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(correspondencesData)) {
          if (value && typeof value === 'object') {
            overview[key] = Object.keys(value);
          }
        }
        return NextResponse.json(overview);
      }

      // ── Calendar ───────────────────────────────────────────
      case 'calendar': {
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const currentDay = wiccanWeek.find((d) => d.dayOfWeek === dayOfWeek);

        return NextResponse.json({
          sabbats: wheelOfTheYearSabbats,
          weekDays: wiccanWeek,
          currentDay: currentDay
            ? { ...currentDay, date: today.toISOString().split('T')[0] }
            : null,
        });
      }

      // ── Tarot Spreads ──────────────────────────────────────
      case 'tarot-spreads': {
        if (id) {
          const spread = TAROT_SPREADS.find((s) => s.slug === id);
          if (!spread)
            return NextResponse.json(
              { error: 'Spread not found' },
              { status: 404 },
            );
          return NextResponse.json(spread);
        }
        return NextResponse.json(TAROT_SPREADS);
      }

      // ── Tarot Suits ────────────────────────────────────────
      case 'tarot-suits': {
        return NextResponse.json(tarotSuits);
      }

      // ── Numerology ─────────────────────────────────────────
      case 'numerology': {
        const subtype = searchParams.get('subtype');
        if (subtype === 'angel') return NextResponse.json(angelNumbers);
        if (subtype === 'lifepath') return NextResponse.json(lifePathNumbers);
        if (subtype === 'karmic-debt')
          return NextResponse.json(karmicDebtNumbers);
        if (subtype === 'expression')
          return NextResponse.json(expressionNumbers);
        if (subtype === 'soul-urge') return NextResponse.json(soulUrgeNumbers);
        if (subtype === 'mirror-hours') return NextResponse.json(mirrorHours);
        if (subtype === 'double-hours') return NextResponse.json(doubleHours);
        if (id) {
          // Look up specific number across all sets
          const result: Record<string, unknown> = {};
          if (angelNumbers[id]) result.angel = angelNumbers[id];
          if (lifePathNumbers[id]) result.lifePath = lifePathNumbers[id];
          if (karmicDebtNumbers[id]) result.karmicDebt = karmicDebtNumbers[id];
          if (expressionNumbers[id]) result.expression = expressionNumbers[id];
          if (soulUrgeNumbers[id]) result.soulUrge = soulUrgeNumbers[id];
          if (mirrorHours[id]) result.mirrorHour = mirrorHours[id];
          if (doubleHours[id]) result.doubleHour = doubleHours[id];
          if (Object.keys(result).length === 0) {
            return NextResponse.json(
              { error: 'Number not found' },
              { status: 404 },
            );
          }
          return NextResponse.json(result);
        }
        return NextResponse.json({
          subtypes: [
            'angel',
            'lifepath',
            'karmic-debt',
            'expression',
            'soul-urge',
            'mirror-hours',
            'double-hours',
          ],
          counts: {
            angel: Object.keys(angelNumbers).length,
            lifePath: Object.keys(lifePathNumbers).length,
            karmicDebt: Object.keys(karmicDebtNumbers).length,
            expression: Object.keys(expressionNumbers).length,
            soulUrge: Object.keys(soulUrgeNumbers).length,
            mirrorHours: Object.keys(mirrorHours).length,
            doubleHours: Object.keys(doubleHours).length,
          },
        });
      }

      // ── Glossary ───────────────────────────────────────────
      case 'glossary': {
        if (action === 'search' && query) {
          return NextResponse.json(searchGlossary(query).slice(0, limit));
        }
        if (id) {
          const term = getTermBySlug(id);
          if (!term)
            return NextResponse.json(
              { error: 'Term not found' },
              { status: 404 },
            );
          return NextResponse.json(term);
        }
        if (category) {
          return NextResponse.json(
            getTermsByCategory(
              category as
                | 'basic'
                | 'chart'
                | 'aspect'
                | 'planet'
                | 'sign'
                | 'house'
                | 'technique'
                | 'transit',
            ),
          );
        }
        return NextResponse.json(ASTROLOGY_GLOSSARY);
      }

      // ── Houses ─────────────────────────────────────────────
      case 'houses': {
        if (id) {
          const num = parseInt(id, 10);
          const house = HOUSE_DATA[num as keyof typeof HOUSE_DATA];
          if (!house)
            return NextResponse.json(
              { error: 'House not found' },
              { status: 404 },
            );
          return NextResponse.json(house);
        }
        return NextResponse.json(HOUSE_DATA);
      }

      // ── Chakras ────────────────────────────────────────────
      case 'chakras': {
        if (id) {
          const chakra = chakras[id];
          if (!chakra)
            return NextResponse.json(
              { error: 'Chakra not found' },
              { status: 404 },
            );
          return NextResponse.json(chakra);
        }
        return NextResponse.json(chakras);
      }

      // ── Aspects ────────────────────────────────────────────
      case 'aspects': {
        if (id) {
          const aspect = ASPECT_DATA[id as keyof typeof ASPECT_DATA];
          if (!aspect)
            return NextResponse.json(
              { error: 'Aspect not found' },
              { status: 404 },
            );
          return NextResponse.json(aspect);
        }
        return NextResponse.json(ASPECT_DATA);
      }

      // ── Entity Relationships ───────────────────────────────
      case 'entity-relationships': {
        const entityType = searchParams.get('entityType');
        if (entityType === 'planets')
          return NextResponse.json(PLANETARY_CORRESPONDENCES);
        if (entityType === 'zodiac')
          return NextResponse.json(ZODIAC_CORRESPONDENCES);
        if (entityType === 'major-arcana')
          return NextResponse.json(TAROT_MAJOR_ARCANA_CORRESPONDENCES);
        return NextResponse.json({
          planets: PLANETARY_CORRESPONDENCES,
          zodiac: ZODIAC_CORRESPONDENCES,
          majorArcana: TAROT_MAJOR_ARCANA_CORRESPONDENCES,
        });
      }

      // ── Semantic Search ────────────────────────────────────
      case 'semantic-search': {
        if (!query) {
          return NextResponse.json(
            { error: 'query parameter required' },
            { status: 400 },
          );
        }
        const results = await searchSimilar(
          query,
          limit,
          category ?? undefined,
        );
        return NextResponse.json(results);
      }

      // ── Stats ──────────────────────────────────────────────
      case 'stats': {
        const embeddingCount = await getEmbeddingCount();
        const categoryCounts = await getCategoryCounts();
        return NextResponse.json({
          embeddings: { total: embeddingCount, byCategory: categoryCounts },
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown type: ${type}`,
            availableTypes: [
              'browse',
              'crystals',
              'spells',
              'runes',
              'correspondences',
              'calendar',
              'tarot-spreads',
              'tarot-suits',
              'numerology',
              'glossary',
              'houses',
              'chakras',
              'aspects',
              'entity-relationships',
              'semantic-search',
              'stats',
            ],
          },
          { status: 400 },
        );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
