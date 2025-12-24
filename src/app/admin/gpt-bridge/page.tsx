'use client';

import { useEffect, useMemo, useState } from 'react';

type BridgeLog = {
  id: string;
  createdAt: string;
  level: string;
  seedNormalized: string;
  seedRaw: string;
  typesRequested: string[];
  limit: number;
  resultCount: number;
  curatedCount: number;
  aliasHit: boolean;
  searchCount: number;
  topSlugs: string[];
  timingMs: number;
  message: string;
};

type BridgeStats = {
  total: number;
  warnRate: number;
  avgTimingMs: number;
};

export default function AdminGptBridgePage() {
  const [logs, setLogs] = useState<BridgeLog[]>([]);
  const [stats, setStats] = useState<BridgeStats>({
    total: 0,
    warnRate: 0,
    avgTimingMs: 0,
  });
  const [days, setDays] = useState('7');
  const [level, setLevel] = useState('all');
  const [seed, setSeed] = useState('');
  const [types, setTypes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set('days', days);
    if (level && level !== 'all') params.set('level', level);
    if (seed.trim()) params.set('seed', seed.trim());
    if (types.trim()) params.set('types', types.trim());
    return params.toString();
  }, [days, level, seed, types]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/gpt-bridge/logs?${queryString}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load logs');
        }
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        setLogs(data.logs || []);
        setStats(data.stats || { total: 0, warnRate: 0, avgTimingMs: 0 });
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load logs');
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [queryString]);

  const formatWarnRate = (rate: number) => `${Math.round(rate * 100)}%`;

  const handleCopyCurl = async (log: BridgeLog) => {
    const seedValue = log.seedRaw || log.seedNormalized;
    const params = new URLSearchParams({ seed: seedValue });
    if (log.typesRequested.length > 0) {
      params.set('types', log.typesRequested.join(','));
    }
    params.set('limit', String(log.limit));
    const curl = `curl "http://localhost:3000/api/gpt/grimoire/bridge?${params.toString()}" -H "Authorization: Bearer $LUNARY_GPT_SECRET"`;

    try {
      await navigator.clipboard.writeText(curl);
      setCopiedId(log.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      setCopiedId(null);
    }
  };

  return (
    <div className='min-h-screen bg-[#0b0b0f] text-white px-6 py-10'>
      <div className='max-w-6xl mx-auto space-y-8'>
        <header className='space-y-2'>
          <p className='text-xs uppercase tracking-[0.35em] text-white/50'>
            GPT Ops
          </p>
          <h1 className='text-3xl font-semibold'>Grimoire Bridge Logs</h1>
          <p className='text-sm text-white/60'>
            Monitor GPT bridge quality, timing, and zero-result rate.
          </p>
        </header>

        <section className='grid gap-4 sm:grid-cols-3'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Total Logs
            </p>
            <p className='mt-2 text-2xl font-semibold'>{stats.total}</p>
          </div>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Warn Rate
            </p>
            <p className='mt-2 text-2xl font-semibold'>
              {formatWarnRate(stats.warnRate)}
            </p>
          </div>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
            <p className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Avg Timing
            </p>
            <p className='mt-2 text-2xl font-semibold'>{stats.avgTimingMs}ms</p>
          </div>
        </section>

        <section className='rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='grid gap-4 md:grid-cols-4'>
            <label className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Range
              <select
                className='mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white'
                value={days}
                onChange={(event) => setDays(event.target.value)}
              >
                <option value='7'>Last 7 days</option>
                <option value='30'>Last 30 days</option>
              </select>
            </label>
            <label className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Level
              <select
                className='mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white'
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option value='all'>All</option>
                <option value='info'>Info</option>
                <option value='warn'>Warn</option>
                <option value='error'>Error</option>
              </select>
            </label>
            <label className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Seed Contains
              <input
                className='mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white'
                value={seed}
                onChange={(event) => setSeed(event.target.value)}
                placeholder='venus'
              />
            </label>
            <label className='text-xs uppercase tracking-[0.3em] text-white/50'>
              Types Includes
              <input
                className='mt-2 w-full rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm text-white'
                value={types}
                onChange={(event) => setTypes(event.target.value)}
                placeholder='tarot,crystal'
              />
            </label>
          </div>
        </section>

        <section className='rounded-2xl border border-white/10 bg-black/50'>
          <div className='flex items-center justify-between px-4 py-3 border-b border-white/10'>
            <p className='text-sm text-white/70'>
              {loading ? 'Loading logs…' : `${logs.length} entries`}
            </p>
            {error ? <p className='text-xs text-red-400'>{error}</p> : null}
          </div>
          <div className='overflow-x-auto'>
            <table className='min-w-full text-sm font-mono'>
              <thead className='text-xs uppercase tracking-[0.2em] text-white/40'>
                <tr className='text-left border-b border-white/10'>
                  <th className='px-4 py-3'>Created</th>
                  <th className='px-4 py-3'>Level</th>
                  <th className='px-4 py-3'>Seed</th>
                  <th className='px-4 py-3'>Types</th>
                  <th className='px-4 py-3'>Results</th>
                  <th className='px-4 py-3'>Curated</th>
                  <th className='px-4 py-3'>Alias</th>
                  <th className='px-4 py-3'>Search</th>
                  <th className='px-4 py-3'>Timing</th>
                  <th className='px-4 py-3'>Top Slugs</th>
                  <th className='px-4 py-3'>Test</th>
                </tr>
              </thead>
              <tbody className='text-white/80'>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className='border-b border-white/5 hover:bg-white/5'
                  >
                    <td className='px-4 py-3 whitespace-nowrap'>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className='px-4 py-3 uppercase'>{log.level}</td>
                    <td className='px-4 py-3'>{log.seedNormalized}</td>
                    <td className='px-4 py-3'>
                      {log.typesRequested.join(', ') || 'all'}
                    </td>
                    <td className='px-4 py-3'>{log.resultCount}</td>
                    <td className='px-4 py-3'>{log.curatedCount}</td>
                    <td className='px-4 py-3'>{log.aliasHit ? 'yes' : 'no'}</td>
                    <td className='px-4 py-3'>{log.searchCount}</td>
                    <td className='px-4 py-3'>{log.timingMs}ms</td>
                    <td className='px-4 py-3 text-xs'>
                      {log.topSlugs.join('\n') || '—'}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        className='rounded-lg border border-white/10 px-3 py-1 text-xs text-white/80 hover:bg-white/10'
                        onClick={() => handleCopyCurl(log)}
                      >
                        {copiedId === log.id ? 'Copied' : 'Copy curl'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && logs.length === 0 ? (
                  <tr>
                    <td
                      className='px-4 py-6 text-center text-white/40'
                      colSpan={11}
                    >
                      No logs found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
