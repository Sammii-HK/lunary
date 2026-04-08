interface HoroscopeSectionProps {
  title: string;
  children: React.ReactNode;
  color?: 'purple' | 'blue' | 'emerald' | 'amber' | 'indigo' | 'zinc';
  id?: string;
}

const colorClasses = {
  purple: 'border-lunary-primary-800 bg-surface-elevated',
  blue: 'border-lunary-secondary-800 bg-surface-elevated',
  emerald: 'border-lunary-success-800 bg-surface-elevated',
  amber: 'border-lunary-accent-800 bg-surface-elevated',
  indigo: 'border-lunary-highlight-800 bg-surface-elevated',
  zinc: 'border-stroke-subtle bg-surface-elevated',
};

export function HoroscopeSection({
  title,
  children,
  color = 'zinc',
  id,
}: HoroscopeSectionProps) {
  return (
    <div
      id={id}
      data-testid={id ? `${id}-section` : undefined}
      className={`rounded-lg border ${colorClasses[color]} p-4 sm:p-6 scroll-mt-14`}
    >
      <h2 className='text-sm md:text-base font-medium text-content-primary mb-2'>
        {title}
      </h2>
      {children}
    </div>
  );
}
