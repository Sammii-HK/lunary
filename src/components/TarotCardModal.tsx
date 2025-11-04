'use client';

import { X } from 'lucide-react';
import { TarotCard } from './TarotCard';

interface TarotCardModalProps {
  card: {
    name: string;
    keywords: string[];
    information: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TarotCardModal({ card, isOpen, onClose }: TarotCardModalProps) {
  if (!isOpen || !card) return null;

  const isMajorArcana = !card.name.includes(' of ');

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-lg bg-zinc-900 rounded-lg border border-zinc-800/50 p-6 max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        <TarotCard
          name={card.name}
          keywords={card.keywords}
          information={card.information}
          variant={isMajorArcana ? 'major' : 'minor'}
        />
      </div>
    </div>
  );
}
