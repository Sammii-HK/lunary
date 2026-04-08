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

interface HubMetrics {
  hub: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<ABTestResult[]>([]);
  const [hubSummary, setHubSummary] = useState<HubMetrics[]>([]);
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
        setHubSummary(data.hubSummary || []);
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
      cta_copy: 'CTA Copy (In-App, PostHog)',
      paywall_preview: 'Paywall Preview Style',
      homepage_features: 'Homepage Features',
      feature_preview: 'Feature Preview Blur',
      transit_overflow: 'Transit Overflow Style',
      weekly_lock: 'Weekly Tarot Lock Style',
      tarot_truncation: 'Tarot Truncation Length',
      transit_limit: 'Free User Transit Limit',
      inline_cta: 'Inline CTA Visibility',
      grimoire_signup_page: 'Grimoire Signup Page',
    };
    if (names[testName]) return names[testName];

    // Per-hub CTA tests: seo_cta_{hub} or seo_sticky_cta_{hub}
    const stickyMatch = testName.match(/^seo_sticky_cta_(.+)$/);
    if (stickyMatch) {
      return `Sticky CTA · ${formatHubName(stickyMatch[1])}`;
    }
    const ctaMatch = testName.match(/^seo_cta_(.+)$/);
    if (ctaMatch) {
      return `SEO CTA · ${formatHubName(ctaMatch[1])}`;
    }

    return testName;
  };

  const formatHubName = (hub: string): string => {
    const hubNames: Record<string, string> = {
      horoscopes: 'Horoscopes',
      astrology: 'Astrology',
      transits: 'Transits',
      numerology: 'Numerology',
      tarot: 'Tarot',
      moon: 'Moon',
      houses: 'Houses',
      planets: 'Planets',
      aspects: 'Aspects',
      crystals: 'Crystals',
      spells: 'Spells & Rituals',
      angelNumbers: 'Angel Numbers',
      clockNumbers: 'Clock Numbers',
      cosmicTiming: 'Cosmic Timing',
      symbolicSystems: 'Symbolic Systems',
      grimoireReference: 'Grimoire (General)',
      modernWitchcraft: 'Modern Witchcraft',
      personalContext: 'Personal Context',
      weeklyForecast: 'Weekly Forecast',
      universal: 'Universal',
      tarotSpreadsIndex: 'Tarot Spreads Index',
      tarotSpreadsDetail: 'Tarot Spread Detail',
    };
    return hubNames[hub] || hub;
  };

  const formatVariantName = (name: string): string => {
    // Numeric variants from per-hub CTA tests → "Copy A", "Copy B", etc.
    if (/^\d+$/.test(name)) {
      const letter = String.fromCharCode(65 + parseInt(name)); // 0→A, 1→B, etc.
      return `Copy ${letter}`;
    }
    // Convert kebab-case or snake_case to Title Case
    return name
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className='min-h-screen bg-surface-base text-content-primary p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>A/B Testing Analytics</h1>
            <p className='text-content-muted'>
              Analyze conversion experiments and get AI-assisted insights
            </p>
          </div>
          {autoSuggestions.length > 0 && (
            <Badge className='bg-layer-base/20 text-content-brand border-lunary-primary-700'>
              {autoSuggestions.length} Auto-Suggestions Available
            </Badge>
          )}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className='px-4 py-2 bg-surface-elevated border border-stroke-default rounded-lg text-content-primary'
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
          <Card className='bg-surface-elevated border-stroke-subtle'>
            <CardContent className='p-8 text-center'>
              <BarChart3 className='w-12 h-12 text-content-muted mx-auto mb-4' />
              <p className='text-content-muted'>
                No A/B tests found. Start testing to see results here.
              </p>
              <p className='text-content-muted text-sm mt-2'>
                Events need to include abTest and abVariant in metadata.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {/* Hub Conversion Summary */}
            {hubSummary.length > 0 && (
              <Card className='bg-surface-elevated border-stroke-subtle'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <BarChart3 className='w-5 h-5 text-lunary-primary-400' />
                    <CardTitle className='text-xl'>
                      Hub Conversion Summary
                    </CardTitle>
                  </div>
                  <p className='text-sm text-content-muted'>
                    Which grimoire sections convert SEO visitors best
                    (contextual nudge + sticky CTA combined)
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='grid gap-2'>
                    {hubSummary.map((hub) => {
                      const maxRate = Math.max(
                        ...hubSummary
                          .filter((h) => h.impressions >= 20)
                          .map((h) => h.conversionRate),
                        1,
                      );
                      const barWidth =
                        hub.impressions >= 20
                          ? (hub.conversionRate / maxRate) * 100
                          : 0;

                      return (
                        <div
                          key={hub.hub}
                          className='flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-surface-card/50'
                        >
                          <span className='text-sm text-content-secondary w-40 shrink-0'>
                            {formatHubName(hub.hub)}
                          </span>
                          <div className='flex-1 h-6 bg-surface-card rounded-full overflow-hidden relative'>
                            <div
                              className='h-full bg-lunary-primary-600 rounded-full transition-all'
                              style={{ width: `${Math.max(barWidth, 1)}%` }}
                            />
                          </div>
                          <span className='text-sm font-mono text-content-brand w-16 text-right'>
                            {hub.conversionRate.toFixed(1)}%
                          </span>
                          <span className='text-xs text-content-muted w-24 text-right'>
                            {hub.conversions}/{hub.impressions.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Auto-Apply Suggestions */}
            {autoSuggestions.length > 0 && (
              <Card className='bg-gradient-to-r from-layer-base/40 to-pink-900/40 border-lunary-primary-700'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Zap className='w-5 h-5 text-content-brand' />
                    <CardTitle className='text-xl'>
                      Automated Recommendations
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {autoSuggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className='p-4 bg-surface-elevated/50 rounded-lg border border-stroke-default'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <h4 className='font-semibold text-content-primary mb-1'>
                            {getTestDisplayName(suggestion.testName)}
                          </h4>
                          <p className='text-sm text-content-secondary'>
                            {suggestion.reason}
                          </p>
                        </div>
                        <Badge className='bg-layer-base text-lunary-success border-lunary-success-800'>
                          {suggestion.confidence.toFixed(1)}% confidence
                        </Badge>
                      </div>

                      {suggestion.changes.length > 0 && (
                        <div className='mb-3 p-3 bg-surface-card/50 rounded border border-stroke-default'>
                          <p className='text-xs text-content-muted mb-2'>
                            Proposed Changes:
                          </p>
                          {suggestion.changes.map(
                            (change: any, cIdx: number) => (
                              <div
                                key={cIdx}
                                className='text-xs text-content-secondary mb-2'
                              >
                                <span className='text-lunary-primary-400'>
                                  {change.file}
                                </span>
                                <p className='text-content-muted mt-1'>
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
              <Card
                key={test.testName}
                className='bg-surface-elevated border-stroke-subtle'
              >
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle className='text-xl'>
                        {getTestDisplayName(test.testName)}
                      </CardTitle>
                      <p className='text-sm text-content-muted mt-1'>
                        {test.totalImpressions.toLocaleString()} impressions ·{' '}
                        {test.totalConversions.toLocaleString()} conversions
                      </p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {test.bestVariant && test.isSignificant && (
                        <Badge className='bg-layer-base/50 text-content-brand-accent border-lunary-accent-700'>
                          <Trophy className='w-3 h-3 mr-1' />
                          {formatVariantName(test.bestVariant)}
                        </Badge>
                      )}
                      <Badge
                        className={
                          test.isSignificant
                            ? 'bg-layer-base text-lunary-success border-lunary-success-800'
                            : 'bg-surface-card text-content-muted border-stroke-default'
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
                              ? 'bg-layer-base/20 border-lunary-success-700'
                              : 'bg-surface-card/50 border-stroke-default'
                          }`}
                        >
                          <div className='flex items-center justify-between mb-3'>
                            <h3 className='font-semibold text-content-primary'>
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
                              <span className='text-content-muted'>
                                Impressions:
                              </span>
                              <span className='text-content-primary font-medium'>
                                {variant.impressions.toLocaleString()}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-content-muted'>
                                Conversions:
                              </span>
                              <span className='text-content-primary font-medium'>
                                {variant.conversions.toLocaleString()}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span className='text-content-muted'>
                                Conversion Rate:
                              </span>
                              <span
                                className={`font-bold ${
                                  isWinner && test.isSignificant
                                    ? 'text-lunary-success'
                                    : variant.conversionRate === null
                                      ? 'text-content-muted'
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
                  <div className='p-4 bg-layer-base/10 border border-lunary-primary-700 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Sparkles className='w-5 h-5 text-lunary-primary-400' />
                      {test.improvement !== null ? (
                        <span className='font-semibold text-content-brand'>
                          Best vs Runner-up: {test.improvement > 0 ? '+' : ''}
                          {test.improvement.toFixed(2)}%
                        </span>
                      ) : (
                        <span className='font-semibold text-content-muted'>
                          Not enough data to compare
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-content-secondary'>
                      {test.recommendation}
                    </p>
                  </div>

                  {/* AI Insights */}
                  <div>
                    <button
                      onClick={() => loadAIInsights(test)}
                      disabled={loadingInsights}
                      className='w-full px-4 py-2 bg-lunary-primary-600 hover:bg-layer-high text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
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
                      <div className='mt-4 p-4 bg-surface-card/50 border border-stroke-default rounded-lg'>
                        <h4 className='font-semibold text-content-brand mb-2'>
                          AI Analysis
                        </h4>
                        <div className='text-sm text-content-secondary whitespace-pre-wrap'>
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
