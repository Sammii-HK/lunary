'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Mail,
  Users,
  Target,
  Loader2,
  Wand2,
} from 'lucide-react';

export default function AIConversionPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<any>({});

  const handleAction = async (type: string, data?: any) => {
    setLoading(type);
    try {
      const response = await fetch('/api/admin/ai-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });

      if (response.ok) {
        const result = await response.json();
        setResults((prev: any) => ({ ...prev, [type]: result }));
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        const errorMessage =
          errorData.error ||
          errorData.details ||
          `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorData);
        alert(
          `Failed to generate insights:\n\n${errorMessage}\n\nCheck console for details.`,
        );
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(
        `Failed to generate insights:\n\n${error.message || 'Network error or API unavailable'}\n\nCheck console for details.`,
      );
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div>
          <h1 className='text-3xl font-bold mb-2'>AI Conversion Optimizer</h1>
          <p className='text-content-muted'>
            Use AI to optimize conversions across your app
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6'>
          {/* Generate Personalized CTAs */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Zap className='w-5 h-5 text-lunary-primary-400' />
                <CardTitle>Generate CTAs</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                Generate personalized, conversion-optimized call-to-actions
              </p>
              <button
                onClick={() =>
                  handleAction('generate-cta', {
                    context: 'Pricing page, user viewing monthly plan',
                    goal: 'Start free trial',
                  })
                }
                disabled={loading === 'generate-cta'}
                className='w-full px-4 py-2 bg-lunary-primary-600 hover:bg-layer-high text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'generate-cta' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='w-4 h-4' />
                    Generate CTAs
                  </>
                )}
              </button>
              {results['generate-cta']?.ctas && (
                <div className='mt-4 p-3 bg-surface-card/50 rounded border border-stroke-default'>
                  <p className='text-xs text-content-muted mb-2'>
                    Generated CTAs:
                  </p>
                  <ul className='space-y-1'>
                    {results['generate-cta'].ctas.map(
                      (cta: string, idx: number) => (
                        <li
                          key={idx}
                          className='text-sm text-content-secondary'
                        >
                          • {cta}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Analyze Conversion Funnel */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <TrendingUp className='w-5 h-5 text-lunary-secondary' />
                <CardTitle>Analyze Funnel</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                AI-assisted analysis of your conversion funnel
              </p>
              <button
                onClick={() =>
                  handleAction('analyze-funnel', { timeRange: '30d' })
                }
                disabled={loading === 'analyze-funnel'}
                className='w-full px-4 py-2 bg-lunary-primary hover:bg-lunary-primary-400 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'analyze-funnel' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className='w-4 h-4' />
                    Analyze Funnel
                  </>
                )}
              </button>
              {results['analyze-funnel']?.analysis && (
                <div className='mt-4 p-3 bg-surface-card/50 rounded border border-stroke-default'>
                  {!results['analyze-funnel']?.dataAvailable && (
                    <div className='mb-3 p-2 bg-layer-deep border border-lunary-accent-900 rounded text-xs text-lunary-accent'>
                      ⚠️ No data available - analysis is based on general
                      recommendations only
                    </div>
                  )}
                  <p className='text-xs text-content-muted mb-2'>
                    AI Analysis:
                  </p>
                  <div className='text-sm text-content-secondary whitespace-pre-wrap'>
                    {results['analyze-funnel'].analysis}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Suggest A/B Tests */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Target className='w-5 h-5 text-lunary-success' />
                <CardTitle>Suggest A/B Tests</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                Get AI suggestions for new conversion tests
              </p>
              <button
                onClick={() =>
                  handleAction('suggest-tests', {
                    conversionGoals: ['Increase trial conversions'],
                  })
                }
                disabled={loading === 'suggest-tests'}
                className='w-full px-4 py-2 bg-lunary-success-600 hover:bg-lunary-success-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'suggest-tests' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Target className='w-4 h-4' />
                    Get Test Ideas
                  </>
                )}
              </button>
              {results['suggest-tests']?.suggestions && (
                <div className='mt-4 space-y-3'>
                  {results['suggest-tests']?.actualStats && (
                    <div className='p-2 bg-surface-card/70 rounded border border-stroke-default text-xs'>
                      <p className='text-content-muted mb-1'>
                        📊 Actual Stats (30d):
                      </p>
                      <div className='text-content-secondary space-y-0.5'>
                        <p>
                          Signups:{' '}
                          {results['suggest-tests'].actualStats.signups}
                        </p>
                        <p>
                          Trials: {results['suggest-tests'].actualStats.trials}
                        </p>
                        <p>
                          Conversions:{' '}
                          {results['suggest-tests'].actualStats.conversions}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className='p-3 bg-surface-card/50 rounded border border-stroke-default max-h-60 overflow-y-auto'>
                    <p className='text-xs text-content-muted mb-2'>
                      Suggested Tests:
                    </p>
                    <div className='space-y-3'>
                      {(Array.isArray(results['suggest-tests'].suggestions)
                        ? results['suggest-tests'].suggestions
                        : Object.values(results['suggest-tests'].suggestions)
                      )
                        .slice(0, 5)
                        .map((test: any, idx: number) => (
                          <div
                            key={idx}
                            className='text-xs text-content-secondary'
                          >
                            <p className='font-semibold text-content-primary mb-1'>
                              {test.name || test.testName || `Test ${idx + 1}`}
                            </p>
                            <p className='text-content-muted'>
                              {test.hypothesis || test.description}
                            </p>
                            {test.expectedImpact && (
                              <p className='text-lunary-accent text-xs mt-1'>
                                ⚠️ Note: Impact estimates are AI-generated
                                suggestions, not real predictions
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Optimize Email Copy */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Mail className='w-5 h-5 text-lunary-accent' />
                <CardTitle>Optimize Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                Optimize email copy for better conversions
              </p>
              <button
                onClick={() =>
                  handleAction('optimize-email', {
                    emailType: 'Trial Reminder',
                    currentCopy:
                      'Your trial is ending soon. Upgrade now to continue.',
                    goal: 'Convert trial users to paid',
                  })
                }
                disabled={loading === 'optimize-email'}
                className='w-full px-4 py-2 bg-lunary-accent-600 hover:bg-lunary-accent-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'optimize-email' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Mail className='w-4 h-4' />
                    Optimize Email
                  </>
                )}
              </button>
              {results['optimize-email']?.optimized && (
                <div className='mt-4 p-3 bg-surface-card/50 rounded border border-stroke-default'>
                  <p className='text-xs text-content-muted mb-2'>
                    Optimized Copy:
                  </p>
                  <div className='text-sm text-content-secondary space-y-2'>
                    {results['optimize-email'].optimized.subject && (
                      <div>
                        <span className='text-lunary-primary-400'>
                          Subject:
                        </span>{' '}
                        {results['optimize-email'].optimized.subject}
                      </div>
                    )}
                    {results['optimize-email'].optimized.body && (
                      <div>
                        <span className='text-lunary-primary-400'>Body:</span>
                        <div
                          className='mt-1 text-content-muted'
                          dangerouslySetInnerHTML={{
                            __html: results['optimize-email'].optimized.body,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Predict Churn */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Users className='w-5 h-5 text-lunary-error' />
                <CardTitle>Predict Churn</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                Identify users at risk of churning
              </p>
              <button
                onClick={() => handleAction('predict-churn', {})}
                disabled={loading === 'predict-churn'}
                className='w-full px-4 py-2 bg-lunary-error-600 hover:bg-lunary-error-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'predict-churn' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Users className='w-4 h-4' />
                    Analyze Churn Risk
                  </>
                )}
              </button>
              {results['predict-churn']?.predictions && (
                <div className='mt-4 p-3 bg-surface-card/50 rounded border border-stroke-default max-h-60 overflow-y-auto'>
                  <p className='text-xs text-content-muted mb-2'>
                    Churn Predictions:
                  </p>
                  <div className='text-sm text-content-secondary whitespace-pre-wrap'>
                    {typeof results['predict-churn'].predictions === 'string'
                      ? results['predict-churn'].predictions
                      : JSON.stringify(
                          results['predict-churn'].predictions,
                          null,
                          2,
                        )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personalize Experience */}
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardHeader>
              <div className='flex items-center gap-2'>
                <Wand2 className='w-5 h-5 text-lunary-rose' />
                <CardTitle>Personalize Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <p className='text-sm text-content-muted'>
                Get personalized experience recommendations
              </p>
              <input
                type='text'
                placeholder='User ID (optional)'
                className='w-full px-3 py-2 bg-surface-card border border-stroke-default rounded-lg text-content-primary text-sm'
                id='personalize-user-id'
              />
              <button
                onClick={() => {
                  const userId = (
                    document.getElementById(
                      'personalize-user-id',
                    ) as HTMLInputElement
                  )?.value;
                  handleAction('personalize-experience', {
                    userId: userId || undefined,
                    context: 'User viewing pricing page',
                  });
                }}
                disabled={loading === 'personalize-experience'}
                className='w-full px-4 py-2 bg-lunary-rose-600 hover:bg-lunary-rose-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
              >
                {loading === 'personalize-experience' ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wand2 className='w-4 h-4' />
                    Get Recommendations
                  </>
                )}
              </button>
              {results['personalize-experience']?.personalization && (
                <div className='mt-4 p-3 bg-surface-card/50 rounded border border-stroke-default'>
                  <p className='text-xs text-content-muted mb-2'>
                    Personalization Strategy:
                  </p>
                  <div className='text-sm text-content-secondary whitespace-pre-wrap'>
                    {typeof results['personalize-experience']
                      .personalization === 'string'
                      ? results['personalize-experience'].personalization
                      : JSON.stringify(
                          results['personalize-experience'].personalization,
                          null,
                          2,
                        )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
