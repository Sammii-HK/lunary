interface HoroscopeSectionProps {
  title: string;
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'indigo' | 'zinc';
  id?: string;
}

const colorClasses = {
  purple: 'border-lunary-primary-800 bg-lunary-bg',
  blue: 'border-lunary-secondary-800 bg-lunary-bg',
  emerald: 'border-lunary-success-800 bg-lunary-bg',
  amber: 'border-lunary-accent-800 bg-lunary-bg',
  indigo: 'border-lunary-highlight-800 bg-lunary-bg',
  zinc: 'border-zinc-800 bg-lunary-bg',
};

export function HoroscopeSection({
  title,
  children,
  color = 'zinc',
  id,
}: HoroscopeSectionProps) {
  return (
    <div id={id} className={`rounded-lg border ${colorClasses[color]} p-6 scroll-mt-20`}>
      <h2 className='text-base md:text-lg font-medium text-zinc-100 mb-3'>
        {title}
      </h2>
      {children}
    </div>
  );
}
