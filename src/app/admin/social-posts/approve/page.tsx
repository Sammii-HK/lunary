'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  Send,
  Loader2,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Download,
  Maximize2,
  Edit2,
} from 'lucide-react';
import {
  getRecommendedTimes,
  getDefaultPostingTime,
  getPlatformPostingInfo,
} from '@/utils/posting-times';

interface PendingPost {
  id: string;
  content: string;
  platform: string;
  postType: string;
  topic?: string;
  scheduledDate?: string;
  imageUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
}

export default function PostApprovalPage() {
  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState<
    Record<string, string>
  >({});
  const [editingSchedule, setEditingSchedule] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [scheduleTime, setScheduleTime] = useState<string>('');
  const [updatingSchedule, setUpdatingSchedule] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<Record<string, string>>(
    {},
  );
  const [improvementNotes, setImprovementNotes] = useState<
    Record<string, string>
  >({});
  const [sendingAll, setSendingAll] = useState(false);
  const [sendAllProgress, setSendAllProgress] = useState<{
    current: number;
    total: number;
    success: number;
    failed: number;
  } | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const loadPendingPosts = async () => {
    try {
      const response = await fetch('/api/admin/social-posts/pending');
      const data = await response.json();
      if (data.success) {
        setPendingPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to load pending posts:', error);
    }
  };

  const handleBulkAction = async (action: 'approve_all' | 'clear_all') => {
    const confirmMessage =
      action === 'approve_all'
        ? `Approve all ${pendingPosts.filter((p) => p.status === 'pending').length} pending posts?`
        : `Delete all ${pendingPosts.filter((p) => p.status === 'pending').length} pending posts? This cannot be undone.`;

    if (!confirm(confirmMessage)) return;

    setBulkActionLoading(action);
    try {
      const response = await fetch('/api/admin/social-posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      if (data.success) {
        loadPendingPosts();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed');
    } finally {
      setBulkActionLoading(null);
    }
  };

  const handleEditPost = (post: PendingPost) => {
    setEditedContent({ ...editedContent, [post.id]: post.content });
    setEditingPost(post.id);
  };

  const handleApprove = async (postId: string) => {
    try {
      const edited = editedContent[postId];
      const notes = improvementNotes[postId];
      const hasEdits =
        edited && edited !== pendingPosts.find((p) => p.id === postId)?.content;
      const hasNotes = notes && notes.trim() !== '';

      const response = await fetch('/api/admin/social-posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          action: 'approve',
          editedContent: hasEdits ? edited : undefined,
          improvementNotes: hasNotes ? notes : undefined,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Clear edit state
        setEditingPost(null);
        setEditedContent({ ...editedContent, [postId]: '' });
        setImprovementNotes({ ...improvementNotes, [postId]: '' });
        loadPendingPosts();
      } else {
        alert(`Failed to approve: ${data.error}`);
      }
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    }
  };

  const handleReject = async (postId: string) => {
    const feedback = rejectionFeedback[postId]?.trim();

    if (!feedback) {
      const userFeedback = prompt(
        'Why are you rejecting this post? (This helps improve future posts):',
      );
      if (!userFeedback) {
        return;
      }
      setRejectionFeedback({ ...rejectionFeedback, [postId]: userFeedback });
      await handleRejectWithFeedback(postId, userFeedback);
      return;
    }

    await handleRejectWithFeedback(postId, feedback);
  };

  const handleRejectWithFeedback = async (postId: string, feedback: string) => {
    setRejectingPostId(postId);
    try {
      const response = await fetch('/api/admin/social-posts/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, action: 'reject', feedback }),
      });

      const data = await response.json();
      if (data.success) {
        setRejectionFeedback({ ...rejectionFeedback, [postId]: '' });
        loadPendingPosts();
      } else {
        alert(`Failed to reject: ${data.error}`);
      }
    } catch (error) {
      console.error('Error rejecting post:', error);
      alert('Failed to reject post');
    } finally {
      setRejectingPostId(null);
    }
  };

  const handleSendToSucculent = async (post: PendingPost) => {
    setSending(post.id);
    try {
      const response = await fetch('/api/admin/social-posts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post.id,
          content: post.content,
          platform: post.platform,
          scheduledDate: post.scheduledDate,
          imageUrl: post.imageUrl,
          postType: post.postType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ Post sent to Succulent successfully!`);
        loadPendingPosts();
      } else {
        alert(`❌ Failed to send: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending to Succulent:', error);
      alert('Failed to send post to Succulent');
    } finally {
      setSending(null);
    }
  };

  const handleSendAllApproved = async () => {
    const approvedPosts = pendingPosts.filter((p) => p.status === 'approved');

    if (approvedPosts.length === 0) {
      alert('No approved posts to send');
      return;
    }

    if (
      !confirm(
        `Send ${approvedPosts.length} approved post${approvedPosts.length > 1 ? 's' : ''} to Succulent?`,
      )
    ) {
      return;
    }

    setSendingAll(true);
    setSendAllProgress({
      current: 0,
      total: approvedPosts.length,
      success: 0,
      failed: 0,
    });

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < approvedPosts.length; i++) {
      const post = approvedPosts[i];
      setSendAllProgress({
        current: i + 1,
        total: approvedPosts.length,
        success: successCount,
        failed: failedCount,
      });

      try {
        const response = await fetch('/api/admin/social-posts/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            postId: post.id,
            content: post.content,
            platform: post.platform,
            scheduledDate: post.scheduledDate,
            imageUrl: post.imageUrl,
            postType: post.postType,
          }),
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failedCount++;
          console.error(`Failed to send post ${post.id}:`, data.error);
        }
      } catch (error) {
        failedCount++;
        console.error(`Error sending post ${post.id}:`, error);
      }

      // Small delay between requests to avoid rate limiting
      if (i < approvedPosts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    setSendAllProgress({
      current: approvedPosts.length,
      total: approvedPosts.length,
      success: successCount,
      failed: failedCount,
    });

    // Show summary alert
    if (failedCount === 0) {
      alert(
        `✅ Successfully sent all ${successCount} post${successCount > 1 ? 's' : ''} to Succulent!`,
      );
    } else {
      alert(
        `⚠️ Sent ${successCount} post${successCount > 1 ? 's' : ''} successfully, ${failedCount} failed. Check console for details.`,
      );
    }

    // Reload posts to update status
    await loadPendingPosts();

    // Reset after a short delay
    setTimeout(() => {
      setSendingAll(false);
      setSendAllProgress(null);
    }, 2000);
  };

  const handleOpenInApp = async (post: PendingPost) => {
    try {
      const response = await fetch('/api/admin/social-posts/open-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: post.content,
          platform: post.platform,
        }),
      });

      const data = await response.json();
      const platformsWithImages = ['instagram', 'pinterest', 'reddit'];
      if (data.success && data.url) {
        // For platforms with images: copy both text and image URL
        if (platformsWithImages.includes(post.platform) && post.imageUrl) {
          const clipboardContent = `${post.content}\n\nImage: ${post.imageUrl}`;
          await navigator.clipboard.writeText(clipboardContent);

          // Also try to copy image URL separately for easy access
          await navigator.clipboard.writeText(post.imageUrl).catch(() => {});

          window.open(data.url, '_blank');
          alert(
            `✅ ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)} opened!\n\n📋 Text and image URL copied to clipboard.\n\n📸 To add the image:\n1. Right-click the image preview below and "Save image as..."\n2. Or open the image URL in a new tab and save it\n3. Upload it to ${post.platform} along with your text`,
          );
        } else {
          // Copy content to clipboard for easy pasting
          await navigator.clipboard.writeText(post.content);

          // Open the platform URL
          window.open(data.url, '_blank');

          // Show helpful message
          if (data.needsClipboard) {
            alert(
              `✅ ${data.message}\n\nContent copied to clipboard - paste it into Instagram!`,
            );
          } else {
            alert(
              `✅ ${data.message}\n\nContent also copied to clipboard as backup.`,
            );
          }
        }
      } else {
        alert(`Failed to generate app URL: ${data.error}`);
      }
    } catch (error) {
      console.error('Error opening app:', error);
      // Fallback: just copy to clipboard
      try {
        const platformsWithImages = ['instagram', 'pinterest', 'reddit'];
        if (platformsWithImages.includes(post.platform) && post.imageUrl) {
          await navigator.clipboard.writeText(
            `${post.content}\n\nImage: ${post.imageUrl}`,
          );
        } else {
          await navigator.clipboard.writeText(post.content);
        }
        alert(
          `Content copied to clipboard. Open ${post.platform} manually and paste.`,
        );
      } catch (clipboardError) {
        alert('Failed to open app. Please copy the content manually.');
      }
    }
  };

  const handleDownloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lunary-post-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const handleEditSchedule = (post: PendingPost) => {
    if (post.scheduledDate) {
      const date = new Date(post.scheduledDate);
      setScheduleDate(date.toISOString().split('T')[0]);
      setScheduleTime(
        `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
      );
    } else {
      // Default to today with recommended time
      const today = new Date();
      const defaultHour = getDefaultPostingTime(post.platform);
      setScheduleDate(today.toISOString().split('T')[0]);
      setScheduleTime(`${String(defaultHour).padStart(2, '0')}:00`);
    }
    setEditingSchedule(post.id);
  };

  const handleSaveSchedule = async (postId: string) => {
    setUpdatingSchedule(postId);
    try {
      const dateTime = new Date(`${scheduleDate}T${scheduleTime}:00`);
      const response = await fetch('/api/admin/social-posts/update-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          scheduledDate: dateTime.toISOString(),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSchedule(null);
        loadPendingPosts();
      } else {
        alert(`Failed to update schedule: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule');
    } finally {
      setUpdatingSchedule(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className='bg-yellow-500/20 text-yellow-400 border-yellow-500/30'>
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className='bg-red-500/20 text-red-400 border-red-500/30'>
            Rejected
          </Badge>
        );
      case 'sent':
        return (
          <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
            Sent
          </Badge>
        );
      default:
        return null;
    }
  };

  const pendingCount = pendingPosts.filter(
    (p) => p.status === 'pending',
  ).length;
  const approvedCount = pendingPosts.filter(
    (p) => p.status === 'approved',
  ).length;

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
              <CheckCircle className='h-8 w-8 text-purple-400' />
              Post Approval Queue
            </h1>
            <p className='text-zinc-400'>
              Review and approve AI-generated social media posts
            </p>
          </div>
          <div className='flex gap-4 items-center'>
            <div className='text-center px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
              <div className='text-2xl font-bold text-yellow-400'>
                {pendingCount}
              </div>
              <div className='text-xs text-zinc-400'>Pending</div>
            </div>
            <div className='text-center px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
              <div className='text-2xl font-bold text-green-400'>
                {approvedCount}
              </div>
              <div className='text-xs text-zinc-400'>Approved</div>
            </div>
            {pendingCount > 0 && (
              <>
                <Button
                  onClick={() => handleBulkAction('approve_all')}
                  disabled={bulkActionLoading !== null}
                  variant='outline'
                  className='border-green-600 text-green-400 hover:bg-green-600/20'
                >
                  {bulkActionLoading === 'approve_all' ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Check className='h-4 w-4 mr-2' />
                  )}
                  Approve All
                </Button>
                <Button
                  onClick={() => handleBulkAction('clear_all')}
                  disabled={bulkActionLoading !== null}
                  variant='outline'
                  className='border-red-600 text-red-400 hover:bg-red-600/20'
                >
                  {bulkActionLoading === 'clear_all' ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <X className='h-4 w-4 mr-2' />
                  )}
                  Clear All
                </Button>
              </>
            )}
            {approvedCount > 0 && (
              <Button
                onClick={handleSendAllApproved}
                disabled={sendingAll}
                className='bg-purple-600 hover:bg-purple-700 text-white'
              >
                {sendingAll ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    Sending...
                    {sendAllProgress && (
                      <span className='ml-2 text-xs'>
                        ({sendAllProgress.current}/{sendAllProgress.total})
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2' />
                    Send All Approved ({approvedCount})
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {sendAllProgress && (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='py-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin text-purple-400' />
                  <span className='text-sm font-medium'>
                    Sending posts to Succulent...
                  </span>
                </div>
                <span className='text-xs text-zinc-400'>
                  {sendAllProgress.current} / {sendAllProgress.total}
                </span>
              </div>
              <div className='w-full bg-zinc-800 rounded-full h-2 overflow-hidden'>
                <div
                  className='bg-purple-600 h-full transition-all duration-300'
                  style={{
                    width: `${
                      (sendAllProgress.current / sendAllProgress.total) * 100
                    }%`,
                  }}
                />
              </div>
              <div className='flex gap-4 mt-2 text-xs'>
                <span className='text-green-400'>
                  ✅ {sendAllProgress.success} sent
                </span>
                {sendAllProgress.failed > 0 && (
                  <span className='text-red-400'>
                    ❌ {sendAllProgress.failed} failed
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {pendingPosts.length === 0 ? (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='py-12 text-center'>
              <Sparkles className='h-12 w-12 mx-auto mb-4 text-zinc-600' />
              <p className='text-zinc-400'>No posts pending approval</p>
              <p className='text-sm text-zinc-500 mt-2'>
                Generate posts from the Social Media Posts page
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {pendingPosts.map((post) => (
              <Card
                key={post.id}
                className='bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <CardTitle className='text-lg capitalize'>
                          {post.platform}
                        </CardTitle>
                        {getStatusBadge(post.status)}
                        <Badge className='bg-purple-500/20 text-purple-400 border-purple-500/30 capitalize'>
                          {post.postType}
                        </Badge>
                      </div>
                      <CardDescription className='text-zinc-400'>
                        {post.topic && `Topic: ${post.topic} • `}
                        Created: {new Date(post.createdAt).toLocaleString()}
                        {post.scheduledDate && (
                          <>
                            {' • '}
                            <span className='inline-flex items-center gap-2'>
                              {editingSchedule === post.id ? (
                                <span className='text-blue-400 text-sm'>
                                  Editing schedule...
                                </span>
                              ) : (
                                <>
                                  <span>
                                    Scheduled:{' '}
                                    {new Date(
                                      post.scheduledDate,
                                    ).toLocaleString()}
                                    {new Date(post.scheduledDate).getHours() ===
                                      0 &&
                                      new Date(
                                        post.scheduledDate,
                                      ).getMinutes() === 0 && (
                                        <span className='text-yellow-400 text-xs ml-1'>
                                          (midnight - edit recommended)
                                        </span>
                                      )}
                                  </span>
                                  {post.status === 'pending' && (
                                    <button
                                      onClick={() => handleEditSchedule(post)}
                                      className='text-blue-400 hover:text-blue-300 text-xs underline'
                                    >
                                      Edit
                                    </button>
                                  )}
                                </>
                              )}
                            </span>
                          </>
                        )}
                        {!post.scheduledDate && post.status === 'pending' && (
                          <>
                            {' • '}
                            <button
                              onClick={() => handleEditSchedule(post)}
                              className='text-blue-400 hover:text-blue-300 text-xs underline'
                            >
                              Set Schedule
                            </button>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {/* Display image for platforms that need images */}
                    {post.imageUrl &&
                      ['instagram', 'pinterest', 'reddit'].includes(
                        post.platform,
                      ) && (
                        <div className='relative w-full max-w-md mx-auto group'>
                          <Image
                            src={post.imageUrl}
                            alt='Post image'
                            width={800}
                            height={800}
                            className='w-full rounded-lg border border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity'
                            onClick={() => window.open(post.imageUrl, '_blank')}
                            unoptimized
                          />
                          <div className='absolute top-2 right-2 flex gap-2'>
                            <a
                              href={post.imageUrl}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1'
                              title='Open in new tab'
                            >
                              <ExternalLink className='h-3 w-3' />
                              Open
                            </a>
                            <button
                              onClick={() =>
                                handleDownloadImage(post.imageUrl!)
                              }
                              className='bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1'
                              title='Download image'
                            >
                              <svg
                                className='h-3 w-3'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                                />
                              </svg>
                              Save
                            </button>
                          </div>
                          <div className='mt-2 text-xs text-zinc-400 text-center'>
                            Click image to view full size • Right-click to save
                          </div>
                        </div>
                      )}

                    <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                      {editingPost === post.id ? (
                        <div className='space-y-3'>
                          <textarea
                            value={editedContent[post.id] || post.content}
                            onChange={(e) =>
                              setEditedContent({
                                ...editedContent,
                                [post.id]: e.target.value,
                              })
                            }
                            className='w-full bg-zinc-900 text-zinc-200 rounded-lg p-3 border border-zinc-600 focus:border-blue-500 focus:outline-none resize-y min-h-[120px]'
                            placeholder='Edit post content...'
                          />
                          <textarea
                            value={improvementNotes[post.id] || ''}
                            onChange={(e) =>
                              setImprovementNotes({
                                ...improvementNotes,
                                [post.id]: e.target.value,
                              })
                            }
                            className='w-full bg-zinc-900 text-zinc-200 rounded-lg p-3 border border-zinc-600 focus:border-blue-500 focus:outline-none resize-y min-h-[80px] text-sm'
                            placeholder='What improvements did you make? (Optional - helps AI learn)'
                          />
                          <div className='flex gap-2'>
                            <Button
                              onClick={() => {
                                setEditingPost(null);
                                setEditedContent({
                                  ...editedContent,
                                  [post.id]: post.content,
                                });
                                setImprovementNotes({
                                  ...improvementNotes,
                                  [post.id]: '',
                                });
                              }}
                              variant='outline'
                              className='flex-1'
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => handleApprove(post.id)}
                              className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                            >
                              <Check className='h-4 w-4 mr-2' />
                              Approve Edits
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className='text-zinc-200 whitespace-pre-wrap'>
                            {post.content}
                          </p>
                          <div className='mt-3 flex items-center gap-2 text-xs text-zinc-500'>
                            <span>{post.content.length} characters</span>
                            {post.platform === 'twitter' && (
                              <span className='text-zinc-600'>
                                • {280 - post.content.length} remaining
                              </span>
                            )}
                            {post.imageUrl && (
                              <span className='text-green-400'>
                                • Image included
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {editingSchedule === post.id && (
                      <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 space-y-3'>
                        <div className='flex gap-3'>
                          <div className='flex-1'>
                            <label className='block text-xs text-zinc-400 mb-1'>
                              Date
                            </label>
                            <input
                              type='date'
                              value={scheduleDate}
                              onChange={(e) => setScheduleDate(e.target.value)}
                              className='w-full bg-zinc-900 text-zinc-200 rounded-lg p-2 border border-zinc-600 focus:border-blue-500 focus:outline-none'
                            />
                          </div>
                          <div className='flex-1'>
                            <label className='block text-xs text-zinc-400 mb-1'>
                              Time (UTC)
                            </label>
                            <input
                              type='time'
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className='w-full bg-zinc-900 text-zinc-200 rounded-lg p-2 border border-zinc-600 focus:border-blue-500 focus:outline-none'
                            />
                          </div>
                        </div>
                        {getPlatformPostingInfo(post.platform) && (
                          <p className='text-xs text-zinc-500'>
                            Recommended:{' '}
                            {getPlatformPostingInfo(
                              post.platform,
                            )?.bestDays.join(', ')}{' '}
                            at{' '}
                            {getPlatformPostingInfo(post.platform)
                              ?.recommendedTimes.filter((t) => t.isOptimal)
                              .map((t) => t.label)
                              .join(', ')}{' '}
                            UTC
                            {getPlatformPostingInfo(post.platform)?.note && (
                              <>
                                {' '}
                                • {getPlatformPostingInfo(post.platform)?.note}
                              </>
                            )}
                          </p>
                        )}
                        <div className='flex gap-2'>
                          <Button
                            onClick={() => {
                              setEditingSchedule(null);
                              setScheduleDate('');
                              setScheduleTime('');
                            }}
                            variant='outline'
                            className='flex-1'
                            disabled={updatingSchedule === post.id}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() => handleSaveSchedule(post.id)}
                            className='flex-1 bg-blue-600 hover:bg-blue-700 text-white'
                            disabled={updatingSchedule === post.id}
                          >
                            {updatingSchedule === post.id ? (
                              <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Check className='h-4 w-4 mr-2' />
                                Save Schedule
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {post.status === 'pending' && editingPost !== post.id && (
                      <div className='space-y-3'>
                        <div className='flex gap-3'>
                          <Button
                            onClick={() => handleApprove(post.id)}
                            className='flex-1 bg-green-600 hover:bg-green-700 text-white'
                          >
                            <Check className='h-4 w-4 mr-2' />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleEditPost(post)}
                            variant='outline'
                            className='border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10'
                          >
                            <svg
                              className='h-4 w-4 mr-2'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                              />
                            </svg>
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleOpenInApp(post)}
                            variant='outline'
                            className='border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                            title={
                              post.imageUrl &&
                              ['instagram', 'pinterest', 'reddit'].includes(
                                post.platform,
                              )
                                ? `Opens ${post.platform} and copies text + image URL to clipboard`
                                : 'Opens app with content pre-filled'
                            }
                          >
                            <ExternalLink className='h-4 w-4 mr-2' />
                            {post.imageUrl &&
                            ['instagram', 'pinterest', 'reddit'].includes(
                              post.platform,
                            )
                              ? 'Copy & Open'
                              : 'Preview'}
                          </Button>
                          {post.imageUrl &&
                            ['instagram', 'pinterest', 'reddit'].includes(
                              post.platform,
                            ) && (
                              <Button
                                onClick={() =>
                                  handleDownloadImage(post.imageUrl!)
                                }
                                variant='outline'
                                className='border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
                                title='Download image'
                              >
                                <Download className='h-4 w-4 mr-2' />
                                Image
                              </Button>
                            )}
                          <Button
                            onClick={() => handleReject(post.id)}
                            disabled={rejectingPostId === post.id}
                            variant='outline'
                            className='flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10'
                          >
                            {rejectingPostId === post.id ? (
                              <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <X className='h-4 w-4 mr-2' />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                        <div>
                          <textarea
                            placeholder='Rejection feedback (optional - helps improve future posts)...'
                            value={rejectionFeedback[post.id] || ''}
                            onChange={(e) =>
                              setRejectionFeedback({
                                ...rejectionFeedback,
                                [post.id]: e.target.value,
                              })
                            }
                            className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-red-500'
                            rows={2}
                          />
                          <p className='text-xs text-zinc-500 mt-1'>
                            Your feedback helps improve AI-generated posts
                          </p>
                        </div>
                      </div>
                    )}

                    {post.status === 'approved' && (
                      <div className='space-y-3'>
                        <div className='flex gap-3'>
                          <Button
                            onClick={() => handleSendToSucculent(post)}
                            disabled={sending === post.id}
                            className='flex-1 bg-purple-600 hover:bg-purple-700 text-white'
                          >
                            {sending === post.id ? (
                              <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className='h-4 w-4 mr-2' />
                                Send to Succulent
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleOpenInApp(post)}
                            variant='outline'
                            className='border-blue-500/50 text-blue-400 hover:bg-blue-500/10'
                          >
                            <ExternalLink className='h-4 w-4 mr-2' />
                            Open in App
                          </Button>
                          <Button
                            onClick={() => handleReject(post.id)}
                            variant='outline'
                            className='border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                          >
                            <X className='h-4 w-4 mr-2' />
                            Reject
                          </Button>
                        </div>
                        <p className='text-xs text-zinc-500'>
                          "Open in App" opens {post.platform} with content
                          pre-filled (works if Succulent is unavailable)
                        </p>
                      </div>
                    )}

                    {post.status === 'sent' && (
                      <div className='flex items-center gap-2 text-green-400'>
                        <CheckCircle className='h-5 w-5' />
                        <span>Sent to Succulent</span>
                      </div>
                    )}

                    {post.status === 'rejected' && (
                      <div className='flex items-center gap-2 text-red-400'>
                        <XCircle className='h-5 w-5' />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
