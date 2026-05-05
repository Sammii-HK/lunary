import { getSafeAuthRedirectPath } from '@/lib/auth-redirect';

describe('getSafeAuthRedirectPath', () => {
  it('defaults to the app when no redirect is requested', () => {
    expect(getSafeAuthRedirectPath('')).toBe('/app');
    expect(getSafeAuthRedirectPath(null)).toBe('/app');
  });

  it('accepts protected app returnTo paths with query strings', () => {
    expect(
      getSafeAuthRedirectPath('returnTo=%2Fapp%2Fbirth-chart%3Ftab%3D1'),
    ).toBe('/app/birth-chart?tab=1');
  });

  it('supports legacy redirect and next params used by auth links', () => {
    expect(getSafeAuthRedirectPath('redirect=%2Fapp%2Fbirth-chart')).toBe(
      '/app/birth-chart',
    );
    expect(getSafeAuthRedirectPath('next=%2Fhoroscope')).toBe('/horoscope');
  });

  it('rejects external, protocol-relative, and public marketing redirects', () => {
    expect(getSafeAuthRedirectPath('returnTo=https%3A%2F%2Fevil.test')).toBe(
      '/app',
    );
    expect(getSafeAuthRedirectPath('returnTo=%2F%2Fevil.test%2Fapp')).toBe(
      '/app',
    );
    expect(getSafeAuthRedirectPath('returnTo=%2Fpricing')).toBe('/app');
  });
});
