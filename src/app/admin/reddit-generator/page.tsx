'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Copy,
  Check,
  MessageCircle,
  Search,
  ArrowUpRight,
  ThumbsUp,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SUBREDDIT_TONES } from '@/lib/social/platform-strategies/reddit';

type Format = 'reply' | 'post';
type Tab = 'discover' | 'generate' | 'batch';
type Sort = 'new' | 'hot' | 'rising';

interface GeneratedContent {
  title?: string;
  body: string;
  flair?: string;
  subreddit: string;
  format: Format;
  topic: string;
  generatedAt: string;
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  score: number;
  numComments: number;
  url: string;
  permalink: string;
  created: number;
  flair?: string;
  subreddit: string;
}

interface BatchItem {
  subreddit: string;
  subredditDisplay: string;
  topic: string;
  title?: string;
  body: string;
  flair?: string;
  format: Format;
}

const subreddits = Object.values(SUBREDDIT_TONES);

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function RedditGeneratorPage() {
  const [tab, setTab] = useState<Tab>('discover');
  const [subreddit, setSubreddit] = useState('astrology');
  const [sort, setSort] = useState<Sort>('new');
  const [format, setFormat] = useState<Format>('reply');
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [copied, setCopied] = useState(false);

  // Discovery state
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [generatingReplyFor, setGeneratingReplyFor] = useState<string | null>(
    null,
  );

  // Batch state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [generatingBatch, setGeneratingBatch] = useState(false);
  const [copiedBatchIdx, setCopiedBatchIdx] = useState<number | null>(null);

  const selectedSub = SUBREDDIT_TONES[subreddit];

  const loadPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch(
        `/api/admin/reddit/discover?subreddit=${subreddit}&sort=${sort}&limit=15`,
      );
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  }, [subreddit, sort]);

  useEffect(() => {
    if (tab === 'discover') {
      loadPosts();
    }
  }, [tab, subreddit, sort, loadPosts]);

  const generate = async () => {
    if (!topic.trim()) return;

    try {
      setGenerating(true);
      const response = await fetch('/api/admin/reddit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subreddit,
          format,
          topic,
          question: format === 'reply' ? question || topic : undefined,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const generated: GeneratedContent = {
          ...data.content,
          subreddit,
          format,
          topic,
          generatedAt: new Date().toISOString(),
        };
        setContent(generated);
        setHistory((prev) => [generated, ...prev].slice(0, 20));
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const generateReplyForPost = async (post: RedditPost) => {
    try {
      setGeneratingReplyFor(post.id);
      const response = await fetch('/api/admin/reddit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subreddit: post.subreddit,
          format: 'reply',
          topic: post.title,
          question: post.selftext
            ? `${post.title}\n\n${post.selftext}`
            : post.title,
        }),
      });
      const data = await response.json();
      if (data.success) {
        const generated: GeneratedContent = {
          ...data.content,
          subreddit: post.subreddit,
          format: 'reply',
          topic: post.title,
          generatedAt: new Date().toISOString(),
        };
        setContent(generated);
        setHistory((prev) => [generated, ...prev].slice(0, 20));
        setTab('generate');
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate reply');
    } finally {
      setGeneratingReplyFor(null);
    }
  };

  const copyContent = () => {
    if (!content) return;
    const text = content.title
      ? `${content.title}\n\n${content.body}`
      : content.body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateBatch = async () => {
    try {
      setGeneratingBatch(true);
      const response = await fetch('/api/admin/reddit/daily-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 5 }),
      });
      const data = await response.json();
      if (data.success) {
        setBatchItems(data.batch);
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Batch generation failed:', error);
      alert('Failed to generate batch');
    } finally {
      setGeneratingBatch(false);
    }
  };

  const copyBatchItem = (item: BatchItem, idx: number) => {
    const text = item.title ? `${item.title}\n\n${item.body}` : item.body;
    navigator.clipboard.writeText(text);
    setCopiedBatchIdx(idx);
    setTimeout(() => setCopiedBatchIdx(null), 2000);
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-5xl'>
        <div className='mb-6'>
          <h1 className='text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3'>
            <MessageCircle className='h-8 w-8 md:h-10 md:w-10' />
            Reddit Generator
          </h1>
          <p className='text-zinc-400'>
            Discover posts to answer and generate subreddit-specific content
          </p>
        </div>

        {/* Tab Switcher */}
        <div className='flex gap-2 mb-6'>
          <Button
            variant={tab === 'discover' ? 'default' : 'outline'}
            onClick={() => setTab('discover')}
            className={
              tab === 'discover'
                ? 'bg-lunary-primary-600'
                : 'border-zinc-700 text-zinc-400'
            }
          >
            <Search className='h-4 w-4 mr-2' />
            Discover Posts
          </Button>
          <Button
            variant={tab === 'generate' ? 'default' : 'outline'}
            onClick={() => setTab('generate')}
            className={
              tab === 'generate'
                ? 'bg-lunary-primary-600'
                : 'border-zinc-700 text-zinc-400'
            }
          >
            <Sparkles className='h-4 w-4 mr-2' />
            Generate Content
          </Button>
          <Button
            variant={tab === 'batch' ? 'default' : 'outline'}
            onClick={() => setTab('batch')}
            className={
              tab === 'batch'
                ? 'bg-lunary-primary-600'
                : 'border-zinc-700 text-zinc-400'
            }
          >
            <Zap className='h-4 w-4 mr-2' />
            Daily Batch
          </Button>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Left: Controls */}
          <div className='space-y-4'>
            {/* Subreddit Selector */}
            <Card className='bg-zinc-900 border-zinc-800'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Subreddit</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {subreddits.map((sub) => (
                  <button
                    key={sub.name}
                    onClick={() => setSubreddit(sub.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      subreddit === sub.name
                        ? 'bg-lunary-primary-600/20 border border-lunary-primary-600 text-white'
                        : 'bg-zinc-800/50 border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <div className='font-medium'>{sub.displayName}</div>
                    <div className='text-xs text-zinc-500 mt-0.5'>
                      {sub.description}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {tab === 'batch' ? (
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>How It Works</CardTitle>
                </CardHeader>
                <CardContent className='text-xs text-zinc-400 space-y-2'>
                  <p>
                    Generates a mix of original posts and reply-format answers
                    across all subreddits.
                  </p>
                  <p>
                    Topics rotate daily from each subreddit&apos;s common
                    questions. Copy and manually post to Reddit.
                  </p>
                </CardContent>
              </Card>
            ) : tab === 'discover' ? (
              /* Sort Options */
              <Card className='bg-zinc-900 border-zinc-800'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-sm'>Sort By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='flex gap-2'>
                    {(['new', 'hot', 'rising'] as const).map((s) => (
                      <Button
                        key={s}
                        size='sm'
                        variant={sort === s ? 'default' : 'outline'}
                        onClick={() => setSort(s)}
                        className={
                          sort === s
                            ? 'bg-lunary-primary-600'
                            : 'border-zinc-700 text-zinc-400'
                        }
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Format Toggle */}
                <Card className='bg-zinc-900 border-zinc-800'>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-sm'>Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='flex gap-2'>
                      <Button
                        size='sm'
                        variant={format === 'reply' ? 'default' : 'outline'}
                        onClick={() => setFormat('reply')}
                        className={
                          format === 'reply'
                            ? 'bg-lunary-primary-600'
                            : 'border-zinc-700 text-zinc-400'
                        }
                      >
                        Reply
                      </Button>
                      <Button
                        size='sm'
                        variant={format === 'post' ? 'default' : 'outline'}
                        onClick={() => setFormat('post')}
                        className={
                          format === 'post'
                            ? 'bg-lunary-primary-600'
                            : 'border-zinc-700 text-zinc-400'
                        }
                      >
                        Original Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Questions */}
                {selectedSub && (
                  <Card className='bg-zinc-900 border-zinc-800'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm'>
                        Common Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-1'>
                      {selectedSub.commonQuestions.map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setTopic(q);
                            if (format === 'reply') setQuestion(q);
                          }}
                          className='w-full text-left px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors'
                        >
                          {q}
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          {/* Right: Content Area */}
          <div className='lg:col-span-2 space-y-4'>
            {tab === 'batch' ? (
              /* Daily Batch */
              <>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-medium'>
                    Daily Batch{' '}
                    <span className='text-zinc-500 text-sm'>
                      &middot; {batchItems.length} items
                    </span>
                  </h2>
                  <Button
                    onClick={generateBatch}
                    disabled={generatingBatch}
                    className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                  >
                    {generatingBatch ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Generating batch...
                      </>
                    ) : (
                      <>
                        <Zap className='h-4 w-4 mr-2' />
                        Generate Today&apos;s Batch
                      </>
                    )}
                  </Button>
                </div>

                {batchItems.length === 0 && !generatingBatch && (
                  <Card className='bg-zinc-900 border-zinc-800'>
                    <CardContent className='py-12 text-center'>
                      <Zap className='h-10 w-10 mx-auto mb-4 text-zinc-600' />
                      <p className='text-zinc-400 mb-2'>
                        Generate 5 Reddit-ready posts and replies across
                        subreddits
                      </p>
                      <p className='text-xs text-zinc-500'>
                        Mix of original posts and reply-format answers, rotated
                        daily from common questions
                      </p>
                    </CardContent>
                  </Card>
                )}

                {batchItems.map((item, idx) => (
                  <Card key={idx} className='bg-zinc-900 border-zinc-800'>
                    <CardHeader className='pb-2'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='border-zinc-700 text-zinc-400'
                          >
                            {item.subredditDisplay}
                          </Badge>
                          <Badge
                            className={
                              item.format === 'post'
                                ? 'bg-lunary-accent/20 text-lunary-accent border-lunary-accent/30'
                                : 'bg-lunary-primary-600/20 text-lunary-primary-300 border-lunary-primary-600/30'
                            }
                          >
                            {item.format}
                          </Badge>
                          {item.flair && (
                            <Badge className='bg-lunary-secondary-900 text-lunary-secondary border-lunary-secondary-800'>
                              {item.flair}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => copyBatchItem(item, idx)}
                          className='border-zinc-700 text-zinc-300'
                        >
                          {copiedBatchIdx === idx ? (
                            <Check className='h-4 w-4 text-lunary-success' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                          <span className='ml-1'>
                            {copiedBatchIdx === idx ? 'Copied' : 'Copy'}
                          </span>
                        </Button>
                      </div>
                      <CardDescription className='text-xs mt-1'>
                        Topic: {item.topic}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {item.title && (
                        <h3 className='text-sm font-semibold text-white mb-2'>
                          {item.title}
                        </h3>
                      )}
                      <div className='text-sm text-zinc-300 bg-zinc-800/50 p-4 rounded-lg whitespace-pre-wrap'>
                        {item.body}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : tab === 'discover' ? (
              /* Discovery Feed */
              <>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg font-medium'>
                    r/{subreddit}{' '}
                    <span className='text-zinc-500 text-sm'>
                      &middot; {sort}
                    </span>
                  </h2>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={loadPosts}
                    disabled={loadingPosts}
                    className='border-zinc-700 text-zinc-400'
                  >
                    <RefreshCw
                      className={`h-3 w-3 mr-1 ${loadingPosts ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>

                {loadingPosts ? (
                  <div className='text-center py-12 text-zinc-400'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                    <p>Loading r/{subreddit} posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className='text-center py-12 text-zinc-500'>
                    <Search className='h-10 w-10 mx-auto mb-4 opacity-50' />
                    <p>No posts found. Try a different subreddit or sort.</p>
                  </div>
                ) : (
                  <div className='space-y-3'>
                    {posts.map((post) => (
                      <Card
                        key={post.id}
                        className='bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors'
                      >
                        <CardContent className='pt-4 pb-3'>
                          <div className='flex items-start gap-3'>
                            {/* Score */}
                            <div className='flex flex-col items-center gap-0.5 text-zinc-500 min-w-[40px]'>
                              <ThumbsUp className='h-3 w-3' />
                              <span className='text-xs font-medium'>
                                {post.score}
                              </span>
                            </div>

                            {/* Content */}
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between gap-2'>
                                <h3 className='text-sm font-medium text-white leading-snug'>
                                  {post.title}
                                </h3>
                                <a
                                  href={post.permalink}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex-shrink-0 text-zinc-500 hover:text-zinc-300'
                                >
                                  <ArrowUpRight className='h-4 w-4' />
                                </a>
                              </div>

                              {post.selftext && (
                                <p className='text-xs text-zinc-400 mt-1.5 line-clamp-3'>
                                  {post.selftext}
                                </p>
                              )}

                              <div className='flex items-center gap-3 mt-2'>
                                <span className='text-xs text-zinc-500'>
                                  u/{post.author}
                                </span>
                                <span className='text-xs text-zinc-600 flex items-center gap-1'>
                                  <MessageSquare className='h-3 w-3' />
                                  {post.numComments}
                                </span>
                                <span className='text-xs text-zinc-600'>
                                  {timeAgo(post.created)}
                                </span>
                                {post.flair && (
                                  <Badge
                                    variant='outline'
                                    className='text-xs border-zinc-700 text-zinc-500 py-0'
                                  >
                                    {post.flair}
                                  </Badge>
                                )}
                              </div>

                              {/* Reply Action */}
                              <div className='mt-3'>
                                <Button
                                  size='sm'
                                  onClick={() => generateReplyForPost(post)}
                                  disabled={generatingReplyFor === post.id}
                                  className='bg-lunary-primary-600/80 hover:bg-lunary-primary-600 text-white text-xs h-7'
                                >
                                  {generatingReplyFor === post.id ? (
                                    <>
                                      <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                                      Generating reply...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className='h-3 w-3 mr-1' />
                                      Generate Reply
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Generate Tab */
              <>
                {/* Input */}
                <Card className='bg-zinc-900 border-zinc-800'>
                  <CardContent className='pt-6 space-y-4'>
                    <div>
                      <label className='text-xs text-zinc-400 mb-1 block'>
                        Topic
                      </label>
                      <input
                        type='text'
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder={
                          format === 'reply'
                            ? 'What question are you answering?'
                            : 'What is the post about?'
                        }
                        className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500'
                      />
                    </div>
                    {format === 'reply' && (
                      <div>
                        <label className='text-xs text-zinc-400 mb-1 block'>
                          Original Question (optional)
                        </label>
                        <textarea
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Paste the original question you're replying to..."
                          rows={3}
                          className='w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder:text-zinc-500 resize-none'
                        />
                      </div>
                    )}
                    <Button
                      onClick={generate}
                      disabled={generating || !topic.trim()}
                      className='w-full bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                    >
                      {generating ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Generating...
                        </>
                      ) : (
                        `Generate ${format === 'reply' ? 'Reply' : 'Post'} for ${selectedSub?.displayName || 'Reddit'}`
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Output */}
                {content && (
                  <Card className='bg-zinc-900 border-zinc-800'>
                    <CardHeader>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                          <CardTitle className='text-base'>
                            {content.title || 'Generated Reply'}
                          </CardTitle>
                          <Badge
                            variant='outline'
                            className='border-zinc-700 text-zinc-400'
                          >
                            {content.format}
                          </Badge>
                          {content.flair && (
                            <Badge className='bg-lunary-secondary-900 text-lunary-secondary border-lunary-secondary-800'>
                              {content.flair}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={copyContent}
                          className='border-zinc-700 text-zinc-300'
                        >
                          {copied ? (
                            <Check className='h-4 w-4 text-lunary-success' />
                          ) : (
                            <Copy className='h-4 w-4' />
                          )}
                          <span className='ml-1'>
                            {copied ? 'Copied' : 'Copy'}
                          </span>
                        </Button>
                      </div>
                      <CardDescription className='text-xs'>
                        For: {content.topic}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className='text-sm text-zinc-300 bg-zinc-800/50 p-4 rounded-lg whitespace-pre-wrap'>
                        {content.body}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* History */}
                {history.length > 1 && (
                  <Card className='bg-zinc-900 border-zinc-800'>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-sm text-zinc-400'>
                        History ({history.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                      {history.slice(1).map((item, i) => (
                        <button
                          key={i}
                          onClick={() => setContent(item)}
                          className='w-full text-left px-3 py-2 rounded bg-zinc-800/50 hover:bg-zinc-800 transition-colors'
                        >
                          <div className='flex items-center gap-2'>
                            <Badge
                              variant='outline'
                              className='text-xs border-zinc-700 text-zinc-500'
                            >
                              {item.subreddit}
                            </Badge>
                            <span className='text-xs text-zinc-400 truncate'>
                              {item.topic}
                            </span>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
