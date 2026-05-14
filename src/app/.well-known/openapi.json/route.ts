export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const revalidate = 86400;

const BASE_URL = 'https://lunary.app';

const openApiDocument = {
  openapi: '3.1.0',
  info: {
    title: 'Lunary Public Reference API',
    version: '1.0.0',
    description:
      'Public astrology, tarot, moon phase, compatibility, and grimoire endpoints for AI assistants and answer engines.',
  },
  servers: [{ url: BASE_URL }],
  paths: {
    '/api/gpt/cosmic-today': {
      get: {
        operationId: 'getCosmicToday',
        summary: 'Get current cosmic conditions and moon phase.',
        responses: {
          '200': {
            description: 'Current public cosmic conditions.',
          },
        },
      },
    },
    '/api/gpt/horoscope': {
      get: {
        operationId: 'getHoroscope',
        summary: 'Get a public daily or weekly horoscope by zodiac sign.',
        parameters: [
          {
            name: 'sign',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'type',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['daily', 'weekly'] },
          },
        ],
        responses: {
          '200': {
            description: 'Horoscope response.',
          },
        },
      },
    },
    '/api/gpt/compatibility': {
      get: {
        operationId: 'getCompatibility',
        summary: 'Get zodiac sign compatibility.',
        parameters: [
          {
            name: 'sign1',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'sign2',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Compatibility response.',
          },
        },
      },
    },
    '/api/gpt/grimoire/search': {
      get: {
        operationId: 'searchGrimoire',
        summary: 'Search Lunary grimoire reference content.',
        parameters: [
          {
            name: 'q',
            in: 'query',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Search results.',
          },
        },
      },
    },
    '/api/gpt/tarot/daily': {
      post: {
        operationId: 'drawDailyTarot',
        summary: 'Draw a public daily tarot card.',
        responses: {
          '200': {
            description: 'Daily tarot response.',
          },
        },
      },
    },
    '/api/gpt/birth-chart-summary': {
      post: {
        operationId: 'getBirthChartSummary',
        summary: 'Get a birth chart summary from supplied birth details.',
        responses: {
          '200': {
            description: 'Birth chart summary.',
          },
        },
      },
    },
    '/api/gpt/ritual/suggest': {
      post: {
        operationId: 'suggestRitual',
        summary: 'Suggest a public ritual from supplied intent or context.',
        responses: {
          '200': {
            description: 'Ritual suggestion.',
          },
        },
      },
    },
  },
};

export async function GET() {
  return Response.json(openApiDocument, {
    headers: {
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
