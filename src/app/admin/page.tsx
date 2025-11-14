'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'jazz-tools/react';
import { betterAuthClient } from '@/lib/auth-client';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
import { AdminInstallPrompt } from './components/AdminInstallPrompt';
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
  Eye,
  Play,
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

type AdminAuthIssueType =
  | 'none'
  | 'no-session'
  | 'not-admin'
  | 'no-config'
  | 'error';

interface AdminAuthIssueState {
  type: AdminAuthIssueType;
  details?: string;
}

function LockedAdminBackdrop() {
  const previewCards = [
    {
      title: 'Cron Monitor',
      metric: 'Next run · 3h',
      status: 'Stable',
      icon: Activity,
      accent: 'text-green-300',
    },
    {
      title: 'Content Pipeline',
      metric: '8 drafts',
      status: 'Awaiting review',
      icon: BookOpen,
      accent: 'text-blue-300',
    },
    {
      title: 'Notifications',
      metric: '12.4k subs',
      status: 'Queued',
      icon: Bell,
      accent: 'text-purple-300',
    },
    {
      title: 'Shop Manager',
      metric: '24 products',
      status: 'Synced',
      icon: Store,
      accent: 'text-emerald-300',
    },
    {
      title: 'Scheduler',
      metric: '5 campaigns',
      status: 'Auto',
      icon: Calendar,
      accent: 'text-pink-300',
    },
    {
      title: 'Newsletter',
      metric: 'Weekly drop',
      status: 'In progress',
      icon: Mail,
      accent: 'text-orange-300',
    },
  ];

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none select-none'>
      <div className='absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black to-black opacity-80' />
      <div className='absolute inset-0'>
        <div className='h-full w-full bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.35),_transparent_60%)] opacity-50 blur-3xl' />
      </div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full px-6 blur-2xl opacity-60'>
          {previewCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl'
              >
                <div
                  className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ${card.accent}`}
                >
                  <Icon className='h-5 w-5' />
                </div>
                <p className='text-sm uppercase tracking-[0.2em] text-white/60'>
                  {card.title}
                </p>
                <p className='mt-2 text-2xl font-semibold text-white/80'>
                  {card.metric}
                </p>
                <p className='mt-1 text-sm text-white/50'>{card.status}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { me } = useAccount();
  const authState = useAuthStatus();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [testingNotification, setTestingNotification] = useState(false);
  const [testingRealNotification, setTestingRealNotification] = useState(false);
  const [testingDaily, setTestingDaily] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [substackPreview, setSubstackPreview] = useState<any>(null);
  const [substackLoading, setSubstackLoading] = useState(false);
  const [substackWeekOffset, setSubstackWeekOffset] = useState(0);
  const [substackPublishing, setSubstackPublishing] = useState(false);
  const [authIssue, setAuthIssue] = useState<AdminAuthIssueState>({
    type: 'none',
  });

  const handleAuthSuccess = () => {
    setAuthIssue({ type: 'none' });
    setIsAuthorized(null);
  };

  // Check if user is admin
  useEffect(() => {
    if (authState.loading) {
      setIsAuthorized(null);
      return;
    }

    const checkAdminAccess = async () => {
      try {
        setAuthIssue({ type: 'none' });
        setIsAuthorized(null);

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

            const issueType: AdminAuthIssueType = authState.isAuthenticated
              ? 'error'
              : 'no-session';
            setAuthIssue({
              type: issueType,
              details:
                issueType === 'no-session'
                  ? 'Sign in with your Lunary admin email to continue.'
                  : 'We could not verify your admin session. Refresh or sign in again.',
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
          setAuthIssue({
            type: 'no-config',
            details:
              'Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local with your approved admin emails.',
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
          setAuthIssue({
            type: 'not-admin',
            details: `Add "${userEmail.toLowerCase()}" to NEXT_PUBLIC_ADMIN_EMAILS to enable access.`,
          });
          setIsAuthorized(false);
          return;
        }

        console.log('✅ Admin access granted:', { userEmail });
        setAuthIssue({ type: 'none' });
        setIsAuthorized(true);
      } catch (error) {
        console.error('❌ Admin access check failed:', error);
        setAuthIssue({
          type: 'error',
          details:
            error instanceof Error
              ? error.message
              : 'Unable to verify admin access.',
        });
        setIsAuthorized(false);
      }
    };

    checkAdminAccess();
  }, [router, me, authState.isAuthenticated, authState.loading]);

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
    if (authIssue.type === 'no-session') {
      return (
        <div className='min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center px-4 py-10'>
          <LockedAdminBackdrop />
          <div className='relative z-10 w-full max-w-xl space-y-6'>
            <div className='text-center space-y-3'>
              <p className='text-xs uppercase tracking-[0.4em] text-white/50'>
                Admin Portal
              </p>
              <h1 className='text-3xl font-light tracking-tight'>
                Sign in to continue
              </h1>
              <p className='text-sm text-white/70'>
                {authIssue.details ||
                  'Use your Lunary admin credentials to access the dashboard.'}
              </p>
            </div>
            <div className='rounded-3xl border border-white/10 bg-black/70 p-6 shadow-2xl backdrop-blur-2xl'>
              <AuthComponent onSuccess={handleAuthSuccess} />
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center p-4'>
        <div className='text-center max-w-md space-y-4'>
          <h1 className='text-2xl font-bold text-red-400'>Access Denied</h1>
          <p className='text-zinc-400'>
            {authIssue.details ||
              "You don't have permission to access the admin dashboard."}
          </p>
          <p className='text-sm text-zinc-500'>
            Check the browser console for details or update your admin settings.
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

  const testSubstackPreview = async () => {
    setSubstackLoading(true);
    setSubstackPreview(null);
    try {
      const response = await fetch(
        `/api/substack/preview?week=${substackWeekOffset}`,
      );
      const result = await response.json();

      if (result.success) {
        setSubstackPreview(result);
      } else {
        alert(`❌ Preview generation failed: ${result.error}`);
      }
    } catch (error) {
      alert('❌ Error generating preview');
      console.error(error);
    } finally {
      setSubstackLoading(false);
    }
  };

  const testSubstackPublish = async (tier: 'free' | 'paid' = 'free') => {
    if (!substackPreview) {
      alert('Please generate a preview first');
      return;
    }

    if (
      !confirm(
        `This will publish the ${tier} tier post to Substack. Are you sure?`,
      )
    ) {
      return;
    }

    setSubstackPublishing(true);
    try {
      const response = await fetch('/api/substack/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekOffset: substackWeekOffset,
          publishFree: tier === 'free',
          publishPaid: tier === 'paid',
        }),
      });

      const result = await response.json();

      if (result.success) {
        const postUrl =
          tier === 'free'
            ? result.results?.free?.postUrl
            : result.results?.paid?.postUrl;
        alert(
          `✅ Post published successfully!\n\nTier: ${tier}\nPost URL: ${postUrl || 'Check Substack dashboard'}\n\nYou can view it on Substack now.`,
        );
        if (postUrl) {
          window.open(postUrl, '_blank');
        }
      } else {
        alert(
          `❌ Publishing failed: ${result.error || result.details || 'Unknown error'}`,
        );
      }
    } catch (error) {
      alert('❌ Error publishing post');
      console.error(error);
    } finally {
      setSubstackPublishing(false);
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

  // Essential tools - most frequently used
  const essentialTools: AdminTool[] = [
    {
      title: 'Cron Monitor',
      description:
        'Monitor and trigger master cron job (daily posts, weekly blog, moon packs)',
      href: '/admin/cron-monitor',
      icon: <Activity className='h-6 w-6' />,
      category: 'monitoring',
      status: 'active',
    },
    {
      title: 'Blog Manager',
      description:
        'Generate weekly cosmic content and newsletters with retrograde tracking',
      href: '/admin/blog-manager',
      icon: <BookOpen className='h-6 w-6' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Newsletter Manager',
      description:
        'Manage email subscribers and send weekly newsletters with Brevo',
      href: '/admin/newsletter-manager',
      icon: <Mail className='h-6 w-6' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Shop Manager',
      description:
        'Manage grimoire packs - auto-generates PDFs, uploads to Blob, and syncs to Stripe (SSOT)',
      href: '/admin/shop-manager',
      icon: <Store className='h-6 w-6' />,
      category: 'shop',
    },
  ];

  // Frequently used tools
  const frequentlyUsedTools: AdminTool[] = [
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
  ];

  // Content tools
  const contentTools: AdminTool[] = [
    {
      title: 'Daily Posts Preview',
      description: 'Preview and test daily social media posts',
      href: '/admin/daily-posts-preview',
      icon: <FileText className='h-5 w-5' />,
      category: 'content',
    },
    {
      title: 'Substack Manager',
      description:
        'Generate and publish weekly Substack posts (Free: newsletter content, Paid: $3/month enhanced)',
      href: '/admin/substack',
      icon: <Send className='h-5 w-5' />,
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
      title: 'New Post',
      description: 'Create and publish new content manually',
      href: '/admin/new-post',
      icon: <Mail className='h-5 w-5' />,
      category: 'content',
    },
  ];

  // Monitoring & Analytics
  const monitoringTools: AdminTool[] = [
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
  ];

  // Testing & Utilities (low priority - moved to bottom)
  const testingTools: AdminTool[] = [
    {
      title: 'OG Debug',
      description: 'Test and debug Open Graph image generation',
      href: '/admin/og-debug',
      // eslint-disable-next-line jsx-a11y/alt-text
      icon: <Image className='h-5 w-5' />,
      category: 'tools',
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
  ];

  // All tools for category-based display (legacy)
  const adminTools: AdminTool[] = [
    ...essentialTools,
    ...frequentlyUsedTools,
    ...contentTools,
    ...monitoringTools,
    ...testingTools,
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

        <div className='mb-6 md:mb-8 lg:mb-10'>
          <AdminInstallPrompt />
        </div>

        {/* Essential Tools - Large Prominent Cards */}
        <div className='mb-8 md:mb-10 lg:mb-12'>
          <div className='flex items-center gap-3 mb-6'>
            <h2 className='text-2xl md:text-3xl lg:text-4xl font-bold'>
              Essential Tools
            </h2>
            <Badge className='bg-purple-500/20 text-purple-400 border-purple-500/30'>
              Most Used
            </Badge>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
            {essentialTools.map((tool) => (
              <Card
                key={tool.href}
                className='group hover:shadow-xl transition-all bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700 hover:border-purple-500/50 cursor-pointer'
              >
                <Link href={tool.href} className='block'>
                  <CardHeader className='pb-4'>
                    <div className='flex items-center justify-between mb-3'>
                      <div className='p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20 transition-colors'>
                        {tool.icon}
                      </div>
                      {getStatusBadge(tool.status)}
                    </div>
                    <CardTitle className='text-lg md:text-xl mb-2'>
                      {tool.title}
                    </CardTitle>
                    <CardDescription className='text-sm text-zinc-400 line-clamp-2'>
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant='ghost'
                      className='w-full justify-between group-hover:text-purple-400 transition-colors'
                    >
                      Open Tool
                      <ExternalLink className='h-4 w-4 ml-2' />
                    </Button>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        </div>

        {/* Frequently Used Tools */}
        {frequentlyUsedTools.length > 0 && (
          <div className='mb-8 md:mb-10 lg:mb-12'>
            <div className='flex items-center gap-3 mb-6'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
                Frequently Used
              </h2>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {frequentlyUsedTools.map((tool) => (
                <Card
                  key={tool.href}
                  className='hover:shadow-lg transition-all bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                >
                  <Link href={tool.href} className='block'>
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
                        variant='outline'
                        className='w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                      >
                        Open
                        <ExternalLink className='h-3 w-3 md:h-4 md:w-4 ml-2' />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Content Tools */}
        {contentTools.length > 0 && (
          <div className='mb-8 md:mb-10 lg:mb-12'>
            <div className='flex items-center gap-3 mb-6'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
                Content Management
              </h2>
              <Badge className='bg-blue-500/10 text-blue-400 border-blue-500/20'>
                {contentTools.length}
              </Badge>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {contentTools.map((tool) => (
                <Card
                  key={tool.href}
                  className='hover:shadow-lg transition-all bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                >
                  <Link href={tool.href} className='block'>
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
                        variant='outline'
                        className='w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                      >
                        Open
                        <ExternalLink className='h-3 w-3 md:h-4 md:w-4 ml-2' />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Monitoring & Analytics */}
        {monitoringTools.length > 0 && (
          <div className='mb-8 md:mb-10 lg:mb-12'>
            <div className='flex items-center gap-3 mb-6'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
                Monitoring & Analytics
              </h2>
              <Badge className='bg-orange-500/10 text-orange-400 border-orange-500/20'>
                {monitoringTools.length}
              </Badge>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'>
              {monitoringTools.map((tool) => (
                <Card
                  key={tool.href}
                  className='hover:shadow-lg transition-all bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                >
                  <Link href={tool.href} className='block'>
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
                        variant='outline'
                        className='w-full bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'
                      >
                        Open
                        <ExternalLink className='h-3 w-3 md:h-4 md:w-4 ml-2' />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testing & Utilities - Low Priority Section */}
        {testingTools.length > 0 && (
          <div className='mb-8 md:mb-10 lg:mb-12'>
            <div className='flex items-center gap-3 mb-6'>
              <h2 className='text-xl md:text-2xl lg:text-3xl font-bold'>
                Testing & Utilities
              </h2>
              <Badge className='bg-gray-500/10 text-gray-400 border-gray-500/20'>
                {testingTools.length}
              </Badge>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {testingTools.map((tool) => (
                <Card
                  key={tool.href}
                  className='hover:shadow-lg transition-all bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50'
                >
                  <Link href={tool.href} className='block'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div className='text-zinc-500'>{tool.icon}</div>
                          <CardTitle className='text-sm md:text-base text-zinc-400'>
                            {tool.title}
                          </CardTitle>
                        </div>
                        {getStatusBadge(tool.status)}
                      </div>
                      <CardDescription className='text-xs text-zinc-500'>
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant='outline'
                        className='w-full bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border-zinc-700/50 text-sm'
                      >
                        Open
                        <ExternalLink className='h-3 w-3 ml-2' />
                      </Button>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Testing Utilities - Email, Notifications, Substack */}
        <div className='mb-8 md:mb-10 lg:mb-12 space-y-6'>
          <div className='flex items-center gap-3 mb-6'>
            <h2 className='text-lg md:text-xl lg:text-2xl font-bold text-zinc-400'>
              Testing Utilities
            </h2>
            <Badge className='bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs'>
              Low Priority
            </Badge>
          </div>

          {/* Email Testing */}
          <Card className='bg-zinc-900/50 border-zinc-800/50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg md:text-xl text-zinc-400'>
                <Mail className='h-5 w-5' />
                Email Testing (Brevo)
              </CardTitle>
              <CardDescription className='text-xs md:text-sm text-zinc-500'>
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
                    className='flex-1 px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 text-sm'
                    disabled={testingEmail}
                  />
                  <Button
                    onClick={testEmail}
                    disabled={testingEmail || !testEmailAddress}
                    variant='outline'
                    className='h-auto px-6 py-2 bg-blue-600/50 hover:bg-blue-700/50 border-blue-500/50 text-white transition-all disabled:opacity-50 text-sm'
                  >
                    <Send className='h-4 w-4 mr-2' />
                    {testingEmail ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>
                <p className='text-xs text-zinc-600'>
                  Make sure BREVO_API_KEY is set in your environment variables.
                  The email will be sent from{' '}
                  <code className='bg-zinc-800/50 px-2 py-1 rounded text-zinc-400'>
                    cosmic@lunary.app
                  </code>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* PWA Notification Testing */}
          <Card className='bg-zinc-900/50 border-zinc-800/50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg md:text-xl text-zinc-400'>
                <Bell className='h-5 w-5' />
                PWA Notification Testing
              </CardTitle>
              <CardDescription className='text-xs md:text-sm text-zinc-500'>
                Test push notifications on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <Button
                  onClick={testRealNotification}
                  disabled={testingRealNotification}
                  variant='outline'
                  className='h-auto p-4 bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/50 hover:border-purple-500/30 text-white transition-all text-sm'
                >
                  <div className='flex flex-col items-center gap-2 w-full'>
                    <Bell className='h-6 w-6 text-purple-400/70' />
                    <div className='text-center'>
                      <div className='font-semibold text-sm mb-1'>
                        {testingRealNotification
                          ? 'Sending...'
                          : 'Test Real Event'}
                      </div>
                      <div className='text-xs text-zinc-500'>
                        Uses today's actual cosmic events
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={testDailyNotification}
                  disabled={testingDaily}
                  variant='outline'
                  className='h-auto p-4 bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/50 hover:border-blue-500/30 text-white transition-all text-sm'
                >
                  <div className='flex flex-col items-center gap-2 w-full'>
                    <Calendar className='h-6 w-6 text-blue-400/70' />
                    <div className='text-center'>
                      <div className='font-semibold text-sm mb-1'>
                        {testingDaily ? 'Sending...' : 'Test Daily Preview'}
                      </div>
                      <div className='text-xs text-zinc-500'>
                        Rich notifications with images
                      </div>
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={testPushNotification}
                  disabled={testingNotification}
                  variant='outline'
                  className='h-auto p-4 bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800/50 hover:border-green-500/30 text-white transition-all text-sm'
                >
                  <div className='flex flex-col items-center gap-2 w-full'>
                    <Smartphone className='h-6 w-6 text-green-400/70' />
                    <div className='text-center'>
                      <div className='font-semibold text-sm mb-1'>
                        {testingNotification ? 'Sending...' : 'Test Basic'}
                      </div>
                      <div className='text-xs text-zinc-500'>
                        Simple notification test
                      </div>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Substack Testing */}
          <Card className='bg-zinc-900/50 border-zinc-800/50'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-lg md:text-xl text-zinc-400'>
                <FileText className='h-5 w-5' />
                Substack Post Testing
              </CardTitle>
              <CardDescription className='text-xs md:text-sm text-zinc-500'>
                Preview and test Substack posts without publishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                  <div className='flex-1'>
                    <label className='text-xs text-zinc-500 mb-2 block'>
                      Week Offset (0 = current week, 1 = next week)
                    </label>
                    <input
                      type='number'
                      value={substackWeekOffset}
                      onChange={(e) =>
                        setSubstackWeekOffset(parseInt(e.target.value) || 0)
                      }
                      className='w-full px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded text-white text-sm'
                      min='0'
                    />
                  </div>
                  <Button
                    onClick={testSubstackPreview}
                    disabled={substackLoading}
                    variant='outline'
                    className='h-auto px-6 py-2 bg-purple-600/50 hover:bg-purple-700/50 border-purple-500/50 text-white transition-all disabled:opacity-50 mt-6 sm:mt-0 text-sm'
                  >
                    <Eye className='h-4 w-4 mr-2' />
                    {substackLoading ? 'Generating...' : 'Preview Posts'}
                  </Button>
                </div>

                {substackPreview && (
                  <div className='mt-6 space-y-6'>
                    <div className='p-4 bg-zinc-800 rounded border border-zinc-700'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-white'>
                          Preview Results
                        </h3>
                        <Badge variant='outline' className='text-zinc-300'>
                          Week {substackPreview.metadata?.weekNumber || 'N/A'}
                        </Badge>
                      </div>
                      <div className='text-sm text-zinc-400 mb-4'>
                        <p>
                          Week:{' '}
                          {substackPreview.metadata?.weekStart
                            ? new Date(
                                substackPreview.metadata.weekStart,
                              ).toLocaleDateString()
                            : 'N/A'}{' '}
                          -{' '}
                          {substackPreview.metadata?.weekEnd
                            ? new Date(
                                substackPreview.metadata.weekEnd,
                              ).toLocaleDateString()
                            : 'N/A'}
                        </p>
                        <p>
                          Free: {substackPreview.metadata?.freeWordCount || 0}{' '}
                          words | Paid:{' '}
                          {substackPreview.metadata?.paidWordCount || 0} words
                        </p>
                      </div>

                      {/* Free Post */}
                      <div className='mb-6'>
                        <div className='flex items-center gap-2 mb-3'>
                          <Badge className='bg-green-600'>Free Tier</Badge>
                          <span className='text-sm text-zinc-400'>
                            {substackPreview.free?.title || 'No title'}
                          </span>
                        </div>
                        <div className='bg-zinc-900 p-4 rounded border border-zinc-700 max-h-96 overflow-y-auto'>
                          <h4 className='text-white font-semibold mb-2'>
                            {substackPreview.free?.title}
                          </h4>
                          {substackPreview.free?.subtitle && (
                            <p className='text-zinc-300 text-sm mb-2 italic'>
                              {substackPreview.free.subtitle}
                            </p>
                          )}
                          <div className='text-zinc-400 text-sm whitespace-pre-wrap'>
                            {substackPreview.free?.content || 'No content'}
                          </div>
                        </div>
                      </div>

                      {/* Paid Post */}
                      <div>
                        <div className='flex items-center gap-2 mb-3'>
                          <Badge className='bg-purple-600'>Paid Tier</Badge>
                          <span className='text-sm text-zinc-400'>
                            {substackPreview.paid?.title || 'No title'}
                          </span>
                        </div>
                        <div className='bg-zinc-900 p-4 rounded border border-zinc-700 max-h-96 overflow-y-auto'>
                          <h4 className='text-white font-semibold mb-2'>
                            {substackPreview.paid?.title}
                          </h4>
                          {substackPreview.paid?.subtitle && (
                            <p className='text-zinc-300 text-sm mb-2 italic'>
                              {substackPreview.paid.subtitle}
                            </p>
                          )}
                          <div className='text-zinc-400 text-sm whitespace-pre-wrap'>
                            {substackPreview.paid?.content || 'No content'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Publish Buttons */}
                    <div className='flex gap-4 pt-4 border-t border-zinc-700'>
                      <Button
                        onClick={() => testSubstackPublish('free')}
                        disabled={substackPublishing || !substackPreview}
                        variant='outline'
                        className='flex-1 bg-green-600 hover:bg-green-700 border-green-500 text-white disabled:opacity-50'
                      >
                        <Play className='h-4 w-4 mr-2' />
                        {substackPublishing
                          ? 'Publishing...'
                          : 'Publish Free Post'}
                      </Button>
                      <Button
                        onClick={() => testSubstackPublish('paid')}
                        disabled={substackPublishing || !substackPreview}
                        variant='outline'
                        className='flex-1 bg-purple-600 hover:bg-purple-700 border-purple-500 text-white disabled:opacity-50'
                      >
                        <Play className='h-4 w-4 mr-2' />
                        {substackPublishing
                          ? 'Publishing...'
                          : 'Publish Paid Post'}
                      </Button>
                    </div>
                  </div>
                )}

                <p className='text-xs text-zinc-600'>
                  Preview shows full post content. Use publish buttons to
                  actually post to Substack (opens in new tab when published).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Moon Pack Quick Generator */}
        <Card className='mb-8 md:mb-10 lg:mb-12 bg-zinc-900 border-zinc-800'>
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
