'use client';

import { useState, useEffect } from 'react';
import {
  Moon,
  Heart,
  Sparkles,
  Sun,
  Cloud,
  Zap,
  Flame,
  Lightbulb,
  Battery,
  Palette,
  CloudRain,
  Check,
} from 'lucide-react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MOODS = [
  { id: 'peaceful', label: 'Peaceful', icon: Moon },
  { id: 'energized', label: 'Energized', icon: Zap },
  { id: 'anxious', label: 'Anxious', icon: Cloud },
  { id: 'grateful', label: 'Grateful', icon: Heart },
  { id: 'frustrated', label: 'Frustrated', icon: Flame },
  { id: 'creative', label: 'Creative', icon: Palette },
  { id: 'melancholy', label: 'Melancholy', icon: CloudRain },
  { id: 'hopeful', label: 'Hopeful', icon: Sun },
  { id: 'exhausted', label: 'Exhausted', icon: Battery },
  { id: 'inspired', label: 'Inspired', icon: Lightbulb },
] as const;

const INTENTION_OUTCOMES = [
  {
    value: 'progressing',
    label: 'Progressing',
    color: 'text-lunary-primary-300',
  },
  { value: 'blocked', label: 'Blocked', color: 'text-amber-400' },
  { value: 'manifested', label: 'Manifested!', color: 'text-lunary-success' },
  { value: 'released', label: 'Releasing', color: 'text-zinc-400' },
] as const;

interface ActiveIntention {
  id: number;
  text: string;
  category?: string;
}

interface EveningRitualSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EveningRitualSheet({
  isOpen,
  onClose,
}: EveningRitualSheetProps) {
  const [step, setStep] = useState<'mood' | 'gratitude' | 'intention' | 'done'>(
    'mood',
  );
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [gratitude, setGratitude] = useState('');
  const [activeIntention, setActiveIntention] =
    useState<ActiveIntention | null>(null);
  const [intentionOutcome, setIntentionOutcome] = useState<string | null>(null);
  const [dreamIntention, setDreamIntention] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingIntention, setIsLoadingIntention] = useState(true);

  // Fetch active intention
  useEffect(() => {
    if (!isOpen) return;
    const fetch_ = async () => {
      try {
        const res = await fetch('/api/rituals/daily', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setActiveIntention(data.activeIntention);
        }
      } catch {
        // Silent
      } finally {
        setIsLoadingIntention(false);
      }
    };
    fetch_();
  }, [isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('mood');
      setSelectedMood(null);
      setGratitude('');
      setIntentionOutcome(null);
      setDreamIntention('');
      setIsLoadingIntention(true);
    }
  }, [isOpen]);

  const handleNextFromMood = () => {
    if (!selectedMood) return;
    setStep('gratitude');
  };

  const handleNextFromGratitude = () => {
    if (activeIntention) {
      setStep('intention');
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/rituals/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ritualType: 'evening',
          mood: selectedMood,
          gratitude: gratitude.trim() || null,
          intentionReviewed: !!intentionOutcome,
          intentionOutcome,
          dreamIntention: dreamIntention.trim() || null,
        }),
      });

      setStep('done');

      // Dispatch event for streak/progress sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lunary-evening-ritual-complete'));
      }
    } catch {
      // Silent
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalHeader>
        <div className='flex items-center gap-2'>
          <Moon className='w-5 h-5 text-lunary-primary-400' />
          Evening Ritual
        </div>
      </ModalHeader>

      <ModalBody>
        {step === 'mood' && (
          <div className='space-y-4'>
            <p className='text-sm text-zinc-400'>
              How are you feeling this evening?
            </p>
            <div className='grid grid-cols-5 gap-2'>
              {MOODS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedMood(id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-lg border transition-colors',
                    selectedMood === id
                      ? 'bg-lunary-primary-900/50 border-lunary-primary-600 text-lunary-primary-300'
                      : 'border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300',
                  )}
                >
                  <Icon className='w-5 h-5' />
                  <span className='text-[0.6rem] leading-tight'>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'gratitude' && (
          <div className='space-y-4'>
            <p className='text-sm text-zinc-400'>
              What are you grateful for today?
            </p>
            <textarea
              value={gratitude}
              onChange={(e) => setGratitude(e.target.value)}
              placeholder='One thing you appreciated today...'
              className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none text-sm'
              rows={3}
              maxLength={500}
              autoFocus
            />
          </div>
        )}

        {step === 'intention' && activeIntention && (
          <div className='space-y-4'>
            <div className='bg-lunary-primary-900/20 border border-lunary-primary-800/30 rounded-lg p-3'>
              <p className='text-[0.65rem] uppercase tracking-widest text-lunary-primary-400 mb-1'>
                Today's intention
              </p>
              <p className='text-sm text-white'>{activeIntention.text}</p>
            </div>
            <p className='text-sm text-zinc-400'>How did it go?</p>
            <div className='grid grid-cols-2 gap-2'>
              {INTENTION_OUTCOMES.map(({ value, label, color }) => (
                <button
                  key={value}
                  onClick={() => setIntentionOutcome(value)}
                  className={cn(
                    'p-3 rounded-lg border text-sm transition-colors text-left',
                    intentionOutcome === value
                      ? 'bg-lunary-primary-900/50 border-lunary-primary-600'
                      : 'border-zinc-800 hover:border-zinc-700',
                    color,
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className='text-center py-6'>
            <div className='w-12 h-12 bg-lunary-primary-900/50 rounded-full flex items-center justify-center mx-auto mb-3'>
              <Sparkles className='w-6 h-6 text-lunary-primary-400' />
            </div>
            <p className='text-white font-medium mb-1'>
              Evening ritual complete
            </p>
            <p className='text-sm text-zinc-400'>
              Rest well. Tomorrow holds new cosmic potential.
            </p>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        {step === 'mood' && (
          <Button
            onClick={handleNextFromMood}
            disabled={!selectedMood}
            className='w-full'
          >
            Continue
          </Button>
        )}
        {step === 'gratitude' && (
          <Button onClick={handleNextFromGratitude} className='w-full'>
            {activeIntention ? 'Continue' : 'Complete Ritual'}
          </Button>
        )}
        {step === 'intention' && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='w-full'
          >
            {isSubmitting ? 'Saving...' : 'Complete Ritual'}
          </Button>
        )}
        {step === 'done' && (
          <Button onClick={onClose} variant='outline' className='w-full'>
            <Check className='w-4 h-4 mr-2' />
            Close
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
