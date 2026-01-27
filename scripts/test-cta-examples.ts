#!/usr/bin/env tsx

/**
 * Test script to verify CTA examples are being injected correctly
 */

import { getContextualNudge } from '../src/lib/grimoire/getContextualNudge';

// Test paths for different hubs
const testPaths = [
  '/grimoire/horoscopes/daily/aries',
  '/grimoire/planets/mercury',
  '/grimoire/houses/1st-house',
  '/grimoire/moon/new-moon',
  '/grimoire/transits/mercury-retrograde',
  '/grimoire/aspects/conjunction',
];

console.log('═══════════════════════════════════════');
console.log('  CTA Examples Test');
console.log('═══════════════════════════════════════\n');

for (const path of testPaths) {
  const nudge = getContextualNudge(path);
  console.log(`📍 Path: ${path}`);
  console.log(`🏷️  Hub: ${nudge.hub}`);
  console.log(`📌 Headline: ${nudge.headline}`);
  console.log(`📝 Subline:\n${nudge.subline}`);
  console.log('\n' + '─'.repeat(80) + '\n');
}

console.log('✅ Test complete!\n');
