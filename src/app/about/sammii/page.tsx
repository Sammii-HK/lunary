import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { renderJsonLd } from '@/lib/schema';
import { MarketingFooter } from '@/components/MarketingFooter';
import { Heading } from '@/components/ui/Heading';

export const metadata: Metadata = {
  title: 'Sammii - Founder of Lunary | About the Creator',
  description:
    'Meet Sammii, the founder and solo developer behind Lunary. Designer, engineer, and creator of a chart-first astrology platform built for depth, learning, and self-discovery.',
  openGraph: {
    title: 'Sammii - Founder of Lunary',
    description:
      'Designer, engineer, and creator of the Lunary astrology and symbolic intelligence platform.',
    url: 'https://lunary.app/about/sammii',
    type: 'profile',
  },
  alternates: { canonical: 'https://lunary.app/about/sammii' },
};

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/lunary.app',
    handle: '@lunary.app',
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@lunary.app',
    handle: '@lunary.app',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/2WCJncKrKj',
    handle: 'Community',
  },
];

export default function AuthorPage() {
  const authorSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Sammii',
    url: 'https://lunary.app/about/sammii',
    image: 'https://lunary.app/press-kit/founder-portrait.png',
    jobTitle: 'Founder & Developer',
    worksFor: {
      '@type': 'Organization',
      name: 'Lunary',
      url: 'https://lunary.app',
    },
    description:
      'Founder and solo builder of Lunary, a chart-first astrology and symbolic intelligence platform.',
    sameAs: socialLinks.map((s) => s.url),
  };

  return (
    <>
      <div className='min-h-fit bg-zinc-950 text-zinc-100 flex flex-col'>
        {renderJsonLd(authorSchema)}

        <div className='flex-1 max-w-4xl mx-auto px-4 py-12 pb-16'>
          <nav className='flex items-center gap-2 text-sm text-zinc-400 mb-8'>
            <Link href='/' className='hover:text-zinc-300'>
              Home
            </Link>
            <span>/</span>
            <Link href='/about' className='hover:text-zinc-300'>
              About
            </Link>
            <span>/</span>
            <span className='text-zinc-400'>Sammii</span>
          </nav>

          <div className='grid md:grid-cols-3 gap-8 mb-14'>
            <div>
              <div className='aspect-square relative rounded-2xl overflow-hidden bg-zinc-800'>
                <Image
                  src='/press-kit/founder-portrait.png'
                  alt='Sammii, founder of Lunary'
                  fill
                  className='object-cover'
                  sizes='(max-width: 768px) 100vw, 33vw'
                />
              </div>
            </div>

            <div className='md:col-span-2'>
              <Heading as='h1' variant='h1' className='mb-2'>
                Sammii
              </Heading>
              <p className='text-lg text-lunary-primary-400 mb-4'>
                Founder & Solo Developer
              </p>

              <p className='text-zinc-300 leading-relaxed mb-4'>
                I built Lunary because I could never find an astrology platform
                that respected depth. Most tools stopped at sun signs, or
                flooded users with disconnected interpretations that never quite
                stitched together.
              </p>

              <p className='text-zinc-300 leading-relaxed'>
                Lunary began as my own learning system. A place to explore full
                birth charts, symbolic patterns, tarot archetypes, and cyclical
                timing without dumbing anything down. Over time, it grew into a
                product for people who want astrology that actually connects.
              </p>
            </div>
          </div>

          <section className='mb-14'>
            <Heading as='h2' variant='h2'>
              Why chart-first matters
            </Heading>

            <p className='text-zinc-300 leading-relaxed mb-4'>
              My own chart is unusual. A Capricorn Sun at the 29th degree. An
              exalted Taurus Moon. A chart ruled by Pluto in the first house.
              Learning astrology through that lens made one thing clear very
              quickly.
            </p>

            <p className='text-zinc-300 leading-relaxed mb-4'>
              Generic interpretations fail the moment someone looks deeper.
              Astrology only works when everything references the full chart.
              Houses. Rulers. Transits. Repeating patterns. Context over
              keywords.
            </p>

            <p className='text-zinc-300 leading-relaxed mb-4'>
              I built Lunary during a period of deep personal rebuilding. I was
              learning astrology not as entertainment, but as a framework for
              understanding timing, identity, and change. What kept me engaged
              was pattern recognition. How the same themes echoed across charts,
              tarot, cycles, and lived experience.
            </p>

            <p className='text-zinc-300 leading-relaxed mb-4'>
              Most platforms felt either shallow or overwhelming. Either
              everything was flattened into sun-sign soundbites, or buried under
              encyclopedic density with no connective tissue. I wanted something
              that respected knowledgeable users while still helping beginners
              learn properly.
            </p>

            <p className='text-zinc-300 leading-relaxed'>
              Lunary became that system. A place where symbolism compounds
              instead of fragments. Where curiosity is rewarded with coherence.
              Where astrology is treated as a living language, not a content
              feed.
            </p>
          </section>

          <section className='mb-14'>
            <Heading as='h2' variant='h2'>
              What I build
            </Heading>
            <div className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30'>
              <ul className='space-y-3 text-zinc-300'>
                <li>• Full birth chart interpretation engines</li>
                <li>• Personalised tarot seeded by user context</li>
                <li>
                  • Journaling systems that surface archetypes and patterns
                </li>
                <li>• A symbolic knowledge base designed for learning</li>
                <li>• Infrastructure that prioritises privacy and intention</li>
              </ul>
            </div>
          </section>

          <section className='mb-14'>
            <Heading as='h2' variant='h2'>
              Connect
            </Heading>
            <div className='flex flex-wrap gap-4'>
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 transition-colors'
                >
                  <span className='text-zinc-300'>{link.name}</span>
                  <span className='text-zinc-500 text-sm'>{link.handle}</span>
                  <ExternalLink className='w-4 h-4 text-zinc-500' />
                </a>
              ))}
            </div>
          </section>

          <section className='p-6 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-lunary-primary-900/20 to-lunary-rose-900/20'>
            <Heading as='h3' variant='h3'>
              Press & media
            </Heading>
            <p className='text-zinc-300 mb-4'>
              For interviews, speaking, or editorial features.
            </p>
            <a
              href='mailto:press@lunary.app'
              className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
            >
              press@lunary.app
            </a>
          </section>
        </div>

        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      </div>
    </>
  );
}
