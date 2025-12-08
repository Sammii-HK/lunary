import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Trademark Guidelines | Lunary',
  description:
    'Guidelines for using the Lunary brand, logo, and trademarks. Learn how to properly reference Lunary in your content.',
  robots: 'index, follow',
};

export default function TrademarkPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Trademark Guidelines
          </h1>
          <p className='text-sm text-zinc-500'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              These Trademark Guidelines govern the use of the Lunary name,
              logos, and other brand assets (collectively, the &quot;Lunary
              Marks&quot;) owned by Lunar Computing, Inc. (&quot;Lunary,&quot;
              &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These
              guidelines protect both our brand identity and our users, who rely
              on the Lunary Marks to identify genuine Lunary products and
              services.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Our Brand Assets
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              The Lunary Marks include, but are not limited to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>The Lunary Name:</strong> &quot;Lunary&quot; and
                &quot;Lunary+&quot;
              </li>
              <li>
                <strong>Lunary Logo:</strong> The moon icon and wordmark
              </li>
              <li>
                <strong>Product Names:</strong> Lunary GPT, Lunary API
              </li>
              <li>
                <strong>Taglines:</strong> &quot;Your AI-powered astral
                guide&quot;
              </li>
              <li>
                <strong>Visual Identity:</strong> Our distinctive color palette,
                typography, and design elements
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              For official brand assets, please visit our{' '}
              <Link
                href='/press-kit'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Press Kit
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Permitted Uses
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You may use the Lunary Marks without prior permission in the
              following cases:
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>
              2.1 Editorial and Informational Use
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Writing about Lunary in news articles, blog posts, reviews, or
                educational content
              </li>
              <li>Referencing Lunary when comparing products or services</li>
              <li>
                Discussing Lunary on social media, podcasts, or video content
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.2 API Attribution
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              If you use the Lunary API, you may (and should) display
              &quot;Powered by Lunary&quot; in your application as required by
              our{' '}
              <Link
                href='/api-terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                API Terms of Service
              </Link>
              .
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.3 Referral and Affiliate Use
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              If you are participating in our referral program, you may use the
              Lunary name to promote your referral link, subject to our{' '}
              <Link
                href='/referral-terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Referral Program Terms
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Prohibited Uses
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              The following uses of the Lunary Marks are prohibited without
              prior written permission:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Domain Names:</strong> Registering domain names
                containing &quot;Lunary&quot; or confusingly similar variations
              </li>
              <li>
                <strong>Social Media Handles:</strong> Creating social media
                accounts that could be mistaken for official Lunary accounts
              </li>
              <li>
                <strong>Product or Company Names:</strong> Naming your product,
                service, or company using &quot;Lunary&quot;
              </li>
              <li>
                <strong>Implying Endorsement:</strong> Suggesting that Lunary
                sponsors, endorses, or is affiliated with your product or
                service
              </li>
              <li>
                <strong>Logo Modifications:</strong> Altering, animating, or
                distorting the Lunary logo
              </li>
              <li>
                <strong>Merchandise:</strong> Creating merchandise featuring
                Lunary Marks without permission
              </li>
              <li>
                <strong>Search Keywords:</strong> Using Lunary Marks in paid
                search advertising keywords without permission
              </li>
              <li>
                <strong>Competing Products:</strong> Using Lunary Marks in ways
                that suggest our association with competing products
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Logo Usage Guidelines
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              When using the Lunary logo with permission:
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>4.1 Do</h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Use the logo files provided in our press kit</li>
              <li>
                Maintain the minimum clear space around the logo (equal to the
                height of the moon icon)
              </li>
              <li>
                Use the logo on backgrounds that provide sufficient contrast
              </li>
              <li>
                Scale the logo proportionally (do not stretch or compress)
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              4.2 Do Not
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Change the logo colors outside of approved variations</li>
              <li>Add effects such as shadows, gradients, or outlines</li>
              <li>Combine the logo with other logos, symbols, or graphics</li>
              <li>Rotate, flip, or animate the logo</li>
              <li>Use outdated versions of the logo</li>
              <li>
                Display the logo smaller than 24px in height for digital use
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Naming Conventions
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              When referring to Lunary in text:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Correct:</strong> &quot;Lunary&quot; (capitalized, no
                article)
              </li>
              <li>
                <strong>Correct:</strong> &quot;the Lunary app&quot; (when using
                as an adjective)
              </li>
              <li>
                <strong>Correct:</strong> &quot;Lunary+&quot; (with plus sign
                for the premium tier)
              </li>
              <li>
                <strong>Incorrect:</strong> &quot;lunary&quot;,
                &quot;LUNARY&quot;, &quot;the Lunary&quot;
              </li>
              <li>
                <strong>Do not:</strong> Use &quot;Lunary&quot; as a verb (e.g.,
                &quot;lunary your horoscope&quot;)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Press Kit
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Official Lunary brand assets, including logos in various formats
              and approved screenshots, are available in our{' '}
              <Link
                href='/press-kit'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Press Kit
              </Link>
              . These assets are provided for legitimate editorial and
              partnership use only.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Requesting Permission
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you would like to use the Lunary Marks in a way not covered by
              these guidelines, or if you are unsure whether your intended use
              is permitted, please contact us for permission:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Brand Inquiries:</strong>{' '}
                <a
                  href='mailto:brand@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  brand@lunary.app
                </a>
                <br />
                <strong>Partnership Inquiries:</strong>{' '}
                <a
                  href='mailto:partnerships@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  partnerships@lunary.app
                </a>
              </p>
            </div>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Please include details about your intended use, your company or
              organization, and any relevant mockups or examples.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Enforcement
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We actively protect our trademarks and will take appropriate
              action against unauthorized use, including but not limited to
              sending cease and desist notices, filing DMCA takedowns, and
              pursuing legal remedies. If you become aware of any unauthorized
              use of the Lunary Marks, please report it to{' '}
              <a
                href='mailto:legal@lunary.app'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                legal@lunary.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Changes to Guidelines
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We may update these Trademark Guidelines from time to time.
              Changes are effective upon posting to this page. We encourage you
              to review these guidelines periodically, especially before using
              any Lunary Marks.
            </p>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Resources
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/press-kit'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Press Kit
              </Link>
              <Link
                href='/api-terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                API Terms
              </Link>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/dmca'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                DMCA Policy
              </Link>
            </div>
          </section>
        </div>
      </main>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
