import Link from 'next/link';
import { stringToKebabCase } from '../../utils/string';

interface TarotCardProps {
  name: string;
  keywords: string[];
  information: string;
  variant?: 'major' | 'minor';
}

export function TarotCard({
  name,
  keywords,
  information,
  variant = 'major',
}: TarotCardProps) {
  const cardSlug = stringToKebabCase(name);

  return (
    <Link
      href={`/grimoire/tarot/${cardSlug}`}
      className='block rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-4 hover:bg-zinc-900/50 hover:border-lunary-primary/50 transition-all group'
    >
      <h3
        className={`text-lg font-medium mb-2 group-hover:text-lunary-primary-400 transition-colors ${
          variant === 'major' ? 'text-lunary-primary-300' : 'text-zinc-100'
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
      <p className='text-sm text-zinc-300 leading-relaxed'>{information}</p>
    </Link>
  );
}
