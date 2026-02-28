'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Capacitor } from '@capacitor/core';
import {
  SOCIAL_HANDLES,
  SOCIAL_PLATFORM_LABELS,
} from '@/constants/socialHandles';
import { Logo } from './Logo';
import { CookieSettingsButton } from './CookieConsent';
import { marketingFooterSections } from '@/constants/marketing/footerSections';

export function MarketingFooter() {
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  if (isNative) return null;
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
      platform: 'tiktok' as const,
      url: SOCIAL_HANDLES.tiktok
        ? `https://www.tiktok.com/${SOCIAL_HANDLES.tiktok}`
        : 'https://www.tiktok.com/@lunary.app',
      label: SOCIAL_PLATFORM_LABELS.tiktok,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 448 512'>
          <path d='M448 209.9a210.1 210.1 0 0 1-122.8-39.3v178.8A162.6 162.6 0 1 1 185 188.3v89.9a74.6 74.6 0 1 0 52.2 71.2V0h88a121 121 0 0 0 1.9 22.2A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z' />
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
      platform: 'youtube' as const,
      url: SOCIAL_HANDLES.youtube
        ? `https://www.youtube.com/${SOCIAL_HANDLES.youtube}`
        : 'https://www.youtube.com/@LunaryApp',
      label: SOCIAL_PLATFORM_LABELS.youtube,
      icon: (
        <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 576 512'>
          <path d='M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6C14.9 167 14.9 256 14.9 256s0 89 11.4 131.9c6.3 23.7 24.8 42.3 48.3 48.6C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.9 48.3-48.6C561.1 345 561.1 256 561.1 256s0-89-11.4-131.9zM232 337.7V174.3L374.9 256 232 337.7z' />
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
    {
      platform: 'chatgpt' as const,
      url: 'https://chatgpt.com',
      label: 'ChatGPT',
      icon: (
        <svg
          className='w-8 h-8'
          height='721'
          viewBox='0 0 721 721'
          fill='currentColor'
          xmlns='http://www.w3.org/2000/svg'
        >
          <g clipPath='url(#clip0_1637_2934)'>
            <g clipPath='url(#clip1_1637_2934)'>
              <path
                d='M304.246 294.611V249.028C304.246 245.189 305.687 242.309 309.044 240.392L400.692 187.612C413.167 180.415 428.042 177.058 443.394 177.058C500.971 177.058 537.44 221.682 537.44 269.182C537.44 272.54 537.44 276.379 536.959 280.218L441.954 224.558C436.197 221.201 430.437 221.201 424.68 224.558L304.246 294.611ZM518.245 472.145V363.224C518.245 356.505 515.364 351.707 509.608 348.349L389.174 278.296L428.519 255.743C431.877 253.826 434.757 253.826 438.115 255.743L529.762 308.523C556.154 323.879 573.905 356.505 573.905 388.171C573.905 424.636 552.315 458.225 518.245 472.141V472.145ZM275.937 376.182L236.592 353.152C233.235 351.235 231.794 348.354 231.794 344.515V238.956C231.794 187.617 271.139 148.749 324.4 148.749C344.555 148.749 363.264 155.468 379.102 167.463L284.578 222.164C278.822 225.521 275.942 230.319 275.942 237.039V376.186L275.937 376.182ZM360.626 425.122L304.246 393.455V326.283L360.626 294.616L417.002 326.283V393.455L360.626 425.122ZM396.852 570.989C376.698 570.989 357.989 564.27 342.151 552.276L436.674 497.574C442.431 494.217 445.311 489.419 445.311 482.699V343.552L485.138 366.582C488.495 368.499 489.936 371.379 489.936 375.219V480.778C489.936 532.117 450.109 570.985 396.852 570.985V570.989ZM283.134 463.99L191.486 411.211C165.094 395.854 147.343 363.229 147.343 331.562C147.343 294.616 169.415 261.509 203.48 247.593V356.991C203.48 363.71 206.361 368.508 212.117 371.866L332.074 441.437L292.729 463.99C289.372 465.907 286.491 465.907 283.134 463.99ZM277.859 542.68C223.639 542.68 183.813 501.895 183.813 451.514C183.813 447.675 184.294 443.836 184.771 439.997L279.295 494.698C285.051 498.056 290.812 498.056 296.568 494.698L417.002 425.127V470.71C417.002 474.549 415.562 477.429 412.204 479.346L320.557 532.126C308.081 539.323 293.206 542.68 277.854 542.68H277.859ZM396.852 599.776C454.911 599.776 503.37 558.513 514.41 503.812C568.149 489.896 602.696 439.515 602.696 388.176C602.696 354.587 588.303 321.962 562.392 298.45C564.791 288.373 566.231 278.296 566.231 268.224C566.231 199.611 510.571 148.267 446.274 148.267C433.322 148.267 420.846 150.184 408.37 154.505C386.775 133.392 357.026 119.958 324.4 119.958C266.342 119.958 217.883 161.22 206.843 215.921C153.104 229.837 118.557 280.218 118.557 331.557C118.557 365.146 132.95 397.771 158.861 421.283C156.462 431.36 155.022 441.437 155.022 451.51C155.022 520.123 210.682 571.466 274.978 571.466C287.931 571.466 300.407 569.549 312.883 565.228C334.473 586.341 364.222 599.776 396.852 599.776Z'
                fill='currentColor'
              />
            </g>
          </g>
          <defs>
            <clipPath id='clip0_1637_2934'>
              <rect
                width='720'
                height='720'
                fill='white'
                transform='translate(0.606934 0.0999756)'
              />
            </clipPath>
            <clipPath id='clip1_1637_2934'>
              <rect
                width='484.139'
                height='479.818'
                fill='white'
                transform='translate(118.557 119.958)'
              />
            </clipPath>
          </defs>
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
            className='flex items-center gap-2 text-xl font-medium font-mono text-zinc-100 tracking-tight hover:text-lunary-primary transition-colors'
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
                className='inline-flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-lunary-primary transition-colors'
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
          {marketingFooterSections.map((section) => (
            <nav key={section.key} className='space-y-2'>
              <Link
                href={section.href}
                className='text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 inline-flex hover:text-zinc-200 transition-colors'
              >
                {section.label}
              </Link>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='block text-sm text-zinc-400 hover:text-zinc-200 transition-colors'
                >
                  {item.title}
                </Link>
              ))}
              {section.includeCookieSettings && <CookieSettingsButton />}
            </nav>
          ))}
        </div>

        {/* Copyright */}
        <div className='pt-6 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-400 text-center'>
            © {new Date().getFullYear()} Lunar Computing, Inc. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
