import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ASTROLOGY_GLOSSARY,
  getTermBySlug,
  getRelatedTerms,
  getTermsByCategory,
  type GlossaryTerm,
} from '@/constants/grimoire/glossary';
import { createDefinedTermSchema, renderJsonLd } from '@/lib/schema';

export async function generateStaticParams() {
  return ASTROLOGY_GLOSSARY.map((term) => ({
    term: term.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ term: string }>;
}): Promise<Metadata> {
  const { term: termSlug } = await params;
  const term = getTermBySlug(termSlug);

  if (!term) {
    return { title: 'Term Not Found | Lunary' };
  }

  const title = `${term.term}: Astrology Definition & Meaning | Lunary`;
  const description = `${term.definition.slice(0, 155)}...`;

  return {
    title,
    description,
    keywords: [
      term.term.toLowerCase(),
      `${term.term.toLowerCase()} meaning`,
      `${term.term.toLowerCase()} astrology`,
      `what is ${term.term.toLowerCase()}`,
      'astrology glossary',
      term.category,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/glossary/${termSlug}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/glossary/${termSlug}`,
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ term: string }>;
}) {
  const { term: termSlug } = await params;
  const term = getTermBySlug(termSlug);

  if (!term) {
    notFound();
  }

  const relatedTerms = getRelatedTerms(termSlug);
  const categoryTerms = getTermsByCategory(term.category)
    .filter((t) => t.slug !== termSlug)
    .slice(0, 6);

  const definedTermSchema = createDefinedTermSchema({
    term: term.term,
    definition: term.definition,
    url: `https://lunary.app/grimoire/glossary/${termSlug}`,
    relatedTerms: term.relatedTerms,
  });

  const categoryLabels: Record<string, string> = {
    basic: 'Basic Concepts',
    chart: 'Chart Elements',
    aspect: 'Aspects',
    planet: 'Planets',
    sign: 'Signs & Modalities',
    house: 'Houses',
    technique: 'Techniques',
    transit: 'Transits & Timing',
  };

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100'>
      {renderJsonLd(definedTermSchema)}

      <div className='max-w-4xl mx-auto px-4 py-12'>
        <nav className='text-sm text-zinc-500 mb-8'>
          <Link href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </Link>
          <span className='mx-2'>/</span>
          <Link href='/grimoire/glossary' className='hover:text-zinc-300'>
            Glossary
          </Link>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>{term.term}</span>
        </nav>

        <header className='mb-8'>
          <div className='flex items-center gap-3 mb-4'>
            <span className='px-3 py-1 rounded-full bg-lunary-primary-900/20 text-lunary-primary-300 text-sm'>
              {categoryLabels[term.category] || term.category}
            </span>
          </div>
          <h1 className='text-4xl md:text-5xl font-light text-zinc-100 mb-4'>
            {term.term}
          </h1>
        </header>

        <section className='mb-12'>
          <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
            What is {term.term}?
          </h2>
          <p className='text-lg text-zinc-300 leading-relaxed'>
            {term.definition}
          </p>
        </section>

        {term.example && (
          <section className='mb-12 p-6 rounded-lg bg-zinc-900/50 border border-zinc-800'>
            <h3 className='text-lg font-medium text-zinc-100 mb-3'>Example</h3>
            <p className='text-zinc-300 italic'>{term.example}</p>
          </section>
        )}

        {relatedTerms.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              Related Terms
            </h2>
            <div className='grid sm:grid-cols-2 gap-4'>
              {relatedTerms.map((related) => (
                <Link
                  key={related.slug}
                  href={`/grimoire/glossary/${related.slug}`}
                  className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:border-lunary-primary-600 hover:bg-zinc-900/50 transition-all group'
                >
                  <h3 className='font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors mb-1'>
                    {related.term}
                  </h3>
                  <p className='text-sm text-zinc-400 line-clamp-2'>
                    {related.definition.slice(0, 100)}...
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {categoryTerms.length > 0 && (
          <section className='mb-12'>
            <h2 className='text-2xl font-medium text-zinc-100 mb-4'>
              More {categoryLabels[term.category] || term.category}
            </h2>
            <div className='flex flex-wrap gap-2'>
              {categoryTerms.map((t) => (
                <Link
                  key={t.slug}
                  href={`/grimoire/glossary/${t.slug}`}
                  className='px-4 py-2 rounded-lg bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors text-sm'
                >
                  {t.term}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className='p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-900/10'>
          <h2 className='text-xl font-medium text-lunary-primary-300 mb-2'>
            See {term.term} in Your Chart
          </h2>
          <p className='text-zinc-300 mb-4'>
            Discover how {term.term.toLowerCase()} appears in your personal
            birth chart and what it means for you.
          </p>
          <Link
            href='/birth-chart'
            className='inline-flex px-6 py-3 rounded-lg bg-lunary-primary-900/20 hover:bg-lunary-primary-900/30 border border-lunary-primary-700 text-lunary-primary-300 font-medium transition-colors'
          >
            View Your Birth Chart
          </Link>
        </section>

        <div className='mt-8 text-center'>
          <Link
            href='/grimoire/glossary'
            className='text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors'
          >
            ← Back to Full Glossary
          </Link>
        </div>
      </div>
    </div>
  );
}
