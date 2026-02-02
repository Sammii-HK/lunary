'use client';

import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  requiredTier: string[];
  isActive: boolean;
  releasedAt: string;
  createdAt: string;
};

const AVAILABLE_ICONS = ['Users', 'Sparkles', 'Star', 'Moon', 'Heart'];
const AVAILABLE_TIERS = [
  { value: 'lunary_plus', label: 'Lunary+' },
  { value: 'lunary_plus_ai', label: 'Lunary+ Pro' },
  { value: 'lunary_plus_ai_annual', label: 'Lunary+ Pro Annual' },
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Sparkles',
    ctaLabel: '',
    ctaHref: '',
    requiredTier: [] as string[],
    releasedAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/announcements');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setAnnouncements(data.announcements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: 'Sparkles',
      ctaLabel: '',
      ctaHref: '',
      requiredTier: [],
      releasedAt: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      description: announcement.description,
      icon: announcement.icon,
      ctaLabel: announcement.ctaLabel || '',
      ctaHref: announcement.ctaHref || '',
      requiredTier: announcement.requiredTier,
      releasedAt: new Date(announcement.releasedAt).toISOString().split('T')[0],
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    try {
      const url = '/api/admin/announcements';
      const method = editingId ? 'PATCH' : 'POST';
      const body = editingId ? { id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save');
      }

      const data = await response.json();

      if (editingId) {
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === editingId ? data.announcement : a)),
        );
        setFeedback('Announcement updated successfully.');
      } else {
        setAnnouncements((prev) => [data.announcement, ...prev]);
        setFeedback('Announcement created successfully.');
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const data = await response.json();
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? data.announcement : a)),
      );
      setFeedback(
        `Announcement ${isActive ? 'activated' : 'deactivated'} successfully.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const response = await fetch(`/api/admin/announcements?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      setFeedback('Announcement deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleTierToggle = (tier: string) => {
    setFormData((prev) => ({
      ...prev,
      requiredTier: prev.requiredTier.includes(tier)
        ? prev.requiredTier.filter((t) => t !== tier)
        : [...prev.requiredTier, tier],
    }));
  };

  return (
    <main className='flex flex-col min-h-screen w-full px-4 py-16'>
      <div className='mx-auto w-full max-w-4xl space-y-8'>
        <section className='space-y-3'>
          <p className='text-xs tracking-[0.4em] uppercase text-lunary-accent'>
            Feature Announcements
          </p>
          <h1 className='text-3xl font-semibold text-white'>
            Manage Announcements
          </h1>
          <p className='text-sm text-zinc-400'>
            Create and manage feature announcements shown to users on login.
            Users see one announcement per session, in release date order.
          </p>
        </section>

        {error && (
          <div className='rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
            {error}
          </div>
        )}

        {feedback && (
          <div className='rounded-2xl border border-lunary-success/60 bg-lunary-success/10 px-4 py-3 text-sm text-lunary-success'>
            {feedback}
          </div>
        )}

        {/* Add Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className='flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition'
          >
            <Plus className='w-4 h-4' />
            New Announcement
          </button>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-6 space-y-5'
          >
            <h2 className='text-lg font-medium text-white'>
              {editingId ? 'Edit Announcement' : 'New Announcement'}
            </h2>

            <div className='space-y-4'>
              <div>
                <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                  Title
                </label>
                <input
                  type='text'
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none'
                  placeholder='Friend Connections & Synastry'
                  required
                />
              </div>

              <div>
                <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none min-h-[80px]'
                  placeholder='Describe the feature and why users should care...'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, icon: e.target.value }))
                    }
                    className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none'
                  >
                    {AVAILABLE_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                    Release Date
                  </label>
                  <input
                    type='date'
                    value={formData.releasedAt}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        releasedAt: e.target.value,
                      }))
                    }
                    className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                    CTA Button Label (optional)
                  </label>
                  <input
                    type='text'
                    value={formData.ctaLabel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ctaLabel: e.target.value,
                      }))
                    }
                    className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none'
                    placeholder='Try It Now'
                  />
                </div>

                <div>
                  <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                    CTA Link (optional)
                  </label>
                  <input
                    type='text'
                    value={formData.ctaHref}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ctaHref: e.target.value,
                      }))
                    }
                    className='w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none'
                    placeholder='/profile?tab=circle'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs uppercase tracking-wider text-zinc-500 mb-1.5'>
                  Required Tier (leave empty for all users)
                </label>
                <div className='flex flex-wrap gap-2'>
                  {AVAILABLE_TIERS.map((tier) => (
                    <button
                      key={tier.value}
                      type='button'
                      onClick={() => handleTierToggle(tier.value)}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        formData.requiredTier.includes(tier.value)
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-zinc-600 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className='flex gap-3 pt-2'>
              <button
                type='submit'
                className='rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition'
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type='button'
                onClick={resetForm}
                className='rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition'
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {loading ? (
          <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-10 text-center text-sm text-zinc-400'>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className='rounded-3xl border border-zinc-800/60 bg-zinc-900/60 p-10 text-center text-sm text-zinc-400'>
            No announcements yet. Create one to get started.
          </div>
        ) : (
          <div className='space-y-4'>
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`rounded-3xl border bg-zinc-900/60 p-6 shadow-[0px_10px_25px_rgba(0,0,0,0.45)] ${
                  announcement.isActive
                    ? 'border-zinc-800/60'
                    : 'border-zinc-800/30 opacity-60'
                }`}
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-2'>
                      <h3 className='text-base font-medium text-white truncate'>
                        {announcement.title}
                      </h3>
                      {!announcement.isActive && (
                        <span className='text-xs text-zinc-500 uppercase'>
                          (inactive)
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-zinc-400 line-clamp-2 mb-3'>
                      {announcement.description}
                    </p>
                    <div className='flex flex-wrap items-center gap-3 text-xs text-zinc-500'>
                      <span>Icon: {announcement.icon}</span>
                      <span>
                        Released: {formatDate(announcement.releasedAt)}
                      </span>
                      {announcement.ctaLabel && (
                        <span>
                          CTA: {announcement.ctaLabel} → {announcement.ctaHref}
                        </span>
                      )}
                      {announcement.requiredTier.length > 0 && (
                        <span>
                          Tiers:{' '}
                          {announcement.requiredTier
                            .map(
                              (t) =>
                                AVAILABLE_TIERS.find((at) => at.value === t)
                                  ?.label || t,
                            )
                            .join(', ')}
                        </span>
                      )}
                      {announcement.requiredTier.length === 0 && (
                        <span>All users</span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() =>
                        toggleActive(announcement.id, !announcement.isActive)
                      }
                      className='p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition'
                      title={announcement.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.isActive ? (
                        <Eye className='w-4 h-4' />
                      ) : (
                        <EyeOff className='w-4 h-4' />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className='p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition'
                      title='Edit'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className='p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition'
                      title='Delete'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
