'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import {
  BookOpen,
  Folder,
  Plus,
  Search,
  Trash2,
  Loader2,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/components/AuthStatus';
import { AuthComponent } from '@/components/Auth';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';
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
  const [showFolderManagement, setShowFolderManagement] = useState(false);
  const [deletingFolderId, setDeletingFolderId] = useState<number | null>(null);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);
  const [deletingCollectionId, setDeletingCollectionId] = useState<
    number | null
  >(null);

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

  const handleDeleteFolder = async (folderId: number) => {
    setDeletingFolderId(folderId);
    try {
      const response = await fetch(`/api/collections/folders?id=${folderId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setFolders((prev) => prev.filter((f) => f.id !== folderId));
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
        fetchCollections();
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    } finally {
      setDeletingFolderId(null);
    }
  };

  const handleDeleteCollection = async (collectionId: number) => {
    setDeletingCollectionId(collectionId);
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setCollections((prev) => prev.filter((c) => c.id !== collectionId));
        setSelectedCollection(null);
        fetchFolders();
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
    } finally {
      setDeletingCollectionId(null);
    }
  };

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
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <div className='flex flex-wrap gap-2 flex-1'>
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
                          selectedFolder === folder.id
                            ? folder.color
                            : undefined,
                      }}
                    >
                      <Folder className='w-4 h-4' />
                      {folder.name} ({folder.itemCount})
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowFolderManagement(!showFolderManagement)}
                  className={`ml-2 p-2 rounded-lg text-sm border transition-colors ${
                    showFolderManagement
                      ? 'bg-lunary-primary-600/20 text-lunary-primary-300 border-lunary-primary-600'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700 hover:text-zinc-300'
                  }`}
                  title='Manage folders'
                >
                  <Settings2 className='w-4 h-4' />
                </button>
              </div>

              {showFolderManagement && (
                <div className='p-4 rounded-lg border border-zinc-700 bg-zinc-900/50'>
                  <h3 className='text-sm font-medium text-zinc-300 mb-3'>
                    Manage Folders
                  </h3>
                  <div className='space-y-2'>
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className='flex items-center justify-between p-2 rounded-lg bg-zinc-800/50 border border-zinc-700'
                      >
                        <div className='flex items-center gap-3'>
                          <div
                            className='w-3 h-3 rounded-full'
                            style={{ backgroundColor: folder.color }}
                          />
                          <span className='text-sm text-zinc-200'>
                            {folder.name}
                          </span>
                          <span className='text-xs text-zinc-400'>
                            {folder.itemCount} item
                            {folder.itemCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          disabled={deletingFolderId === folder.id}
                          className='p-1.5 rounded text-zinc-400 hover:text-lunary-error-400 hover:bg-zinc-700 transition-colors disabled:opacity-50'
                          title='Delete folder'
                        >
                          {deletingFolderId === folder.id ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                          ) : (
                            <Trash2 className='w-4 h-4' />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className='text-xs text-zinc-400 mt-3'>
                    Deleting a folder will move its items to Uncategorized.
                  </p>
                </div>
              )}
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
              <button
                key={collection.id}
                onClick={() => setSelectedCollection(collection)}
                className='block rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 hover:border-lunary-primary-700 hover:bg-zinc-900/50 transition-all group text-left'
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
                    <span className='text-xs text-zinc-400 flex items-center gap-1'>
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
                <p className='text-xs text-zinc-400'>
                  {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Collection Detail Modal */}
        <Modal
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          size='lg'
        >
          {selectedCollection && (
            <>
              <ModalHeader>
                <div className='flex items-start justify-between w-full pr-8'>
                  <div>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium border capitalize mb-2 ${
                        categoryColors[selectedCollection.category] ||
                        'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {selectedCollection.category.replace('_', ' ')}
                    </span>
                    <h2 className='text-xl font-semibold text-white'>
                      {selectedCollection.title}
                    </h2>
                  </div>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className='space-y-4'>
                  {selectedCollection.folderName && (
                    <div className='flex items-center gap-2 text-sm text-zinc-400'>
                      <Folder className='w-4 h-4' />
                      {selectedCollection.folderName}
                    </div>
                  )}

                  <div className='prose prose-invert prose-sm max-w-none'>
                    {(() => {
                      const content = selectedCollection.content;
                      const text =
                        typeof content === 'string'
                          ? content
                          : content?.text ||
                            content?.content ||
                            JSON.stringify(content, null, 2);
                      return (
                        <p className='text-zinc-300 whitespace-pre-wrap leading-relaxed'>
                          {text}
                        </p>
                      );
                    })()}
                  </div>

                  {selectedCollection.tags.length > 0 && (
                    <div className='flex flex-wrap gap-2 pt-2'>
                      {selectedCollection.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className='text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400'
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='flex items-center justify-between pt-4 border-t border-zinc-800'>
                    <p className='text-xs text-zinc-400'>
                      Saved{' '}
                      {new Date(
                        selectedCollection.createdAt,
                      ).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <Button
                      variant='ghost'
                      onClick={() =>
                        handleDeleteCollection(selectedCollection.id)
                      }
                      disabled={deletingCollectionId === selectedCollection.id}
                      className='text-zinc-400 hover:text-lunary-error-400 hover:bg-lunary-error-900/20'
                    >
                      {deletingCollectionId === selectedCollection.id ? (
                        <Loader2 className='w-4 h-4 animate-spin mr-2' />
                      ) : (
                        <Trash2 className='w-4 h-4 mr-2' />
                      )}
                      Delete
                    </Button>
                  </div>
                </div>
              </ModalBody>
            </>
          )}
        </Modal>
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
