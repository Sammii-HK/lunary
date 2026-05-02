'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Heading } from '@/components/ui/Heading';
import { SearchInput } from '@/components/ui/SearchInput';
import { stringToKebabCase } from 'utils/string';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { searchCrystals } from '@/constants/grimoire/crystals';

interface Crystal {
  name: string;
  description?: string;
  metaphysicalProperties?: string;
}

interface CrystalCategory {
  name: string;
  crystals: { name: string; properties: string; slug: string }[];
}

type CrystalCategoryLink = { id: string; label: string };

type CrystalsProps = {
  categories: CrystalCategory[];
  totalCount: number;
  allCrystals: Array<{
    name: string;
    description?: string;
    metaphysicalProperties?: string;
    categories?: string[];
  }>;
  allCategoryNames: string[];
};

const Crystals = ({
  categories,
  totalCount,
  allCrystals,
  allCategoryNames,
}: CrystalsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams?.get('q') || '');
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  useEffect(() => {
    setSearchQuery(searchParams?.get('q') || '');
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const query = debouncedQuery.trim();

    if (query) params.set('q', query);
    else params.delete('q');

    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }, [debouncedQuery, pathname, router, searchParams, startTransition]);

  const normalizedQuery = debouncedQuery.trim().toLowerCase();
  const querySlug = stringToKebabCase(debouncedQuery.trim());
  const categoryMatch = normalizedQuery
    ? allCategoryNames.find((category) => {
        const normalizedCategory = category.toLowerCase();
        return (
          normalizedCategory === normalizedQuery ||
          normalizedCategory.includes(normalizedQuery) ||
          stringToKebabCase(category) === querySlug
        );
      })
    : undefined;

  const filteredCrystals = normalizedQuery
    ? categoryMatch
      ? allCrystals.filter((crystal) =>
          crystal.categories?.includes(categoryMatch),
        )
      : searchCrystals(debouncedQuery.trim())
    : allCrystals;

  const filteredCategories = allCategoryNames
    .map((categoryName) => {
      const crystalsInCategory = filteredCrystals.filter((crystal) =>
        crystal.categories?.includes(categoryName),
      );
      return {
        name: categoryName,
        crystals: crystalsInCategory.map((crystal) => ({
          name: crystal.name,
          properties:
            crystal.description || crystal.metaphysicalProperties || '',
          slug: stringToKebabCase(crystal.name),
        })),
      };
    })
    .filter((category) => category.crystals.length > 0);

  const categoryLinks: CrystalCategoryLink[] = filteredCategories.map(
    (category) => ({
      id: `category-${stringToKebabCase(category.name)}`,
      label: category.name,
    }),
  );

  return (
    <div className='space-y-8'>
      <div className='mb-6'>
        <Heading as='h3' variant='h3'>
          Complete Crystal Guide
        </Heading>
        <p className='text-sm text-content-muted'>
          Comprehensive crystal guide with daily selections, categories, and how
          to work with crystals for healing and magic
        </p>
      </div>

      <section id='daily-selection' className='space-y-4'>
        <Heading as='h3' variant='h3'>
          Daily Selection
        </Heading>
        <div className='rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-4'>
          <p className='text-sm text-content-secondary'>
            Select crystals based on your daily intentions and needs. Choose
            crystals that resonate with your current energy and goals.
          </p>
        </div>
      </section>

      <section
        id='crystal-categories'
        className='space-y-6'
        data-testid='crystal-categories'
      >
        <Heading as='h3' variant='h3'>
          Crystal Categories
        </Heading>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder='Search crystals by name, properties, or intentions...'
          resultCount={searchQuery ? filteredCrystals.length : totalCount}
          resultLabel='crystal'
          className='pt-2'
          maxWidth='max-w-2xl'
        />
        {categoryLinks.length > 0 && (
          <div className='flex flex-wrap gap-2 text-sm'>
            {categoryLinks.map((link) => (
              <Link
                key={link.id}
                href={`${pathname}?q=${encodeURIComponent(link.label)}`}
                className='rounded-full border border-stroke-subtle bg-surface-elevated/40 px-3 py-1 text-content-secondary hover:border-lunary-primary-600 hover:text-content-primary transition-colors'
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
        {filteredCategories.length === 0 ? (
          <div className='rounded-lg border border-stroke-subtle/60 bg-surface-elevated/30 p-4'>
            <p className='text-sm text-content-muted'>
              No crystals match your search. Try a different keyword.
            </p>
          </div>
        ) : (
          <div className='space-y-6'>
            {filteredCategories.map((category) => {
              const categoryId = `category-${stringToKebabCase(category.name)}`;
              return (
                <div key={category.name} id={categoryId}>
                  <Heading
                    as='h4'
                    variant='h4'
                    className='text-content-primary mb-3'
                  >
                    {category.name}
                  </Heading>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {category.crystals.map((crystal) => (
                      <Link
                        key={crystal.name}
                        href={`/grimoire/crystals/${crystal.slug}`}
                        data-testid='crystal-card'
                        data-crystal-slug={crystal.slug}
                        className='block rounded-lg border border-stroke-subtle/50 bg-surface-elevated/30 p-4 hover:bg-surface-elevated/50 hover:border-lunary-secondary-400 transition-all group'
                      >
                        <Heading
                          as='h4'
                          variant='h4'
                          className='text-content-brand-secondary group-hover:text-content-brand-secondary'
                        >
                          {crystal.name}
                        </Heading>
                        <p className='text-sm text-content-secondary leading-relaxed'>
                          {crystal.properties}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
export default Crystals;
