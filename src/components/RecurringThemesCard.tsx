import { Sparkles } from 'lucide-react';
import {
  getTrendIcon,
  getTrendColor,
} from '@/lib/patterns/utils/pattern-formatters';

type RecurringThemeItem = {
  label: string;
  detail?: string;
  trend?: 'up' | 'down' | 'stable';
  strength?: number; // 0-100, overrides bar width calculation
};

interface RecurringThemesCardProps {
  title?: string;
  subtitle?: string;
  items: RecurringThemeItem[];
  className?: string;
  showTrendIndicators?: boolean;
}

const BAR_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/5', 'w-1/3'];

export function RecurringThemesCard({
  title = 'Recurring themes',
  subtitle,
  items,
  className = '',
  showTrendIndicators = false,
}: RecurringThemesCardProps) {
  if (items.length === 0) return null;

  return (
    <div
      className={`rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-4 ${className}`}
    >
      <div className='flex items-start gap-2 mb-3'>
        <Sparkles className='w-4 h-4 text-lunary-primary-400 mt-0.5' />
        <div>
          <h3 className='text-sm font-medium text-zinc-200'>{title}</h3>
          {subtitle && (
            <p className='text-xs text-zinc-500 leading-relaxed'>{subtitle}</p>
          )}
        </div>
      </div>
      <ul className='space-y-2'>
        {items.slice(0, 3).map((item, index) => {
          // Use actual strength if provided, otherwise use default widths
          const widthClass = BAR_WIDTHS[index] ?? 'w-1/3';
          const barStyle =
            item.strength !== undefined
              ? { width: `${item.strength}%` }
              : undefined;

          return (
            <li key={`${item.label}-${index}`} className='space-y-1'>
              <div className='flex items-center gap-3'>
                <span className='text-sm text-zinc-200 flex items-center gap-1.5'>
                  {item.label}
                  {showTrendIndicators && item.trend && (
                    <span className={`text-xs ${getTrendColor(item.trend)}`}>
                      {getTrendIcon(item.trend)}
                    </span>
                  )}
                </span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                  <div
                    className={`h-full bg-lunary-primary-500/60 rounded-full transition-all ${!barStyle ? widthClass : ''}`}
                    style={barStyle}
                  />
                </div>
              </div>
              {item.detail && (
                <p className='text-xs text-zinc-500'>{item.detail}</p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
