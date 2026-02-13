'use client';

import { useState } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Modal, ModalBody } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { GIFT_TYPES } from '@/utils/gifts/gift-content';
import { GiftTypeCard } from './GiftTypeCard';

interface SendGiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
  recipientName: string;
}

type Step = 'choose' | 'message' | 'sending' | 'sent';

export function SendGiftModal({
  isOpen,
  onClose,
  recipientId,
  recipientName,
}: SendGiftModalProps) {
  const [step, setStep] = useState<Step>('choose');
  const [selectedType, setSelectedType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSend = async () => {
    setStep('sending');
    setError('');

    try {
      const res = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          recipientId,
          giftType: selectedType,
          message: message.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send gift');
        setStep('message');
        return;
      }

      setStep('sent');
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('message');
    }
  };

  const handleClose = () => {
    setStep('choose');
    setSelectedType('');
    setMessage('');
    setError('');
    onClose();
  };

  const selectedGift = GIFT_TYPES.find((g) => g.id === selectedType);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size='sm'>
      <ModalBody>
        <div className='py-4'>
          {/* Choose gift type */}
          {step === 'choose' && (
            <div className='space-y-4'>
              <div className='text-center'>
                <p className='text-[0.65rem] uppercase tracking-widest text-lunary-primary-400 mb-1'>
                  Send a Cosmic Gift
                </p>
                <p className='text-sm text-zinc-400'>
                  Choose a gift for {recipientName}
                </p>
              </div>

              <div className='space-y-2'>
                {GIFT_TYPES.map((gift) => (
                  <GiftTypeCard
                    key={gift.id}
                    id={gift.id}
                    name={gift.name}
                    description={gift.description}
                    icon={gift.icon}
                    selected={selectedType === gift.id}
                    onSelect={setSelectedType}
                  />
                ))}
              </div>

              <Button
                onClick={() => setStep('message')}
                disabled={!selectedType}
                className='w-full'
              >
                Next
              </Button>
            </div>
          )}

          {/* Add personal message */}
          {(step === 'message' || step === 'sending') && (
            <div className='space-y-4'>
              <button
                type='button'
                onClick={() => setStep('choose')}
                className='flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors'
              >
                <ArrowLeft className='w-3 h-3' />
                Back
              </button>

              <div className='text-center'>
                <p className='text-[0.65rem] uppercase tracking-widest text-lunary-primary-400 mb-1'>
                  {selectedGift?.name}
                </p>
                <p className='text-sm text-zinc-400'>
                  Add a personal message (optional)
                </p>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 500))}
                placeholder='Write something meaningful...'
                rows={3}
                className='w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-lunary-primary-500 focus:outline-none focus:ring-1 focus:ring-lunary-primary-500/50 resize-none'
              />
              <p className='text-xs text-zinc-600 text-right'>
                {message.length}/500
              </p>

              {error && (
                <p className='text-xs text-red-400 text-center'>{error}</p>
              )}

              <Button
                onClick={handleSend}
                disabled={step === 'sending'}
                className='w-full'
              >
                {step === 'sending' ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <>
                    <Send className='w-4 h-4 mr-1.5' />
                    Send Gift
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Sent confirmation */}
          {step === 'sent' && (
            <div className='text-center space-y-4 py-4'>
              <div className='w-16 h-16 bg-gradient-to-br from-lunary-primary-500 to-lunary-accent rounded-full flex items-center justify-center mx-auto shadow-lg shadow-lunary-primary-500/30'>
                <Send className='w-7 h-7 text-white' />
              </div>
              <div>
                <p className='text-lg font-bold text-white'>Gift Sent!</p>
                <p className='text-sm text-zinc-400 mt-1'>
                  {recipientName} will receive a notification
                </p>
              </div>
              <Button onClick={handleClose}>Done</Button>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
