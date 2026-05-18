/**
 * @jest-environment node
 */

import robots from '@/app/robots';
import {
  AI_CRAWLER_USER_AGENTS,
  AI_DISCOVERY_PATHS,
} from '@/lib/seo/discovery';

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
    const oaiSearchBotRule = rules.find(
      (rule) => rule.userAgent === 'OAI-SearchBot',
    );

    expect(oaiSearchBotRule).toBeDefined();
    expect(oaiSearchBotRule?.allow).toEqual(
      expect.arrayContaining(Array.from(AI_DISCOVERY_PATHS)),
    );
    expect(oaiSearchBotRule?.disallow).toEqual(
      expect.arrayContaining(['/api/', '/profile/', '/admin/']),
    );
  });

  it('has explicit rules for the current Bing and AI citation crawlers', () => {
    const metadata = robots();
    const rules = Array.isArray(metadata.rules) ? metadata.rules : [];
    const userAgents = rules.map((rule) => rule.userAgent);

    expect(userAgents).toEqual(
      expect.arrayContaining(Array.from(AI_CRAWLER_USER_AGENTS)),
    );
  });
});
