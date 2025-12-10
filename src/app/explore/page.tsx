import Link from 'next/link';
import {
  BookMarked,
  User,
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
} from 'lucide-react';

export const metadata = {
  title: 'Explore | Lunary',
  description: 'Discover all features and resources in Lunary',
};

type ExploreItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
};

const exploreItems: ExploreItem[] = [
  // Your Space - Personalized features
  {
    href: '/book-of-shadows/journal',
    label: 'Book of Shadows',
    description: 'Your reflections and patterns connected',
    icon: NotebookPen,
    featured: true,
  },
  {
    href: '/birth-chart',
    label: 'Birth Chart',
    description: 'View your cosmic blueprint and natal placements',
    icon: Stars,
    featured: true,
  },
  {
    href: '/cosmic-state',
    label: 'Cosmic State',
    description: 'Current planetary positions and influences',
    icon: Globe,
    featured: true,
  },
  {
    href: '/collections',
    label: 'Collections',
    description: 'Your saved readings and cosmic moments',
    icon: FolderOpen,
    featured: true,
  },
  {
    href: '/forecast',
    label: '2026 Forecast',
    description: 'Your yearly astrological outlook',
    icon: Calendar,
    featured: true,
  },
  {
    href: '/cosmic-report-generator',
    label: 'Cosmic Report',
    description: 'Generate detailed personal reports',
    icon: FileText,
    featured: true,
  },
  {
    href: '/profile',
    label: 'Profile & Settings',
    description: 'Manage your account, birth details, and preferences',
    icon: User,
    featured: true,
  },
  // Resources - General content
  {
    href: '/moon-circles',
    label: 'Moon Circles',
    description: 'Join lunar rituals and community gatherings',
    icon: CircleDot,
  },
  {
    href: '/grimoire',
    label: 'Grimoire',
    description: 'Explore the complete magical encyclopedia',
    icon: BookMarked,
  },
  {
    href: '/blog?from=explore',
    label: 'Blog',
    description: 'Weekly cosmic updates and insights',
    icon: BookOpen,
  },
  {
    href: '/shop',
    label: 'Shop',
    description: 'Crystals, tools, and magical supplies',
    icon: Store,
  },
  {
    href: '/pricing?from=explore',
    label: 'Pricing',
    description: 'Subscription plans and features',
    icon: Tag,
  },
];

export default function ExplorePage() {
  const featured = exploreItems.filter((item) => item.featured);
  const other = exploreItems.filter((item) => !item.featured);

  return (
    <div className='h-full overflow-auto p-4'>
      <div className='max-w-2xl mx-auto space-y-6'>
        <header className='pt-4 pb-2'>
          <h1 className='text-2xl font-light text-zinc-100'>Explore</h1>
          <p className='text-sm text-zinc-400'>
            Discover all Lunary features and resources
          </p>
        </header>

        <section>
          <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
            Your Space
          </h2>
          <div className='space-y-2'>
            {featured.map((item) => (
              <ExploreLink key={item.href} item={item} />
            ))}
          </div>
        </section>

        <section>
          <h2 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
            Resources
          </h2>
          <div className='grid grid-cols-2 gap-2'>
            {other.map((item) => (
              <ExploreLinkCompact key={item.href} item={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ExploreLink({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className='flex items-center gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-lunary-primary-600 hover:bg-zinc-900 transition-colors group'
    >
      <div className='p-2 rounded-lg bg-lunary-primary-900/10 text-lunary-primary-400'>
        <Icon className='w-5 h-5' />
      </div>
      <div className='flex-1 min-w-0'>
        <h3 className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
          {item.label}
        </h3>
        <p className='text-xs text-zinc-400'>{item.description}</p>
      </div>
      <ChevronRight className='w-4 h-4 text-zinc-600 group-hover:text-lunary-primary-400 transition-colors' />
    </Link>
  );
}

function ExploreLinkCompact({ item }: { item: ExploreItem }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className='flex items-center gap-3 p-3 rounded-lg border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors group'
    >
      <Icon className='w-4 h-4 text-zinc-400 group-hover:text-lunary-primary-400 transition-colors' />
      <span className='text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors truncate'>
        {item.label}
      </span>
    </Link>
  );
}
