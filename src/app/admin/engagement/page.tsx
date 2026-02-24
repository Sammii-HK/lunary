'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  MessageSquare,
  Check,
  X,
  Send,
  RefreshCw,
} from 'lucide-react';

type Status = 'pending_review' | 'approved' | 'dismissed';

interface EngagementItem {
  id: number;
  platform: string;
  engagement_id: string;
  author_name: string | null;
  comment_text: string;
  post_id: string | null;
  suggested_reply: string | null;
  status: Status;
  created_at: string;
  reviewed_at: string | null;
}

export default function EngagementPage() {
  const [items, setItems] = useState<EngagementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Status>('pending_review');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedReply, setEditedReply] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/engagement?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (error) {
      console.error('Failed to load engagement items:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleAction = async (
    id: number,
    action: 'approve' | 'dismiss',
    reply?: string,
  ) => {
    try {
      setProcessingId(id);
      const res = await fetch('/api/admin/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          action,
          ...(reply ? { editedReply: reply } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setEditingId(null);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Action failed:', error);
      alert('Failed to process action');
    } finally {
      setProcessingId(null);
    }
  };

  const startEditing = (item: EngagementItem) => {
    setEditingId(item.id);
    setEditedReply(item.suggested_reply ?? '');
  };

  const timeAgo = (dateStr: string) => {
    const seconds = Math.floor(
      (Date.now() - new Date(dateStr).getTime()) / 1000,
    );
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-4xl'>
        <div className='mb-6'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3'>
            <MessageSquare className='h-8 w-8 md:h-10 md:w-10' />
            Engagement Queue
          </h1>
          <p className='text-zinc-400'>
            Review and reply to social media comments
          </p>
        </div>

        {/* Filter + Refresh */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex gap-2'>
            {(['pending_review', 'approved', 'dismissed'] as const).map((s) => (
              <Button
                key={s}
                size='sm'
                variant={filter === s ? 'default' : 'outline'}
                onClick={() => setFilter(s)}
                className={
                  filter === s
                    ? 'bg-lunary-primary-600'
                    : 'border-zinc-700 text-zinc-400'
                }
              >
                {s === 'pending_review'
                  ? 'Pending'
                  : s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={loadItems}
            disabled={loading}
            className='border-zinc-700 text-zinc-400'
          >
            <RefreshCw
              className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        {/* Items */}
        {loading ? (
          <div className='text-center py-12 text-zinc-400'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p>Loading engagement items...</p>
          </div>
        ) : items.length === 0 ? (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='py-12 text-center'>
              <MessageSquare className='h-10 w-10 mx-auto mb-4 text-zinc-600' />
              <p className='text-zinc-400'>
                No {filter === 'pending_review' ? 'pending' : filter} items
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {items.map((item) => (
              <Card key={item.id} className='bg-zinc-900 border-zinc-800'>
                <CardHeader className='pb-2'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='border-zinc-700 text-zinc-400'
                      >
                        {item.platform}
                      </Badge>
                      {item.author_name && (
                        <span className='text-xs text-zinc-500'>
                          @{item.author_name}
                        </span>
                      )}
                      <span className='text-xs text-zinc-600'>
                        {timeAgo(item.created_at)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {/* Original comment */}
                  <div className='bg-zinc-800/50 p-3 rounded-lg'>
                    <p className='text-xs text-zinc-500 mb-1'>Comment:</p>
                    <p className='text-sm text-zinc-300 whitespace-pre-wrap'>
                      {item.comment_text}
                    </p>
                  </div>

                  {/* Suggested reply */}
                  {editingId === item.id ? (
                    <div>
                      <p className='text-xs text-zinc-500 mb-1'>Edit reply:</p>
                      <textarea
                        value={editedReply}
                        onChange={(e) => setEditedReply(e.target.value)}
                        rows={4}
                        className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-none'
                      />
                      <div className='flex gap-2 mt-2'>
                        <Button
                          size='sm'
                          onClick={() =>
                            handleAction(item.id, 'approve', editedReply)
                          }
                          disabled={
                            processingId === item.id || !editedReply.trim()
                          }
                          className='bg-lunary-success/80 hover:bg-lunary-success text-white'
                        >
                          {processingId === item.id ? (
                            <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                          ) : (
                            <Send className='h-3 w-3 mr-1' />
                          )}
                          Send
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => setEditingId(null)}
                          className='border-zinc-700 text-zinc-400'
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : item.suggested_reply ? (
                    <div className='bg-lunary-primary-600/10 border border-lunary-primary-600/20 p-3 rounded-lg'>
                      <p className='text-xs text-lunary-primary-300 mb-1'>
                        Suggested reply:
                      </p>
                      <p className='text-sm text-zinc-300 whitespace-pre-wrap'>
                        {item.suggested_reply}
                      </p>
                    </div>
                  ) : (
                    <p className='text-xs text-zinc-500 italic'>
                      No AI suggestion available
                    </p>
                  )}

                  {/* Actions */}
                  {filter === 'pending_review' && editingId !== item.id && (
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        onClick={() => handleAction(item.id, 'approve')}
                        disabled={
                          processingId === item.id || !item.suggested_reply
                        }
                        className='bg-lunary-success/80 hover:bg-lunary-success text-white'
                      >
                        {processingId === item.id ? (
                          <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                        ) : (
                          <Check className='h-3 w-3 mr-1' />
                        )}
                        Approve & Send
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => startEditing(item)}
                        className='border-zinc-700 text-zinc-400'
                      >
                        Edit
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleAction(item.id, 'dismiss')}
                        disabled={processingId === item.id}
                        className='border-zinc-700 text-zinc-400'
                      >
                        <X className='h-3 w-3 mr-1' />
                        Dismiss
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
