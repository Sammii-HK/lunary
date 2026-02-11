'use client';

import { useState, useEffect, useCallback } from 'react';
import { Gift, Send, Inbox, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Heading } from '@/components/ui/Heading';
import { GiftCard } from '@/components/gifts/GiftCard';
import { GiftUnwrapAnimation } from '@/components/gifts/GiftUnwrapAnimation';
import { formatDistanceToNow } from 'date-fns';

interface GiftItem {
  id: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  senderSunSign?: string;
  recipientId?: string;
  recipientName?: string;
  recipientAvatar?: string;
  recipientSunSign?: string;
  giftType: string;
  content?: Record<string, unknown> | null;
  message?: string | null;
  openedAt: string | null;
  createdAt: string;
}

type Tab = 'received' | 'sent';

export default function GiftsPage() {
  const [tab, setTab] = useState<Tab>('received');
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openingGiftId, setOpeningGiftId] = useState<string | null>(null);
  const [openedGift, setOpenedGift] = useState<GiftItem | null>(null);

  const fetchGifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/gifts?type=${tab}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setGifts(data.gifts || []);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchGifts();
  }, [fetchGifts]);

  const handleOpenGift = async (gift: GiftItem) => {
    if (gift.openedAt) {
      // Already opened — show content directly
      setOpenedGift(gift);
      return;
    }

    setOpeningGiftId(gift.id);
  };

  const handleUnwrapComplete = useCallback(async () => {
    if (!openingGiftId) return;

    try {
      const res = await fetch(`/api/gifts/${openingGiftId}/open`, {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setOpenedGift({
          ...data.gift,
          giftType: data.gift.giftType,
          content: data.gift.content,
          message: data.gift.message,
          senderName: data.gift.senderName,
        });
        // Update list
        setGifts((prev) =>
          prev.map((g) =>
            g.id === openingGiftId
              ? {
                  ...g,
                  openedAt: data.gift.openedAt,
                  content: data.gift.content,
                  message: data.gift.message,
                }
              : g,
          ),
        );
      }
    } catch {
      // Silent
    } finally {
      setOpeningGiftId(null);
    }
  }, [openingGiftId]);

  return (
    <div className='min-h-screen bg-zinc-950 px-4 py-6 pb-24'>
      <div className='max-w-lg mx-auto space-y-6'>
        <Heading as='h1' variant='h2'>
          Cosmic Gifts
        </Heading>

        {/* Tabs */}
        <div className='flex gap-1 bg-zinc-900/50 rounded-lg p-1'>
          <button
            type='button'
            onClick={() => setTab('received')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
              tab === 'received'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            <Inbox className='w-4 h-4' />
            Received
          </button>
          <button
            type='button'
            onClick={() => setTab('sent')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 rounded-md py-2 text-sm font-medium transition-colors',
              tab === 'sent'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            <Send className='w-4 h-4' />
            Sent
          </button>
        </div>

        {/* Unwrap animation overlay */}
        {openingGiftId && (
          <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center'>
            <GiftUnwrapAnimation onComplete={handleUnwrapComplete} />
          </div>
        )}

        {/* Opened gift detail */}
        {openedGift && (
          <div className='fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-sm'>
              <GiftCard
                giftType={openedGift.giftType}
                content={
                  (openedGift.content as Record<string, string | string[]>) ||
                  {}
                }
                senderName={openedGift.senderName || 'A friend'}
                personalMessage={openedGift.message}
              />
              <button
                type='button'
                onClick={() => setOpenedGift(null)}
                className='mt-4 w-full py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors'
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Gift list */}
        {isLoading ? (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-20 bg-zinc-900/50 rounded-xl animate-pulse'
              />
            ))}
          </div>
        ) : gifts.length === 0 ? (
          <div className='text-center py-12'>
            <Gift className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
            <p className='text-zinc-400 text-sm'>
              {tab === 'received'
                ? 'No gifts yet'
                : "You haven't sent any gifts yet"}
            </p>
            <p className='text-xs text-zinc-500 mt-1'>
              {tab === 'received'
                ? 'Gifts from friends will appear here'
                : "Send a gift from a friend's profile"}
            </p>
          </div>
        ) : (
          <div className='space-y-2'>
            {gifts.map((gift) => {
              const isReceived = tab === 'received';
              const personName = isReceived
                ? gift.senderName
                : gift.recipientName;
              const personAvatar = isReceived
                ? gift.senderAvatar
                : gift.recipientAvatar;
              const isOpened = !!gift.openedAt;

              return (
                <button
                  key={gift.id}
                  type='button'
                  onClick={() =>
                    isReceived ? handleOpenGift(gift) : undefined
                  }
                  className={cn(
                    'w-full rounded-xl border p-4 text-left transition-all',
                    isReceived && !isOpened
                      ? 'border-lunary-primary-500/50 bg-lunary-primary-900/10 hover:bg-lunary-primary-900/20'
                      : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900/80',
                    !isReceived && 'cursor-default',
                  )}
                >
                  <div className='flex items-center gap-3'>
                    {personAvatar ? (
                      <Image
                        src={personAvatar}
                        alt={personName || ''}
                        width={40}
                        height={40}
                        className='rounded-full'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center'>
                        <Sparkles className='w-4 h-4 text-zinc-500' />
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm font-medium text-white truncate'>
                          {isReceived
                            ? `From ${personName}`
                            : `To ${personName}`}
                        </p>
                        {isReceived && !isOpened && (
                          <span className='w-2 h-2 rounded-full bg-lunary-primary-400 animate-pulse shrink-0' />
                        )}
                      </div>
                      <p className='text-xs text-zinc-500'>
                        {gift.giftType === 'tarot_pull'
                          ? 'Tarot Pull'
                          : 'Cosmic Encouragement'}{' '}
                        &middot;{' '}
                        {formatDistanceToNow(new Date(gift.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
