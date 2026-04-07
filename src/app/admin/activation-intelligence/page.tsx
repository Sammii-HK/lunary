'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/Heading';
import { AlertCircle, TrendingUp, Target, Zap, RefreshCw } from 'lucide-react';

interface FunnelMetrics {
  totalFreeUsers: number;
  freeUsersL30d: number;
  trialSignups: number;
  trialConversionRate: number; // %
  paidUsers: number;
  paidConversionRate: number; // %
  avgDaysToTrial: number;
  avgDaysTrialToPaid: number;
}

interface Recommendation {
  id: number;
  recommendation: string;
  category: 'bottleneck' | 'strategy' | 'test' | 'segment';
  priority: 'high' | 'medium' | 'low';
  impact_estimate: string | null;
  segment: string | null;
  suggested_test: string | null;
  status: string;
  generated_by: string | null;
}

export default function ActivationIntelligence() {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const [metricsRes, recsRes] = await Promise.all([
        fetch('/api/admin/activation/metrics'),
        fetch('/api/admin/activation/recommendations'),
      ]);

      const metricsData = await metricsRes.json();
      const recsData = await recsRes.json();

      setMetrics(metricsData);
      setRecommendations(recsData.recommendations || []);
      setLastRun(metricsData.timestamp || new Date().toISOString());
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/activation/run', { method: 'POST' });
      if (res.ok) {
        await new Promise((r) => setTimeout(r, 2000)); // Wait for analysis
        fetchMetrics();
      }
    } catch (err) {
      console.error('Failed to trigger analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className='space-y-4 p-6'>
        <Heading as='h1' variant='h1'>
          Activation Intelligence
        </Heading>
        <p className='text-sm text-gray-400'>Loading funnel metrics...</p>
      </div>
    );
  }

  const funnelStages = metrics
    ? [
        {
          label: 'Free Users (30d)',
          value: metrics.freeUsersL30d,
          color: 'bg-blue-500',
        },
        {
          label: 'Trial Signups',
          value: metrics.trialSignups,
          rate: metrics.trialConversionRate,
          color: 'bg-purple-500',
        },
        {
          label: 'Paid Users',
          value: metrics.paidUsers,
          rate: metrics.paidConversionRate,
          color: 'bg-green-500',
        },
      ]
    : [];

  const bottlenecks = recommendations.filter(
    (r) => r.category === 'bottleneck' && r.status === 'active',
  );
  const tests = recommendations.filter(
    (r) => r.category === 'test' && r.status === 'active',
  );
  const strategies = recommendations.filter((r) => r.category === 'strategy');

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <div>
          <Heading as='h1' variant='h1'>
            Activation Intelligence
          </Heading>
          <p className='text-sm text-gray-400'>
            Real-time funnel analysis & optimization recommendations
          </p>
        </div>
        <Button onClick={triggerAnalysis} disabled={loading} className='gap-2'>
          <RefreshCw className='w-4 h-4' />
          Run Analysis
        </Button>
      </div>

      {lastRun && (
        <p className='text-xs text-gray-500'>
          Last run: {new Date(lastRun).toLocaleString()}
        </p>
      )}

      {/* Funnel Metrics */}
      {metrics && (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {funnelStages.map((stage, i) => (
            <Card key={i} className='border-gray-800'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm font-medium'>
                  {stage.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  {stage.value.toLocaleString()}
                </div>
                {stage.rate !== undefined && (
                  <p className='text-xs text-gray-400 mt-1'>
                    {stage.rate.toFixed(1)}% conversion
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Conversion Timeline */}
      {metrics && (
        <div className='grid grid-cols-2 gap-4'>
          <Card className='border-gray-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Avg Time to Trial</CardTitle>
            </CardHeader>
            <CardContent className='text-xl font-semibold'>
              {metrics.avgDaysToTrial} days
            </CardContent>
          </Card>
          <Card className='border-gray-800'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-sm'>Trial to Paid</CardTitle>
            </CardHeader>
            <CardContent className='text-xl font-semibold'>
              {metrics.avgDaysTrialToPaid} days
            </CardContent>
          </Card>
        </div>
      )}

      {/* Critical Bottlenecks */}
      {bottlenecks.length > 0 && (
        <Card className='border-red-900 bg-red-950/20'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <AlertCircle className='w-5 h-5 text-red-400' />
              <CardTitle>Critical Bottlenecks</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {bottlenecks.map((rec) => (
              <div key={rec.id} className='border-l-2 border-red-500 pl-3'>
                <p className='font-medium text-sm'>{rec.recommendation}</p>
                {rec.impact_estimate && (
                  <p className='text-xs text-gray-400 mt-1'>
                    Impact: {rec.impact_estimate}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommended A/B Tests */}
      {tests.length > 0 && (
        <Card className='border-gray-800'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Zap className='w-5 h-5 text-yellow-400' />
              <CardTitle>Recommended A/B Tests</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            {tests.map((rec) => (
              <div
                key={rec.id}
                className='p-3 bg-surface-elevated/50 rounded border border-gray-800'
              >
                <div className='flex items-start justify-between mb-2'>
                  <p className='font-medium text-sm'>{rec.recommendation}</p>
                  <Badge
                    variant={
                      rec.priority === 'high' ? 'destructive' : 'secondary'
                    }
                    className='text-xs'
                  >
                    {rec.priority}
                  </Badge>
                </div>
                {rec.suggested_test && (
                  <p className='text-xs text-gray-400 mb-2'>
                    {rec.suggested_test}
                  </p>
                )}
                {rec.segment && (
                  <p className='text-xs text-blue-400'>
                    Segment: {rec.segment}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Activation Strategies */}
      {strategies.length > 0 && (
        <Card className='border-gray-800'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Target className='w-5 h-5 text-green-400' />
              <CardTitle>Activation Strategies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className='space-y-3'>
            {strategies.slice(0, 5).map((rec) => (
              <div key={rec.id} className='flex items-start gap-2'>
                <TrendingUp className='w-4 h-4 mt-0.5 text-green-400 flex-shrink-0' />
                <div>
                  <p className='text-sm'>{rec.recommendation}</p>
                  {rec.segment && (
                    <p className='text-xs text-gray-500 mt-1'>
                      For: {rec.segment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card className='border-gray-800'>
          <CardContent className='pt-6 text-center text-gray-400'>
            <p className='text-sm'>Run analysis to generate recommendations</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
