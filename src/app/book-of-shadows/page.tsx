'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Plus,
  Sparkles,
  Moon,
  Star,
  Brain,
  Trash2,
  ChevronRight,
  Feather,
} from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface JournalEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase?: string;
  source: string;
  createdAt: string;
}

interface UserMemory {
  id: number;
  category: string;
  fact: string;
  confidence: number;
  mentionedCount: number;
  lastMentionedAt: string;
}

interface JournalPattern {
  title: string;
  description: string;
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

function EntryCard({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='border-l-2 border-purple-500/30 pl-4 py-3'>
      <div className='flex items-center gap-2 mb-1.5'>
        <span className='text-sm text-zinc-400'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-zinc-500 flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'chat' && (
          <span className='text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded'>
            from chat
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
              className='text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1'
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
          <span className='text-xs text-purple-400 uppercase tracking-wide'>
            {CATEGORY_LABELS[memory.category] || memory.category}
          </span>
          <p className='text-white text-sm mt-0.5'>{memory.fact}</p>
          <span className='text-xs text-zinc-500'>
            Mentioned {memory.mentionedCount}x
          </span>
        </div>
        <button
          onClick={() => setShowConfirm(true)}
          className='p-2 text-zinc-500 hover:text-lunary-error transition-colors'
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

function PatternCard({ pattern }: { pattern: JournalPattern }) {
  return (
    <div className='bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 rounded-lg p-4'>
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-4 h-4 text-purple-400' />
        <span className='text-sm font-medium text-purple-300'>Pattern</span>
      </div>
      <p className='text-white font-medium mb-1'>{pattern.title}</p>
      <p className='text-sm text-zinc-400'>{pattern.description}</p>
    </div>
  );
}

type TabId = 'journal' | 'memories' | 'patterns';

export default function BookOfShadowsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStatus();
  const [activeTab, setActiveTab] = useState<TabId>('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReflection, setNewReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [entriesRes, memoriesRes, patternsRes] = await Promise.all([
        fetch('/api/journal', { credentials: 'include' }),
        fetch('/api/user-memory', { credentials: 'include' }),
        fetch('/api/journal/patterns', { credentials: 'include' }).catch(
          () => null,
        ),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries || []);
      }

      if (memoriesRes.ok) {
        const data = await memoriesRes.json();
        setMemories(data.memories || []);
      }

      if (patternsRes?.ok) {
        const data = await patternsRes.json();
        setPatterns(data.patterns || []);
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
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newReflection }),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries((prev) => [data.entry, ...prev]);
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
          <BookOpen className='w-12 h-12 text-purple-400 mx-auto mb-4' />
          <h1 className='text-xl font-bold text-white mb-2'>Book of Shadows</h1>
          <p className='text-zinc-400 mb-6'>
            Your personal journal of insights, reflections, and cosmic wisdom
          </p>
          <Link
            href='/auth'
            className='inline-block bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors'
          >
            Sign In to Begin
          </Link>
        </div>
      </div>
    );
  }

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
      count: entries.length,
    },
    {
      id: 'memories',
      label: 'What I Know',
      icon: <Brain className='w-4 h-4' />,
      count: memories.length,
    },
    {
      id: 'patterns',
      label: 'Patterns',
      icon: <Sparkles className='w-4 h-4' />,
      count: patterns.length,
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 pb-24'>
      <header className='sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800'>
        <div className='px-4 py-4'>
          <div className='flex items-center justify-between mb-4'>
            <div>
              <h1 className='text-lg font-bold text-white flex items-center gap-2'>
                <BookOpen className='w-5 h-5 text-purple-400' />
                Book of Shadows
              </h1>
              <p className='text-xs text-zinc-500'>Your living journal</p>
            </div>
            <Link
              href='/guide'
              className='text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1'
            >
              Chat <ChevronRight className='w-4 h-4' />
            </Link>
          </div>

          <div className='flex gap-1'>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
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

      <main className='px-4 py-6'>
        {activeTab === 'journal' && (
          <div className='space-y-4'>
            {showAddForm ? (
              <form onSubmit={handleSubmitReflection} className='space-y-3'>
                <textarea
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  placeholder="What's on your mind today?"
                  className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none'
                  rows={4}
                  autoFocus
                />
                <div className='flex gap-2'>
                  <Button
                    type='submit'
                    disabled={isSubmitting || !newReflection.trim()}
                    className='flex-1'
                  >
                    {isSubmitting ? 'Saving...' : 'Save Reflection'}
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

            {entries.length === 0 ? (
              <div className='text-center py-12'>
                <Moon className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-500'>No reflections yet</p>
                <p className='text-xs text-zinc-600 mt-1'>
                  Add a reflection or chat with your Astral Guide
                </p>
              </div>
            ) : (
              <div className='space-y-2'>
                {entries.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'memories' && (
          <div className='space-y-4'>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4'>
              <p className='text-sm text-zinc-400'>
                These are personal details Lunary has learned about you from
                your conversations. They help personalize your readings and
                guidance.
              </p>
            </div>

            {memories.length === 0 ? (
              <div className='text-center py-12'>
                <Brain className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-500'>No memories yet</p>
                <p className='text-xs text-zinc-600 mt-1'>
                  Chat with your Astral Guide to build your profile
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
            {patterns.length === 0 ? (
              <div className='text-center py-12'>
                <Sparkles className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
                <p className='text-zinc-500'>No patterns detected yet</p>
                <p className='text-xs text-zinc-600 mt-1'>
                  Keep journaling to reveal recurring themes
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {patterns.map((pattern, i) => (
                  <PatternCard key={i} pattern={pattern} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
