'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/useHaptic';

interface NativeShareButtonProps {
  onShare: () => Promise<void>;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function NativeShareButton({
  onShare,
  label = 'Share',
  variant = 'secondary',
  size = 'md',
  className,
  showIcon = true,
}: NativeShareButtonProps) {
  const [isSharing, setIsSharing] = useState(false);
  const haptic = useHaptic();

  const handleShare = async () => {
    setIsSharing(true);
    haptic.light();

    try {
      await onShare();
      haptic.success();
    } catch (error) {
      // User cancelled or share failed - this is normal behavior
      if ((error as Error)?.name !== 'AbortError') {
        console.log('[Share] Cancelled or failed:', error);
      }
    } finally {
      setIsSharing(false);
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-2 text-sm gap-2',
    lg: 'px-4 py-3 text-base gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const variantClasses = {
    primary:
      'bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white border-transparent',
    secondary: 'bg-zinc-700 hover:bg-zinc-600 text-white border-zinc-600',
    ghost: 'hover:bg-zinc-800 text-zinc-300 border-transparent',
  };

  return (
    <button
      onClick={handleShare}
      disabled={isSharing}
      className={cn(
        'inline-flex items-center justify-center rounded-lg border transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {showIcon && (
        <Share2 className={cn(iconSizes[size], isSharing && 'animate-pulse')} />
      )}
      {label}
    </button>
  );
}
