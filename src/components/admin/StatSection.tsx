import { ReactNode } from 'react';

interface StatSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  footerText?: string;
}

export function StatSection({
  eyebrow,
  title,
  description,
  children,
  footerText,
}: StatSectionProps) {
  return (
    <div className='space-y-4 rounded-3xl border border-stroke-subtle/60 bg-surface-base/40 p-5 shadow-lg shadow-black/30'>
      <div className='flex items-center justify-between'>
        <div>
          {eyebrow && (
            <p className='text-xs uppercase tracking-wider text-content-muted'>
              {eyebrow}
            </p>
          )}
          <h3 className='text-lg font-medium text-content-primary'>{title}</h3>
        </div>
        {description && (
          <p className='text-xs text-content-muted'>{description}</p>
        )}
      </div>
      {children}
      {footerText && <p className='text-xs text-content-muted'>{footerText}</p>}
    </div>
  );
}
