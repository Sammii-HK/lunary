import { useState, useCallback } from 'react';

export type ShareFormat = 'square' | 'landscape' | 'story' | 'pinterest';

export interface UseShareModalReturn {
  isOpen: boolean;
  format: ShareFormat;
  loading: boolean;
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  setFormat: (format: ShareFormat) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export function useShareModal(
  defaultFormat: ShareFormat = 'square',
): UseShareModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<ShareFormat>(defaultFormat);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = useCallback(() => {
    setIsOpen(true);
    setError(null);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    format,
    loading,
    error,
    openModal,
    closeModal,
    setFormat,
    setLoading,
    setError,
  };
}
