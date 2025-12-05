'use client';

import { useState, useCallback } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  Plus,
  FolderPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';

interface Folder {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

interface SaveToCollectionProps {
  item: {
    title: string;
    description?: string;
    category:
      | 'chat'
      | 'ritual'
      | 'insight'
      | 'moon_circle'
      | 'tarot'
      | 'journal';
    content: any;
    tags?: string[];
  };
  isSaved?: boolean;
  folders?: Folder[];
  onSaved?: () => void;
  className?: string;
}

export function SaveToCollection({
  item,
  isSaved: isSavedProp,
  folders: foldersProp,
  onSaved,
  className = '',
}: SaveToCollectionProps) {
  const authState = useAuthStatus();
  const [isSavedInternal, setIsSavedInternal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [foldersInternal, setFoldersInternal] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const isSaved = isSavedProp ?? isSavedInternal;
  const folders = foldersProp ?? foldersInternal;

  const fetchDataOnInteraction = useCallback(async () => {
    if (hasFetched || isSavedProp !== undefined) return;

    setHasFetched(true);
    try {
      const [collectionsRes, foldersRes] = await Promise.all([
        fetch(`/api/collections?category=${item.category}&limit=100`),
        fetch('/api/collections/folders'),
      ]);

      const [collectionsData, foldersData] = await Promise.all([
        collectionsRes.json(),
        foldersRes.json(),
      ]);

      if (collectionsData.success) {
        const exists = collectionsData.collections.some(
          (c: any) => c.title === item.title && c.category === item.category,
        );
        setIsSavedInternal(exists);
      }

      if (foldersData.success) {
        setFoldersInternal(foldersData.folders);
      }
    } catch (error) {
      console.error('Error fetching collection data:', error);
    }
  }, [hasFetched, isSavedProp, item]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/collections/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() }),
      });

      const data = await response.json();
      if (data.success && data.folder) {
        const newFolder = data.folder;
        setFoldersInternal((prev) => [...prev, newFolder]);
        setSelectedFolderId(newFolder.id);
        setNewFolderName('');
        setShowNewFolderInput(false);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleSave = async () => {
    if (!authState.isAuthenticated) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...item,
          folderId: selectedFolderId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsSavedInternal(true);
        conversionTracking.upgradeClicked('save_to_collection', item.category);
        onSaved?.();
        setShowFolderDialog(false);
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  if (isSaved) {
    return (
      <div
        className={`flex items-center gap-2 text-sm text-green-400 ${className}`}
      >
        <BookmarkCheck className='w-4 h-4' />
        <span>Saved</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={() => {
          fetchDataOnInteraction();
          setShowFolderDialog(true);
        }}
        onMouseEnter={fetchDataOnInteraction}
        variant='outline'
        size='sm'
        className='flex items-center gap-2'
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className='w-4 h-4 animate-spin' />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Bookmark className='w-4 h-4' />
            <span>Save</span>
          </>
        )}
      </Button>

      {showFolderDialog && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
          <div className='relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
            <button
              onClick={() => setShowFolderDialog(false)}
              className='absolute right-4 top-4 min-h-[48px] min-w-[48px] flex items-center justify-center text-zinc-400 hover:text-zinc-200'
              aria-label='Close dialog'
            >
              ×
            </button>
            <h3 className='text-lg font-semibold mb-4'>Save to Collection</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Folder (optional)
                </label>
                {showNewFolderInput ? (
                  <div className='space-y-2'>
                    <input
                      type='text'
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder='Folder name'
                      className='w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none'
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                        if (e.key === 'Escape') {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }
                      }}
                    />
                    <div className='flex gap-2'>
                      <Button
                        onClick={handleCreateFolder}
                        size='sm'
                        disabled={!newFolderName.trim() || isCreatingFolder}
                        className='flex-1'
                      >
                        {isCreatingFolder ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          'Create'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowNewFolderInput(false);
                          setNewFolderName('');
                        }}
                        size='sm'
                        variant='outline'
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    <select
                      value={selectedFolderId || ''}
                      onChange={(e) =>
                        setSelectedFolderId(
                          e.target.value ? parseInt(e.target.value, 10) : null,
                        )
                      }
                      className='w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm'
                    >
                      <option value=''>No folder</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setShowNewFolderInput(true)}
                      className='flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors'
                    >
                      <FolderPlus className='w-4 h-4' />
                      <span>Create new folder</span>
                    </button>
                  </div>
                )}
              </div>
              {!showNewFolderInput && (
                <div className='flex gap-2'>
                  <Button
                    onClick={handleSave}
                    className='flex-1'
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    onClick={() => setShowFolderDialog(false)}
                    variant='outline'
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
