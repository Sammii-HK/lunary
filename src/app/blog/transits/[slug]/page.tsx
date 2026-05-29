import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { TransitSignAccordion } from '@/components/blog/TransitSignAccordion';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 1 day — transit posts are static once published

interface TransitPost {
  id: string;
  slug: string;
  transit_id: string;
  title: string;
  subtitle: string | null;
  meta_description: string;
  keywords: string[];
  introduction: string;
  historical_deep_dive: string;
  astronomical_context: string;
  practical_guidance: string;
  sign_breakdowns: Record<string, string>;
  closing_section: string;
  planet: string;
  sign: string | null;
  transit_type: string;
  start_date: string | null;
  end_date: string | null;
  rarity: string | null;
  published_at: string | null;
  created_at: string;
}

async function getPost(slug: string): Promise<TransitPost | null> {
  const result = await sql`
    SELECT * FROM transit_blog_posts
    WHERE slug = ${slug} AND status = 'published'
    LIMIT 1
  `;
  return (result.rows[0] as TransitPost) || null;
}

async function getRelatedPosts(
  currentSlug: string,
  planet: string,
): Promise<
  Array<{ slug: string; title: string; planet: string; sign: string }>
> {
  const result = await sql`
    SELECT slug, title, planet, sign FROM transit_blog_posts
    WHERE status = 'published' AND slug != ${currentSlug}
    ORDER BY
      CASE WHEN planet = ${planet} THEN 0 ELSE 1 END,
      start_date ASC
    LIMIT 6
  `;
  return result.rows as Array<{
    slug: string;
    title: string;
    planet: string;
    sign: string;
  }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: 'Transit guide not found' };
  }

  return {
    title: `${post.title} | Lunary`,
    description: post.meta_description,
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.meta_description,
      url: `https://lunary.app/blog/transits/${post.slug}`,
      type: 'article',
      publishedTime: post.published_at || undefined,
    },
    alternates: {
      canonical: `https://lunary.app/blog/transits/${post.slug}`,
    },
  };
}

export default async function TransitBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post.slug, post.planet);

  // Build internal links from related posts
  const internalLinks = relatedPosts.map((r) => ({
    text: r.title,
    href: `/blog/transits/${r.slug}`,
  }));

  // Add link to grimoire transit page if it exists
  if (post.sign) {
    const grimoireSlug = `${post.planet.toLowerCase()}-${post.sign.toLowerCase()}-${new Date(post.start_date || post.created_at).getFullYear()}`;
    internalLinks.unshift({
      text: `${post.planet} in ${post.sign} quick reference`,
      href: `/grimoire/transits/${grimoireSlug}`,
    });
  }

  // Build table of contents
  const tableOfContents = [
    { label: 'Introduction', href: '#introduction' },
    { label: 'Historical context', href: '#historical-context' },
    { label: 'Dates and mechanics', href: '#dates-and-mechanics' },
    { label: 'Practical guidance', href: '#practical-guidance' },
    { label: 'How it affects your sign', href: '#sign-breakdowns' },
    { label: 'Looking ahead', href: '#looking-ahead' },
  ];

  // Parse sign breakdowns
  const signBreakdowns =
    typeof post.sign_breakdowns === 'string'
      ? JSON.parse(post.sign_breakdowns)
      : post.sign_breakdowns;

  // Answer-extractable AEO props, computed from the post's REAL fields only.
  const firstSentence = (text: string | null, cap = 280) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return '';
    const match = trimmed.match(/^[^.!?]+[.!?]/);
    const sentence = match ? match[0] : trimmed;
    return sentence.length > cap
      ? `${sentence.slice(0, cap).trim()}...`
      : sentence;
  };
  const tldr = firstSentence(post.introduction);
  const whatIs = {
    question: `What does ${post.title} mean?`,
    answer: post.meta_description || firstSentence(post.introduction, 320),
  };
  const faqList: { question: string; answer: string }[] = [
    {
      question: `What is ${post.title}?`,
      answer: firstSentence(post.introduction, 320),
    },
  ];
  if (post.planet && post.sign && post.start_date && post.end_date) {
    faqList.push({
      question: `When is ${post.planet} in ${post.sign}?`,
      answer: `${post.planet} in ${post.sign} runs from ${format(new Date(post.start_date), 'd MMMM yyyy')} to ${format(new Date(post.end_date), 'd MMMM yyyy')}.`,
    });
  }
  if (post.practical_guidance) {
    faqList.push({
      question: `How do I work with ${post.title}?`,
      answer: firstSentence(post.practical_guidance, 320),
    });
  }
  if (post.astronomical_context) {
    faqList.push({
      question: `What is the astronomy behind ${post.title}?`,
      answer: firstSentence(post.astronomical_context, 320),
    });
  }
  const faqs = faqList.filter((f) => f.answer).slice(0, 5);

  return (
    <SEOContentTemplate
      title={`${post.title} | Lunary`}
      h1={post.title}
      subtitle={post.subtitle || undefined}
      description={post.meta_description}
      keywords={post.keywords}
      whatIs={whatIs}
      tldr={tldr}
      faqs={faqs}
      canonicalUrl={`https://lunary.app/blog/transits/${post.slug}`}
      articleSection='Transit guides'
      datePublished={post.published_at || post.created_at}
      intro={post.introduction}
      meaning={post.historical_deep_dive}
      meaningTitle='Historical context'
      tableOfContents={tableOfContents}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Blog', href: '/blog' },
        { label: 'Transit guides', href: '/blog/transits' },
        { label: post.title, href: `/blog/transits/${post.slug}` },
      ]}
      internalLinks={internalLinks}
      internalLinksTitle='Related transit guides'
      ctaText='See how this transit affects your chart'
      ctaHref='/signup/chart'
      transitSign={post.sign || undefined}
      transitSignDisplay={post.sign || undefined}
    >
      <section id='dates-and-mechanics' className='space-y-4'>
        <h2 className='text-xl font-semibold text-content-secondary'>
          Dates and mechanics
        </h2>
        <div className='prose prose-invert max-w-none text-content-brand/90 leading-relaxed'>
          {post.astronomical_context.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section id='practical-guidance' className='space-y-4'>
        <h2 className='text-xl font-semibold text-content-secondary'>
          Practical guidance
        </h2>
        <div className='prose prose-invert max-w-none text-content-brand/90 leading-relaxed'>
          {post.practical_guidance.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      <section id='sign-breakdowns' className='space-y-4'>
        <h2 className='text-xl font-semibold text-content-secondary'>
          How it affects your sign
        </h2>
        <TransitSignAccordion breakdowns={signBreakdowns} />
      </section>

      <section id='looking-ahead' className='space-y-4'>
        <h2 className='text-xl font-semibold text-content-secondary'>
          Looking ahead
        </h2>
        <div className='prose prose-invert max-w-none text-content-brand/90 leading-relaxed'>
          {post.closing_section.split('\n\n').map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>
    </SEOContentTemplate>
  );
}
