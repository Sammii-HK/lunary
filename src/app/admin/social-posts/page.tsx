'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import Link from 'next/link';

export default function SocialPostsPage() {
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
            `✅ Generated ${data.posts.length} posts and saved to approval queue!`,
          );
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

  const platformIcons: Record<string, React.ReactNode> = {
    instagram: <Instagram className='h-4 w-4' />,
    twitter: <Twitter className='h-4 w-4' />,
    facebook: <Facebook className='h-4 w-4' />,
    linkedin: <Linkedin className='h-4 w-4' />,
    pinterest: <ImageIcon className='h-4 w-4' />,
    reddit: <FileText className='h-4 w-4' />,
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
              <Sparkles className='h-8 w-8 text-purple-400' />
              AI Social Media Post Generator
            </h1>
            <p className='text-zinc-400'>
              Generate natural, conversion-focused social media posts using AI
            </p>
          </div>
          <Link href='/admin/social-posts/approve'>
            <Button
              variant='outline'
              className='border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
            >
              <CheckCircle className='h-4 w-4 mr-2' />
              Approval Queue
            </Button>
          </Link>
        </div>

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
                <label className='block text-sm font-medium mb-2'>Week</label>
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
                    setFormData({ ...formData, includeCTA: e.target.checked })
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
                className='w-full bg-purple-600 hover:bg-purple-700 text-white'
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
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const response = await fetch(
                      '/api/admin/social-posts/generate-weekly',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({}),
                      },
                    );
                    const data = await response.json();
                    if (data.success) {
                      alert(
                        `✅ Generated ${data.savedIds.length} posts for the week!\n\nWeek: ${data.weekRange}\n\nYou'll receive a Pushover notification.`,
                      );
                    } else {
                      alert(`Failed: ${data.error}`);
                    }
                  } catch (error) {
                    alert('Failed to generate weekly posts');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                variant='outline'
                className='w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10'
              >
                <Calendar className='h-4 w-4 mr-2' />
                Generate Weekly Posts
              </Button>
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
                      <span className='text-xs text-zinc-500'>
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
    </div>
  );
}
