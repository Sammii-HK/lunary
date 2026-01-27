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
    <div className='space-y-4 rounded-3xl border border-zinc-800/60 bg-zinc-950/40 p-5 shadow-lg shadow-black/30'>
      <div className='flex items-center justify-between'>
        <div>
          {eyebrow && (
            <p className='text-xs uppercase tracking-wider text-zinc-500'>
              {eyebrow}
            </p>
          )}
          <h3 className='text-lg font-medium text-white'>{title}</h3>
        </div>
        {description && <p className='text-xs text-zinc-400'>{description}</p>}
      </div>
      {children}
      {footerText && <p className='text-xs text-zinc-500'>{footerText}</p>}
    </div>
  );
}
