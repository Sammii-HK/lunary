import Link from 'next/link';

type FactShellProps = {
  title: string;
  eyebrow: string;
  answer: string;
  detail: string;
  children?: React.ReactNode;
  sources: Array<{ label: string; href: string }>;
};

export function FactShell({
  title,
  eyebrow,
  answer,
  detail,
  children,
  sources,
}: FactShellProps) {
  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      <div className='mx-auto max-w-4xl px-4 py-12'>
        <nav className='mb-8 flex items-center gap-2 text-sm text-content-muted'>
          <Link href='/grimoire' className='hover:text-content-secondary'>
            Grimoire
          </Link>
          <span>/</span>
          <Link
            href='/grimoire/datasets'
            className='hover:text-content-secondary'
          >
            Datasets
          </Link>
          <span>/</span>
          <span>Facts</span>
        </nav>

        <header className='mb-10'>
          <p className='mb-3 text-xs uppercase tracking-[0.28em] text-content-muted'>
            {eyebrow}
          </p>
          <h1 className='text-4xl font-light text-content-primary md:text-5xl'>
            {title}
          </h1>
          <section
            aria-label='Direct answer'
            data-citation-answer='true'
            className='mt-5 rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-5'
          >
            <h2 className='sr-only'>Direct answer</h2>
            <p className='text-xl leading-relaxed text-content-primary'>
              {answer}
            </p>
          </section>
          <p className='mt-4 max-w-2xl text-sm leading-relaxed text-content-muted'>
            {detail}
          </p>
        </header>

        {children}

        <section className='mt-10 border-t border-stroke-subtle pt-6'>
          <h2 className='text-sm font-medium uppercase tracking-[0.2em] text-content-muted'>
            Source links
          </h2>
          <div className='mt-4 flex flex-wrap gap-3'>
            {sources.map((source) => (
              <Link
                key={source.href}
                href={source.href}
                className='rounded-lg border border-lunary-primary-700 px-4 py-2 text-sm text-content-brand transition-colors hover:border-lunary-primary-500 hover:text-content-brand-accent'
              >
                {source.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export function FactTable({
  rows,
}: {
  rows: Array<Record<string, string | number>>;
}) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];

  return (
    <div className='overflow-hidden rounded-lg border border-stroke-subtle'>
      <table className='w-full text-left text-sm'>
        <thead className='bg-surface-elevated/70 text-content-muted'>
          <tr>
            {headers.map((header) => (
              <th key={header} className='px-4 py-3 font-medium capitalize'>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className='border-t border-stroke-subtle'>
              {headers.map((header) => (
                <td key={header} className='px-4 py-3 text-content-secondary'>
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
