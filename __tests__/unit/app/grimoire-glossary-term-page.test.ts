import { ASTROLOGY_GLOSSARY } from '@/constants/grimoire/glossary';
import {
  buildGlossaryTermSchemas,
  generateMetadata,
  resolveRelatedTerms,
} from '@/app/grimoire/glossary/[term]/page';

describe('glossary term page helpers', () => {
  const ascendant = ASTROLOGY_GLOSSARY.find(
    (entry) => entry.slug === 'ascendant',
  );

  if (!ascendant) {
    throw new Error('Expected ascendant glossary fixture to exist');
  }

  it('keeps unresolved related concepts from becoming broken glossary links', () => {
    const relatedTerms = resolveRelatedTerms(ascendant);

    expect(relatedTerms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'rising-sign',
          label: 'Rising Sign',
          href: '/grimoire/glossary/rising-sign',
          url: 'https://lunary.app/grimoire/glossary/rising-sign',
        }),
        expect.objectContaining({
          key: 'first-house',
          label: 'First House',
          href: null,
          url: null,
        }),
      ]),
    );
  });

  it('uses only absolute valid related-term URLs in DefinedTerm schema', () => {
    const [definedTermSchema] = buildGlossaryTermSchemas(ascendant);

    expect(definedTermSchema).toMatchObject({
      '@type': 'DefinedTerm',
      name: 'Ascendant',
      identifier: 'ascendant',
      termCode: 'ascendant',
      mainEntityOfPage: 'https://lunary.app/grimoire/glossary/ascendant',
    });
    expect(definedTermSchema.sameAs).toEqual([
      'https://lunary.app/grimoire/glossary/rising-sign',
      'https://lunary.app/grimoire/glossary/descendant',
    ]);
    expect(JSON.stringify(definedTermSchema)).not.toContain(
      '/grimoire/glossary/first-house',
    );
    expect(definedTermSchema.subjectOf).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          '@type': 'Dataset',
          url: 'https://lunary.app/grimoire/datasets/core-astrology.json',
        }),
        expect.objectContaining({
          '@type': 'WebPage',
          url: 'https://lunary.app/about/methodology',
        }),
      ]),
    );
  });

  it('returns citation-oriented metadata for valid terms', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ term: 'ascendant' }),
    });

    expect(metadata.alternates?.canonical).toBe(
      'https://lunary.app/grimoire/glossary/ascendant',
    );
    expect(metadata.twitter).toMatchObject({
      card: 'summary',
      title: 'Ascendant Meaning in Astrology',
    });
    expect(metadata.keywords).toContain('Ascendant definition');
  });
});
