import { Metadata } from 'next';
import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export const metadata: Metadata = {
  title: 'Solar & Lunar Eclipses 2025: All Dates & Astrology Meanings',
  description:
    '2025 eclipse dates and meanings. Solar eclipses March 29 and September 21, Lunar eclipses March 14 and September 7. Learn what each eclipse means for your sign.',
  openGraph: {
    title: 'Solar & Lunar Eclipses 2025: All Dates & Astrology Meanings',
    description:
      '2025 eclipse guide with all dates, meanings, and rituals for solar and lunar eclipses.',
    url: 'https://lunary.app/grimoire/events/2025/eclipses',
    siteName: 'Lunary',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/events/2025/eclipses',
  },
};

const eclipses2025 = [
  {
    date: 'March 14, 2025',
    type: 'Total Lunar Eclipse',
    sign: 'Virgo',
    icon: Moon,
    theme: 'Release perfectionism and embrace wholeness',
    description:
      'This lunar eclipse in Virgo asks us to release patterns of over-analysis and criticism. Let go of the need for everything to be perfect.',
    rituals: [
      'Write down habits or thought patterns you want to release',
      'Create a list of what you appreciate about yourself (flaws included)',
      'Cleanse your space and declutter',
    ],
  },
  {
    date: 'March 29, 2025',
    type: 'Partial Solar Eclipse',
    sign: 'Aries',
    icon: Sun,
    theme: 'Bold new beginnings in identity and leadership',
    description:
      'This solar eclipse in Aries initiates a new chapter in how you assert yourself and lead. New beginnings around independence and courage.',
    rituals: [
      'Set bold intentions for the next 6 months',
      'Start a new project that showcases your leadership',
      'Create a vision board for your ideal self',
    ],
  },
  {
    date: 'September 7, 2025',
    type: 'Total Lunar Eclipse',
    sign: 'Pisces',
    icon: Moon,
    theme: 'Surrender illusions and embrace spiritual truth',
    description:
      'This lunar eclipse in Pisces brings culmination to spiritual matters. Release escapism and embrace healthy spirituality.',
    rituals: [
      'Meditate and journal about any illusions you need to release',
      'Practice water-based cleansing rituals',
      'Connect with your intuition through tarot or dreams',
    ],
  },
  {
    date: 'September 21, 2025',
    type: 'Partial Solar Eclipse',
    sign: 'Virgo',
    icon: Sun,
    theme: 'New chapter in health, work, and daily routines',
    description:
      'This solar eclipse in Virgo initiates new beginnings around health, work habits, and how you serve others.',
    rituals: [
      'Start a new health or wellness routine',
      'Set intentions for improving your daily habits',
      'Begin a project that helps others',
    ],
  },
];

export default function Eclipses2025Page() {
  return (
    <div className='min-h-screen bg-zinc-950'>
      <SEOContentTemplate
        title='Solar & Lunar Eclipses 2025: Complete Guide'
        h1='2025 Eclipse Guide'
        description='Complete guide to 2025 eclipses with dates, meanings, and rituals. Two solar eclipses and two lunar eclipses will transform the year.'
        keywords={[
          'eclipses 2025',
          'solar eclipse 2025',
          'lunar eclipse 2025',
          'eclipse dates',
          'eclipse meaning',
          'eclipse rituals',
          'eclipse astrology',
        ]}
        canonicalUrl='https://lunary.app/grimoire/events/2025/eclipses'
        datePublished='2024-12-01'
        dateModified={new Date().toISOString().split('T')[0]}
        articleSection='Astrology Events'
        intro='2025 brings four powerful eclipses that will catalyze major changes and new beginnings. Eclipses are cosmic wild cards—they accelerate fate and bring destined events into our lives. This guide covers all four 2025 eclipses with their meanings and rituals.'
        meaning={`**What Are Eclipses?**

Eclipses occur when the Sun, Moon, and Earth align, creating either a solar eclipse (when the Moon blocks the Sun) or a lunar eclipse (when Earth's shadow falls on the Moon). Astrologically, eclipses are powerful portals of change.

**2025 Eclipse Axis: Aries-Libra to Virgo-Pisces**

The eclipses in early 2025 complete the Aries-Libra eclipse cycle (which began in 2023), while the September eclipses begin a new cycle on the Virgo-Pisces axis that will continue into 2027.

**Eclipse Rules**

- **Don't manifest during eclipses** — the energy is too chaotic and fated
- **Lunar eclipses are for release** — let go of what no longer serves
- **Solar eclipses are for beginnings** — but wait 48-72 hours to set intentions
- **Eclipses affect everyone differently** — check where the eclipse falls in your chart

**The 2025 Eclipses**

1. **March 14** — Total Lunar Eclipse in Virgo ♍ (Release)
2. **March 29** — Partial Solar Eclipse in Aries ♈ (New Beginning)
3. **September 7** — Total Lunar Eclipse in Pisces ♓ (Release)
4. **September 21** — Partial Solar Eclipse in Virgo ♍ (New Beginning)

**Eclipse Seasons**

Eclipses come in pairs or clusters called "eclipse seasons." In 2025, we have two eclipse seasons:
- **March 14-29**: Culmination of Aries-Libra cycle
- **September 7-21**: Beginning of Virgo-Pisces cycle`}
        ctaText='Get Your Personalized Eclipse Report'
        ctaHref='/welcome?from=eclipses-2025'
      >
        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            2025 Eclipse Calendar
          </h2>
          <div className='space-y-4'>
            {eclipses2025.map((eclipse, index) => {
              const Icon = eclipse.icon;
              const isSolar = eclipse.type.includes('Solar');
              return (
                <div
                  key={index}
                  className={`p-6 rounded-lg border ${
                    isSolar
                      ? 'border-lunary-accent-700 bg-lunary-accent-950'
                      : 'border-lunary-primary-700 bg-lunary-primary-900/10'
                  }`}
                >
                  <div className='flex items-start gap-4'>
                    <div
                      className={`p-2 rounded-lg ${isSolar ? 'bg-lunary-accent-900' : 'bg-lunary-primary-900/20'}`}
                    >
                      <Icon
                        className={`h-6 w-6 ${isSolar ? 'text-lunary-accent' : 'text-lunary-primary-400'}`}
                      />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <h3 className='text-lg font-medium text-zinc-100'>
                          {eclipse.date}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            isSolar
                              ? 'bg-lunary-accent-900 text-lunary-accent-300'
                              : 'bg-lunary-primary-900/20 text-lunary-primary-300'
                          }`}
                        >
                          {eclipse.type}
                        </span>
                      </div>
                      <p
                        className={`text-sm mb-2 ${isSolar ? 'text-lunary-accent-300' : 'text-lunary-primary-300'}`}
                      >
                        {eclipse.sign} — {eclipse.theme}
                      </p>
                      <p className='text-zinc-400 text-sm mb-4'>
                        {eclipse.description}
                      </p>
                      <div className='space-y-2'>
                        <p className='text-xs text-zinc-400 uppercase tracking-wider'>
                          Suggested Rituals:
                        </p>
                        <ul className='text-sm text-zinc-300 space-y-1'>
                          {eclipse.rituals.map((ritual, i) => (
                            <li key={i}>• {ritual}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className='space-y-6'>
          <h2 className='text-2xl font-medium text-zinc-100'>
            Eclipse Self-Care Tips
          </h2>
          <div className='p-6 rounded-lg border border-zinc-700 bg-zinc-900/50'>
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <h3 className='font-medium text-zinc-100 mb-2'>
                  During Eclipse Season
                </h3>
                <ul className='text-sm text-zinc-300 space-y-2'>
                  <li>• Get extra rest and sleep</li>
                  <li>• Stay hydrated and nourished</li>
                  <li>• Avoid major decisions if possible</li>
                  <li>• Journal and process emotions</li>
                  <li>• Practice grounding exercises</li>
                </ul>
              </div>
              <div>
                <h3 className='font-medium text-zinc-100 mb-2'>
                  After Eclipses
                </h3>
                <ul className='text-sm text-zinc-300 space-y-2'>
                  <li>• Reflect on what emerged</li>
                  <li>• Take action on insights</li>
                  <li>• Notice what ended or began</li>
                  <li>• Trust the process unfolding</li>
                  <li>• Be patient with changes</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className='space-y-4'>
          <h2 className='text-2xl font-medium text-zinc-100'>Related Topics</h2>
          <div className='flex flex-wrap gap-3'>
            <Link
              href='/grimoire/moon-rituals'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Moon Rituals
            </Link>
            <Link
              href='/grimoire/events/2025/mercury-retrograde'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Mercury Retrograde 2025
            </Link>
            <Link
              href='/grimoire/astronomy'
              className='px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm transition-colors'
            >
              Astronomy Guide
            </Link>
          </div>
        </section>
      </SEOContentTemplate>
    </div>
  );
}
