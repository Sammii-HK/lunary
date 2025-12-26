import { ReactNode } from 'react';
import { MarketingFooter } from '@/components/MarketingFooter';

interface ContentPageWrapperProps {
  children: ReactNode;
  maxWidth?:
    | 'sm'
    | 'md'
    | 'lg'
    | 'xl'
    | '2xl'
    | '3xl'
    | '4xl'
    | '5xl'
    | '6xl'
    | '7xl';
  showFooter?: boolean;
  className?: string;
  padding?: string;
  background?: string;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function ContentPageWrapper({
  children,
  maxWidth = '4xl',
  showFooter = true,
  className = '',
  padding = 'px-4 py-8 md:py-12',
  background = 'bg-zinc-950',
}: ContentPageWrapperProps) {
  return (
    <div className={`min-h-screen ${background} text-zinc-100 flex flex-col`}>
      <div
        className={`${maxWidthClasses[maxWidth]} mx-auto ${padding} ${className}`}
      >
        {children}
      </div>
      {showFooter && (
        <div className='mt-auto'>
          <MarketingFooter />
        </div>
      )}
    </div>
  );
}
