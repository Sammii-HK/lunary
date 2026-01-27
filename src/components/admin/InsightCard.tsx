'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Insight } from '@/lib/analytics/insights';

interface InsightCardProps {
  insight: Insight;
}

export function InsightCard({ insight }: InsightCardProps) {
  const iconMap = {
    positive: CheckCircle,
    warning: AlertTriangle,
    critical: AlertCircle,
    info: Info,
  };

  const Icon = iconMap[insight.type];

  const colorClasses = {
    positive: {
      icon: 'text-lunary-success-300',
      bg: 'bg-lunary-success-950/20',
      border: 'border-lunary-success-800/30',
      badge: 'success' as const,
    },
    warning: {
      icon: 'text-yellow-300',
      bg: 'bg-yellow-950/20',
      border: 'border-yellow-800/30',
      badge: 'warning' as const,
    },
    critical: {
      icon: 'text-lunary-error-300',
      bg: 'bg-lunary-error-950/20',
      border: 'border-lunary-error-800/30',
      badge: 'destructive' as const,
    },
    info: {
      icon: 'text-lunary-primary-300',
      bg: 'bg-lunary-primary-950/20',
      border: 'border-lunary-primary-800/30',
      badge: 'default' as const,
    },
  };

  const colors = colorClasses[insight.type];

  const priorityLabels = {
    urgent: 'Urgent',
    high: 'High Priority',
    medium: 'Medium',
    low: 'Low',
  };

  return (
    <Card className={`${colors.bg} ${colors.border}`}>
      <CardContent className='pt-6'>
        <div className='flex items-start gap-4'>
          <div className='flex-shrink-0'>
            <Icon className={`h-5 w-5 ${colors.icon}`} />
          </div>
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between gap-2 mb-2'>
              <div className='text-sm font-medium text-white'>
                {insight.message}
              </div>
              <Badge variant={colors.badge} className='flex-shrink-0 text-xs'>
                {priorityLabels[insight.priority]}
              </Badge>
            </div>

            {insight.metric && (
              <div className='mt-2 text-xs text-zinc-400'>
                <span className='text-zinc-500'>{insight.metric.label}:</span>{' '}
                <span className='text-white font-medium'>
                  {insight.metric.value}
                </span>
              </div>
            )}

            {insight.action && (
              <div className='mt-3 text-xs text-zinc-300'>
                <span className='text-zinc-500'>Action:</span> {insight.action}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
