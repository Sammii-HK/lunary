import { Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PressAsset {
  name: string;
  file: string;
  size: string;
  format: string;
  description?: string;
}

interface PressAssetGroup {
  title: string;
  description: string;
  assets: PressAsset[];
}

const assetGroups: PressAssetGroup[] = [
  {
    title: 'Logos',
    description: 'Primary and alternate marks for light/dark backgrounds.',
    assets: [
      {
        name: 'Lunary Logo – Light',
        file: '/press-kit/lunary-logo-light.png',
        size: '3200 × 1200',
        format: 'PNG',
      },
      {
        name: 'Lunary Logo – Dark',
        file: '/press-kit/lunary-logo-dark.png',
        size: '3200 × 1200',
        format: 'PNG',
      },
      {
        name: 'Lunary Symbol',
        file: '/press-kit/lunary-glyph.svg',
        size: 'Vector',
        format: 'SVG',
      },
    ],
  },
  {
    title: 'App Screens',
    description: 'High-res marketing captures of the Lunary experience.',
    assets: [
      {
        name: 'Cosmic Dashboard',
        file: '/press-kit/screenshot-dashboard.png',
        size: '2400 × 1800',
        format: 'PNG',
        description: 'Home experience with widgets',
      },
      {
        name: 'Cosmic Report Generator',
        file: '/press-kit/screenshot-report.png',
        size: '2400 × 1800',
        format: 'PNG',
      },
      {
        name: 'Mobile Moon Ritual',
        file: '/press-kit/screenshot-mobile.png',
        size: '1284 × 2778',
        format: 'PNG',
      },
    ],
  },
  {
    title: 'Founder',
    description: 'Portraits and bio-ready assets.',
    assets: [
      {
        name: 'Founder Portrait',
        file: '/press-kit/founder-portrait.png',
        size: '2400 × 3000',
        format: 'PNG',
      },
      {
        name: 'Press Bio PDF',
        file: '/press-kit/founder-bio.pdf',
        size: '2 pages',
        format: 'PDF',
      },
    ],
  },
];

export function PressKitAssets() {
  return (
    <section className='space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6'>
      <div className='flex flex-col gap-2'>
        <p className='text-xs uppercase tracking-[0.4em] text-purple-200'>
          Downloadables
        </p>
        <h3 className='text-3xl font-semibold text-white'>Press Kit Assets</h3>
        <p className='text-sm text-zinc-300'>
          Logos, screenshots, founder portraits, and ready-to-use bios for coverage.
        </p>
        <Link
          href='/press-kit/lunary-press-kit.zip'
          className='inline-flex w-fit items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-purple-400'
        >
          <Download className='h-4 w-4' />
          Download All Assets (.zip)
        </Link>
      </div>

      <div className='space-y-6'>
        {assetGroups.map((group) => (
          <div key={group.title} className='space-y-3 rounded-2xl border border-white/10 p-4'>
            <div className='flex flex-col gap-1'>
              <h4 className='text-xl font-semibold text-white'>{group.title}</h4>
              <p className='text-sm text-zinc-400'>{group.description}</p>
            </div>
            <div className='grid gap-3 md:grid-cols-2'>
              {group.assets.map((asset) => (
                <div
                  key={asset.file}
                  className='flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3'
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div>
                      <p className='font-semibold text-white'>{asset.name}</p>
                      {asset.description && (
                        <p className='text-xs text-zinc-400'>{asset.description}</p>
                      )}
                    </div>
                    <span className='text-xs uppercase tracking-[0.3em] text-purple-200'>
                      {asset.format}
                    </span>
                  </div>
                  <p className='text-xs text-zinc-400'>{asset.size}</p>
                  <a
                    href={asset.file}
                    download
                    className='inline-flex items-center gap-1 text-sm text-purple-200 hover:text-purple-100'
                  >
                    <Download className='h-4 w-4' />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className='rounded-2xl border border-purple-400/20 bg-purple-500/10 p-4'>
        <p className='text-sm text-purple-100'>
          Need something specific? Email{' '}
          <a
            href='mailto:press@lunary.app'
            className='underline decoration-purple-200 hover:text-white'
          >
            press@lunary.app
          </a>{' '}
          for interview requests, custom assets, or press access.
        </p>
        <Link
          href='/press-kit/press-release-template.md'
          className='mt-2 inline-flex items-center gap-2 text-sm text-white underline decoration-white/40'
        >
          <ExternalLink className='h-4 w-4' />
          Press release template
        </Link>
      </div>
    </section>
  );
}
