'use client';

import { useEffect, useState } from 'react';

export default function PWATestPage() {
  const [result, setResult] = useState<string>('Testing...');

  useEffect(() => {
    const test = async () => {
      const results: string[] = [];
      results.push('=== PWA Test ===');

      // Test 1: Service Worker Support
      if (!('serviceWorker' in navigator)) {
        setResult('❌ Service workers not supported');
        return;
      }
      results.push('✅ Service workers supported');

      // Test 2: Can access sw.js
      try {
        const swResponse = await fetch('/sw.js');
        if (swResponse.ok) {
          results.push(`✅ sw.js accessible (${swResponse.status})`);
          results.push(
            `   Content-Type: ${swResponse.headers.get('content-type')}`,
          );
        } else {
          results.push(`❌ sw.js returned ${swResponse.status}`);
          setResult(results.join('\n'));
          return;
        }
      } catch (e: any) {
        results.push(`❌ Failed to fetch sw.js: ${e.message}`);
        setResult(results.join('\n'));
        return;
      }

      // Test 3: Try registration
      try {
        results.push('Attempting registration...');
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        results.push(`✅ Registration successful`);
        results.push(`   Scope: ${registration.scope}`);
        results.push(
          `   Installing: ${registration.installing?.state || 'none'}`,
        );

        // Wait for ready
        await navigator.serviceWorker.ready;
        results.push(`✅ Service worker ready`);
        results.push(`   Active: ${registration.active?.state || 'none'}`);
        results.push(`   Controlling: ${!!navigator.serviceWorker.controller}`);

        if (navigator.serviceWorker.controller) {
          results.push(`✅ CONTROLLING PAGE - PWA READY!`);
        } else {
          results.push(`⚠️ Not controlling yet - refresh page to activate`);
        }
      } catch (e: any) {
        results.push(`❌ Registration FAILED`);
        results.push(`   Error: ${e.message}`);
        results.push(`   Name: ${e.name}`);
        results.push(`   Stack: ${e.stack}`);
      }

      setResult(results.join('\n'));
    };

    test();
  }, []);

  return (
    <div className='p-4 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>PWA Test</h1>
      <pre className='bg-zinc-900 p-4 rounded font-mono text-xs whitespace-pre-wrap overflow-auto'>
        {result}
      </pre>
    </div>
  );
}
