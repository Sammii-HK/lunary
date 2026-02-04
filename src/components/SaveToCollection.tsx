'use client';

import { useState, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Loader2, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal, ModalHeader, ModalBody } from '@/components/ui/modal';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';
import { useHaptic } from '@/hooks/useHaptic';

interface Folder {
  id: number;
  name: string;
  color?: string;
  icon?: string;
}

const SUGGESTED_FOLDERS: { name: string; icon: string; color: string }[] = [
  { name: 'Journal', icon: 'book', color: '#8b5cf6' },
  { name: 'Rituals', icon: 'moon', color: '#6366f1' },
  { name: 'Insights', icon: 'sparkles', color: '#a855f7' },
  { name: 'Tarot', icon: 'layers', color: '#c084fc' },
  { name: 'Favorites', icon: 'heart', color: '#ec4899' },
];

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
  onFolderCreated?: (folder: Folder) => void;
  className?: string;
}

export function SaveToCollection({
  item,
  isSaved: isSavedProp,
  folders: foldersProp,
  onSaved,
  onFolderCreated,
  className = '',
}: SaveToCollectionProps) {
  const authState = useAuthStatus();
  const haptic = useHaptic();
  const [isSavedInternal, setIsSavedInternal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [newlyCreatedFolders, setNewlyCreatedFolders] = useState<Folder[]>([]);
  const [foldersInternal, setFoldersInternal] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const isSaved = isSavedProp ?? isSavedInternal;
  const baseFolders = foldersProp ?? foldersInternal;
  const folders = [
    ...baseFolders,
    ...newlyCreatedFolders.filter(
      (nf) => !baseFolders.some((bf) => bf.id === nf.id),
    ),
  ];

  const availableSuggestions = SUGGESTED_FOLDERS.filter(
    (s) => !folders.some((f) => f.name.toLowerCase() === s.name.toLowerCase()),
  );

  const closeDialog = useCallback(() => setShowFolderDialog(false), []);

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

  const handleCreateFolder = async (
    name?: string,
    icon?: string,
    color?: string,
  ) => {
    const folderName = name || newFolderName.trim();
    if (!folderName) return;

    setFolderError(null);

    const isDuplicate = folders.some(
      (f) => f.name.toLowerCase() === folderName.toLowerCase(),
    );
    if (isDuplicate) {
      setFolderError(`A folder named "${folderName}" already exists`);
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await fetch('/api/collections/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: folderName,
          icon: icon || 'book',
          color: color || '#6366f1',
        }),
      });

      const data = await response.json();
      if (data.success && data.folder) {
        haptic.success();
        const newFolder: Folder = {
          id: data.folder.id,
          name: data.folder.name,
          color: data.folder.color,
          icon: data.folder.icon,
        };
        setNewlyCreatedFolders((prev) => [...prev, newFolder]);
        setFoldersInternal((prev) => [...prev, newFolder]);
        setSelectedFolderId(newFolder.id);
        setNewFolderName('');
        setShowNewFolderInput(false);
        onFolderCreated?.(newFolder);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      haptic.error();
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
        haptic.success();
        setIsSavedInternal(true);
        conversionTracking.upgradeClicked('save_to_collection', item.category);
        onSaved?.();
        closeDialog();
      }
    } catch (error) {
      console.error('Error saving to collection:', error);
      haptic.error();
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
        className={`flex items-center gap-2 text-sm text-lunary-success ${className}`}
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

      <Modal isOpen={showFolderDialog} onClose={closeDialog}>
        <ModalHeader>Save to Collection</ModalHeader>
        <ModalBody>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>
                Choose a folder
              </label>
              {showNewFolderInput ? (
                <div className='space-y-2'>
                  <input
                    type='text'
                    value={newFolderName}
                    onChange={(e) => {
                      setNewFolderName(e.target.value);
                      setFolderError(null);
                    }}
                    placeholder='Folder name'
                    className={`w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm focus:outline-none ${
                      folderError
                        ? 'border-lunary-error-500 focus:border-lunary-error-500'
                        : 'border-zinc-700 focus:border-lunary-primary'
                    }`}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder();
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setShowNewFolderInput(false);
                        setNewFolderName('');
                        setFolderError(null);
                      }
                    }}
                  />
                  {folderError && (
                    <p className='text-xs text-lunary-error-400'>
                      {folderError}
                    </p>
                  )}
                  <div className='flex gap-2'>
                    <Button
                      onClick={() => handleCreateFolder()}
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
                        setFolderError(null);
                      }}
                      size='sm'
                      variant='outline'
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-3'>
                  <div className='grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => setSelectedFolderId(null)}
                      className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                        selectedFolderId === null
                          ? 'border-lunary-primary-500 bg-lunary-primary-900/20 text-white'
                          : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      <span className='block font-medium'>Uncategorized</span>
                      <span className='text-xs opacity-70'>No folder</span>
                    </button>
                    {folders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                          selectedFolderId === folder.id
                            ? 'border-lunary-primary-500 bg-lunary-primary-900/20 text-white'
                            : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className='block font-medium'>{folder.name}</span>
                        <span className='text-xs opacity-70'>
                          {folder.color && (
                            <span style={{ color: folder.color }}>● </span>
                          )}
                          Folder
                        </span>
                      </button>
                    ))}
                  </div>

                  {availableSuggestions.length > 0 && (
                    <div className='pt-2 border-t border-zinc-800'>
                      <p className='text-xs text-zinc-400 mb-2'>
                        Quick create:
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {availableSuggestions.map((suggestion) => (
                          <button
                            key={suggestion.name}
                            onClick={() =>
                              handleCreateFolder(
                                suggestion.name,
                                suggestion.icon,
                                suggestion.color,
                              )
                            }
                            disabled={isCreatingFolder}
                            className='px-3 py-1.5 rounded-full text-xs border border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-lunary-primary-600 hover:text-lunary-primary-300 transition-colors disabled:opacity-50'
                          >
                            {suggestion.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setShowNewFolderInput(true)}
                    className='flex items-center gap-2 text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors pt-1'
                  >
                    <FolderPlus className='w-4 h-4' />
                    <span>Create custom folder</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          {!showNewFolderInput && (
            <div className='flex gap-2 mt-4'>
              <Button
                onClick={handleSave}
                variant='ghost'
                className='flex-1 bg-lunary-primary-600/20 hover:bg-lunary-primary-600/30 text-lunary-primary-300 hover:text-lunary-primary-200 border border-lunary-primary-600/30'
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    Saving...
                  </>
                ) : (
                  <>
                    <BookmarkCheck className='w-4 h-4 mr-2' />
                    Save to Collection
                  </>
                )}
              </Button>
              <Button
                onClick={closeDialog}
                variant='ghost'
                className='text-zinc-400 hover:text-zinc-300'
              >
                Cancel
              </Button>
            </div>
          )}
        </ModalBody>
      </Modal>
    </div>
  );
}
