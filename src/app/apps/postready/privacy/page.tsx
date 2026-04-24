import { Metadata } from 'next';
import Link from 'next/link';
import { MarketingFooter } from '@/components/MarketingFooter';
import { MarketingBreadcrumbs } from '@/components/MarketingBreadcrumbs';

export const metadata: Metadata = {
  title: 'Privacy Policy | PostReady',
  description:
    'Privacy policy for the PostReady iOS app. PostReady does not track you and does not collect personal data.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://lunary.app/apps/postready/privacy',
  },
};

export default function PostReadyPrivacyPage() {
  const lastUpdated = 'April 23, 2026';

  return (
    <div className='min-h-screen bg-surface-base text-content-primary flex flex-col pt-16'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <MarketingBreadcrumbs />
        <div className='mb-8'>
          <h1 className='text-2xl md:text-4xl font-semibold text-content-primary mb-4'>
            Privacy Policy: PostReady
          </h1>
          <p className='text-sm text-content-muted'>
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className='prose prose-invert prose-zinc max-w-none space-y-8'>
          <section>
            <p className='text-content-secondary leading-relaxed'>
              Lunar Computing, Inc. (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;) develops the PostReady iOS app. This Privacy
              Policy explains how PostReady handles your information when you
              use the app to record, edit, and export short-form video.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              1. The short version
            </h2>
            <div className='p-4 border border-stroke-subtle bg-surface-elevated/30 rounded-xl space-y-2'>
              <p className='text-content-secondary leading-relaxed'>
                <strong>PostReady does not track you.</strong>
              </p>
              <p className='text-content-secondary leading-relaxed'>
                <strong>PostReady does not collect personal data.</strong>
              </p>
              <p className='text-content-secondary leading-relaxed'>
                Recording, transcription, beauty filtering, face detection, and
                video editing all happen on your device. Your footage never
                leaves your device unless you choose to export or share it
                yourself.
              </p>
            </div>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              2. What we do not collect
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              Our <code>PrivacyInfo.xcprivacy</code> manifest declares:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>NSPrivacyTracking: false.</strong> We do not track you
                across apps or websites owned by other companies, and we do not
                share any identifier with data brokers.
              </li>
              <li>
                <strong>NSPrivacyCollectedDataTypes: empty.</strong> PostReady
                itself collects no personal data, no contact info, no contacts,
                no location, no health info, no financial info, no user content,
                no identifiers, no diagnostics, and no usage data linked to you.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              3. On-device processing
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              The following happen entirely on your device. Nothing is uploaded
              to our servers:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Whisper transcription:</strong> your spoken audio is
                transcribed using an on-device Whisper model to generate
                captions and teleprompter cues.
              </li>
              <li>
                <strong>Beauty filter:</strong> face smoothing, colour
                correction, and portrait enhancements run on-device via GPU
                shaders. No frames are uploaded.
              </li>
              <li>
                <strong>Face detection (Vision framework):</strong> Apple&apos;s
                on-device Vision framework detects faces for framing and beauty
                processing. Detection results stay on the device.
              </li>
              <li>
                <strong>Video processing and rendering:</strong> cuts, edits,
                subtitle burn-in, and export all happen locally on your device
                using AVFoundation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              4. Required reason APIs
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              PostReady uses a small set of Apple &quot;required reason&quot;
              APIs. All are declared in <code>PrivacyInfo.xcprivacy</code> and
              used only for legitimate app functionality:
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>File timestamp:</strong> used to manage the local cache
                of recordings, transcripts, and intermediate edit assets.
              </li>
              <li>
                <strong>Disk space:</strong> used to check free space before
                exporting a rendered video, so exports do not fail mid-write.
              </li>
              <li>
                <strong>System boot time:</strong> used for launch-time
                diagnostics and to measure session durations locally.
              </li>
              <li>
                <strong>UserDefaults:</strong> used to persist your in-app
                settings (for example, beauty intensity, subtitle style,
                preferred aspect ratio).
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              None of these APIs are used for fingerprinting or tracking.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              5. Optional API keys (BYOK)
            </h2>
            <p className='text-content-secondary leading-relaxed mb-4'>
              PostReady optionally lets you connect your own third-party
              accounts. This is entirely optional; the app works without them.
            </p>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>ElevenLabs API key (optional):</strong> if you provide
                one, it is stored in your device&apos;s iOS Keychain. PostReady
                uses it only to call ElevenLabs on your behalf, from your
                device, for voice features you request. The key is never
                transmitted to our servers.
              </li>
              <li>
                <strong>Pexels API key (optional):</strong> if you provide one,
                it is stored in your device&apos;s iOS Keychain. PostReady uses
                it only to call Pexels on your behalf, from your device, for
                b-roll search. The key is never transmitted to our servers.
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              When you use these keys, your requests go directly from your
              device to ElevenLabs or Pexels and are governed by their
              respective privacy policies, not ours. Deleting the app removes
              the Keychain entries.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              6. Sign in with Apple
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              PostReady supports Sign in with Apple. Sign-in is optional. If you
              choose to sign in and use Apple&apos;s private email relay, we
              accept the relayed address and never attempt to resolve your real
              email. You can revoke Sign in with Apple at any time from iOS
              Settings.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              7. Subscriptions and RevenueCat
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              PostReady subscriptions are sold and billed by Apple via in-app
              purchase. Subscription status is managed on our behalf by
              RevenueCat, which receives an anonymous app user identifier and
              subscription metadata (for example, product identifier, renewal
              status) so we can unlock premium features on your device.
              RevenueCat&apos;s handling of this data is subject to its own
              privacy policy at{' '}
              <a
                href='https://www.revenuecat.com/privacy'
                target='_blank'
                rel='noopener noreferrer'
                className='text-lunary-primary-400 hover:text-content-brand'
              >
                revenuecat.com/privacy
              </a>
              . We do not receive your Apple ID, payment details, or billing
              address.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              8. Camera, microphone, and photo library
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              PostReady requests access to your camera, microphone, and photo
              library so you can record and edit videos. These permissions are
              used only in response to your actions in the app. You can revoke
              any of them at any time in iOS Settings. Revoking them will
              disable the related features.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              9. Do we sell your data?
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              No. We do not sell, share, or monetise your personal data. We do
              not run advertising networks inside PostReady and we do not
              provide data to advertising networks.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              10. Your rights
            </h2>
            <ul className='list-disc pl-6 text-content-secondary space-y-2'>
              <li>
                <strong>Access and deletion:</strong> because we do not collect
                personal data, there is nothing held on our servers to access or
                delete. Your recordings, transcripts, and settings live on your
                device. Deleting the app removes them.
              </li>
              <li>
                <strong>Permissions:</strong> revoke camera, microphone, photo
                library, or Sign in with Apple at any time from iOS Settings.
              </li>
              <li>
                <strong>Keychain:</strong> you can clear your stored third-party
                API keys from within PostReady or by deleting the app.
              </li>
            </ul>
            <p className='text-content-secondary leading-relaxed mt-4'>
              For any other privacy questions, email{' '}
              <a
                href='mailto:hello@lunary.app'
                className='text-lunary-primary-400 hover:text-content-brand'
              >
                hello@lunary.app
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              11. Children
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              PostReady is not directed at children under 13. We do not
              knowingly collect personal data from children. If you believe a
              child has provided data to us, please contact us so we can
              investigate.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              12. Changes to this policy
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              We may update this Privacy Policy from time to time. When we do,
              we will update the &quot;Last Updated&quot; date at the top of
              this page. Continued use of PostReady after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              13. Governing law
            </h2>
            <p className='text-content-secondary leading-relaxed'>
              This Privacy Policy is governed by the laws of England and Wales.
              Any disputes arising out of or relating to this policy are subject
              to the exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className='text-2xl font-semibold text-content-primary mb-4'>
              14. Contact us
            </h2>
            <div className='p-4 border border-stroke-subtle bg-surface-elevated/30 rounded-xl'>
              <p className='text-content-secondary'>
                <strong>Lunar Computing, Inc.</strong>
                <br />
                131 Continental Dr, Suite 305
                <br />
                Newark, DE 19713, USA
                <br />
                <br />
                Email:{' '}
                <a
                  href='mailto:hello@lunary.app'
                  className='text-lunary-primary-400 hover:text-content-brand'
                >
                  hello@lunary.app
                </a>
              </p>
            </div>
          </section>

          <section className='pt-8 border-t border-stroke-subtle'>
            <h2 className='text-lg font-medium text-content-primary mb-4'>
              Related Policies
            </h2>
            <div className='flex flex-wrap gap-4'>
              <Link
                href='/apps/postready/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                PostReady Terms of Service
              </Link>
              <Link
                href='/apps/terms'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
              >
                Lunary iOS Apps Terms
              </Link>
              <Link
                href='/privacy'
                className='text-lunary-primary-400 hover:text-content-brand text-sm'
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
