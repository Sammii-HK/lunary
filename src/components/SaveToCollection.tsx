'use client';

import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, FolderPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStatus } from '@/components/AuthStatus';
import { conversionTracking } from '@/lib/analytics';

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
  onSaved?: () => void;
  className?: string;
}

export function SaveToCollection({
  item,
  onSaved,
  className = '',
}: SaveToCollectionProps) {
  const authState = useAuthStatus();
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showFolderDialog, setShowFolderDialog] = useState(false);
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      checkIfSaved();
      fetchFolders();
    }
  }, [authState.isAuthenticated, item]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch(
        `/api/collections?category=${item.category}&limit=100`,
      );
      const data = await response.json();
      if (data.success) {
        const exists = data.collections.some(
          (c: any) => c.title === item.title && c.category === item.category,
        );
        setIsSaved(exists);
      }
    } catch (error) {
      console.error('Error checking if saved:', error);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/collections/folders');
      const data = await response.json();
      if (data.success) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
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
        setIsSaved(true);
        conversionTracking.upgradeClicked('save_to_collection', {
          category: item.category,
        });
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
        onClick={() => setShowFolderDialog(true)}
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
              className='absolute right-4 top-4 text-zinc-400 hover:text-zinc-200'
            >
              ×
            </button>
            <h3 className='text-lg font-semibold mb-4'>Save to Collection</h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>
                  Folder (optional)
                </label>
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
              </div>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
