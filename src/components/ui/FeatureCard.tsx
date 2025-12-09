import { Star, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconColor?: string;
  variant?: 'primary' | 'secondary';
}

export function FeatureCard({
  title,
  description,
  icon: Icon = Star,
  iconColor = 'text-lunary-primary-400',
  variant = 'primary',
}: FeatureCardProps) {
  return (
    <div className='flex items-start gap-3'>
      <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        <h3 className='text-lg font-medium text-zinc-100 mb-1'>{title}</h3>
        <p className='text-sm text-zinc-300 leading-relaxed'>{description}</p>
      </div>
    </div>
  );
}

interface FeatureListProps {
  features: Array<{
    title: string;
    description: string;
    icon?: LucideIcon;
  }>;
  variant?: 'primary' | 'secondary';
  title?: string;
}

export function FeatureList({
  features,
  variant = 'primary',
  title,
}: FeatureListProps) {
  const containerClasses =
    variant === 'primary'
      ? 'rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'
      : 'rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6';

  return (
    <section className='mb-12'>
      {title && (
        <h2 className='text-2xl font-medium text-zinc-100 mb-6'>{title}</h2>
      )}
      <div className={containerClasses}>
        <div className='space-y-4'>
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
