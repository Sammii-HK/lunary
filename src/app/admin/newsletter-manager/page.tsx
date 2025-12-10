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
import {
  Mail,
  Send,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface Subscriber {
  id: number;
  email: string;
  user_id: string | null;
  is_active: boolean;
  is_verified: boolean;
  preferences: any;
  source: string;
  created_at: string;
  last_email_sent: string | null;
  email_count: number;
}

interface NewsletterStats {
  total: number;
  active: number;
  verified: number;
  withNewsletterEnabled: number;
}

export default function NewsletterManagerPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');

  // Newsletter sending
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [sendResult, setSendResult] = useState<any>(null);

  useEffect(() => {
    loadSubscribers();
    loadStats();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/newsletter/subscribers?active=true');
      const data = await response.json();

      if (data.success) {
        setSubscribers(data.subscribers);
      }
    } catch (error) {
      console.error('Failed to load subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const [allResponse, activeResponse, verifiedResponse] = await Promise.all(
        [
          fetch('/api/newsletter/subscribers'),
          fetch('/api/newsletter/subscribers?active=true'),
          fetch('/api/newsletter/subscribers?active=true&verified=true'),
        ],
      );

      const all = await allResponse.json();
      const active = await activeResponse.json();
      const verified = await verifiedResponse.json();

      // Count subscribers with newsletter enabled
      const newsletterEnabled = verified.subscribers.filter(
        (s: Subscriber) => s.preferences?.weeklyNewsletter === true,
      ).length;

      setStats({
        total: all.pagination?.total || 0,
        active: active.pagination?.total || 0,
        verified: verified.pagination?.total || 0,
        withNewsletterEnabled: newsletterEnabled,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const addSubscriber = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const response = await fetch('/api/newsletter/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail, source: 'manual' }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Subscriber added: ${data.subscriber.email}`);
        setNewEmail('');
        loadSubscribers();
        loadStats();
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      alert('Failed to add subscriber');
    }
  };

  const toggleActive = async (email: string, currentActive: boolean) => {
    try {
      const response = await fetch(
        `/api/newsletter/subscribers/${encodeURIComponent(email)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: !currentActive }),
        },
      );

      const data = await response.json();

      if (data.success) {
        loadSubscribers();
        loadStats();
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to update subscriber:', error);
    }
  };

  const sendNewsletter = async () => {
    if (!confirm('Send newsletter to all active verified subscribers?')) {
      return;
    }

    setSendingNewsletter(true);
    setSendResult(null);

    try {
      const response = await fetch('/api/newsletter/weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          send: true,
          weekOffset: 0,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSendResult({
          recipients: data.data.recipients,
          success: data.data.success || data.data.recipients,
          failed: data.data.failed || 0,
        });
        alert(`✅ Newsletter sent to ${data.data.recipients} subscribers`);
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to send newsletter:', error);
      alert('Failed to send newsletter');
    } finally {
      setSendingNewsletter(false);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2 flex items-center gap-2'>
          <Mail className='h-8 w-8' />
          Newsletter Manager
        </h1>
        <p className='text-muted-foreground'>
          Manage email subscribers and send weekly newsletters
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <Users className='h-5 w-5 text-lunary-secondary' />
                <div>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                  <p className='text-sm text-muted-foreground'>
                    Total Subscribers
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <CheckCircle className='h-5 w-5 text-lunary-success' />
                <div>
                  <p className='text-2xl font-bold'>{stats.active}</p>
                  <p className='text-sm text-muted-foreground'>Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <Mail className='h-5 w-5 text-lunary-primary-500' />
                <div>
                  <p className='text-2xl font-bold'>{stats.verified}</p>
                  <p className='text-sm text-muted-foreground'>Verified</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center gap-2'>
                <Send className='h-5 w-5 text-lunary-rose' />
                <div>
                  <p className='text-2xl font-bold'>
                    {stats.withNewsletterEnabled}
                  </p>
                  <p className='text-sm text-muted-foreground'>
                    Newsletter Enabled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue='subscribers' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='subscribers'>Subscriber Management</TabsTrigger>
          <TabsTrigger value='send'>Send Newsletter</TabsTrigger>
        </TabsList>

        <TabsContent value='subscribers' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Add New Subscriber</CardTitle>
              <CardDescription>Manually add email subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Input
                  type='email'
                  placeholder='email@example.com'
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSubscriber()}
                />
                <Button onClick={addSubscriber}>
                  <Plus className='h-4 w-4 mr-2' />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Subscribers ({subscribers.length})</CardTitle>
                  <CardDescription>Active email subscribers</CardDescription>
                </div>
                <Button variant='outline' size='sm' onClick={loadSubscribers}>
                  <RefreshCw className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className='text-center py-8'>Loading subscribers...</div>
              ) : subscribers.length === 0 ? (
                <div className='text-center py-8 text-muted-foreground'>
                  No subscribers found
                </div>
              ) : (
                <div className='space-y-2'>
                  {subscribers.map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className='flex items-center justify-between p-3 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-medium'>
                            {subscriber.email}
                          </span>
                          {subscriber.is_verified ? (
                            <Badge
                              variant='default'
                              className='bg-lunary-success-600'
                            >
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant='secondary'>Unverified</Badge>
                          )}
                          {subscriber.is_active ? (
                            <Badge
                              variant='default'
                              className='bg-lunary-primary'
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant='secondary'>Inactive</Badge>
                          )}
                        </div>
                        <div className='text-sm text-muted-foreground mt-1'>
                          {subscriber.email_count} emails sent • Joined{' '}
                          {new Date(subscriber.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          toggleActive(subscriber.email, subscriber.is_active)
                        }
                      >
                        {subscriber.is_active ? (
                          <XCircle className='h-4 w-4 text-red-500' />
                        ) : (
                          <CheckCircle className='h-4 w-4 text-lunary-success' />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='send' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Send Weekly Newsletter</CardTitle>
              <CardDescription>
                Send the current week's newsletter to all active verified
                subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              {sendResult && (
                <div className='p-4 bg-slate-800 rounded-lg'>
                  <h3 className='font-semibold mb-2'>Send Results:</h3>
                  <div className='space-y-1 text-sm'>
                    <div>Recipients: {sendResult.recipients}</div>
                    <div className='text-lunary-success'>
                      Success: {sendResult.success}
                    </div>
                    {sendResult.failed > 0 && (
                      <div className='text-red-500'>
                        Failed: {sendResult.failed}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={sendNewsletter}
                disabled={sendingNewsletter}
                className='w-full'
                size='lg'
              >
                {sendingNewsletter ? (
                  <>
                    <RefreshCw className='h-4 w-4 mr-2 animate-spin' />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className='h-4 w-4 mr-2' />
                    Send Newsletter
                  </>
                )}
              </Button>

              <p className='text-sm text-muted-foreground'>
                Emails are sent in batches of 100 to ensure privacy and avoid
                exposing recipient addresses.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
