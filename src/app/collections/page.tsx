'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { BookOpen, Folder, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import Link from 'next/link';

interface Collection {
  id: number;
  title: string;
  description?: string;
  category: string;
  content: any;
  tags: string[];
  folderId?: number;
  folderName?: string;
  createdAt: string;
}

interface Folder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  itemCount: number;
}

function CollectionsPageContent() {
  const authState = useAuthStatus();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedFolder) params.append('folder_id', selectedFolder.toString());

      const response = await fetch(`/api/collections?${params.toString()}`);
      const data = await response.json();
      if (data.success) {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedFolder]);

  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/collections/folders');
      const data = await response.json();
      if (data.success) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      fetchCollections();
      fetchFolders();
    }
  }, [
    authState.isAuthenticated,
    authState.loading,
    fetchCollections,
    fetchFolders,
  ]);

  const filteredCollections = collections.filter((collection) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        collection.title.toLowerCase().includes(query) ||
        collection.description?.toLowerCase().includes(query) ||
        collection.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const categoryColors: Record<string, string> = {
    chat: 'bg-lunary-primary-900/20 text-lunary-primary-300 border-lunary-primary-700',
    ritual: 'bg-lunary-rose-900 text-lunary-rose-300 border-lunary-rose-700',
    insight:
      'bg-lunary-secondary-900 text-lunary-secondary-300 border-lunary-secondary-700',
    moon_circle:
      'bg-lunary-primary-900 text-lunary-primary-300 border-lunary-primary-700',
    tarot:
      'bg-lunary-accent-900 text-lunary-accent-300 border-lunary-accent-700',
    journal:
      'bg-lunary-success-900 text-lunary-success-300 border-lunary-success-700',
  };

  if (authState.loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-zinc-400'>Loading...</div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
        <div className='max-w-4xl mx-auto p-4'>
          <div className='text-center py-12'>
            <BookOpen className='w-16 h-16 mx-auto mb-4 text-lunary-primary-400' />
            <h1 className='text-3xl font-bold mb-4'>Your Lunary Journal</h1>
            <p className='text-zinc-400 mb-6'>
              Save your favorite insights, rituals, and cosmic guidance in one
              place.
            </p>
            <Button onClick={() => setShowAuthModal(true)}>
              Sign In to Access Collections
            </Button>
          </div>
          {showAuthModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
              <div className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
                <button
                  onClick={() => setShowAuthModal(false)}
                  className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-200'
                >
                  ×
                </button>
                <AuthComponent
                  onSuccess={() => {
                    setShowAuthModal(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100'>
      <div className='max-w-6xl mx-auto p-4'>
        <header className='mb-8'>
          <h1 className='text-3xl font-bold mb-2 flex items-center gap-3'>
            <BookOpen className='w-8 h-8 text-lunary-primary-400' />
            Your Lunary Journal
          </h1>
          <p className='text-zinc-400'>
            Your saved insights, rituals, and cosmic guidance
          </p>
        </header>

        {/* Filters */}
        <div className='mb-6 space-y-4'>
          <div className='flex flex-wrap gap-2'>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedCategory === null
                  ? 'bg-lunary-primary-600 text-white border-lunary-primary'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
              }`}
            >
              All
            </button>
            {[
              'chat',
              'ritual',
              'insight',
              'moon_circle',
              'tarot',
              'journal',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors capitalize ${
                  selectedCategory === cat
                    ? 'bg-lunary-primary-600 text-white border-lunary-primary'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {folders.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setSelectedFolder(null)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                  selectedFolder === null
                    ? 'bg-lunary-primary-600 text-white border-lunary-primary'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
              >
                <Folder className='w-4 h-4' />
                All Folders
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                    selectedFolder === folder.id
                      ? 'bg-lunary-primary-600 text-white border-lunary-primary'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                  style={{
                    borderColor:
                      selectedFolder === folder.id ? folder.color : undefined,
                  }}
                >
                  <Folder className='w-4 h-4' />
                  {folder.name} ({folder.itemCount})
                </button>
              ))}
            </div>
          )}

          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400' />
            <input
              type='text'
              placeholder='Search collections...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary'
            />
          </div>
        </div>

        {/* Collections Grid */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 animate-pulse'
              >
                <div className='h-4 bg-zinc-800 rounded w-3/4 mb-2'></div>
                <div className='h-3 bg-zinc-800 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className='text-center py-12 rounded-lg border border-zinc-800 bg-zinc-900/30'>
            <BookOpen className='w-12 h-12 mx-auto mb-4 text-zinc-600' />
            <p className='text-zinc-400 mb-4'>
              {searchQuery
                ? 'No collections match your search'
                : 'No collections yet. Start saving your favorite insights!'}
            </p>
            {!searchQuery && (
              <Link
                href='/book-of-shadows'
                className='inline-flex items-center gap-2 px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg transition-colors'
              >
                <Plus className='w-4 h-4' />
                Start Chatting with Lunary
              </Link>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {filteredCollections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className='block rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group'
              >
                <div className='flex items-start justify-between mb-3'>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border capitalize ${
                      categoryColors[collection.category] ||
                      'bg-zinc-800 text-zinc-300 border-zinc-700'
                    }`}
                  >
                    {collection.category.replace('_', ' ')}
                  </span>
                  {collection.folderName && (
                    <span className='text-xs text-zinc-500 flex items-center gap-1'>
                      <Folder className='w-3 h-3' />
                      {collection.folderName}
                    </span>
                  )}
                </div>
                <h3 className='text-lg font-semibold mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                  {collection.title}
                </h3>
                {collection.description && (
                  <p className='text-sm text-zinc-400 mb-3 line-clamp-2'>
                    {collection.description}
                  </p>
                )}
                {collection.tags.length > 0 && (
                  <div className='flex flex-wrap gap-1 mb-3'>
                    {collection.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className='text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className='text-xs text-zinc-500'>
                  {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionsPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <div className='text-zinc-400'>Loading...</div>
        </div>
      }
    >
      <CollectionsPageContent />
    </Suspense>
  );
}
