interface HoroscopeSectionProps {
  title: string;
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'indigo' | 'zinc';
}

const colorClasses = {
  purple: 'border-lunary-primary-700 bg-lunary-primary-950',
  blue: 'border-lunary-secondary-800 bg-lunary-secondary-950',
  emerald: 'border-lunary-success-800 bg-lunary-success-950',
  amber: 'border-lunary-accent-700 bg-lunary-accent-950',
  indigo: 'border-lunary-primary-800 bg-lunary-primary-950',
  zinc: 'border-zinc-800/50 bg-zinc-900/30',
};

export function HoroscopeSection({
  title,
  children,
  color = 'zinc',
}: HoroscopeSectionProps) {
  return (
    <div className={`rounded-lg border ${colorClasses[color]} p-6`}>
      <h2 className='text-lg font-medium text-zinc-100 mb-3'>{title}</h2>
      {children}
    </div>
  );
}
