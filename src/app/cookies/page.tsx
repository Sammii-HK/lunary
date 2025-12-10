import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Cookie Policy | Lunary',
  description:
    'Learn about how Lunary uses cookies and similar technologies to provide and improve our service.',
  robots: 'index, follow',
};

export default function CookiePolicyPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Cookie Policy
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              This Cookie Policy explains how Lunar Computing, Inc.
              (&quot;Lunary,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) uses cookies and similar technologies when you
              visit our website and use our services. This policy should be read
              alongside our{' '}
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. What Are Cookies?
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Cookies are small text files that are stored on your device
              (computer, tablet, or mobile) when you visit a website. They are
              widely used to make websites work more efficiently, provide a
              better user experience, and give website owners information about
              how their site is being used.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Types of Cookies We Use
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              2.1 Essential Cookies (Strictly Necessary)
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              These cookies are necessary for the website to function and cannot
              be switched off in our systems. They are usually only set in
              response to actions made by you, such as logging in or filling in
              forms.
            </p>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-zinc-300 border border-zinc-800 rounded-lg'>
                <thead className='bg-zinc-900/50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Cookie Name
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Purpose
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-zinc-800'>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      better-auth.session_token
                    </td>
                    <td className='px-4 py-3'>
                      Maintains your logged-in session
                    </td>
                    <td className='px-4 py-3'>7 days</td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      __Host-better-auth.csrf_token
                    </td>
                    <td className='px-4 py-3'>
                      Protects against cross-site request forgery attacks
                    </td>
                    <td className='px-4 py-3'>Session</td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      cookie_consent
                    </td>
                    <td className='px-4 py-3'>
                      Stores your cookie preferences
                    </td>
                    <td className='px-4 py-3'>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className='text-xl font-medium text-white mb-3 mt-8'>
              2.2 Analytics Cookies (Performance)
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              These cookies help us understand how visitors interact with our
              website by collecting and reporting information anonymously. We
              only set these cookies with your consent.
            </p>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-zinc-300 border border-zinc-800 rounded-lg'>
                <thead className='bg-zinc-900/50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Cookie Name
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Provider
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Purpose
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-zinc-800'>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>ph_phc_*</td>
                    <td className='px-4 py-3'>PostHog</td>
                    <td className='px-4 py-3'>
                      Tracks page views, feature usage, and user behavior for
                      product improvement
                    </td>
                    <td className='px-4 py-3'>1 year</td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      ph_*_posthog
                    </td>
                    <td className='px-4 py-3'>PostHog</td>
                    <td className='px-4 py-3'>
                      Stores anonymous user identifier for analytics
                    </td>
                    <td className='px-4 py-3'>1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              PostHog also provides session recording capabilities to help us
              understand user experience issues. Recordings mask sensitive
              inputs like passwords. For more information, see{' '}
              <a
                href='https://posthog.com/privacy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                PostHog&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Local Storage
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              In addition to cookies, we use browser local storage to enhance
              your experience. Local storage is similar to cookies but allows us
              to store larger amounts of data locally on your device.
            </p>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-zinc-300 border border-zinc-800 rounded-lg'>
                <thead className='bg-zinc-900/50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Key
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Purpose
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-zinc-800'>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      cookie_consent
                    </td>
                    <td className='px-4 py-3'>
                      Stores your cookie consent preferences
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      onboarding_completed
                    </td>
                    <td className='px-4 py-3'>
                      Tracks whether you&apos;ve completed the onboarding flow
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      theme_preference
                    </td>
                    <td className='px-4 py-3'>
                      Stores your dark/light mode preference
                    </td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-mono text-xs'>
                      last_location
                    </td>
                    <td className='px-4 py-3'>
                      Caches your location for personalized content
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Third-Party Cookies
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Some cookies are placed by third-party services that appear on our
              pages. We do not control these cookies. The third parties that set
              cookies on our site include:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>PostHog</strong> - Product analytics and session
                recording
              </li>
              <li>
                <strong>Stripe</strong> - Payment processing (only on checkout
                pages)
              </li>
              <li>
                <strong>Vercel</strong> - Website hosting and performance
                optimization
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Each of these services has their own privacy and cookie policies.
              We encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Managing Your Cookie Preferences
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              5.1 Cookie Consent Banner
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              When you first visit our website, you will see a cookie consent
              banner that allows you to accept or reject non-essential cookies.
              You can change your preferences at any time by clicking the
              &quot;Cookie Settings&quot; link in the footer of our website.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.2 Browser Settings
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Most web browsers allow you to control cookies through their
              settings. You can typically:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>See what cookies you have and delete them individually</li>
              <li>Block third-party cookies</li>
              <li>Block cookies from specific sites</li>
              <li>Block all cookies</li>
              <li>Delete all cookies when you close your browser</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Please note that if you block or delete cookies, some features of
              our Service may not function properly.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.3 Opt-Out Links
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You can opt out of analytics tracking by:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2 mt-2'>
              <li>Rejecting analytics cookies in our cookie consent banner</li>
              <li>
                Using browser extensions like{' '}
                <a
                  href='https://tools.google.com/dlpage/gaoptout'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  Google Analytics Opt-out
                </a>
              </li>
              <li>
                Enabling &quot;Do Not Track&quot; in your browser (note: not all
                services honor this signal)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Updates to This Policy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We may update this Cookie Policy from time to time to reflect
              changes in our practices or for other operational, legal, or
              regulatory reasons. We will post any changes on this page and
              update the &quot;Last Updated&quot; date at the top. We encourage
              you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Contact Us
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have any questions about our use of cookies, please contact
              us:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                Email:{' '}
                <a
                  href='mailto:privacy@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  privacy@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-zinc-800'>
            <h2 className='text-lg font-medium text-white mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
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
