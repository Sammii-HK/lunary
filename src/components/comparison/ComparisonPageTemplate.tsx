import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import {
  ComparisonPageStructuredData,
  FAQ,
} from '@/components/ComparisonPageStructuredData';
import { Breadcrumbs } from '@/components/comparison/Breadcrumbs';

export type FeatureValue =
  | { type: 'check' }
  | { type: 'x' }
  | { type: 'text'; value: string; highlight?: boolean };

export interface FeatureRow {
  name: string;
  description?: string;
  lunary: FeatureValue;
  competitor: FeatureValue;
}

export interface Advantage {
  title: string;
  description: string;
}

export interface ComparisonData {
  competitorName: string;
  competitorSlug: string;
  tagline: string;
  subtitle: string;
  featuresCompared: string[];
  features: FeatureRow[];
  lunaryAdvantages: Advantage[];
  competitorStrengths: string;
  conclusion: string;
  disclaimer?: string;
  faqs?: FAQ[];
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value.type === 'check') {
    return <Check className='h-5 w-5 text-lunary-success mx-auto' />;
  }
  if (value.type === 'x') {
    return <X className='h-5 w-5 text-zinc-400 mx-auto' />;
  }
  return (
    <span
      className={
        value.highlight
          ? 'text-lunary-success font-medium text-sm'
          : 'text-zinc-400 text-sm'
      }
    >
      {value.value}
    </span>
  );
}

export function ComparisonPageTemplate({ data }: { data: ComparisonData }) {
  const {
    competitorName,
    competitorSlug,
    tagline,
    subtitle,
    featuresCompared,
    features,
    lunaryAdvantages,
    competitorStrengths,
    conclusion,
    disclaimer,
    faqs = [],
  } = data;

  const breadcrumbs = [
    { label: 'Comparisons', href: '/comparison' },
    {
      label: `Lunary vs ${competitorName}`,
      href: `/comparison/${competitorSlug}`,
    },
  ];

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName={competitorName}
        featuresCompared={featuresCompared}
        conclusion={conclusion}
        faqs={faqs}
        breadcrumbs={breadcrumbs}
      />
      <div className='max-w-4xl mx-auto px-4 py-8 md:py-12'>
        <Breadcrumbs items={breadcrumbs} />

        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-light text-zinc-100 mb-4'>
            {tagline}
          </h1>
          <p className='text-base md:text-lg text-zinc-400'>{subtitle}</p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of both apps.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-6'>
            Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-zinc-800'>
              <thead>
                <tr className='bg-zinc-900'>
                  <th className='border border-zinc-800 p-3 md:p-4 text-left text-zinc-200'>
                    Feature
                  </th>
                  <th className='border border-zinc-800 p-3 md:p-4 text-center text-lunary-primary-300 font-medium'>
                    Lunary
                  </th>
                  <th className='border border-zinc-800 p-3 md:p-4 text-center text-zinc-300'>
                    {competitorName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={
                      index % 2 === 0 ? 'bg-zinc-900/50' : 'bg-zinc-900/30'
                    }
                  >
                    <td className='border border-zinc-800 p-3 md:p-4 text-zinc-300'>
                      <strong className='text-zinc-100'>{feature.name}</strong>
                      {feature.description && (
                        <>
                          <br />
                          <span className='text-xs text-zinc-400'>
                            {feature.description}
                          </span>
                        </>
                      )}
                    </td>
                    <td className='border border-zinc-800 p-3 md:p-4 text-center'>
                      <FeatureCell value={feature.lunary} />
                    </td>
                    <td className='border border-zinc-800 p-3 md:p-4 text-center'>
                      <FeatureCell value={feature.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-6'>
            Why Choose Lunary?
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <div className='space-y-4'>
              {lunaryAdvantages.map((advantage) => (
                <div key={advantage.title} className='flex items-start gap-3'>
                  <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                  <div>
                    <h3 className='text-lg font-medium text-zinc-100 mb-1'>
                      {advantage.title}
                    </h3>
                    <p className='text-sm text-zinc-300 leading-relaxed'>
                      {advantage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-6'>
            When {competitorName} Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {competitorStrengths}
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {conclusion}
            </p>
          </div>
        </section>

        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-base md:text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-zinc-100 mb-6'>
            Explore the Lunary Grimoire
          </h2>
          <p className='text-sm text-zinc-400 mb-6'>
            Discover our comprehensive knowledge library that sets Lunary apart.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Birth Chart Guide
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Complete guide to reading your chart
              </p>
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>
                Planetary Meanings
              </span>
              <p className='text-xs text-zinc-500 mt-1'>
                Understand astrological planets
              </p>
            </Link>
            <Link
              href='/grimoire/tarot'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>78 Tarot Cards</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Major & Minor Arcana meanings
              </p>
            </Link>
            <Link
              href='/grimoire/crystals'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Crystal Guide</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Properties and correspondences
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>12 Zodiac Signs</span>
              <p className='text-xs text-zinc-500 mt-1'>
                Traits, dates, and compatibility
              </p>
            </Link>
            <Link
              href='/grimoire'
              className='p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-zinc-300 font-medium'>Full Grimoire</span>
              <p className='text-xs text-zinc-500 mt-1'>
                500+ pages of cosmic wisdom
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-400 leading-relaxed'>
            <strong>Disclaimer:</strong>{' '}
            {disclaimer ||
              `This comparison is based on publicly available information as of 2025. Features and pricing may change. ${competitorName} is a registered trademark of its respective owner. This comparison is for informational purposes only and is not intended to disparage any competitor. We strive to be fair and accurate in our assessments.`}
          </p>
        </section>
      </div>
    </div>
  );
}
