'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  const [testingNotification, setTestingNotification] = useState(false);
  const [testingRealNotification, setTestingRealNotification] = useState(false);
  const [testingDaily, setTestingDaily] = useState(false);

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
        'Manage email subscribers and send weekly newsletters with Resend bulk API',
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
      <div className='container mx-auto px-4 py-6 md:py-8 max-w-7xl'>
        {/* Header */}
        <div className='mb-6 md:mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-3xl md:text-4xl font-bold mb-2 flex items-center gap-2'>
                <Settings className='h-8 w-8 md:h-10 md:w-10' />
                Admin Dashboard
              </h1>
              <p className='text-lg md:text-xl text-zinc-400'>
                Manage your cosmic content, automation, and shop
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats - Responsive Grid */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8'>
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

        {/* Quick Actions - Responsive */}
        <Card className='mb-6 md:mb-8 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl'>
              <Zap className='h-5 w-5' />
              Quick Actions
            </CardTitle>
            <CardDescription className='text-zinc-400'>
              Common admin tasks and notification testing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4'>
              <Button
                onClick={testRealNotification}
                disabled={testingRealNotification}
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <div className='flex flex-col items-center gap-2'>
                  <Bell className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>
                    {testingRealNotification ? 'Sending...' : 'Test Real'}
                  </span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Real cosmic event
                  </span>
                </div>
              </Button>

              <Button
                onClick={testPushNotification}
                disabled={testingNotification}
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <div className='flex flex-col items-center gap-2'>
                  <Smartphone className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>
                    {testingNotification ? 'Sending...' : 'Test Basic'}
                  </span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Simple test
                  </span>
                </div>
              </Button>

              <Button
                onClick={testDailyNotification}
                disabled={testingDaily}
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <div className='flex flex-col items-center gap-2'>
                  <Calendar className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>
                    {testingDaily ? 'Sending...' : 'Test Daily'}
                  </span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Rich preview
                  </span>
                </div>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <Link
                  href='/admin/cron-monitor'
                  className='flex flex-col items-center gap-2'
                >
                  <Activity className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>Trigger Cron</span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Test automation
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <Link
                  href='/admin/blog-manager'
                  className='flex flex-col items-center gap-2'
                >
                  <BookOpen className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>Generate Blog</span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Weekly content
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant='outline'
                className='h-auto p-4 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
              >
                <Link
                  href='/admin/shop-manager'
                  className='flex flex-col items-center gap-2'
                >
                  <Store className='h-5 w-5 md:h-6 md:w-6' />
                  <span className='text-xs md:text-sm'>Manage Shop</span>
                  <span className='text-[10px] md:text-xs text-zinc-400'>
                    Stripe sync
                  </span>
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
            <div key={categoryKey} className='mb-6 md:mb-8'>
              <div className='flex items-center gap-2 mb-4'>
                <h2 className='text-xl md:text-2xl font-bold'>
                  {categoryInfo.name}
                </h2>
                <Badge className={categoryInfo.color}>
                  {categoryTools.length}
                </Badge>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4'>
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
        <Card className='mt-6 md:mt-8 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl'>
              <Activity className='h-5 w-5' />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4'>
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
        <Card className='mt-6 md:mt-8 bg-zinc-900 border-zinc-800'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-xl md:text-2xl'>
              <Clock className='h-5 w-5' />
              Recent Activity
            </CardTitle>
            <CardDescription className='text-zinc-400'>
              Latest admin actions and automated tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='text-center py-6 md:py-8 text-zinc-400'>
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
