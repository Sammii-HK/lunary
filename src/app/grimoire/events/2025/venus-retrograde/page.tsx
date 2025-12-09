import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Heart, Sparkles } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Venus Retrograde 2025: Dates, Love & Relationship Guide',
  description:
    'Venus Retrograde 2025 dates, meaning, and relationship guidance. Learn how Venus retrograde affects love, finances, and self-worth. March 1 - April 12, 2025.',
  openGraph: {
    title: 'Venus Retrograde 2025: Dates, Love & Relationship Guide',
    description:
      'Venus Retrograde 2025 guide. Learn how it affects love, relationships, and finances.',
    url: 'https://lunary.app/grimoire/events/2025/venus-retrograde',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events/2025/venus-retrograde',
  },
};

export default function VenusRetrograde2025Page() {
  return (
    <div className='min-h-screen bg-zinc-950'>
      <SEOContentTemplate
        title='Venus Retrograde 2025: Dates, Love & Relationship Guide'
        h1='Venus Retrograde 2025'
        description='Venus Retrograde 2025 dates, meaning, and relationship guidance. Learn how Venus retrograde affects love, finances, and self-worth.'
        keywords={[
          'venus retrograde 2025',
          'venus retrograde dates',
          'venus retrograde love',
          'venus retrograde relationships',
          'venus retrograde meaning',
          'venus retrograde effects',
        ]}
        canonicalUrl='https://lunary.app/grimoire/events/2025/venus-retrograde'
        datePublished='2024-12-01'
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection='Astrology Events'
        intro='Venus Retrograde is a powerful time for reassessing relationships, values, and self-worth. In 2025, Venus will retrograde from March 1 to April 12, moving through Aries and Pisces. This guide covers everything you need to know about navigating love and finances during this cosmic period.'
        meaning={`**What is Venus Retrograde?**

Venus Retrograde occurs approximately every 18 months when Venus appears to move backward through the zodiac. Unlike Mercury Retrograde, Venus Retrograde specifically affects matters of the heart—relationships, love, beauty, and finances.

**2025 Venus Retrograde Date**

**March 1 - April 12, 2025** (Aries → Pisces)

Venus stations retrograde at 10° Aries, then moves back into Pisces before stationing direct at 24° Pisces. This means the retrograde will affect both Aries and Pisces themes.

**Venus Retrograde Themes**

- **Relationships:** Past lovers may reappear; current relationships are tested
- **Self-Worth:** Reassessing what you value about yourself
- **Finances:** Reviewing spending habits and financial values
- **Beauty:** Not ideal for major cosmetic changes
- **Art & Creativity:** Great for revisiting old creative projects

**What to Expect**

During Venus Retrograde, you might experience:

- Ex-partners reaching out
- Questioning current relationships
- Nostalgia for past connections
- Delays in love and money matters
- Inner reflection on what you truly value
- Desire to change your appearance (resist major changes!)

**The Deeper Work**

Venus Retrograde asks us to:

- **Heal** old relationship wounds
- **Reconsider** what we value in partnerships
- **Reconnect** with self-love practices
- **Reassess** our relationship with money
- **Release** patterns that no longer serve our hearts`}
        ctaText='Get Your Personalized Venus Retrograde Report'
        ctaHref='/welcome?from=venus-retrograde-2025'
      >
        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Venus Retrograde 2025 Timeline
          </h2>
          <div className='p-6 rounded-lg border border-lunary-rose-700 bg-lunary-rose-950'>
            <div className='flex items-start gap-4'>
              <div className='p-2 rounded-lg bg-lunary-rose-900'>
                <Heart className='h-6 w-6 text-lunary-rose' />
              </div>
              <div className='space-y-4'>
                <div>
                  <h3 className='text-lg font-medium text-zinc-100'>
                    March 1 - April 12, 2025
                  </h3>
                  <p className='text-lunary-rose-300'>Aries → Pisces</p>
                </div>
                <div className='space-y-2 text-zinc-300 text-sm'>
                  <p>
                    <strong>Pre-Shadow:</strong> February 7, 2025
                  </p>
                  <p>
                    <strong>Retrograde Begins:</strong> March 1, 2025 at 10°
                    Aries
                  </p>
                  <p>
                    <strong>Enters Pisces:</strong> March 27, 2025
                  </p>
                  <p>
                    <strong>Retrograde Ends:</strong> April 12, 2025 at 24°
                    Pisces
                  </p>
                  <p>
                    <strong>Post-Shadow Ends:</strong> May 7, 2025
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Venus Retrograde Guidance
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='p-6 rounded-lg border border-lunary-success-700 bg-lunary-success-950'>
              <h3 className='text-lg font-medium text-lunary-success mb-4'>
                Embrace During Venus Rx
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• Reconnect with old friends</li>
                <li>• Practice self-love rituals</li>
                <li>• Journal about relationship patterns</li>
                <li>• Revisit old creative projects</li>
                <li>• Appreciate simple pleasures</li>
                <li>• Heal past heartaches</li>
              </ul>
            </div>
            <div className='p-6 rounded-lg border border-lunary-error-700 bg-lunary-error-950'>
              <h3 className='text-lg font-medium text-lunary-error mb-4'>
                Avoid If Possible
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• Starting new relationships</li>
                <li>• Getting engaged or married</li>
                <li>• Major beauty procedures</li>
                <li>• Large purchases (especially luxury items)</li>
                <li>• Launching beauty/fashion projects</li>
                <li>• Making permanent appearance changes</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Venus Retrograde Rituals
          </h2>
          <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
            <div className='flex items-start gap-4'>
              <Sparkles className='h-6 w-6 text-lunary-primary-400 flex-shrink-0' />
              <div className='space-y-4'>
                <div>
                  <h3 className='font-medium text-lunary-primary-300'>
                    Self-Love Bath Ritual
                  </h3>
                  <p className='text-zinc-300 text-sm'>
                    Draw a warm bath with rose petals, pink Himalayan salt, and
                    a few drops of rose or ylang-ylang essential oil. Light pink
                    candles and meditate on what you love about yourself.
                  </p>
                </div>
                <div>
                  <h3 className='font-medium text-lunary-primary-300'>
                    Rose Quartz Heart Healing
                  </h3>
                  <p className='text-zinc-300 text-sm'>
                    Hold rose quartz over your heart chakra. Visualize pink
                    light healing any old wounds. Speak affirmations of
                    self-love and worthiness.
                  </p>
                </div>
                <div>
                  <h3 className='font-medium text-lunary-primary-300'>
                    Venus Altar Creation
                  </h3>
                  <p className='text-zinc-300 text-sm'>
                    Create a small altar with items representing love and
                    beauty: flowers, mirrors, copper objects, and images of
                    self-love. Visit it daily during the retrograde.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='text-2xl font-medium text-zinc-100'>Related Topics</h2>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/astronomy/planets/venus'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Venus in Astrology
            </Link>
            <Link
              href='/grimoire/crystals'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Crystal Guide
            </Link>
            <Link
              href='/grimoire/zodiac/taurus'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Taurus (Ruled by Venus)
            </Link>
            <Link
              href='/grimoire/zodiac/libra'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Libra (Ruled by Venus)
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
