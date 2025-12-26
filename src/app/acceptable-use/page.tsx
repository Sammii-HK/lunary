import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy | Lunary',
  description:
    "Guidelines for acceptable use of Lunary's platform, including AI features and community standards.",
  robots: 'index, follow',
};

export default function AcceptableUsePolicyPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Acceptable Use Policy
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              This Acceptable Use Policy (&quot;AUP&quot;) governs your use of
              the Lunary website, application, and services (collectively, the
              &quot;Service&quot;) provided by Lunar Computing, Inc.
              (&quot;Lunary,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). This AUP is part of and incorporated into our{' '}
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Terms of Service
              </Link>
              .
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              By using the Service, you agree to comply with this AUP. We may
              update this policy at any time, and continued use of the Service
              after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Prohibited Activities
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You agree not to engage in any of the following prohibited
              activities:
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Illegal Activities
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Using the Service for any purpose that violates applicable
                local, state, national, or international law
              </li>
              <li>
                Engaging in fraud, money laundering, or other financial crimes
              </li>
              <li>
                Violating any intellectual property rights, including
                copyrights, trademarks, or trade secrets
              </li>
              <li>
                Distributing, promoting, or facilitating child exploitation
                material
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Harmful Content
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Creating, transmitting, or storing content that is hateful,
                discriminatory, or promotes violence against individuals or
                groups
              </li>
              <li>Harassing, bullying, or threatening other users</li>
              <li>
                Posting sexually explicit content or content inappropriate for
                our platform
              </li>
              <li>
                Sharing content that promotes self-harm, suicide, or eating
                disorders
              </li>
              <li>Spreading misinformation or disinformation</li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.3 Security Violations
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Attempting to gain unauthorized access to the Service, other
                accounts, or computer systems
              </li>
              <li>Distributing viruses, malware, or other malicious code</li>
              <li>
                Conducting security attacks, including denial of service (DoS)
                attacks
              </li>
              <li>
                Probing, scanning, or testing the vulnerability of our systems
                without authorization
              </li>
              <li>
                Circumventing or attempting to circumvent any security measures
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.4 Service Abuse
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Using automated scripts, bots, or scrapers to access the Service
                without authorization
              </li>
              <li>Overloading our infrastructure with excessive requests</li>
              <li>
                Interfering with other users&apos; enjoyment of the Service
              </li>
              <li>
                Creating multiple accounts to circumvent limitations or bans
              </li>
              <li>
                Reselling or redistributing access to the Service without
                authorization
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. AI Chat and Content Guidelines
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              When using our AI-powered features (including Lunary GPT and chat
              functionalities), you agree to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Not attempt to manipulate the AI to produce harmful, illegal, or
                inappropriate content
              </li>
              <li>
                Not use the AI to generate spam, phishing content, or deceptive
                material
              </li>
              <li>
                Not submit prompts designed to extract system prompts,
                instructions, or proprietary information
              </li>
              <li>
                Not use AI-generated content to impersonate individuals or
                entities
              </li>
              <li>
                Understand that AI responses are for entertainment and should
                not be relied upon for professional advice
              </li>
            </ul>

            <div className='mt-6 p-4 border border-lunary-accent-700 bg-lunary-accent-950/20 rounded-xl'>
              <p className='text-zinc-300 text-sm'>
                <strong>Note:</strong> AI-generated content may occasionally
                produce inaccurate or unexpected results. You are responsible
                for reviewing and using AI content appropriately. Do not rely on
                AI responses for medical, legal, financial, or other
                professional decisions.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Account Sharing and Access
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Personal Use:</strong> Your Lunary account is for your
                personal use only. You may not share your login credentials with
                others.
              </li>
              <li>
                <strong>Single User:</strong> Each subscription is licensed for
                a single user. Sharing subscriptions or allowing multiple people
                to use one account is prohibited.
              </li>
              <li>
                <strong>Device Limits:</strong> While you may use your account
                on multiple personal devices, simultaneous use patterns
                suggesting account sharing may result in account review.
              </li>
              <li>
                <strong>Security:</strong> You are responsible for maintaining
                the confidentiality of your account credentials and for all
                activities that occur under your account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Content You Create
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You retain ownership of content you create using the Service (such
              as journal entries and notes). However, you agree that:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Your content must comply with this AUP and our Terms of Service
              </li>
              <li>
                You will not use the Service to store or transmit content that
                you do not have the right to use
              </li>
              <li>
                We may remove content that violates our policies without prior
                notice
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Enforcement
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We reserve the right to investigate and take appropriate action
              against anyone who violates this AUP, including:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Issuing warnings</li>
              <li>
                Temporarily or permanently suspending or terminating accounts
              </li>
              <li>Removing or disabling access to content</li>
              <li>
                Reporting violations to law enforcement or other authorities
              </li>
              <li>Taking legal action</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We may take these actions without prior notice and without
              liability to you. Violation of this AUP may also result in the
              termination of your subscription without refund.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Reporting Violations
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you become aware of any violation of this AUP, please report it
              to us:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Report Abuse:</strong>{' '}
                <a
                  href='mailto:abuse@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  abuse@lunary.app
                </a>
                <br />
                <strong>General Support:</strong>{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  support@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Contact Us
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have questions about this Acceptable Use Policy, please
              contact us:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                Email:{' '}
                <a
                  href='mailto:legal@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  legal@lunary.app
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
                href='/dmca'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                DMCA Policy
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
