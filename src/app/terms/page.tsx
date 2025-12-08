import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | Lunary',
  description:
    'Read the terms and conditions governing your use of Lunary, the AI-powered astrology platform.',
  robots: 'index, follow',
};

export default function TermsOfServicePage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Terms of Service
          </h1>
          <p className='text-sm text-zinc-500'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Welcome to Lunary. These Terms of Service (&quot;Terms&quot;)
              govern your access to and use of the Lunary website, mobile
              application, and services (collectively, the &quot;Service&quot;)
              provided by Lunar Computing, Inc. (&quot;Lunary,&quot;
              &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
            </p>
            <p className='text-zinc-300 leading-relaxed'>
              By accessing or using the Service, you agree to be bound by these
              Terms. If you do not agree to these Terms, you may not access or
              use the Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Eligibility and Account Registration
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Age Requirement
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You must be at least 13 years of age to use the Service. If you
              are under 18, you represent that you have your parent or
              guardian&apos;s permission to use the Service. By using the
              Service, you represent and warrant that you meet these eligibility
              requirements.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Account Creation
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To access certain features of the Service, you must create an
              account. When you create an account, you agree to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Provide accurate, current, and complete information</li>
              <li>
                Maintain and promptly update your account information to keep it
                accurate
              </li>
              <li>
                Maintain the security of your password and accept all risks of
                unauthorized access
              </li>
              <li>
                Notify us immediately if you discover or suspect any security
                breaches related to the Service
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.3 Account Responsibility
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You are responsible for all activities that occur under your
              account. You may not share your account credentials with others or
              allow others to access your account. We reserve the right to
              suspend or terminate accounts that we reasonably believe are being
              shared or accessed by multiple individuals.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Subscriptions and Payments
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              2.1 Subscription Plans
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Lunary offers both free and paid subscription plans. Paid plans
              (&quot;Lunary+&quot;) provide access to additional features as
              described on our pricing page. Subscription features and pricing
              are subject to change, and we will provide reasonable notice of
              any material changes.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.2 Billing and Payment
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              By subscribing to a paid plan, you authorize us to charge your
              payment method through our payment processor, Stripe, Inc. You
              agree to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Pay all fees associated with your subscription plan</li>
              <li>Provide valid and current payment information</li>
              <li>
                Be responsible for all charges incurred under your account
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.3 Auto-Renewal
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Paid subscriptions automatically renew at the end of each billing
              period (monthly or annually, depending on your plan) unless you
              cancel before the renewal date. You will be charged the
              then-current subscription rate at each renewal. You may cancel
              your subscription at any time through your account settings or by
              contacting support.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.4 Price Changes
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to change subscription prices. Any price
              changes will be communicated to you at least 30 days before they
              take effect. If you do not agree to the price change, you may
              cancel your subscription before the new price takes effect.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.5 Refunds
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              For information about our refund policies, please see our{' '}
              <Link
                href='/refund'
                className='text-purple-400 hover:text-purple-300'
              >
                Refund Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Acceptable Use
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              You agree to use the Service only for lawful purposes and in
              accordance with these Terms. You agree not to:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Violate any applicable laws, regulations, or third-party rights
              </li>
              <li>
                Use the Service to transmit harmful, offensive, or inappropriate
                content
              </li>
              <li>
                Attempt to gain unauthorized access to any part of the Service
              </li>
              <li>
                Interfere with or disrupt the Service or servers/networks
                connected to it
              </li>
              <li>
                Use automated means (bots, scrapers) to access the Service
                without authorization
              </li>
              <li>
                Reverse engineer, decompile, or attempt to extract the source
                code of the Service
              </li>
              <li>Impersonate any person or entity</li>
              <li>
                Use the Service to send spam or unsolicited communications
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              For complete details, please see our{' '}
              <Link
                href='/acceptable-use'
                className='text-purple-400 hover:text-purple-300'
              >
                Acceptable Use Policy
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Intellectual Property
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              4.1 Our Content
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              The Service and its original content (excluding content provided
              by users), features, and functionality are and will remain the
              exclusive property of Lunar Computing, Inc. and its licensors. The
              Service is protected by copyright, trademark, and other laws of
              both the United States and foreign countries. Our trademarks and
              trade dress may not be used in connection with any product or
              service without our prior written consent. See our{' '}
              <Link
                href='/trademark'
                className='text-purple-400 hover:text-purple-300'
              >
                Trademark Guidelines
              </Link>{' '}
              for more information.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              4.2 Your Content
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You retain ownership of any content you create, upload, or
              otherwise provide through the Service (&quot;User Content&quot;).
              By providing User Content, you grant us a worldwide,
              non-exclusive, royalty-free license to use, copy, modify, and
              display your User Content solely for the purpose of providing and
              improving the Service. This license ends when you delete your User
              Content or your account, unless your content has been shared with
              others and they have not deleted it.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              4.3 Feedback
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              If you provide us with any feedback, suggestions, or ideas about
              the Service, you grant us the right to use such feedback without
              any restriction or compensation to you.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. AI Features and Generated Content
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Lunary uses artificial intelligence to generate astrological
              content, including horoscopes, interpretations, and chat
              responses. You acknowledge and agree that:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                AI-generated content is created algorithmically and may contain
                errors or inaccuracies
              </li>
              <li>
                We do not guarantee the accuracy, completeness, or reliability
                of AI-generated content
              </li>
              <li>
                AI-generated content should not be relied upon for important
                decisions
              </li>
              <li>
                You are responsible for how you use and interpret AI-generated
                content
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Disclaimer of Warranties
            </h2>
            <div className='p-4 border border-lunary-accent-700 bg-lunary-accent-950/20 rounded-xl'>
              <h3 className='text-lg font-medium text-white mb-3'>
                Entertainment Purposes Only
              </h3>
              <p className='text-zinc-300 leading-relaxed'>
                <strong>
                  The Service, including all astrological content, horoscopes,
                  tarot readings, birth chart analyses, and AI-generated
                  insights, is provided for entertainment and informational
                  purposes only.
                </strong>{' '}
                Lunary does not provide professional advice of any kind,
                including but not limited to medical, psychological, financial,
                legal, or relationship advice. The content should not be used as
                a substitute for professional consultation or treatment.
              </p>
            </div>

            <p className='text-zinc-300 leading-relaxed mt-6'>
              THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS
              AVAILABLE&quot; BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED
              WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
              NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
            </p>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We do not warrant that: (a) the Service will function
              uninterrupted, secure, or available at any particular time or
              location; (b) any errors or defects will be corrected; (c) the
              Service is free of viruses or other harmful components; or (d) the
              results of using the Service will meet your requirements.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Limitation of Liability
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT
              SHALL LUNAR COMPUTING, INC., ITS DIRECTORS, EMPLOYEES, PARTNERS,
              AGENTS, SUPPLIERS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING
              WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER
              INTANGIBLE LOSSES, RESULTING FROM: (A) YOUR ACCESS TO OR USE OF OR
              INABILITY TO ACCESS OR USE THE SERVICE; (B) ANY CONDUCT OR CONTENT
              OF ANY THIRD PARTY ON THE SERVICE; (C) ANY CONTENT OBTAINED FROM
              THE SERVICE; OR (D) UNAUTHORIZED ACCESS, USE, OR ALTERATION OF
              YOUR TRANSMISSIONS OR CONTENT, WHETHER BASED ON WARRANTY,
              CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY,
              WHETHER OR NOT WE HAVE BEEN INFORMED OF THE POSSIBILITY OF SUCH
              DAMAGE.
            </p>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS
              RELATING TO THE SERVICE EXCEED THE GREATER OF (A) THE AMOUNTS PAID
              BY YOU TO LUNARY IN THE TWELVE (12) MONTHS PRIOR TO THE CLAIM, OR
              (B) ONE HUNDRED U.S. DOLLARS ($100).
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Indemnification
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              You agree to defend, indemnify, and hold harmless Lunar Computing,
              Inc. and its officers, directors, employees, and agents from and
              against any claims, liabilities, damages, judgments, awards,
              losses, costs, expenses, or fees (including reasonable
              attorneys&apos; fees) arising out of or relating to your violation
              of these Terms or your use of the Service.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Termination
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              9.1 Termination by You
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You may terminate your account at any time by canceling your
              subscription (if applicable) and deleting your account through
              your profile settings, or by contacting us at support@lunary.app.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              9.2 Termination by Us
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              We may terminate or suspend your account and access to the Service
              immediately, without prior notice or liability, for any reason,
              including without limitation if you breach these Terms. Upon
              termination, your right to use the Service will immediately cease.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              9.3 Effect of Termination
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Upon termination, all provisions of these Terms which by their
              nature should survive termination shall survive, including
              ownership provisions, warranty disclaimers, indemnity, and
              limitations of liability.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              10. Dispute Resolution
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              10.1 Informal Resolution
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Before filing a claim against Lunary, you agree to try to resolve
              the dispute informally by contacting us at legal@lunary.app. We
              will attempt to resolve the dispute informally by contacting you
              via email. If a dispute is not resolved within 60 days of
              submission, you or Lunary may bring a formal proceeding.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              10.2 Arbitration Agreement
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              You and Lunary agree that any dispute, claim, or controversy
              arising out of or relating to these Terms or the Service shall be
              resolved by binding arbitration, rather than in court, except that
              either party may seek equitable relief in court for infringement
              or misuse of intellectual property rights. The arbitration will be
              conducted by JAMS under its applicable rules. The
              arbitrator&apos;s decision shall be final and binding.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              10.3 Class Action Waiver
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              YOU AND LUNARY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER
              ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR
              CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              11. Governing Law
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              These Terms shall be governed by and construed in accordance with
              the laws of the State of Delaware, United States, without regard
              to its conflict of law provisions. Our failure to enforce any
              right or provision of these Terms will not be considered a waiver
              of those rights.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              12. Changes to Terms
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to modify or replace these Terms at any time
              at our sole discretion. If a revision is material, we will provide
              at least 30 days&apos; notice prior to any new terms taking
              effect. What constitutes a material change will be determined at
              our sole discretion. By continuing to access or use our Service
              after those revisions become effective, you agree to be bound by
              the revised terms.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              13. Severability
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              If any provision of these Terms is held to be unenforceable or
              invalid, such provision will be changed and interpreted to
              accomplish the objectives of such provision to the greatest extent
              possible under applicable law, and the remaining provisions will
              continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              14. Entire Agreement
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              These Terms, together with the Privacy Policy, Cookie Policy,
              Acceptable Use Policy, and any other legal notices published by us
              on the Service, constitute the entire agreement between you and
              Lunary concerning the Service and supersede all prior agreements
              and understandings.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              15. Contact Us
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have any questions about these Terms, please contact us:
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
                  href='mailto:legal@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
                >
                  legal@lunary.app
                </a>
                <br />
                General Support:{' '}
                <a
                  href='mailto:support@lunary.app'
                  className='text-purple-400 hover:text-purple-300'
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
                href='/privacy'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Privacy Policy
              </Link>
              <Link
                href='/cookies'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Cookie Policy
              </Link>
              <Link
                href='/acceptable-use'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Acceptable Use Policy
              </Link>
              <Link
                href='/refund'
                className='text-purple-400 hover:text-purple-300 text-sm'
              >
                Refund Policy
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
