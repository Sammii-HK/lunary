import Link from 'next/link';
import { stringToKebabCase } from '../../utils/string';

interface TarotCardProps {
  name: string;
  keywords: string[];
  information: string;
  variant?: 'major' | 'minor';
  disableLink?: boolean;
  className?: string;
  showInformation?: boolean;
}

export function TarotCard({
  name,
  keywords,
  information,
  variant = 'major',
  disableLink = false,
  className,
  showInformation = true,
}: TarotCardProps) {
  const cardSlug = stringToKebabCase(name);
  const wrapperClass =
    className ??
    'block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 hover:border-lunary-primary/50 transition-all group';

  const cardContent = (
    <>
      <h3
        className={`text-lg font-medium mb-2 transition-colors ${
          variant === 'major'
            ? 'text-content-brand group-hover:text-lunary-primary-400'
            : 'text-content-primary group-hover:text-lunary-primary-400'
        }`}
      >
        {name}
      </h3>
      <div className='mb-2'>
        <p className='text-xs text-content-muted mb-1'>Keywords:</p>
        <div className='flex flex-wrap gap-1'>
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-0.5 rounded ${
                variant === 'major'
                  ? 'bg-layer-base/20 text-content-brand'
                  : 'bg-surface-card/50 text-content-secondary'
              }`}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      {showInformation && (
        <p className='text-sm text-content-secondary leading-relaxed'>
          {information}
        </p>
      )}
    </>
  );

  if (disableLink) {
    return <div className={wrapperClass}>{cardContent}</div>;
  }

  return (
    <Link href={`/grimoire/tarot/${cardSlug}`} className={wrapperClass}>
      {cardContent}
    </Link>
  );
}
