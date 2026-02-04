'use client';

import { useEffect, useState } from 'react';
import { Modal, ModalBody } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface LevelUpNotificationProps {
  isOpen: boolean;
  onClose: () => void;
  skillTreeName: string;
  skillTreeIcon: string;
  newLevel: number;
  unlockMessage: string | null;
  unlockedFeature: string | null;
  featureRoute: string | null;
}

export function LevelUpNotification({
  isOpen,
  onClose,
  skillTreeName,
  skillTreeIcon,
  newLevel,
  unlockMessage,
  featureRoute,
}: LevelUpNotificationProps) {
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isOpen && !hasTriggeredConfetti) {
      // Trigger confetti celebration
      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
        colors: ['#8458D8', '#C77DFF', '#D070E8', '#EE789E', '#7B7BE8'],
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: NodeJS.Timeout = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      setHasTriggeredConfetti(true);

      return () => clearInterval(interval);
    }
  }, [isOpen, hasTriggeredConfetti]);

  // Reset confetti flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      setHasTriggeredConfetti(false);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm' showCloseButton={false}>
      <ModalBody>
        <div className='text-center py-4'>
          {/* Celebration Icon */}
          <div className='relative mx-auto w-20 h-20 mb-4'>
            <div className='absolute inset-0 bg-gradient-to-br from-lunary-primary/20 to-lunary-accent/20 rounded-full animate-pulse' />
            <div className='absolute inset-2 bg-gradient-to-br from-lunary-primary/30 to-lunary-accent/30 rounded-full' />
            <div className='absolute inset-0 flex items-center justify-center'>
              <span className='text-4xl'>{skillTreeIcon}</span>
            </div>
          </div>

          {/* Level Up Text */}
          <div className='mb-4'>
            <div className='flex items-center justify-center gap-2 mb-2'>
              <Sparkles className='w-5 h-5 text-lunary-accent' />
              <span className='text-sm font-semibold text-lunary-accent uppercase tracking-wide'>
                Level Up!
              </span>
              <Sparkles className='w-5 h-5 text-lunary-accent' />
            </div>
            <h2 className='text-2xl font-bold text-white mb-1'>
              {skillTreeName}
            </h2>
            <p className='text-lg text-zinc-300'>Level {newLevel} Reached</p>
          </div>

          {/* Unlock Message */}
          {unlockMessage && (
            <div className='p-4 rounded-xl bg-gradient-to-br from-lunary-primary/10 to-lunary-accent/10 border border-lunary-primary/20 mb-6'>
              <p className='text-sm text-zinc-200'>{unlockMessage}</p>
            </div>
          )}

          {/* Actions */}
          <div className='flex flex-col gap-2'>
            {featureRoute ? (
              <>
                <Link href={featureRoute} onClick={onClose}>
                  <Button className='w-full bg-gradient-to-r from-lunary-primary to-lunary-accent hover:opacity-90'>
                    Explore New Feature
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                </Link>
                <Button
                  variant='ghost'
                  onClick={onClose}
                  className='text-zinc-400 hover:text-white'
                >
                  Continue
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                className='w-full bg-gradient-to-r from-lunary-primary to-lunary-accent hover:opacity-90'
              >
                Awesome!
              </Button>
            )}
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
