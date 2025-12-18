import { Metadata } from 'next';
import Link from 'next/link';
import { Calendar, AlertTriangle, Check } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Mercury Retrograde 2025: Complete Dates, Meaning & Survival Guide',
  description:
    'Mercury Retrograde 2025 dates, meaning, and survival tips. Learn when Mercury goes retrograde, what to expect, and rituals to navigate this cosmic period. All 2025 retrograde dates included.',
  openGraph: {
    title: 'Mercury Retrograde 2025: Complete Dates & Survival Guide',
    description:
      'Mercury Retrograde 2025 dates and survival guide. Learn what to expect and how to navigate this cosmic period.',
    url: 'https://lunary.app/grimoire/events/2025/mercury-retrograde',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events/2025/mercury-retrograde',
  },
};

const mercuryRetrogradeDates2025 = [
  {
    period: 'March 14 - April 7, 2025',
    signs: 'Aries → Pisces',
    theme: 'Reassess your identity and creative projects',
  },
  {
    period: 'July 18 - August 11, 2025',
    signs: 'Leo → Cancer',
    theme: 'Review relationships and emotional patterns',
  },
  {
    period: 'November 9 - November 29, 2025',
    signs: 'Sagittarius → Scorpio',
    theme: 'Reflect on beliefs and transformations',
  },
];

export default function MercuryRetrograde2025Page() {
  return (
    <div className='min-h-screen bg-zinc-950'>
      <SEOContentTemplate
        title='Mercury Retrograde 2025: Complete Dates & Survival Guide'
        h1='Mercury Retrograde 2025'
        description='Mercury Retrograde 2025 dates, meaning, and survival tips. Learn when Mercury goes retrograde, what to expect, and rituals to navigate this cosmic period.'
        keywords={[
          'mercury retrograde 2025',
          'mercury retrograde dates',
          'mercury retrograde meaning',
          'mercury retrograde survival guide',
          'when is mercury retrograde',
          'mercury retrograde effects',
        ]}
        canonicalUrl='https://lunary.app/grimoire/events/2025/mercury-retrograde'
        datePublished='2024-12-01'
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection='Astrology Events'
        intro='Mercury Retrograde is the most well-known astrological event, occurring 3-4 times per year when Mercury appears to move backward in its orbit. In 2025, Mercury will retrograde three times, affecting communication, technology, and travel. This guide covers all the dates, meanings, and practical tips to navigate these periods.'
        meaning={`**What is Mercury Retrograde?**

Mercury Retrograde is an optical illusion where the planet Mercury appears to move backward through the zodiac from Earth's perspective. While it's not actually reversing course, this apparent backward motion coincides with periods where Mercury's themes—communication, technology, travel, and commerce—tend to experience disruptions.

**2025 Mercury Retrograde Dates**

Mercury will retrograde three times in 2025:

1. **March 14 - April 7, 2025** (Aries → Pisces)
2. **July 18 - August 11, 2025** (Leo → Cancer)
3. **November 9 - November 29, 2025** (Sagittarius → Scorpio)

**Common Effects During Mercury Retrograde**

- Communication misunderstandings and delays
- Technology glitches and malfunctions
- Travel disruptions and cancellations
- Contracts and agreements may need revision
- Past issues and people may resurface
- Important documents may go missing

**What Mercury Retrograde Is Good For**

Despite its reputation, Mercury Retrograde offers valuable opportunities:

- **Re-evaluate** plans and decisions
- **Reconnect** with old friends and contacts
- **Review** and revise projects
- **Reflect** on past experiences
- **Research** and gather information
- **Rest** and slow down

**The Shadow Periods**

Mercury's effects actually extend beyond the retrograde itself:

- **Pre-Shadow:** 1-2 weeks before retrograde begins—effects start building
- **Retrograde:** The main period of backward motion
- **Post-Shadow:** 1-2 weeks after retrograde ends—lingering effects`}
        ctaText='Get Your Personalized Mercury Retrograde Report'
        ctaHref='/welcome?from=mercury-retrograde-2025'
      >
        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            2025 Mercury Retrograde Calendar
          </h2>
          <div className='grid gap-4'>
            {mercuryRetrogradeDates2025.map((period, index) => (
              <div
                key={index}
                className='p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-start gap-4'>
                  <div className='p-2 rounded-lg bg-lunary-rose-900'>
                    <Calendar className='h-6 w-6 text-lunary-rose' />
                  </div>
                  <div>
                    <h3 className='text-lg font-medium text-zinc-100'>
                      {period.period}
                    </h3>
                    <p className='text-sm text-lunary-rose-300 mb-2'>
                      {period.signs}
                    </p>
                    <p className='text-zinc-400'>{period.theme}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Mercury Retrograde Survival Tips
          </h2>
          <div className='grid md:grid-cols-2 gap-4'>
            <div className='p-6 rounded-lg border border-lunary-success-700 bg-lunary-success-950'>
              <h3 className='text-lg font-medium text-lunary-success mb-4 flex items-center gap-2'>
                <Check className='h-5 w-5' />
                Do During Retrograde
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• Back up all important files</li>
                <li>• Double-check travel plans</li>
                <li>• Re-read emails before sending</li>
                <li>• Allow extra time for everything</li>
                <li>• Reconnect with old friends</li>
                <li>• Review and revise projects</li>
                <li>• Practice patience and flexibility</li>
              </ul>
            </div>
            <div className='p-6 rounded-lg border border-lunary-error-700 bg-lunary-error-950'>
              <h3 className='text-lg font-medium text-lunary-error mb-4 flex items-center gap-2'>
                <AlertTriangle className='h-5 w-5' />
                Avoid If Possible
              </h3>
              <ul className='space-y-2 text-zinc-300 text-sm'>
                <li>• Signing important contracts</li>
                <li>• Making major purchases (especially electronics)</li>
                <li>• Starting new projects</li>
                <li>• Launching businesses or products</li>
                <li>• Making big decisions</li>
                <li>• Having crucial conversations via text</li>
              </ul>
            </div>
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Mercury Retrograde Rituals
          </h2>
          <div className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
            <p className='text-zinc-300 mb-4'>
              Use these rituals to work with Mercury Retrograde energy:
            </p>
            <ul className='space-y-3 text-zinc-300'>
              <li>
                <strong className='text-lunary-primary-300'>
                  Journal Ritual:
                </strong>{' '}
                Write about unfinished business, past patterns, and what needs
                revision in your life.
              </li>
              <li>
                <strong className='text-lunary-primary-300'>
                  Tech Cleanse:
                </strong>{' '}
                Use this time to organize files, clean your inbox, and update
                software.
              </li>
              <li>
                <strong className='text-lunary-primary-300'>
                  Mercury Protection Candle:
                </strong>{' '}
                Light an orange or yellow candle and ask for clear communication
                and protection from mishaps.
              </li>
              <li>
                <strong className='text-lunary-primary-300'>
                  Reconnection Practice:
                </strong>{' '}
                Reach out to someone you've lost touch with—retrograde favors
                revisiting connections.
              </li>
            </ul>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='text-2xl font-medium text-zinc-100'>Related Topics</h2>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/astronomy/planets/mercury'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Mercury in Astrology
            </Link>
            <Link
              href='/grimoire/moon/rituals'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Moon Rituals
            </Link>
            <Link
              href='/grimoire/zodiac/gemini'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Gemini (Ruled by Mercury)
            </Link>
            <Link
              href='/grimoire/zodiac/virgo'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Virgo (Ruled by Mercury)
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
