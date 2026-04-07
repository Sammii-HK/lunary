export function ArticleFooter({
  sources,
  dateModified,
  datePublished,
}: {
  dateModified?: string;
  datePublished?: string;
  sources: Array<{ name: string; url?: string }>;
}) {
  const lastUpdated = dateModified || datePublished || null;
  return (
    <footer className='mt-12 pt-8 border-t border-stroke-subtle/50 overflow-x-hidden'>
      <div className='space-y-4 text-sm text-content-muted'>
        <div className='flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2'>
          <span className='break-words'>
            <strong className='text-content-muted'>Written by:</strong> Sammii,
            Founder of Lunary
          </span>
          <span className='break-words'>
            <strong className='text-content-muted'>Edited by:</strong> Lunary
            Astrology Team
          </span>
          {lastUpdated && (
            <span className='break-words'>
              <strong className='text-content-muted'>Last updated:</strong>{' '}
              {new Date(dateModified || datePublished || '').toLocaleDateString(
                'en-US',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              )}
            </span>
          )}
        </div>

        {sources && sources.length > 0 && (
          <div>
            <strong className='text-content-muted'>Sources:</strong>
            <ul className='mt-2 space-y-1'>
              {sources.map((source, index) => (
                <li key={index}>
                  {source.url ? (
                    <a
                      href={source.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-lunary-accent hover:text-content-brand-accent transition-colors'
                    >
                      {source.name}
                    </a>
                  ) : (
                    <span>{source.name}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!sources && (
          <div>
            <strong className='text-content-muted'>Reference Sources:</strong>
            <ul className='mt-2 space-y-1'>
              <li>Astronomy Engine (astronomical calculations)</li>
              <li>Traditional astrological texts</li>
              <li>Historical tarot and occult references</li>
            </ul>
          </div>
        )}
      </div>
    </footer>
  );
}
