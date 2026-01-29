'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarketingFooter } from '@/components/MarketingFooter';
import { FAQCategory, FAQSearch } from '@/components/FAQ';
import { getAllFAQCategories, getAllFAQs } from '@/lib/faq-helpers';
import { getIcon } from '@/lib/icon-map';
import { renderFAQSchema } from '@/lib/faq-schema';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

  const categories = getAllFAQCategories();

  // Filter FAQs based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return categories;
    }

    const query = searchQuery.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        questions: category.questions.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.questions.length > 0);
  }, [searchQuery, categories]);

  const totalQuestions = useMemo(() => getAllFAQs().length, []);

  const visibleQuestions = useMemo(
    () =>
      filteredCategories.reduce((sum, cat) => sum + cat.questions.length, 0),
    [filteredCategories],
  );

  const handleQuestionToggle = (questionId: string) => {
    setOpenQuestionId(openQuestionId === questionId ? null : questionId);
  };

  const allFAQs = getAllFAQs();

  return (
    <>
      {/* FAQ Schema for SEO */}
      {renderFAQSchema(allFAQs)}

      <div className='min-h-screen bg-zinc-950 text-zinc-50'>
        {/* Header */}
        <header className='border-b border-zinc-800/30 py-4 px-4 md:px-6 sticky top-0 bg-zinc-950/95 backdrop-blur-sm z-50'>
          <div className='max-w-6xl mx-auto flex items-center justify-between'>
            <Link href='/' className='text-lg font-light text-zinc-100'>
              Lunary
            </Link>
            <div className='flex items-center gap-3'>
              <Button variant='ghost' asChild size='sm'>
                <Link href='/features'>Features</Link>
              </Button>
              <Button variant='ghost' asChild size='sm'>
                <Link href='/pricing'>Pricing</Link>
              </Button>
              <Button variant='lunary' asChild size='sm'>
                <Link href='/auth?signup=true'>Get started</Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className='py-12 md:py-16 px-4 md:px-6'>
          <div className='max-w-4xl mx-auto text-center space-y-4'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-light text-zinc-100'>
              Frequently Asked Questions
            </h1>
            <p className='text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto'>
              Everything you need to know about Lunary. Can't find what you're
              looking for? Email us at{' '}
              <a
                href='mailto:support@lunary.app'
                className='text-lunary-primary-300 hover:text-lunary-primary-200 transition-colors'
              >
                support@lunary.app
              </a>
            </p>
          </div>
        </section>

        {/* Search Bar */}
        <section className='pb-8 px-4 md:px-6'>
          <FAQSearch
            value={searchQuery}
            onChange={setSearchQuery}
            totalQuestions={totalQuestions}
            visibleQuestions={visibleQuestions}
          />
        </section>

        {/* Quick Links */}
        <nav className='py-6 px-4 md:px-6 border-y border-zinc-800/30 bg-zinc-900/30'>
          <div className='max-w-6xl mx-auto'>
            <p className='text-xs uppercase tracking-wider text-zinc-500 mb-3'>
              Quick Links
            </p>
            <div className='flex flex-wrap gap-3'>
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:text-lunary-primary-300 hover:border-lunary-primary-700 transition-colors'
                >
                  {getIcon(category.icon, 'w-5 h-5')}
                  <span>{category.title}</span>
                </a>
              ))}
            </div>
          </div>
        </nav>

        {/* FAQ Sections */}
        <div className='max-w-4xl mx-auto px-4 md:px-6 py-12 md:py-16 space-y-16'>
          {filteredCategories.length === 0 ? (
            <div className='text-center py-20'>
              <p className='text-zinc-400 mb-4'>
                No questions found matching &quot;{searchQuery}&quot;
              </p>
              <Button
                variant='outline'
                onClick={() => setSearchQuery('')}
                size='sm'
              >
                Clear search
              </Button>
            </div>
          ) : (
            filteredCategories.map((category) => (
              <FAQCategory
                key={category.id}
                category={category}
                openQuestionId={openQuestionId}
                onQuestionToggle={handleQuestionToggle}
              />
            ))
          )}
        </div>

        {/* Still Have Questions */}
        <section className='py-16 md:py-20 px-4 md:px-6 bg-zinc-900/30 border-t border-zinc-800/30'>
          <div className='max-w-3xl mx-auto text-center space-y-6'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100'>
              Still have questions?
            </h2>
            <p className='text-zinc-400 leading-relaxed'>
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
              <Button variant='lunary' asChild>
                <a
                  href='mailto:support@lunary.app'
                  className='inline-flex items-center gap-2'
                >
                  <Mail className='w-4 h-4' />
                  Email support@lunary.app
                </a>
              </Button>
              <Button variant='outline' asChild>
                <Link
                  href='/features'
                  className='inline-flex items-center gap-2'
                >
                  Explore features
                  <ExternalLink className='w-4 h-4' />
                </Link>
              </Button>
            </div>
            <p className='text-xs text-zinc-500 pt-4'>
              We typically respond within 24 hours (usually faster!)
            </p>
          </div>
        </section>

        {/* Related Resources */}
        <section className='py-16 md:py-20 px-4 md:px-6 border-t border-zinc-800/30'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-2xl md:text-3xl font-light text-zinc-100 mb-8 text-center'>
              Related Resources
            </h2>
            <div className='grid md:grid-cols-3 gap-6'>
              <Link
                href='/features'
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-700 transition-colors group'
              >
                <h3 className='text-lg font-medium text-zinc-200 mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                  Features
                </h3>
                <p className='text-sm text-zinc-400'>
                  Explore all Lunary features with detailed breakdowns
                </p>
              </Link>
              <Link
                href='/pricing'
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-700 transition-colors group'
              >
                <h3 className='text-lg font-medium text-zinc-200 mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                  Pricing
                </h3>
                <p className='text-sm text-zinc-400'>
                  Compare plans and see what's included at each tier
                </p>
              </Link>
              <Link
                href='/grimoire'
                className='p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-700 transition-colors group'
              >
                <h3 className='text-lg font-medium text-zinc-200 mb-2 group-hover:text-lunary-primary-300 transition-colors'>
                  Grimoire
                </h3>
                <p className='text-sm text-zinc-400'>
                  2,000+ free articles on astrology, tarot, and symbolism
                </p>
              </Link>
            </div>
          </div>
        </section>

        <MarketingFooter />
      </div>
    </>
  );
}
