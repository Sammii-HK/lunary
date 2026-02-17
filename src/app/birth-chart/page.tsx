import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Target,
  BookOpen,
  Check,
  X,
  ChevronDown,
  Star,
  Moon,
  Orbit,
  Layers,
} from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { Button } from '@/components/ui/button';
import { ExploreGrimoire } from '@/components/grimoire/ExploreGrimoire';
import { BirthChartShowcase } from '@/components/birth-chart-sections/BirthChartShowcase';
import { ChartWheelInteractive } from './chart-wheel-interactive';
import { getCelesteChart } from '@/lib/data/getCelesteChart';
import { ensureDescendantInChart } from '@/utils/astrology/birth-chart-analysis';
import {
  renderJsonLdMulti,
  createArticleSchema,
  createFAQPageSchema,
  createBreadcrumbSchema,
  createSoftwareAppSchema,
} from '@/lib/schema';

const faqs = [
  {
    question: 'What is a birth chart?',
    answer:
      'A birth chart (also called a natal chart) is a map of where all the planets were at the exact moment you were born, viewed from your birth location. It forms the foundation of personal astrology and reveals your unique cosmic blueprint.',
  },
  {
    question: 'Why does Lunary track 24+ celestial bodies?',
    answer:
      'Most calculators only show the 10 classical planets. Lunary includes asteroids like Chiron, Ceres, Pallas, Juno, and Vesta, plus sensitive points like the Lunar Nodes, Lilith, Part of Fortune, and Vertex. This gives you a much richer and more nuanced picture of your chart.',
  },
  {
    question: "How accurate is Lunary's birth chart calculator?",
    answer:
      'Lunary uses the Astronomy Engine library, validated against NOVAS and JPL Horizons to within 1 arcminute. Planetary positions are calculated to arcminute accuracy (1/60th of a degree), ensuring precise placements for all celestial bodies.',
  },
  {
    question: 'Do I need my exact birth time?',
    answer:
      'Your birth time determines your Ascendant (rising sign) and house placements. Without it, these elements cannot be calculated accurately. The Ascendant changes approximately every 2 hours, so even a rough time helps. You can still generate a chart without birth time, but house placements will be unavailable.',
  },
  {
    question: 'What are planetary dignities?',
    answer:
      'Planetary dignities describe how comfortable a planet is in a particular sign. A planet in its own sign (rulership) or exaltation is strengthened, while a planet in detriment or fall faces challenges. Lunary automatically calculates and displays all dignities in your chart.',
  },
  {
    question: 'What is a stellium?',
    answer:
      "A stellium occurs when three or more planets cluster in the same zodiac sign. This creates a powerful concentration of energy in that sign's themes. Lunary automatically detects and interprets stelliums in your chart.",
  },
  {
    question: 'Why does my Part of Fortune differ from Co-Star or other apps?',
    answer:
      'Lunary uses the traditional Hellenistic day/night sect formula for the Part of Fortune. If you were born at night, your Part of Fortune will differ from apps that use a single formula regardless. This is the original calculation method, used by astrologers for over 2,000 years. Learn more on our methodology page.',
  },
];

const comparisonFeatures = [
  { feature: 'Celestial bodies tracked', lunary: '24+', others: '10' },
  { feature: 'Arcminute accuracy', lunary: true, others: false },
  { feature: 'Asteroid placements', lunary: true, others: false },
  {
    feature: 'Sensitive points (Nodes, Lilith, Vertex)',
    lunary: true,
    others: false,
  },
  { feature: 'Planetary dignities', lunary: true, others: false },
  { feature: 'Chart pattern detection', lunary: true, others: false },
  { feature: 'Stellium analysis', lunary: true, others: false },
  { feature: 'Personalized interpretations', lunary: true, others: false },
  { feature: 'Whole Sign Houses', lunary: true, others: true },
];

export default async function BirthChartLandingPage() {
  // Redirect authenticated users to their own birth chart
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');
    const sessionResponse = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });
    if (sessionResponse?.user?.id) {
      redirect('/app/birth-chart');
    }
  } catch {
    // Not authenticated, show marketing page
  }

  const celesteData = getCelesteChart();

  const chartData = celesteData
    ? ensureDescendantInChart(celesteData.birthChart)
    : null;

  return (
    <div className='min-h-screen bg-lunary-bg'>
      {renderJsonLdMulti([
        createArticleSchema({
          headline: 'Free Birth Chart Calculator & Natal Chart Reading',
          description:
            'Get your complete birth chart analysis with 24+ celestial bodies, house placements, aspects, dignities, and personalized interpretations.',
          url: 'https://lunary.app/birth-chart',
          keywords: [
            'birth chart',
            'natal chart',
            'birth chart calculator',
            'astrology chart',
            'planetary positions',
          ],
          section: 'Astrology Tools',
        }),
        createFAQPageSchema(faqs),
        createBreadcrumbSchema([{ name: 'Birth Chart', url: '/birth-chart' }]),
        createSoftwareAppSchema({
          name: 'Lunary Birth Chart Calculator',
          description:
            'Free birth chart calculator with 24+ celestial bodies, aspects, dignities, and personalized interpretations. Calculated from real astronomical data.',
          applicationCategory: 'LifestyleApplication',
          offers: { price: 0, priceCurrency: 'USD' },
          featureList: [
            '24+ celestial body positions',
            'Arcminute accuracy',
            'Whole Sign House system',
            'Planetary aspects with orbs',
            'Planetary dignities',
            'Chart pattern detection',
            'Stellium analysis',
            'Personalized interpretations',
          ],
        }),
      ])}

      <div className='max-w-4xl mx-auto px-4 py-8 space-y-12'>
        {/* Hero Section */}
        <header className='text-center space-y-4'>
          <Heading as='h1' variant='h1'>
            Free Birth Chart Calculator
          </Heading>
          <p className='text-zinc-400 max-w-2xl mx-auto'>
            Discover your cosmic blueprint with 24+ celestial bodies, planetary
            aspects, dignities, and personalized interpretations — all
            calculated from real astronomical data.
          </p>
          <p className='text-zinc-500 text-sm max-w-xl mx-auto'>
            Beyond the 10 classical planets — track asteroids, lunar nodes,
            Lilith, Part of Fortune, Vertex, and more.
          </p>
          <div className='flex flex-col sm:flex-row gap-3 justify-center pt-2'>
            <Link href='/auth'>
              <Button className='gap-2'>
                Calculate Your Birth Chart
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
            <Link href='/birth-chart/example'>
              <Button variant='outline' className='gap-2'>
                <BookOpen className='w-4 h-4' />
                Learn to Read Charts
              </Button>
            </Link>
          </div>
        </header>

        {/* Live Chart Showcase */}
        {chartData && (
          <section>
            <div className='text-center mb-4'>
              <Heading as='h2' variant='h2'>
                See a Real Birth Chart in Action
              </Heading>
              <p className='text-sm text-zinc-400'>
                This is Celeste&apos;s actual birth chart — explore every
                section to see what your chart will include.
              </p>
            </div>
            <ChartWheelInteractive birthChart={chartData} />
            <div className='mt-8'>
              <BirthChartShowcase birthChart={chartData} />
            </div>
          </section>
        )}

        {/* Feature Highlights */}
        <section className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <Target className='w-5 h-5 text-lunary-primary-300' />
              <h3 className='text-sm font-medium text-white'>
                Arcminute Accuracy
              </h3>
            </div>
            <p className='text-xs text-zinc-400'>
              Powered by Astronomy Engine, validated to within 1 arcminute of
              NOVAS and JPL Horizons. Every planetary position is calculated to
              1/60th of a degree.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <Sparkles className='w-5 h-5 text-lunary-accent' />
              <h3 className='text-sm font-medium text-white'>
                24+ Celestial Bodies
              </h3>
            </div>
            <p className='text-xs text-zinc-400'>
              Beyond the 10 classical planets — track asteroids (Chiron, Ceres,
              Pallas, Juno, Vesta), lunar nodes, Lilith, Part of Fortune,
              Vertex, and more.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-5'>
            <div className='flex items-center gap-2 mb-3'>
              <BookOpen className='w-5 h-5 text-lunary-secondary-300' />
              <h3 className='text-sm font-medium text-white'>
                Educational Interpretations
              </h3>
            </div>
            <p className='text-xs text-zinc-400'>
              Every placement comes with a personalized interpretation
              explaining what it means in your chart — perfect for beginners and
              seasoned astrologers alike.
            </p>
          </div>
        </section>

        {/* Comparison Table */}
        <section>
          <div className='text-center mb-4'>
            <Heading as='h2' variant='h2'>
              How Lunary Compares
            </Heading>
            <p className='text-sm text-zinc-400'>
              See why Lunary offers the most complete free birth chart
              experience.
            </p>
          </div>
          <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-zinc-800'>
                  <th className='text-left p-3 text-zinc-400 font-medium'>
                    Feature
                  </th>
                  <th className='text-center p-3 text-lunary-primary-300 font-medium'>
                    Lunary
                  </th>
                  <th className='text-center p-3 text-zinc-500 font-medium'>
                    Others
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row) => (
                  <tr
                    key={row.feature}
                    className='border-b border-zinc-800/50 last:border-0'
                  >
                    <td className='p-3 text-zinc-300 text-xs'>{row.feature}</td>
                    <td className='p-3 text-center'>
                      {typeof row.lunary === 'boolean' ? (
                        row.lunary ? (
                          <Check className='w-4 h-4 text-lunary-success-300 mx-auto' />
                        ) : (
                          <X className='w-4 h-4 text-zinc-600 mx-auto' />
                        )
                      ) : (
                        <span className='text-xs text-lunary-primary-300 font-medium'>
                          {row.lunary}
                        </span>
                      )}
                    </td>
                    <td className='p-3 text-center'>
                      {typeof row.others === 'boolean' ? (
                        row.others ? (
                          <Check className='w-4 h-4 text-zinc-400 mx-auto' />
                        ) : (
                          <X className='w-4 h-4 text-zinc-600 mx-auto' />
                        )
                      ) : (
                        <span className='text-xs text-zinc-500'>
                          {row.others}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* What Happens Next CTA */}
        <section className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-6'>
          <Heading as='h2' variant='h2'>
            Get Your Birth Chart in 3 Steps
          </Heading>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-4'>
            <div className='text-center'>
              <div className='w-8 h-8 rounded-full bg-lunary-primary/20 border border-lunary-primary/40 flex items-center justify-center mx-auto mb-2'>
                <span className='text-sm text-lunary-primary-300'>1</span>
              </div>
              <h3 className='text-sm font-medium text-white mb-1'>
                Create Your Profile
              </h3>
              <p className='text-xs text-zinc-400'>
                Sign up and enter your birth date, time, and location.
              </p>
            </div>
            <div className='text-center'>
              <div className='w-8 h-8 rounded-full bg-lunary-primary/20 border border-lunary-primary/40 flex items-center justify-center mx-auto mb-2'>
                <span className='text-sm text-lunary-primary-300'>2</span>
              </div>
              <h3 className='text-sm font-medium text-white mb-1'>
                We Calculate Everything
              </h3>
              <p className='text-xs text-zinc-400'>
                Lunary computes positions for 24+ celestial bodies using
                Astronomy Engine.
              </p>
            </div>
            <div className='text-center'>
              <div className='w-8 h-8 rounded-full bg-lunary-primary/20 border border-lunary-primary/40 flex items-center justify-center mx-auto mb-2'>
                <span className='text-sm text-lunary-primary-300'>3</span>
              </div>
              <h3 className='text-sm font-medium text-white mb-1'>
                Explore Your Chart
              </h3>
              <p className='text-xs text-zinc-400'>
                Dive into your Big Three, house placements, aspects, patterns,
                and personalized interpretations.
              </p>
            </div>
          </div>
          <div className='text-center mt-6'>
            <Link href='/auth'>
              <Button className='gap-2'>
                Get Started Free
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>
        </section>

        {/* Your Chart Powers Everything */}
        <section>
          <div className='text-center mb-4'>
            <Heading as='h2' variant='h2'>
              Your Chart Powers Everything
            </Heading>
            <p className='text-sm text-zinc-400'>
              Your birth chart is the foundation. With Lunary+, it unlocks
              personalised features across the entire app.
            </p>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex gap-3'>
              <Star className='w-5 h-5 text-lunary-accent flex-shrink-0 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-white mb-1'>
                  Daily Personalised Horoscopes
                </h3>
                <p className='text-xs text-zinc-400'>
                  Readings calculated from your exact natal placements — not
                  just your Sun sign.
                </p>
              </div>
            </div>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex gap-3'>
              <Orbit className='w-5 h-5 text-lunary-primary-300 flex-shrink-0 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-white mb-1'>
                  Personal Transit Tracking
                </h3>
                <p className='text-xs text-zinc-400'>
                  See how today&apos;s planets interact with your chart and what
                  it means for you specifically.
                </p>
              </div>
            </div>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex gap-3'>
              <Layers className='w-5 h-5 text-lunary-secondary-300 flex-shrink-0 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-white mb-1'>
                  Tarot Seeded from Your Placements
                </h3>
                <p className='text-xs text-zinc-400'>
                  Daily card draws informed by your natal chart and current
                  transits for deeper relevance.
                </p>
              </div>
            </div>
            <div className='bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 flex gap-3'>
              <Moon className='w-5 h-5 text-lunary-rose-300 flex-shrink-0 mt-0.5' />
              <div>
                <h3 className='text-sm font-medium text-white mb-1'>
                  Moon Circle Rituals
                </h3>
                <p className='text-xs text-zinc-400'>
                  New and full moon ceremonies personalised to your chart&apos;s
                  unique placements.
                </p>
              </div>
            </div>
          </div>
          <div className='text-center mt-4'>
            <Link href='/pricing'>
              <Button variant='outline' className='gap-2'>
                See Lunary+ Plans
                <ArrowRight className='w-4 h-4' />
              </Button>
            </Link>
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <Heading as='h2' variant='h2'>
            Frequently Asked Questions
          </Heading>
          <div className='space-y-2'>
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className='group bg-zinc-900/50 border border-zinc-800 rounded-lg'
              >
                <summary className='flex items-center justify-between cursor-pointer p-4 text-sm text-zinc-200 font-medium list-none'>
                  {faq.question}
                  <ChevronDown className='w-4 h-4 text-zinc-500 transition-transform group-open:rotate-180' />
                </summary>
                <div className='px-4 pb-4'>
                  <p className='text-xs text-zinc-400 leading-relaxed'>
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className='text-center py-8 border-t border-zinc-800'>
          <Heading as='h2' variant='h2'>
            Ready to Discover Your Cosmic Blueprint?
          </Heading>
          <p className='text-sm text-zinc-400 mb-4'>
            Your birth chart calculation is free. Upgrade to Lunary+ for
            personalised horoscopes, transit tracking, and more.
          </p>
          <Link href='/auth'>
            <Button size='lg' className='gap-2'>
              Calculate Your Birth Chart
              <ArrowRight className='w-4 h-4' />
            </Button>
          </Link>
        </section>

        {/* Explore Grimoire */}
        <ExploreGrimoire />
      </div>
    </div>
  );
}
