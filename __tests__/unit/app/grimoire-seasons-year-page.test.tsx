/**
 * @jest-environment node
 */

jest.mock('@/components/grimoire/ExploreGrimoire', () => ({
  ExploreGrimoire: () => null,
}));
jest.mock('@/components/grimoire/GrimoireBreadcrumbs', () => ({
  GrimoireBreadcrumbs: () => null,
}));

import YearSeasonsPage, {
  generateMetadata,
} from '@/app/grimoire/seasons/[year]/page';

describe('grimoire seasons year page', () => {
  const currentYear = new Date().getFullYear();

  it('permanently redirects legacy one-segment season slugs to canonical season pages', async () => {
    await expect(
      YearSeasonsPage({
        params: Promise.resolve({ year: 'gemini-season' }),
      }),
    ).rejects.toMatchObject({
      digest: `NEXT_REDIRECT;replace;/grimoire/seasons/${currentYear}/gemini;308;`,
    });
  });

  it('sets the canonical target on legacy season metadata', async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ year: 'gemini-season' }),
    });

    expect(metadata.alternates?.canonical).toBe(
      `https://lunary.app/grimoire/seasons/${currentYear}/gemini`,
    );
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('allows the next year index linked from the seasons hub', async () => {
    const nextYear = String(currentYear + 1);
    const metadata = await generateMetadata({
      params: Promise.resolve({ year: nextYear }),
    });

    expect(metadata.alternates?.canonical).toBe(
      `https://lunary.app/grimoire/seasons/${nextYear}`,
    );
  });
});
