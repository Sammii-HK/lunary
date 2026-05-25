import { buildLinksUtmUrl, buildUtmUrl } from '@/lib/urls';

describe('URL helpers', () => {
  it('keeps buildUtmUrl backward-compatible and supports utm_content', () => {
    expect(
      buildUtmUrl('/grimoire', 'youtube', 'social', 'shorts', 'description'),
    ).toBe(
      'https://lunary.app/grimoire?utm_source=youtube&utm_medium=social&utm_campaign=shorts&utm_content=description',
    );
  });

  it('labels internal links route clicks without forcing an absolute URL', () => {
    expect(buildLinksUtmUrl('/podcast', 'podcast')).toBe(
      '/podcast?utm_source=lunary_links&utm_medium=social_bio&utm_campaign=link_hub&utm_content=podcast',
    );
  });

  it('supports campaign overrides for the featured quiz route', () => {
    expect(
      buildLinksUtmUrl(
        '/quiz/beyond-your-sun-sign/chart-ruler',
        'chart_ruler_quiz',
        {
          campaign: 'quiz_warm_click',
        },
      ),
    ).toBe(
      '/quiz/beyond-your-sun-sign/chart-ruler?utm_source=lunary_links&utm_medium=social_bio&utm_campaign=quiz_warm_click&utm_content=chart_ruler_quiz',
    );
  });

  it('preserves external destinations while labelling them', () => {
    expect(
      buildLinksUtmUrl(
        'https://play.google.com/store/apps/details?id=app.lunary',
        'google_play',
      ),
    ).toBe(
      'https://play.google.com/store/apps/details?id=app.lunary&utm_source=lunary_links&utm_medium=social_bio&utm_campaign=link_hub&utm_content=google_play',
    );
  });
});
