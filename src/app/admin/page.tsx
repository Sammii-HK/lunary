'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'jazz-tools/react';
import { betterAuthClient } from '@/lib/auth-client';
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
  Settings,
  BookOpen,
  Package,
  Clock,
  Store,
  Calendar,
  Sparkles,
  Image,
  Gem,
  Wand2,
  Mail,
  Activity,
  ExternalLink,
  Users,
  FileText,
  Zap,
  Smartphone,
  Bell,
  Menu,
  Send,
  Download,
} from 'lucide-react';

interface AdminTool {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: 'content' | 'automation' | 'shop' | 'monitoring' | 'tools';
  status?: 'active' | 'new' | 'beta';
  lastUsed?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { me } = useAccount();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testingRealNotification, setTestingRealNotification] = useState(false);
  const [testingDaily, setTestingDaily] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  // Check if user is admin
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Wait a bit for session to be established after sign-in
        // Longer wait if we just came from auth page
        const cameFromAuth =
          document.referrer.includes('/auth') ||
          window.location.search.includes('signedIn');
        await new Promise((resolve) =>
          setTimeout(resolve, cameFromAuth ? 1500 : 500),
        );

        // Get admin emails from environment (client-side check)
        const adminEmailsEnv =
          process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
          process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
          '';

        const adminEmails = adminEmailsEnv
          .split(',')
          .map((email) => email.trim().toLowerCase())
          .filter(Boolean);

        console.log('🔐 Admin access check:', {
          adminEmailsEnv: adminEmailsEnv ? 'SET' : 'NOT SET',
          adminEmailsCount: adminEmails.length,
          adminEmails: adminEmails,
          currentUrl: window.location.href,
        });

        // Try to get session - Better Auth client might return null, so try direct API call
        let session = null;
        let userEmail = null;

        // First try Better Auth client
        try {
          session = await betterAuthClient.getSession();
          const user = session?.data?.user;
          if (user?.email) {
            userEmail = user.email;
            console.log('✅ Got email from Better Auth client:', userEmail);
          }
        } catch (error) {
          console.warn('⚠️ Better Auth client failed:', error);
        }

        // If client failed, try server-side API endpoint
        // This works on both dev and prod IF BETTER_AUTH_SECRET matches
        if (!userEmail) {
          try {
            console.log(
              '🔄 Trying server-side API call to /api/auth/get-user-email...',
            );
            const response = await fetch('/api/auth/get-user-email', {
              method: 'GET',
              credentials: 'include',
              cache: 'no-store',
            });

            if (response.ok) {
              const result = await response.json();
              if (result?.email) {
                userEmail = result.email;
                console.log('✅ Got email from server-side API:', userEmail);
              } else {
                console.warn('⚠️ Server-side API returned no email:', result);
                console.warn(
                  '💡 This usually means BETTER_AUTH_SECRET mismatch. Users may need to sign out and sign back in.',
                );
              }
            } else {
              console.warn('⚠️ Server-side API call failed:', {
                status: response.status,
                statusText: response.statusText,
              });
            }
          } catch (error) {
            console.warn('⚠️ Server-side API call failed:', error);
          }
        }

        // Final fallback: check Jazz profile
        if (!userEmail && me?.profile) {
          const profile = me.profile as any;
          userEmail = profile.email;
          console.log(
            '🔍 Checked Jazz profile, email:',
            userEmail || 'NOT FOUND',
          );
        }

        console.log('🔐 Session check:', {
          hasSession: !!session,
          userEmail: userEmail || 'NOT FOUND',
          sessionData: session?.data ? 'EXISTS' : 'MISSING',
          sessionUser: session?.data?.user
            ? JSON.stringify(session.data.user, null, 2)
            : 'MISSING',
          sessionStructure: session ? Object.keys(session) : 'NO SESSION',
          meProfile: me?.profile ? 'EXISTS' : 'MISSING',
          meProfileEmail: (me?.profile as any)?.email || 'NOT FOUND',
        });

        // Dev-only bypass: if on localhost and Jazz account exists, allow access
        const isLocalhost =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === 'admin.localhost');

        if (!userEmail) {
          const hasJazzAccount = !!me;
          if (isLocalhost && hasJazzAccount) {
            console.warn(
              '⚠️ Dev bypass: Allowing access on localhost with Jazz account',
              { hasAccount: true },
            );
            // Allow access but still log the warning
            userEmail = 'dev-bypass@localhost';
          } else {
            console.warn('⚠️ Admin access denied:', {
              reason: 'No user email',
              userEmail,
              adminEmailsCount: adminEmails.length,
              isLocalhost,
              hasJazzAccount,
              fix: !userEmail
                ? 'Wait for session to load or check Better Auth session. If on localhost, ensure Jazz account is loaded.'
                : 'Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local with your email',
            });
            setIsAuthorized(false);
            return;
          }
        }

        if (adminEmails.length === 0) {
          console.warn('⚠️ Admin access denied:', {
            reason: 'No admin emails configured',
            userEmail,
            fix: 'Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local with your email',
          });
          setIsAuthorized(false);
          return;
        }

        // Check if user email is in admin list (skip check for dev bypass)
        if (
          userEmail !== 'dev-bypass@localhost' &&
          !adminEmails.includes(userEmail.toLowerCase())
        ) {
          console.warn('⚠️ Admin access denied:', {
            reason: 'Email not in admin list',
            userEmail: userEmail.toLowerCase(),
            adminEmails,
            fix: `Add "${userEmail.toLowerCase()}" to NEXT_PUBLIC_ADMIN_EMAILS in .env.local`,
          });
          setIsAuthorized(false);
          return;
        }

        console.log('✅ Admin access granted:', { userEmail });
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Admin access check failed:', error);
        setIsAuthorized(false);
      }
    };

    checkAdminAccess();
  }, [router, me]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4'></div>
          <p className='text-zinc-400'>Checking authorization...</p>
        </div>
      </div>
    );
  }

  // Show access denied message
  if (isAuthorized === false) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
        <div className='text-center max-w-md'>
          <h1 className='text-2xl font-bold text-red-400 mb-4'>
            Access Denied
          </h1>
          <p className='text-zinc-400 mb-4'>
            You don't have permission to access the admin dashboard.
          </p>
          <p className='text-sm text-zinc-500'>
            Check the browser console for details.
          </p>
        </div>
      </div>
    );
  }

  // Don't render if not authorized
  if (!isAuthorized) {
    return null;
  }

  const testRealNotification = async () => {
    setTestingRealNotification(true);
    try {
      const response = await fetch('/api/test-real-notification');
      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Real notification test sent!\n\nEvent: ${result.primaryEvent || 'No significant events today'}\nNotifications sent: ${result.notificationsSent}\n\nThis is what subscribers receive for REAL cosmic events.`,
        );
      } else {
        alert(`❌ Real notification test failed: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Error testing real notification');
    } finally {
      setTestingRealNotification(false);
    }
  };

  const testPushNotification = async () => {
    setTestingNotification(true);
    try {
      const response = await fetch('/api/test-notification');
      const result = await response.json();

      if (result.success) {
        alert('✅ Test notification sent! Check your phone.');
      } else {
        alert(
          `❌ Notification failed: ${result.error}\n\nTroubleshooting:\n${result.troubleshooting?.join('\n')}`,
        );
      }
    } catch (error) {
      alert('❌ Error testing notification');
    } finally {
      setTestingNotification(false);
    }
  };

  const testDailyNotification = async () => {
    setTestingDaily(true);
    try {
      const response = await fetch('/api/test-daily-notification');
      const result = await response.json();

      if (result.success) {
        alert(`✅ Daily overview test sent! Check your phone for 2 rich notifications:

1. 👀 Daily Preview (with cosmic image)
2. ✅ Cron Success (with schedule details)

Today's cosmic event: ${result.cosmicEvent?.name || 'Cosmic Flow'}

This is exactly what you'll get every day at 8 AM UTC!`);
      } else {
        alert(`❌ Daily test failed: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Error testing daily notification');
    } finally {
      setTestingDaily(false);
    }
  };

  const testEmail = async () => {
    if (!testEmailAddress) {
      alert('Please enter an email address to test');
      return;
    }

    setTestingEmail(true);
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: testEmailAddress }),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `✅ Test email sent successfully!\n\nTo: ${result.details.to}\nFrom: ${result.details.from}\nMessage ID: ${result.details.emailId || 'N/A'}\n\nCheck your inbox (and spam folder) for the test email.`,
        );
      } else {
        alert(
          `❌ Email test failed: ${result.error}\n\nTroubleshooting:\n${result.troubleshooting?.commonIssues?.join('\n') || result.details || 'Check server logs'}`,
        );
      }
    } catch (error) {
      alert(
        `❌ Error testing email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setTestingEmail(false);
    }
  };

  const adminTools: AdminTool[] = [
    // Content Management
    {
      title: 'Blog Manager',
      description:
        'Generate weekly cosmic content and newsletters with retrograde tracking',
      href: '/admin/blog-manager',
      icon: <BookOpen className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Newsletter Manager',
      description:
        'Manage email subscribers and send weekly newsletters with Brevo',
      href: '/admin/newsletter-manager',
      icon: <Mail className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Grimoire Packs',
      description:
        'Create magical packs using grimoire database with proper naming',
      href: '/admin/grimoire-packs',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Daily Posts Preview',
      description: 'Preview and test daily social media posts',
      href: '/admin/daily-posts-preview',
      icon: <FileText className='h-5 w-5' />,
      category: 'content',
    },
    {
      title: 'New Post',
      description: 'Create and publish new content manually',
      href: '/admin/new-post',
      icon: <Mail className='h-5 w-5' />,
      category: 'content',
    },
    {
      title: 'OG Debug',
      description: 'Test and debug Open Graph image generation',
      href: '/admin/og-debug',
      // eslint-disable-next-line jsx-a11y/alt-text
      icon: <Image className='h-5 w-5' />,
      category: 'tools',
    },

    // Shop & Products
    {
      title: 'Shop Manager',
      description:
        'Manage grimoire packs - auto-generates PDFs, uploads to Blob, and syncs to Stripe (SSOT)',
      href: '/admin/shop-manager',
      icon: <Store className='h-5 w-5' />,
      category: 'shop',
    },
    {
      title: 'Crystal Gallery',
      description: 'Browse and manage crystal database',
      href: '/admin/crystal-gallery',
      icon: <Gem className='h-5 w-5' />,
      category: 'tools',
    },
    {
      title: 'Tarot Gallery',
      description: 'Manage tarot card database and readings',
      href: '/admin/tarot-gallery',
      icon: <Wand2 className='h-5 w-5' />,
      category: 'tools',
    },

    // Automation & Monitoring
    {
      title: 'Cron Monitor',
      description:
        'Monitor and trigger master cron job (daily posts, weekly blog, moon packs)',
      href: '/admin/cron-monitor',
      icon: <Activity className='h-5 w-5' />,
      category: 'monitoring',
      status: 'active',
    },
    {
      title: 'Scheduler',
      description: 'Schedule and manage automated content publishing',
      href: '/admin/scheduler',
      icon: <Calendar className='h-5 w-5' />,
      category: 'automation',
    },
    {
      title: 'Notifications',
      description: 'View and manage push notification subscribers',
      href: '/admin/notifications',
      icon: <Bell className='h-5 w-5' />,
      category: 'monitoring',
    },
    {
      title: 'Conversion Analytics',
      description: 'Track user conversions, trials, and subscription metrics',
      href: '/admin/analytics',
      icon: <Activity className='h-5 w-5' />,
      category: 'monitoring',
      status: 'new',
    },
    {
      title: 'A/B Testing',
      description: 'Analyze experiments with AI-powered insights',
      href: '/admin/ab-testing',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'monitoring',
      status: 'new',
    },
    {
      title: 'AI Conversion Optimizer',
      description: 'AI-powered conversion optimization tools',
      href: '/admin/ai-conversion',
      icon: <Zap className='h-5 w-5' />,
      category: 'monitoring',
      status: 'new',
    },
    {
      title: 'Social Media Posts',
      description: 'AI-powered social media post generator for marketing',
      href: '/admin/social-posts',
      icon: <Send className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Post Approval Queue',
      description:
        'Review and approve generated posts before sending to Succulent',
      href: '/admin/social-posts/approve',
      icon: <Bell className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Test Calendar Generator',
      description:
        'Generate and test cosmic calendars without creating Stripe products',
      href: '/admin/test-calendar',
      icon: <Download className='h-5 w-5' />,
      category: 'tools',
      status: 'new',
    },
  ];

  const categories = {
    content: {
      name: 'Content Management',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    shop: {
      name: 'Shop & Products',
      color: 'bg-green-500/10 text-green-400 border-green-500/20',
    },
    automation: {
      name: 'Automation',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    },
    monitoring: {
      name: 'Monitoring',
      color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
    tools: {
      name: 'Tools & Utilities',
      color: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    },
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
            New
          </Badge>
        );
      case 'beta':
        return (
          <Badge className='bg-yellow-500/20 text-yellow-400 border-yellow-500/30'>
            Beta
          </Badge>
        );
      case 'active':
        return (
          <Badge className='bg-blue-500/20 text-blue-400 border-blue-500/30'>
            Active
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-white'>
      <div className='container mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl'>
        {/* Header */}
        <div className='mb-6 md:mb-8 lg:mb-10'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-2 flex items-center gap-2 md:gap-3'>
                <Settings className='h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12' />
                Admin Dashboard
              </h1>
              <p className='text-base md:text-lg lg:text-xl text-zinc-400'>
                Manage your cosmic content, automation, and shop
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8 lg:mb-10'>
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-center gap-2'>
                <Zap className='h-4 w-4 md:h-5 md:w-5 text-yellow-500' />
                <div>
                  <p className='text-xl md:text-2xl font-bold'>
                    {adminTools.length}
                  </p>
                  <p className='text-xs md:text-sm text-zinc-400'>
                    Admin Tools
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-center gap-2'>
                <Activity className='h-4 w-4 md:h-5 md:w-5 text-green-500' />
                <div>
                  <p className='text-xl md:text-2xl font-bold'>1</p>
                  <p className='text-xs md:text-sm text-zinc-400'>
                    Active Cron
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-center gap-2'>
                <Package className='h-4 w-4 md:h-5 md:w-5 text-blue-500' />
                <div>
                  <p className='text-xl md:text-2xl font-bold'>5</p>
                  <p className='text-xs md:text-sm text-zinc-400'>
                    Content Types
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-center gap-2'>
                <Store className='h-4 w-4 md:h-5 md:w-5 text-purple-500' />
                <div>
                  <p className='text-xl md:text-2xl font-bold'>∞</p>
                  <p className='text-xs md:text-sm text-zinc-400'>Shop Ready</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PWA Notification Testing */}
        <Card className='mb-6 md:mb-8 lg:mb-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Bell className='h-5 w-5 md:h-6 md:w-6' />
              PWA Notification Testing
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Test push notifications on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
              <Button
                onClick={testRealNotification}
                disabled={testingRealNotification}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-purple-500/50 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Bell className='h-8 w-8 text-purple-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      {testingRealNotification
                        ? 'Sending...'
                        : 'Test Real Event'}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Uses today's actual cosmic events
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={testDailyNotification}
                disabled={testingDaily}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-blue-500/50 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-blue-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      {testingDaily ? 'Sending...' : 'Test Daily Preview'}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Rich notifications with images
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={testPushNotification}
                disabled={testingNotification}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-green-500/50 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Smartphone className='h-8 w-8 text-green-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      {testingNotification ? 'Sending...' : 'Test Basic'}
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Simple notification test
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Testing */}
        <Card className='mb-6 md:mb-8 lg:mb-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Mail className='h-5 w-5 md:h-6 md:w-6' />
              Email Testing (Brevo)
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Test email sending with Brevo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex flex-col md:flex-row gap-4'>
                <input
                  type='email'
                  placeholder='Enter your email address'
                  value={testEmailAddress}
                  onChange={(e) => setTestEmailAddress(e.target.value)}
                  className='flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500'
                  disabled={testingEmail}
                />
                <Button
                  onClick={testEmail}
                  disabled={testingEmail || !testEmailAddress}
                  variant='outline'
                  className='h-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 border-blue-500 text-white transition-all disabled:opacity-50'
                >
                  <Send className='h-4 w-4 mr-2' />
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
              </div>
              <p className='text-xs text-zinc-500'>
                Make sure BREVO_API_KEY is set in your environment variables.
                The email will be sent from{' '}
                <code className='bg-zinc-800 px-2 py-1 rounded text-zinc-300'>
                  cosmic@lunary.app
                </code>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className='mb-6 md:mb-8 lg:mb-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Zap className='h-5 w-5 md:h-6 md:w-6' />
              Quick Actions
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Common admin tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-white'
              >
                <Link
                  href='/admin/cron-monitor'
                  className='flex flex-col items-center gap-2'
                >
                  <Activity className='h-6 w-6' />
                  <span className='text-sm font-medium'>Trigger Cron</span>
                </Link>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-white'
              >
                <Link
                  href='/admin/blog-manager'
                  className='flex flex-col items-center gap-2'
                >
                  <BookOpen className='h-6 w-6' />
                  <span className='text-sm font-medium'>Generate Blog</span>
                </Link>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-white'
              >
                <Link
                  href='/admin/grimoire-packs'
                  className='flex flex-col items-center gap-2'
                >
                  <Sparkles className='h-6 w-6' />
                  <span className='text-sm font-medium'>Create Pack</span>
                </Link>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-zinc-600 text-white'
              >
                <Link
                  href='/admin/shop-manager'
                  className='flex flex-col items-center gap-2'
                >
                  <Store className='h-6 w-6' />
                  <span className='text-sm font-medium'>Manage Shop</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Moon Pack Quick Generator */}
        <Card className='mb-6 md:mb-8 lg:mb-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Sparkles className='h-5 w-5 md:h-6 md:w-6' />
              Quick Moon Pack Generator
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Generate moon phase packs quickly with one click
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
              <Button
                onClick={async () => {
                  const currentYear = new Date().getFullYear();
                  const currentMonth = new Date().getMonth() + 1;
                  const monthName = new Date(
                    currentYear,
                    currentMonth - 1,
                  ).toLocaleString('default', { month: 'long' });

                  if (
                    !confirm(
                      `Generate moon pack for ${monthName} ${currentYear}?`,
                    )
                  )
                    return;

                  try {
                    const response = await fetch(
                      '/api/shop/packs/generate-and-sync',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          category: 'moon_phases',
                          includeRituals: false,
                          autoPublish: false,
                          year: currentYear,
                          month: currentMonth,
                          customNaming: {},
                        }),
                      },
                    );

                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Moon pack generated: ${result.pack.fullName || result.pack.name}\n\nStripe Product: ${result.stripe?.productId}\nCheck shop to see it!`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || result.details}`);
                    }
                  } catch (error: any) {
                    console.error('Generation error:', error);
                    alert(
                      `❌ Error generating pack: ${error.message || 'Unknown error'}`,
                    );
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-purple-500/50 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-purple-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      This Month
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {new Date().toLocaleString('default', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                onClick={async () => {
                  const currentYear = new Date().getFullYear();

                  if (!confirm(`Generate yearly moon pack for ${currentYear}?`))
                    return;

                  try {
                    const response = await fetch(
                      '/api/shop/packs/generate-and-sync',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          category: 'moon_phases',
                          includeRituals: false,
                          autoPublish: false,
                          year: currentYear,
                          customNaming: {},
                        }),
                      },
                    );

                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Yearly moon pack generated: ${result.pack.fullName || result.pack.name}\n\nStripe Product: ${result.stripe?.productId}\nCheck shop to see it!`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || result.details}`);
                    }
                  } catch (error: any) {
                    console.error('Generation error:', error);
                    alert(
                      `❌ Error generating pack: ${error.message || 'Unknown error'}`,
                    );
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-blue-500/50 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-blue-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      This Year
                    </div>
                    <div className='text-xs text-zinc-400'>
                      {new Date().getFullYear()} Complete Guide
                    </div>
                  </div>
                </div>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-green-500/50 text-white transition-all'
              >
                <Link
                  href='/admin/shop-manager'
                  className='flex flex-col items-center gap-3 w-full'
                >
                  <Store className='h-8 w-8 text-green-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      Custom Pack
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Advanced options
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Admin Tools by Category - Responsive */}
        {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
          const categoryTools = adminTools.filter(
            (tool) => tool.category === categoryKey,
          );

          if (categoryTools.length === 0) return null;

          return (
            <div key={categoryKey} className='mb-6 md:mb-8 lg:mb-10'>
              <div className='flex items-center gap-2 md:gap-3 mb-4 md:mb-6'>
                <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
                  {categoryInfo.name}
                </h2>
                <Badge className={categoryInfo.color}>
                  {categoryTools.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6'>
                {categoryTools.map((tool) => (
                  <Card
                    key={tool.href}
                    className='hover:shadow-lg transition-all bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  >
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div className='text-zinc-400'>{tool.icon}</div>
                          <CardTitle className='text-base md:text-lg'>
                            {tool.title}
                          </CardTitle>
                        </div>
                        {getStatusBadge(tool.status)}
                      </div>
                      <CardDescription className='text-xs md:text-sm text-zinc-400'>
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        asChild
                        className='w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                        variant='outline'
                      >
                        <Link href={tool.href}>
                          Open
                          <ExternalLink className='h-3 w-3 md:h-4 md:w-4 ml-2' />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {/* System Status - Responsive */}
        <Card className='mt-6 md:mt-8 lg:mt-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Activity className='h-5 w-5 md:h-6 md:w-6' />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 lg:gap-6'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse'></div>
                <span className='text-sm md:text-base'>
                  Master Cron: Active (1 PM UTC daily)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 md:w-3 md:h-3 bg-blue-500 rounded-full'></div>
                <span className='text-sm md:text-base'>
                  Grimoire API: Ready
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 md:w-3 md:h-3 bg-purple-500 rounded-full'></div>
                <span className='text-sm md:text-base'>
                  Stripe Integration: Configured
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card className='mt-6 md:mt-8 lg:mt-10 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Clock className='h-5 w-5 md:h-6 md:w-6' />
              Recent Activity
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Latest admin actions and automated tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-6 md:py-8 lg:py-10 text-zinc-400'>
              <Users className='h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50' />
              <p className='text-sm md:text-base'>
                Activity tracking coming soon!
              </p>
              <p className='text-xs md:text-sm mt-2'>
                Monitor cron jobs, pack generation, and content creation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
