import Link from 'next/link';

interface AuthorBoxProps {
  name?: string;
  bio?: string;
  showLastUpdated?: boolean;
  lastUpdated?: string;
}

export function AuthorBox({
  name = 'Sammii',
  bio = 'Astrologer, tarot reader, and creator of Lunary. Combining real astronomical data with mystical wisdom to guide your cosmic journey.',
  showLastUpdated = true,
  lastUpdated,
}: AuthorBoxProps) {
  return (
    <aside className='mt-12 pt-8 border-t border-stroke-subtle'>
      <div className='flex flex-col sm:flex-row gap-4 items-start'>
        <div className='flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-lunary-primary-600 to-lunary-secondary-600 flex items-center justify-center text-content-primary text-2xl font-medium'>
          {name.charAt(0)}
        </div>
        <div className='flex-1'>
          <p className='text-sm text-content-muted mb-1'>Written by</p>
          <h3 className='text-lg font-medium text-content-primary mb-2'>
            {name}
          </h3>
          <p className='text-sm text-content-muted leading-relaxed mb-3'>
            {bio}
          </p>
          <div className='flex flex-wrap gap-3 text-xs text-content-muted'>
            <Link
              href='/about'
              className='hover:text-content-brand transition-colors'
            >
              About Lunary
            </Link>
            <span>·</span>
            <Link
              href='/grimoire'
              className='hover:text-content-brand transition-colors'
            >
              Explore the Grimoire
            </Link>
            {showLastUpdated && lastUpdated && (
              <>
                <span>·</span>
                <span>
                  Updated:{' '}
                  {new Date(lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
