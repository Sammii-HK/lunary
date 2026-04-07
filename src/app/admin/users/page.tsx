'use client';

import { useState, useEffect } from 'react';

type UnverifiedUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

type UserResult = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    createdAt: string;
  };
  pendingVerification: {
    expiresAt: string;
    expired: boolean;
  } | null;
};

type BulkResult = {
  email: string;
  success: boolean;
  error?: string;
};

export default function UsersAdminPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [result, setResult] = useState<UserResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [unverified, setUnverified] = useState<UnverifiedUser[]>([]);
  const [unverifiedLoading, setUnverifiedLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        setUnverified(d.users ?? []);
        setSelected(
          new Set((d.users ?? []).map((u: UnverifiedUser) => u.email)),
        );
      })
      .catch(() => {})
      .finally(() => setUnverifiedLoading(false));
  }, []);

  const lookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setActionMessage(null);
    try {
      const res = await fetch(
        `/api/admin/users?email=${encodeURIComponent(email.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Lookup failed');
      else setResult(data);
    } catch {
      setError('Request failed');
    } finally {
      setLoading(false);
    }
  };

  const doAction = async (action: 'verify' | 'resend') => {
    if (!result) return;
    setActionLoading(action);
    setActionMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: result.user.email, action }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Action failed');
      else {
        setActionMessage(data.message);
        if (action === 'verify') {
          setResult((prev) =>
            prev
              ? {
                  ...prev,
                  user: { ...prev.user, emailVerified: true },
                  pendingVerification: null,
                }
              : prev,
          );
        }
      }
    } catch {
      setError('Request failed');
    } finally {
      setActionLoading(null);
    }
  };

  const toggleAll = () => {
    if (selected.size === unverified.length) setSelected(new Set());
    else setSelected(new Set(unverified.map((u) => u.email)));
  };

  const toggleOne = (email: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  };

  const sendBulk = async () => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    setBulkResults(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk-resend',
          emails: Array.from(selected),
          email: '',
        }),
      });
      const data = await res.json();
      setBulkResults(data.results ?? []);
      // Remove successfully sent from the list
      if (data.results) {
        const sent = new Set(
          data.results
            .filter((r: BulkResult) => r.success)
            .map((r: BulkResult) => r.email),
        );
        setUnverified((prev) => prev.filter((u) => !sent.has(u.email)));
        setSelected((prev) => {
          const next = new Set(prev);
          sent.forEach((e) => next.delete(e as string));
          return next;
        });
      }
    } catch {
      setBulkResults([
        { email: 'all', success: false, error: 'Request failed' },
      ]);
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-2xl space-y-10'>
        {/* Unverified users */}
        <section>
          <div className='mb-4'>
            <h1 className='text-2xl font-semibold'>Unverified users</h1>
            <p className='text-sm text-zinc-400 mt-1'>
              Users who signed up but never received a verification email.
            </p>
          </div>

          {unverifiedLoading ? (
            <p className='text-sm text-zinc-500'>Loading…</p>
          ) : unverified.length === 0 && !bulkResults ? (
            <p className='text-sm text-zinc-500'>No unverified users.</p>
          ) : (
            <>
              {unverified.length > 0 && (
                <div className='bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-4'>
                  <div className='flex items-center justify-between px-4 py-3 border-b border-zinc-800'>
                    <label className='flex items-center gap-2 text-sm text-zinc-400 cursor-pointer select-none'>
                      <input
                        type='checkbox'
                        checked={
                          selected.size === unverified.length &&
                          unverified.length > 0
                        }
                        onChange={toggleAll}
                        className='accent-indigo-500'
                      />
                      {selected.size} of {unverified.length} selected
                    </label>
                    <button
                      onClick={sendBulk}
                      disabled={bulkLoading || selected.size === 0}
                      className='px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-medium transition-colors'
                    >
                      {bulkLoading
                        ? 'Sending…'
                        : `Send ${selected.size} verification email${selected.size !== 1 ? 's' : ''}`}
                    </button>
                  </div>

                  {unverified.map((u) => (
                    <label
                      key={u.id}
                      className='flex items-center gap-3 px-4 py-3 border-b border-zinc-800/60 last:border-0 cursor-pointer hover:bg-zinc-800/40 transition-colors'
                    >
                      <input
                        type='checkbox'
                        checked={selected.has(u.email)}
                        onChange={() => toggleOne(u.email)}
                        className='accent-indigo-500 shrink-0'
                      />
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm font-medium truncate'>
                          {u.name || '(no name)'}
                        </p>
                        <p className='text-xs text-zinc-400 truncate'>
                          {u.email}
                        </p>
                      </div>
                      <span className='shrink-0 text-xs text-zinc-500'>
                        {new Date(u.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {bulkResults && (
                <div className='space-y-1.5'>
                  {bulkResults.map((r) => (
                    <div
                      key={r.email}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${
                        r.success
                          ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                          : 'bg-red-950 border border-red-800 text-red-300'
                      }`}
                    >
                      <span className='truncate'>{r.email}</span>
                      <span className='shrink-0 ml-3'>
                        {r.success ? '✓ sent' : `✗ ${r.error}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>

        <hr className='border-zinc-800' />

        {/* Single user lookup */}
        <section>
          <div className='mb-4'>
            <h2 className='text-lg font-semibold'>Look up a user</h2>
            <p className='text-sm text-zinc-400 mt-1'>
              Find a specific user, manually verify their address, or resend
              their email.
            </p>
          </div>

          <div className='flex gap-2'>
            <input
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              placeholder='user@example.com'
              className='flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500'
            />
            <button
              onClick={lookup}
              disabled={loading || !email.trim()}
              className='px-4 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
            >
              {loading ? 'Looking up…' : 'Look up'}
            </button>
          </div>

          {error && (
            <div className='mt-4 p-3 bg-red-950 border border-red-800 rounded-lg text-sm text-red-300'>
              {error}
            </div>
          )}

          {actionMessage && (
            <div className='mt-4 p-3 bg-emerald-950 border border-emerald-800 rounded-lg text-sm text-emerald-300'>
              {actionMessage}
            </div>
          )}

          {result && (
            <div className='mt-4 space-y-4'>
              <div className='bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3'>
                <div className='flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-medium'>
                      {result.user.name || '(no name)'}
                    </p>
                    <p className='text-sm text-zinc-400'>{result.user.email}</p>
                  </div>
                  <span
                    className={`shrink-0 text-xs px-2.5 py-1 rounded-full font-medium ${
                      result.user.emailVerified
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}
                  >
                    {result.user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div className='text-xs text-zinc-500 space-y-1'>
                  <p>ID: {result.user.id}</p>
                  <p>
                    Created:{' '}
                    {new Date(result.user.createdAt).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                {result.pendingVerification && (
                  <div
                    className={`text-xs px-3 py-2 rounded-lg ${
                      result.pendingVerification.expired
                        ? 'bg-red-950 text-red-400 border border-red-900'
                        : 'bg-blue-950 text-blue-400 border border-blue-900'
                    }`}
                  >
                    {result.pendingVerification.expired
                      ? 'Token expired'
                      : 'Token pending'}{' '}
                    {new Date(
                      result.pendingVerification.expiresAt,
                    ).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                )}
              </div>

              <div className='flex gap-3'>
                {!result.user.emailVerified && (
                  <button
                    onClick={() => doAction('verify')}
                    disabled={actionLoading !== null}
                    className='flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
                  >
                    {actionLoading === 'verify'
                      ? 'Verifying…'
                      : 'Mark as verified'}
                  </button>
                )}
                <button
                  onClick={() => doAction('resend')}
                  disabled={actionLoading !== null}
                  className='flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors'
                >
                  {actionLoading === 'resend'
                    ? 'Sending…'
                    : 'Resend verification email'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
