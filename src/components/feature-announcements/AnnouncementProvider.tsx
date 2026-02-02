'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import { AnnouncementModal, type AnnouncementData } from './AnnouncementModal';

interface AnnouncementContextValue {
  /** Manually check for and show the next announcement */
  checkForAnnouncement: () => Promise<void>;
  /** Current announcement being shown, if any */
  currentAnnouncement: AnnouncementData | null;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(
  null,
);

interface AnnouncementProviderProps {
  children: React.ReactNode;
}

export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const authStatus = useAuthStatus();
  const [announcement, setAnnouncement] = useState<AnnouncementData | null>(
    null,
  );
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAnnouncement = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements');
      if (response.ok) {
        const data = await response.json();
        if (data.announcement) {
          setAnnouncement(data.announcement);
        }
      }
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  }, []);

  // Fetch announcement on mount when authenticated
  useEffect(() => {
    if (!authStatus.loading && authStatus.isAuthenticated && !hasFetched) {
      setHasFetched(true);
      fetchAnnouncement();
    }
  }, [
    authStatus.loading,
    authStatus.isAuthenticated,
    hasFetched,
    fetchAnnouncement,
  ]);

  const handleDismiss = useCallback(async () => {
    if (!announcement) return;

    const announcementId = announcement.id;
    setAnnouncement(null);

    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcementId }),
      });
    } catch (error) {
      console.error('Failed to mark announcement as seen:', error);
    }
  }, [announcement]);

  const checkForAnnouncement = useCallback(async () => {
    await fetchAnnouncement();
  }, [fetchAnnouncement]);

  const value: AnnouncementContextValue = {
    checkForAnnouncement,
    currentAnnouncement: announcement,
  };

  return (
    <AnnouncementContext.Provider value={value}>
      {children}
      {announcement && (
        <AnnouncementModal
          announcement={announcement}
          onDismiss={handleDismiss}
        />
      )}
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncement() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncement must be used within AnnouncementProvider');
  }
  return context;
}
