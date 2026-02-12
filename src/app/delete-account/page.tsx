import { Metadata } from 'next';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Delete Your Account | Lunary',
  description:
    'Learn how to delete your Lunary account and what happens to your data. Request account deletion from within the app or contact support.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/delete-account',
  },
};

export default function DeleteAccountPage() {
  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Account Deletion
          </h1>
          <p className='text-sm text-zinc-400'>
            How to delete your Lunary account and what happens to your data
          </p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. How to Request Deletion
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To delete your Lunary account:
            </p>
            <ol className='list-decimal pl-6 text-zinc-300 space-y-2'>
              <li>Open the Lunary app</li>
              <li>
                Go to <strong>Profile</strong> (bottom navigation)
              </li>
              <li>
                Tap the <strong>Settings</strong> tab
              </li>
              <li>
                Scroll to the bottom and tap <strong>Delete Account</strong>
              </li>
              <li>Confirm your decision when prompted</li>
            </ol>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              If you cannot access the app, you can request account deletion by
              emailing{' '}
              <a
                href='mailto:privacy@lunary.app'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                privacy@lunary.app
              </a>{' '}
              with the subject line &quot;Account Deletion Request&quot; and the
              email address associated with your account.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. What Happens Next
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                Your deletion request enters a{' '}
                <strong>30-day grace period</strong>. During this time, your
                account is deactivated but your data is still preserved.
              </li>
              <li>
                You can <strong>cancel the deletion</strong> at any time during
                the grace period by logging back in and choosing to restore your
                account.
              </li>
              <li>
                You will receive an <strong>email confirmation</strong> when
                your deletion request is submitted and when it is fully
                processed.
              </li>
              <li>
                Any active{' '}
                <strong>subscriptions are automatically cancelled</strong> as
                part of the deletion process.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. Data That Gets Deleted
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              After the grace period, the following data is permanently deleted:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Profile information:</strong> Name, birthday, birth
                time, birth location, and birth chart data
              </li>
              <li>
                <strong>Tarot readings:</strong> All saved readings and spreads
              </li>
              <li>
                <strong>Journal entries and notes:</strong> All written content,
                reflections, and patterns
              </li>
              <li>
                <strong>AI conversations:</strong> Chat history, prompts, and
                AI-generated insights
              </li>
              <li>
                <strong>Collections and saved content:</strong> All collections,
                folders, and bookmarked items
              </li>
              <li>
                <strong>Relationship profiles and synastry reports:</strong>{' '}
                Partner profiles and compatibility analyses
              </li>
              <li>
                <strong>Cosmic reports and horoscopes:</strong> Daily, monthly,
                and yearly personalized content
              </li>
              <li>
                <strong>Rituals and habits:</strong> Ritual tracking, weekly
                usage, and progress data
              </li>
              <li>
                <strong>Community content:</strong> Posts, moon circle insights,
                and community memberships
              </li>
              <li>
                <strong>Social connections:</strong> Friend connections,
                invites, and celebrations
              </li>
              <li>
                <strong>Streaks and progress:</strong> Usage streaks,
                gamification data, and onboarding completion
              </li>
              <li>
                <strong>Notification settings:</strong> Push tokens, email
                preferences, and newsletter subscriptions
              </li>
              <li>
                <strong>Payment records:</strong> Subscription history, purchase
                records, and billing data (Stripe subscription is cancelled)
              </li>
              <li>
                <strong>Authentication data:</strong> Login sessions, API keys,
                and account credentials
              </li>
              <li>
                <strong>Referral data:</strong> Referral codes, invite links,
                and associated records
              </li>
              <li>
                <strong>AI memory:</strong> Personalization data and learned
                preferences
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Data That Gets Anonymized
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              To maintain the integrity of aggregate analytics (e.g., total
              active users, feature usage trends), certain analytics records are
              anonymized rather than deleted:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Usage activity:</strong> Your user ID is replaced with
                &quot;deleted&quot; so that activity counts remain accurate but
                can no longer be linked back to you
              </li>
              <li>
                <strong>Conversion events:</strong> Anonymized in the same way
                for aggregate reporting
              </li>
              <li>
                <strong>AI usage metrics:</strong> Token counts and usage
                patterns are anonymized
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. Data Retained for Legal Compliance
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              A small number of records are retained for legal and audit
              purposes:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Consent records:</strong> Proof that you provided
                consent for data processing (required under GDPR and other
                privacy laws)
              </li>
              <li>
                <strong>Deletion request logs:</strong> A record that your
                deletion was requested and processed, used for audit trail
                compliance
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              These records do not contain personal content — only timestamps,
              consent types, and processing status.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Timeframe
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Account deletion is processed within <strong>30 days</strong> of
              the request. Once the grace period expires, data deletion is
              irreversible and typically completes within 24 hours of the
              scheduled date.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Contact
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              If you have questions about account deletion or need to request
              manual deletion (for example, if you can no longer access the
              app), please contact us:
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
        </div>
      </div>
      <div className='mt-auto'>
        <MarketingFooter />
      </div>
    </div>
  );
}
