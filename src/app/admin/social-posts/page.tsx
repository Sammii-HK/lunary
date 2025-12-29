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
  Sparkles,
  Loader2,
  Copy,
  Check,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  FileText,
  CheckCircle,
  Calendar,
  Image as ImageIcon,
  X,
  Send,
  XCircle,
  ExternalLink,
  Download,
  Edit2,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { getDefaultPostingTime } from '@/utils/posting-times';

type TabType = 'generate' | 'approve';

interface PendingPost {
  id: string;
  content: string;
  platform: string;
  postType: string;
  topic?: string;
  scheduledDate?: string;
  imageUrl?: string;
  videoUrl?: string;
  weekTheme?: string;
  weekStart?: string;
  videoScriptId?: number;
  videoScript?: string;
  videoScriptPlatform?: string;
  videoThemeName?: string;
  videoPartNumber?: number;
  videoCoverImageUrl?: string;
  videoJobStatus?: string;
  videoJobAttempts?: number;
  videoJobError?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
}

export default function SocialPostsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('approve');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    postType: 'benefit',
    platform: 'instagram',
    topic: '',
    tone: 'natural',
    includeCTA: true,
    count: 3,
    weekOffset: 0,
  });

  const [pendingPosts, setPendingPosts] = useState<PendingPost[]>([]);
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
  const [useThematicMode, setUseThematicMode] = useState(true);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [videosOnly, setVideosOnly] = useState(false);
  const [videoJobFeedback, setVideoJobFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const getWeekStartForOffset = (offset: number): string => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() + offset * 7);
    return monday.toISOString();
  };

  const handleGenerateWeekly = async (weekOffset: number) => {
    setLoading(true);
    try {
      if (videosOnly) {
        const response = await fetch(
          '/api/admin/video-scripts/generate-videos',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              weekStart: getWeekStartForOffset(weekOffset),
            }),
          },
        );
        const data = await response.json();
        if (!data.success) {
          alert(data.error || data.message || 'Failed to generate videos');
        } else {
          alert(`Generated ${data.generated} videos for the week.`);
        }
      } else {
        const response = await fetch(
          '/api/admin/social-posts/generate-weekly',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              currentWeek: weekOffset === 0,
              weekStart:
                weekOffset === 0 ? null : getWeekStartForOffset(weekOffset),
              mode: useThematicMode ? 'thematic' : 'legacy',
              replaceExisting,
            }),
          },
        );
        const data = await response.json();
        if (data.success) {
          const themeInfo = data.theme ? ` Theme: ${data.theme}` : '';
          alert(
            `Generated ${data.savedIds.length} posts for the week!${themeInfo}`,
          );
          loadPendingPosts();
          setActiveTab('approve');
        } else {
          alert(`Failed: ${data.error}`);
        }
      }
    } catch (error) {
      alert(
        videosOnly ? 'Failed to generate videos' : 'Failed to generate posts',
      );
    } finally {
      setLoading(false);
    }
  };

  const resolveQueueWeekStart = (): string => {
    const firstPending = pendingPosts.find((post) => post.scheduledDate);
    if (!firstPending?.scheduledDate) {
      return getWeekStartForOffset(0);
    }
    const date = new Date(firstPending.scheduledDate);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  };

  const resolveQueueWeekTheme = (): string | null => {
    const counts = new Map<string, number>();
    for (const post of pendingPosts) {
      if (!post.weekTheme) continue;
      counts.set(post.weekTheme, (counts.get(post.weekTheme) || 0) + 1);
    }
    let bestTheme: string | null = null;
    let bestCount = 0;
    for (const [theme, count] of counts.entries()) {
      if (count > bestCount) {
        bestTheme = theme;
        bestCount = count;
      }
    }
    return bestTheme;
  };

  const handleRefreshImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/social-posts/refresh-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: resolveQueueWeekStart(),
          fixNaN: true,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to refresh post images');
      } else {
        alert(`Refreshed ${data.updated} post images.`);
        loadPendingPosts();
      }
    } catch (error) {
      alert('Failed to refresh post images');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshVideoCovers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/video-scripts/refresh-covers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: resolveQueueWeekStart(),
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to refresh video covers');
      } else {
        alert(`Refreshed ${data.updated} video covers.`);
      }
    } catch (error) {
      alert('Failed to refresh video covers');
    } finally {
      setLoading(false);
    }
  };

  const handleRequeueVideos = async () => {
    if (
      !confirm(
        'Requeue videos for the approval queue week? This will only rebuild missing videos and will not re-generate existing ones.',
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const weekTheme = resolveQueueWeekTheme();
      const response = await fetch('/api/admin/video-scripts/requeue-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: resolveQueueWeekStart(),
          forceThemeName: weekTheme,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to requeue videos');
      } else {
        await handleProcessVideoJobs();
        alert('Video jobs requeued. The worker has been triggered.');
        loadPendingPosts();
      }
    } catch (error) {
      alert('Failed to requeue videos');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessVideoJobs = async (force = false) => {
    setLoading(true);
    setVideoJobFeedback(null);
    try {
      const response = await fetch(
        `/api/admin/video-jobs/process?limit=1${force ? '&force=true' : ''}`,
        {
          method: 'POST',
        },
      );
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to process video jobs');
      } else {
        const processed = data.processed ?? 0;
        setVideoJobFeedback(
          processed > 0
            ? `Processed ${processed} video job${processed > 1 ? 's' : ''}.`
            : 'No queued video jobs found.',
        );
        loadPendingPosts();
      }
    } catch (error) {
      alert('Failed to process video jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleForceRebuildVideos = async () => {
    if (
      !confirm(
        'Force rebuild videos for the approval queue week? This regenerates the video files using the existing scripts.',
      )
    ) {
      return;
    }
    setLoading(true);
    try {
      const weekTheme = resolveQueueWeekTheme();
      const response = await fetch('/api/admin/video-scripts/requeue-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekStart: resolveQueueWeekStart(),
          forceRebuild: true,
          forceThemeName: weekTheme,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        alert(data.error || 'Failed to force rebuild videos');
      } else {
        await handleProcessVideoJobs(true);
        alert(
          'Video jobs requeued for rebuild. The worker has been triggered.',
        );
        loadPendingPosts();
      }
    } catch (error) {
      alert('Failed to force rebuild videos');
    } finally {
      setLoading(false);
    }
  };

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

  const handleGenerate = async () => {
    setLoading(true);
    setPosts([]);
    try {
      const response = await fetch('/api/admin/social-posts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setPosts(data.posts || []);
        if (data.savedIds?.length > 0) {
          alert(
            `Generated ${data.posts.length} posts and saved to approval queue!`,
          );
          loadPendingPosts();
          setActiveTab('approve');
        }
      } else {
        alert(`Failed to generate posts: ${data.error}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate posts');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
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
      if (!userFeedback) return;
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
          videoUrl: post.videoUrl,
          postType: post.postType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Post sent to Succulent successfully!');
        loadPendingPosts();
      } else {
        alert(`Failed to send: ${data.error}`);
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
    )
      return;

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
            videoUrl: post.videoUrl,
            postType: post.postType,
          }),
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        failedCount++;
      }

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

    if (failedCount === 0) {
      alert(
        `Successfully sent all ${successCount} post${successCount > 1 ? 's' : ''} to Succulent!`,
      );
    } else {
      alert(
        `Sent ${successCount} post${successCount > 1 ? 's' : ''} successfully, ${failedCount} failed.`,
      );
    }

    await loadPendingPosts();
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
      if (data.success && data.url) {
        await navigator.clipboard.writeText(post.content);
        window.open(data.url, '_blank');
      }
    } catch (error) {
      await navigator.clipboard.writeText(post.content);
      alert(
        `Content copied to clipboard. Open ${post.platform} manually and paste.`,
      );
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
        body: JSON.stringify({ postId, scheduledDate: dateTime.toISOString() }),
      });

      const data = await response.json();
      if (data.success) {
        setEditingSchedule(null);
        loadPendingPosts();
      } else {
        alert(`Failed to update schedule: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to update schedule');
    } finally {
      setUpdatingSchedule(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className='bg-lunary-accent-900 text-lunary-accent border-lunary-accent-700'>
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge className='bg-lunary-success-900 text-lunary-success border-lunary-success-800'>
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className='bg-lunary-error-900 text-lunary-error border-lunary-error-800'>
            Rejected
          </Badge>
        );
      case 'sent':
        return (
          <Badge className='bg-lunary-secondary-900 text-lunary-secondary border-lunary-secondary-800'>
            Sent
          </Badge>
        );
      default:
        return null;
    }
  };

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className='h-4 w-4' />,
    twitter: <Twitter className='h-4 w-4' />,
    facebook: <Facebook className='h-4 w-4' />,
    linkedin: <Linkedin className='h-4 w-4' />,
    pinterest: <ImageIcon className='h-4 w-4' />,
    reddit: <FileText className='h-4 w-4' />,
  };

  const pendingCount = pendingPosts.filter(
    (p) => p.status === 'pending',
  ).length;
  const approvedCount = pendingPosts.filter(
    (p) => p.status === 'approved',
  ).length;
  const queuedVideoCount = pendingPosts.filter(
    (p) =>
      (p.postType === 'video' || p.postType === 'educational') &&
      p.videoJobStatus === 'pending',
  ).length;
  const processingVideoCount = pendingPosts.filter(
    (p) =>
      (p.postType === 'video' || p.postType === 'educational') &&
      p.videoJobStatus === 'processing',
  ).length;
  const failedVideoCount = pendingPosts.filter(
    (p) =>
      (p.postType === 'video' || p.postType === 'educational') &&
      p.videoJobStatus === 'failed',
  ).length;

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <div className='flex items-start justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
              <Sparkles className='h-8 w-8 text-lunary-primary-400' />
              Social Media Manager
            </h1>
            <p className='text-zinc-400'>
              Generate and manage social media posts
            </p>
          </div>
          <Link href='/admin/video-scripts'>
            <Button
              variant='outline'
              className='border-pink-500/30 text-pink-400 hover:bg-pink-500/10 hover:text-pink-300'
            >
              <Video className='w-4 h-4 mr-2' />
              Video Scripts
            </Button>
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className='flex gap-4 border-b border-zinc-800'>
          <button
            onClick={() => setActiveTab('approve')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'approve'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Approval Queue
            {pendingCount > 0 && (
              <Badge className='ml-2 bg-lunary-accent-900 text-lunary-accent border-lunary-accent-700 text-xs'>
                {pendingCount}
              </Badge>
            )}
            {activeTab === 'approve' && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-lunary-primary-500' />
            )}
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'generate'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-300'
            }`}
          >
            Generate Posts
            {activeTab === 'generate' && (
              <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-lunary-primary-500' />
            )}
          </button>
        </div>

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className='space-y-6'>
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader>
                <CardTitle>Post Configuration</CardTitle>
                <CardDescription>
                  Configure your post generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Platform
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) =>
                        setFormData({ ...formData, platform: e.target.value })
                      }
                      className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white'
                    >
                      <option value='instagram'>Instagram</option>
                      <option value='twitter'>Twitter/X</option>
                      <option value='pinterest'>Pinterest</option>
                      <option value='reddit'>Reddit</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Post Type
                    </label>
                    <select
                      value={formData.postType}
                      onChange={(e) =>
                        setFormData({ ...formData, postType: e.target.value })
                      }
                      className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white'
                    >
                      <option value='feature'>Feature Highlight</option>
                      <option value='benefit'>User Benefits</option>
                      <option value='educational'>Educational</option>
                      <option value='inspirational'>Inspirational</option>
                      <option value='behind_scenes'>Behind the Scenes</option>
                      <option value='promotional'>Promotional</option>
                      <option value='user_story'>User Story</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Topic (Optional)
                    </label>
                    <input
                      type='text'
                      value={formData.topic}
                      onChange={(e) =>
                        setFormData({ ...formData, topic: e.target.value })
                      }
                      placeholder='e.g., Birth charts, Daily horoscopes'
                      className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Number of Posts
                    </label>
                    <input
                      type='number'
                      min='1'
                      max='10'
                      value={formData.count}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          count: parseInt(e.target.value) || 3,
                        })
                      }
                      className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      Week
                    </label>
                    <select
                      value={formData.weekOffset}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          weekOffset: parseInt(e.target.value) || 0,
                        })
                      }
                      className='w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white'
                    >
                      <option value={0}>Current Week</option>
                      <option value={1}>Next Week (+1)</option>
                      <option value={2}>+2 Weeks</option>
                      <option value={3}>+3 Weeks</option>
                      <option value={4}>+4 Weeks</option>
                    </select>
                  </div>
                </div>

                <div className='flex items-center gap-4'>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={formData.includeCTA}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          includeCTA: e.target.checked,
                        })
                      }
                      className='w-4 h-4 rounded border-zinc-700 bg-zinc-800'
                    />
                    <span className='text-sm'>Include Call-to-Action</span>
                  </label>
                </div>

                <div className='space-y-3'>
                  <Button
                    onClick={handleGenerate}
                    disabled={loading}
                    className='w-full bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Generating Posts...
                      </>
                    ) : (
                      <>
                        <Sparkles className='h-4 w-4 mr-2' />
                        Generate Posts
                      </>
                    )}
                  </Button>
                  {/* Thematic Mode Toggle */}
                  <div className='flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                    <input
                      type='checkbox'
                      id='thematic-mode'
                      checked={useThematicMode}
                      onChange={(e) => setUseThematicMode(e.target.checked)}
                      className='w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-lunary-primary-500 focus:ring-lunary-primary-500'
                    />
                    <label
                      htmlFor='thematic-mode'
                      className='text-sm text-zinc-300 cursor-pointer'
                    >
                      Use thematic content (weekly themes with daily facets)
                    </label>
                  </div>
                  <div className='flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                    <input
                      type='checkbox'
                      id='replace-existing'
                      checked={replaceExisting}
                      onChange={(e) => setReplaceExisting(e.target.checked)}
                      className='w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-lunary-primary-500 focus:ring-lunary-primary-500'
                    />
                    <label
                      htmlFor='replace-existing'
                      className='text-sm text-zinc-300 cursor-pointer'
                    >
                      Replace existing pending + approved posts for that week
                    </label>
                  </div>
                  <div className='flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                    <input
                      type='checkbox'
                      id='videos-only'
                      checked={videosOnly}
                      onChange={(e) => setVideosOnly(e.target.checked)}
                      className='w-4 h-4 rounded border-zinc-600 bg-zinc-700 text-lunary-primary-500 focus:ring-lunary-primary-500'
                    />
                    <label
                      htmlFor='videos-only'
                      className='text-sm text-zinc-300 cursor-pointer'
                    >
                      Generate videos only (skip post regeneration)
                    </label>
                  </div>

                  <div className='grid grid-cols-3 gap-3'>
                    <Button
                      onClick={() => handleGenerateWeekly(0)}
                      disabled={loading}
                      variant='outline'
                      className='border-lunary-success-700 text-lunary-success hover:bg-lunary-success-950'
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      Current Week
                    </Button>
                    <Button
                      onClick={() => handleGenerateWeekly(1)}
                      disabled={loading}
                      variant='outline'
                      className='border-lunary-primary-600 text-lunary-primary-400 hover:bg-lunary-primary-900/10'
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      Next Week
                    </Button>
                    <Button
                      onClick={() => handleGenerateWeekly(2)}
                      disabled={loading}
                      variant='outline'
                      className='border-lunary-secondary-600 text-lunary-secondary-400 hover:bg-lunary-secondary-900/10'
                    >
                      <Calendar className='h-4 w-4 mr-2' />
                      Week After Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {posts.length > 0 && (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    {platformIcons[formData.platform]}
                    Generated Posts ({posts.length})
                  </CardTitle>
                  <CardDescription>
                    Click the copy button to copy each post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {posts.map((post, index) => (
                      <div
                        key={index}
                        className='p-4 bg-zinc-800 rounded-lg border border-zinc-700 relative group'
                      >
                        <p className='text-zinc-200 whitespace-pre-wrap mb-3'>
                          {post}
                        </p>
                        <div className='flex items-center justify-between'>
                          <span className='text-xs text-zinc-400'>
                            {post.length} characters
                          </span>
                          <Button
                            onClick={() => copyToClipboard(post, index)}
                            variant='ghost'
                            size='sm'
                            className='h-8 text-zinc-400 hover:text-white'
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className='h-4 w-4 mr-1' />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className='h-4 w-4 mr-1' />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Approve Tab */}
        {activeTab === 'approve' && (
          <div className='space-y-6'>
            <div className='flex items-center justify-between'>
              <div className='flex gap-4 items-center'>
                <div className='text-center px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
                  <div className='text-2xl font-bold text-lunary-accent'>
                    {pendingCount}
                  </div>
                  <div className='text-xs text-zinc-400'>Pending</div>
                </div>
                <div className='text-center px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800'>
                  <div className='text-2xl font-bold text-lunary-success'>
                    {approvedCount}
                  </div>
                  <div className='text-xs text-zinc-400'>Approved</div>
                </div>
                {(queuedVideoCount > 0 ||
                  processingVideoCount > 0 ||
                  failedVideoCount > 0) && (
                  <div className='flex gap-2 items-center text-xs text-zinc-300'>
                    {queuedVideoCount > 0 && (
                      <Badge className='bg-zinc-800 text-zinc-200 border-zinc-600'>
                        {queuedVideoCount} queued
                      </Badge>
                    )}
                    {processingVideoCount > 0 && (
                      <Badge className='bg-lunary-primary-900/30 text-lunary-primary-300 border-lunary-primary-700'>
                        {processingVideoCount} processing
                      </Badge>
                    )}
                    {failedVideoCount > 0 && (
                      <Badge className='bg-lunary-error-900/30 text-lunary-error border-lunary-error-700'>
                        {failedVideoCount} failed
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <div className='flex gap-3'>
                <Button
                  onClick={handleRefreshImages}
                  disabled={loading}
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                >
                  Refresh Post Images (Queue Week)
                </Button>
                <Button
                  onClick={handleRefreshVideoCovers}
                  disabled={loading}
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                >
                  Refresh Video Covers (Queue Week)
                </Button>
                <Button
                  onClick={handleRequeueVideos}
                  disabled={loading}
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                >
                  Requeue Videos (Queue Week)
                </Button>
                <Button
                  onClick={handleForceRebuildVideos}
                  disabled={loading}
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                >
                  Force Rebuild Videos (Queue Week)
                </Button>
                <Button
                  onClick={handleProcessVideoJobs}
                  disabled={loading}
                  variant='outline'
                  className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                >
                  Process Video Jobs Now
                </Button>
                {pendingCount > 0 && (
                  <>
                    <Button
                      onClick={() => handleBulkAction('approve_all')}
                      disabled={bulkActionLoading !== null}
                      variant='outline'
                      className='border-lunary-success-600 text-lunary-success hover:bg-lunary-success-400/20'
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
                      className='border-lunary-error-600 text-lunary-error hover:bg-lunary-error-400/20'
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
                    className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                  >
                    {sendingAll ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className='h-4 w-4 mr-2' />
                        Send All ({approvedCount})
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {videoJobFeedback && (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardContent className='py-3 text-sm text-zinc-300'>
                  {videoJobFeedback}
                </CardContent>
              </Card>
            )}

            {sendAllProgress && (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardContent className='py-4'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='flex items-center gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin text-lunary-primary-400' />
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
                      className='bg-lunary-primary-600 h-full transition-all duration-300'
                      style={{
                        width: `${(sendAllProgress.current / sendAllProgress.total) * 100}%`,
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {pendingPosts.length === 0 ? (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardContent className='py-12 text-center'>
                  <Sparkles className='h-12 w-12 mx-auto mb-4 text-zinc-600' />
                  <p className='text-zinc-400'>No posts pending approval</p>
                  <p className='text-sm text-zinc-400 mt-2'>
                    Generate posts from the Generate tab
                  </p>
                  <Button
                    onClick={() => setActiveTab('generate')}
                    variant='outline'
                    className='mt-4'
                  >
                    <Sparkles className='h-4 w-4 mr-2' />
                    Generate Posts
                  </Button>
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
                            {post.platform === 'reddit' && (
                              <Badge className='bg-lunary-rose-900 text-lunary-rose border-lunary-rose-700'>
                                r/lunary_insights
                              </Badge>
                            )}
                            {getStatusBadge(post.status)}
                            <Badge className='bg-lunary-primary-900/20 text-lunary-primary-400 border-lunary-primary-700 capitalize'>
                              {post.postType}
                            </Badge>
                            {!post.videoUrl && post.videoJobStatus && (
                              <Badge className='bg-zinc-800 text-zinc-200 border-zinc-600 capitalize'>
                                Video {post.videoJobStatus}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className='text-zinc-400'>
                            {post.platform === 'reddit' && (
                              <span className='text-lunary-rose font-medium'>
                                r/lunary_insights •{' '}
                              </span>
                            )}
                            {post.topic && `Topic: ${post.topic} • `}
                            {post.weekStart &&
                              `Week of ${new Date(post.weekStart).toLocaleDateString()} • `}
                            {post.weekTheme && `Theme: ${post.weekTheme} • `}
                            Created: {new Date(post.createdAt).toLocaleString()}
                            {post.scheduledDate &&
                              ` • Scheduled: ${new Date(post.scheduledDate).toLocaleString()}`}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className='space-y-4'>
                        {post.videoUrl && (
                          <div className='relative w-full max-w-md mx-auto'>
                            <video
                              src={post.videoUrl}
                              controls
                              className='w-full rounded-lg border border-zinc-700 bg-black'
                            />
                            <div className='absolute top-2 right-2 flex gap-2'>
                              <button
                                onClick={() =>
                                  window.open(post.videoUrl, '_blank')
                                }
                                className='bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1'
                              >
                                <ExternalLink className='h-3 w-3' />
                                Open
                              </button>
                            </div>
                          </div>
                        )}
                        {post.videoScript && (
                          <details className='bg-zinc-800/50 rounded-lg border border-zinc-700 p-3'>
                            <summary className='cursor-pointer text-sm text-zinc-300 flex items-center gap-2'>
                              <FileText className='h-4 w-4' />
                              Video script
                              {post.videoPartNumber
                                ? ` • Part ${post.videoPartNumber}`
                                : ''}
                            </summary>
                            <p className='mt-3 text-zinc-200 whitespace-pre-wrap text-sm'>
                              {post.videoScript}
                            </p>
                          </details>
                        )}
                        {post.videoJobStatus === 'failed' &&
                          post.videoJobError && (
                            <div className='text-sm text-lunary-error'>
                              Video job failed: {post.videoJobError}
                            </div>
                          )}
                        {post.imageUrl && (
                          <div className='relative w-full max-w-md mx-auto'>
                            <Image
                              src={post.imageUrl}
                              alt='Post image'
                              width={800}
                              height={800}
                              className='w-full rounded-lg border border-zinc-700 cursor-pointer hover:opacity-90'
                              onClick={() =>
                                window.open(post.imageUrl, '_blank')
                              }
                              unoptimized
                            />
                            <div className='absolute top-2 right-2 flex gap-2'>
                              <button
                                onClick={() =>
                                  handleDownloadImage(post.imageUrl!)
                                }
                                className='bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-xs flex items-center gap-1'
                              >
                                <Download className='h-3 w-3' />
                                Save
                              </button>
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
                                className='w-full bg-zinc-900 text-zinc-200 rounded-lg p-3 border border-zinc-600 focus:border-lunary-secondary focus:outline-none resize-y min-h-[120px]'
                              />
                              <div className='flex gap-2'>
                                <Button
                                  onClick={() => {
                                    setEditingPost(null);
                                    setEditedContent({
                                      ...editedContent,
                                      [post.id]: post.content,
                                    });
                                  }}
                                  variant='outline'
                                  className='flex-1'
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={() => handleApprove(post.id)}
                                  className='flex-1 bg-lunary-success-600 hover:bg-lunary-success-700 text-white'
                                >
                                  <Check className='h-4 w-4 mr-2' />
                                  Approve Edits
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className='text-zinc-200 whitespace-pre-wrap'>
                              {post.content}
                            </p>
                          )}
                        </div>

                        {post.status === 'pending' &&
                          editingPost !== post.id && (
                            <div className='flex gap-3'>
                              <Button
                                onClick={() => handleApprove(post.id)}
                                className='flex-1 bg-lunary-success-600 hover:bg-lunary-success-700 text-white'
                              >
                                <Check className='h-4 w-4 mr-2' />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleEditPost(post)}
                                variant='outline'
                                className='border-lunary-accent-700 text-lunary-accent hover:bg-lunary-accent-950'
                              >
                                <Edit2 className='h-4 w-4 mr-2' />
                                Edit
                              </Button>
                              <Button
                                onClick={() => handleOpenInApp(post)}
                                variant='outline'
                                className='border-lunary-secondary-700 text-lunary-secondary hover:bg-lunary-secondary-950'
                              >
                                <ExternalLink className='h-4 w-4 mr-2' />
                                Preview
                              </Button>
                              <Button
                                onClick={() => handleReject(post.id)}
                                disabled={rejectingPostId === post.id}
                                variant='outline'
                                className='flex-1 border-lunary-error-700 text-lunary-error hover:bg-lunary-error-950'
                              >
                                {rejectingPostId === post.id ? (
                                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                ) : (
                                  <X className='h-4 w-4 mr-2' />
                                )}
                                Reject
                              </Button>
                            </div>
                          )}

                        {post.status === 'approved' && (
                          <div className='flex gap-3'>
                            <Button
                              onClick={() => handleSendToSucculent(post)}
                              disabled={sending === post.id}
                              className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                            >
                              {sending === post.id ? (
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                              ) : (
                                <Send className='h-4 w-4 mr-2' />
                              )}
                              Send to Succulent
                            </Button>
                            <Button
                              onClick={() => handleOpenInApp(post)}
                              variant='outline'
                              className='border-lunary-secondary-700 text-lunary-secondary hover:bg-lunary-secondary-950'
                            >
                              <ExternalLink className='h-4 w-4 mr-2' />
                              Open in App
                            </Button>
                          </div>
                        )}

                        {post.status === 'sent' && (
                          <div className='flex items-center gap-2 text-lunary-success'>
                            <CheckCircle className='h-5 w-5' />
                            <span>Sent to Succulent</span>
                          </div>
                        )}

                        {post.status === 'rejected' && (
                          <div className='flex items-center gap-2 text-lunary-error'>
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
        )}
      </div>
    </div>
  );
}
