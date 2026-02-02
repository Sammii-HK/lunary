'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Heart,
  Users,
  Star,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayInput } from '@/components/ui/birthday-input';

type RelationshipProfile = {
  id: string;
  name: string;
  relationship_type: string | null;
  birthday: string;
  birth_time: string | null;
  birth_location: string | null;
  notes: string | null;
  created_at: string;
};

type SynastryResult = {
  profileName: string;
  compatibilityScore: number;
  summary: string;
};

const RELATIONSHIP_TYPES = [
  { value: 'partner', label: 'Partner', icon: Heart },
  { value: 'friend', label: 'Friend', icon: Users },
  { value: 'family', label: 'Family', icon: Star },
  { value: 'other', label: 'Other', icon: Sparkles },
];

export function CircleTab() {
  const [profiles, setProfiles] = useState<RelationshipProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(
    null,
  );
  const [synastryLoading, setSynastryLoading] = useState(false);
  const [synastryError, setSynastryError] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('partner');
  const [formBirthday, setFormBirthday] = useState('');
  const [formBirthTime, setFormBirthTime] = useState('');
  const [formBirthLocation, setFormBirthLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    try {
      const response = await fetch('/api/relationships', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch profiles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleAddProfile = async () => {
    if (!formName || !formBirthday) return;

    setFormLoading(true);
    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formName,
          relationshipType: formType,
          birthday: formBirthday,
          birthTime: formBirthTime || null,
          birthLocation: formBirthLocation || null,
          notes: formNotes || null,
        }),
      });

      if (response.ok) {
        await fetchProfiles();
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add profile:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProfile = async (id: string) => {
    try {
      await fetch(`/api/relationships/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setProfiles(profiles.filter((p) => p.id !== id));
      if (selectedProfile === id) {
        setSelectedProfile(null);
        setSynastryResult(null);
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const handleViewSynastry = async (profileId: string) => {
    setSelectedProfile(profileId);
    setSynastryLoading(true);
    setSynastryError(null);
    setSynastryResult(null);

    try {
      const response = await fetch(`/api/relationships/${profileId}/synastry`, {
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to calculate synastry');
      }

      const data = await response.json();
      setSynastryResult(data);
    } catch (error) {
      setSynastryError(
        error instanceof Error ? error.message : 'Failed to calculate synastry',
      );
    } finally {
      setSynastryLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormType('partner');
    setFormBirthday('');
    setFormBirthTime('');
    setFormBirthLocation('');
    setFormNotes('');
  };

  const getRelationshipIcon = (type: string | null) => {
    const found = RELATIONSHIP_TYPES.find((t) => t.value === type);
    return found?.icon || Users;
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className='w-full max-w-3xl flex justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary' />
      </div>
    );
  }

  return (
    <div className='w-full max-w-3xl space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Your Circle</h2>
          <p className='text-sm text-zinc-400'>
            Add friends and family to explore cosmic compatibility
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant='lunary'
          size='sm'
          className='gap-1.5'
        >
          <Plus className='w-4 h-4' />
          Add Person
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5 space-y-4'>
          <h3 className='font-medium text-white'>Add to Your Circle</h3>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Name *
              </label>
              <input
                type='text'
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
                placeholder='Their name'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Relationship
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              >
                {RELATIONSHIP_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Birthday *
              </label>
              <BirthdayInput
                value={formBirthday}
                onChange={setFormBirthday}
                className='rounded-md border-zinc-600 bg-zinc-700 px-3 py-2 text-sm'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Birth Time (optional)
              </label>
              <input
                type='time'
                value={formBirthTime}
                onChange={(e) => setFormBirthTime(e.target.value)}
                className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              Birth Location (optional)
            </label>
            <input
              type='text'
              value={formBirthLocation}
              onChange={(e) => setFormBirthLocation(e.target.value)}
              className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary'
              placeholder='City, Country'
            />
          </div>

          <div className='space-y-2'>
            <label className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
              Notes (optional)
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              rows={2}
              className='w-full rounded-md border border-zinc-600 bg-zinc-700 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-lunary-primary resize-none'
              placeholder='Any notes about this person...'
            />
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              onClick={() => {
                resetForm();
                setShowAddForm(false);
              }}
              variant='outline'
              size='sm'
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddProfile}
              variant='lunary'
              size='sm'
              disabled={!formName || !formBirthday || formLoading}
            >
              {formLoading ? 'Adding...' : 'Add to Circle'}
            </Button>
          </div>
        </div>
      )}

      {/* Profiles List */}
      {profiles.length === 0 ? (
        <div className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'>
          <Users className='w-12 h-12 mx-auto text-zinc-600 mb-3' />
          <h3 className='text-lg font-medium text-zinc-300 mb-1'>
            Your circle is empty
          </h3>
          <p className='text-sm text-zinc-500 mb-4'>
            Add friends, partners, or family members to explore your cosmic
            connections
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            variant='lunary'
            size='sm'
            className='gap-1.5'
          >
            <Plus className='w-4 h-4' />
            Add Your First Person
          </Button>
        </div>
      ) : (
        <div className='space-y-3'>
          {profiles.map((profile) => {
            const Icon = getRelationshipIcon(profile.relationship_type);
            const isSelected = selectedProfile === profile.id;

            return (
              <div
                key={profile.id}
                className={`rounded-xl border bg-lunary-bg-deep/90 transition-all ${
                  isSelected
                    ? 'border-lunary-primary-600'
                    : 'border-zinc-700/70 hover:border-zinc-600'
                }`}
              >
                <div className='p-4 flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center'>
                    <Icon className='w-5 h-5 text-lunary-accent-300' />
                  </div>

                  <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-white truncate'>
                      {profile.name}
                    </h3>
                    <p className='text-xs text-zinc-400'>
                      {formatDate(profile.birthday)}
                      {profile.relationship_type && (
                        <span className='ml-2 text-zinc-500'>
                          {RELATIONSHIP_TYPES.find(
                            (t) => t.value === profile.relationship_type,
                          )?.label || profile.relationship_type}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => handleViewSynastry(profile.id)}
                      variant='outline'
                      size='sm'
                      className='gap-1 text-xs'
                    >
                      <Sparkles className='w-3.5 h-3.5' />
                      Compatibility
                      <ChevronRight className='w-3.5 h-3.5' />
                    </Button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className='p-2 text-zinc-500 hover:text-red-400 transition-colors'
                      title='Remove from circle'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>

                {/* Synastry Results */}
                {isSelected && (
                  <div className='border-t border-zinc-700/50 p-4'>
                    {synastryLoading ? (
                      <div className='flex items-center gap-3 text-sm text-zinc-400'>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-lunary-primary' />
                        Calculating cosmic compatibility...
                      </div>
                    ) : synastryError ? (
                      <div className='text-sm text-amber-400'>
                        {synastryError}
                      </div>
                    ) : synastryResult ? (
                      <div className='space-y-3'>
                        <div className='flex items-center gap-4'>
                          <div className='text-center'>
                            <div className='text-3xl font-bold text-lunary-accent-200'>
                              {synastryResult.compatibilityScore}%
                            </div>
                            <div className='text-xs text-zinc-400'>
                              Compatibility
                            </div>
                          </div>
                          <div className='flex-1'>
                            <div className='h-2 bg-zinc-700 rounded-full overflow-hidden'>
                              <div
                                className='h-full bg-gradient-to-r from-lunary-primary to-lunary-highlight transition-all duration-500'
                                style={{
                                  width: `${synastryResult.compatibilityScore}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                        <p className='text-sm text-zinc-300'>
                          {synastryResult.summary}
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Info Footer */}
      <p className='text-xs text-zinc-500 text-center'>
        Synastry compares birth charts to reveal how two people connect
        cosmically.
      </p>
    </div>
  );
}
