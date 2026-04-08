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
    return <X className='h-5 w-5 text-content-muted mx-auto' />;
  }
  return (
    <span
      className={
        value.highlight
          ? 'text-lunary-success font-medium text-sm'
          : 'text-content-muted text-sm'
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
    <div className='min-h-screen bg-surface-base text-content-primary'>
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
          <h1 className='text-2xl md:text-4xl font-light text-content-primary mb-4'>
            {tagline}
          </h1>
          <p className='text-base md:text-lg text-content-muted'>{subtitle}</p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-layer-base/10'>
          <p className='text-sm text-content-secondary leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of both apps.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-content-primary mb-6'>
            Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-stroke-subtle'>
              <thead>
                <tr className='bg-surface-elevated'>
                  <th className='border border-stroke-subtle p-3 md:p-4 text-left text-content-primary'>
                    Feature
                  </th>
                  <th className='border border-stroke-subtle p-3 md:p-4 text-center text-content-brand font-medium'>
                    Lunary
                  </th>
                  <th className='border border-stroke-subtle p-3 md:p-4 text-center text-content-secondary'>
                    {competitorName}
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, index) => (
                  <tr
                    key={feature.name}
                    className={
                      index % 2 === 0
                        ? 'bg-surface-elevated/50'
                        : 'bg-surface-elevated/30'
                    }
                  >
                    <td className='border border-stroke-subtle p-3 md:p-4 text-content-secondary'>
                      <strong className='text-content-primary'>
                        {feature.name}
                      </strong>
                      {feature.description && (
                        <>
                          <br />
                          <span className='text-xs text-content-muted'>
                            {feature.description}
                          </span>
                        </>
                      )}
                    </td>
                    <td className='border border-stroke-subtle p-3 md:p-4 text-center'>
                      <FeatureCell value={feature.lunary} />
                    </td>
                    <td className='border border-stroke-subtle p-3 md:p-4 text-center'>
                      <FeatureCell value={feature.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-content-primary mb-6'>
            Why Choose Lunary?
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
            <div className='space-y-4'>
              {lunaryAdvantages.map((advantage) => (
                <div key={advantage.title} className='flex items-start gap-3'>
                  <Star className='h-5 w-5 text-lunary-primary-400 flex-shrink-0 mt-0.5' />
                  <div>
                    <h3 className='text-lg font-medium text-content-primary mb-1'>
                      {advantage.title}
                    </h3>
                    <p className='text-sm text-content-secondary leading-relaxed'>
                      {advantage.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-content-primary mb-6'>
            When {competitorName} Might Be Better
          </h2>
          <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-6'>
            <p className='text-sm text-content-secondary leading-relaxed'>
              {competitorStrengths}
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-content-primary mb-6'>
            Conclusion
          </h2>
          <div className='rounded-lg border border-lunary-primary-700 bg-layer-base/10 p-6'>
            <p className='text-sm text-content-secondary leading-relaxed'>
              {conclusion}
            </p>
          </div>
        </section>

        <section className='text-center mb-12'>
          <Link
            href='/pricing'
            className='inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 rounded-lg bg-layer-base/20 hover:bg-layer-base/30 border border-lunary-primary-700 text-content-brand font-medium text-base md:text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        <section className='mb-12'>
          <h2 className='text-xl md:text-2xl font-medium text-content-primary mb-6'>
            Explore the Lunary Grimoire
          </h2>
          <p className='text-sm text-content-muted mb-6'>
            Discover our comprehensive knowledge library that sets Lunary apart.
          </p>
          <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            <Link
              href='/grimoire/guides/birth-chart-complete-guide'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Birth Chart Guide
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Complete guide to reading your chart
              </p>
            </Link>
            <Link
              href='/grimoire/astronomy/planets'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Planetary Meanings
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Understand astrological planets
              </p>
            </Link>
            <Link
              href='/grimoire/tarot'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                78 Tarot Cards
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Major & Minor Arcana meanings
              </p>
            </Link>
            <Link
              href='/grimoire/crystals'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Crystal Guide
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Properties and correspondences
              </p>
            </Link>
            <Link
              href='/grimoire/zodiac'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                12 Zodiac Signs
              </span>
              <p className='text-xs text-content-muted mt-1'>
                Traits, dates, and compatibility
              </p>
            </Link>
            <Link
              href='/grimoire'
              className='p-4 bg-surface-elevated/50 border border-stroke-subtle rounded-lg hover:border-lunary-primary-600 transition-colors'
            >
              <span className='text-content-secondary font-medium'>
                Full Grimoire
              </span>
              <p className='text-xs text-content-muted mt-1'>
                500+ pages of cosmic wisdom
              </p>
            </Link>
          </div>
        </section>

        <section className='mt-12 pt-8 border-t border-stroke-subtle'>
          <p className='text-xs text-content-muted leading-relaxed'>
            <strong>Disclaimer:</strong>{' '}
            {disclaimer ||
              `This comparison is based on publicly available information as of 2025. Features and pricing may change. ${competitorName} is a registered trademark of its respective owner. This comparison is for informational purposes only and is not intended to disparage any competitor. We strive to be fair and accurate in our assessments.`}
          </p>
        </section>
      </div>
    </div>
  );
}
