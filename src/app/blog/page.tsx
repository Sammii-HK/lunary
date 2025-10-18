'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  Mail,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  subtitle: string;
  summary: string;
  weekStart: string;
  weekEnd: string;
  weekNumber: number;
  year: number;
  generatedAt: string;
  contentSummary: {
    planetaryHighlights: number;
    retrogradeChanges: number;
    majorAspects: number;
    moonPhases: number;
  };
  slug: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekData, setCurrentWeekData] = useState<any>(null);

  useEffect(() => {
    fetchBlogPosts();
    fetchCurrentWeek();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      // In production, this would fetch from your blog database
      // For now, generate sample posts
      const samplePosts: BlogPost[] = [
        {
          id: 'week-1-2025',
          title: 'Mercury Stations Direct - Week of January 6, 2025',
          subtitle: "3 major planetary shifts shape this week's energy",
          summary:
            'This week brings significant cosmic shifts as Mercury stations direct, ending the first retrograde period of 2025...',
          weekStart: '2025-01-06T00:00:00Z',
          weekEnd: '2025-01-12T23:59:59Z',
          weekNumber: 1,
          year: 2025,
          generatedAt: new Date().toISOString(),
          contentSummary: {
            planetaryHighlights: 3,
            retrogradeChanges: 1,
            majorAspects: 2,
            moonPhases: 1,
          },
          slug: 'mercury-stations-direct-week-january-6-2025',
        },
        {
          id: 'week-2-2025',
          title: 'Full Moon in Cancer - Week of January 13, 2025',
          subtitle: 'Emotional depths and intuitive insights guide the week',
          summary:
            'A powerful Full Moon in Cancer illuminates emotional patterns and family dynamics...',
          weekStart: '2025-01-13T00:00:00Z',
          weekEnd: '2025-01-19T23:59:59Z',
          weekNumber: 2,
          year: 2025,
          generatedAt: new Date().toISOString(),
          contentSummary: {
            planetaryHighlights: 2,
            retrogradeChanges: 0,
            majorAspects: 4,
            moonPhases: 1,
          },
          slug: 'full-moon-cancer-week-january-13-2025',
        },
      ];

      setPosts(samplePosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentWeek = async () => {
    try {
      const response = await fetch('/api/blog/weekly');
      const data = await response.json();
      setCurrentWeekData(data.data);
    } catch (error) {
      console.error('Error fetching current week:', error);
    }
  };

  const generateNewPost = async () => {
    try {
      const response = await fetch('/api/blog/weekly');
      const data = await response.json();

      if (data.success) {
        // In production, save this to your blog database
        console.log('Generated weekly post:', data.data.title);
        alert(`✅ Generated: "${data.data.title}"`);
      }
    } catch (error) {
      console.error('Error generating post:', error);
      alert('❌ Error generating post');
    }
  };

  const previewNewsletter = async () => {
    try {
      const response = await fetch('/api/newsletter/weekly');
      const data = await response.json();

      if (data.success) {
        // Open newsletter preview in new window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(data.newsletter.html);
          newWindow.document.title = data.newsletter.subject;
        }
      }
    } catch (error) {
      console.error('Error previewing newsletter:', error);
      alert('❌ Error previewing newsletter');
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2 flex items-center gap-2'>
          <BookOpen className='h-10 w-10' />
          Cosmic Blog
        </h1>
        <p className='text-xl text-muted-foreground'>
          Weekly cosmic guidance and planetary insights
        </p>
      </div>

      {/* Current Week Highlight */}
      {currentWeekData && (
        <Card className='mb-8 border-2 border-primary/20'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-2xl'>
                  {currentWeekData.title}
                </CardTitle>
                <CardDescription className='text-lg'>
                  {currentWeekData.subtitle}
                </CardDescription>
              </div>
              <Badge className='text-sm px-3 py-1'>This Week</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className='text-lg mb-4'>{currentWeekData.summary}</p>
            <div className='flex gap-4 text-sm text-muted-foreground mb-4'>
              <span className='flex items-center gap-1'>
                <Star className='h-4 w-4' />
                {currentWeekData.planetaryHighlights?.length || 0} planetary
                events
              </span>
              <span className='flex items-center gap-1'>
                <TrendingUp className='h-4 w-4' />
                {currentWeekData.retrogradeChanges?.length || 0} retrograde
                changes
              </span>
              <span className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                Week {currentWeekData.weekNumber}, {currentWeekData.year}
              </span>
            </div>
            <div className='flex gap-2'>
              <Button asChild>
                <Link
                  href={`/blog/week/${currentWeekData.weekNumber}-${currentWeekData.year}`}
                >
                  Read Full Forecast
                </Link>
              </Button>
              <Button variant='outline' onClick={previewNewsletter}>
                <Mail className='h-4 w-4 mr-2' />
                Preview Newsletter
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Actions */}
      <div className='flex gap-2 mb-6'>
        <Button onClick={generateNewPost} variant='outline'>
          <Sparkles className='h-4 w-4 mr-2' />
          Generate This Week
        </Button>
        <Button onClick={previewNewsletter} variant='outline'>
          <Mail className='h-4 w-4 mr-2' />
          Preview Newsletter
        </Button>
        <Button asChild variant='outline'>
          <Link href='/admin/blog-manager'>
            Manage Blog
            <ExternalLink className='h-4 w-4 ml-2' />
          </Link>
        </Button>
      </div>

      {/* Blog Posts Archive */}
      <div className='space-y-6'>
        <h2 className='text-2xl font-bold'>Recent Cosmic Insights</h2>

        {loading ? (
          <div className='grid gap-6'>
            {[1, 2, 3].map((i) => (
              <Card key={i} className='animate-pulse'>
                <CardHeader>
                  <div className='h-6 bg-muted rounded w-3/4'></div>
                  <div className='h-4 bg-muted rounded w-1/2'></div>
                </CardHeader>
                <CardContent>
                  <div className='h-20 bg-muted rounded'></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className='grid gap-6'>
            {posts.map((post) => (
              <Card key={post.id} className='hover:shadow-lg transition-shadow'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div>
                      <CardTitle className='text-xl'>{post.title}</CardTitle>
                      <CardDescription className='text-base'>
                        {post.subtitle}
                      </CardDescription>
                    </div>
                    <Badge variant='outline'>Week {post.weekNumber}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-muted-foreground mb-4'>{post.summary}</p>

                  <div className='flex items-center gap-4 text-sm text-muted-foreground mb-4'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-4 w-4' />
                      {new Date(post.weekStart).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      -{' '}
                      {new Date(post.weekEnd).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      {new Date(post.generatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className='flex items-center gap-2 mb-4'>
                    {post.contentSummary.planetaryHighlights > 0 && (
                      <Badge variant='secondary'>
                        {post.contentSummary.planetaryHighlights} planetary
                        events
                      </Badge>
                    )}
                    {post.contentSummary.retrogradeChanges > 0 && (
                      <Badge variant='secondary'>
                        {post.contentSummary.retrogradeChanges} retrograde
                        changes
                      </Badge>
                    )}
                    {post.contentSummary.moonPhases > 0 && (
                      <Badge variant='secondary'>
                        {post.contentSummary.moonPhases} moon phases
                      </Badge>
                    )}
                  </div>

                  <Button asChild>
                    <Link href={`/blog/${post.slug}`}>Read Full Forecast</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
