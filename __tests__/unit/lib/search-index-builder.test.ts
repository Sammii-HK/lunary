import { buildSearchIndex, searchIndex } from '@/lib/search/index-builder';

describe('search index builder', () => {
  it('indexes tarot spreads by card names, notes and spread summary', () => {
    const index = buildSearchIndex({
      tarotReadings: [
        {
          id: 'reading-1',
          spreadName: 'Celtic Cross',
          summary: 'A relationship pattern is asking for patience.',
          notes: 'The Moon felt important after the pull.',
          createdAt: '2026-04-25T12:00:00.000Z',
          cards: [
            {
              positionLabel: 'Heart',
              insight: 'Trust the uncertainty.',
              card: {
                name: 'The Moon',
                keywords: ['intuition', 'mystery'],
              },
            },
          ],
        },
      ],
    });

    const results = searchIndex(index, 'moon');

    expect(results[0]).toMatchObject({
      kind: 'tarot',
      title: 'Celtic Cross',
      href: '/tarot#spreads',
    });
  });

  it('points journal results at the Book of Shadows journal route', () => {
    const index = buildSearchIndex({
      journal: [
        {
          id: 42,
          content: 'A tarot reflection about The Star.',
          category: 'journal',
          source: 'tarot',
          moodTags: ['reflection'],
        },
      ],
    });

    expect(searchIndex(index, 'tarot')[0]).toMatchObject({
      kind: 'journal',
      href: '/book-of-shadows/journal#entry-42',
    });
  });
});
