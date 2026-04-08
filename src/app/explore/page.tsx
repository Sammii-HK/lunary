import Link from 'next/link';
import {
  BookMarked,
  User,
  Users,
  Stars,
  BookOpen,
  Tag,
  Store,
  CircleDot,
  FolderOpen,
  Calendar,
  FileText,
  ChevronRight,
  NotebookPen,
  HelpCircle,
  Gift,
  MessageCircleQuestion,
  Share2,
} from 'lucide-react';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';
import { HappeningNowSection } from '@/components/explore/HappeningNowSection';
import { HideOnNativeIOS } from '@/components/explore/NativeIOSFilter';
import { IOSLabel } from '@/components/explore/IOSLabel';
import { CircleInviteCTA } from '@/components/CircleInviteCTA';
import { Heading } from '@/components/ui/Heading';

export const metadata = {
  title: 'Explore | Lunary',
  description: 'Discover all features and resources in Lunary',
  alternates: {
    canonical: 'https://lunary.app/explore',
  },
};

type ExploreItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  highlighted?: boolean;
  badge?: string;
  hideOnNativeIOS?: boolean;
};

const withNavParam = (href: string) => {
  const [path, query] = href.split('?');
  const params = new URLSearchParams(query || '');
  params.set('nav', 'app');
  return `${path}?${params.toString()}`;
};

// Section 2: Your Cosmic Tools - Personalized features using birth chart data
const cosmicTools: ExploreItem[] = [
  {
    href: '/app/birth-chart',
    label: 'Birth Chart',
    description: 'Your cosmic blueprint',
    icon: Stars,
  },
  {
    href: '/book-of-shadows',
    label: 'Book of Shadows',
    description: 'Your reflections and patterns',
    icon: NotebookPen,
  },
  {
    href: '/collections',
    label: 'Collections',
    description: 'Saved readings and moments',
    icon: FolderOpen,
  },
  {
    href: '/forecast',
    label: '2026 Forecast',
    description: 'Your year ahead',
    icon: Calendar,
  },
  {
    href: '/cosmic-report-generator',
    label: 'Cosmic Report',
    description: 'Generate detailed reports',
    icon: FileText,
  },
  {
    href: '/profile',
    label: 'Profile',
    description: 'Your cosmic identity',
    icon: User,
  },
  {
    href: '/profile?tab=circle',
    label: 'Your Circle',
    description: 'Friends & compatibility',
    icon: Users,
  },
  {
    href: '/gifts',
    label: 'Gifts',
    description: 'Send cosmic gifts to friends',
    icon: Gift,
  },
];

// Section 3: Learn & Connect - Educational content and community
const learnConnectItems: ExploreItem[] = [
  {
    href: '/community',
    label: 'Community',
    description: 'Sign spaces, Saturn Return circles, and retrograde check-ins',
    icon: Users,
    highlighted: true,
    badge: 'New',
  },
  {
    href: '/community/questions',
    label: 'Ask the Circle',
    description: 'Ask astrology questions, get community wisdom',
    icon: MessageCircleQuestion,
    highlighted: true,
    badge: 'New',
  },
  {
    href: '/referrals',
    label: 'Referrals',
    description: 'Invite friends, earn cosmic rewards',
    icon: Share2,
  },
  {
    href: '/moon-circles',
    label: 'Moon Circles',
    description: 'Share insights with the community',
    icon: CircleDot,
  },
  {
    href: '/grimoire',
    label: 'Grimoire',
    description: '2,000+ articles on astrology, tarot, crystals',
    icon: BookMarked,
  },
  {
    href: '/shop?from=explore',
    label: 'Shop',
    description: 'Practice guides, crystal reference, and more',
    icon: Store,
    hideOnNativeIOS: true,
  },
  {
    href: '/blog?from=explore',
    label: 'Blog',
    description: 'Latest cosmic insights',
    icon: BookOpen,
  },
];

// Section 4: Account - Settings and account management
const accountItems: ExploreItem[] = [
  {
    href: '/profile',
    label: 'Profile & Settings',
    description: 'Manage your account',
    icon: User,
  },
  {
    href: '/pricing?from=explore',
    label: 'Pricing',
    description: 'Subscription plans',
    icon: Tag,
    hideOnNativeIOS: true,
  },
  {
    href: '/help',
    label: 'Help',
    description: 'Support & FAQ',
    icon: HelpCircle,
  },
];

export default function ExplorePage() {
  return (
    <div className='min-h-screen flex flex-col'>
      <div className='flex-1 p-4'>
        <div className='max-w-2xl mx-auto space-y-6'>
          <header className='pt-4 pb-2'>
            <Heading variant='h1' as='h1'>
              Explore
            </Heading>
            <p className='text-sm text-content-muted'>
              Discover all Lunary features and resources
            </p>
          </header>

          {/* Section 1: Happening Now - Contextual content */}
          <HappeningNowSection />

          {/* Section 2: Your Cosmic Tools */}
          <section>
            <h2 className='text-xs font-medium text-content-muted uppercase tracking-wide mb-3'>
              <IOSLabel>Your Cosmic Tools</IOSLabel>
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
              {cosmicTools.map((item) => (
                <CosmicToolCard key={item.href} item={item} />
              ))}
            </div>
          </section>

          {/* Invite/Referral CTA */}
          <CircleInviteCTA />

          {/* Section 3: Learn & Connect */}
          <section>
            <h2 className='text-xs font-medium text-content-muted uppercase tracking-wide mb-3'>
              Learn & Connect
            </h2>
            <div className='space-y-2'>
              {learnConnectItems.map((item) => {
                const node = item.highlighted ? (
                  <HighlightedLink key={item.href} item={item} />
                ) : (
                  <ResourceLink key={item.href} item={item} />
                );
                return item.hideOnNativeIOS ? (
                  <HideOnNativeIOS key={item.href}>{node}</HideOnNativeIOS>
                ) : (
                  node
                );
              })}
            </div>
          </section>

          {/* Section 4: Account */}
          <section className='pt-2'>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
              {accountItems.map((item) => {
                const node = (
                  <Link
                    key={item.href}
                    href={withNavParam(item.href)}
                    className='text-content-muted hover:text-content-primary active:text-content-primary transition-colors'
                  >
                    {item.label}
                  </Link>
                );
                return item.hideOnNativeIOS ? (
                  <HideOnNativeIOS key={item.href}>{node}</HideOnNativeIOS>
                ) : (
                  node
                );
              })}
            </div>
          </section>
        </div>
      </div>
      <MarketingFooterGate />
    </div>
  );
}

function CosmicToolCard({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={withNavParam(item.href)}
      className='flex flex-col items-center gap-2 p-4 rounded-lg border border-stroke-subtle bg-surface-elevated/50 hover:border-lunary-primary-600 hover:bg-surface-elevated active:border-lunary-primary-600 active:bg-surface-elevated transition-colors group text-center'
    >
      <div className='p-2 rounded-lg bg-layer-high/20 text-content-brand'>
        <Icon className='w-5 h-5' />
      </div>
      <div className='min-w-0'>
        <h3 className='text-sm font-medium text-content-primary group-hover:text-content-brand group-active:text-content-brand transition-colors'>
          <IOSLabel>{item.label}</IOSLabel>
        </h3>
        <p className='text-[11px] text-content-muted leading-tight'>
          <IOSLabel>{item.description}</IOSLabel>
        </p>
      </div>
    </Link>
  );
}

function HighlightedLink({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={withNavParam(item.href)}
      className='flex items-center gap-4 p-4 rounded-lg border border-stroke-strong bg-gradient-to-r from-layer-deep/60 to-surface-elevated hover:border-stroke-strong hover:from-layer-base/60 active:border-stroke-strong active:from-layer-base/60 transition-all group'
    >
      <div className='p-2 rounded-lg bg-layer-high/20 text-content-brand'>
        <Icon className='w-5 h-5' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-content-primary group-hover:text-content-brand group-active:text-content-brand transition-colors'>
            <IOSLabel>{item.label}</IOSLabel>
          </span>
          {item.badge && (
            <span className='px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full bg-layer-high/30 text-content-brand border border-stroke-default'>
              {item.badge}
            </span>
          )}
        </div>
        <p className='text-xs text-content-muted'>
          <IOSLabel>{item.description}</IOSLabel>
        </p>
      </div>
      <ChevronRight className='w-4 h-4 text-content-muted group-hover:text-content-brand group-active:text-content-brand transition-colors' />
    </Link>
  );
}

function ResourceLink({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={withNavParam(item.href)}
      className='flex items-center gap-4 p-3 rounded-lg border border-stroke-subtle hover:border-stroke-default hover:bg-surface-elevated/50 active:border-stroke-default active:bg-surface-elevated/50 transition-colors group'
    >
      <Icon className='w-4 h-4 text-content-muted group-hover:text-content-brand group-active:text-content-brand transition-colors' />
      <div className='flex-1 min-w-0'>
        <span className='text-sm text-content-secondary group-hover:text-content-primary group-active:text-content-primary transition-colors'>
          <IOSLabel>{item.label}</IOSLabel>
        </span>
        <p className='text-xs text-content-muted'>
          <IOSLabel>{item.description}</IOSLabel>
        </p>
      </div>
      <ChevronRight className='w-4 h-4 text-content-muted group-hover:text-content-muted group-active:text-content-muted transition-colors' />
    </Link>
  );
}
