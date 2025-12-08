import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';

export const metadata: Metadata = {
  title: 'Referral Program Terms | Lunary',
  description:
    'Terms and conditions for the Lunary referral program. Learn how to earn rewards by referring friends.',
  robots: 'index, follow',
};

export default function ReferralTermsPage() {
  const lastUpdated = 'December 6, 2025';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <main className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mb-8'>
          <h1 className='text-4xl font-semibold text-white mb-4'>
            Referral Program Terms
          </h1>
          <p className='text-sm text-zinc-500'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              These Referral Program Terms (&quot;Referral Terms&quot;) govern
              your participation in the Lunary referral program (the
              &quot;Program&quot;) offered by Lunar Computing, Inc.
              (&quot;Lunary,&quot; &quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). By participating in the Program, you agree to
              these Referral Terms in addition to our{' '}
              <Link
                href='/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Terms of Service
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Eligibility
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To participate in the Lunary referral program, you must:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Have an active Lunary account in good standing</li>
              <li>Be at least 18 years of age</li>
              <li>Not be an employee or contractor of Lunar Computing, Inc.</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              We reserve the right to determine eligibility and to disqualify
              any participant at our sole discretion.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. How the Program Works
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              2.1 Your Referral Code
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              As an eligible participant, you will receive a unique referral
              code or link that you can share with friends, family, and others.
              Your referral code can be found in your Lunary profile settings.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.2 Successful Referrals
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              A referral is considered successful when:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                The referred person creates a new Lunary account using your
                referral code or link
              </li>
              <li>
                The referred person has not previously had a Lunary account
              </li>
              <li>
                The referred person completes any required qualifying actions
                (such as subscribing to Lunary+)
              </li>
              <li>
                The referral is not flagged as fraudulent or in violation of
                these terms
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              2.3 Reward Structure
            </h3>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              Rewards for successful referrals may include:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Free months of Lunary+ subscription</li>
              <li>Account credits</li>
              <li>Exclusive features or content</li>
              <li>Other rewards as specified by Lunary from time to time</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              The specific rewards available at any time will be displayed in
              your Lunary account. Reward values and structures are subject to
              change.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Referral Limits
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                There may be limits on the number of referrals that can earn
                rewards within a given time period
              </li>
              <li>
                Each person may only be referred once; duplicate referrals will
                not earn rewards
              </li>
              <li>Self-referrals are not permitted</li>
              <li>
                We reserve the right to cap total rewards earned through the
                Program
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Prohibited Activities
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              The following activities are prohibited and may result in
              disqualification from the Program and forfeiture of rewards:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Self-referral:</strong> Creating multiple accounts to
                refer yourself
              </li>
              <li>
                <strong>Fake accounts:</strong> Referring fake, temporary, or
                fraudulent accounts
              </li>
              <li>
                <strong>Spam:</strong> Sending unsolicited bulk messages or spam
                containing your referral link
              </li>
              <li>
                <strong>Paid advertising:</strong> Using paid advertisements to
                promote your referral link without prior written approval
              </li>
              <li>
                <strong>Misleading claims:</strong> Making false or misleading
                statements about Lunary or the referral program
              </li>
              <li>
                <strong>Trademark misuse:</strong> Using Lunary trademarks in
                domain names, social media handles, or paid search keywords
              </li>
              <li>
                <strong>Incentive manipulation:</strong> Offering to split
                rewards or providing other incentives that undermine the program
              </li>
              <li>
                <strong>Bot or automated referrals:</strong> Using automated
                tools or bots to generate referrals
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Reward Redemption and Expiration
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              5.1 Earning Rewards
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Rewards will be credited to your account within 7 days of a
              successful referral being confirmed. We may delay crediting
              rewards pending verification of the referral&apos;s validity.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.2 Using Rewards
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Referral rewards are non-transferable and cannot be exchanged for
              cash. Rewards apply to your Lunary account only and may be subject
              to additional terms.
            </p>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              5.3 Expiration
            </h3>
            <p className='text-zinc-300 leading-relaxed'>
              Referral rewards may expire if not used within 12 months of being
              earned, or if your account is terminated or suspended. We will
              provide notice before expiring earned rewards where possible.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Fraud Prevention
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              We actively monitor for fraudulent activity in our referral
              program. If we determine that you have engaged in fraudulent or
              abusive behavior, we may:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>Revoke pending or earned rewards</li>
              <li>Disqualify you from the Program permanently</li>
              <li>Suspend or terminate your Lunary account</li>
              <li>Take legal action to recover losses</li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              Our determination of fraud is final. We are not obligated to
              provide evidence or explanation for fraud determinations.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Program Modifications
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              We reserve the right to modify, suspend, or terminate the Referral
              Program at any time and for any reason. Changes may include
              adjustments to reward values, eligibility requirements, or program
              rules. We will provide reasonable notice of material changes where
              possible. Earned rewards that have been confirmed will be honored
              even if the program is modified or terminated.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Tax Responsibility
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              You are solely responsible for any tax obligations arising from
              your participation in the Program and receipt of rewards. Lunary
              does not provide tax advice. Depending on your jurisdiction and
              the total value of rewards earned, you may be required to report
              referral rewards as income. Consult a tax professional for
              guidance.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              9. Privacy
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              When you share your referral link, you are responsible for
              obtaining any necessary consents from the people you refer. We
              collect and process personal information in accordance with our{' '}
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Privacy Policy
              </Link>
              . We may use your referral activity data to improve the Program
              and prevent fraud.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              10. Disclaimer
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              THE REFERRAL PROGRAM IS PROVIDED &quot;AS IS&quot; WITHOUT
              WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THE AVAILABILITY OF
              REWARDS, THE OPERATION OF THE PROGRAM, OR THE ACCURACY OF REFERRAL
              TRACKING. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE DISCLAIM ALL
              LIABILITY ARISING FROM YOUR PARTICIPATION IN THE PROGRAM.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              11. Contact
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              For questions about the referral program:
            </p>
            <div className='p-4 border border-zinc-800 bg-zinc-900/30 rounded-xl'>
              <p className='text-zinc-300'>
                <strong>Referral Support:</strong>{' '}
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
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Privacy Policy
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
