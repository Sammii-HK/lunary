import { useState, type MouseEvent } from 'react';
import { ChevronDown, Heart, Briefcase, Sparkles } from 'lucide-react';

type FocusArea = {
  area: 'love' | 'work' | 'inner';
  title: string;
  guidance: string;
};

export function MoreForToday({ focusAreas }: { focusAreas: FocusArea[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const areaIcons = {
    love: <Heart className='w-4 h-4 text-pink-400' />,
    work: <Briefcase className='w-4 h-4 text-amber-400' />,
    inner: <Sparkles className='w-4 h-4 text-lunary-primary-400' />,
  };

  if (!focusAreas || focusAreas.length === 0) {
    return null;
  }

  const toggleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className='mb-4'>
      <button
        type='button'
        onClick={toggleOpen}
        className='flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors'
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
        <span>More for today</span>
      </button>

      {isOpen && (
        <div className='mt-3 space-y-3 pl-6'>
          {focusAreas.map((focus) => (
            <div
              key={focus.area}
              className='p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50'
            >
              <div className='flex items-center gap-2 mb-1'>
                {areaIcons[focus.area]}
                <span className='text-xs font-medium text-zinc-300 uppercase tracking-wide'>
                  {focus.title}
                </span>
              </div>
              <p className='text-sm text-zinc-400 leading-relaxed'>
                {focus.guidance}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
