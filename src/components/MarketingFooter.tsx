'use client';

import Link from 'next/link';
import {
  SOCIAL_HANDLES,
  SOCIAL_PLATFORM_LABELS,
} from '@/constants/socialHandles';
import { Logo } from './Logo';
import { CookieSettingsButton } from './CookieConsent';

export function MarketingFooter() {
  const socialLinks = [
    {
      platform: 'instagram' as const,
      url: SOCIAL_HANDLES.instagram
        ? `https://www.instagram.com/${SOCIAL_HANDLES.instagram.replace('@', '')}`
        : 'https://www.instagram.com/lunary.app',
      label: SOCIAL_PLATFORM_LABELS.instagram,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm9 2a1 1 0 100 2 1 1 0 000-2zM12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3s-1.346 3-3 3-3-1.346-3-3 1.346-3 3-3z' />
        </svg>
      ),
    },
    {
      platform: 'twitter' as const,
      url: SOCIAL_HANDLES.twitter
        ? `https://twitter.com/${SOCIAL_HANDLES.twitter.replace('@', '')}`
        : 'https://twitter.com/lunaryApp',
      label: SOCIAL_PLATFORM_LABELS.twitter,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
        </svg>
      ),
    },
    {
      platform: 'threads' as const,
      url: SOCIAL_HANDLES.threads
        ? `https://www.threads.net/@${SOCIAL_HANDLES.threads.replace('@', '')}`
        : 'https://www.threads.net/@lunary.app',
      label: SOCIAL_PLATFORM_LABELS.threads,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 640 640'>
          <path d='M427.5 299.7C429.7 300.6 431.7 301.6 433.8 302.5C463 316.6 484.4 337.7 495.6 363.9C511.3 400.4 512.8 459.7 465.3 507.1C429.1 543.3 385 559.6 322.7 560.1L322.4 560.1C252.2 559.6 198.3 536 162 489.9C129.7 448.9 113.1 391.8 112.5 320.3L112.5 319.8C113 248.3 129.6 191.2 161.9 150.2C198.2 104.1 252.2 80.5 322.4 80L322.7 80C393 80.5 447.6 104 485 149.9C503.4 172.6 517 199.9 525.6 231.6L485.2 242.4C478.1 216.6 467.4 194.6 453 177C423.8 141.2 380 122.8 322.5 122.4C265.5 122.9 222.4 141.2 194.3 176.8C168.1 210.1 154.5 258.3 154 320C154.5 381.7 168.1 429.9 194.3 463.3C222.3 498.9 265.5 517.2 322.5 517.7C373.9 517.3 407.9 505.1 436.2 476.8C468.5 444.6 467.9 405 457.6 380.9C451.5 366.7 440.5 354.9 425.7 346C422 372.9 413.9 394.3 401 410.8C383.9 432.6 359.6 444.4 328.3 446.1C304.7 447.4 282 441.7 264.4 430.1C243.6 416.3 231.4 395.3 230.1 370.8C227.6 322.5 265.8 287.8 325.3 284.4C346.4 283.2 366.2 284.1 384.5 287.2C382.1 272.4 377.2 260.6 369.9 252C359.9 240.3 344.3 234.3 323.7 234.2L323 234.2C306.4 234.2 284 238.8 269.7 260.5L235.3 236.9C254.5 207.8 285.6 191.8 323.1 191.8L323.9 191.8C386.5 192.2 423.8 231.3 427.6 299.5L427.4 299.7L427.5 299.7zM271.5 368.5C272.8 393.6 299.9 405.3 326.1 403.8C351.7 402.4 380.7 392.4 385.6 330.6C372.4 327.7 357.8 326.2 342.2 326.2C337.4 326.2 332.6 326.3 327.8 326.6C284.9 329 270.6 349.8 271.6 368.4L271.5 368.5z' />
        </svg>
      ),
    },
    {
      platform: 'bluesky' as const,
      url: SOCIAL_HANDLES.bluesky
        ? `https://bsky.app/profile/${SOCIAL_HANDLES.bluesky.replace('@', '')}`
        : 'https://bsky.app/profile/lunaryapp.bsky.social',
      label: SOCIAL_PLATFORM_LABELS.bluesky,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 640 640'>
          <path d='M439.8 358.7C436.5 358.3 433.1 357.9 429.8 357.4C433.2 357.8 436.5 358.3 439.8 358.7zM320 291.1C293.9 240.4 222.9 145.9 156.9 99.3C93.6 54.6 69.5 62.3 53.6 69.5C35.3 77.8 32 105.9 32 122.4C32 138.9 41.1 258 47 277.9C66.5 343.6 136.1 365.8 200.2 358.6C203.5 358.1 206.8 357.7 210.2 357.2C206.9 357.7 203.6 358.2 200.2 358.6C106.3 372.6 22.9 406.8 132.3 528.5C252.6 653.1 297.1 501.8 320 425.1C342.9 501.8 369.2 647.6 505.6 528.5C608 425.1 533.7 372.5 439.8 358.6C436.5 358.2 433.1 357.8 429.8 357.3C433.2 357.7 436.5 358.2 439.8 358.6C503.9 365.7 573.4 343.5 593 277.9C598.9 258 608 139 608 122.4C608 105.8 604.7 77.7 586.4 69.5C570.6 62.4 546.4 54.6 483.2 99.3C417.1 145.9 346.1 240.4 320 291.1z' />
        </svg>
      ),
    },
    {
      platform: 'discord' as const,
      url: 'https://discord.gg/SUvdhDXFSk',
      label: 'Discord',
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' />
        </svg>
      ),
    },
    {
      platform: 'pinterest' as const,
      url: SOCIAL_HANDLES.pinterest
        ? `https://www.pinterest.com/${SOCIAL_HANDLES.pinterest.replace('@', '')}`
        : 'https://www.pinterest.com/lunaryapp',
      label: SOCIAL_PLATFORM_LABELS.pinterest,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 384 512'>
          <path d='M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.4 296 63.7 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z' />
        </svg>
      ),
    },
  ].filter((link) => link.url);

  return (
    <footer className='border-t border-zinc-800/50 bg-zinc-950/50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Top: Brand + Social */}
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8'>
          <Link
            href='/'
            className='flex items-center gap-2 text-xl font-medium font-mono text-zinc-100 tracking-tight hover:text-purple-400 transition-colors'
          >
            <Logo size={24} />
            Lunary
          </Link>
          <div className='flex items-center gap-2'>
            {socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-purple-400 transition-colors'
                aria-label={social.label}
                title={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links Grid - 3 columns */}
        <div className='grid grid-cols-2 md:grid-cols-3 gap-6 mb-8'>
          {/* Product */}
          <nav className='space-y-2'>
            <h3 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3'>
              Product
            </h3>
            <Link
              href='/pricing'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Pricing
            </Link>
            <Link
              href='/grimoire'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Grimoire
            </Link>
            <Link
              href='/horoscope'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Horoscopes
            </Link>
            <Link
              href='/blog'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Blog
            </Link>
            <Link
              href='/developers'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Developers
            </Link>
          </nav>

          {/* Resources */}
          <nav className='space-y-2'>
            <h3 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3'>
              Resources
            </h3>
            <Link
              href='/help'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Help Center
            </Link>
            <Link
              href='/comparison'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Compare Apps
            </Link>
            <Link
              href='/press-kit'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Press Kit
            </Link>
            <Link
              href='/accessibility'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Accessibility
            </Link>
          </nav>

          {/* Legal */}
          <nav className='space-y-2'>
            <h3 className='text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3'>
              Legal
            </h3>
            <Link
              href='/privacy'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Privacy
            </Link>
            <Link
              href='/terms'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Terms
            </Link>
            <Link
              href='/cookies'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Cookies
            </Link>
            <Link
              href='/refund'
              className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
            >
              Refunds
            </Link>
            <CookieSettingsButton />
          </nav>
        </div>

        {/* Copyright */}
        <div className='pt-6 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-500 text-center'>
            © {new Date().getFullYear()} Lunar Computing, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
