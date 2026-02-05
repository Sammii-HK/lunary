import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { BlogList } from '../../BlogList';
import { getPaginatedPosts, POSTS_PER_PAGE } from '../../blog-utils';

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ page: string }>;
}

const year = new Date().getFullYear();

// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 1-hour revalidation

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 2) {
    return {};
  }

  const { totalPages, totalPosts } = getPaginatedPosts(pageNum);

  if (pageNum > totalPages) {
    return {};
  }

  const startItem = (pageNum - 1) * POSTS_PER_PAGE + 1;
  const endItem = Math.min(pageNum * POSTS_PER_PAGE, totalPosts);

  return {
    title: `Weekly Astrology Forecasts - Page ${pageNum} | Lunary Blog`,
    description: `Browse weekly astrology forecasts ${startItem}-${endItem} of ${totalPosts}. Planetary transits, moon phases, and cosmic guidance archives.`,
    openGraph: {
      title: `Weekly Astrology Forecasts - Page ${pageNum} | Lunary`,
      description: `Browse weekly astrology forecasts ${startItem}-${endItem} of ${totalPosts}. Planetary transits, moon phases, and cosmic guidance archives.`,
      url: `https://lunary.app/blog/page/${pageNum}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/blog',
          width: 1200,
          height: 630,
          alt: 'Weekly Astrology Forecast - Lunary Blog',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Weekly Astrology Forecasts - Page ${pageNum}`,
      description: `Browse weekly astrology forecasts ${startItem}-${endItem} of ${totalPosts}.`,
      images: ['/api/og/blog'],
    },
    alternates: {
      canonical: `https://lunary.app/blog/page/${pageNum}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    keywords: [
      'astrology blog',
      'weekly horoscope archives',
      'planetary transits',
      'moon phases',
      'astrological guidance',
      'cosmic insights',
      'weekly forecast',
    ],
  };
}

export default async function PaginatedBlogPage({ params }: PageProps) {
  const { page } = await params;
  const pageNum = parseInt(page, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    notFound();
  }

  if (pageNum === 1) {
    redirect('/blog');
  }

  const { posts, totalPages, totalPosts, currentPage } =
    getPaginatedPosts(pageNum);

  if (pageNum > totalPages) {
    notFound();
  }

  const startItem = (currentPage - 1) * POSTS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * POSTS_PER_PAGE, totalPosts);

  return (
    <>
      <BlogList
        posts={posts}
        currentWeekData={null}
        currentPage={currentPage}
        totalPages={totalPages}
        totalPosts={totalPosts}
      />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `Weekly Astrology Forecasts - Page ${currentPage}`,
            description: `Browse weekly astrology forecasts ${startItem}-${endItem} of ${totalPosts}. Planetary transits, moon phases, and cosmic guidance archives.`,
            url: `https://lunary.app/blog/page/${currentPage}`,
            isPartOf: {
              '@type': 'CollectionPage',
              name: `Weekly Astrology Forecast ${year}`,
              url: 'https://lunary.app/blog',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Lunary',
              url: 'https://lunary.app',
              logo: {
                '@type': 'ImageObject',
                url: 'https://lunary.app/logo.png',
              },
            },
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: posts.length,
              itemListElement: posts.map((post, index) => ({
                '@type': 'ListItem',
                position: startItem + index,
                url: `https://lunary.app/blog/week/${post.slug}`,
                item: {
                  '@type': 'Article',
                  headline: post.title,
                  description: post.subtitle,
                  datePublished: post.weekStart,
                  url: `https://lunary.app/blog/week/${post.slug}`,
                },
              })),
            },
          }),
        }}
      />

      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://lunary.app',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://lunary.app/blog',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: `Page ${currentPage}`,
                item: `https://lunary.app/blog/page/${currentPage}`,
              },
            ],
          }),
        }}
      />
    </>
  );
}
