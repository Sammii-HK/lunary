'use client';

import { useEffect, useState } from 'react';
import { conversionTracking } from '@/lib/analytics';

export default function TestTrackingPage() {
  const [results, setResults] = useState<string[]>([]);

  const addResult = (msg: string) => {
    console.log('[TEST]', msg);
    setResults((prev) => [...prev, msg]);
  };

  useEffect(() => {
    addResult('Component mounted');

    // Check sessionStorage guard
    try {
      const guard = window.sessionStorage.getItem('lunary_event_guard');
      if (guard) {
        const parsed = JSON.parse(guard);
        const lastRecorded = parsed?.appOpened;
        const now = Date.now();
        const diff = lastRecorded ? now - lastRecorded : 0;
        const minutes = Math.floor(diff / 1000 / 60);

        addResult(`Guard last fired: ${minutes} minutes ago`);
        addResult(`Guard TTL: 30 minutes`);
        addResult(
          `Should track: ${diff >= 30 * 60 * 1000 || !lastRecorded ? 'YES' : 'NO (blocked by guard)'}`,
        );
      } else {
        addResult('No guard in sessionStorage');
      }
    } catch (e) {
      addResult(`Error reading guard: ${e}`);
    }

    // Test if tracking function exists
    if (typeof conversionTracking?.appOpened === 'function') {
      addResult('✅ conversionTracking.appOpened exists');
    } else {
      addResult('❌ conversionTracking.appOpened NOT found');
    }

    // Clear guard and try again
    addResult('--- Clearing guard and testing ---');
    window.sessionStorage.removeItem('lunary_event_guard');

    try {
      const result = conversionTracking.appOpened();
      if (result) {
        addResult(`✅ Tracking fired! Result: ${typeof result}`);
      } else {
        addResult(`❌ Tracking blocked (returned undefined)`);
      }
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    }
  }, []);

  return (
    <div className='p-8 max-w-2xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'>Tracking Test Page</h1>
      <div className='bg-gray-100 p-4 rounded space-y-2 font-mono text-sm'>
        {results.map((result, i) => (
          <div
            key={i}
            className={
              result.includes('❌')
                ? 'text-red-600'
                : result.includes('✅')
                  ? 'text-green-600'
                  : ''
            }
          >
            {result}
          </div>
        ))}
      </div>
      <div className='mt-4 text-sm text-gray-600'>
        <p>Check browser console for detailed logs.</p>
        <p>Also check Network tab for /api/ether/cv requests.</p>
      </div>
    </div>
  );
}
