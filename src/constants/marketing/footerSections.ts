export type MarketingSectionItem = {
  title: string;
  href: string;
  description?: string;
};

export type MarketingSectionKey = 'product' | 'resources' | 'legal' | 'about';

export const marketingSectionItems: Record<
  MarketingSectionKey,
  MarketingSectionItem[]
> = {
  product: [
    {
      title: 'Pricing',
      href: '/pricing',
      description: 'Plans for free and premium cosmic guidance.',
    },
    {
      title: 'Grimoire',
      href: '/grimoire?nav=marketing',
      description: 'Deep dives into astrology, tarot, and ritual craft.',
    },
    {
      title: 'Horoscopes',
      href: '/horoscope?nav=marketing',
      description: 'Daily and seasonal guidance tailored to your sky.',
    },
    {
      title: 'Blog',
      href: '/blog?nav=marketing',
      description: 'Essays and updates from the Lunary team.',
    },
    {
      title: 'Developers',
      href: '/developers',
      description: 'API access and developer documentation.',
    },
    {
      title: 'Explore Features',
      href: '/explore?nav=marketing',
      description: 'A tour of what Lunary can do for you.',
    },
  ],
  resources: [
    {
      title: 'FAQ',
      href: '/faq',
      description: 'Frequently asked questions about Lunary.',
    },
    {
      title: 'Help Center',
      href: '/help',
      description: 'Answers to common questions and support.',
    },
    {
      title: 'Compare Apps',
      href: '/comparison',
      description: 'See how Lunary stacks up against other apps.',
    },
    {
      title: 'Press Kit',
      href: '/press-kit',
      description: 'Brand assets, product screenshots, and press info.',
    },
    {
      title: 'About Lunary',
      href: '/about/lunary',
      description: 'Learn about the origin story and purpose of Lunary.',
    },
    {
      title: 'About the Founder',
      href: '/about/sammii',
      description: 'Meet the founder and the origin story behind Lunary.',
    },
    {
      title: 'Editorial Guidelines',
      href: '/about/editorial-guidelines',
      description: 'How we research, write, and review spiritual content.',
    },
    {
      title: 'Methodology',
      href: '/about/methodology',
      description: 'Our technical approach to charts, transits, and accuracy.',
    },
  ],
  legal: [
    {
      title: 'Privacy Policy',
      href: '/privacy',
      description: 'How we collect, use, and protect your data.',
    },
    {
      title: 'Terms of Service',
      href: '/terms',
      description: 'The rules and agreements for using Lunary.',
    },
    {
      title: 'Cookie Policy',
      href: '/cookies',
      description: 'Details on cookies and tracking technologies.',
    },
    {
      title: 'Refund Policy',
      href: '/refund',
      description: 'How refunds and cancellations are handled.',
    },
    {
      title: 'Accessibility',
      href: '/accessibility',
      description: 'Our accessibility commitments and contact info.',
    },
    {
      title: 'DMCA Policy',
      href: '/dmca',
      description: 'Copyright and takedown requests.',
    },
    {
      title: 'Referral Terms',
      href: '/referral-terms',
      description: 'Rules for referral program participation.',
    },
    {
      title: 'API Terms',
      href: '/api-terms',
      description: 'Terms for using the Lunary API.',
    },
    {
      title: 'Trademark Guidelines',
      href: '/trademark',
      description: 'Guidelines for proper use of the Lunary brand.',
    },
  ],
  about: [
    {
      title: 'About Lunary',
      href: '/about/lunary',
      description: 'Learn about the origin story and purpose of Lunary.',
    },
    {
      title: 'About the Founder',
      href: '/about/sammii',
      description: 'Meet the founder and the origin story behind Lunary.',
    },
    {
      title: 'Editorial Guidelines',
      href: '/about/editorial-guidelines',
      description: 'How we research, write, and review spiritual content.',
    },
    {
      title: 'Methodology',
      href: '/about/methodology',
      description: 'Our technical approach to charts, transits, and accuracy.',
    },
  ],
};

type MarketingFooterSection = {
  key: MarketingSectionKey;
  label: string;
  href: string;
  items: MarketingSectionItem[];
  includeCookieSettings?: boolean;
};

export const marketingFooterSections: MarketingFooterSection[] = [
  {
    key: 'product',
    label: 'Product',
    href: '/product',
    items: marketingSectionItems.product,
  },
  {
    key: 'resources',
    label: 'Resources',
    href: '/resources',
    items: marketingSectionItems.resources,
  },
  {
    key: 'legal',
    label: 'Legal',
    href: '/legal',
    items: marketingSectionItems.legal,
    includeCookieSettings: true,
  },
];
