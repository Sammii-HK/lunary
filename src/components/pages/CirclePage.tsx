'use client';

import Link from 'next/link';
import {
  Users,
  Clock,
  Moon,
  Heart,
  Sparkles,
  Check,
  UserPlus,
  BarChart3,
  Calendar,
  MessageCircle,
  Gift,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/MarketingFooter';
import { conversionTracking } from '@/lib/analytics';
import { Heading } from '@/components/ui/Heading';

export default function CirclePage() {
  useEffect(() => {
    conversionTracking.pageViewed('/circle');
  }, []);

  const handleCtaClick = (location: string, label: string, href: string) => {
    conversionTracking.ctaClicked({
      location,
      label,
      href,
      pagePath: '/circle',
    });
  };

  return (
    <div className='min-h-fit bg-zinc-950 text-zinc-50'>
      {/* Hero */}
      <section className='py-16 md:py-24 px-4 md:px-6'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-700/30 text-lunary-primary-300 text-xs'>
            <Users className='w-3.5 h-3.5' />
            <span>Your Cosmic Circle</span>
          </div>
          <Heading as='h1' variant='h1'>
            Astrology is Better
            <br />
            <span className='text-lunary-primary-300'>With Friends</span>
          </Heading>
          <p className='text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
            See how your charts interact. Track compatibility. Get alerts when
            cosmic timing is perfect for connection.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center pt-4'>
            <Button
              asChild
              size='lg'
              variant='lunary-solid'
              onClick={() =>
                handleCtaClick('hero', 'Start connecting', '/auth?signup=true')
              }
            >
              <Link href='/auth?signup=true'>Start connecting</Link>
            </Button>
            <Button asChild size='lg' variant='outline'>
              <Link href='/features#connect'>See all features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Three Pillars */}
      <section className='py-16 md:py-20 px-4 md:px-6 border-t border-zinc-800/50'>
        <div className='max-w-6xl mx-auto'>
          <div className='text-center mb-12 md:mb-16'>
            <Heading as='h2' variant='h2'>
              Four Ways to Connect
            </Heading>
            <p className='text-sm md:text-base text-zinc-400'>
              From basic compatibility to knowing exactly when to reach out
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-6 md:gap-8'>
            {/* Pillar 1: Synastry */}
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 md:p-8 space-y-4'>
              <div className='flex items-center gap-2 align-middle'>
                <div className='p-3 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 w-fit'>
                  <Heart className='w-6 h-6' />
                </div>
                <Heading
                  as='h3'
                  variant='h3'
                  className='mb-0 ml-2 text-lunary-primary-300'
                >
                  Full Synastry Analysis
                </Heading>
              </div>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                See exactly how your charts interact with all major aspects
                analyzed between both charts.
              </p>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Compatibility percentage breakdown</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Sun, Moon, Venus, Mars connections</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Element & modality balance</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Challenging aspects explained</span>
                </li>
              </ul>
              <div className='pt-4 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-500'>
                  <span className='text-lunary-primary-400'>Lunary+</span>{' '}
                  Unlimited friends + full analysis
                </p>
              </div>
            </div>

            {/* Pillar 2: Best Times */}
            <div className='rounded-2xl border border-lunary-primary-700/30 bg-lunary-primary-900/10 p-6 md:p-8 space-y-4 relative overflow-hidden'>
              <div className='absolute top-4 right-4 px-2 py-1 rounded-full bg-lunary-primary-600/20 text-lunary-primary-300 text-[10px] uppercase tracking-wide'>
                Pro
              </div>
              <div className='flex items-center gap-2 align-middle'>
                <div className='p-3 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 w-fit'>
                  <Clock className='w-6 h-6' />
                </div>
                <Heading
                  as='h3'
                  variant='h3'
                  className='mb-0 ml-2 text-lunary-primary-300'
                >
                  Best Times to Connect
                </Heading>
              </div>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Know when cosmic timing supports connection. No more guessing
                when to reach out.
              </p>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Analyzes BOTH your transits</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>&quot;Feb 17-24: Great for deep talks&quot;</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Personalized per relationship</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Different from generic calendars</span>
                </li>
              </ul>
              <div className='pt-4 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-500'>
                  <span className='text-lunary-primary-400'>Lunary+ Pro</span>{' '}
                  Exclusive feature
                </p>
              </div>
            </div>

            {/* Pillar 3: Shared Events */}
            <div className='rounded-2xl border border-lunary-primary-700/30 bg-lunary-primary-900/10 p-6 md:p-8 space-y-4 relative overflow-hidden'>
              <div className='absolute top-4 right-4 px-2 py-1 rounded-full bg-lunary-primary-600/20 text-lunary-primary-300 text-[10px] uppercase tracking-wide'>
                Pro
              </div>
              <div className='flex items-center gap-2 align-middle'>
                <div className='p-3 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 w-fit'>
                  <Moon className='w-6 h-6' />
                </div>
                <Heading
                  as='h3'
                  variant='h3'
                  className='mb-0 ml-2 text-lunary-primary-300'
                >
                  Shared Cosmic Events
                </Heading>
              </div>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Moon phases that activate compatible houses for both of you.
              </p>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>
                    &quot;New Moon activates your 5th & their 7th&quot;
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Never miss significant moments</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Relationship-specific lunar timing</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Plan around cosmic alignment</span>
                </li>
              </ul>
              <div className='pt-4 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-500'>
                  <span className='text-lunary-primary-400'>Lunary+ Pro</span>{' '}
                  Exclusive feature
                </p>
              </div>
            </div>

            {/* Pillar 4: Cosmic Gifting */}
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-6 md:p-8 space-y-4'>
              <div className='flex items-center gap-2 align-middle'>
                <div className='p-3 rounded-full bg-lunary-primary-900/50 text-lunary-primary-300 w-fit'>
                  <Gift className='w-6 h-6' />
                </div>
                <Heading
                  as='h3'
                  variant='h3'
                  className='mb-0 ml-2 text-lunary-primary-300'
                >
                  Cosmic Gifting
                </Heading>
              </div>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                Send tarot cards, crystal blessings, and celestial messages to
                friends with a magical unwrap animation.
              </p>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Send tarot cards with personal messages</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Crystal blessings aligned to their chart</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Beautiful animated unwrap experience</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5 flex-shrink-0' />
                  <span>Gift history in your Circle</span>
                </li>
              </ul>
              <div className='pt-4 border-t border-zinc-800/50'>
                <p className='text-xs text-zinc-500'>
                  <span className='text-lunary-primary-400'>Free:</span> 1
                  gift/week{' '}
                  <span className='text-lunary-primary-400 ml-2'>Lunary+:</span>{' '}
                  Unlimited
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className='py-16 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <Heading as='h2' variant='h2'>
              How It Works
            </Heading>
            <p className='text-sm md:text-base text-zinc-400'>
              Start connecting in under a minute
            </p>
          </div>

          <div className='space-y-8'>
            <Step
              number={1}
              icon={<UserPlus className='w-5 h-5' />}
              title='Invite Friends'
              description='Share your unique invite link or search for friends already on Lunary. They just need to enter their birth info.'
            />
            <Step
              number={2}
              icon={<BarChart3 className='w-5 h-5' />}
              title='See Your Synastry'
              description='Instantly see compatibility percentage and full aspect analysis. Understand where you naturally connect and where you might clash.'
            />
            <Step
              number={3}
              icon={<Calendar className='w-5 h-5' />}
              title='Get Timing Alerts'
              description='Pro users get notified when cosmic timing supports connection. "This week is great for planning together" or "Hold off on serious talks until Thursday."'
            />
            <Step
              number={4}
              icon={<MessageCircle className='w-5 h-5' />}
              title='Grow Together'
              description='Send cosmic gifts, celebrate milestones, and stay consistent together. Astrology practice is more fun with friends.'
            />
          </div>
        </div>
      </section>

      {/* Example: Best Times */}
      <section className='py-16 md:py-20 px-4 md:px-6 border-t border-zinc-800/50'>
        <div className='max-w-5xl mx-auto'>
          <div className='grid md:grid-cols-2 gap-8 md:gap-12 items-center'>
            <div className='space-y-6'>
              <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-700/30 text-lunary-primary-300 text-xs'>
                <Clock className='w-3.5 h-3.5' />
                <span>Pro Feature</span>
              </div>
              <Heading as='h2' variant='h2'>
                Know When to Reach Out
              </Heading>
              <p className='text-zinc-400 leading-relaxed'>
                Best Times to Connect analyzes both your transits to find
                windows where cosmic energy supports your connection.
              </p>
              <p className='text-zinc-400 leading-relaxed'>
                This isn&apos;t a generic moon calendar. It&apos;s YOUR timing
                with THEM, based on both birth charts and current planetary
                positions.
              </p>
              <Button
                asChild
                variant='lunary-soft'
                onClick={() =>
                  handleCtaClick('best-times', 'Upgrade to Pro', '/pricing')
                }
              >
                <Link href='/pricing'>Upgrade to Pro</Link>
              </Button>
            </div>

            {/* Example Card */}
            <div className='rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-6 space-y-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-medium'>
                  L
                </div>
                <div>
                  <p className='text-sm font-medium text-zinc-200'>
                    Celeste&apos;s Profile
                  </p>
                  <p className='text-xs text-zinc-500'>84% compatibility</p>
                </div>
              </div>

              <div className='space-y-3 pt-2'>
                <div className='rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Sparkles className='w-4 h-4 text-lunary-success-400' />
                    <span className='text-xs font-medium text-lunary-success-400'>
                      Great Window
                    </span>
                  </div>
                  <p className='text-sm text-zinc-300'>Feb 17-24</p>
                  <p className='text-xs text-zinc-500'>
                    Venus trine your Moon - perfect for heartfelt conversations
                  </p>
                </div>

                <div className='rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Moon className='w-4 h-4 text-lunary-accent-400' />
                    <span className='text-xs font-medium text-lunary-accent-400'>
                      Shared Event
                    </span>
                  </div>
                  <p className='text-sm text-zinc-300'>New Moon Feb 20</p>
                  <p className='text-xs text-zinc-500'>
                    Activates your 5th house & their 7th - start creative
                    projects
                  </p>
                </div>

                <div className='rounded-lg bg-zinc-800/50 p-3'>
                  <div className='flex items-center gap-2 mb-1'>
                    <Clock className='w-4 h-4 text-lunary-rose-400' />
                    <span className='text-xs font-medium text-lunary-rose-400'>
                      Wait on This
                    </span>
                  </div>
                  <p className='text-sm text-zinc-300'>Feb 25-28</p>
                  <p className='text-xs text-zinc-500'>
                    Mercury square Mars - not ideal for big decisions together
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers */}
      <section className='py-16 md:py-20 px-4 md:px-6 bg-zinc-900/30'>
        <div className='max-w-4xl mx-auto'>
          <div className='text-center mb-12'>
            <Heading as='h2' variant='h2'>
              Choose Your Level
            </Heading>
            <p className='text-sm md:text-base text-zinc-400'>
              Start free, upgrade when you&apos;re ready
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
            {/* Free */}
            <div className='rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 space-y-4'>
              <Heading as='h3' variant='h2' className='text-zinc-100'>
                Free
              </Heading>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-zinc-500 mt-0.5' />
                  <span>Add up to 5 friends</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-zinc-500 mt-0.5' />
                  <span>Basic compatibility %</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-zinc-500 mt-0.5' />
                  <span>View their sun/moon/rising</span>
                </li>
              </ul>
            </div>

            {/* Lunary+ */}
            <div className='rounded-xl border border-lunary-primary-700/50 bg-lunary-primary-900/20 p-6 space-y-4'>
              <Heading as='h3' variant='h2' className='text-lunary-primary-300'>
                Lunary+
              </Heading>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5' />
                  <span>Unlimited friends</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5' />
                  <span>Full synastry (all major aspects)</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5' />
                  <span>Element & modality balance</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-primary-400 mt-0.5' />
                  <span>View full birth charts</span>
                </li>
              </ul>
            </div>

            {/* Pro */}
            <div className='rounded-xl border border-lunary-accent-700/50 bg-lunary-accent-900/10 p-6 space-y-4'>
              <Heading as='h3' variant='h2' className='text-lunary-accent-300'>
                Lunary+ Pro
              </Heading>
              <ul className='space-y-2 text-sm text-zinc-400'>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-accent-400 mt-0.5' />
                  <span>Everything in Lunary+</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-accent-400 mt-0.5' />
                  <span>Best Times to Connect</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-accent-400 mt-0.5' />
                  <span>Shared Cosmic Events</span>
                </li>
                <li className='flex items-start gap-2'>
                  <Check className='w-4 h-4 text-lunary-accent-400 mt-0.5' />
                  <span>Relationship timing alerts</span>
                </li>
              </ul>
            </div>
          </div>

          <div className='text-center mt-8'>
            <Button
              asChild
              size='lg'
              variant='outline'
              onClick={() => handleCtaClick('tiers', 'See pricing', '/pricing')}
            >
              <Link href='/pricing'>See pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className='py-16 md:py-24 px-4 md:px-6 border-t border-zinc-800/50'>
        <div className='max-w-3xl mx-auto text-center space-y-6'>
          <Heading as='h2' variant='h2'>
            Ready to Build Your Circle?
          </Heading>
          <p className='text-zinc-400 leading-relaxed'>
            Start free with 5 friends. Upgrade anytime for full synastry and
            relationship timing.
          </p>
          <Button
            asChild
            size='lg'
            variant='lunary'
            onClick={() =>
              handleCtaClick(
                'final-cta',
                'Get started free',
                '/auth?signup=true',
              )
            }
          >
            <Link href='/auth?signup=true'>Get started free</Link>
          </Button>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className='flex gap-4 md:gap-6'>
      <div className='flex flex-col items-center'>
        <div className='w-10 h-10 rounded-full bg-lunary-primary-900/30 border border-lunary-primary-700/30 flex items-center justify-center text-lunary-primary-300'>
          {icon}
        </div>
        <div className='flex-1 w-px bg-zinc-800/50 mt-2' />
      </div>
      <div className='pb-8'>
        <p className='text-xs text-lunary-primary-400 mb-1'>Step {number}</p>
        <Heading as='h3' variant='h3' className='text-zinc-100'>
          {title}
        </Heading>
        <p className='text-sm text-zinc-400 leading-relaxed'>{description}</p>
      </div>
    </div>
  );
}
