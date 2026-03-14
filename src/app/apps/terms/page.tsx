import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Terms of Service | Lunary iOS Apps',
  description:
    "Terms and conditions for Lunary iOS apps (Yes/No Oracle, Spell Book, Astrologer's Ephemeris).",
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/terms',
  },
};

export default function AppsTermsOfServicePage() {
  const lastUpdated = 'March 14, 2026';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Terms of Service: Lunary iOS Apps
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              These Terms of Service (&quot;Terms&quot;) govern your access to
              and use of the Lunary iOS applications, including Yes/No Oracle,
              Spell Book, and Astrologer&apos;s Ephemeris (collectively, the
              &quot;Apps&quot;) provided by Lunar Computing, Inc.
              (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              By downloading and using the Apps, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Apps.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. License and Use
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Subject to your compliance with these Terms, we grant you a
              limited, non-exclusive, non-transferable license to download and
              use the Apps on your Apple device for personal, non-commercial
              use. You may not:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Copy, modify, or create derivative works of the Apps</li>
              <li>
                Reverse engineer, decompile, disassemble, or attempt to derive
                the source code
              </li>
              <li>
                Distribute, lease, loan, rent, or otherwise transfer the Apps
              </li>
              <li>Use the Apps to develop competing products or services</li>
              <li>
                Remove or alter any proprietary notices, labels, or marks in the
                Apps
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Account and Authentication
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              2.1 Apple ID Sign In
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              The Apps use Sign in with Apple for authentication. By signing in,
              you are responsible for maintaining the confidentiality of your
              Apple account. You are solely responsible for all activities that
              occur under your account.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.2 Age Requirement
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You must be at least 16 years of age to use the Apps. By using the
              Apps, you represent and warrant that you meet this eligibility
              requirement.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. In-App Purchases
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Some Apps offer premium features available via in-app purchase
              (managed by Apple). When you make a purchase:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                You are purchasing from Apple, not from us. Apple processes all
                payments.
              </li>
              <li>
                Refund requests must be submitted to Apple. See{' '}
                <a
                  href='https://support.apple.com/en-us/HT204084'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  Apple&apos;s refund policy
                </a>
                .
              </li>
              <li>
                All purchases are final unless a refund is approved by Apple.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Content and Data
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              4.1 Your Data
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You retain ownership of any data you create or store in the Apps
              (e.g., saved readings, notes, collections). Your data is stored
              securely using Apple CloudKit and syncs only to your own Apple
              devices. We do not access your encrypted CloudKit data.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              4.2 App Content
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              The Apps contain content (such as tarot card descriptions, spell
              information, astronomical data, and ephemeris calculations) that
              is provided for informational and entertainment purposes only.
              This content is not medical, legal, financial, or professional
              advice.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              4.3 Disclaimer of Professional Advice
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              The Apps are tools for spiritual exploration and reflection. They
              are not a substitute for professional consultation with medical
              doctors, therapists, legal advisors, financial advisors, or other
              qualified professionals. Always consult a qualified professional
              for important decisions.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Prohibited Conduct
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You agree to use the Apps only for lawful purposes. You agree not
              to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Use the Apps in any way that violates any applicable law or
                regulation
              </li>
              <li>
                Attempt to gain unauthorized access to the Apps or related
                systems
              </li>
              <li>Use automated tools to extract data from the Apps</li>
              <li>
                Harass, threaten, abuse, or otherwise harm others through the
                Apps
              </li>
              <li>
                Attempt to circumvent security measures or reverse-engineer the
                Apps
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Limitation of Liability
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                The Apps are provided &quot;as is&quot; and &quot;as
                available&quot; without warranties of any kind
              </li>
              <li>
                We are not liable for any indirect, incidental, special,
                consequential, or punitive damages
              </li>
              <li>
                We are not liable for loss of data, business interruption, or
                other disruptions
              </li>
              <li>
                Our total liability to you is limited to the amount you paid for
                in-app purchases in the past 12 months, or £10, whichever is
                greater
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Termination
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to suspend or terminate your access to the
              Apps if you violate these Terms or engage in prohibited conduct.
              You may delete the Apps at any time from your device.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Changes to These Terms
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We may update these Terms from time to time. Continued use of the
              Apps following any changes constitutes your acceptance of the new
              Terms. We encourage you to review these Terms periodically.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Contact Us
            </h2>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                131 Continental Dr, Suite 305
                <br />
                Newark, DE 19713, USA
                <br />
                <br />
                Email:{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  support@lunary.app
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
                href='/apps/yesnooracle/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Yes/No Oracle Privacy
              </Link>
              <Link
                href='/apps/spellbook/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Spell Book Privacy
              </Link>
              <Link
                href='/apps/ephemeris/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Ephemeris Privacy
              </Link>
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Lunary Web Terms
              </Link>
            </div>
          </section>
        </div>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
