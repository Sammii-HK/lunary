'use client';

import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface PageStatus {
  url: string;
  verdict: string;
  coverageState: string;
  lastCrawlTime: string | null;
  issues: string[];
}

interface AuditResult {
  success: boolean;
  timestamp: string;
  summary: {
    totalUrls: number;
    indexed: number;
    notIndexed: number;
    errors: number;
    indexRate: string;
  };
  notIndexedReasons: Record<string, number>;
  notIndexedPages: Array<{
    url: string;
    reason: string;
    suggestedFix: string;
    lastCrawl: string | null;
  }>;
  allPages: PageStatus[];
}

export default function SEODashboard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const [customUrls, setCustomUrls] = useState('');

  const runAudit = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = customUrls.trim()
        ? `/api/admin/seo/indexing-audit?urls=${encodeURIComponent(customUrls)}`
        : `/api/admin/seo/indexing-audit?limit=${limit}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run audit');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'PASS':
        return <CheckCircle className='h-5 w-5 text-green-500' />;
      case 'NEUTRAL':
      case 'FAIL':
        return <XCircle className='h-5 w-5 text-red-500' />;
      default:
        return <AlertCircle className='h-5 w-5 text-yellow-500' />;
    }
  };

  const getVerdictBg = (verdict: string) => {
    switch (verdict) {
      case 'PASS':
        return 'bg-green-900/20 border-green-700';
      case 'NEUTRAL':
      case 'FAIL':
        return 'bg-red-900/20 border-red-700';
      default:
        return 'bg-yellow-900/20 border-yellow-700';
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <div className='mb-8'>
        <h1 className='text-3xl font-light text-white mb-2 flex items-center gap-3'>
          <Search className='h-8 w-8 text-lunary-primary-400' />
          SEO Indexing Audit
        </h1>
        <p className='text-zinc-400'>
          Check which pages are indexed by Google using the Search Console API
        </p>
      </div>

      <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 mb-6'>
        <h2 className='text-lg font-medium text-white mb-4'>Run Audit</h2>

        <div className='space-y-4'>
          <div>
            <label className='block text-sm text-zinc-400 mb-2'>
              Number of URLs to check (from predefined list)
            </label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className='bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white'
            >
              <option value={10}>10 URLs</option>
              <option value={20}>20 URLs</option>
              <option value={50}>50 URLs</option>
              <option value={100}>100 URLs (all)</option>
            </select>
          </div>

          <div>
            <label className='block text-sm text-zinc-400 mb-2'>
              Or enter custom URLs (comma-separated)
            </label>
            <textarea
              value={customUrls}
              onChange={(e) => setCustomUrls(e.target.value)}
              placeholder='https://lunary.app/grimoire/zodiac/aries, https://lunary.app/grimoire/tarot/the-fool'
              className='w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white h-24'
            />
          </div>

          <button
            onClick={runAudit}
            disabled={loading}
            className='flex items-center gap-2 px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-zinc-700 text-white rounded-lg transition-colors'
          >
            {loading ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Running Audit...
              </>
            ) : (
              <>
                <RefreshCw className='h-4 w-4' />
                Run Indexing Audit
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className='bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6'>
          <p className='text-red-400'>
            <strong>Error:</strong> {error}
          </p>
          {error.includes('invalid_grant') && (
            <p className='text-red-300 text-sm mt-2'>
              The OAuth refresh token has expired. Run{' '}
              <code className='bg-zinc-800 px-1 rounded'>
                npx tsx scripts/regenerate-google-token.ts
              </code>{' '}
              to regenerate it.
            </p>
          )}
        </div>
      )}

      {result && (
        <>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
              <div className='text-3xl font-light text-white'>
                {result.summary.totalUrls}
              </div>
              <div className='text-sm text-zinc-400'>Total Checked</div>
            </div>
            <div className='bg-green-900/20 border border-green-700 rounded-lg p-4'>
              <div className='text-3xl font-light text-green-400'>
                {result.summary.indexed}
              </div>
              <div className='text-sm text-green-300'>Indexed</div>
            </div>
            <div className='bg-red-900/20 border border-red-700 rounded-lg p-4'>
              <div className='text-3xl font-light text-red-400'>
                {result.summary.notIndexed}
              </div>
              <div className='text-sm text-red-300'>Not Indexed</div>
            </div>
            <div className='bg-lunary-primary-900/20 border border-lunary-primary-700 rounded-lg p-4'>
              <div className='text-3xl font-light text-lunary-primary-400'>
                {result.summary.indexRate}
              </div>
              <div className='text-sm text-lunary-primary-300'>Index Rate</div>
            </div>
          </div>

          {Object.keys(result.notIndexedReasons).length > 0 && (
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6'>
              <h3 className='text-lg font-medium text-white mb-3'>
                Not Indexed Reasons
              </h3>
              <div className='space-y-2'>
                {Object.entries(result.notIndexedReasons).map(
                  ([reason, count]) => (
                    <div key={reason} className='flex justify-between text-sm'>
                      <span className='text-zinc-300'>{reason}</span>
                      <span className='text-zinc-400'>{count} pages</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}

          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
            <h3 className='text-lg font-medium text-white mb-4'>All Pages</h3>
            <div className='space-y-2'>
              {result.allPages.map((page) => (
                <div
                  key={page.url}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getVerdictBg(page.verdict)}`}
                >
                  {getVerdictIcon(page.verdict)}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <a
                        href={page.url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-sm text-lunary-primary-400 hover:underline truncate'
                      >
                        {page.url.replace('https://lunary.app', '')}
                      </a>
                      <ExternalLink className='h-3 w-3 text-zinc-400 flex-shrink-0' />
                    </div>
                    <div className='text-xs text-zinc-400 mt-1'>
                      {page.coverageState}
                      {page.lastCrawlTime && (
                        <span className='ml-2'>
                          • Last crawl:{' '}
                          {new Date(page.lastCrawlTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {page.issues.length > 0 && (
                      <div className='text-xs text-red-400 mt-1'>
                        {page.issues.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className='mt-8 p-4 bg-zinc-900/30 border border-zinc-800 rounded-lg'>
        <h3 className='text-sm font-medium text-zinc-300 mb-2'>
          How to Improve Indexing
        </h3>
        <ul className='text-xs text-zinc-400 space-y-1'>
          <li>
            • <strong>Crawled - not indexed:</strong> Improve content quality,
            add internal links
          </li>
          <li>
            • <strong>Discovered - not indexed:</strong> Submit URL in Search
            Console, add to sitemap
          </li>
          <li>
            • <strong>Duplicate:</strong> Add canonical tags to preferred URL
          </li>
          <li>
            • <strong>Soft 404:</strong> Add meaningful content to the page
          </li>
        </ul>
      </div>
    </div>
  );
}
