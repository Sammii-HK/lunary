import { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import {
  Smartphone,
  Globe,
  Headphones,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Links | Lunary',
  description:
    'All Lunary links in one place. Download the app, listen to The Grimoire podcast, and follow us on social media.',
  openGraph: {
    title: 'Lunary — Links',
    description:
      'All Lunary links in one place. Download the app, listen to The Grimoire podcast, and follow us.',
    url: 'https://lunary.app/links',
    siteName: 'Lunary',
    type: 'website',
  },
  robots: {
    index: false,
  },
};

const MAIN_LINKS = [
  {
    label: 'Open Lunary',
    description: 'Web app — horoscopes, birth charts & more',
    href: 'https://app.lunary.app',
    icon: Globe,
    external: true,
  },
  {
    label: 'Get on Google Play',
    description: 'Download the Android app',
    href: 'https://play.google.com/store/apps/details?id=app.lunary',
    icon: Smartphone,
    external: true,
  },
  {
    label: 'App Store',
    description: 'Coming soon',
    href: null,
    icon: Smartphone,
    external: false,
    disabled: true,
  },
  {
    label: 'Listen to The Grimoire',
    description: 'Our astrology & cosmic wisdom podcast',
    href: '/podcast',
    icon: Headphones,
    external: false,
  },
  {
    label: 'Read the Grimoire',
    description: 'Articles, guides & deep dives',
    href: '/grimoire',
    icon: BookOpen,
    external: false,
  },
];

const SOCIAL_LINKS = [
  {
    label: 'Threads',
    href: 'https://www.threads.net/@lunary.app',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 640 640'>
        <path d='M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z' />
      </svg>
    ),
  },
  {
    label: 'TikTok',
    href: 'https://www.tiktok.com/@lunary.app',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.88-2.88 2.89 2.89 0 0 1 2.88-2.88c.28 0 .56.04.81.1v-3.5a6.37 6.37 0 0 0-.81-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.85 1.56V6.86a4.84 4.84 0 0 1-1.09-.17z' />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/lunary.app',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 2a1 1 0 100 2 1 1 0 000-2zM12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z' />
      </svg>
    ),
  },
  {
    label: 'X / Twitter',
    href: 'https://twitter.com/lunaryApp',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
      </svg>
    ),
  },
  {
    label: 'Pinterest',
    href: 'https://www.pinterest.com/lunaryapp',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 384 512'>
        <path d='M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.4 296 63.7 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z' />
      </svg>
    ),
  },
  {
    label: 'Bluesky',
    href: 'https://bsky.app/profile/lunaryapp.bsky.social',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 640 640'>
        <path d='M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z' />
      </svg>
    ),
  },
  {
    label: 'Discord',
    href: 'https://discord.gg/SUvdhDXFSk',
    icon: (
      <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
        <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
      </svg>
    ),
  },
];

export default function LinksPage() {
  return (
    <div className='min-h-screen bg-lunary-bg flex items-start justify-center px-4 py-12'>
      <div className='w-full max-w-md space-y-8'>
        {/* Profile header */}
        <div className='flex flex-col items-center gap-3'>
          <Logo size={56} />
          <h1 className='text-xl font-bold text-zinc-100 font-mono tracking-tight'>
            Lunary
          </h1>
          <p className='text-sm text-zinc-400 text-center max-w-xs'>
            Astrology, tarot & cosmic wisdom — in your pocket.
          </p>
        </div>

        {/* Main links */}
        <div className='space-y-3'>
          {MAIN_LINKS.map((link) => {
            const Icon = link.icon;
            const inner = (
              <span className='flex items-center gap-3 w-full'>
                <span className='flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-800/80 flex items-center justify-center text-lunary-primary-400'>
                  <Icon className='w-5 h-5' />
                </span>
                <span className='flex-1 min-w-0'>
                  <span className='block text-sm font-medium text-zinc-100'>
                    {link.label}
                  </span>
                  <span className='block text-xs text-zinc-500'>
                    {link.description}
                  </span>
                </span>
                {link.external && (
                  <ExternalLink className='w-4 h-4 text-zinc-600 flex-shrink-0' />
                )}
              </span>
            );

            if (link.disabled) {
              return (
                <div
                  key={link.label}
                  className='block w-full rounded-xl border border-zinc-800/40 bg-zinc-900/30 p-3 opacity-50 cursor-not-allowed'
                >
                  {inner}
                </div>
              );
            }

            if (link.external) {
              return (
                <a
                  key={link.label}
                  href={link.href!}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block w-full rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 hover:bg-zinc-800/60 hover:border-lunary-primary-700/50 transition-colors'
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link
                key={link.label}
                href={link.href!}
                className='block w-full rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-3 hover:bg-zinc-800/60 hover:border-lunary-primary-700/50 transition-colors'
              >
                {inner}
              </Link>
            );
          })}
        </div>

        {/* Social links */}
        <div className='space-y-3'>
          <p className='text-xs text-zinc-500 uppercase tracking-wider text-center'>
            Follow us
          </p>
          <div className='flex items-center justify-center gap-2 flex-wrap'>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900/60 border border-zinc-800/60 text-zinc-400 hover:text-lunary-primary-400 hover:bg-zinc-800/60 hover:border-lunary-primary-700/50 transition-colors'
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='text-center pt-4'>
          <Link
            href='/'
            className='text-xs text-zinc-600 hover:text-zinc-400 transition-colors'
          >
            lunary.app
          </Link>
        </div>
      </div>
    </div>
  );
}
