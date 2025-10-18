'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  BookOpen,
  Mail,
  Calendar,
  Send,
  Eye,
  Download,
  RefreshCw,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface WeeklyContent {
  title: string;
  subtitle: string;
  summary: string;
  weekNumber: number;
  year: number;
  planetaryHighlights: any[];
  retrogradeChanges: any[];
  majorAspects: any[];
  moonPhases: any[];
}

export default function BlogManagerPage() {
  const [currentWeek, setCurrentWeek] = useState<WeeklyContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Newsletter settings
  const [customSubject, setCustomSubject] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [autoSend, setAutoSend] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    generateCurrentWeek();
  }, []);

  const generateCurrentWeek = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/blog/weekly');
      const data = await response.json();

      if (data.success) {
        setCurrentWeek(data.data);
      }
    } catch (error) {
      console.error('Error generating current week:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyPost = async (offset: number = 0) => {
    setLoading(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + offset * 7);

      const response = await fetch(
        `/api/blog/weekly?date=${targetDate.toISOString().split('T')[0]}`,
      );
      const data = await response.json();

      if (data.success) {
        console.log('Generated weekly post:', data.data.title);
        alert(`✅ Generated: "${data.data.title}"`);

        if (offset === 0) {
          setCurrentWeek(data.data);
        }
      }
    } catch (error) {
      console.error('Error generating weekly post:', error);
      alert('❌ Error generating post');
    } finally {
      setLoading(false);
    }
  };

  const previewNewsletter = async () => {
    setNewsletterLoading(true);
    try {
      const response = await fetch('/api/newsletter/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send: false,
          weekOffset,
          customSubject: customSubject || undefined,
        }),
      });

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
    } finally {
      setNewsletterLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!testEmail && !autoSend) {
      alert('Please enter a test email or enable auto-send to subscriber list');
      return;
    }

    setNewsletterLoading(true);
    try {
      const response = await fetch('/api/newsletter/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send: true,
          testEmail: testEmail || undefined,
          customSubject: customSubject || undefined,
          weekOffset,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
      } else {
        alert(`❌ Failed to send: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('❌ Error sending newsletter');
    } finally {
      setNewsletterLoading(false);
    }
  };

  const downloadMarkdown = async () => {
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + weekOffset * 7);

      const response = await fetch(
        `/api/blog/weekly?date=${targetDate.toISOString().split('T')[0]}&format=markdown`,
      );
      const markdown = await response.text();

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cosmic-week-${targetDate.toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading markdown:', error);
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <BookOpen className='h-8 w-8' />
          Blog & Newsletter Manager
        </h1>
        <p className='text-muted-foreground'>
          Generate automated cosmic content using your astronomical APIs
        </p>
      </div>

      {/* Current Week Overview */}
      {currentWeek && (
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Calendar className='h-5 w-5' />
              This Week: {currentWeek.title}
            </CardTitle>
            <CardDescription>{currentWeek.subtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='mb-4'>{currentWeek.summary}</p>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-purple-600'>
                  {currentWeek.planetaryHighlights.length}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Planetary Events
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {currentWeek.retrogradeChanges.length}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Retrograde Changes
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>
                  {currentWeek.majorAspects.length}
                </div>
                <div className='text-sm text-muted-foreground'>
                  Major Aspects
                </div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-yellow-600'>
                  {currentWeek.moonPhases.length}
                </div>
                <div className='text-sm text-muted-foreground'>Moon Phases</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue='generator' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='generator'>Content Generator</TabsTrigger>
          <TabsTrigger value='newsletter'>Newsletter</TabsTrigger>
          <TabsTrigger value='analytics'>Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value='generator' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5' />
                Weekly Content Generator
              </CardTitle>
              <CardDescription>
                Generate blog posts using your astronomical APIs and retrograde
                tracking
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  onClick={() => generateWeeklyPost(-1)}
                  disabled={loading}
                  variant='outline'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Generate Last Week
                </Button>

                <Button
                  onClick={() => generateWeeklyPost(0)}
                  disabled={loading}
                  className='bg-primary'
                >
                  <Calendar className='h-4 w-4 mr-2' />
                  {loading ? 'Generating...' : 'Generate This Week'}
                </Button>

                <Button
                  onClick={() => generateWeeklyPost(1)}
                  disabled={loading}
                  variant='outline'
                >
                  <TrendingUp className='h-4 w-4 mr-2' />
                  Generate Next Week
                </Button>
              </div>

              <div className='flex gap-2'>
                <Button onClick={downloadMarkdown} variant='outline' size='sm'>
                  <Download className='h-4 w-4 mr-2' />
                  Download Markdown
                </Button>

                <Button
                  onClick={() =>
                    window.open('/api/blog/weekly?format=html', '_blank')
                  }
                  variant='outline'
                  size='sm'
                >
                  <Eye className='h-4 w-4 mr-2' />
                  Preview HTML
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='newsletter' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Mail className='h-5 w-5' />
                Weekly Newsletter
              </CardTitle>
              <CardDescription>
                Send automated cosmic newsletters to your subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='custom-subject'>
                    Custom Subject (Optional)
                  </Label>
                  <Input
                    id='custom-subject'
                    placeholder='Override auto-generated subject...'
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='test-email'>Test Email</Label>
                  <Input
                    id='test-email'
                    type='email'
                    placeholder='your@email.com'
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='week-offset'>Week Offset</Label>
                  <Input
                    id='week-offset'
                    type='number'
                    placeholder='0 = this week, 1 = next week'
                    value={weekOffset}
                    onChange={(e) =>
                      setWeekOffset(parseInt(e.target.value) || 0)
                    }
                  />
                </div>

                <div className='flex items-center space-x-2'>
                  <Switch
                    id='auto-send'
                    checked={autoSend}
                    onCheckedChange={setAutoSend}
                  />
                  <Label htmlFor='auto-send'>Send to All Subscribers</Label>
                </div>
              </div>

              <div className='flex gap-2'>
                <Button
                  onClick={previewNewsletter}
                  disabled={newsletterLoading}
                  variant='outline'
                >
                  <Eye className='h-4 w-4 mr-2' />
                  Preview Newsletter
                </Button>

                <Button
                  onClick={sendNewsletter}
                  disabled={newsletterLoading || (!testEmail && !autoSend)}
                >
                  <Send className='h-4 w-4 mr-2' />
                  {newsletterLoading ? 'Sending...' : 'Send Newsletter'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <TrendingUp className='h-5 w-5' />
                Content Analytics
              </CardTitle>
              <CardDescription>
                Track blog performance and newsletter engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-center py-8 text-muted-foreground'>
                <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>Analytics dashboard coming soon!</p>
                <p className='text-sm'>Track opens, clicks, and engagement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
