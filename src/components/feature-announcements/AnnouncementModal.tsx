'use client';

import { useEffect, useRef } from 'react';
import { X, Users, Sparkles, Star, Moon, Heart } from 'lucide-react';
import Image from 'next/image';

// Map of icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  Users,
  Sparkles,
  Star,
  Moon,
  Heart,
};

export interface AnnouncementData {
  id: string;
  title: string;
  description: string;
  icon: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface AnnouncementModalProps {
  announcement: AnnouncementData;
  onDismiss: () => void;
  onCtaClick?: () => void;
}

export function AnnouncementModal({
  announcement,
  onDismiss,
  onCtaClick,
}: AnnouncementModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onDismiss]);

  const IconComponent = iconMap[announcement.icon];

  const handleCtaClick = () => {
    onCtaClick?.();
    onDismiss();
  };

  return (
    <div
      className='fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'
      onClick={(e) => {
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <div
        ref={modalRef}
        className='bg-zinc-900 border border-zinc-700 rounded-xl max-w-md w-full relative overflow-hidden'
      >
        {/* Decorative background */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl' />
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className='absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10'
          aria-label='Close modal'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Content */}
        <div className='relative p-6'>
          {/* Header with moon icon */}
          <div className='flex justify-center mb-6'>
            <div className='relative'>
              <Image
                src='/icons/moon-phases/full-moon.svg'
                alt=''
                width={48}
                height={48}
                className='opacity-80'
              />
              <div className='absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full animate-pulse' />
            </div>
          </div>

          {/* New badge */}
          <div className='flex justify-center mb-4'>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-medium rounded-full border border-indigo-500/30'>
              {IconComponent && <IconComponent className='w-3.5 h-3.5' />}
              New Feature
            </span>
          </div>

          {/* Title */}
          <h2 className='text-xl font-semibold text-white text-center mb-3'>
            {announcement.title}
          </h2>

          {/* Description */}
          <p className='text-zinc-400 text-center text-sm leading-relaxed mb-6'>
            {announcement.description}
          </p>

          {/* Buttons */}
          <div className='flex gap-3'>
            {announcement.ctaLabel && announcement.ctaHref && (
              <a
                href={announcement.ctaHref}
                onClick={handleCtaClick}
                className='flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors text-center'
              >
                {announcement.ctaLabel}
              </a>
            )}
            <button
              onClick={onDismiss}
              className={`py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-colors border border-zinc-700 ${
                announcement.ctaLabel && announcement.ctaHref ? '' : 'flex-1'
              }`}
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
