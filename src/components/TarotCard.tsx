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
    'block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary/50 transition-all group';

  const cardContent = (
    <>
      <h3
        className={`text-lg font-medium mb-2 transition-colors ${
          variant === 'major'
            ? 'text-lunary-primary-300 group-hover:text-lunary-primary-400'
            : 'text-zinc-100 group-hover:text-lunary-primary-400'
        }`}
      >
        {name}
      </h3>
      <div className='mb-2'>
        <p className='text-xs text-zinc-400 mb-1'>Keywords:</p>
        <div className='flex flex-wrap gap-1'>
          {keywords.map((keyword, index) => (
            <span
              key={index}
              className={`text-xs px-2 py-0.5 rounded ${
                variant === 'major'
                  ? 'bg-lunary-primary-900/20 text-lunary-primary-300'
                  : 'bg-zinc-800/50 text-zinc-300'
              }`}
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
      {showInformation && (
        <p className='text-sm text-zinc-300 leading-relaxed'>{information}</p>
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
