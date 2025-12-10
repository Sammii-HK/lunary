import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'API Terms of Service | Lunary',
  description:
    'Terms and conditions for developers using the Lunary API to access cosmic data, horoscopes, and astrological information.',
  robots: 'index, follow',
};

export default function APITermsPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            API Terms of Service
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              These API Terms of Service (&quot;API Terms&quot;) govern your
              access to and use of the Lunary Application Programming Interface
              (&quot;API&quot;) provided by Lunar Computing, Inc.
              (&quot;Lunary,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). These API Terms are in addition to our general{' '}
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Privacy Policy
              </Link>
              .
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              By accessing or using the Lunary API, you agree to be bound by
              these API Terms. If you are using the API on behalf of an
              organization, you represent that you have the authority to bind
              that organization to these terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. API Access and Registration
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 API Keys
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To access the Lunary API, you must register for an API key. You
              agree to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Provide accurate and complete registration information</li>
              <li>Keep your API key confidential and secure</li>
              <li>
                Not share, sell, or transfer your API key to third parties
              </li>
              <li>
                Immediately notify us if you suspect unauthorized use of your
                API key
              </li>
              <li>
                Use only one API key per application unless authorized otherwise
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 API Key Security
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You are responsible for all activity that occurs under your API
              key. We reserve the right to revoke API keys that we believe have
              been compromised or are being misused.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Rate Limits and Usage Tiers
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              The Lunary API is available in multiple tiers with different rate
              limits and features:
            </p>

            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-zinc-300 border border-zinc-800 rounded-lg'>
                <thead className='bg-zinc-900/50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Tier
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Rate Limit
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Commercial Use
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-white'>
                      Support
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-zinc-800'>
                  <tr>
                    <td className='px-4 py-3 font-medium'>Free</td>
                    <td className='px-4 py-3'>100 requests/day</td>
                    <td className='px-4 py-3'>Non-commercial only</td>
                    <td className='px-4 py-3'>Community</td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-medium'>Paid</td>
                    <td className='px-4 py-3'>10,000 requests/day</td>
                    <td className='px-4 py-3'>Yes</td>
                    <td className='px-4 py-3'>Email support</td>
                  </tr>
                  <tr>
                    <td className='px-4 py-3 font-medium'>Enterprise</td>
                    <td className='px-4 py-3'>Custom</td>
                    <td className='px-4 py-3'>Yes</td>
                    <td className='px-4 py-3'>Dedicated support + SLA</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className='text-zinc-300 leading-relaxed mt-4'>
              Rate limits reset daily at midnight UTC. Exceeding rate limits may
              result in temporary throttling or suspension of API access.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Permitted Uses
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You may use the Lunary API to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Build applications that integrate cosmic data (moon phases,
                planetary transits, horoscopes)
              </li>
              <li>Create widgets and displays featuring Lunary data</li>
              <li>Develop research tools using astrological information</li>
              <li>
                Build complementary products that enhance the astrological
                experience
              </li>
              <li>
                Create integrations for personal productivity or wellness
                applications
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Prohibited Uses
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You may NOT use the Lunary API to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Resell raw data:</strong> Sell, sublicense, or
                redistribute API data directly without substantial
                transformation or added value
              </li>
              <li>
                <strong>Build competing services:</strong> Create a service that
                directly competes with Lunary&apos;s core offerings using our
                data
              </li>
              <li>
                <strong>Scrape or bulk download:</strong> Systematically
                download or cache large amounts of data beyond what is needed
                for your application
              </li>
              <li>
                <strong>Misrepresent source:</strong> Present API data as if it
                originated from your own systems without attribution
              </li>
              <li>
                <strong>Violate laws:</strong> Use the API for any illegal
                purpose or in violation of any applicable laws
              </li>
              <li>
                <strong>Harm users:</strong> Use the API in ways that could harm
                users, including providing misleading &quot;advice&quot;
              </li>
              <li>
                <strong>Circumvent security:</strong> Attempt to circumvent rate
                limits, authentication, or other security measures
              </li>
              <li>
                <strong>Reverse engineer:</strong> Reverse engineer, decompile,
                or attempt to extract source code from the API
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Attribution Requirements
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              When displaying data from the Lunary API, you must provide
              appropriate attribution:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Display &quot;Powered by Lunary&quot; or the Lunary logo in your
                application
              </li>
              <li>
                Include a link to{' '}
                <a
                  href='https://lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  lunary.app
                </a>{' '}
                where technically feasible
              </li>
              <li>Do not modify, obscure, or remove required attribution</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Enterprise tier customers may negotiate modified attribution
              requirements. See our{' '}
              <Link
                href='/trademark'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Trademark Guidelines
              </Link>{' '}
              for logo usage rules.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Intellectual Property
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              6.1 Lunary&apos;s Rights
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              The Lunary API and all data provided through it are the property
              of Lunar Computing, Inc. Your use of the API does not grant you
              any ownership rights to the API, its data, or any related
              intellectual property.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              6.2 Your Rights
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You retain all rights to your application code and any original
              content you create. The license granted to you for using the API
              is non-exclusive, non-transferable, and revocable.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Data Accuracy Disclaimer
            </h2>
            <div className='p-4 border border-lunary-accent-700 bg-lunary-accent-950/20 rounded-xl'>
              <p className='text-zinc-300 leading-relaxed'>
                <strong>Important:</strong> The Lunary API provides astrological
                and cosmic data for entertainment and informational purposes
                only. While we strive for accuracy in astronomical calculations,
                we do not guarantee the accuracy, completeness, or reliability
                of any data provided. Astrological interpretations are
                subjective and should not be relied upon for making important
                life decisions. You are responsible for how you present and use
                this data in your applications.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Service Level Agreement (Enterprise)
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Enterprise tier customers receive the following SLA commitments:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Uptime:</strong> 99.9% monthly uptime target
              </li>
              <li>
                <strong>Response Time:</strong> Average API response time under
                200ms
              </li>
              <li>
                <strong>Support:</strong> Response within 4 business hours for
                critical issues
              </li>
              <li>
                <strong>Maintenance:</strong> Scheduled maintenance windows with
                48-hour advance notice
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Free and Paid tier users receive best-effort service without
              uptime guarantees.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Pricing and Payment
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Paid API access is billed monthly or annually based on your
              selected tier. We reserve the right to change pricing with 30
              days&apos; notice. Price changes will not affect your current
              billing period.
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              Overages beyond your tier&apos;s rate limits may incur additional
              charges at our published overage rates, or your access may be
              throttled until the next billing period.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              10. Termination
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>10.1 By You</h3>
            <p className='text-zinc-300 leading-relaxed'>
              You may stop using the API and cancel your API access at any time.
              For paid tiers, cancellation will take effect at the end of your
              current billing period.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              10.2 By Lunary
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We may suspend or terminate your API access immediately if:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>You violate these API Terms or our Terms of Service</li>
              <li>Your API key is compromised</li>
              <li>We are required to do so by law</li>
              <li>Your use poses a security risk to our systems or users</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We may also discontinue the API or any features with 90 days&apos;
              notice (30 days for free tier).
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              11. Limitation of Liability
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUNARY SHALL NOT BE LIABLE
              FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
              DAMAGES ARISING OUT OF YOUR USE OF THE API, INCLUDING BUT NOT
              LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS OPPORTUNITIES. OUR
              TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNTS PAID BY YOU FOR API
              ACCESS IN THE TWELVE MONTHS PRECEDING THE CLAIM.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              12. Changes to API and Terms
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We may modify the API, including adding or removing features, at
              any time. We will provide reasonable notice for material changes
              that may affect your integration. We may also update these API
              Terms, with changes taking effect upon posting to this page.
              Continued use of the API after changes constitutes acceptance of
              the new terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              13. Contact
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              For questions about the Lunary API or these terms:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>API Support:</strong>{' '}
                <a
                  href='mailto:api@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  api@lunary.app
                </a>
                <br />
                <strong>Enterprise Inquiries:</strong>{' '}
                <a
                  href='mailto:enterprise@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  enterprise@lunary.app
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
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/trademark'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Trademark Guidelines
              </Link>
              <Link
                href='/acceptable-use'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Acceptable Use Policy
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
