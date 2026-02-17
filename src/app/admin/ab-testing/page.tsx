'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Sparkles,
  Loader2,
  CheckCircle,
  Zap,
  Trophy,
} from 'lucide-react';

interface VariantMetrics {
  name: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

interface ABTestResult {
  testName: string;
  variants: VariantMetrics[];
  bestVariant: string | null;
  improvement: number | null;
  confidence: number;
  isSignificant: boolean;
  recommendation: string;
  totalImpressions: number;
  totalConversions: number;
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [autoSuggestions, setAutoSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [applyingChanges, setApplyingChanges] = useState<string | null>(null);

  const loadAutoSuggestions = useCallback(async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/admin/ab-testing/auto-apply?timeRange=${timeRange}`,
      );
      if (response.ok) {
        const data = await response.json();
        setAutoSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to load auto-suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [timeRange]);

  const loadABTests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/ab-testing?timeRange=${timeRange}`,
      );
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Failed to load A/B tests:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadABTests();
    loadAutoSuggestions();
  }, [loadABTests, loadAutoSuggestions]);

  const applyChanges = async (suggestion: any) => {
    if (
      !confirm(
        `Apply changes for ${suggestion.testName}? This will update the code to use Variant ${suggestion.suggestedVariant}.`,
      )
    ) {
      return;
    }

    setApplyingChanges(suggestion.testName);
    try {
      const response = await fetch('/api/admin/ab-testing/auto-apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: suggestion.testName,
          variant: suggestion.suggestedVariant,
          changes: suggestion.changes,
        }),
      });

      if (response.ok) {
        alert(`✅ Changes for ${suggestion.testName} have been queued!`);
        loadAutoSuggestions();
      } else {
        alert('Failed to apply changes');
      }
    } catch (error) {
      console.error('Failed to apply changes:', error);
      alert('Failed to apply changes');
    } finally {
      setApplyingChanges(null);
    }
  };

  const loadAIInsights = async (test: ABTestResult) => {
    setLoadingInsights(true);
    setSelectedTest(test.testName);
    try {
      const response = await fetch('/api/admin/ab-testing/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: test.testName,
          variants: test.variants,
          timeRange,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const getTestDisplayName = (testName: string): string => {
    const names: Record<string, string> = {
      cta_copy: 'CTA Copy Variations',
      paywall_preview: 'Paywall Preview Style',
      homepage_features: 'Homepage Features',
      feature_preview: 'Feature Preview Blur',
      transit_overflow: 'Transit Overflow Style',
      weekly_lock: 'Weekly Tarot Lock Style',
      tarot_truncation: 'Tarot Truncation Length',
      transit_limit: 'Free User Transit Limit',
      inline_cta: 'Inline CTA Visibility',
    };
    return names[testName] || testName;
  };

  const formatVariantName = (name: string): string => {
    // Convert kebab-case or snake_case to Title Case
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>A/B Testing Analytics</h1>
            <p className='text-zinc-400'>
              Analyze conversion experiments and get AI-assisted insights
            </p>
          </div>
          {autoSuggestions.length > 0 && (
            <Badge className='bg-lunary-primary-900/20 text-lunary-primary-300 border-lunary-primary-700'>
              {autoSuggestions.length} Auto-Suggestions Available
            </Badge>
          )}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-zinc-100'
          >
            <option value='7d'>Last 7 days</option>
            <option value='30d'>Last 30 days</option>
            <option value='90d'>Last 90 days</option>
          </select>
        </div>

        {loading ? (
          <div className='flex items-center justify-center py-20'>
            <Loader2 className='w-8 h-8 animate-spin text-lunary-primary-400' />
          </div>
        ) : tests.length === 0 ? (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-8 text-center'>
              <BarChart3 className='w-12 h-12 text-zinc-600 mx-auto mb-4' />
              <p className='text-zinc-400'>
                No A/B tests found. Start testing to see results here.
              </p>
              <p className='text-zinc-500 text-sm mt-2'>
                Events need to include abTest and abVariant in metadata.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {/* Auto-Apply Suggestions */}
            {autoSuggestions.length > 0 && (
              <Card className='bg-gradient-to-r from-lunary-primary-900/40 to-pink-900/40 border-lunary-primary-700'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Zap className='w-5 h-5 text-lunary-primary-300' />
                    <CardTitle className='text-xl'>
                      Automated Recommendations
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {autoSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className='p-4 bg-zinc-900/50 rounded-lg border border-zinc-700'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-semibold text-white mb-1'>
                            {getTestDisplayName(suggestion.testName)}
                          </h4>
                          <p className='text-sm text-zinc-300'>
                            {suggestion.reason}
                          </p>
                        </div>
                        <Badge className='bg-lunary-success-900 text-lunary-success border-lunary-success-800'>
                          {suggestion.confidence.toFixed(1)}% confidence
                        </Badge>
                      </div>

                      {suggestion.changes.length > 0 && (
                        <div className='mb-3 p-3 bg-zinc-800/50 rounded border border-zinc-700'>
                          <p className='text-xs text-zinc-400 mb-2'>
                            Proposed Changes:
                          </p>
                          {suggestion.changes.map(
                            (change: any, cIdx: number) => (
                              <div
                                key={cIdx}
                                className='text-xs text-zinc-300 mb-2'
                              >
                                <span className='text-lunary-primary-400'>
                                  {change.file}
                                </span>
                                <p className='text-zinc-400 mt-1'>
                                  {change.description}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      )}

                      <button
                        onClick={() => applyChanges(suggestion)}
                        disabled={applyingChanges === suggestion.testName}
                        className='w-full px-4 py-2 bg-lunary-success-600 hover:bg-lunary-success-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                      >
                        {applyingChanges === suggestion.testName ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            Applying...
                          </>
                        ) : (
                          <>
                            <CheckCircle className='w-4 h-4' />
                            Apply Changes
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {tests.map((test) => (
              <Card key={test.testName} className='bg-zinc-900 border-zinc-800'>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-xl'>
                        {getTestDisplayName(test.testName)}
                      </CardTitle>
                      <p className='text-sm text-zinc-500 mt-1'>
                        {test.totalImpressions.toLocaleString()} impressions ·{' '}
                        {test.totalConversions.toLocaleString()} conversions
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {test.bestVariant && test.isSignificant && (
                        <Badge className='bg-lunary-accent-900/50 text-lunary-accent-300 border-lunary-accent-700'>
                          <Trophy className='w-3 h-3 mr-1' />
                          {formatVariantName(test.bestVariant)}
                        </Badge>
                      )}
                      <Badge
                        className={
                          test.isSignificant
                            ? 'bg-lunary-success-900 text-lunary-success border-lunary-success-800'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }
                      >
                        {test.isSignificant
                          ? `${test.confidence.toFixed(1)}% confidence`
                          : test.recommendation.startsWith('Need more data')
                            ? 'Insufficient data'
                            : `${test.confidence.toFixed(1)}% confidence`}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Variants Grid */}
                  <div
                    className={`grid gap-4 ${
                      test.variants.length === 2
                        ? 'md:grid-cols-2'
                        : test.variants.length === 3
                          ? 'md:grid-cols-3'
                          : 'md:grid-cols-2 lg:grid-cols-4'
                    }`}
                  >
                    {test.variants.map((variant, idx) => {
                      const isWinner = variant.name === test.bestVariant;
                      const validRates = test.variants
                        .map((v) => v.conversionRate)
                        .filter((r): r is number => r !== null);
                      const hasHighestRate =
                        variant.conversionRate !== null &&
                        validRates.length > 0 &&
                        variant.conversionRate === Math.max(...validRates);
                      const hasLowestRate =
                        variant.conversionRate !== null &&
                        validRates.length > 0 &&
                        variant.conversionRate === Math.min(...validRates) &&
                        variant.impressions > 0;

                      return (
                        <div
                          key={variant.name}
                          className={`p-4 rounded-lg border ${
                            isWinner && test.isSignificant
                              ? 'bg-lunary-success-900/20 border-lunary-success-700'
                              : 'bg-zinc-800/50 border-zinc-700'
                          }`}
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <h3 className='font-semibold text-zinc-200'>
                              {formatVariantName(variant.name)}
                            </h3>
                            {hasHighestRate && variant.impressions > 0 ? (
                              <TrendingUp className='w-5 h-5 text-lunary-success' />
                            ) : hasLowestRate ? (
                              <TrendingDown className='w-5 h-5 text-lunary-error' />
                            ) : null}
                          </div>
                          <div className='space-y-2'>
                            <div className='flex justify-between text-sm'>
                              <span className='text-zinc-400'>
                                Impressions:
                              </span>
                              <span className='text-zinc-200 font-medium'>
                                {variant.impressions.toLocaleString()}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-zinc-400'>
                                Conversions:
                              </span>
                              <span className='text-zinc-200 font-medium'>
                                {variant.conversions.toLocaleString()}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-zinc-400'>
                                Conversion Rate:
                              </span>
                              <span
                                className={`font-bold ${
                                  isWinner && test.isSignificant
                                    ? 'text-lunary-success'
                                    : variant.conversionRate === null
                                      ? 'text-zinc-500'
                                      : 'text-lunary-primary-400'
                                }`}
                              >
                                {variant.conversionRate !== null
                                  ? `${variant.conversionRate.toFixed(2)}%`
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Improvement */}
                  <div className='p-4 bg-lunary-primary-900/10 border border-lunary-primary-700 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Sparkles className='w-5 h-5 text-lunary-primary-400' />
                      {test.improvement !== null ? (
                        <span className='font-semibold text-lunary-primary-300'>
                          Best vs Runner-up: {test.improvement > 0 ? '+' : ''}
                          {test.improvement.toFixed(2)}%
                        </span>
                      ) : (
                        <span className='font-semibold text-zinc-400'>
                          Not enough data to compare
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-zinc-300'>
                      {test.recommendation}
                    </p>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <button
                      onClick={() => loadAIInsights(test)}
                      disabled={loadingInsights}
                      className='w-full px-4 py-2 bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                    >
                      {loadingInsights && selectedTest === test.testName ? (
                        <>
                          <Loader2 className='w-4 h-4 animate-spin' />
                          Generating insights...
                        </>
                      ) : (
                        <>
                          <Sparkles className='w-4 h-4' />
                          Get AI-Powered Insights
                        </>
                      )}
                    </button>

                    {selectedTest === test.testName && aiInsights && (
                      <div className='mt-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg'>
                        <h4 className='font-semibold text-lunary-primary-300 mb-2'>
                          AI Analysis
                        </h4>
                        <div className='text-sm text-zinc-300 whitespace-pre-wrap'>
                          {aiInsights}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
