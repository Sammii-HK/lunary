import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createCitationReadinessReport,
  extractCitationTargets,
  normalizeLunaryUrl,
  resolveRouteSource,
} from '@/lib/seo/ai-citation-readiness';

function createFixtureProject() {
  const root = mkdtempSync(join(tmpdir(), 'lunary-citation-readiness-'));
  const pageDir = join(root, 'src/app/grimoire/zodiac/[sign]');
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(
    join(pageDir, 'page.tsx'),
    `
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export default function Page() {
  return (
    <SEOContentTemplate
      title='Aries'
      h1='Aries'
      description='Aries is the first zodiac sign.'
      canonicalUrl='https://lunary.app/grimoire/zodiac/aries'
      keywords={['aries', 'zodiac']}
      tldr='Aries is cardinal fire.'
      faqs={[]}
    />
  );
}
`,
  );

  return root;
}

function createCitationFixtureProject() {
  const root = mkdtempSync(join(tmpdir(), 'lunary-citation-quality-'));
  const pageDir = join(root, 'src/app/about/citations');
  mkdirSync(pageDir, { recursive: true });
  writeFileSync(
    join(pageDir, 'page.tsx'),
    `
import { renderJsonLd } from '@/lib/schema';

const citableFacts = [{ claim: 'Use the most specific Lunary source.' }];

export default function Page() {
  const citationWorkSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    citation: ['https://lunary.app/about/methodology'],
    isBasedOn: 'https://lunary.app/about/methodology',
  };

  return (
    <main>
      {renderJsonLd(citationWorkSchema)}
      <h1>How to cite Lunary</h1>
      <section>
        <h2>Citable Facts</h2>
        <p>{citableFacts[0].claim}</p>
      </section>
    </main>
  );
}
`,
  );

  return root;
}

describe('AI citation readiness', () => {
  it('normalizes only Lunary URLs', () => {
    expect(
      normalizeLunaryUrl(
        'https://lunary.app/grimoire/zodiac/aries/?utm_source=test#section',
      ),
    ).toEqual({
      url: 'https://lunary.app/grimoire/zodiac/aries',
      pathname: '/grimoire/zodiac/aries',
    });

    expect(normalizeLunaryUrl('https://example.com/grimoire')).toBeNull();
  });

  it('extracts canonical and supporting citation targets from the map', () => {
    const targets = extractCitationTargets({
      prioritySurfaces: [
        {
          topic: 'Zodiac signs',
          canonicalUrl: 'https://lunary.app/grimoire/zodiac',
          supportingUrls: ['https://lunary.app/grimoire/zodiac/aries'],
        },
      ],
    });

    expect(targets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          pathname: '/grimoire/zodiac',
          role: 'canonical',
        }),
        expect.objectContaining({
          pathname: '/grimoire/zodiac/aries',
          role: 'supporting',
        }),
      ]),
    );
  });

  it('resolves dynamic Next.js page sources for citation URLs', () => {
    const projectRoot = createFixtureProject();
    const match = resolveRouteSource('/grimoire/zodiac/aries', projectRoot);

    expect(match?.relativePath).toBe('src/app/grimoire/zodiac/[sign]/page.tsx');
  });

  it('scores a mapped target using source, sitemap, and protected-page signals', () => {
    const projectRoot = createFixtureProject();
    const report = createCitationReadinessReport({
      projectRoot,
      map: {
        prioritySurfaces: [
          {
            topic: 'Zodiac signs',
            canonicalUrl: 'https://lunary.app/grimoire/zodiac/aries',
          },
        ],
      },
      sitemapUrls: new Set(['https://lunary.app/grimoire/zodiac/aries']),
      protectedSeoPaths: new Set(['/grimoire/zodiac/aries']),
    });

    expect(report.summary.targetCount).toBe(1);
    expect(report.results[0]).toEqual(
      expect.objectContaining({
        score: 100,
        grade: 'excellent',
        inSitemap: true,
        protectedSeoPage: true,
      }),
    );
  });

  it('recognizes non-template pages with citation-quality schema and facts', () => {
    const projectRoot = createCitationFixtureProject();
    const report = createCitationReadinessReport({
      projectRoot,
      map: {
        prioritySurfaces: [
          {
            topic: 'How to cite Lunary',
            canonicalUrl: 'https://lunary.app/about/citations',
          },
        ],
      },
      sitemapUrls: new Set(['https://lunary.app/about/citations']),
      protectedSeoPaths: new Set(['/about/citations']),
    });

    expect(report.results[0].sourceSignals).toEqual(
      expect.objectContaining({
        usesSeoContentTemplate: false,
        hasCitationQualitySignal: true,
        hasDirectAnswerSignal: true,
        hasStructuredDataSignal: true,
      }),
    );
    expect(report.results[0].issues).not.toContain(
      'Page does not appear to use SEOContentTemplate.',
    );
    expect(report.results[0].score).toBeGreaterThanOrEqual(95);
  });
});
