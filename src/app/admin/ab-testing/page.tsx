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
  XCircle,
  Zap,
} from 'lucide-react';

interface ABTestResult {
  testName: string;
  variantA: {
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  variantB: {
    name: string;
    impressions: number;
    conversions: number;
    conversionRate: number;
  };
  improvement: number;
  confidence: number;
  isSignificant: boolean;
  recommendation: string;
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
        loadAutoSuggestions(); // Reload to remove applied suggestion
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
          variantA: test.variantA,
          variantB: test.variantB,
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
      pricing_cta: 'Pricing CTA Text',
      pricing_price: 'Pricing Display',
      onboarding_flow: 'Onboarding Flow',
      upgrade_prompt: 'Upgrade Prompt',
    };
    return names[testName] || testName;
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>A/B Testing Analytics</h1>
            <p className='text-zinc-400'>
              Analyze conversion experiments and get AI-powered insights
            </p>
          </div>
          {autoSuggestions.length > 0 && (
            <Badge className='bg-purple-500/20 text-purple-300 border-purple-500/30'>
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
            <Loader2 className='w-8 h-8 animate-spin text-purple-400' />
          </div>
        ) : tests.length === 0 ? (
          <Card className='bg-zinc-900 border-zinc-800'>
            <CardContent className='p-8 text-center'>
              <BarChart3 className='w-12 h-12 text-zinc-600 mx-auto mb-4' />
              <p className='text-zinc-400'>
                No A/B tests found. Start testing to see results here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-6'>
            {/* Auto-Apply Suggestions */}
            {autoSuggestions.length > 0 && (
              <Card className='bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30'>
                <CardHeader>
                  <div className='flex items-center gap-2'>
                    <Zap className='w-5 h-5 text-purple-300' />
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
                        <Badge className='bg-green-500/20 text-green-400 border-green-500/30'>
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
                                <span className='text-purple-400'>
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
                        className='w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
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
                    <CardTitle className='text-xl'>
                      {getTestDisplayName(test.testName)}
                    </CardTitle>
                    <Badge
                      className={
                        test.isSignificant
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }
                    >
                      {test.confidence.toFixed(1)}% confidence
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* Variant A */}
                    <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-semibold text-zinc-200'>
                          {test.variantA.name}
                        </h3>
                        {test.variantA.conversionRate >
                        test.variantB.conversionRate ? (
                          <TrendingUp className='w-5 h-5 text-green-400' />
                        ) : (
                          <TrendingDown className='w-5 h-5 text-red-400' />
                        )}
                      </div>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>Impressions:</span>
                          <span className='text-zinc-200 font-medium'>
                            {test.variantA.impressions}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>Conversions:</span>
                          <span className='text-zinc-200 font-medium'>
                            {test.variantA.conversions}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>
                            Conversion Rate:
                          </span>
                          <span className='text-purple-400 font-bold'>
                            {test.variantA.conversionRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className='p-4 bg-zinc-800/50 rounded-lg border border-zinc-700'>
                      <div className='flex items-center justify-between mb-3'>
                        <h3 className='font-semibold text-zinc-200'>
                          {test.variantB.name}
                        </h3>
                        {test.variantB.conversionRate >
                        test.variantA.conversionRate ? (
                          <TrendingUp className='w-5 h-5 text-green-400' />
                        ) : (
                          <TrendingDown className='w-5 h-5 text-red-400' />
                        )}
                      </div>
                      <div className='space-y-2'>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>Impressions:</span>
                          <span className='text-zinc-200 font-medium'>
                            {test.variantB.impressions}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>Conversions:</span>
                          <span className='text-zinc-200 font-medium'>
                            {test.variantB.conversions}
                          </span>
                        </div>
                        <div className='flex justify-between text-sm'>
                          <span className='text-zinc-400'>
                            Conversion Rate:
                          </span>
                          <span className='text-purple-400 font-bold'>
                            {test.variantB.conversionRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Improvement */}
                  <div className='p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg'>
                    <div className='flex items-center gap-2 mb-2'>
                      <Sparkles className='w-5 h-5 text-purple-400' />
                      <span className='font-semibold text-purple-300'>
                        Improvement: {test.improvement > 0 ? '+' : ''}
                        {test.improvement.toFixed(2)}%
                      </span>
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
                      className='w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
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
                        <h4 className='font-semibold text-purple-300 mb-2'>
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
