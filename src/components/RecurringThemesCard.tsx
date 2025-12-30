import { Sparkles } from 'lucide-react';

type RecurringThemeItem = {
  label: string;
  detail?: string;
};

interface RecurringThemesCardProps {
  title?: string;
  subtitle?: string;
  items: RecurringThemeItem[];
  className?: string;
}

const BAR_WIDTHS = ['w-3/4', 'w-1/2', 'w-2/5', 'w-1/3'];

export function RecurringThemesCard({
  title = 'Recurring themes',
  subtitle,
  items,
  className = '',
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
          const widthClass = BAR_WIDTHS[index] ?? 'w-1/3';
          return (
            <li key={`${item.label}-${index}`} className='space-y-1'>
              <div className='flex items-center gap-3'>
                <span className='text-sm text-zinc-200'>{item.label}</span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full'>
                  <div
                    className={`h-full bg-lunary-primary-500/60 rounded-full ${widthClass}`}
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
