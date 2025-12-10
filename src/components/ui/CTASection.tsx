import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ReactNode } from 'react';

interface CTASectionProps {
  text?: string;
  href?: string;
  variant?: 'primary' | 'secondary' | 'inline';
  children?: ReactNode;
  icon?: boolean;
  className?: string;
}

export function CTASection({
  text = 'Start Your Free Trial',
  href = '/pricing',
  variant = 'primary',
  children,
  icon = true,
  className = '',
}: CTASectionProps) {
  const baseClasses =
    'inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium text-lg transition-colors';

  const variantClasses = {
    primary:
      'bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300',
    secondary:
      'bg-zinc-800/50 hover:bg-zinc-800/70 border border-zinc-700 text-zinc-200',
    inline:
      'bg-lunary-primary-800 hover:bg-lunary-primary-700 text-white px-6 py-3 text-base',
  };

  if (variant === 'inline') {
    return (
      <Link
        href={href}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children || text}
        {icon && <ArrowRight className='h-5 w-5' />}
      </Link>
    );
  }

  return (
    <section className={`text-center mb-12 ${className}`}>
      <Link href={href} className={`${baseClasses} ${variantClasses[variant]}`}>
        {children || text}
        {icon && <ArrowRight className='h-5 w-5' />}
      </Link>
    </section>
  );
}

interface CTABoxProps {
  title: string;
  description?: string;
  buttonText?: string;
  href?: string;
  variant?: 'primary' | 'secondary';
}

export function CTABox({
  title,
  description,
  buttonText = 'Start Your Free Trial',
  href = '/pricing',
  variant = 'primary',
}: CTABoxProps) {
  const containerClasses =
    variant === 'primary'
      ? 'rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10 p-6'
      : 'rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-6';

  return (
    <div className={`${containerClasses} text-center`}>
      <h3 className='text-xl font-medium text-zinc-100 mb-2'>{title}</h3>
      {description && (
        <p className='text-sm text-zinc-300 mb-4'>{description}</p>
      )}
      <Link
        href={href}
        className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-lunary-primary-800 hover:bg-lunary-primary-700 text-white font-medium transition-colors'
      >
        {buttonText}
        <ArrowRight className='h-4 w-4' />
      </Link>
    </div>
  );
}
