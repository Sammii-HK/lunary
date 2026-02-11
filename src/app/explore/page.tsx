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
  Globe,
  ChevronRight,
  NotebookPen,
  HelpCircle,
  Gift,
} from 'lucide-react';
import { MarketingFooterGate } from '@/components/MarketingFooterGate';
import { HappeningNowSection } from '@/components/explore/HappeningNowSection';
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
    href: '/cosmic-state',
    label: 'Cosmic State',
    description: 'Current planetary positions',
    icon: Globe,
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
    description: 'Spell packs, crystal guides, and more',
    icon: Store,
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
            <p className='text-sm text-zinc-400'>
              Discover all Lunary features and resources
            </p>
          </header>

          {/* Section 1: Happening Now - Contextual content */}
          <HappeningNowSection />

          {/* Section 2: Your Cosmic Tools */}
          <section>
            <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
              Your Cosmic Tools
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
            <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
              Learn & Connect
            </h2>
            <div className='space-y-2'>
              {learnConnectItems.map((item) =>
                item.highlighted ? (
                  <HighlightedLink key={item.href} item={item} />
                ) : (
                  <ResourceLink key={item.href} item={item} />
                ),
              )}
            </div>
          </section>

          {/* Section 4: Account */}
          <section className='pt-2'>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm'>
              {accountItems.map((item) => (
                <Link
                  key={item.href}
                  href={withNavParam(item.href)}
                  className='text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  {item.label}
                </Link>
              ))}
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
      className='flex flex-col items-center gap-2 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-colors group text-center'
    >
      <div className='p-2 rounded-lg bg-lunary-primary-900/10 text-lunary-primary-400'>
        <Icon className='w-5 h-5' />
      </div>
      <div className='min-w-0'>
        <h3 className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
          {item.label}
        </h3>
        <p className='text-[11px] text-zinc-500 leading-tight'>
          {item.description}
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
      className='flex items-center gap-4 p-4 rounded-lg border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-950/60 to-zinc-900 hover:border-lunary-primary-500 hover:from-lunary-primary-900/60 transition-all group'
    >
      <div className='p-2 rounded-lg bg-lunary-primary-900/30 text-lunary-primary-400'>
        <Icon className='w-5 h-5' />
      </div>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
            {item.label}
          </span>
          {item.badge && (
            <span className='px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 border border-lunary-primary-700/50'>
              {item.badge}
            </span>
          )}
        </div>
        <p className='text-xs text-zinc-400'>{item.description}</p>
      </div>
      <ChevronRight className='w-4 h-4 text-lunary-primary-400 group-hover:text-lunary-primary-300 transition-colors' />
    </Link>
  );
}

function ResourceLink({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={withNavParam(item.href)}
      className='flex items-center gap-4 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors group'
    >
      <Icon className='w-4 h-4 text-zinc-400 group-hover:text-lunary-primary-400 transition-colors' />
      <div className='flex-1 min-w-0'>
        <span className='text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors'>
          {item.label}
        </span>
        <p className='text-xs text-zinc-500'>{item.description}</p>
      </div>
      <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors' />
    </Link>
  );
}
