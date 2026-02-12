import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | Lunary',
  description:
    'Learn how Lunary collects, uses, and protects your personal information. GDPR and CCPA compliant.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'February 11, 2026';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Privacy Policy
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Lunar Computing, Inc. (&quot;Lunary,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;) is committed to protecting
              your privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our website,
              mobile application, and services (collectively, the
              &quot;Service&quot;).
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              By using the Service, you agree to the collection and use of
              information in accordance with this policy. If you do not agree
              with our policies and practices, please do not use our Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Information We Collect
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Information You Provide
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We collect information you voluntarily provide when using our
              Service:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Account Information:</strong> Email address, name, and
                password when you create an account
              </li>
              <li>
                <strong>Profile Information:</strong> Birthday, birth time, and
                birth location for astrological calculations
              </li>
              <li>
                <strong>User Content:</strong> Journal entries, notes, saved
                tarot readings, collections you create, and posts submitted to
                community spaces
              </li>
              <li>
                <strong>Communication Data:</strong> Messages sent through our
                AI chat features or customer support
              </li>
              <li>
                <strong>Payment Information:</strong> Billing details processed
                through our payment provider (see Section 4)
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Journals, reflections, dreams, and other written entries are
              user-generated content stored privately within your account. This
              content is not reviewed manually and is not shared publicly unless
              you explicitly choose to do so.
            </p>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              <strong>Community spaces:</strong> Posts you submit to community
              spaces are visible to other authenticated users of that space. You
              may choose to post anonymously; however, anonymous posts remain
              linked to your account internally for moderation and safety
              purposes. Community posts are subject to automated content
              filtering and may be removed if they violate our policies.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Information Collected Automatically
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              When you access the Service, we automatically collect:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Device Information:</strong> Browser type, operating
                system, device identifiers
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, features used, time
                spent on the Service
              </li>
              <li>
                <strong>Log Data:</strong> IP address, access times, referring
                URLs
              </li>
              <li>
                <strong>Location Data:</strong> General geographic location
                based on IP address (not precise GPS)
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.3 Cookies and Similar Technologies
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              We use cookies and similar tracking technologies to collect and
              track information. For detailed information about our use of
              cookies, please see our{' '}
              <Link
                href='/cookies'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Cookie Policy
              </Link>
              .
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.4 Product Analytics & In-App Activity
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              We collect limited in-app usage data to understand how features
              are used, improve reliability, and develop new functionality. This
              can include interactions with app features, navigation flows, and
              content engagement tied to your account session. This data is
              processed as part of providing the service, is not used for
              advertising, and includes events stored in our databases as well
              as signed-in tracking that does not rely on cookie banners.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. How We Use Your Information
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We use the information we collect to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Provide, maintain, and improve the Service</li>
              <li>
                Generate personalized astrological content, horoscopes, and
                birth charts
              </li>
              <li>Process transactions and send related information</li>
              <li>
                Send you technical notices, updates, security alerts, and
                support messages
              </li>
              <li>
                Respond to your comments, questions, and customer service
                requests
              </li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our Service
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
              <li>Personalize and improve your experience</li>
              <li>
                Send promotional communications (with your consent, where
                required)
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Lunary may generate derived insights (such as themes, patterns, or
              summaries) based on your activity and content. These insights are
              for personal reflection and are not medical, psychological, or
              professional advice.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Legal Basis for Processing (GDPR)
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you are located in the European Economic Area (EEA), United
              Kingdom, or Switzerland, we process your personal data based on
              the following legal grounds:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Contract Performance:</strong> Processing necessary to
                provide you with the Service you requested
              </li>
              <li>
                <strong>Legitimate Interests:</strong> Processing for our
                legitimate business interests, such as fraud prevention,
                security, and service improvement
              </li>
              <li>
                <strong>Consent:</strong> Processing based on your specific
                consent (e.g., marketing communications, analytics cookies)
              </li>
              <li>
                <strong>Legal Obligation:</strong> Processing necessary to
                comply with legal requirements
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Payment Processing (Stripe)
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We use Stripe, Inc. as our payment processor. When you make a
              purchase:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>
                  Lunary does NOT store your credit card numbers or full payment
                  details.
                </strong>{' '}
                All payment card data is handled directly by Stripe.
              </li>
              <li>
                Stripe is PCI-DSS Level 1 certified, the highest level of
                certification in the payments industry.
              </li>
              <li>
                We only store a Stripe customer ID to link your account to your
                subscription status.
              </li>
              <li>
                We retain transaction history (dates, amounts, subscription
                status) for accounting and support purposes.
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              For information on how Stripe handles your payment data, please
              review{' '}
              <a
                href='https://stripe.com/privacy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Lunary GPT and AI Features
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Lunary offers AI-assisted features including Lunary GPT, an
              optional AI assistant. When you interact with our AI features:
            </p>

            <h3 className='text-xl font-medium text-white mb-3'>
              5.1 What Lunary GPT Receives
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                User-provided text (questions, reflections, tarot prompts)
              </li>
              <li>
                Non-identifying context needed to fulfill requests (e.g., birth
                date for chart calculations)
              </li>
              <li>Optional emotional or symbolic themes you choose to share</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-2'>
              Lunary GPT does not automatically access your Lunary account
              unless you explicitly provide information during the conversation.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.2 What Lunary GPT Does NOT Store
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Chat history on Lunary servers (conversations are ephemeral)
              </li>
              <li>Personal identifiers beyond the session</li>
              <li>Journal entries, tarot draws, or emotional reflections</li>
              <li>Any sensitive personal information</li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.3 How Lunary APIs Are Used
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-2'>
              When Lunary GPT calls our APIs (for birth charts, tarot, rituals,
              crystals, or cosmic data):
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Only the specific data required to fulfill the request is sent
              </li>
              <li>The action is processed server-side</li>
              <li>The result is returned to the conversation</li>
              <li>
                Lunary does not store any additional data unless done through a
                logged-in Lunary app session
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.4 Third-Party AI Processing
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Our AI features are powered by OpenAI. Chat content is processed
              by OpenAI&apos;s API to generate responses. We do not share
              personal identifiers, birth details, journaling content, or other
              identifying information with third parties except as necessary for
              AI model operation. For more information, see{' '}
              <a
                href='https://openai.com/privacy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                OpenAI&apos;s Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Information Sharing and Disclosure
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We do not sell your personal information. We may share your
              information in the following circumstances:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Service Providers:</strong> With third-party vendors who
                perform services on our behalf (hosting, analytics, payment
                processing, AI processing)
              </li>
              <li>
                <strong>Legal Requirements:</strong> If required by law,
                regulation, legal process, or governmental request
              </li>
              <li>
                <strong>Protection of Rights:</strong> To protect the rights,
                property, or safety of Lunary, our users, or others
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a
                merger, acquisition, or sale of assets
              </li>
              <li>
                <strong>With Your Consent:</strong> When you have given us
                explicit permission to share your information
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              6.1 Third-Party Services We Use
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Stripe:</strong> Payment processing
              </li>
              <li>
                <strong>PostHog:</strong> Product analytics (with your consent)
              </li>
              <li>
                <strong>Vercel:</strong> Website hosting and infrastructure
              </li>
              <li>
                <strong>OpenAI:</strong> AI-assisted features
              </li>
              <li>
                <strong>Resend:</strong> Transactional email delivery
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Data Retention
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We retain your personal information for as long as necessary to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Provide the Service to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce our agreements</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              When you delete your account, we will delete or anonymize your
              personal information within 30 days, except where we are required
              to retain certain information for legal or legitimate business
              purposes.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Your Rights and Choices
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              8.1 All Users
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Access:</strong> Request access to the personal
                information we hold about you
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate
                personal information
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal
                information
              </li>
              <li>
                <strong>Data Portability:</strong> Request a copy of your data
                in a portable format
              </li>
              <li>
                <strong>Opt-Out:</strong> Unsubscribe from marketing emails at
                any time
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              8.2 European Users (GDPR)
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you are in the EEA, UK, or Switzerland, you have additional
              rights:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Right to restrict processing of your personal information</li>
              <li>
                Right to object to processing based on legitimate interests
              </li>
              <li>Right to withdraw consent at any time</li>
              <li>
                Right to lodge a complaint with your local data protection
                authority
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6' id='ccpa'>
              8.3 California Residents (CCPA/CPRA)
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you are a California resident, you have the following rights
              under the California Consumer Privacy Act (CCPA) and California
              Privacy Rights Act (CPRA):
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Right to Know:</strong> Request disclosure of the
                categories and specific pieces of personal information we have
                collected
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of your
                personal information
              </li>
              <li>
                <strong>Right to Correct:</strong> Request correction of
                inaccurate personal information
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> Opt out of the sale or
                sharing of your personal information
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> Not receive
                discriminatory treatment for exercising your rights
              </li>
            </ul>

            <div className='mt-6 p-4 border border-lunary-primary-700 bg-lunary-primary-950/20 rounded-xl'>
              <h4 className='text-lg font-medium text-white mb-2'>
                Do Not Sell or Share My Personal Information
              </h4>
              <p className='text-zinc-300 text-sm'>
                Lunary does not sell your personal information in the
                traditional sense. However, some data sharing for analytics or
                advertising purposes may constitute a &quot;sale&quot; or
                &quot;share&quot; under CCPA. To opt out of any such sharing,
                please email{' '}
                <a
                  href='mailto:privacy@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  privacy@lunary.app
                </a>{' '}
                with the subject line &quot;Do Not Sell or Share My Personal
                Information.&quot;
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Data Subject Access Requests (DSAR)
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To exercise any of your rights described above, please submit a
              request by:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Emailing{' '}
                <a
                  href='mailto:privacy@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  privacy@lunary.app
                </a>
              </li>
              <li>
                Including &quot;Data Subject Request&quot; in the subject line
              </li>
              <li>
                Providing sufficient information to verify your identity and
                locate your data
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We will respond to your request within:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>GDPR requests:</strong> 30 days (extendable by 60 days
                for complex requests)
              </li>
              <li>
                <strong>CCPA requests:</strong> 45 days (extendable by 45 days
                if necessary)
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              10. Data Security
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These measures
              include encryption in transit (TLS/SSL), secure password hashing,
              access controls, and regular security assessments. However, no
              method of transmission over the Internet or electronic storage is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              11. International Data Transfers
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Lunary is based in the United States. If you are accessing the
              Service from outside the United States, please be aware that your
              information may be transferred to, stored, and processed in the
              United States and other countries where our service providers
              operate. We ensure appropriate safeguards are in place for such
              transfers, including Standard Contractual Clauses where required.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              12. Children&apos;s Privacy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              The Service is not intended for individuals under the age of 16.
              We do not knowingly collect personal information from individuals
              under 16. If you are a parent or guardian and believe your child
              has provided us with personal information, please contact us at{' '}
              <a
                href='mailto:privacy@lunary.app'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                privacy@lunary.app
              </a>
              , and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              13. Changes to This Privacy Policy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy on this page and updating the &quot;Last Updated&quot; date
              at the top. For significant changes, we may also send you an email
              notification. We encourage you to review this Privacy Policy
              periodically for any changes.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              14. Contact Us
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
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
                  href='mailto:privacy@lunary.app'
                  className='text-lunary-primary-400 hover:text-lunary-primary-300'
                >
                  privacy@lunary.app
                </a>
                <br />
                General Support:{' '}
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
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Terms of Service
              </Link>
              <Link
                href='/cookies'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Cookie Policy
              </Link>
              <Link
                href='/acceptable-use'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Acceptable Use Policy
              </Link>
              <Link
                href='/refund'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Refund Policy
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
