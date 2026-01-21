'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Sparkles,
  Moon,
  Star,
  Brain,
  Trash2,
  Feather,
  MessageCircle,
} from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import {
  extractMoodTags,
  extractCardReferences,
} from '@/lib/journal/extract-moments';
import { LifeThemeBanner } from '@/components/journal/LifeThemeBanner';
import { ArchetypeBar } from '@/components/journal/ArchetypeBar';
import { DreamTagChips } from '@/components/journal/DreamTagChips';
import { PremiumPathway } from '@/components/PremiumPathway';

interface JournalEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase?: string;
  source: string;
  createdAt: string;
  category?: 'journal' | 'dream' | 'ritual';
}

interface DreamEntry {
  id: number;
  content: string;
  moodTags: string[];
  moonPhase?: string;
  source: string;
  createdAt: string;
  dreamTags: string[];
}

interface UserMemory {
  id: number;
  category: string;
  fact: string;
  confidence: number;
  mentionedCount: number;
  lastMentionedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  relationship: 'Relationships',
  work: 'Work & Career',
  interest: 'Interests',
  concern: 'Concerns',
  preference: 'Preferences',
  life_event: 'Life Events',
  goal: 'Goals',
};

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='border-l-2 border-lunary-primary-700 pl-4 py-3'>
      <div className='flex items-center gap-2 mb-1.5'>
        <span className='text-sm text-zinc-400'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-zinc-500 flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'chat' && (
          <span className='text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded'>
            from chat
          </span>
        )}
        {entry.category === 'ritual' && (
          <span className='text-xs bg-lunary-accent/20 text-lunary-accent px-2 py-0.5 rounded'>
            Ritual
          </span>
        )}
      </div>
      <p className='text-white text-sm leading-relaxed'>{entry.content}</p>
      {(entry.moodTags.length > 0 || entry.cardReferences.length > 0) && (
        <div className='flex flex-wrap gap-1.5 mt-2'>
          {entry.moodTags.map((tag) => (
            <span
              key={tag}
              className='text-xs bg-lunary-primary-900/50 text-lunary-primary-300 px-2 py-0.5 rounded'
            >
              {tag}
            </span>
          ))}
          {entry.cardReferences.map((card) => (
            <span
              key={card}
              className='text-xs bg-lunary-primary-900/50 text-lunary-primary-300 px-2 py-0.5 rounded flex items-center gap-1'
            >
              <Star className='w-3 h-3' />
              {card}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DreamCard({ entry }: { entry: DreamEntry }) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='border-l-2 border-indigo-600 pl-4 py-3'>
      <div className='flex items-center gap-2 mb-1.5'>
        <span className='text-sm text-zinc-400'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-zinc-500 flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'astral-guide' && (
          <span className='text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded'>
            via guide
          </span>
        )}
      </div>
      <p className='text-white text-sm leading-relaxed line-clamp-3'>
        {entry.content}
      </p>
      <DreamTagChips entry={entry} className='mt-2' />
    </div>
  );
}

function MemoryCard({
  memory,
  onDelete,
}: {
  memory: UserMemory;
  onDelete: (id: number) => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <div className='flex items-start justify-between gap-3 py-2 border-b border-zinc-800 last:border-0'>
        <div className='flex-1'>
          <span className='text-xs text-lunary-primary-400 uppercase tracking-wide'>
            {CATEGORY_LABELS[memory.category] || memory.category}
          </span>
          <p className='text-white text-sm mt-0.5'>{memory.fact}</p>
          <span className='text-xs text-zinc-400'>
            Mentioned {memory.mentionedCount}x
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className='p-2 text-zinc-400 hover:text-lunary-error transition-colors'
          aria-label='Delete memory'
        >
          <Trash2 className='w-4 h-4' />
        </button>
      </div>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        size='sm'
      >
        <ModalHeader>Delete this memory?</ModalHeader>
        <ModalBody>
          <p className='text-zinc-400 text-sm'>
            Lunary will forget: "{memory.fact}"
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onDelete(memory.id);
              setShowConfirm(false);
            }}
            className='bg-lunary-error-600 hover:bg-lunary-error-700'
          >
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

type TabId = 'journal' | 'dreams' | 'memories' | 'patterns' | 'ritual';

const VALID_TAB_IDS: TabId[] = [
  'journal',
  'dreams',
  'memories',
  'patterns',
  'ritual',
];

const normalizeTab = (tab: string | null): TabId =>
  VALID_TAB_IDS.includes(tab as TabId) ? (tab as TabId) : 'journal';

export default function BookOfShadowsPage() {
  const { user, loading: authLoading } = useAuthStatus();
  const searchParams = useSearchParams();
  const queryTabParam = searchParams.get('tab');
  const queryPrompt = searchParams.get('prompt') ?? '';
  const queryPromptKey = searchParams.get('promptKey') ?? '';
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    normalizeTab(queryTabParam),
  );
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [dreams, setDreams] = useState<DreamEntry[]>([]);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReflection, setNewReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [incomingRitualPrompt, setIncomingRitualPrompt] = useState('');
  const handledRitualPromptRef = useRef('');

  useEffect(() => {
    if (!queryTabParam) return;
    setActiveTab((current) => {
      const requested = normalizeTab(queryTabParam);
      return current === requested ? current : requested;
    });
  }, [queryTabParam]);

  useEffect(() => {
    if (!queryPrompt) {
      setIncomingRitualPrompt('');
      handledRitualPromptRef.current = '';
      return;
    }
    const promptKey = queryPromptKey || queryPrompt;
    if (handledRitualPromptRef.current === promptKey) return;
    handledRitualPromptRef.current = promptKey;
    setIncomingRitualPrompt(queryPrompt);
    setNewReflection('');
    setShowAddForm(true);
    setActiveTab('journal');
  }, [queryPrompt, queryPromptKey]);

  const loadData = useCallback(async () => {
    try {
      const [entriesRes, dreamsRes, memoriesRes] = await Promise.all([
        fetch('/api/journal', { credentials: 'include' }),
        fetch('/api/journal/dreams?limit=30', { credentials: 'include' }),
        fetch('/api/user-memory', { credentials: 'include' }),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        const journalOnly = (data.entries || []).filter(
          (e: JournalEntry) => e.category !== 'dream',
        );
        setEntries(journalOnly);
      }

      if (dreamsRes.ok) {
        const data = await dreamsRes.json();
        setDreams(data.entries || []);
      }

      if (memoriesRes.ok) {
        const data = await memoriesRes.json();
        setMemories(data.memories || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user, loadData]);

  const handleSubmitReflection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflection.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const moodTags = extractMoodTags(newReflection);
      const cardReferences = extractCardReferences(newReflection);

      let moonPhase: string | null = null;
      let transitHighlight: string | null = null;

      try {
        const cosmicRes = await fetch('/api/gpt/cosmic-today');
        if (cosmicRes.ok) {
          const cosmicData = await cosmicRes.json();
          moonPhase = cosmicData.moonPhase?.name || null;
          if (cosmicData.keyTransits?.length > 0) {
            transitHighlight = cosmicData.keyTransits[0].label;
          }
        }
      } catch {
        // Continue without cosmic context
      }

      const requestBody: Record<string, unknown> = {
        content: newReflection,
        moodTags,
        cardReferences,
        moonPhase,
        transitHighlight,
      };
      if (incomingRitualPrompt) {
        requestBody.source = 'ritual';
        requestBody.category = 'ritual';
      } else {
        requestBody.source = 'manual';
      }

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.entry.category === 'dream') {
          setDreams((prev) => [data.entry, ...prev]);
        } else {
          setEntries((prev) => [data.entry, ...prev]);
        }
        setNewReflection('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMemory = async (memoryId: number) => {
    try {
      const response = await fetch(`/api/user-memory?id=${memoryId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setMemories((prev) => prev.filter((m) => m.id !== memoryId));
      }
    } catch (error) {
      console.error('Failed to delete memory:', error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='animate-pulse text-zinc-400'>
          Opening your Book of Shadows...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
        <div className='text-center max-w-sm'>
          <BookOpen className='w-12 h-12 text-lunary-primary-400 mx-auto mb-4' />
          <h1 className='text-xl font-bold text-white mb-2'>Book of Shadows</h1>
          <p className='text-zinc-400 mb-6'>
            Your personal journal of insights, reflections, and cosmic wisdom
          </p>
          <Link
            href='/auth'
            className='inline-block bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white px-6 py-3 rounded-lg transition-colors'
          >
            Sign In to Begin
          </Link>
        </div>
      </div>
    );
  }

  const journalEntries = entries.filter((entry) => entry.category !== 'ritual');
  const ritualEntries = entries.filter((entry) => entry.category === 'ritual');

  const tabs: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      id: 'journal',
      label: 'Journal',
      icon: <Feather className='w-4 h-4' />,
      count: journalEntries.length,
    },
    {
      id: 'ritual',
      label: 'Ritual',
      icon: <Sparkles className='w-4 h-4' />,
      count: ritualEntries.length,
    },
    {
      id: 'dreams',
      label: 'Dreams',
      icon: <Moon className='w-4 h-4' />,
      count: dreams.length,
    },
    {
      id: 'memories',
      label: 'Memories',
      icon: <Brain className='w-4 h-4' />,
      count: memories.length,
    },
    {
      id: 'patterns',
      label: 'Patterns',
      icon: <Sparkles className='w-4 h-4' />,
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 pb-24'>
      <header className='sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800'>
        <div className='px-4 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-lg font-bold text-white flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-lunary-primary-400' />
                Book of Shadows
              </h1>
              <p className='text-xs text-zinc-400'>Your living journal</p>
            </div>
            <Link
              href='/guide'
              className='flex items-center gap-1.5 bg-zinc-800/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg text-sm text-zinc-300 transition-colors'
            >
              <MessageCircle className='w-4 h-4' />
              <span className='hidden sm:inline'>Ask Guide</span>
            </Link>
          </div>

          <div className='flex gap-1'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? tab.id === 'dreams'
                      ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-700/50'
                      : 'bg-lunary-primary-600/20 text-lunary-primary-300 border border-lunary-primary-700'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {tab.icon}
                <span className='hidden sm:inline'>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className='text-xs bg-zinc-800 px-1.5 py-0.5 rounded'>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className='px-4 py-6'>
        {activeTab === 'journal' && (
          <div className='space-y-4'>
            <LifeThemeBanner className='mb-2' />

            {showAddForm ? (
              <form onSubmit={handleSubmitReflection} className='space-y-3'>
                {incomingRitualPrompt && (
                  <p className='text-xs text-zinc-400'>
                    Ritual prompt: {incomingRitualPrompt}
                  </p>
                )}
                <textarea
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder="What's on your mind today? (Dreams are auto-detected)"
                  className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none'
                  rows={4}
                  autoFocus
                />
                <div className='flex gap-2'>
                  <Button
                    type='submit'
                    disabled={isSubmitting || !newReflection.trim()}
                    className='flex-1'
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setShowAddForm(false);
                      setNewReflection('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className='w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-zinc-300 transition-colors'
              >
                <Plus className='w-5 h-5' />
                Add Reflection
              </button>
            )}

            {journalEntries.length === 0 ? (
              <div className='text-center py-12'>
                <Feather className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-400'>No journal entries yet</p>
                <p className='text-xs text-zinc-500 mt-1'>
                  Write a reflection or chat with your Astral Guide
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {journalEntries.map((entry) => (
                  <JournalEntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ritual' && (
          <div className='space-y-4'>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
              <p className='text-sm text-zinc-400'>
                Ritual entries keep today’s focus anchored in your practice.
              </p>
            </div>
            {queryPrompt ? (
              <div className='space-y-3 bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
                <p className='text-[0.65rem] uppercase tracking-widest text-zinc-500'>
                  Ritual prompt
                </p>
                <p className='text-sm text-zinc-200 leading-relaxed'>
                  {queryPrompt}
                </p>
                <Button
                  type='button'
                  onClick={() => {
                    setActiveTab('journal');
                    setShowAddForm(true);
                    setNewReflection(queryPrompt);
                  }}
                >
                  Journal this ritual
                </Button>
              </div>
            ) : (
              <div className='text-center text-xs text-zinc-500'>
                Complete today’s focus to unlock a ritual prompt here.
              </div>
            )}

            {ritualEntries.length > 0 && (
              <div className='space-y-3 bg-zinc-900/40 border border-zinc-800 rounded-lg p-4'>
                <p className='text-[0.65rem] uppercase tracking-widest text-zinc-500'>
                  Ritual reflections
                </p>
                <div className='space-y-2'>
                  {ritualEntries.map((entry) => (
                    <JournalEntryCard key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'dreams' && (
          <div className='space-y-4'>
            <div className='bg-indigo-950/20 border border-indigo-800/30 rounded-lg p-4'>
              <p className='text-sm text-indigo-200/80'>
                Dreams you've shared in your journal or with Astral Guide appear
                here, tagged with symbols and themes.
              </p>
            </div>

            {dreams.length === 0 ? (
              <div className='text-center py-12'>
                <Moon className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-400'>No dreams recorded yet</p>
                <p className='text-xs text-zinc-500 mt-2 max-w-xs mx-auto'>
                  Write about a dream in your journal or tell Astral Guide about
                  one — they'll appear here automatically.
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {dreams.map((dream) => (
                  <DreamCard key={dream.id} entry={dream} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'memories' && (
          <div className='space-y-4'>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
              <p className='text-sm text-zinc-400'>
                Personal details Lunary has learned from your conversations.
                These help personalize your readings and guidance.
              </p>
            </div>

            {memories.length === 0 ? (
              <div className='text-center py-12'>
                <Brain className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-400'>No memories yet</p>
                <p className='text-xs text-zinc-500 mt-1'>
                  Chat with Astral Guide to build your profile
                </p>
              </div>
            ) : (
              <div className='bg-zinc-900 border border-zinc-800 rounded-lg p-4'>
                {memories.map((memory) => (
                  <MemoryCard
                    key={memory.id}
                    memory={memory}
                    onDelete={handleDeleteMemory}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'patterns' && (
          <div className='space-y-4'>
            <ArchetypeBar className='mb-4' />

            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
              <div className='flex items-center gap-2 mb-2'>
                <Sparkles className='w-4 h-4 text-lunary-primary-400' />
                <span className='text-sm font-medium text-zinc-300'>
                  Life Themes & Archetypes
                </span>
              </div>
              <p className='text-xs text-zinc-500'>
                As you journal, record dreams, and pull tarot, Lunary detects
                recurring themes and archetypal patterns in your journey.
              </p>
            </div>

            <PremiumPathway variant='shadow' className='mt-6' />
          </div>
        )}
      </div>
    </div>
  );
}
