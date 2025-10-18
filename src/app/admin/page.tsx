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
        'Manage grimoire packs with Stripe sync and professional naming',
      href: '/admin/shop-manager',
      icon: <Store className='h-5 w-5' />,
      category: 'shop',
      status: 'new',
    },
    {
      title: 'Shop (Legacy)',
      description: 'Original shop management interface',
      href: '/admin/shop',
      icon: <Package className='h-5 w-5' />,
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
      title: 'New Post',
      description: 'Create and publish new content manually',
      href: '/admin/new-post',
      icon: <Mail className='h-5 w-5' />,
      category: 'content',
    },
  ];

  const categories = {
    content: { name: 'Content Management', color: 'bg-blue-100 text-blue-800' },
    shop: { name: 'Shop & Products', color: 'bg-green-100 text-green-800' },
    automation: { name: 'Automation', color: 'bg-purple-100 text-purple-800' },
    monitoring: { name: 'Monitoring', color: 'bg-orange-100 text-orange-800' },
    tools: { name: 'Tools & Utilities', color: 'bg-gray-100 text-gray-800' },
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'new':
        return <Badge className='bg-green-100 text-green-800'>New</Badge>;
      case 'beta':
        return <Badge variant='secondary'>Beta</Badge>;
      case 'active':
        return <Badge className='bg-blue-100 text-blue-800'>Active</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className='container mx-auto py-8 px-4'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold mb-2 flex items-center gap-2'>
          <Settings className='h-10 w-10' />
          Admin Dashboard
        </h1>
        <p className='text-xl text-muted-foreground'>
          Manage your cosmic content, automation, and shop
        </p>
      </div>

      {/* Quick Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Zap className='h-5 w-5 text-yellow-500' />
              <div>
                <p className='text-2xl font-bold'>{adminTools.length}</p>
                <p className='text-sm text-muted-foreground'>Admin Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Activity className='h-5 w-5 text-green-500' />
              <div>
                <p className='text-2xl font-bold'>1</p>
                <p className='text-sm text-muted-foreground'>Active Cron</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Package className='h-5 w-5 text-blue-500' />
              <div>
                <p className='text-2xl font-bold'>5</p>
                <p className='text-sm text-muted-foreground'>Content Types</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-2'>
              <Store className='h-5 w-5 text-purple-500' />
              <div>
                <p className='text-2xl font-bold'>∞</p>
                <p className='text-sm text-muted-foreground'>Shop Ready</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tools by Category */}
      {Object.entries(categories).map(([categoryKey, categoryInfo]) => {
        const categoryTools = adminTools.filter(
          (tool) => tool.category === categoryKey,
        );

        if (categoryTools.length === 0) return null;

        return (
          <div key={categoryKey} className='mb-8'>
            <div className='flex items-center gap-2 mb-4'>
              <h2 className='text-2xl font-bold'>{categoryInfo.name}</h2>
              <Badge className={categoryInfo.color}>
                {categoryTools.length} tools
              </Badge>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {categoryTools.map((tool) => (
                <Card
                  key={tool.href}
                  className='hover:shadow-lg transition-shadow'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        {tool.icon}
                        {tool.title}
                      </CardTitle>
                      {getStatusBadge(tool.status)}
                    </div>
                    <CardDescription className='text-sm'>
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button asChild className='w-full'>
                      <Link href={tool.href}>
                        Open Tool
                        <ExternalLink className='h-4 w-4 ml-2' />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Quick Actions */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Quick Actions
          </CardTitle>
          <CardDescription>Common admin tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            <Button asChild variant='outline' className='h-auto p-4'>
              <Link
                href='/admin/cron-monitor'
                className='flex flex-col items-center gap-2'
              >
                <Activity className='h-6 w-6' />
                <span>Trigger Cron</span>
                <span className='text-xs text-muted-foreground'>
                  Test automation
                </span>
              </Link>
            </Button>

            <Button asChild variant='outline' className='h-auto p-4'>
              <Link
                href='/admin/blog-manager'
                className='flex flex-col items-center gap-2'
              >
                <BookOpen className='h-6 w-6' />
                <span>Generate Blog</span>
                <span className='text-xs text-muted-foreground'>
                  Weekly content
                </span>
              </Link>
            </Button>

            <Button asChild variant='outline' className='h-auto p-4'>
              <Link
                href='/admin/grimoire-packs'
                className='flex flex-col items-center gap-2'
              >
                <Sparkles className='h-6 w-6' />
                <span>Create Pack</span>
                <span className='text-xs text-muted-foreground'>
                  Grimoire content
                </span>
              </Link>
            </Button>

            <Button asChild variant='outline' className='h-auto p-4'>
              <Link
                href='/admin/shop-manager'
                className='flex flex-col items-center gap-2'
              >
                <Store className='h-6 w-6' />
                <span>Manage Shop</span>
                <span className='text-xs text-muted-foreground'>
                  Stripe sync
                </span>
              </Link>
            </Button>

            <Button
              onClick={testPushNotification}
              disabled={testingNotification}
              variant='outline'
              className='h-auto p-4'
            >
              <div className='flex flex-col items-center gap-2'>
                <Smartphone className='h-6 w-6' />
                <span>{testingNotification ? 'Sending...' : 'Test Push'}</span>
                <span className='text-xs text-muted-foreground'>
                  Phone notification
                </span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span>Master Cron: Active (1 PM UTC daily)</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
              <span>Grimoire API: Ready</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-purple-500 rounded-full'></div>
              <span>Stripe Integration: Configured</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Placeholder */}
      <Card className='mt-8'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Clock className='h-5 w-5' />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest admin actions and automated tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8 text-muted-foreground'>
            <Users className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>Activity tracking coming soon!</p>
            <p className='text-sm'>
              Monitor cron jobs, pack generation, and content creation
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
