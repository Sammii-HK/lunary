'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Heart,
  Users,
  Star,
  Trash2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Link2,
  Copy,
  Check,
  UserPlus,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BirthdayInput } from '@/components/ui/birthday-input';
import { UpgradePrompt } from '@/components/UpgradePrompt';
import { CircleLeaderboard } from '@/components/CircleLeaderboard';
import { CircleInviteCTA } from '@/components/CircleInviteCTA';

type Friend = {
  id: string;
  friendId: string;
  name: string;
  avatar?: string;
  sunSign?: string;
  relationshipType?: string;
  synastryScore?: number;
  connectedAt: string;
};

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

type SynastryAspect = {
  person1Planet: string;
  person2Planet: string;
  aspectType: string;
  orb: number;
  isHarmonious: boolean;
};

type ElementBalance = {
  fire: { person1: number; person2: number; combined: number };
  earth: { person1: number; person2: number; combined: number };
  air: { person1: number; person2: number; combined: number };
  water: { person1: number; person2: number; combined: number };
  compatibility: 'complementary' | 'similar' | 'challenging';
};

type ModalityBalance = {
  cardinal: { person1: number; person2: number; combined: number };
  fixed: { person1: number; person2: number; combined: number };
  mutable: { person1: number; person2: number; combined: number };
  compatibility: 'complementary' | 'similar' | 'challenging';
};

type SynastryResult = {
  compatibilityScore: number;
  summary: string;
  aspects?: SynastryAspect[];
  elementBalance?: ElementBalance;
  modalityBalance?: ModalityBalance;
};

const RELATIONSHIP_TYPES = [
  { value: 'partner', label: 'Partner', icon: Heart },
  { value: 'friend', label: 'Friend', icon: Users },
  { value: 'family', label: 'Family', icon: Star },
  { value: 'other', label: 'Other', icon: Sparkles },
];

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '\u260C',
  opposition: '\u260D',
  trine: '\u25B3',
  square: '\u25A1',
  sextile: '\u26B9',
  quincunx: '\u26BB',
};

export function CircleTab() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [profiles, setProfiles] = useState<RelationshipProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [requiresUpgrade, setRequiresUpgrade] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'friend' | 'profile';
    id: string;
  } | null>(null);
  const [synastryResult, setSynastryResult] = useState<SynastryResult | null>(
    null,
  );
  const [synastryLoading, setSynastryLoading] = useState(false);
  const [synastryError, setSynastryError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [inviteUpgradeRequired, setInviteUpgradeRequired] = useState(false);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('partner');
  const [formBirthday, setFormBirthday] = useState('');
  const [formBirthTime, setFormBirthTime] = useState('');
  const [formBirthLocation, setFormBirthLocation] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [friendsRes, profilesRes] = await Promise.all([
        fetch('/api/friends', { credentials: 'include' }),
        fetch('/api/relationships', { credentials: 'include' }),
      ]);

      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
        setRequiresUpgrade(false);
      } else if (friendsRes.status === 403) {
        const data = await friendsRes.json();
        if (data.requiresUpgrade) {
          setRequiresUpgrade(true);
        }
      }

      if (profilesRes.ok) {
        const profilesData = await profilesRes.json();
        setProfiles(profilesData.profiles || []);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const generateInviteLink = async () => {
    setGeneratingInvite(true);
    setInviteUpgradeRequired(false);
    try {
      const response = await fetch('/api/friends/invite', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        setInviteUrl(data.inviteUrl);
      } else if (response.status === 403 && data.requiresUpgrade) {
        setInviteUpgradeRequired(true);
      }
    } catch (error) {
      console.error('Failed to generate invite:', error);
    } finally {
      setGeneratingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

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
        }),
      });

      if (response.ok) {
        await fetchData();
        setFormName('');
        setFormType('partner');
        setFormBirthday('');
        setFormBirthTime('');
        setFormBirthLocation('');
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
      if (selectedItem?.type === 'profile' && selectedItem.id === id) {
        setSelectedItem(null);
        setSynastryResult(null);
      }
    } catch (error) {
      console.error('Failed to delete profile:', error);
    }
  };

  const handleRemoveFriend = async (id: string) => {
    try {
      await fetch(`/api/friends/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setFriends(friends.filter((f) => f.id !== id));
      if (selectedItem?.type === 'friend' && selectedItem.id === id) {
        setSelectedItem(null);
        setSynastryResult(null);
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
    }
  };

  const handleViewSynastry = async (type: 'friend' | 'profile', id: string) => {
    setSelectedItem({ type, id });
    setSynastryLoading(true);
    setSynastryError(null);
    setSynastryResult(null);

    try {
      const endpoint =
        type === 'friend'
          ? `/api/friends/${id}`
          : `/api/relationships/${id}/synastry`;

      const response = await fetch(endpoint, { credentials: 'include' });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to calculate synastry');
      }

      const data = await response.json();
      const synastry = type === 'friend' ? data.synastry : data;

      if (synastry) {
        setSynastryResult({
          compatibilityScore: synastry.compatibilityScore,
          summary: synastry.summary,
          aspects: synastry.aspects,
          elementBalance: synastry.elementBalance,
          modalityBalance: synastry.modalityBalance,
        });
      } else {
        setSynastryError('Birth chart data required for synastry');
      }
    } catch (error) {
      setSynastryError(
        error instanceof Error ? error.message : 'Failed to calculate synastry',
      );
    } finally {
      setSynastryLoading(false);
    }
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

  // Show upgrade prompt if user doesn't have access to friend features
  if (requiresUpgrade) {
    return (
      <div className='w-full max-w-3xl space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>Your Circle</h2>
            <p className='text-sm text-zinc-400'>
              Connect with friends and explore cosmic compatibility
            </p>
          </div>
        </div>

        <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-6'>
          <div className='text-center space-y-4'>
            <div className='w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-lunary-primary-800 to-lunary-highlight-800 flex items-center justify-center'>
              <Users className='w-8 h-8 text-lunary-accent-200' />
            </div>
            <div>
              <h3 className='text-xl font-semibold text-white mb-2'>
                Unlock Friend Connections
              </h3>
              <p className='text-sm text-zinc-400 max-w-md mx-auto'>
                Connect with friends on Lunary to see your synastry
                compatibility, shared cosmic events, and the best times to
                connect.
              </p>
            </div>
            <div className='flex flex-wrap justify-center gap-3 text-xs text-zinc-400'>
              <span className='flex items-center gap-1'>
                <Sparkles className='w-3.5 h-3.5 text-lunary-accent-300' />
                Synastry Analysis
              </span>
              <span className='flex items-center gap-1'>
                <Heart className='w-3.5 h-3.5 text-lunary-accent-300' />
                Compatibility Score
              </span>
              <span className='flex items-center gap-1'>
                <Link2 className='w-3.5 h-3.5 text-lunary-accent-300' />
                Invite Links
              </span>
            </div>
            <UpgradePrompt
              variant='inline'
              featureName='friend_connections'
              title='Upgrade to Lunary+'
              description='Get friend connections, synastry analysis, and more'
            />
          </div>
        </div>

        {/* Still show manual entries section for free users */}
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-medium text-zinc-400'>
              Manual Entries (Free)
            </h3>
            <p className='text-xs text-zinc-500'>
              Add birth data manually for basic synastry
            </p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant='outline'
            size='sm'
            className='gap-1.5'
          >
            <Plus className='w-4 h-4' />
            Add Manual
          </Button>
        </div>

        {showAddForm && (
          <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5 space-y-4'>
            <h3 className='font-medium text-white'>Add Someone Manually</h3>

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

            <div className='flex justify-end gap-2'>
              <Button
                onClick={() => setShowAddForm(false)}
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
                {formLoading ? 'Adding...' : 'Add Person'}
              </Button>
            </div>
          </div>
        )}

        {profiles.length > 0 && (
          <div className='space-y-3'>
            {profiles.map((profile) => {
              const isSelected =
                selectedItem?.type === 'profile' &&
                selectedItem.id === profile.id;
              const Icon =
                RELATIONSHIP_TYPES.find(
                  (t) => t.value === profile.relationship_type,
                )?.icon || Users;

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
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        onClick={() =>
                          handleViewSynastry('profile', profile.id)
                        }
                        variant='outline'
                        size='sm'
                        className='gap-1 text-xs'
                      >
                        <Sparkles className='w-3.5 h-3.5' />
                        Synastry
                        {isSelected ? (
                          <ChevronDown className='w-3.5 h-3.5' />
                        ) : (
                          <ChevronRight className='w-3.5 h-3.5' />
                        )}
                      </Button>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className='p-2 text-zinc-500 hover:text-red-400 transition-colors'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                  {isSelected && (
                    <SynastryPanel
                      loading={synastryLoading}
                      error={synastryError}
                      result={synastryResult}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const hasAnyConnections = friends.length > 0 || profiles.length > 0;

  return (
    <div className='w-full max-w-3xl space-y-6'>
      {/* Leaderboard & Invite CTA at top */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <CircleLeaderboard />
        <CircleInviteCTA />
      </div>

      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-semibold text-white'>Your Circle</h2>
          <p className='text-sm text-zinc-400'>
            Connect with friends or add birth data manually
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={() => setShowInviteSection(!showInviteSection)}
            variant='outline'
            size='sm'
            className='gap-1.5'
          >
            <Link2 className='w-4 h-4' />
            Invite
          </Button>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant='lunary'
            size='sm'
            className='gap-1.5'
          >
            <Plus className='w-4 h-4' />
            Add Manual
          </Button>
        </div>
      </div>

      {showInviteSection && (
        <div className='rounded-xl border border-lunary-primary-700/50 bg-gradient-to-r from-lunary-primary-900/30 to-lunary-highlight-900/30 p-5 space-y-4'>
          <div className='flex items-start gap-3'>
            <div className='w-10 h-10 rounded-full bg-lunary-primary-800/50 flex items-center justify-center'>
              <UserPlus className='w-5 h-5 text-lunary-accent-300' />
            </div>
            <div className='flex-1'>
              <h3 className='font-medium text-white'>Invite Friends</h3>
              <p className='text-sm text-zinc-400'>
                Share a link to connect with friends on Lunary
              </p>
            </div>
          </div>

          {inviteUpgradeRequired ? (
            <div className='space-y-3'>
              <div className='flex items-center gap-2 text-amber-400 text-sm'>
                <Lock className='w-4 h-4' />
                Friend invites require a Lunary+ subscription
              </div>
              <UpgradePrompt
                variant='inline'
                featureName='friend_connections'
                title='Unlock Friend Connections'
                description='Connect with friends and see your cosmic compatibility'
              />
            </div>
          ) : inviteUrl ? (
            <div className='flex gap-2'>
              <input
                type='text'
                value={inviteUrl}
                readOnly
                className='flex-1 rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-300'
              />
              <Button
                onClick={copyInviteLink}
                variant='lunary'
                size='sm'
                className='gap-1.5'
              >
                {inviteCopied ? (
                  <>
                    <Check className='w-4 h-4' />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className='w-4 h-4' />
                    Copy
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button
              onClick={generateInviteLink}
              variant='lunary'
              size='sm'
              disabled={generatingInvite}
              className='gap-1.5'
            >
              <Link2 className='w-4 h-4' />
              {generatingInvite ? 'Generating...' : 'Generate Invite Link'}
            </Button>
          )}
        </div>
      )}

      {showAddForm && (
        <div className='rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 p-5 space-y-4'>
          <h3 className='font-medium text-white'>Add Someone Manually</h3>

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

          <div className='flex justify-end gap-2'>
            <Button
              onClick={() => setShowAddForm(false)}
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
              {formLoading ? 'Adding...' : 'Add Person'}
            </Button>
          </div>
        </div>
      )}

      {!hasAnyConnections && (
        <div className='rounded-xl border-2 border-dashed border-zinc-700 p-8 text-center'>
          <Users className='w-12 h-12 mx-auto text-zinc-600 mb-3' />
          <h3 className='text-lg font-medium text-zinc-300 mb-1'>
            Your circle is empty
          </h3>
          <p className='text-sm text-zinc-500 mb-4'>
            Invite friends or add birth data manually
          </p>
          <div className='flex justify-center gap-2'>
            <Button
              onClick={() => setShowInviteSection(true)}
              variant='outline'
              size='sm'
              className='gap-1.5'
            >
              <Link2 className='w-4 h-4' />
              Invite Friends
            </Button>
            <Button
              onClick={() => setShowAddForm(true)}
              variant='lunary'
              size='sm'
              className='gap-1.5'
            >
              <Plus className='w-4 h-4' />
              Add Manually
            </Button>
          </div>
        </div>
      )}

      {friends.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-zinc-400 uppercase tracking-wide'>
            Connected Friends
          </h3>
          {friends.map((friend) => {
            const Icon =
              RELATIONSHIP_TYPES.find(
                (t) => t.value === friend.relationshipType,
              )?.icon || Users;

            return (
              <Link
                key={friend.id}
                href={`/profile/friends/${friend.id}`}
                className='block rounded-xl border border-zinc-700/70 bg-lunary-bg-deep/90 hover:border-lunary-primary-600 transition-all'
              >
                <div className='p-4 flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center'>
                    <Icon className='w-5 h-5 text-lunary-accent-300' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='font-medium text-white truncate'>
                      {friend.name}
                    </h3>
                    <p className='text-xs text-zinc-400'>
                      {friend.sunSign}
                      <span className='ml-2 text-lunary-primary-400'>
                        Connected
                      </span>
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    {friend.synastryScore && (
                      <div className='text-center mr-2'>
                        <div className='text-lg font-bold text-lunary-accent-200'>
                          {friend.synastryScore}%
                        </div>
                        <div className='text-[10px] text-zinc-500'>Match</div>
                      </div>
                    )}
                    <div className='flex items-center gap-1 text-xs text-zinc-400'>
                      View Profile
                      <ExternalLink className='w-3.5 h-3.5' />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveFriend(friend.id);
                      }}
                      className='p-2 text-zinc-500 hover:text-red-400 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {profiles.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-sm font-medium text-zinc-400 uppercase tracking-wide'>
            Manual Entries
          </h3>
          {profiles.map((profile) => {
            const isSelected =
              selectedItem?.type === 'profile' &&
              selectedItem.id === profile.id;
            const Icon =
              RELATIONSHIP_TYPES.find(
                (t) => t.value === profile.relationship_type,
              )?.icon || Users;

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
                    </p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      onClick={() => handleViewSynastry('profile', profile.id)}
                      variant='outline'
                      size='sm'
                      className='gap-1 text-xs'
                    >
                      <Sparkles className='w-3.5 h-3.5' />
                      Synastry
                      {isSelected ? (
                        <ChevronDown className='w-3.5 h-3.5' />
                      ) : (
                        <ChevronRight className='w-3.5 h-3.5' />
                      )}
                    </Button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      className='p-2 text-zinc-500 hover:text-red-400 transition-colors'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
                {isSelected && (
                  <SynastryPanel
                    loading={synastryLoading}
                    error={synastryError}
                    result={synastryResult}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className='text-xs text-zinc-500 text-center'>
        Synastry compares birth charts to reveal cosmic compatibility.
      </p>
    </div>
  );
}

function SynastryPanel({
  loading,
  error,
  result,
}: {
  loading: boolean;
  error: string | null;
  result: SynastryResult | null;
}) {
  const [showAspects, setShowAspects] = useState(false);

  return (
    <div className='border-t border-zinc-700/50 p-4'>
      {loading ? (
        <div className='flex items-center gap-3 text-sm text-zinc-400'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-lunary-primary' />
          Calculating cosmic compatibility...
        </div>
      ) : error ? (
        <div className='text-sm text-amber-400'>{error}</div>
      ) : result ? (
        <div className='space-y-4'>
          <div className='flex items-start gap-4'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-lunary-accent-200'>
                {result.compatibilityScore}%
              </div>
              <div className='text-xs text-zinc-400'>Compatibility</div>
            </div>
            <div className='flex-1'>
              <div className='h-2 bg-zinc-700 rounded-full overflow-hidden mb-2'>
                <div
                  className='h-full bg-gradient-to-r from-lunary-primary to-lunary-highlight'
                  style={{ width: `${result.compatibilityScore}%` }}
                />
              </div>
              <p className='text-sm text-zinc-300'>{result.summary}</p>
            </div>
          </div>

          {result.elementBalance && (
            <div className='space-y-2'>
              <h4 className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Element Balance
              </h4>
              <div className='grid grid-cols-4 gap-2'>
                {(['fire', 'earth', 'air', 'water'] as const).map((el) => {
                  const data = result.elementBalance![el];
                  const colors: Record<string, string> = {
                    fire: 'from-red-500 to-orange-500',
                    earth: 'from-green-600 to-emerald-500',
                    air: 'from-sky-400 to-blue-400',
                    water: 'from-blue-500 to-indigo-500',
                  };
                  return (
                    <div
                      key={el}
                      className='rounded-lg bg-zinc-800/50 p-2 text-center'
                    >
                      <div
                        className={`text-lg font-bold bg-gradient-to-r ${colors[el]} bg-clip-text text-transparent`}
                      >
                        {data.combined}
                      </div>
                      <div className='text-[10px] text-zinc-400 capitalize'>
                        {el}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.modalityBalance && (
            <div className='space-y-2'>
              <h4 className='text-xs font-semibold uppercase tracking-wide text-zinc-400'>
                Modality Balance
              </h4>
              <div className='grid grid-cols-3 gap-2'>
                {(['cardinal', 'fixed', 'mutable'] as const).map((mod) => {
                  const data = result.modalityBalance![mod];
                  return (
                    <div
                      key={mod}
                      className='rounded-lg bg-zinc-800/50 p-2 text-center'
                    >
                      <div className='text-lg font-bold text-zinc-200'>
                        {data.combined}
                      </div>
                      <div className='text-[10px] text-zinc-400 capitalize'>
                        {mod}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {result.aspects && result.aspects.length > 0 && (
            <div className='space-y-2'>
              <button
                onClick={() => setShowAspects(!showAspects)}
                className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 hover:text-zinc-300'
              >
                Key Aspects ({result.aspects.length})
                {showAspects ? (
                  <ChevronDown className='w-3 h-3' />
                ) : (
                  <ChevronRight className='w-3 h-3' />
                )}
              </button>

              {showAspects && (
                <div className='space-y-1'>
                  {result.aspects.slice(0, 8).map((aspect, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                        aspect.isHarmonious
                          ? 'bg-green-900/20 text-green-300'
                          : 'bg-red-900/20 text-red-300'
                      }`}
                    >
                      <span className='font-mono'>
                        {ASPECT_SYMBOLS[aspect.aspectType] || '\u25CF'}
                      </span>
                      <span>
                        Your {aspect.person1Planet} {aspect.aspectType} their{' '}
                        {aspect.person2Planet}
                      </span>
                      <span className='text-zinc-500 ml-auto'>
                        {aspect.orb.toFixed(1)}°
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
