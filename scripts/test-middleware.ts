#!/usr/bin/env tsx

const testCases = [
  {
    hostname: 'admin.localhost',
    pathname: '/',
    expected: 'rewrite to /admin',
  },
  {
    hostname: 'admin.lunary.app',
    pathname: '/',
    expected: 'rewrite to /admin',
  },
  {
    hostname: 'localhost',
    pathname: '/admin',
    expected: 'redirect to /',
  },
  {
    hostname: 'admin.localhost',
    pathname: '/admin',
    expected: 'redirect to /',
  },
  {
    hostname: 'admin.localhost',
    pathname: '/auth',
    expected: 'no rewrite (skip auth)',
  },
];

function simulateMiddleware(hostname: string, pathname: string) {
  const configuredAdminHosts: string[] = [];
  const isAdminSubdomain =
    hostname.startsWith('admin.') || configuredAdminHosts.includes(hostname);
  const adminPrefix = '/admin';
  const skipAdminRewritePrefixes = ['/auth'];
  const hasAdminPrefix = pathname.startsWith(adminPrefix);
  const shouldSkip = skipAdminRewritePrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  if (!isAdminSubdomain && hasAdminPrefix && !shouldSkip) {
    return { action: 'redirect', to: '/' };
  }

  if (isAdminSubdomain && hasAdminPrefix && !shouldSkip) {
    const trimmedPath = pathname.slice(adminPrefix.length) || '/';
    const cleanPath = trimmedPath.startsWith('/')
      ? trimmedPath
      : `/${trimmedPath}`;
    return { action: 'redirect', to: cleanPath };
  }

  if (isAdminSubdomain && !hasAdminPrefix && !shouldSkip) {
    const newPathname =
      pathname === '/' ? adminPrefix : `${adminPrefix}${pathname}`;
    return { action: 'rewrite', to: newPathname };
  }

  return { action: 'next', to: pathname };
}

console.log('🧪 Testing Middleware Logic\n');
console.log('='.repeat(60));

testCases.forEach((testCase, index) => {
  const result = simulateMiddleware(testCase.hostname, testCase.pathname);
  const passed =
    (result.action === 'rewrite' && testCase.expected.includes('rewrite')) ||
    (result.action === 'redirect' && testCase.expected.includes('redirect')) ||
    (result.action === 'next' && testCase.expected.includes('no rewrite'));

  console.log(`\nTest ${index + 1}:`);
  console.log(`  Hostname: ${testCase.hostname}`);
  console.log(`  Pathname: ${testCase.pathname}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Result: ${result.action} → ${result.to}`);
  console.log(`  ${passed ? '✅ PASS' : '❌ FAIL'}`);
});

console.log('\n' + '='.repeat(60));
console.log('\n📝 To test with actual server:');
console.log('1. Add to /etc/hosts: 127.0.0.1 admin.localhost');
console.log('2. Run: yarn dev');
console.log('3. Visit: http://admin.localhost:3000/');
console.log('4. Check terminal logs for middleware output');
