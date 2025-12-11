import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PressKitAssets } from '@/components/press-kit/PressKitAssets';

export const metadata: Metadata = {
  title: 'Lunary Press Kit - The AI-powered Spiritual Intelligence Platform',
  description:
    'Official Lunary press kit with brand assets, product information, founder details, and resources for media, investors, and partners.',
  openGraph: {
    title: 'Lunary Press Kit - The AI-powered Spiritual Intelligence Platform',
    description:
      "Brand assets, product overview, founder bio, and press resources for Lunary - building the world's first Symbolic Intelligence OS.",
    url: 'https://lunary.app/press-kit',
    images: [
      {
        url: '/api/og/cosmic',
        width: 1200,
        height: 630,
        alt: 'Lunary Press Kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary Press Kit - The AI-powered Spiritual Intelligence Platform',
    description:
      'Download logos, product screenshots, brand assets, and press materials.',
    images: ['/api/og/cosmic'],
  },
};

const brandColors = [
  { name: 'Event Horizon', hex: '#0A0A0A' },
  { name: 'Singularity', hex: '#050505' },
  { name: 'Nebula Violet', hex: '#8458D8' },
  { name: 'Comet Trail', hex: '#7B7BE8' },
  { name: 'Galaxy Haze', hex: '#C77DFF' },
  { name: 'Cosmic Rose', hex: '#EE789E' },
  { name: 'Supernova', hex: '#D070E8' },
  { name: 'Stardust', hex: '#FFFFFF' },
  { name: 'Solar Flare', hex: '#D06060' },
  { name: 'Aurora Green', hex: '#6B9B7A' },
];

const coreFeatures = [
  'AI Astral Companion (ChatGPT-powered)',
  'Daily personalised horoscopes',
  'Weekly cosmic forecast',
  'Tarot analysis + card meanings',
  'Crystal Index + AI crystal identification',
  'Ritual Generator (intent-based)',
  'Book of Shadows (journaling engine)',
  'Emotional reflection insights',
  'Cosmic event detection (retrogrades, aspects, lunations)',
  'Shareable cosmic visuals',
  'SEO Grimoire (deep knowledge library)',
];

const screenshots = [
  {
    src: '/press-kit/screenshot-dashboard.png',
    title: 'Home Dashboard',
    description: 'Daily astro + tarot widgets',
  },
  {
    src: '/press-kit/screenshot-report.png',
    title: 'Daily Horoscope',
    description: 'Personalised cosmic insights',
  },
  {
    src: '/press-kit/screenshot-mobile.png',
    title: 'Tarot Reader',
    description: 'Interactive card readings',
  },
];

const differentiators = [
  {
    title: 'Depth',
    description:
      'Lunary offers the most comprehensive symbolic library in the category: Astrology, tarot, moon phases, numerology, crystals, rituals, journaling, seasonal events, emotional mapping.',
  },
  {
    title: 'AI Personalisation',
    description:
      "Your birth chart, emotions, tarot patterns, and cycles all inform the AI's responses.",
  },
  {
    title: 'Shareability Engine',
    description: 'Dynamic OG images and cosmic visuals drive organic virality.',
  },
  {
    title: 'SEO Grimoire',
    description:
      'Hundreds of deeply researched articles for tarot card meanings, zodiac signs, moon phases, cosmic events, crystals, rituals, emotional symbolism.',
  },
  {
    title: 'Crystal Index',
    description:
      'A standalone product & acquisition channel: AI-based crystal identification, complete crystal database, spiritual meaning, healing uses, metaphysical properties, image recognition + descriptive search.',
  },
];

const pressQuotes = [
  {
    quote:
      'A beautifully crafted AI-powered spiritual app reinventing modern astrology.',
    attribution: 'Tech publication',
  },
  {
    quote: 'One of the most comprehensive symbolic platforms available today.',
    attribution: 'Spiritual wellness blog',
  },
  {
    quote: 'Feels like Co–Star meets Tarot meets ChatGPT.',
    attribution: 'Beta user',
  },
];

export default function PressKitPage() {
  return (
    <div className='w-full max-w-5xl mx-auto space-y-10 px-4 py-10 text-white'>
      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/50 p-8'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200'>
          Press Kit
        </p>
        <h1 className='text-4xl font-semibold'>Lunary Press Kit</h1>
        <p className='text-lg font-semibold text-lunary-primary-200'>
          The AI-powered Spiritual Intelligence Platform
        </p>
        <p className='text-lg text-zinc-200'>
          Welcome to the official Lunary press kit. Below you'll find approved
          assets, brand guidelines, product information, founder details, and
          resources for media, investors, and partners.
        </p>
        <p className='text-lg text-zinc-200'>
          Lunary is building the world's first{' '}
          <strong>Symbolic Intelligence OS</strong> — combining astrology,
          tarot, crystal identification, rituals, and emotional insight with AI
          to help users understand themselves more deeply through ancient
          systems and modern technology.
        </p>
      </section>

      <section className='space-y-6 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Brand Assets
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Brand Assets</h2>
        </div>

        <div className='space-y-6'>
          <div>
            <h3 className='text-xl font-semibold mb-3'>Logos</h3>
            <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
              <li>Primary Lunary Logo (Light)</li>
              <li>Primary Lunary Logo (Dark)</li>
              <li>Wordmark</li>
              <li>Icon (Moon Symbol)</li>
              <li>App Icon (Square)</li>
            </ul>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-3'>Brand Colours</h3>
            <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3'>
              {brandColors.map((color) => (
                <div
                  key={color.name}
                  className='rounded-2xl border border-white/10 bg-white/5 p-4'
                >
                  <div
                    className='mb-3 h-20 w-full rounded-xl border border-white/10'
                    style={{ backgroundColor: color.hex }}
                  />
                  <p className='text-sm font-semibold text-white'>
                    {color.name}
                  </p>
                  <p className='text-xs text-zinc-400 font-mono'>{color.hex}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className='text-xl font-semibold mb-3'>Typography</h3>
            <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
              <li>
                Display: <strong>Astronomicon</strong>
              </li>
              <li>
                Body: <strong>Inter / Roboto Mono</strong>
              </li>
            </ul>
          </div>

          <div>
            <Link
              href='/press-kit/lunary-press-kit.zip'
              className='inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-lunary-primary-400'
            >
              Download full brand pack: /assets/brand-kit.zip
            </Link>
          </div>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Product Overview
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Product Overview</h2>
        </div>
        <p className='text-lg text-zinc-200'>
          Lunary is a modern spiritual intelligence platform powered by AI. It
          merges symbolic systems—astrology, tarot, numerology, rituals, moon
          cycles, crystals—with machine learning, enabling personalised insight,
          cosmic guidance, and emotional reflection.
        </p>
        <div>
          <h3 className='text-xl font-semibold mb-3'>Core features:</h3>
          <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
            {coreFeatures.map((feature) => (
              <li key={feature}>
                <strong>{feature}</strong>
              </li>
            ))}
          </ul>
        </div>
        <p className='text-lg text-zinc-200'>
          Lunary unifies everything into a single experience.
        </p>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Product Screenshots
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Product Screenshots</h2>
        </div>
        <div>
          <h3 className='text-xl font-semibold mb-3'>User Experience</h3>
          <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300 mb-4'>
            <li>Home Dashboard</li>
            <li>Daily Horoscope</li>
            <li>Tarot Reader</li>
            <li>Crystal Identifier</li>
            <li>Ritual Generator</li>
            <li>Emotional Reflection UI</li>
            <li>Birth Chart View</li>
            <li>AI Astral Companion</li>
            <li>Book of Shadows</li>
            <li>Cosmic Event Pages</li>
          </ul>
        </div>
        <div className='grid gap-4 md:grid-cols-3'>
          {screenshots.map((shot) => (
            <div
              key={shot.title}
              className='rounded-2xl border border-white/10 bg-white/5 p-3'
            >
              <div className='relative mb-3 h-48 w-full overflow-hidden rounded-xl bg-black/40'>
                <Image
                  src={shot.src}
                  alt={shot.title}
                  fill
                  sizes='300px'
                  className='object-contain p-4'
                />
              </div>
              <p className='text-sm font-semibold text-white'>{shot.title}</p>
              <p className='text-xs text-zinc-400'>{shot.description}</p>
            </div>
          ))}
        </div>
        <div>
          <Link
            href='/press-kit/lunary-press-kit.zip'
            className='inline-flex text-sm text-lunary-primary-200 underline'
          >
            Download full screenshot pack: /assets/product-screens.zip
          </Link>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Press Boilerplate
          </p>
          <h2 className='text-2xl font-semibold mb-4'>About Lunary</h2>
        </div>
        <blockquote className='border-l-4 border-lunary-primary-400 pl-4 text-lg text-zinc-200 italic'>
          Lunary is the AI-powered spiritual intelligence platform that blends
          astronomy-grade accuracy with personalised astrology, tarot, and
          ritual guidance. Available on web and app.
        </blockquote>
        <p className='text-sm text-zinc-400'>
          Use the above paragraph for press coverage and media mentions.
        </p>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Featured In
          </p>
          <h2 className='text-2xl font-semibold mb-4'>As Seen On</h2>
        </div>
        <div className='flex flex-wrap gap-8 items-center justify-center opacity-50'>
          <div className='text-center'>
            <p className='text-zinc-400 text-sm'>Media Partner</p>
          </div>
          <div className='text-center'>
            <p className='text-zinc-400 text-sm'>Featured Publication</p>
          </div>
          <div className='text-center'>
            <p className='text-zinc-400 text-sm'>Press Coverage</p>
          </div>
        </div>
        <p className='text-xs text-zinc-500 text-center'>
          Placeholder - logos will be added as press coverage grows.
        </p>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Positioning
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Positioning Statement</h2>
        </div>
        <p className='text-lg text-zinc-200'>
          <strong>
            Lunary is the first app to bring ancient symbolic systems and modern
            AI together, creating a deeply personal spiritual intelligence
            platform for the next generation.
          </strong>
        </p>
        <p className='text-lg text-zinc-200'>
          It is the spiritual wellness app for:
        </p>
        <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
          <li>meaning-seekers</li>
          <li>intuitives</li>
          <li>astrology lovers</li>
          <li>tarot readers</li>
          <li>energy practitioners</li>
          <li>emotional explorers</li>
          <li>Gen Z and millennial spiritual communities</li>
        </ul>
        <p className='text-lg text-zinc-200'>
          We believe spirituality deserves the same level of design,
          intelligence, and technical excellence as productivity or finance.
        </p>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Differentiators
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Differentiators</h2>
        </div>
        <div className='space-y-6'>
          {differentiators.map((item, index) => (
            <div key={index} className='space-y-2'>
              <h3 className='text-xl font-semibold'>
                {index + 1}. {item.title}
              </h3>
              <p className='text-sm text-zinc-300'>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Traction
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Traction Highlights</h2>
        </div>
        <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
          <li>Thousands of active users</li>
          <li>Multi-tier subscription model</li>
          <li>Daily automated cosmic posts</li>
          <li>Crystal Index integration</li>
          <li>SEO foundations established</li>
          <li>Viral content engine</li>
          <li>App fully shipped end-to-end by a solo technical founder</li>
          <li>PWA experience + OG generation engine</li>
          <li>Admin tools, analytics, and internal CMS live</li>
        </ul>
        <p className='text-sm text-zinc-300 mt-4'>
          More features shipped at pre-seed than most competitors.
        </p>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Press Quotes
          </p>
          <h2 className='text-2xl font-semibold mb-4'>
            Press Quotes (Template — replace as they come in)
          </h2>
        </div>
        <div className='space-y-6'>
          {pressQuotes.map((quote, index) => (
            <blockquote
              key={index}
              className='border-l-4 border-lunary-primary-400 pl-4 italic text-zinc-300'
            >
              <p className='text-lg'>&ldquo;{quote.quote}&rdquo;</p>
              <p className='text-sm text-zinc-400 mt-2'>
                — <em>{quote.attribution}</em>
              </p>
            </blockquote>
          ))}
        </div>
      </section>

      <section className='grid gap-6 rounded-3xl border border-white/10 bg-black/40 p-6 md:grid-cols-2'>
        <div>
          <div>
            <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
              Founder
            </p>
            <h2 className='text-2xl font-semibold mb-4'>Founder</h2>
          </div>
          <p className='text-lg font-semibold text-white mb-2'>Sammii H-K</p>
          <p className='text-sm text-zinc-300 mb-4'>
            Designer, engineer, and solo founder of Lunary. Creator of the
            Lunary AI architecture, design system, brand, and complete product.
          </p>
          <div className='mb-4'>
            <p className='text-sm font-semibold text-zinc-200 mb-2'>Former:</p>
            <ul className='list-disc space-y-1 pl-5 text-sm text-zinc-300'>
              <li>Senior engineer & designer</li>
              <li>Built high-performance SaaS platforms</li>
              <li>Background in creative technology and symbolic systems</li>
            </ul>
          </div>
          <div className='mb-4'>
            <p className='text-sm font-semibold text-zinc-200 mb-2'>
              Sammii writes and speaks on:
            </p>
            <ul className='list-disc space-y-1 pl-5 text-sm text-zinc-300'>
              <li>AI × spirituality</li>
              <li>digital ritual design</li>
              <li>symbolic meaning systems</li>
              <li>emotional self-reflection</li>
              <li>ethical AI for introspection</li>
            </ul>
          </div>
          <Link
            href='/press-kit/founder-bio.pdf'
            className='inline-flex rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-lunary-primary-400'
          >
            Headshot pack: /assets/founder-photos.zip
          </Link>
        </div>
        <div className='space-y-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
              Contact
            </p>
            <h2 className='text-2xl font-semibold mb-4'>Contact</h2>
          </div>
          <div className='space-y-3 text-sm text-zinc-300'>
            <p>
              Press enquiries:{' '}
              <a
                href='mailto:press@lunary.app'
                className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
              >
                press@lunary.app
              </a>
            </p>
            <p>
              Founder:{' '}
              <a
                href='mailto:sammi@lunary.app'
                className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
              >
                sammi@lunary.app
              </a>
            </p>
            <p>
              Website:{' '}
              <a
                href='https://www.lunary.app'
                className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
                target='_blank'
                rel='noopener noreferrer'
              >
                https://www.lunary.app
              </a>
            </p>
            <div className='mt-4'>
              <p className='font-semibold text-zinc-200 mb-2'>Social:</p>
              <div className='flex flex-wrap gap-3'>
                <a
                  href='https://instagram.com/lunary.app'
                  className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Instagram
                </a>
                <a
                  href='https://tiktok.com/@lunary.app'
                  className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  TikTok
                </a>
                <a
                  href='https://discord.gg/2WCJncKrKj'
                  className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Discord
                </a>
              </div>
            </div>
            <p className='mt-4'>
              For investor materials, visit:{' '}
              <a
                href='https://www.lunary.app/fundraise'
                className='text-lunary-primary-200 underline hover:text-lunary-primary-100'
                target='_blank'
                rel='noopener noreferrer'
              >
                https://www.lunary.app/fundraise
              </a>
            </p>
          </div>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Fact Sheet
          </p>
          <h2 className='text-2xl font-semibold mb-4'>
            Fact Sheet (Copy/Paste for Journalists)
          </h2>
        </div>
        <div className='space-y-2 text-sm text-zinc-300'>
          <p>
            <strong>Company:</strong> Lunary
          </p>
          <p>
            <strong>Founder:</strong> Sammii H-K
          </p>
          <p>
            <strong>Industry:</strong> Spiritual Wellness / AI
          </p>
          <p>
            <strong>Founded:</strong> 2024
          </p>
          <p>
            <strong>Platform:</strong> Web, PWA, mobile apps (coming)
          </p>
          <p>
            <strong>Users:</strong> Growing rapidly
          </p>
          <p>
            <strong>Location:</strong> UK
          </p>
          <p>
            <strong>Mission:</strong> To build the world's first symbolic
            intelligence OS
          </p>
          <p>
            <strong>Core Features:</strong> AI companion, astrology engine,
            tarot, rituals, crystal ID, journaling
          </p>
          <p>
            <strong>Business Model:</strong> Subscriptions + premium AI features
          </p>
          <p>
            <strong>Stage:</strong> Pre-seed
          </p>
          <p>
            <strong>Funding:</strong> Currently raising £2M
          </p>
          <p>
            <strong>USP:</strong> unified symbolic intelligence + AI
            personalisation
          </p>
        </div>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Additional Assets
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Additional Assets</h2>
        </div>
        <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
          <li>Brand guidelines PDF</li>
          <li>Press release templates</li>
          <li>Product demo video</li>
          <li>Animated screen recordings</li>
          <li>App icons</li>
          <li>Social banner pack</li>
          <li>Pitch deck (investor only)</li>
        </ul>
      </section>

      <section className='space-y-4 rounded-3xl border border-white/10 bg-black/40 p-6'>
        <div>
          <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-200 mb-2'>
            Media Pack Downloads
          </p>
          <h2 className='text-2xl font-semibold mb-4'>Media Pack Downloads</h2>
        </div>
        <ul className='list-disc space-y-2 pl-5 text-sm text-zinc-300'>
          <li>Press images</li>
          <li>Feature screenshots</li>
          <li>Brand kit</li>
          <li>Video demo</li>
          <li>Logos</li>
          <li>Product visuals</li>
          <li>AI companion example chats</li>
        </ul>
      </section>

      <section className='rounded-3xl border border-lunary-primary-400/20 bg-lunary-primary-900/10 p-6'>
        <p className='text-sm text-lunary-primary-100'>
          <em>
            For anything not listed here, please reach out. We respond quickly
            to press & investors.
          </em>
        </p>
      </section>

      <PressKitAssets />
    </div>
  );
}
