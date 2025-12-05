import { useEffect, useCallback, RefObject } from 'react';

interface UseModalOptions {
  isOpen: boolean;
  onClose: () => void;
  modalRef?: RefObject<HTMLElement>;
  closeOnEsc?: boolean;
  closeOnClickOutside?: boolean;
}

/**
 * Hook for accessible modal behavior
 * - ESC key closes the modal
 * - Clicking outside the modal content closes it
 */
export function useModal({
  isOpen,
  onClose,
  modalRef,
  closeOnEsc = true,
  closeOnClickOutside = true,
}: UseModalOptions) {
  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault();
        onClose();
      }
    },
    [onClose, closeOnEsc],
  );

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (!closeOnClickOutside || !modalRef?.current) return;

      const target = event.target as Node;
      if (!modalRef.current.contains(target)) {
        onClose();
      }
    },
    [onClose, closeOnClickOutside, modalRef],
  );

  useEffect(() => {
    if (!isOpen) return;

    document.addEventListener('keydown', handleEscKey);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleEscKey]);

  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;

    // Small delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, handleClickOutside, closeOnClickOutside]);

  return { isOpen };
}

/**
 * Simpler version - just pass the backdrop onClick and it handles click-outside
 * Use this when you control the backdrop element directly
 */
export function useModalBackdrop(onClose: () => void) {
  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const handleEscKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [handleEscKey]);

  return { handleBackdropClick };
}
