'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Plus,
  ArrowLeft,
  Shield,
  Zap,
  TrendingUp,
} from 'lucide-react';

interface ApiKeyData {
  id: string;
  keyPrefix: string;
  name: string;
  tier: string;
  requests: number;
  requestLimit: number;
  rateLimit: number;
  isActive: boolean;
  lastUsedAt: string | null;
  resetAt: string;
  createdAt: string;
}

const tierColors: Record<string, string> = {
  free: 'bg-zinc-500/20 text-zinc-300',
  starter: 'bg-lunary-secondary-900 text-lunary-secondary-300',
  developer: 'bg-purple-500/20 text-purple-300',
  business: 'bg-lunary-accent-900 text-lunary-accent-300',
};

export default function DeveloperDashboard() {
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  async function fetchApiKeys() {
    try {
      const res = await fetch('/api/developers/keys');
      if (!res.ok) throw new Error('Failed to fetch API keys');
      const data = await res.json();
      setApiKeys(data.keys || []);
    } catch {
      setError('Failed to load API keys. Please sign in.');
    } finally {
      setLoading(false);
    }
  }

  async function createNewKey() {
    try {
      const res = await fetch('/api/developers/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'API Key' }),
      });
      if (!res.ok) throw new Error('Failed to create API key');
      const data = await res.json();
      setNewKey(data.key);
      fetchApiKeys();
    } catch {
      setError('Failed to create API key');
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key?')) return;
    try {
      await fetch(`/api/developers/keys/${id}`, { method: 'DELETE' });
      fetchApiKeys();
    } catch {
      setError('Failed to delete API key');
    }
  }

  async function regenerateKey(id: string) {
    if (!confirm('Regenerating will invalidate your current key. Continue?'))
      return;
    try {
      const res = await fetch(`/api/developers/keys/${id}/regenerate`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to regenerate key');
      const data = await res.json();
      setNewKey(data.key);
      fetchApiKeys();
    } catch {
      setError('Failed to regenerate API key');
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(date: string | null) {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center'>
        <div className='animate-pulse text-zinc-400'>Loading...</div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <Link
          href='/developers'
          className='inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 mb-8'
        >
          <ArrowLeft className='h-4 w-4' />
          Back to Documentation
        </Link>

        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-light text-zinc-100 mb-2'>
              API Dashboard
            </h1>
            <p className='text-zinc-400'>
              Manage your API keys and monitor usage
            </p>
          </div>
          <button
            onClick={createNewKey}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
          >
            <Plus className='h-4 w-4' />
            Create API Key
          </button>
        </div>

        {error && (
          <div className='mb-6 p-4 rounded-lg bg-lunary-error/10 border border-lunary-error-700 text-lunary-error-300'>
            {error}
            <Link href='/sign-in' className='ml-2 underline'>
              Sign in
            </Link>
          </div>
        )}

        {newKey && (
          <div className='mb-6 p-4 rounded-lg bg-lunary-success/10 border border-lunary-success-700'>
            <div className='flex items-center gap-2 mb-2'>
              <Shield className='h-5 w-5 text-lunary-success' />
              <span className='font-medium text-lunary-success-300'>
                New API Key Created
              </span>
            </div>
            <p className='text-sm text-zinc-400 mb-3'>
              Copy this key now. You won&apos;t be able to see it again.
            </p>
            <div className='flex items-center gap-2'>
              <code className='flex-1 bg-zinc-800 px-3 py-2 rounded text-sm text-zinc-100 font-mono'>
                {newKey}
              </code>
              <button
                onClick={() => copyToClipboard(newKey)}
                className='p-2 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors'
              >
                {copied ? (
                  <Check className='h-4 w-4 text-lunary-success' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>
        )}

        <div className='space-y-4'>
          {apiKeys.length === 0 ? (
            <div className='text-center py-12 border border-zinc-800 rounded-lg bg-zinc-900/50'>
              <Key className='h-12 w-12 text-zinc-600 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-zinc-300 mb-2'>
                No API Keys
              </h3>
              <p className='text-zinc-500 mb-4'>
                Create your first API key to get started
              </p>
              <button
                onClick={createNewKey}
                className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-medium transition-colors'
              >
                <Plus className='h-4 w-4' />
                Create API Key
              </button>
            </div>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-start justify-between mb-4'>
                  <div className='flex items-center gap-3'>
                    <Key className='h-5 w-5 text-zinc-400' />
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-zinc-100'>
                          {key.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${tierColors[key.tier]}`}
                        >
                          {key.tier}
                        </span>
                      </div>
                      <code className='text-sm text-zinc-500'>
                        {key.keyPrefix}•••••••
                      </code>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => regenerateKey(key.id)}
                      className='p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors'
                      title='Regenerate key'
                    >
                      <RefreshCw className='h-4 w-4' />
                    </button>
                    <button
                      onClick={() => deleteKey(key.id)}
                      className='p-2 rounded hover:bg-zinc-800 text-zinc-400 hover:text-lunary-error transition-colors'
                      title='Delete key'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                </div>

                <div className='grid grid-cols-3 gap-4'>
                  <div className='p-3 rounded bg-zinc-800/50'>
                    <div className='flex items-center gap-2 text-xs text-zinc-500 mb-1'>
                      <TrendingUp className='h-3 w-3' />
                      Monthly Usage
                    </div>
                    <div className='text-lg font-medium text-zinc-100'>
                      {key.requests.toLocaleString()} /{' '}
                      {key.requestLimit.toLocaleString()}
                    </div>
                    <div className='mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden'>
                      <div
                        className='h-full bg-purple-500 rounded-full transition-all'
                        style={{
                          width: `${Math.min(100, (key.requests / key.requestLimit) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className='p-3 rounded bg-zinc-800/50'>
                    <div className='flex items-center gap-2 text-xs text-zinc-500 mb-1'>
                      <Zap className='h-3 w-3' />
                      Rate Limit
                    </div>
                    <div className='text-lg font-medium text-zinc-100'>
                      {key.rateLimit} req/min
                    </div>
                  </div>

                  <div className='p-3 rounded bg-zinc-800/50'>
                    <div className='text-xs text-zinc-500 mb-1'>Last Used</div>
                    <div className='text-lg font-medium text-zinc-100'>
                      {formatDate(key.lastUsedAt)}
                    </div>
                  </div>
                </div>

                <div className='mt-4 text-xs text-zinc-500'>
                  Created {formatDate(key.createdAt)} • Resets{' '}
                  {formatDate(key.resetAt)}
                </div>
              </div>
            ))
          )}
        </div>

        <div className='mt-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
          <h2 className='text-lg font-medium text-zinc-100 mb-4'>
            Upgrade Your Plan
          </h2>
          <div className='grid md:grid-cols-4 gap-4'>
            {(['free', 'starter', 'developer', 'business'] as const).map(
              (tier) => {
                const prices = {
                  free: 0,
                  starter: 9,
                  developer: 29,
                  business: 99,
                };
                const limits = {
                  free: '100',
                  starter: '5K',
                  developer: '25K',
                  business: '100K',
                };
                return (
                  <div
                    key={tier}
                    className='p-4 rounded-lg border border-zinc-700 hover:border-purple-500/50 transition-colors'
                  >
                    <div
                      className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${tierColors[tier]}`}
                    >
                      {tier}
                    </div>
                    <div className='text-2xl font-light text-zinc-100 mb-1'>
                      ${prices[tier]}
                      <span className='text-sm text-zinc-500'>/mo</span>
                    </div>
                    <div className='text-sm text-zinc-400'>
                      {limits[tier]} requests/mo
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
