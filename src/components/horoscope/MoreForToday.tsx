import { useState, useRef, useEffect, type MouseEvent } from 'react';
import { ChevronDown, Heart, Briefcase, Sparkles } from 'lucide-react';
// AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting.
// import AudioNarrator from '@/components/audio/AudioNarrator';
import { AutoLinkText } from '@/components/glossary/AutoLinkText';

type FocusArea = {
  area: 'love' | 'work' | 'inner';
  title: string;
  guidance: string;
};

const AREA_CONFIG = {
  love: {
    icon: Heart,
    borderColor: 'border-l-lunary-rose',
    iconBg: 'bg-lunary-rose/10',
    iconColor: 'text-lunary-rose-300',
  },
  work: {
    icon: Briefcase,
    borderColor: 'border-l-lunary-accent',
    iconBg: 'bg-lunary-accent/10',
    iconColor: 'text-content-brand-accent',
  },
  inner: {
    icon: Sparkles,
    borderColor: 'border-l-lunary-primary-400',
    iconBg: 'bg-lunary-primary-400/10',
    iconColor: 'text-lunary-primary-400',
  },
} as const;

export function MoreForToday({ focusAreas }: { focusAreas: FocusArea[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [focusAreas, isOpen]);

  if (!focusAreas || focusAreas.length === 0) {
    return null;
  }

  const toggleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const areaLabels = focusAreas.map((f) => f.title).join(', ');

  return (
    <div className='mb-4'>
      <button
        type='button'
        onClick={toggleOpen}
        className='flex items-center gap-2 text-sm text-content-secondary hover:text-content-primary transition-colors w-full'
      >
        <div className='flex items-center gap-1.5'>
          {focusAreas.map((focus) => {
            const config = AREA_CONFIG[focus.area];
            const Icon = config.icon;
            return (
              <span
                key={focus.area}
                className={`rounded-full ${config.iconBg} p-1`}
              >
                <Icon className={`w-3 h-3 ${config.iconColor}`} />
              </span>
            );
          })}
        </div>
        <span className='text-sm text-content-secondary truncate'>
          {areaLabels}
        </span>
        <ChevronDown
          className={`w-4 h-4 ml-auto flex-shrink-0 text-content-muted transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <div
        className='overflow-hidden transition-all duration-300 ease-in-out'
        style={{ maxHeight: isOpen ? contentHeight : 0 }}
      >
        <div ref={contentRef} className='mt-3 space-y-2'>
          {/* AudioNarrator paused: voice quality + TTS cost decision pending. Restore by uncommenting. */}
          {/* {isOpen && focusAreas.length > 0 && (
            <AudioNarrator
              text={focusAreas
                .map((f) => `${f.title}. ${f.guidance}`)
                .join('\n\n')}
              title='More for today'
              compactVariant='inline'
            />
          )} */}
          {focusAreas.map((focus) => {
            const config = AREA_CONFIG[focus.area];
            const Icon = config.icon;

            return (
              <div
                key={focus.area}
                className={`p-3 rounded-lg bg-surface-elevated/50 border border-stroke-subtle/50 border-l-2 ${config.borderColor}`}
              >
                <div className='flex items-center gap-2 mb-1.5'>
                  <span className={`rounded-full ${config.iconBg} p-1.5`}>
                    <Icon className={`w-4 h-4 ${config.iconColor}`} />
                  </span>
                  <span className='text-sm font-medium text-content-primary'>
                    {focus.title}
                  </span>
                </div>
                <AutoLinkText
                  as='p'
                  className='text-sm text-content-muted leading-relaxed'
                >
                  {focus.guidance}
                </AutoLinkText>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
