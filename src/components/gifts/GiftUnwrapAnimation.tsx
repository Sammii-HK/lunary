'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftUnwrapAnimationProps {
  onComplete: () => void;
}

export function GiftUnwrapAnimation({ onComplete }: GiftUnwrapAnimationProps) {
  const [phase, setPhase] = useState<'glow' | 'burst' | 'reveal'>('glow');
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number; color: string }>
  >([]);

  useEffect(() => {
    const colors = [
      'bg-lunary-primary-400',
      'bg-lunary-accent',
      'bg-amber-400',
      'bg-indigo-400',
      'bg-pink-400',
    ];
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 60,
        y: 50 + (Math.random() - 0.5) * 60,
        delay: Math.random() * 0.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      })),
    );

    const burstTimer = setTimeout(() => setPhase('burst'), 1200);
    const revealTimer = setTimeout(() => {
      setPhase('reveal');
      onComplete();
    }, 2400);

    return () => {
      clearTimeout(burstTimer);
      clearTimeout(revealTimer);
    };
  }, [onComplete]);

  return (
    <div className='relative flex items-center justify-center py-12'>
      {/* Glow phase */}
      <div
        className={cn(
          'w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-1000',
          phase === 'glow' &&
            'bg-gradient-to-br from-lunary-primary-500 to-lunary-accent animate-pulse scale-100',
          phase === 'burst' &&
            'bg-gradient-to-br from-lunary-primary-500 to-lunary-accent scale-150 opacity-0',
          phase === 'reveal' && 'hidden',
        )}
      >
        <Sparkles
          className={cn(
            'w-10 h-10 text-white transition-all duration-500',
            phase === 'glow' && 'animate-spin',
          )}
        />
      </div>

      {/* Burst particles */}
      {phase === 'burst' && (
        <div className='absolute inset-0 pointer-events-none'>
          {particles.map((p) => (
            <div
              key={p.id}
              className={`absolute w-2 h-2 rounded-full ${p.color}`}
              style={
                {
                  left: '50%',
                  top: '50%',
                  animation: `giftBurst 0.8s ease-out ${p.delay}s forwards`,
                  '--burst-x': `${(p.x - 50) * 3}px`,
                  '--burst-y': `${(p.y - 50) * 3}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes giftBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--burst-x), var(--burst-y)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
