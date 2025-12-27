import type { Metadata } from 'next';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Lunary — Pre-Seed Raise',
  description:
    "Lunary is raising a £2M pre-seed round to scale the world's first unified symbolic intelligence OS — combining astrology, tarot, rituals, crystals, emotional insight, and an AI astral companion.",
  openGraph: {
    title: 'Lunary — Pre-Seed Raise',
    description:
      "Lunary is raising a £2M pre-seed round to scale the world's first unified symbolic intelligence OS.",
    url: 'https://lunary.app/invest',
    siteName: 'Lunary',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lunary — Pre-Seed Raise',
    description:
      "Lunary is raising a £2M pre-seed round to scale the world's first unified symbolic intelligence OS.",
  },
};

export default function InvestPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-50 flex flex-col'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20 flex-1'>
        {/* Hero Section */}
        <section className='text-center mb-16 md:mb-20 lg:mb-24 space-y-6'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-zinc-100 leading-tight tracking-tight'>
            Lunary — Pre-Seed Raise
          </h1>
          <p className='text-lg md:text-xl lg:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed'>
            The AI-powered spiritual intelligence platform
          </p>
          <p className='text-base md:text-lg text-zinc-300 max-w-4xl mx-auto leading-relaxed'>
            Lunary is raising a{' '}
            <span className='font-medium text-lunary-primary-300'>
              £2M pre-seed round
            </span>{' '}
            to scale the world's first unified{' '}
            <span className='font-medium text-lunary-primary-300'>
              symbolic intelligence OS
            </span>{' '}
            — combining astrology, tarot, rituals, crystals, emotional insight,
            and an AI astral companion.
          </p>
        </section>

        {/* What is Lunary */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            What is Lunary?
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl'>
            Lunary is a personalised spiritual AI platform built for the{' '}
            <span className='font-medium text-zinc-300'>1.2B+ people</span> who
            use astrology, tarot, rituals, moon cycles, crystals, journaling, or
            symbolic systems to understand their inner world.
          </p>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl font-medium text-lunary-primary-300'>
            Where the market is fragmented, Lunary is unified.
          </p>
          <div className='grid md:grid-cols-2 gap-4 mt-8'>
            <div className='space-y-3'>
              <ul className='space-y-2 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Astrology engine</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Tarot engine</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Crystal index + AI identification</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Ritual generator</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Emotional reflection</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Moon cycle system</span>
                </li>
              </ul>
            </div>
            <div className='space-y-3'>
              <ul className='space-y-2 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Book of Shadows (journaling)</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>AI astral guide</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Weekly cosmic digest</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Shareable OG content</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>SEO knowledge engine</span>
                </li>
              </ul>
            </div>
          </div>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl mt-6 font-medium'>
            It is the first{' '}
            <span className='text-lunary-primary-300'>symbolic OS</span> powered
            by AI.
          </p>
        </section>

        {/* Why Now */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Why Now?
          </h2>
          <ul className='space-y-4 text-zinc-300 max-w-4xl'>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                Spiritual wellness is a{' '}
                <span className='font-medium text-lunary-primary-300'>
                  $4.2B industry
                </span>{' '}
                growing rapidly
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                Astrology & tarot communities dominate TikTok, Instagram, and
                Pinterest
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                Gen Z is the most spiritually-engaged generation in history
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                Existing apps (Co–Star, The Pattern) are stagnant, static, and
                not AI-native
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                AI finally allows personalisation, meaning-making, and deep
                insight
              </span>
            </li>
          </ul>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl mt-6 font-medium'>
            We are building{' '}
            <span className='text-lunary-primary-300'>
              the category-defining platform
            </span>{' '}
            for symbolic intelligence.
          </p>
        </section>

        {/* Traction */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Traction
          </h2>
          <ul className='space-y-4 text-zinc-300 max-w-4xl'>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Fully functional product</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Four subscription tiers live</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Real MRR</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                SEO engine (grimoire, rituals, tarot, crystals, moon phases)
              </span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Daily cosmic posts + automations</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>AI astral companion (ChatGPT-powered)</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Shareable cosmic visuals</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Admin dashboard</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>OG image engine</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Crystal Index acquisition</span>
            </li>
          </ul>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl mt-6'>
            This is more product delivered than most pre-seed companies.
          </p>
        </section>

        {/* Market */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Market
          </h2>
          <ul className='space-y-4 text-zinc-300 max-w-4xl'>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>$4.2B spiritual wellness</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>90M spiritually engaged US millennials</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>1.2B global market</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Astrology app competitors reaching $100M+ ARR</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>
                "Meaning-making" is the fastest-growing category in personal AI
              </span>
            </li>
          </ul>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl mt-6 font-medium'>
            Lunary sits at the intersection of{' '}
            <span className='text-lunary-primary-300'>
              AI × spirituality × self-reflection × symbolic systems
            </span>
            .
          </p>
        </section>

        {/* Competitive Advantage */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Competitive Advantage
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl'>
            Lunary is{' '}
            <span className='font-medium text-lunary-primary-300'>
              the only platform
            </span>{' '}
            that unifies:
          </p>
          <div className='grid md:grid-cols-2 gap-4 mt-6'>
            <div className='space-y-3'>
              <ul className='space-y-2 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Astrology</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Tarot</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Rituals</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Crystals</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Emotional reflection</span>
                </li>
              </ul>
            </div>
            <div className='space-y-3'>
              <ul className='space-y-2 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>AI symbolic analysis</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Shareable content</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Personalised cosmic data</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>A Book of Shadows</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Crystal Index identification engine</span>
                </li>
              </ul>
            </div>
          </div>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl mt-6'>
            No competitor does all of these.
          </p>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl mt-4 font-medium'>
            This creates an{' '}
            <span className='text-lunary-primary-300'>unbeatable moat</span>:
          </p>
          <ol className='space-y-4 text-zinc-300 max-w-4xl mt-6 list-decimal list-inside'>
            <li>
              <span className='font-medium text-lunary-primary-300'>Depth</span>{' '}
              — Most complete library of symbolic systems
            </li>
            <li>
              <span className='font-medium text-lunary-primary-300'>AI</span> —
              Only platform with an astral guide that knows you
            </li>
            <li>
              <span className='font-medium text-lunary-primary-300'>SEO</span> —
              Massive evergreen content engine
            </li>
            <li>
              <span className='font-medium text-lunary-primary-300'>
                Shareability
              </span>{' '}
              — OG images drive organic growth
            </li>
            <li>
              <span className='font-medium text-lunary-primary-300'>
                Personalisation
              </span>{' '}
              — Birth chart, emotions, tarot patterns
            </li>
          </ol>
        </section>

        {/* Business Model */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Business Model
          </h2>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl font-medium'>
            Current revenue streams:
          </p>
          <ul className='space-y-3 text-zinc-300 max-w-4xl'>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Monthly subscriptions</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Yearly subscriptions</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Premium AI tier</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Ritual packs</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Crystal Index future marketplace</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Paid reports</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Premium identity (colour themes, profile grades)</span>
            </li>
          </ul>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-4xl mt-6 font-medium'>
            Future revenue streams:
          </p>
          <ul className='space-y-3 text-zinc-300 max-w-4xl'>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Live readings</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Creator marketplace</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Affiliate marketplace for spiritual tools</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Community rooms</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Premium events</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Retreat experiences</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-3 text-lunary-primary-400'>•</span>
              <span>Brand partnerships</span>
            </li>
          </ul>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl mt-6 font-medium'>
            Margins are <span className='text-lunary-primary-300'>99%+</span>.
          </p>
        </section>

        {/* Vision */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Vision
          </h2>
          <p className='text-base md:text-lg text-zinc-300 leading-relaxed max-w-4xl'>
            To become the{' '}
            <span className='font-medium text-lunary-primary-300'>
              global spiritual operating system
            </span>
            , powered by symbolic AI — guiding millions through cosmic cycles,
            emotional seasons, and personal meaning-making.
          </p>
        </section>

        {/* Raise Details */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Raise Details
          </h2>
          <div className='grid md:grid-cols-2 gap-8 max-w-4xl'>
            <div className='space-y-4'>
              <div>
                <p className='text-sm text-zinc-400 mb-1'>Target</p>
                <p className='text-xl font-medium text-zinc-100'>
                  £2M pre-seed
                </p>
              </div>
              <div>
                <p className='text-sm text-zinc-400 mb-1'>Valuation</p>
                <p className='text-xl font-medium text-zinc-100'>
                  £12–15M post-money
                </p>
              </div>
              <div>
                <p className='text-sm text-zinc-400 mb-1'>Vehicle</p>
                <p className='text-xl font-medium text-zinc-100'>SAFE</p>
              </div>
              <div>
                <p className='text-sm text-zinc-400 mb-1'>Runway</p>
                <p className='text-xl font-medium text-zinc-100'>24 months</p>
              </div>
            </div>
            <div className='space-y-4'>
              <p className='text-base text-zinc-400 mb-3 font-medium'>
                Use of funds:
              </p>
              <ul className='space-y-2 text-zinc-300'>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>AI engine expansion</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Content + SEO scale</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Crystal Index integration</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Mobile apps</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Team (design, engineering, growth)</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Partnerships</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Infrastructure</span>
                </li>
                <li className='flex items-start'>
                  <span className='mr-3 text-lunary-primary-400'>•</span>
                  <span>Community tools</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className='py-12 md:py-16 lg:py-20 border-b border-zinc-800/50 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Founder
          </h2>
          <div className='max-w-4xl space-y-4'>
            <p className='text-xl font-medium text-zinc-100'>Sammii H-K</p>
            <p className='text-base text-zinc-400 leading-relaxed'>
              Designer + engineer + founder.
            </p>
            <p className='text-base text-zinc-400 leading-relaxed'>
              Solo technical founder with full product, AI, design, branding,
              and UX execution.
            </p>
            <div className='space-y-2 mt-6'>
              <p className='text-base text-zinc-300'>Zero burn.</p>
              <p className='text-base text-zinc-300'>High leverage.</p>
              <p className='text-base text-zinc-300'>
                Extreme shipping velocity.
              </p>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className='py-12 md:py-16 lg:py-20 space-y-6'>
          <h2 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100 mb-6'>
            Contact
          </h2>
          <div className='max-w-4xl space-y-4'>
            <div>
              <p className='text-sm text-zinc-400 mb-1'>Email</p>
              <a
                href='mailto:sammi@lunary.app'
                className='text-lg font-medium text-lunary-primary-300 hover:text-lunary-primary-400 transition-colors'
              >
                sammi@lunary.app
              </a>
            </div>
            <div>
              <p className='text-sm text-zinc-400 mb-1'>Website</p>
              <a
                href='https://www.lunary.app'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lg font-medium text-lunary-primary-300 hover:text-lunary-primary-400 transition-colors'
              >
                https://www.lunary.app
              </a>
            </div>
            <p className='text-base text-zinc-400 mt-6'>
              Pitch deck available on request.
            </p>
          </div>
        </section>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
