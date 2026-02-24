import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { lunary } from '../client.js';
import { jsonResult, errorResult } from '../types.js';

export function registerGrimoireTools(server: McpServer) {
  // ── Browse ───────────────────────────────────────────────
  server.tool(
    'browse_grimoire',
    'Table of contents for the Grimoire knowledge base: all categories, content types, and counts',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', { params: { type: 'browse' } });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Semantic Search ──────────────────────────────────────
  server.tool(
    'search_grimoire',
    'Semantic vector search across all Grimoire content (crystals, spells, zodiac, tarot, etc.)',
    {
      query: z
        .string()
        .describe(
          'Search query (e.g. "protection crystals", "full moon ritual")',
        ),
      limit: z.number().optional().describe('Max results (1-20, default 10)'),
      category: z
        .string()
        .optional()
        .describe('Filter by category (e.g. crystals, spells, zodiac)'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: {
            type: 'semantic-search',
            query: params.query,
            ...(params.limit && { limit: String(params.limit) }),
            ...(params.category && { category: params.category }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Crystals ─────────────────────────────────────────────
  server.tool(
    'get_crystal',
    'Get full details for a specific crystal by ID (e.g. "rose-quartz", "amethyst")',
    {
      id: z.string().describe('Crystal ID (kebab-case, e.g. "rose-quartz")'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'crystals', action: 'get', id: params.id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'search_crystals',
    'Search and filter crystals by query, category, intention, moon phase, or zodiac sign',
    {
      query: z.string().optional().describe('Text search query'),
      category: z.string().optional().describe('Crystal category'),
      intention: z
        .string()
        .optional()
        .describe('Filter by intention (e.g. "love", "protection")'),
      moon_phase: z
        .string()
        .optional()
        .describe('Filter by moon phase (e.g. "full moon")'),
      zodiac_sign: z
        .string()
        .optional()
        .describe('Filter by zodiac sign (e.g. "Pisces")'),
      limit: z.number().optional().describe('Max results (default 10)'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string | undefined> = {
          type: 'crystals',
          ...(params.limit && { limit: String(params.limit) }),
        };

        if (params.query) {
          queryParams.action = 'search';
          queryParams.query = params.query;
        } else if (
          params.intention ||
          params.moon_phase ||
          params.zodiac_sign ||
          params.category
        ) {
          queryParams.action = 'filter';
          if (params.intention) queryParams.intention = params.intention;
          if (params.moon_phase) queryParams.moonPhase = params.moon_phase;
          if (params.zodiac_sign) queryParams.zodiacSign = params.zodiac_sign;
          if (params.category) queryParams.category = params.category;
        }

        const data = await lunary('/grimoire', { params: queryParams });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Spells ───────────────────────────────────────────────
  server.tool(
    'get_spell',
    'Get full details for a specific spell by ID',
    {
      id: z.string().describe('Spell ID (kebab-case)'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'spells', action: 'get', id: params.id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'search_spells',
    'Search spells by text query or filter by category',
    {
      query: z.string().optional().describe('Text search query'),
      category: z.string().optional().describe('Spell category to filter by'),
      limit: z.number().optional().describe('Max results (default 10)'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string | undefined> = {
          type: 'spells',
          ...(params.limit && { limit: String(params.limit) }),
        };

        if (params.query) {
          queryParams.action = 'search';
          queryParams.query = params.query;
        } else if (params.category) {
          queryParams.action = 'filter';
          queryParams.category = params.category;
        }

        const data = await lunary('/grimoire', { params: queryParams });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Runes ────────────────────────────────────────────────
  server.tool(
    'get_rune',
    'Get full details for a specific Elder Futhark rune by ID (e.g. "fehu", "ansuz")',
    {
      id: z.string().describe('Rune ID (lowercase, e.g. "fehu")'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'runes', action: 'get', id: params.id },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  server.tool(
    'list_runes',
    'List all 24 Elder Futhark runes with names, symbols, and meanings',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', { params: { type: 'runes' } });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Correspondences ──────────────────────────────────────
  server.tool(
    'get_correspondences',
    'Get magical correspondences: elements, colors, days, flowers, herbs, animals. Optionally filter by section.',
    {
      section: z
        .string()
        .optional()
        .describe(
          'Section name (e.g. "elements", "colors", "days", "flowers", "herbs", "animals", "woods", "numbers"). Omit for overview of all sections.',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: {
            type: 'correspondences',
            ...(params.section && { section: params.section }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Calendar ─────────────────────────────────────────────
  server.tool(
    'get_calendar',
    'Wiccan calendar: Wheel of the Year sabbats, planetary weekdays, and current day correspondences',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'calendar' },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Tarot Spreads ────────────────────────────────────────
  server.tool(
    'get_tarot_spreads',
    'Get tarot spread layouts with positions, prompts, and journal questions. Optionally get a specific spread by slug.',
    {
      id: z
        .string()
        .optional()
        .describe(
          'Spread slug (e.g. "celtic-cross", "past-present-future"). Omit to list all.',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: {
            type: 'tarot-spreads',
            ...(params.id && { id: params.id }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Numerology ───────────────────────────────────────────
  server.tool(
    'get_numerology',
    'Numerology data: angel numbers, life path, karmic debt, expression, soul urge, mirror hours, double hours',
    {
      subtype: z
        .enum([
          'angel',
          'lifepath',
          'karmic-debt',
          'expression',
          'soul-urge',
          'mirror-hours',
          'double-hours',
        ])
        .optional()
        .describe('Specific numerology type. Omit for overview with counts.'),
      id: z
        .string()
        .optional()
        .describe('Look up a specific number across all numerology sets'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: {
            type: 'numerology',
            ...(params.subtype && { subtype: params.subtype }),
            ...(params.id && { id: params.id }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Glossary ─────────────────────────────────────────────
  server.tool(
    'search_glossary',
    'Search the astrology glossary for term definitions. Filter by category or search by text.',
    {
      query: z.string().optional().describe('Search query text'),
      id: z.string().optional().describe('Term slug for exact lookup'),
      category: z
        .enum([
          'basic',
          'chart',
          'aspect',
          'planet',
          'sign',
          'house',
          'technique',
          'transit',
        ])
        .optional()
        .describe('Filter by glossary category'),
      limit: z.number().optional().describe('Max results (default 10)'),
    },
    async (params) => {
      try {
        const queryParams: Record<string, string | undefined> = {
          type: 'glossary',
          ...(params.limit && { limit: String(params.limit) }),
        };

        if (params.query) {
          queryParams.action = 'search';
          queryParams.query = params.query;
        }
        if (params.id) queryParams.id = params.id;
        if (params.category) queryParams.category = params.category;

        const data = await lunary('/grimoire', { params: queryParams });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Houses ───────────────────────────────────────────────
  server.tool(
    'get_houses',
    'Get astrological house data: life areas, natural signs, rulers, keywords. Optionally get a specific house (1-12).',
    {
      id: z
        .string()
        .optional()
        .describe('House number (1-12). Omit for all houses.'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'houses', ...(params.id && { id: params.id }) },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Chakras ──────────────────────────────────────────────
  server.tool(
    'get_chakras',
    'Get chakra data: crystals, yoga poses, healing practices, blockage symptoms, affirmations. Optionally get a specific chakra.',
    {
      id: z
        .string()
        .optional()
        .describe(
          'Chakra ID (e.g. "root", "sacral", "solar-plexus", "heart", "throat", "third-eye", "crown"). Omit for all.',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'chakras', ...(params.id && { id: params.id }) },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Aspects ──────────────────────────────────────────────
  server.tool(
    'get_aspects',
    'Get astrological aspect data: conjunction, sextile, square, trine, opposition, quincunx, semi-sextile with degrees and meanings',
    {
      id: z
        .string()
        .optional()
        .describe(
          'Aspect ID (e.g. "conjunct", "trine", "square"). Omit for all.',
        ),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'aspects', ...(params.id && { id: params.id }) },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Entity Relationships ─────────────────────────────────
  server.tool(
    'get_entity_relationships',
    'Cross-reference map: planets → zodiac/tarot/crystals/elements/chakras, zodiac → rulers/elements/houses, major arcana → planets/zodiac',
    {
      entity_type: z
        .enum(['planets', 'zodiac', 'major-arcana'])
        .optional()
        .describe('Filter by entity type. Omit for all.'),
    },
    async (params) => {
      try {
        const data = await lunary('/grimoire', {
          params: {
            type: 'entity-relationships',
            ...(params.entity_type && { entityType: params.entity_type }),
          },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Tarot Suits ──────────────────────────────────────────
  server.tool(
    'get_tarot_suits',
    'Get tarot suit data: Wands, Cups, Swords, Pentacles with elements and mystical properties',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', {
          params: { type: 'tarot-suits' },
        });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── Grimoire Stats ───────────────────────────────────────
  server.tool(
    'get_grimoire_stats',
    'Grimoire embedding statistics: total count and counts by category',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', { params: { type: 'stats' } });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );

  // ── List Categories ──────────────────────────────────────
  server.tool(
    'list_grimoire_categories',
    'List all Grimoire section categories with counts — use this to discover what content is available',
    {},
    async () => {
      try {
        const data = await lunary('/grimoire', { params: { type: 'browse' } });
        return jsonResult(data);
      } catch (error) {
        return errorResult(error);
      }
    },
  );
}
