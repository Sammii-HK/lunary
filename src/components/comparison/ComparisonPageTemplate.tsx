import Link from 'next/link';
import { Check, X, ArrowRight, Star } from 'lucide-react';
import { ComparisonPageStructuredData } from '@/components/ComparisonPageStructuredData';

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
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value.type === 'check') {
    return <Check className='h-5 w-5 text-lunary-success mx-auto' />;
  }
  if (value.type === 'x') {
    return <X className='h-5 w-5 text-zinc-500 mx-auto' />;
  }
  return (
    <span
      className={
        value.highlight
          ? 'text-lunary-success font-medium text-sm'
          : 'text-zinc-500 text-sm'
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
  } = data;

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      <ComparisonPageStructuredData
        competitorName={competitorName}
        featuresCompared={featuresCompared}
        conclusion={conclusion}
      />
      <div className='max-w-4xl mx-auto px-4 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-light text-zinc-100 mb-4'>{tagline}</h1>
          <p className='text-lg text-zinc-400'>{subtitle}</p>
        </div>

        <div className='mb-8 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <p className='text-sm text-zinc-300 leading-relaxed'>
            <strong>Note:</strong> This comparison is based on publicly
            available information and focuses on factual differences. We aim to
            be fair and accurate in our assessment of both apps.
          </p>
        </div>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            Feature Comparison
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse border border-zinc-800'>
              <thead>
                <tr className='bg-zinc-900'>
                  <th className='border border-zinc-800 p-4 text-left text-zinc-200'>
                    Feature
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-lunary-primary-300 font-medium'>
                    Lunary
                  </th>
                  <th className='border border-zinc-800 p-4 text-center text-zinc-300'>
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
                    <td className='border border-zinc-800 p-4 text-zinc-300'>
                      <strong className='text-zinc-100'>{feature.name}</strong>
                      {feature.description && (
                        <>
                          <br />
                          <span className='text-xs text-zinc-500'>
                            {feature.description}
                          </span>
                        </>
                      )}
                    </td>
                    <td className='border border-zinc-800 p-4 text-center'>
                      <FeatureCell value={feature.lunary} />
                    </td>
                    <td className='border border-zinc-800 p-4 text-center'>
                      <FeatureCell value={feature.competitor} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
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
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
            When {competitorName} Might Be Better
          </h2>
          <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6'>
            <p className='text-sm text-zinc-300 leading-relaxed'>
              {competitorStrengths}
            </p>
          </div>
        </section>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-6'>
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
            className='inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium text-lg transition-colors'
          >
            Start Your Free Trial
            <ArrowRight className='h-5 w-5' />
          </Link>
        </section>

        <section className='mt-12 pt-8 border-t border-zinc-800'>
          <p className='text-xs text-zinc-500 leading-relaxed'>
            <strong>Disclaimer:</strong>{' '}
            {disclaimer ||
              `This comparison is based on publicly available information as of 2025. Features and pricing may change. ${competitorName} is a registered trademark of its respective owner. This comparison is for informational purposes only and is not intended to disparage any competitor. We strive to be fair and accurate in our assessments.`}
          </p>
        </section>
      </div>
    </div>
  );
}
