import Link from 'next/link';
import { ContentPageWrapper } from '@/components/ui/ContentPageWrapper';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export type FooterSectionItem = {
  title: string;
  href: string;
  description?: string;
};

interface FooterSectionPageProps {
  title: string;
  description?: string;
  items: FooterSectionItem[];
}

export function FooterSectionPage({
  title,
  description,
  items,
}: FooterSectionPageProps) {
  return (
    <ContentPageWrapper maxWidth='5xl' className='space-y-10'>
      <MarketingBreadcrumbs />

      <header className='space-y-3'>
        <h1 className='text-2xl md:text-3xl font-semibold text-content-primary'>
          {title}
        </h1>
        {description && (
          <p className='text-content-secondary max-w-2xl'>{description}</p>
        )}
      </header>

      <section className='grid gap-4 sm:grid-cols-2'>
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className='rounded-xl border border-stroke-subtle bg-surface-base/60 p-5 transition hover:border-lunary-primary-700 hover:bg-surface-elevated/60'
          >
            <h2 className='text-base font-semibold text-content-primary mb-2'>
              {item.title}
            </h2>
            {item.description && (
              <p className='text-sm text-content-muted'>{item.description}</p>
            )}
          </Link>
        ))}
      </section>
    </ContentPageWrapper>
  );
}
