'use client';

const AB_TEST_COOKIE = 'lunary_ab_tests';

function parseCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(
    new RegExp(
      '(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)',
    ),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

export function getABTestVariantClient(testName: string): string | undefined {
  const raw = parseCookie(AB_TEST_COOKIE);
  if (!raw) return undefined;
  try {
    const tests: Record<string, string> = JSON.parse(raw);
    return tests[testName];
  } catch {
    return undefined;
  }
}
