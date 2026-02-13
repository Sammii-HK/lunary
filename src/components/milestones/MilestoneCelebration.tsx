'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Modal, ModalBody } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';

interface MilestoneCelebrationProps {
  milestone: {
    id: number;
    type: string;
    key: string;
    data: {
      title?: string;
      description?: string;
      [key: string]: unknown;
    };
    achievedAt: string;
  };
  onCelebrate: (id: number) => void;
}

export function MilestoneCelebration({
  milestone,
  onCelebrate,
}: MilestoneCelebrationProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [confettiPieces, setConfettiPieces] = useState<
    Array<{ id: number; x: number; delay: number; color: string; size: number }>
  >([]);

  useEffect(() => {
    // Generate confetti pieces
    const colors = [
      'bg-lunary-primary-400',
      'bg-lunary-accent',
      'bg-amber-400',
      'bg-lunary-success',
      'bg-indigo-400',
      'bg-pink-400',
    ];
    const pieces = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 4 + Math.random() * 8,
    }));
    setConfettiPieces(pieces);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    onCelebrate(milestone.id);
  };

  const title = milestone.data.title || milestone.key.replace(/_/g, ' ');
  const description =
    milestone.data.description || 'A cosmic milestone achieved!';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='sm'>
      <ModalBody>
        <div className='relative overflow-hidden py-8'>
          {/* CSS confetti */}
          <div className='absolute inset-0 pointer-events-none'>
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className={`absolute rounded-full ${piece.color} opacity-80`}
                style={{
                  left: `${piece.x}%`,
                  top: '-10px',
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  animation: `confettiFall 3s ease-in ${piece.delay}s forwards`,
                }}
              />
            ))}
          </div>

          <div className='text-center relative z-10'>
            <div className='w-16 h-16 bg-gradient-to-br from-lunary-primary-500 to-lunary-accent rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-lunary-primary-500/30'>
              <Sparkles className='w-8 h-8 text-white' />
            </div>
            <p className='text-[0.65rem] uppercase tracking-widest text-lunary-primary-400 mb-2'>
              Milestone Achieved
            </p>
            <h2 className='text-xl font-bold text-white mb-2'>{title}</h2>
            <p className='text-sm text-zinc-400 max-w-xs mx-auto'>
              {description}
            </p>

            <Button onClick={handleClose} className='mt-6'>
              Celebrate
            </Button>
          </div>
        </div>

        <style jsx>{`
          @keyframes confettiFall {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(400px) rotate(720deg);
              opacity: 0;
            }
          }
        `}</style>
      </ModalBody>
    </Modal>
  );
}
