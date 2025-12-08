interface HoroscopeSectionProps {
  title: string;
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'indigo' | 'zinc';
}

const colorClasses = {
  purple: 'border-lunary-primary-700 bg-lunary-primary-950',
  blue: 'border-blue-500/20 bg-blue-500/10',
  emerald: 'border-emerald-500/20 bg-emerald-500/10',
  amber: 'border-amber-500/30 bg-amber-500/10',
  indigo: 'border-indigo-500/20 bg-indigo-500/10',
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
