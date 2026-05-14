/**
 * @jest-environment node
 */

import robots from '@/app/robots';

describe('robots metadata', () => {
  it('keeps protected app and API areas blocked for general crawlers', () => {
    const metadata = robots();
    const generalRule = Array.isArray(metadata.rules)
      ? metadata.rules.find((rule) => rule.userAgent === '*')
      : undefined;

    expect(generalRule).toBeDefined();
    expect(generalRule?.disallow).toEqual(
      expect.arrayContaining(['/admin/', '/api/', '/profile/']),
    );
    expect(generalRule?.allow).toEqual(expect.arrayContaining(['/']));
  });

  it('lets AI crawlers reach public declaration and discovery files', () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [];
    const gptBotRule = rules.find((rule) => rule.userAgent === 'GPTBot');

    expect(gptBotRule).toBeDefined();
    expect(gptBotRule?.allow).toEqual(
      expect.arrayContaining([
        '/llms.txt',
        '/llms-full.txt',
        '/.well-known/ai-plugin.json',
        '/.well-known/openapi.json',
        '/.well-known/lunary-gpt-openapi.yaml',
        '/sitemap-index.xml',
        '/sitemap.xml',
      ]),
    );
    expect(gptBotRule?.disallow).toEqual(
      expect.arrayContaining(['/api/', '/profile/', '/admin/']),
    );
  });
});
