'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { betterAuthClient } from '@/lib/auth-client';
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
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
  FileText,
  Zap,
  Smartphone,
  Bell,
  Send,
  Eye,
  Play,
  Video,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldCheck,
  Key,
  Quote,
  User,
  MessageCircle,
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
      accent: 'text-lunary-success-300',
    },
    {
      title: 'Content Pipeline',
      metric: '8 drafts',
      status: 'Awaiting review',
      icon: BookOpen,
      accent: 'text-lunary-secondary-300',
    },
    {
      title: 'Notifications',
      metric: '12.4k subs',
      status: 'Queued',
      icon: Bell,
      accent: 'text-lunary-primary-300',
    },
    {
      title: 'Shop Manager',
      metric: '24 products',
      status: 'Synced',
      icon: Store,
      accent: 'text-lunary-success-300',
    },
    {
      title: 'Scheduler',
      metric: '5 campaigns',
      status: 'Auto',
      icon: Calendar,
      accent: 'text-lunary-rose-300',
    },
    {
      title: 'Newsletter',
      metric: 'Weekly drop',
      status: 'In progress',
      icon: Mail,
      accent: 'text-lunary-rose-300',
    },
  ];

  return (
    <div className='absolute inset-0 overflow-hidden pointer-events-none select-none'>
      <div className='absolute inset-0 bg-gradient-to-br from-lunary-primary-900/40 via-black to-black opacity-80' />
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
  const { user } = useUser();
  const authState = useAuthStatus();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [substackPreview, setSubstackPreview] = useState<any>(null);
  const [substackLoading, setSubstackLoading] = useState(false);
  const [substackWeekOffset, setSubstackWeekOffset] = useState(0);
  const [substackPublishing, setSubstackPublishing] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [authIssue, setAuthIssue] = useState<AdminAuthIssueState>({
    type: 'none',
  });
  const [subscriptionDebugPayload, setSubscriptionDebugPayload] = useState({
    userId: '',
    customerId: '',
    userEmail: '',
    token:
      process.env.NEXT_PUBLIC_ADMIN_DEBUG_TOKEN ??
      process.env.NEXT_PUBLIC_ADMIN_TOKEN ??
      '',
  });
  const [subscriptionDebugResult, setSubscriptionDebugResult] =
    useState<any>(null);
  const [subscriptionDebugLoading, setSubscriptionDebugLoading] =
    useState(false);

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

        // Final fallback: check user context
        if (!userEmail && user) {
          userEmail = (authState.user as any)?.email;
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
          userContext: user ? 'EXISTS' : 'MISSING',
          authEmail: (authState.user as any)?.email || 'NOT FOUND',
        });

        // Dev-only bypass: if on localhost and Jazz account exists, allow access
        const isLocalhost =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' ||
            window.location.hostname === 'admin.localhost');

        if (!userEmail) {
          const hasUserContext = !!user;
          if (isLocalhost && hasUserContext) {
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
              hasUserContext: !!user,
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
  }, [
    router,
    user,
    authState.isAuthenticated,
    authState.loading,
    authState.user,
  ]);

  // Fetch recent activity
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchActivity = async () => {
      try {
        setActivityLoading(true);
        const response = await fetch('/api/admin/activity?limit=20');
        const data = await response.json();
        if (data.success) {
          setRecentActivity(data.activities || []);
        }
      } catch (error) {
        console.error('Failed to fetch activity:', error);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthorized]);

  // Show loading state while checking authorization
  if (isAuthorized === null) {
    return (
      <div className='min-h-screen bg-black text-white flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-lunary-primary-400 mx-auto mb-4'></div>
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
          <h1 className='text-2xl font-bold text-lunary-error'>
            Access Denied
          </h1>
          <p className='text-zinc-400'>
            {authIssue.details ||
              "You don't have permission to access the admin dashboard."}
          </p>
          <p className='text-sm text-zinc-400'>
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

  const handleSubscriptionDebug = async () => {
    if (
      !subscriptionDebugPayload.userId &&
      !subscriptionDebugPayload.userEmail &&
      !subscriptionDebugPayload.customerId
    ) {
      alert('Provide at least one identifier (userId, customerId, or email)');
      return;
    }

    setSubscriptionDebugResult(null);
    setSubscriptionDebugLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (subscriptionDebugPayload.token) {
        headers.Authorization = `Bearer ${subscriptionDebugPayload.token}`;
      }

      const response = await fetch('/api/admin/stripe/subscription-debug', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: subscriptionDebugPayload.userId || undefined,
          customerId: subscriptionDebugPayload.customerId || undefined,
          userEmail: subscriptionDebugPayload.userEmail || undefined,
        }),
      });
      const body = await response.json().catch(() => null);
      setSubscriptionDebugResult({
        ok: response.ok,
        status: response.status,
        body,
      });
    } catch (error) {
      setSubscriptionDebugResult({
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setSubscriptionDebugLoading(false);
    }
  };

  // Section 1: Analytics
  const analyticsTools: AdminTool[] = [
    {
      title: 'Dashboard',
      description: 'Main analytics dashboard with conversion metrics',
      href: '/admin/analytics',
      icon: <Activity className='h-5 w-5' />,
      category: 'monitoring',
      status: 'active',
    },
    {
      title: 'AI Conversion Analysis',
      description: 'AI engagement and conversion optimization',
      href: '/admin/ai-conversion',
      icon: <Zap className='h-5 w-5' />,
      category: 'monitoring',
      status: 'beta',
    },
    {
      title: 'A/B Testing',
      description: 'Analyze experiments with AI-assisted insights',
      href: '/admin/ab-testing',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'monitoring',
      status: 'new',
    },
    {
      title: 'Cron Monitor',
      description: 'Monitor and trigger automated jobs',
      href: '/admin/cron-monitor',
      icon: <Clock className='h-5 w-5' />,
      category: 'monitoring',
      status: 'active',
    },
    {
      title: 'GPT Bridge',
      description: 'Review Grimoire bridge performance and zero-result rate',
      href: '/admin/gpt-bridge',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'monitoring',
      status: 'new',
    },
  ];

  // Section 2: Content
  const contentTools: AdminTool[] = [
    {
      title: 'Creator Brief',
      description:
        'Morning dashboard with transits, script options, and hot topics',
      href: '/admin/creator-brief',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Content Preview Hub',
      description: 'Preview all OG images, daily posts, and weekly reports',
      href: '/admin/daily-posts-preview',
      icon: <Eye className='h-5 w-5' />,
      category: 'content',
      status: 'active',
    },
    {
      title: 'Social Media Manager',
      description: 'Generate and approve social media posts',
      href: '/admin/social-posts',
      icon: <Send className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Seer Sammii',
      description: 'First-person video scripts with talking points',
      href: '/admin/seer-sammii',
      icon: <Video className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Video Scripts',
      description: 'TikTok & YouTube scripts with cover images',
      href: '/admin/video-scripts',
      icon: <Video className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Content Videos',
      description: 'Generate weekly long-form videos and manage outputs',
      href: '/admin/content/videos',
      icon: <Play className='h-5 w-5' />,
      category: 'content',
      status: 'active',
    },
    {
      title: 'Blog & Newsletter',
      description: 'Manage blog posts and email newsletters',
      href: '/admin/blog-manager',
      icon: <BookOpen className='h-5 w-5' />,
      category: 'content',
    },
    {
      title: 'Substack Publishing',
      description: 'Generate and publish Substack posts',
      href: '/admin/substack',
      icon: <Mail className='h-5 w-5' />,
      category: 'content',
    },
    {
      title: 'Grimoire Packs',
      description: 'Create magical packs with grimoire database',
      href: '/admin/grimoire-packs',
      icon: <Sparkles className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Weekly Stories',
      description: 'Download weekly stories for TikTok scheduling',
      href: '/admin/weekly-stories',
      icon: <Smartphone className='h-5 w-5' />,
      category: 'content',
      status: 'new',
    },
    {
      title: 'Social Preview',
      description: 'Preview social media images and videos (7-day retention)',
      href: '/admin/social-preview',
      icon: <Play className='h-5 w-5' />,
      category: 'content',
      status: 'active',
    },
  ];

  // Section 2b: Tools (content creation)
  const creatorTools: AdminTool[] = [
    {
      title: 'Reddit Generator',
      description:
        'Generate subreddit-specific content from grimoire knowledge',
      href: '/admin/reddit-generator',
      icon: <MessageCircle className='h-5 w-5' />,
      category: 'tools',
      status: 'new',
    },
  ];

  // Section 3: Shop & Assets
  const shopTools: AdminTool[] = [
    {
      title: 'Shop Manager',
      description: 'Manage products, PDFs, and Stripe sync',
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
  ];

  // Section 4: Engagement
  const engagementTools: AdminTool[] = [
    {
      title: 'Notifications',
      description: 'View sent notifications and subscriber stats',
      href: '/admin/notifications',
      icon: <Bell className='h-5 w-5' />,
      category: 'monitoring',
    },
    {
      title: 'Scheduler',
      description: 'Schedule and manage automated publishing',
      href: '/admin/scheduler',
      icon: <Calendar className='h-5 w-5' />,
      category: 'automation',
    },
    {
      title: 'Testimonials',
      description:
        'Review submissions and feature the ones that make the community shine',
      href: '/admin/testimonials',
      icon: <Quote className='h-5 w-5 text-lunary-accent' />,
      category: 'content',
      status: 'new',
    },
  ];

  // Section 5: Debug & Testing
  const debugTools: AdminTool[] = [
    {
      title: 'OG Debug',
      description: 'Test and debug Open Graph image generation',
      href: '/admin/og-debug',
      // eslint-disable-next-line jsx-a11y/alt-text
      icon: <Image className='h-5 w-5' />,
      category: 'tools',
    },
    {
      title: 'Subscription Sync',
      description: 'Reconcile Stripe subscriptions for a user',
      href: '/admin/subscription-sync',
      icon: <RefreshCw className='h-5 w-5' />,
      category: 'tools',
      status: 'new',
    },
    {
      title: 'Social Preview',
      description: 'Preview social media image formats',
      href: '/admin/social-preview',
      icon: <Smartphone className='h-5 w-5' />,
      category: 'tools',
    },
    {
      title: 'Birth Chart Tool',
      description: 'Look up and regenerate user birth charts',
      href: '/admin/birth-chart',
      icon: <User className='h-5 w-5' />,
      category: 'tools',
      status: 'new',
    },
  ];

  const sections = [
    {
      title: 'Analytics',
      icon: <Activity className='h-5 w-5 md:h-6 md:w-6' />,
      tools: analyticsTools,
      color: 'from-pink-600/20 to-pink-600/5',
      iconColor: 'text-lunary-rose',
      borderColor: 'border-lunary-rose-700',
    },
    {
      title: 'Content',
      icon: <FileText className='h-5 w-5 md:h-6 md:w-6' />,
      tools: contentTools,
      color: 'from-blue-600/20 to-blue-600/5',
      iconColor: 'text-lunary-secondary',
      borderColor: 'border-lunary-secondary-800',
    },
    {
      title: 'Creator Tools',
      icon: <MessageCircle className='h-5 w-5 md:h-6 md:w-6' />,
      tools: creatorTools,
      color: 'from-orange-600/20 to-orange-600/5',
      iconColor: 'text-lunary-accent',
      borderColor: 'border-lunary-accent-700',
    },
    {
      title: 'Shop & Assets',
      icon: <Store className='h-5 w-5 md:h-6 md:w-6' />,
      tools: shopTools,
      color: 'from-green-600/20 to-green-600/5',
      iconColor: 'text-lunary-success',
      borderColor: 'border-lunary-success-800',
    },
    {
      title: 'Engagement',
      icon: <Bell className='h-5 w-5 md:h-6 md:w-6' />,
      tools: engagementTools,
      color: 'from-lunary-primary-600/20 to-lunary-primary-600/5',
      iconColor: 'text-lunary-primary-400',
      borderColor: 'border-lunary-primary-700',
    },
  ];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return (
          <Badge className='bg-lunary-success-900 text-lunary-success border-lunary-success-800'>
            New
          </Badge>
        );
      case 'beta':
        return (
          <Badge className='bg-lunary-accent-900 text-lunary-accent border-lunary-accent-700'>
            Beta
          </Badge>
        );
      case 'active':
        return (
          <Badge className='bg-lunary-secondary-900 text-lunary-secondary border-lunary-secondary-800'>
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

        {/* Organized Sections */}
        {sections.map((section) => (
          <div key={section.title} className='mb-8 md:mb-10 lg:mb-12'>
            <div
              className={`flex items-center gap-3 mb-6 p-4 rounded-xl bg-gradient-to-r ${section.color} border ${section.borderColor}`}
            >
              <div className={section.iconColor}>{section.icon}</div>
              <h2 className='text-xl md:text-2xl font-bold'>{section.title}</h2>
              <Badge
                className={`ml-auto ${section.borderColor} bg-black/30 text-zinc-300`}
              >
                {section.tools.length}
              </Badge>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5'>
              {section.tools.map((tool) => (
                <Card
                  key={tool.href}
                  className='group hover:shadow-lg transition-all bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 cursor-pointer'
                >
                  <Link href={tool.href} className='block h-full'>
                    <CardHeader className='pb-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <div
                            className={`${section.iconColor} opacity-80 group-hover:opacity-100 transition-opacity`}
                          >
                            {tool.icon}
                          </div>
                          <CardTitle className='text-sm md:text-base font-medium'>
                            {tool.title}
                          </CardTitle>
                        </div>
                        {getStatusBadge(tool.status)}
                      </div>
                      <CardDescription className='text-xs text-zinc-400 line-clamp-2'>
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Debug & Testing Utilities - Collapsible */}
        <div className='mb-8 md:mb-10 lg:mb-12'>
          <button
            onClick={() => setShowDebugTools(!showDebugTools)}
            className='flex items-center justify-between w-full mb-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800/50 hover:bg-zinc-900 transition-colors'
          >
            <div className='flex items-center gap-3'>
              <Settings className='h-5 w-5 text-zinc-400' />
              <h2 className='text-lg md:text-xl font-bold text-zinc-400'>
                Debug & Testing
              </h2>
              <Badge className='bg-gray-500/10 text-gray-400 border-gray-500/20 text-xs'>
                {debugTools.length}
              </Badge>
            </div>
            {showDebugTools ? (
              <ChevronUp className='h-5 w-5 text-zinc-400' />
            ) : (
              <ChevronDown className='h-5 w-5 text-zinc-400' />
            )}
          </button>

          {showDebugTools && (
            <div className='space-y-6'>
              {/* Debug Tools Grid */}
              {debugTools.length > 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
                  {debugTools.map((tool) => (
                    <Card
                      key={tool.href}
                      className='hover:shadow-lg transition-all bg-zinc-900/50 border-zinc-800/50 hover:border-zinc-700/50'
                    >
                      <Link href={tool.href} className='block'>
                        <CardHeader className='pb-3'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center gap-2'>
                              <div className='text-zinc-400'>{tool.icon}</div>
                              <CardTitle className='text-sm md:text-base text-zinc-400'>
                                {tool.title}
                              </CardTitle>
                            </div>
                            {getStatusBadge(tool.status)}
                          </div>
                          <CardDescription className='text-xs text-zinc-400'>
                            {tool.description}
                          </CardDescription>
                        </CardHeader>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}

              {/* Substack Testing */}
              <Card className='bg-zinc-900/50 border-zinc-800/50'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg md:text-xl text-zinc-400'>
                    <FileText className='h-5 w-5' />
                    Substack Post Testing
                  </CardTitle>
                  <CardDescription className='text-xs md:text-sm text-zinc-400'>
                    Preview and test Substack posts without publishing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center'>
                      <div className='flex-1'>
                        <label className='text-xs text-zinc-400 mb-2 block'>
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
                        className='h-auto px-6 py-2 bg-lunary-primary-600/50 hover:bg-lunary-primary-700/50 border-lunary-primary-600 text-white transition-all disabled:opacity-50 mt-6 sm:mt-0 text-sm'
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
                              Week{' '}
                              {substackPreview.metadata?.weekNumber || 'N/A'}
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
                              Free:{' '}
                              {substackPreview.metadata?.freeWordCount || 0}{' '}
                              words | Paid:{' '}
                              {substackPreview.metadata?.paidWordCount || 0}{' '}
                              words
                            </p>
                          </div>

                          {/* Free Post */}
                          <div className='mb-6'>
                            <div className='flex items-center gap-2 mb-3'>
                              <Badge className='bg-lunary-success-600'>
                                Free Tier
                              </Badge>
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
                              <Badge className='bg-lunary-primary-600'>
                                Paid Tier
                              </Badge>
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
                            className='flex-1 bg-lunary-success-600 hover:bg-lunary-success-700 border-lunary-success text-white disabled:opacity-50'
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
                            className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 border-lunary-primary text-white disabled:opacity-50'
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
                      actually post to Substack (opens in new tab when
                      published).
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className='bg-zinc-900/50 border border-zinc-800'>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg md:text-xl text-zinc-400'>
                    <ShieldCheck className='h-5 w-5' />
                    Subscription Debug
                  </CardTitle>
                  <CardDescription className='text-xs md:text-sm text-zinc-400'>
                    Force-refresh Stripe status for a user and view the
                    plan/status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <label className='text-xs text-zinc-400'>
                      User ID
                      <input
                        type='text'
                        value={subscriptionDebugPayload.userId}
                        onChange={(e) =>
                          setSubscriptionDebugPayload({
                            ...subscriptionDebugPayload,
                            userId: e.target.value.trim(),
                          })
                        }
                        className='mt-1 w-full bg-zinc-900/70 border border-zinc-700 rounded px-3 py-2 text-sm text-white'
                      />
                    </label>
                    <label className='text-xs text-zinc-400'>
                      Customer ID
                      <input
                        type='text'
                        value={subscriptionDebugPayload.customerId}
                        onChange={(e) =>
                          setSubscriptionDebugPayload({
                            ...subscriptionDebugPayload,
                            customerId: e.target.value.trim(),
                          })
                        }
                        className='mt-1 w-full bg-zinc-900/70 border border-zinc-700 rounded px-3 py-2 text-sm text-white'
                      />
                    </label>
                    <label className='text-xs text-zinc-400'>
                      Email
                      <input
                        type='email'
                        value={subscriptionDebugPayload.userEmail}
                        onChange={(e) =>
                          setSubscriptionDebugPayload({
                            ...subscriptionDebugPayload,
                            userEmail: e.target.value.trim(),
                          })
                        }
                        className='mt-1 w-full bg-zinc-900/70 border border-zinc-700 rounded px-3 py-2 text-sm text-white'
                      />
                    </label>
                    <label className='text-xs text-zinc-400'>
                      Debug Token
                      <div className='flex items-center gap-2 mt-1'>
                        <input
                          type='text'
                          value={subscriptionDebugPayload.token}
                          onChange={(e) =>
                            setSubscriptionDebugPayload({
                              ...subscriptionDebugPayload,
                              token: e.target.value.trim(),
                            })
                          }
                          className='flex-1 bg-zinc-900/70 border border-zinc-700 rounded px-3 py-2 text-sm text-white'
                        />
                        <Key className='h-4 w-4 text-zinc-400' />
                      </div>
                    </label>
                  </div>
                  <div className='flex flex-wrap gap-3 mt-4'>
                    <Button
                      onClick={handleSubscriptionDebug}
                      disabled={subscriptionDebugLoading}
                      className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white'
                    >
                      {subscriptionDebugLoading
                        ? 'Checking...'
                        : 'Check subscription'}
                    </Button>
                    <Button
                      onClick={() => setSubscriptionDebugResult(null)}
                      variant='outline'
                      className='border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                    >
                      Clear result
                    </Button>
                  </div>
                  {subscriptionDebugResult && (
                    <div
                      className={`mt-4 p-3 rounded-lg border ${
                        subscriptionDebugResult.ok
                          ? 'border-lunary-success bg-lunary-success-950/40'
                          : 'border-lunary-error bg-lunary-error-950/40'
                      }`}
                    >
                      {subscriptionDebugResult.ok ? (
                        <>
                          <p className='text-sm text-lunary-success'>
                            Success (status {subscriptionDebugResult.status})
                          </p>
                          <div className='text-sm text-zinc-200 mt-3 space-y-1'>
                            <p>
                              Plan:{' '}
                              {subscriptionDebugResult.body?.data?.plan ||
                                subscriptionDebugResult.body?.data?.subscription
                                  ?.planName ||
                                'Unknown'}
                            </p>
                            <p>
                              Status:{' '}
                              {subscriptionDebugResult.body?.data?.subscription
                                ?.status || 'Unknown'}
                            </p>
                            {subscriptionDebugResult.body?.data?.message && (
                              <p>
                                Message:{' '}
                                {subscriptionDebugResult.body.data.message}
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <p className='text-sm text-lunary-error'>
                            Failed (status{' '}
                            {subscriptionDebugResult.status || 'unknown'})
                          </p>
                          <p className='text-xs text-lunary-error-300 mt-2'>
                            {subscriptionDebugResult.error ||
                              subscriptionDebugResult.body?.error ||
                              subscriptionDebugResult.body?.message ||
                              'Check console for details.'}
                          </p>
                        </>
                      )}
                      <details className='mt-3 text-xs text-zinc-400'>
                        <summary className='cursor-pointer'>
                          Raw response
                        </summary>
                        <pre className='mt-2 max-h-80 overflow-x-auto rounded bg-black/40 p-2 text-xs text-zinc-200'>
                          {JSON.stringify(
                            subscriptionDebugResult.body,
                            null,
                            2,
                          )}
                        </pre>
                      </details>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Automation Manual Triggers */}
        <Card className='mb-8 md:mb-10 lg:mb-12 bg-zinc-900 border-zinc-800'>
          <CardHeader className='pb-4 md:pb-6'>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl lg:text-3xl'>
              <Zap className='h-5 w-5 md:h-6 md:w-6' />
              Manual Automation Triggers
            </CardTitle>
            <CardDescription className='text-sm md:text-base text-zinc-400'>
              Manually trigger automated creation tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6'>
              {/* Moon Circle Trigger */}
              <Button
                onClick={async () => {
                  if (
                    !confirm(
                      'Create moon circle for today? (Will skip if already exists)',
                    )
                  )
                    return;
                  try {
                    const response = await fetch(
                      '/api/admin/trigger/moon-circle',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          date: new Date().toISOString().split('T')[0],
                        }),
                      },
                    );
                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Moon circle ${result.moonCircleGenerated ? 'created' : 'already exists'}\n\nPhase: ${result.moonCircle?.phase || 'N/A'}\nSign: ${result.moonCircle?.sign || 'N/A'}`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || result.message}`);
                    }
                  } catch (error: any) {
                    alert(`❌ Error: ${error.message || 'Unknown error'}`);
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-primary-600 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Sparkles className='h-8 w-8 text-lunary-primary-400' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      Moon Circle
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Create for today
                    </div>
                  </div>
                </div>
              </Button>

              {/* Calendar Trigger */}
              <Button
                onClick={async () => {
                  const year = prompt('Enter year (e.g., 2026):', '2026');
                  if (!year || !/^\d{4}$/.test(year)) {
                    alert('Invalid year');
                    return;
                  }
                  if (
                    !confirm(
                      `Generate calendar for ${year}? This will create a Stripe product.`,
                    )
                  )
                    return;
                  try {
                    const response = await fetch(
                      '/api/shop/calendar/generate-and-sync',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          year: parseInt(year),
                          dryRun: false,
                          autoPublish: true,
                        }),
                      },
                    );
                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Calendar created: ${result.calendar.name}\n\nStripe Product: ${result.stripe.productId}\nEvents: ${result.calendar.eventCount}`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || result.details}`);
                    }
                  } catch (error: any) {
                    alert(`❌ Error: ${error.message || 'Unknown error'}`);
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-secondary-700 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-lunary-secondary' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>Calendar</div>
                    <div className='text-xs text-zinc-400'>Generate year</div>
                  </div>
                </div>
              </Button>

              {/* Monthly Pack Trigger */}
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
                      `Generate monthly moon pack for ${monthName} ${currentYear}?`,
                    )
                  )
                    return;

                  try {
                    const response = await fetch(
                      '/api/admin/trigger/moon-packs',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'monthly' }),
                      },
                    );
                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Monthly packs generated: ${result.packsCreated || 0} packs`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || 'Unknown error'}`);
                    }
                  } catch (error: any) {
                    alert(`❌ Error: ${error.message || 'Unknown error'}`);
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-success-700 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Package className='h-8 w-8 text-lunary-success' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      Monthly Packs
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Generate next 3 months
                    </div>
                  </div>
                </div>
              </Button>

              {/* Yearly Pack Trigger */}
              <Button
                onClick={async () => {
                  const currentYear = new Date().getFullYear();
                  if (!confirm(`Generate yearly moon pack for ${currentYear}?`))
                    return;

                  try {
                    const response = await fetch(
                      '/api/admin/trigger/moon-packs',
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'yearly' }),
                      },
                    );
                    const result = await response.json();
                    if (result.success) {
                      alert(
                        `✅ Yearly pack generated: ${result.packsCreated || 0} packs`,
                      );
                    } else {
                      alert(`❌ Failed: ${result.error || 'Unknown error'}`);
                    }
                  } catch (error: any) {
                    alert(`❌ Error: ${error.message || 'Unknown error'}`);
                  }
                }}
                variant='outline'
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-accent-700 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Package className='h-8 w-8 text-lunary-accent' />
                  <div className='text-center'>
                    <div className='font-semibold text-base mb-1'>
                      Yearly Pack
                    </div>
                    <div className='text-xs text-zinc-400'>
                      Generate this year
                    </div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

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
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-primary-600 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-lunary-primary-400' />
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
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-secondary-700 text-white transition-all'
              >
                <div className='flex flex-col items-center gap-3 w-full'>
                  <Calendar className='h-8 w-8 text-lunary-secondary' />
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
                className='h-auto p-6 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 hover:border-lunary-success-700 text-white transition-all'
              >
                <Link
                  href='/admin/shop-manager'
                  className='flex flex-col items-center gap-3 w-full'
                >
                  <Store className='h-8 w-8 text-lunary-success' />
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
                <div className='w-2 h-2 md:w-3 md:h-3 bg-lunary-success rounded-full animate-pulse'></div>
                <span className='text-sm md:text-base'>
                  Master Cron: Active (1 PM UTC daily)
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 md:w-3 md:h-3 bg-lunary-secondary rounded-full'></div>
                <span className='text-sm md:text-base'>
                  Grimoire API: Ready
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 md:w-3 md:h-3 bg-lunary-primary-500 rounded-full'></div>
                <span className='text-sm md:text-base'>
                  Stripe Integration: Configured
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
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
            {activityLoading ? (
              <div className='text-center py-6 md:py-8 lg:py-10 text-zinc-400'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-lunary-primary-400 mx-auto mb-4'></div>
                <p className='text-sm md:text-base'>Loading activity...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className='text-center py-6 md:py-8 lg:py-10 text-zinc-400'>
                <Activity className='h-10 w-10 md:h-12 md:w-12 mx-auto mb-4 opacity-50' />
                <p className='text-sm md:text-base'>No activity yet</p>
                <p className='text-xs md:text-sm mt-2'>
                  Activity will appear here as automation runs
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {recentActivity.map((activity: any) => {
                  const statusColor =
                    activity.status === 'success'
                      ? 'text-lunary-success'
                      : activity.status === 'failed'
                        ? 'text-lunary-error'
                        : activity.status === 'pending'
                          ? 'text-lunary-accent'
                          : 'text-zinc-400';
                  const statusBg =
                    activity.status === 'success'
                      ? 'bg-lunary-success-950 border-lunary-success-900'
                      : activity.status === 'failed'
                        ? 'bg-lunary-error-950 border-lunary-error-900'
                        : activity.status === 'pending'
                          ? 'bg-lunary-accent-950 border-lunary-accent-900'
                          : 'bg-zinc-500/10 border-zinc-500/20';

                  const activityTypeLabels: Record<string, string> = {
                    cron_execution: 'Cron Job',
                    pack_generation: 'Pack Generation',
                    calendar_creation: 'Calendar Creation',
                    moon_circle_creation: 'Moon Circle',
                    content_creation: 'Content Creation',
                    admin_action: 'Admin Action',
                  };

                  const categoryIcons: Record<string, React.ReactNode> = {
                    automation: <Activity className='h-4 w-4' />,
                    content: <FileText className='h-4 w-4' />,
                    shop: <Store className='h-4 w-4' />,
                    notifications: <Bell className='h-4 w-4' />,
                    admin: <Settings className='h-4 w-4' />,
                  };

                  const timeAgo = (date: string) => {
                    const now = new Date();
                    const then = new Date(date);
                    const diffMs = now.getTime() - then.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    const diffDays = Math.floor(diffMs / 86400000);

                    if (diffMins < 1) return 'Just now';
                    if (diffMins < 60) return `${diffMins}m ago`;
                    if (diffHours < 24) return `${diffHours}h ago`;
                    return `${diffDays}d ago`;
                  };

                  return (
                    <div
                      key={activity.id}
                      className='flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50 hover:bg-zinc-800 transition-colors'
                    >
                      <div
                        className={`p-2 rounded-lg ${statusBg} ${statusColor} flex-shrink-0`}
                      >
                        {categoryIcons[activity.activity_category] || (
                          <Activity className='h-4 w-4' />
                        )}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='text-sm font-medium text-white'>
                            {activityTypeLabels[activity.activity_type] ||
                              activity.activity_type}
                          </span>
                          <Badge
                            className={`text-xs ${statusBg} ${statusColor} border-0`}
                          >
                            {activity.status}
                          </Badge>
                        </div>
                        <p className='text-xs text-zinc-400 line-clamp-1'>
                          {activity.message || 'No message'}
                        </p>
                        {activity.error_message && (
                          <p className='text-xs text-lunary-error mt-1 line-clamp-1'>
                            Error: {activity.error_message}
                          </p>
                        )}
                        {activity.metadata &&
                          typeof activity.metadata === 'object' && (
                            <div className='text-xs text-zinc-400 mt-1'>
                              {activity.metadata.packsCreated &&
                                `${activity.metadata.packsCreated} packs`}
                              {activity.metadata.postsGenerated &&
                                ` ${activity.metadata.postsGenerated} posts`}
                              {activity.metadata.year &&
                                ` ${activity.metadata.year}`}
                            </div>
                          )}
                      </div>
                      <div className='flex-shrink-0 text-xs text-zinc-400'>
                        {timeAgo(activity.created_at)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
