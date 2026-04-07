'use client';

import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme, type ThemePreference } from '@/providers/ThemeProvider';

const OPTIONS: {
  value: ThemePreference;
  icon: React.ElementType;
  label: string;
}[] = [
  { value: 'system', icon: Monitor, label: 'System' },
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
];

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div
      className={`flex items-center gap-0.5 rounded-lg bg-surface-overlay p-1 ${className}`}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setPreference(value)}
          aria-label={`${label} mode`}
          title={label}
          className={`flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
            preference === value
              ? 'bg-surface-card text-content-primary shadow-sm'
              : 'text-content-muted hover:text-content-secondary'
          }`}
        >
          <Icon className='w-3.5 h-3.5' />
        </button>
      ))}
    </div>
  );
}
