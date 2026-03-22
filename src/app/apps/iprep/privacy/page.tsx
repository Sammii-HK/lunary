import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | iPrep',
  description:
    'Privacy policy for the iPrep iOS app. Learn how your practice data, microphone access, and API keys are handled.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/iprep/privacy',
  },
};

export default function IPrepPrivacyPage() {
  const lastUpdated = 'March 22, 2026';

  return (
    <div className='min-h-screen bg-zinc-950 text-zinc-100 flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-white mb-4'>
            Privacy Policy: iPrep
          </h1>
          <p className='text-sm text-zinc-400'>Last Updated: {lastUpdated}</p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-zinc-300 leading-relaxed'>
              Lunar Computing, Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) develops the iPrep iOS app. This Privacy Policy
              explains how we handle your information when you use iPrep for
              interview practice.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              1. Information We Collect
            </h2>

            <h3 className='text-xl font-medium text-white mb-3'>
              1.1 Information You Provide
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Practice sessions:</strong> Your spoken answers are
                transcribed locally using Apple&apos;s Speech Recognition
                framework. Transcripts are stored on your device and synced to
                your iCloud account via CloudKit.
              </li>
              <li>
                <strong>Profile details:</strong> Current role, target role,
                target company, and interview date — entered optionally in
                Settings and stored only on your device.
              </li>
              <li>
                <strong>API keys (BYOK):</strong> If you add a DeepInfra or
                Claude API key, it is stored in your device&apos;s Keychain. It
                is never transmitted to our servers.
              </li>
            </ul>

            <h3 className='text-xl font-medium text-white mb-3 mt-6'>
              1.2 Information Collected Automatically
            </h3>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Device information:</strong> iOS version, device model,
                and identifier (used only for crash reporting).
              </li>
              <li>
                <strong>Usage data:</strong> Which question banks and features
                you use, session durations, and streak data.
              </li>
              <li>
                <strong>Crash data:</strong> Error logs to help us improve
                stability.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              2. Microphone and Speech Recognition
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              iPrep requests access to your microphone and speech recognition to
              transcribe your spoken answers. Here is what happens with that
              data:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>On-device transcription:</strong> Speech is transcribed
                using Apple&apos;s Speech Recognition framework. When using
                on-device recognition, audio is processed locally and never
                leaves your device.
              </li>
              <li>
                <strong>Server-side recognition:</strong> When on-device
                recognition is unavailable, Apple&apos;s Speech Recognition may
                send audio to Apple&apos;s servers for processing. This is
                governed by Apple&apos;s privacy policy, not ours.
              </li>
              <li>
                <strong>We do not record or store raw audio.</strong> Only the
                text transcript is saved.
              </li>
              <li>
                You can revoke microphone access at any time in your device
                settings. This will disable answer recording.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              3. AI Scoring and Feedback
            </h2>
            <p className='text-zinc-300 leading-relaxed mb-4'>
              iPrep uses AI to score your answers. Depending on your setup, one
              of the following is used:
            </p>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>On-device (heuristics):</strong> Rule-based scoring that
                runs entirely on your device. No data leaves your device.
              </li>
              <li>
                <strong>
                  On-device Foundation Models (iPhone 15 Pro+, iOS 18.1+):
                </strong>{' '}
                Apple&apos;s on-device language model. Your transcript stays on
                your device.
              </li>
              <li>
                <strong>BYOK — DeepInfra or Claude:</strong> If you add your own
                API key, your transcript and question text are sent directly
                from your device to DeepInfra or Anthropic (not to our servers).
                This is governed by their respective privacy policies.
              </li>
              <li>
                <strong>iPrep backend (premium):</strong> For premium
                subscribers on devices without on-device AI, your transcript and
                question text are sent to our backend proxy, which forwards the
                request to DeepInfra on your behalf. We do not store transcripts
                or question text beyond the request lifetime.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              4. Practice Session Data and CloudKit
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              Your practice sessions, scores, question history, and streaks are
              stored locally on your device and synced to your iCloud account
              via Apple CloudKit for backup and cross-device access. We do not
              have access to your CloudKit data — only you and Apple do.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              5. API Keys
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              DeepInfra and Claude API keys you enter in Settings are stored
              exclusively in your device&apos;s iOS Keychain. They are never
              transmitted to our servers, included in analytics, or stored in
              iCloud. If you delete the app, your Keychain entries are removed.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              6. Third-Party Services
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Apple CloudKit:</strong> Syncs your practice data across
                your Apple devices.
              </li>
              <li>
                <strong>Apple Speech Recognition:</strong> Transcribes your
                spoken answers.
              </li>
              <li>
                <strong>RevenueCat:</strong> Manages in-app subscriptions and
                purchase verification. Does not access your practice data or
                transcripts.
              </li>
              <li>
                <strong>DeepInfra / Anthropic (BYOK only):</strong> If you add
                your own API key, your transcript and question are sent to the
                respective service. Their privacy policies apply.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              7. Do We Sell Your Data?
            </h2>
            <p className='text-zinc-300 leading-relaxed'>
              No. We do not sell, share, or monetize your personal data, your
              practice transcripts, or your profile information.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-white mb-4'>
              8. Your Rights
            </h2>
            <ul className='list-disc pl-6 text-zinc-300 space-y-2'>
              <li>
                <strong>Access:</strong> Request information about what data we
                hold about you.
              </li>
              <li>
                <strong>Deletion:</strong> Delete your practice history within
                the app, or email us to delete all associated data.
              </li>
              <li>
                <strong>Microphone:</strong> Revoke microphone access at any
                time in iOS Settings.
              </li>
            </ul>
            <p className='text-zinc-300 leading-relaxed mt-4'>
              To exercise these rights, email{' '}
              <a
                href='mailto:privacy@lunary.app'
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                privacy@lunary.app
              </a>
              .
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
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                App Terms of Service
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-lunary-primary-300 text-sm'
              >
                Lunary Web Privacy
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
