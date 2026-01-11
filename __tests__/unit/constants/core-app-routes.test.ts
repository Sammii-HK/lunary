import { isCoreAppRoute } from '@/constants/core-app-routes';

describe('core app routes', () => {
  it('recognizes product routes under /app and similar paths', () => {
    expect(isCoreAppRoute('/app')).toBe(true);
    expect(isCoreAppRoute('/app/dashboard')).toBe(true);
    expect(isCoreAppRoute('/guide')).toBe(true);
    expect(isCoreAppRoute('/collections/favorites')).toBe(true);
  });

  it('excludes Grimoire-only paths', () => {
    expect(isCoreAppRoute('/grimoire')).toBe(false);
    expect(isCoreAppRoute('/grimoire/moon')).toBe(false);
    expect(isCoreAppRoute('/grimoire/search')).toBe(false);
  });
});
